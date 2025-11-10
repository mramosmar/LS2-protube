package com.tecnocampus.LS2.protube_back.api;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VideosControllerTest {

    @InjectMocks
    private VideosController videosController;

    @Mock
    private Environment env;

    @TempDir
    Path tempDir;

    @Test
    void shouldReturnJSONOfVideos() throws IOException {
        String json1 = """
            { "id":"video1", "video":"video1.mp4", "thumbnail":"video1.webp", "metadata":"video1.json" }
            """;
        String json2 = """
            { "id":"video2", "video":"video2.mp4", "thumbnail":"video2.webp", "metadata":"video2.json" }
            """;
        Files.writeString(tempDir.resolve("video1.json"), json1);
        Files.writeString(tempDir.resolve("video2.json"), json2);
        Files.writeString(tempDir.resolve("readme.txt"), "ignore me");

        when(env.getProperty("pro_tube.store.dir", "store")).thenReturn(tempDir.toString());

        ResponseEntity<List<Map<String, Object>>> response = videosController.getVideos();

        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().size());

        Map<String, Object> first = response.getBody().get(0);
        assertTrue(first.containsKey("id"));
        assertTrue(first.containsKey("video"));
        assertTrue(first.containsKey("thumbnail"));
        assertTrue(first.containsKey("metadata"));
    }
}
