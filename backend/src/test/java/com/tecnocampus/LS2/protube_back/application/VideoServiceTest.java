package com.tecnocampus.LS2.protube_back.application;

import com.tecnocampus.LS2.protube_back.Persistance.CommentRepository;
import com.tecnocampus.LS2.protube_back.Persistance.VideoRepository;
import com.tecnocampus.LS2.protube_back.Persistance.VideoReactionRepository;
import com.tecnocampus.LS2.protube_back.domain.User;
import com.tecnocampus.LS2.protube_back.domain.Video;
import com.tecnocampus.LS2.protube_back.domain.VideoReaction;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VideoServiceTest {

    @Mock
    private VideoRepository videoRepository;

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private VideoReactionRepository videoReactionRepository;

    @InjectMocks
    private VideoService videoService;

    private Video testVideo;
    private User testUser;

    @BeforeEach
    void setUp() {
        testVideo = new Video();
        testVideo.setId(1L);
        testVideo.setTitle("Test Video");
        testVideo.setViews(0L);
        testVideo.setLikes(0L);
        testVideo.setDislikes(0L);

        testUser = new User();
        testUser.setId("user-1");
        testUser.setEmail("test@example.com");
        testUser.setUsername("testuser");
    }

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
            v.setId(1L);
            return v;
        });

        Video savedVideo = videoService.saveVideo(video);

        assertNotNull(savedVideo.getId());
        assertEquals("New Video", savedVideo.getTitle());
        assertEquals("1.mp4", savedVideo.getFilename());
    }

    // ==================== VIEWS TESTS ====================

    @Test
    void incrementViews_shouldIncrementViewCount() {
        testVideo.setViews(10L);
        when(videoRepository.findById(1L)).thenReturn(Optional.of(testVideo));
        when(videoRepository.save(any(Video.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Optional<Video> result = videoService.incrementViews(1L);

        assertTrue(result.isPresent());
        assertEquals(11L, result.get().getViews());
        verify(videoRepository, times(1)).save(testVideo);
    }

    @Test
    void incrementViews_shouldReturnEmptyWhenVideoNotFound() {
        when(videoRepository.findById(999L)).thenReturn(Optional.empty());

        Optional<Video> result = videoService.incrementViews(999L);

        assertTrue(result.isEmpty());
        verify(videoRepository, never()).save(any());
    }

    @Test
    void incrementViews_shouldStartFromZero() {
        testVideo.setViews(0L);
        when(videoRepository.findById(1L)).thenReturn(Optional.of(testVideo));
        when(videoRepository.save(any(Video.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Optional<Video> result = videoService.incrementViews(1L);

        assertTrue(result.isPresent());
        assertEquals(1L, result.get().getViews());
    }

    // ==================== LIKE TESTS ====================

    @Test
    void handleReaction_shouldAddLikeWhenNoExistingReaction() {
        when(videoRepository.findById(1L)).thenReturn(Optional.of(testVideo));
        when(videoReactionRepository.findByVideoAndUser(testVideo, testUser)).thenReturn(Optional.empty());
        when(videoReactionRepository.save(any(VideoReaction.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(videoReactionRepository.countByVideoAndReactionType(testVideo, VideoReaction.ReactionType.LIKE)).thenReturn(1L);
        when(videoReactionRepository.countByVideoAndReactionType(testVideo, VideoReaction.ReactionType.DISLIKE)).thenReturn(0L);
        when(videoRepository.save(any(Video.class))).thenAnswer(invocation -> invocation.getArgument(0));

        VideoService.ReactionResult result = videoService.handleReaction(1L, testUser, VideoReaction.ReactionType.LIKE);

        assertNotNull(result);
        assertEquals(1L, result.likes);
        assertEquals(0L, result.dislikes);
        assertEquals("like", result.userReaction);
        verify(videoReactionRepository, times(1)).save(any(VideoReaction.class));
    }

    @Test
    void handleReaction_shouldRemoveLikeWhenClickingSameLikeButton() {
        VideoReaction existingReaction = new VideoReaction(testVideo, testUser, VideoReaction.ReactionType.LIKE);

        when(videoRepository.findById(1L)).thenReturn(Optional.of(testVideo));
        when(videoReactionRepository.findByVideoAndUser(testVideo, testUser)).thenReturn(Optional.of(existingReaction));
        when(videoReactionRepository.countByVideoAndReactionType(testVideo, VideoReaction.ReactionType.LIKE)).thenReturn(0L);
        when(videoReactionRepository.countByVideoAndReactionType(testVideo, VideoReaction.ReactionType.DISLIKE)).thenReturn(0L);
        when(videoRepository.save(any(Video.class))).thenAnswer(invocation -> invocation.getArgument(0));

        VideoService.ReactionResult result = videoService.handleReaction(1L, testUser, VideoReaction.ReactionType.LIKE);

        assertNotNull(result);
        assertEquals(0L, result.likes);
        assertEquals(0L, result.dislikes);
        assertNull(result.userReaction);
        verify(videoReactionRepository, times(1)).delete(existingReaction);
    }

    @Test
    void handleReaction_shouldChangeLikeToDislike() {
        VideoReaction existingReaction = new VideoReaction(testVideo, testUser, VideoReaction.ReactionType.LIKE);

        when(videoRepository.findById(1L)).thenReturn(Optional.of(testVideo));
        when(videoReactionRepository.findByVideoAndUser(testVideo, testUser)).thenReturn(Optional.of(existingReaction));
        when(videoReactionRepository.save(any(VideoReaction.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(videoReactionRepository.countByVideoAndReactionType(testVideo, VideoReaction.ReactionType.LIKE)).thenReturn(0L);
        when(videoReactionRepository.countByVideoAndReactionType(testVideo, VideoReaction.ReactionType.DISLIKE)).thenReturn(1L);
        when(videoRepository.save(any(Video.class))).thenAnswer(invocation -> invocation.getArgument(0));

        VideoService.ReactionResult result = videoService.handleReaction(1L, testUser, VideoReaction.ReactionType.DISLIKE);

        assertNotNull(result);
        assertEquals(0L, result.likes);
        assertEquals(1L, result.dislikes);
        assertEquals("dislike", result.userReaction);
        verify(videoReactionRepository, times(1)).save(existingReaction);
        assertEquals(VideoReaction.ReactionType.DISLIKE, existingReaction.getReactionType());
    }

    // ==================== DISLIKE TESTS ====================

    @Test
    void handleReaction_shouldAddDislikeWhenNoExistingReaction() {
        when(videoRepository.findById(1L)).thenReturn(Optional.of(testVideo));
        when(videoReactionRepository.findByVideoAndUser(testVideo, testUser)).thenReturn(Optional.empty());
        when(videoReactionRepository.save(any(VideoReaction.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(videoReactionRepository.countByVideoAndReactionType(testVideo, VideoReaction.ReactionType.LIKE)).thenReturn(0L);
        when(videoReactionRepository.countByVideoAndReactionType(testVideo, VideoReaction.ReactionType.DISLIKE)).thenReturn(1L);
        when(videoRepository.save(any(Video.class))).thenAnswer(invocation -> invocation.getArgument(0));

        VideoService.ReactionResult result = videoService.handleReaction(1L, testUser, VideoReaction.ReactionType.DISLIKE);

        assertNotNull(result);
        assertEquals(0L, result.likes);
        assertEquals(1L, result.dislikes);
        assertEquals("dislike", result.userReaction);
        verify(videoReactionRepository, times(1)).save(any(VideoReaction.class));
    }

    @Test
    void handleReaction_shouldRemoveDislikeWhenClickingSameDislikeButton() {
        VideoReaction existingReaction = new VideoReaction(testVideo, testUser, VideoReaction.ReactionType.DISLIKE);

        when(videoRepository.findById(1L)).thenReturn(Optional.of(testVideo));
        when(videoReactionRepository.findByVideoAndUser(testVideo, testUser)).thenReturn(Optional.of(existingReaction));
        when(videoReactionRepository.countByVideoAndReactionType(testVideo, VideoReaction.ReactionType.LIKE)).thenReturn(0L);
        when(videoReactionRepository.countByVideoAndReactionType(testVideo, VideoReaction.ReactionType.DISLIKE)).thenReturn(0L);
        when(videoRepository.save(any(Video.class))).thenAnswer(invocation -> invocation.getArgument(0));

        VideoService.ReactionResult result = videoService.handleReaction(1L, testUser, VideoReaction.ReactionType.DISLIKE);

        assertNotNull(result);
        assertEquals(0L, result.likes);
        assertEquals(0L, result.dislikes);
        assertNull(result.userReaction);
        verify(videoReactionRepository, times(1)).delete(existingReaction);
    }

    @Test
    void handleReaction_shouldChangeDislikeToLike() {
        VideoReaction existingReaction = new VideoReaction(testVideo, testUser, VideoReaction.ReactionType.DISLIKE);

        when(videoRepository.findById(1L)).thenReturn(Optional.of(testVideo));
        when(videoReactionRepository.findByVideoAndUser(testVideo, testUser)).thenReturn(Optional.of(existingReaction));
        when(videoReactionRepository.save(any(VideoReaction.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(videoReactionRepository.countByVideoAndReactionType(testVideo, VideoReaction.ReactionType.LIKE)).thenReturn(1L);
        when(videoReactionRepository.countByVideoAndReactionType(testVideo, VideoReaction.ReactionType.DISLIKE)).thenReturn(0L);
        when(videoRepository.save(any(Video.class))).thenAnswer(invocation -> invocation.getArgument(0));

        VideoService.ReactionResult result = videoService.handleReaction(1L, testUser, VideoReaction.ReactionType.LIKE);

        assertNotNull(result);
        assertEquals(1L, result.likes);
        assertEquals(0L, result.dislikes);
        assertEquals("like", result.userReaction);
        verify(videoReactionRepository, times(1)).save(existingReaction);
        assertEquals(VideoReaction.ReactionType.LIKE, existingReaction.getReactionType());
    }

    @Test
    void handleReaction_shouldReturnNullWhenVideoNotFound() {
        when(videoRepository.findById(999L)).thenReturn(Optional.empty());

        VideoService.ReactionResult result = videoService.handleReaction(999L, testUser, VideoReaction.ReactionType.LIKE);

        assertNull(result);
        verify(videoReactionRepository, never()).save(any());
    }

    // ==================== GET USER REACTION TESTS ====================

    @Test
    void getUserReaction_shouldReturnLikesAndDislikesWithUserReaction() {
        testVideo.setLikes(5L);
        testVideo.setDislikes(2L);
        VideoReaction existingReaction = new VideoReaction(testVideo, testUser, VideoReaction.ReactionType.LIKE);

        when(videoRepository.findById(1L)).thenReturn(Optional.of(testVideo));
        when(videoReactionRepository.findByVideoAndUser(testVideo, testUser)).thenReturn(Optional.of(existingReaction));

        VideoService.ReactionResult result = videoService.getUserReaction(1L, testUser);

        assertNotNull(result);
        assertEquals(5L, result.likes);
        assertEquals(2L, result.dislikes);
        assertEquals("like", result.userReaction);
    }

    @Test
    void getUserReaction_shouldReturnNullUserReactionWhenNoReaction() {
        testVideo.setLikes(5L);
        testVideo.setDislikes(2L);

        when(videoRepository.findById(1L)).thenReturn(Optional.of(testVideo));
        when(videoReactionRepository.findByVideoAndUser(testVideo, testUser)).thenReturn(Optional.empty());

        VideoService.ReactionResult result = videoService.getUserReaction(1L, testUser);

        assertNotNull(result);
        assertEquals(5L, result.likes);
        assertEquals(2L, result.dislikes);
        assertNull(result.userReaction);
    }

    @Test
    void getUserReaction_shouldReturnNullUserReactionWhenUserIsNull() {
        testVideo.setLikes(5L);
        testVideo.setDislikes(2L);

        when(videoRepository.findById(1L)).thenReturn(Optional.of(testVideo));

        VideoService.ReactionResult result = videoService.getUserReaction(1L, null);

        assertNotNull(result);
        assertEquals(5L, result.likes);
        assertEquals(2L, result.dislikes);
        assertNull(result.userReaction);
    }

    @Test
    void getUserReaction_shouldReturnNullWhenVideoNotFound() {
        when(videoRepository.findById(999L)).thenReturn(Optional.empty());

        VideoService.ReactionResult result = videoService.getUserReaction(999L, testUser);

        assertNull(result);
    }

    @Test
    void getUserReaction_shouldReturnDislikeReaction() {
        testVideo.setLikes(3L);
        testVideo.setDislikes(7L);
        VideoReaction existingReaction = new VideoReaction(testVideo, testUser, VideoReaction.ReactionType.DISLIKE);

        when(videoRepository.findById(1L)).thenReturn(Optional.of(testVideo));
        when(videoReactionRepository.findByVideoAndUser(testVideo, testUser)).thenReturn(Optional.of(existingReaction));

        VideoService.ReactionResult result = videoService.getUserReaction(1L, testUser);

        assertNotNull(result);
        assertEquals(3L, result.likes);
        assertEquals(7L, result.dislikes);
        assertEquals("dislike", result.userReaction);
    }

    @Test
    void shouldImportVideo() {
        String filename = "test_video.mp4";
        String thumbnail = "test_thumb.webp";
        
        when(videoRepository.findByFilename(filename)).thenReturn(java.util.Optional.empty());
        when(videoRepository.save(any(Video.class))).thenAnswer(invocation -> invocation.getArgument(0));

        java.io.File dummyJsonFile = new java.io.File(filename.replace(".mp4", ".json"));

        videoService.importVideo(
            "test_video",
            "description",
            100L,
            1920,
            1080,
            0L,
            0L,
            null,
            new java.util.HashSet<>(),
            new java.util.HashSet<>(),
            new java.util.ArrayList<>(),
            dummyJsonFile,
            null,
            thumbnail
        );

        verify(videoRepository, times(1)).save(argThat(video -> 
            video.getFilename().equals(filename) &&
            video.getThumbnail().equals(thumbnail) &&
            video.getTitle().equals("test_video")
        ));
    }
}