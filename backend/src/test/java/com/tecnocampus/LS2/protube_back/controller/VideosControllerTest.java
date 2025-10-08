package com.tecnocampus.LS2.protube_back.controller;

import com.tecnocampus.LS2.protube_back.services.VideoService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;

import java.io.File;
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
    VideosController videosController;

    @Autowired
    @Mock
    VideoService videoService;

    @Mock
    Environment env;

    @Test
    void shouldReturnJSONOfVideos() throws IOException {
        // Crear un directorio temporal para las pruebas
        Path tempDir = Files.createTempDirectory("video-test");

        // Crear archivos de prueba
        Files.createFile(tempDir.resolve("video1.mp4"));
        Files.createFile(tempDir.resolve("video1.webp"));
        Files.createFile(tempDir.resolve("video1.json"));
        Files.createFile(tempDir.resolve("video2.mp4"));
        Files.createFile(tempDir.resolve("video2.webp"));
        Files.createFile(tempDir.resolve("video2.json"));

        // Mockear el Environment para devolver el directorio temporal
        when(env.getProperty("pro_tube.store.dir", "")).thenReturn(tempDir.toString());

        // Llamar al método getVideos
        ResponseEntity<List<Map<String, String>>> response = videosController.getVideos();

        // Verificar el código de estado
        assertEquals(200, response.getStatusCodeValue());

        // Verificar que la respuesta no es nula y contiene elementos
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isEmpty());
        assertEquals(2, response.getBody().size());

        // Verificar la estructura del primer video
        Map<String, String> firstVideo = response.getBody().get(0);
        assertTrue(firstVideo.containsKey("id"));
        assertTrue(firstVideo.containsKey("video"));
        assertTrue(firstVideo.containsKey("thumbnail"));
        assertTrue(firstVideo.containsKey("metadata"));

        // Verificar que los nombres de archivo son correctos
        assertTrue(firstVideo.get("video").endsWith(".mp4"));
        assertTrue(firstVideo.get("thumbnail").endsWith(".webp"));
        assertTrue(firstVideo.get("metadata").endsWith(".json"));

        // Limpiar los archivos temporales
        Files.walk(tempDir)
                .map(Path::toFile)
                .forEach(File::delete);
        Files.delete(tempDir);
    }
}
