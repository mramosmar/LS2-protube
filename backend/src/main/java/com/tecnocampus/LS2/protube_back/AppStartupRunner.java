package com.tecnocampus.LS2.protube_back;

import com.tecnocampus.LS2.protube_back.application.VideoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.nio.file.Path;
import java.nio.file.Paths;

@Component
public class AppStartupRunner implements ApplicationRunner {
    private static final Logger LOG =
            LoggerFactory.getLogger(AppStartupRunner.class);

    @Autowired
    VideoService videoService;

    // Example variables from our implementation. 
    // Feel free to adapt them to your needs
    private final com.tecnocampus.LS2.protube_back.Persistance.UserRepository userRepository;
    private final com.tecnocampus.LS2.protube_back.Persistance.VideoRepository videoRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();

    private final Environment env;
    private final Path rootPath;
    private final Boolean loadInitialData;

    public AppStartupRunner(Environment env, 
                            com.tecnocampus.LS2.protube_back.Persistance.UserRepository userRepository,
                            com.tecnocampus.LS2.protube_back.Persistance.VideoRepository videoRepository,
                            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        this.env = env;
        this.userRepository = userRepository;
        this.videoRepository = videoRepository;
        this.passwordEncoder = passwordEncoder;
        
        String rootDir = env.getProperty("pro_tube.store.dir");
        if (rootDir == null) {
            rootDir = "./store"; // Fallback default
        }
        this.rootPath = Paths.get(rootDir);
        loadInitialData = env.getProperty("pro_tube.load_initial_data", Boolean.class);
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        importExistingVideos();
    }

    private void importExistingVideos() {
        try {
            java.io.File storeDir = rootPath.toFile();
            if (!storeDir.exists()) {
                LOG.info("Store directory does not exist, skipping import.");
                return;
            }

            java.io.File[] jsonFiles = storeDir.listFiles((dir, name) -> name.toLowerCase().endsWith(".json"));
            if (jsonFiles == null || jsonFiles.length == 0) {
                LOG.info("No JSON metadata files found to import.");
                return;
            }

            LOG.info("Found {} JSON files to import...", jsonFiles.length);

            for (java.io.File jsonFile : jsonFiles) {
                try {
                    importVideo(jsonFile);
                } catch (Exception e) {
                    LOG.error("Failed to import video from {}: {}", jsonFile.getName(), e.getMessage());
                }
            }
        } catch (Exception e) {
            LOG.error("Error during video import process", e);
        }
    }

    private void importVideo(java.io.File jsonFile) throws java.io.IOException {
        // 1. Parse JSON
        com.fasterxml.jackson.databind.JsonNode rootNode = objectMapper.readTree(jsonFile);
        
        String title = rootNode.path("title").asText("Untitled");
        String description = rootNode.path("meta").path("description").asText("");
        String username = rootNode.path("user").asText("Unknown");
        long duration = rootNode.path("duration").asLong(0);
        int width = rootNode.path("width").asInt(0);
        int height = rootNode.path("height").asInt(0);
        long views = rootNode.path("meta").path("views").asLong(0);
        long likes = rootNode.path("meta").path("likes").asLong(0);

        // 2. Find or Create User (Video Owner)
        com.tecnocampus.LS2.protube_back.domain.User user = findOrCreateUser(username);

        // Tags & Categories
        java.util.Set<String> categories = new java.util.HashSet<>();
        rootNode.path("meta").path("categories").forEach(node -> categories.add(node.asText()));
        if (categories.isEmpty()) categories.add("Imported");

        java.util.Set<String> tags = new java.util.HashSet<>();
        rootNode.path("meta").path("tags").forEach(node -> tags.add(node.asText()));

        // Comments
        java.util.List<com.tecnocampus.LS2.protube_back.domain.Comment> comments = new java.util.ArrayList<>();
        if (rootNode.path("meta").has("comments")) {
            rootNode.path("meta").path("comments").forEach(commentNode -> {
                String commentText = commentNode.path("text").asText();
                String commentAuthor = commentNode.path("author").asText();
                if (!commentText.isEmpty() && !commentAuthor.isEmpty()) {
                    com.tecnocampus.LS2.protube_back.domain.User authorUser = findOrCreateUser(commentAuthor);
                    com.tecnocampus.LS2.protube_back.domain.Comment comment = new com.tecnocampus.LS2.protube_back.domain.Comment();
                    comment.setContent(commentText);
                    comment.setUser(authorUser);
                    comments.add(comment);
                }
            });
        }

        // Detect thumbnail
        String baseName = jsonFile.getName().replace(".json", "");
        String thumbnailFilename = null;
        
        // Check for supported extensions
        String[] extensions = {".webp", ".png", ".jpg", ".jpeg"};
        for (String ext : extensions) {
            java.io.File thumbFile = new java.io.File(rootPath.toFile(), baseName + ext);
            if (thumbFile.exists()) {
                thumbnailFilename = baseName + ext;
                break;
            }
        }

        // Delegate to Transactional Service
        videoService.importVideo(title, description, duration, width, height, views, likes, user, categories, tags, comments, jsonFile, rootPath, thumbnailFilename);
        
        LOG.info("Imported video '{}' from {}", title, jsonFile.getName());
    }

    private com.tecnocampus.LS2.protube_back.domain.User findOrCreateUser(String username) {
        // Sanitize username for email
        String sanitizedUsername = username.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
        if (sanitizedUsername.isEmpty()) sanitizedUsername = "user" + System.currentTimeMillis();
        String email = sanitizedUsername + "@example.com";

        String finalUsername = username;
        String finalEmail = email;

        return userRepository.findByEmail(finalEmail)
                .orElseGet(() -> {
                    com.tecnocampus.LS2.protube_back.application.dto.UserRegistrationDTO dto = new com.tecnocampus.LS2.protube_back.application.dto.UserRegistrationDTO();
                    dto.setUsername(finalUsername);
                    dto.setEmail(finalEmail);
                    dto.setPassword(passwordEncoder.encode("password")); // Default password
                    com.tecnocampus.LS2.protube_back.domain.User newUser = new com.tecnocampus.LS2.protube_back.domain.User(dto);
                    newUser.setRole("USER");
                    return userRepository.save(newUser);
                });
    }
}
