package com.tecnocampus.LS2.protube_back.application;

import com.tecnocampus.LS2.protube_back.Persistance.VideoRepository;
import com.tecnocampus.LS2.protube_back.domain.Video;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VideoServiceTest {

    @Mock
    private VideoRepository videoRepository;

    @InjectMocks
    private VideoService videoService;

    @Test
    void shouldReturnAllVideos() {
        Video video1 = new Video();
        video1.setTitle("video1");
        Video video2 = new Video();
        video2.setTitle("video2");

        when(videoRepository.findAll()).thenReturn(List.of(video1, video2));

        List<Video> result = videoService.getAllVideos();

        assertEquals(2, result.size());
        assertEquals("video1", result.get(0).getTitle());
        assertEquals("video2", result.get(1).getTitle());
    }
}