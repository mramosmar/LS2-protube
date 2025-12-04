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
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
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

    @Test
    void shouldSaveVideo() {
        Video video = new Video();
        video.setTitle("New Video");

        when(videoRepository.save(any(Video.class))).thenAnswer(invocation -> {
            Video v = invocation.getArgument(0);
            v.setId(1L); // Simulate DB generating ID
            return v;
        });

        Video savedVideo = videoService.saveVideo(video);

        assertNotNull(savedVideo.getId());
        assertEquals("New Video", savedVideo.getTitle());
        // Verify default filename generation if not present
        assertEquals("1.mp4", savedVideo.getFilename());
    }

    @Test
    void shouldImportVideo() {
        String filename = "test_video.mp4";
        String thumbnail = "test_thumb.webp";
        
        // Mock repository to return empty optional (video doesn't exist yet)
        when(videoRepository.findByFilename(filename)).thenReturn(java.util.Optional.empty());
        
        when(videoRepository.save(any(Video.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Create dummy file for jsonFile argument
        java.io.File dummyJsonFile = new java.io.File(filename.replace(".mp4", ".json"));

        videoService.importVideo(
            "test_video", // title
            "description", // description
            100L, // duration
            1920, // width
            1080, // height
            0L, // views
            0L, // likes
            null, // user
            new java.util.HashSet<>(), // categories
            new java.util.HashSet<>(), // tags
            new java.util.ArrayList<>(), // comments
            dummyJsonFile, // jsonFile
            null, // rootPath
            thumbnail
        );

        verify(videoRepository, times(1)).save(argThat(video -> 
            video.getFilename().equals(filename) &&
            video.getThumbnail().equals(thumbnail) &&
            video.getTitle().equals("test_video") // Title derived from filename
        ));
    }
}