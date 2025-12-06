package com.tecnocampus.LS2.protube_back.api;

import com.tecnocampus.LS2.protube_back.application.VideoService;
import com.tecnocampus.LS2.protube_back.Persistance.UserRepository;
import com.tecnocampus.LS2.protube_back.domain.User;
import com.tecnocampus.LS2.protube_back.domain.Video;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@RestController
@RequestMapping("/api/videos")
public class VideosController {

    @Autowired
    VideoService videoService;

    @Autowired
    private Environment env;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("")
    public ResponseEntity<List<Video>> getVideos() {
        return ResponseEntity.ok().body(videoService.getAllVideos());
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadVideo(
            @RequestParam("video") MultipartFile videoFile,
            @RequestParam("thumbnail") MultipartFile thumbnailFile,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            Authentication authentication) {

        try {
            String videoDir = env.getProperty("pro_tube.store.dir", "store");
            File folder = new File(videoDir);

            if (!folder.exists()) {
                folder.mkdirs();
            }

            // Get username from authentication
            User user = null;
            if (authentication != null && authentication.getName() != null) {
                String email = authentication.getName();
                Optional<User> userOpt = userRepository.findByEmail(email);
                if (userOpt.isPresent()) {
                    user = userOpt.get();
                }
            }

            // Create Video Entity
            Video video = new Video();
            video.setTitle(title);
            video.setDescription(description);
            video.setUser(user);
            video.setCategories(new HashSet<>(Collections.singletonList("User Uploads")));

            // Save to DB to get ID
            video = videoService.saveVideo(video);
            Long videoId = video.getId();

            // Get file extensions
            String videoExt = getFileExtension(videoFile.getOriginalFilename());
            String thumbnailExt = getFileExtension(thumbnailFile.getOriginalFilename());

            // Set filename and thumbnail
            String filename = videoId + videoExt;
            String thumbnailFilename = videoId + thumbnailExt;

            video.setFilename(filename);
            video.setThumbnail(thumbnailFilename);

            // Save video file
            Path videoPath = Paths.get(videoDir, filename);
            Files.write(videoPath, videoFile.getBytes());

            // Save thumbnail file
            Path thumbnailPath = Paths.get(videoDir, thumbnailFilename);
            Files.write(thumbnailPath, thumbnailFile.getBytes());

            // Get video duration (simplified)
            int duration = (int) (videoFile.getSize() / 1000000); // Rough estimate
            video.setDuration((long) Math.max(duration, 10));
            video.setWidth(1920);
            video.setHeight(1080);

            // Update video with details
            videoService.saveVideo(video);

            // Generate JSON metadata file
            try {
                Map<String, Object> jsonMap = new HashMap<>();
                jsonMap.put("id", videoId);
                jsonMap.put("width", video.getWidth());
                jsonMap.put("height", video.getHeight());
                jsonMap.put("duration", video.getDuration());
                jsonMap.put("title", video.getTitle());
                jsonMap.put("user", user != null ? user.getUsername() : "Unknown");
                jsonMap.put("thumbnail", thumbnailFilename);

                Map<String, Object> metaMap = new HashMap<>();
                metaMap.put("description", video.getDescription());
                metaMap.put("categories", video.getCategories());
                metaMap.put("tags", video.getTags());
                metaMap.put("views", video.getViews());
                metaMap.put("likes", video.getLikes());
                metaMap.put("comments", new ArrayList<>()); // Empty comments for new video

                jsonMap.put("meta", metaMap);

                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                mapper.enable(com.fasterxml.jackson.databind.SerializationFeature.INDENT_OUTPUT);
                Path jsonPath = Paths.get(videoDir, videoId + ".json"); // Use ID for JSON filename as per convention
                mapper.writeValue(jsonPath.toFile(), jsonMap);

            } catch (Exception e) {
                e.printStackTrace(); // Log error but don't fail upload
            }

            return ResponseEntity.ok().body(Map.of(
                    "message", "Video uploaded successfully",
                    "videoId", videoId,
                    "video", video
            ));

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Failed to upload video: " + e.getMessage()
            ));
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            return ".mp4";
        }
        int lastDot = filename.lastIndexOf('.');
        if (lastDot == -1) {
            return ".mp4";
        }
        return filename.substring(lastDot);
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<?> addComment(@PathVariable Long id, @RequestBody Map<String, String> payload, Authentication authentication) {
        String content = payload.get("content");
        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Comment content cannot be empty"));
        }

        User user = null;
        if (authentication != null && authentication.getName() != null) {
            String email = authentication.getName();
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isPresent()) {
                user = userOpt.get();
            }
        }

        if (user == null) {
            return ResponseEntity.status(403).body(Map.of("error", "User must be logged in to comment"));
        }

        try {
            com.tecnocampus.LS2.protube_back.domain.Comment comment = new com.tecnocampus.LS2.protube_back.domain.Comment();
            comment.setContent(content);
            comment.setUser(user);

            videoService.addComment(id, comment);

            return ResponseEntity.ok().body(Map.of("message", "Comment added successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/view")
    public ResponseEntity<?> incrementViews(@PathVariable Long id) {
        Optional<Video> videoOpt = videoService.incrementViews(id);
        if (videoOpt.isPresent()) {
            return ResponseEntity.ok().body(Map.of(
                "message", "View count incremented",
                "views", videoOpt.get().getViews()
            ));
        }
        return ResponseEntity.status(404).body(Map.of("error", "Video not found"));
    }

    @GetMapping("/{id}/reaction")
    public ResponseEntity<?> getReaction(@PathVariable Long id, Authentication authentication) {
        User user = null;
        if (authentication != null && authentication.getName() != null) {
            String email = authentication.getName();
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isPresent()) {
                user = userOpt.get();
            }
        }

        VideoService.ReactionResult result = videoService.getUserReaction(id, user);
        if (result == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Video not found"));
        }

        return ResponseEntity.ok().body(Map.of(
            "likes", result.likes,
            "dislikes", result.dislikes,
            "userReaction", result.userReaction != null ? result.userReaction : ""
        ));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<?> likeVideo(@PathVariable Long id, Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }

        String email = authentication.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "User not found"));
        }

        VideoService.ReactionResult result = videoService.handleReaction(id, userOpt.get(),
            com.tecnocampus.LS2.protube_back.domain.VideoReaction.ReactionType.LIKE);

        if (result == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Video not found"));
        }

        return ResponseEntity.ok().body(Map.of(
            "message", "Reaction updated",
            "likes", result.likes,
            "dislikes", result.dislikes,
            "userReaction", result.userReaction != null ? result.userReaction : ""
        ));
    }

    @PostMapping("/{id}/dislike")
    public ResponseEntity<?> dislikeVideo(@PathVariable Long id, Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }

        String email = authentication.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "User not found"));
        }

        VideoService.ReactionResult result = videoService.handleReaction(id, userOpt.get(),
            com.tecnocampus.LS2.protube_back.domain.VideoReaction.ReactionType.DISLIKE);

        if (result == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Video not found"));
        }

        return ResponseEntity.ok().body(Map.of(
            "message", "Reaction updated",
            "likes", result.likes,
            "dislikes", result.dislikes,
            "userReaction", result.userReaction != null ? result.userReaction : ""
        ));
    }
}