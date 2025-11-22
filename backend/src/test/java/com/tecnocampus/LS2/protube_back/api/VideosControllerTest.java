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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VideosControllerTest {

    @InjectMocks
    private VideosController videosController;

    @Mock
    private VideoService videoService;

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
}
