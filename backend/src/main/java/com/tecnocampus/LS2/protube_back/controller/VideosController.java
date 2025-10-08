package com.tecnocampus.LS2.protube_back.controller;

import com.tecnocampus.LS2.protube_back.services.VideoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/videos")
public class VideosController {

    @Autowired
    VideoService videoService;

    @GetMapping("")
    public ResponseEntity<List<Map<String, String>>> getVideos() {
        String videoDir = System.getenv("ENV_PROTUBE_STORE_DIR");
        if (videoDir == null || videoDir.isEmpty()) {
            return ResponseEntity.badRequest().body(List.of());
        }
        File folder = new File(videoDir);
        if (!folder.exists() || !folder.isDirectory()) {
            return ResponseEntity.badRequest().body(List.of());
        }
        File[] files = folder.listFiles();
        if (files == null) {
            return ResponseEntity.badRequest().body(List.of());
        }
        // Agrupar archivos por nombre base
        List<Map<String, String>> videos = Arrays.stream(files)
                .filter(File::isFile)
                .collect(Collectors.groupingBy(file -> {
                    String name = file.getName();
                    int dotIndex = name.lastIndexOf('.');
                    return (dotIndex == -1) ? name : name.substring(0, dotIndex);
                }))
                .entrySet()
                .stream()
                .map(entry -> {
                    String baseName = entry.getKey();
                    List<File> groupedFiles = entry.getValue();

                    String mp4 = groupedFiles.stream()
                            .filter(file -> file.getName().endsWith(".mp4"))
                            .map(File::getName)
                            .findFirst()
                            .orElse("");

                    String webp = groupedFiles.stream()
                            .filter(file -> file.getName().endsWith(".webp"))
                            .map(File::getName)
                            .findFirst()
                            .orElse("");

                    String json = groupedFiles.stream()
                            .filter(file -> file.getName().endsWith(".json"))
                            .map(File::getName)
                            .findFirst()
                            .orElse("");

                    return Map.of(
                            "id", baseName,
                            "video", mp4,
                            "thumbnail", webp,
                            "metadata", json
                    );
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok().body(videos);
    }
}