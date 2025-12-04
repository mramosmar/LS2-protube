package com.tecnocampus.LS2.protube_back.api;

import com.tecnocampus.LS2.protube_back.application.VideoService;
import com.tecnocampus.LS2.protube_back.Persistance.UserRepository;
import com.tecnocampus.LS2.protube_back.domain.User;
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
            String username = "Anonymous";
            if (authentication != null && authentication.getName() != null) {
                String email = authentication.getName();
                Optional<User> userOpt = userRepository.findByEmail(email);
                if (userOpt.isPresent()) {
                    username = userOpt.get().getUsername();
                }
            }

            // Find next available ID
            int nextId = getNextAvailableId(folder);

            // Get file extensions
            String videoExt = getFileExtension(videoFile.getOriginalFilename());
            String thumbnailExt = getFileExtension(thumbnailFile.getOriginalFilename());

            // Save video file
            Path videoPath = Paths.get(videoDir, nextId + videoExt);
            Files.write(videoPath, videoFile.getBytes());

            // Save thumbnail file
            Path thumbnailPath = Paths.get(videoDir, nextId + thumbnailExt);
            Files.write(thumbnailPath, thumbnailFile.getBytes());

            // Get video duration (simplified - in real app would use ffmpeg or similar)
            // For now, using file size as a proxy
            int duration = (int) (videoFile.getSize() / 1000000); // Rough estimate

            // Create metadata JSON
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("id", nextId);
            metadata.put("title", title);
            metadata.put("user", username);
            metadata.put("duration", Math.max(duration, 10)); // Minimum 10 seconds
            metadata.put("width", 1920);
            metadata.put("height", 1080);

            Map<String, Object> meta = new HashMap<>();
            meta.put("description", description);
            meta.put("categories", Arrays.asList("User Uploads"));
            meta.put("tags", Arrays.asList());
            meta.put("comments", Arrays.asList());
            meta.put("views", 0);
            meta.put("likes", 0);
            metadata.put("meta", meta);

            // Save JSON metadata
            Path jsonPath = Paths.get(videoDir, nextId + ".json");
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(jsonPath.toFile(), metadata);

            return ResponseEntity.ok().body(Map.of(
                "message", "Video uploaded successfully",
                "videoId", nextId,
                "video", metadata
            ));

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to upload video: " + e.getMessage()
            ));
        }
    }

    private int getNextAvailableId(File folder) {
        File[] jsonFiles = folder.listFiles((dir, name) -> name.endsWith(".json"));
        if (jsonFiles == null || jsonFiles.length == 0) {
            return 0;
        }

        int maxId = -1;
        for (File file : jsonFiles) {
            try {
                String filename = file.getName().replace(".json", "");
                int id = Integer.parseInt(filename);
                if (id > maxId) {
                    maxId = id;
                }
            } catch (NumberFormatException e) {
                // Ignore non-numeric filenames
            }
        }
        return maxId + 1;
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
}