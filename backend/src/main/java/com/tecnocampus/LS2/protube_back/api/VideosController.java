package com.tecnocampus.LS2.protube_back.api;

import com.tecnocampus.LS2.protube_back.application.VideoService;
import com.tecnocampus.LS2.protube_back.Persistance.UserRepository;
import com.tecnocampus.LS2.protube_back.domain.User;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/videos")
public class VideosController {

    @Autowired
    VideoService videoService;

    @Autowired
    private Environment env;

    @Autowired
    private UserRepository userRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping("")
    public ResponseEntity<List<Map<String, Object>>> getVideos() {
        String videoDir = env.getProperty("pro_tube.store.dir", "store");
        File folder = new File(videoDir);
        if (!folder.exists() || !folder.isDirectory()) {
            return ResponseEntity.badRequest().body(List.of());
        }

        File[] files = folder.listFiles((dir, name) -> name.endsWith(".json"));
        if (files == null) {
            return ResponseEntity.ok().body(List.of());
        }

        List<Map<String, Object>> videos = Arrays.stream(files)
                .map(this::readVideoMetadata)
                .filter(video -> video != null)
                .collect(Collectors.toList());

        return ResponseEntity.ok().body(videos);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> readVideoMetadata(File jsonFile) {
        try {
            return objectMapper.readValue(jsonFile, Map.class);
        } catch (IOException e) {
            System.err.println("Error reading video metadata from " + jsonFile.getName() + ": " + e.getMessage());
            return null;
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
            metadata.put("thumbnailExt", thumbnailExt); // Store thumbnail extension

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