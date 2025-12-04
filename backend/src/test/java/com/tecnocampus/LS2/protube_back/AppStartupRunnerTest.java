package com.tecnocampus.LS2.protube_back;

import com.tecnocampus.LS2.protube_back.Persistance.UserRepository;
import com.tecnocampus.LS2.protube_back.Persistance.VideoRepository;
import com.tecnocampus.LS2.protube_back.application.VideoService;
import com.tecnocampus.LS2.protube_back.domain.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.ApplicationArguments;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppStartupRunnerTest {

    @Mock
    private Environment env;

    @Mock
    private UserRepository userRepository;

    @Mock
    private VideoRepository videoRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private VideoService videoService;

    @Mock
    private ApplicationArguments args;

    @TempDir
    Path tempDir;

    private AppStartupRunner appStartupRunner;

    @BeforeEach
    void setUp() {
        when(env.getProperty("pro_tube.store.dir")).thenReturn(tempDir.toString());
        when(env.getProperty("pro_tube.load_initial_data", Boolean.class)).thenReturn(true);
        
        appStartupRunner = new AppStartupRunner(env, userRepository, videoRepository, passwordEncoder);
        appStartupRunner.videoService = videoService;
    }

    @Test
    void shouldImportVideosSuccessfully() throws Exception {
        // Create dummy video file and metadata
        createDummyFile("video1.mp4");
        createDummyFile("video1.json", """
            {
                "title": "Test Video",
                "user": "testuser",
                "duration": 120,
                "width": 1920,
                "height": 1080,
                "meta": {
                    "description": "Test Description",
                    "views": 100,
                    "likes": 10,
                    "categories": ["Test"],
                    "tags": ["tag1"],
                    "comments": [
                        {"author": "commenter", "text": "Nice video"}
                    ]
                }
            }
            """);

        // Mock user finding/creation
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");

        // Run the runner
        appStartupRunner.run(args);

        // Verify importVideo was called
        verify(videoService, times(1)).importVideo(
            eq("Test Video"),
            eq("Test Description"),
            eq(120L),
            eq(1920),
            eq(1080),
            eq(100L),
            eq(10L),
            any(User.class),
            any(),
            any(),
            any(),
            any(File.class),
            any(Path.class),
            any()
        );
    }

    @Test
    void shouldSkipImportIfNoJsonFiles() throws Exception {
        // No files created in tempDir

        appStartupRunner.run(args);

        verify(videoService, never()).importVideo(any(), any(), anyLong(), anyInt(), anyInt(), anyLong(), anyLong(), any(), any(), any(), any(), any(), any(), any());
    }

    private void createDummyFile(String filename) throws IOException {
        Files.createFile(tempDir.resolve(filename));
    }

    private void createDummyFile(String filename, String content) throws IOException {
        Files.writeString(tempDir.resolve(filename), content);
    }
}
