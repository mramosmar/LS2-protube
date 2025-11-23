package com.tecnocampus.LS2.protube_back.api;

import com.tecnocampus.LS2.protube_back.application.VideoService;
import com.tecnocampus.LS2.protube_back.domain.Video;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.List;

import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VideosControllerTest {

    @InjectMocks
    private VideosController videosController;

    @Mock
    private VideoService videoService;

    @Mock
    private org.springframework.core.env.Environment env;

    @Mock
    private com.tecnocampus.LS2.protube_back.Persistance.UserRepository userRepository;

    @Test
    void shouldReturnListOfVideos() {
        Video video1 = new Video();
        video1.setId(1L);
        video1.setTitle("Video 1");

        Video video2 = new Video();
        video2.setId(2L);
        video2.setTitle("Video 2");

        when(videoService.getAllVideos()).thenReturn(List.of(video1, video2));

        ResponseEntity<List<Video>> response = videosController.getVideos();

        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().size());
        assertEquals("Video 1", response.getBody().get(0).getTitle());
        assertEquals("Video 2", response.getBody().get(1).getTitle());
    }
    @Test
    void shouldUploadVideoAndSetThumbnail() throws IOException {
        // Mock MultipartFile for video and thumbnail
        MockMultipartFile videoFile = new MockMultipartFile("file", "video.mp4", "video/mp4", "video content".getBytes());
        MockMultipartFile thumbnailFile = new MockMultipartFile("thumbnail", "thumb.png", "image/png", "thumbnail content".getBytes());

        // Mock Environment
        when(env.getProperty("pro_tube.store.dir", "store")).thenReturn("store");

        // Mock VideoService.saveVideo to return the saved video
        Video savedVideo = new Video();
        savedVideo.setId(1L);
        savedVideo.setTitle("Test Video");
        savedVideo.setDescription("Test Description");
        savedVideo.setFilename("1.mp4");
        savedVideo.setThumbnail("thumb.png");

        when(videoService.saveVideo(any(Video.class))).thenReturn(savedVideo);

        // Perform the upload
        ResponseEntity<?> response = videosController.uploadVideo(
            videoFile,
            thumbnailFile,
            "Test Video",
            "Test Description",
            null
        );

        // Verify response
        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        
        @SuppressWarnings("unchecked")
        java.util.Map<String, Object> body = (java.util.Map<String, Object>) response.getBody();
        Video responseVideo = (Video) body.get("video");
        
        assertEquals("Test Video", responseVideo.getTitle());
        assertEquals("1.mp4", responseVideo.getFilename());
        assertEquals("1.png", responseVideo.getThumbnail());

        // Verify that saveVideo was called with correct values
        verify(videoService, times(1)).saveVideo(argThat(video -> 
            video.getTitle().equals("Test Video") &&
            video.getDescription() != null && video.getDescription().equals("Test Description") &&
            video.getFilename() != null && video.getFilename().endsWith(".mp4") &&
            video.getThumbnail() != null && video.getThumbnail().equals("1.png")
        ));
    }
}
