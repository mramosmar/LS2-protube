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

            // Save video file
            Path videoPath = Paths.get(videoDir, videoId + videoExt);
            Files.write(videoPath, videoFile.getBytes());

            // Save thumbnail file
            Path thumbnailPath = Paths.get(videoDir, videoId + thumbnailExt);
            Files.write(thumbnailPath, thumbnailFile.getBytes());

            // Get video duration (simplified)
            int duration = (int) (videoFile.getSize() / 1000000); // Rough estimate
            video.setDuration((long) Math.max(duration, 10));
            video.setWidth(1920);
            video.setHeight(1080);
            
            // Update video with details
            videoService.saveVideo(video);

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
}