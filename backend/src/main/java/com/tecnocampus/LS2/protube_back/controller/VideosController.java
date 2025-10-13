package com.tecnocampus.LS2.protube_back.controller;

import com.tecnocampus.LS2.protube_back.services.VideoService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/videos")
public class VideosController {

    @Autowired
    VideoService videoService;

    @Autowired
    private Environment env;

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
}