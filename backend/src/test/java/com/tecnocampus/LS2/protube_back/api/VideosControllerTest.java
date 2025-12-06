package com.tecnocampus.LS2.protube_back.api;

import com.tecnocampus.LS2.protube_back.Persistance.UserRepository;
import com.tecnocampus.LS2.protube_back.application.VideoService;
import com.tecnocampus.LS2.protube_back.domain.User;
import com.tecnocampus.LS2.protube_back.domain.Video;
import com.tecnocampus.LS2.protube_back.domain.VideoReaction;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.Authentication;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VideosControllerTest {

    @InjectMocks
    private VideosController videosController;

    @Mock
    private VideoService videoService;

    @Mock
    private org.springframework.core.env.Environment env;

    @Mock
    private UserRepository userRepository;

    @Mock
    private Authentication authentication;

    private Video testVideo;
    private User testUser;

    @BeforeEach
    void setUp() {
        testVideo = new Video();
        testVideo.setId(1L);
        testVideo.setTitle("Test Video");
        testVideo.setViews(100L);
        testVideo.setLikes(10L);
        testVideo.setDislikes(2L);

        testUser = new User();
        testUser.setId("user-1");
        testUser.setEmail("test@example.com");
        testUser.setUsername("testuser");
    }

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

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().size());
        assertEquals("Video 1", response.getBody().get(0).getTitle());
        assertEquals("Video 2", response.getBody().get(1).getTitle());
    }

    // ==================== VIEWS ENDPOINT TESTS ====================

    @Test
    void incrementViews_shouldReturnUpdatedViewCount() {
        testVideo.setViews(101L);
        when(videoService.incrementViews(1L)).thenReturn(Optional.of(testVideo));

        ResponseEntity<?> response = videosController.incrementViews(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertNotNull(body);
        assertEquals(101L, body.get("views"));
        assertEquals("View count incremented", body.get("message"));
    }

    @Test
    void incrementViews_shouldReturn404WhenVideoNotFound() {
        when(videoService.incrementViews(999L)).thenReturn(Optional.empty());

        ResponseEntity<?> response = videosController.incrementViews(999L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertNotNull(body);
        assertEquals("Video not found", body.get("error"));
    }

    // ==================== GET REACTION ENDPOINT TESTS ====================

    @Test
    void getReaction_shouldReturnReactionWithAuthenticatedUser() {
        VideoService.ReactionResult result = new VideoService.ReactionResult(10L, 2L, "like");

        when(authentication.getName()).thenReturn("test@example.com");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(videoService.getUserReaction(1L, testUser)).thenReturn(result);

        ResponseEntity<?> response = videosController.getReaction(1L, authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertNotNull(body);
        assertEquals(10L, body.get("likes"));
        assertEquals(2L, body.get("dislikes"));
        assertEquals("like", body.get("userReaction"));
    }

    @Test
    void getReaction_shouldReturnReactionWithoutUser() {
        VideoService.ReactionResult result = new VideoService.ReactionResult(10L, 2L, null);

        when(videoService.getUserReaction(1L, null)).thenReturn(result);

        ResponseEntity<?> response = videosController.getReaction(1L, null);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertNotNull(body);
        assertEquals(10L, body.get("likes"));
        assertEquals(2L, body.get("dislikes"));
        assertEquals("", body.get("userReaction"));
    }

    @Test
    void getReaction_shouldReturn404WhenVideoNotFound() {
        when(videoService.getUserReaction(999L, null)).thenReturn(null);

        ResponseEntity<?> response = videosController.getReaction(999L, null);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertNotNull(body);
        assertEquals("Video not found", body.get("error"));
    }

    // ==================== LIKE ENDPOINT TESTS ====================

    @Test
    void likeVideo_shouldReturn401WhenNotAuthenticated() {
        ResponseEntity<?> response = videosController.likeVideo(1L, null);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertNotNull(body);
        assertEquals("Authentication required", body.get("error"));
    }

    @Test
    void likeVideo_shouldReturn401WhenUserNotFound() {
        when(authentication.getName()).thenReturn("unknown@example.com");
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        ResponseEntity<?> response = videosController.likeVideo(1L, authentication);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertNotNull(body);
        assertEquals("User not found", body.get("error"));
    }

    @Test
    void likeVideo_shouldReturnUpdatedReaction() {
        VideoService.ReactionResult result = new VideoService.ReactionResult(11L, 2L, "like");

        when(authentication.getName()).thenReturn("test@example.com");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(videoService.handleReaction(eq(1L), eq(testUser), eq(VideoReaction.ReactionType.LIKE))).thenReturn(result);

        ResponseEntity<?> response = videosController.likeVideo(1L, authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertNotNull(body);
        assertEquals(11L, body.get("likes"));
        assertEquals(2L, body.get("dislikes"));
        assertEquals("like", body.get("userReaction"));
        assertEquals("Reaction updated", body.get("message"));
    }

    @Test
    void likeVideo_shouldReturn404WhenVideoNotFound() {
        when(authentication.getName()).thenReturn("test@example.com");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(videoService.handleReaction(eq(999L), eq(testUser), eq(VideoReaction.ReactionType.LIKE))).thenReturn(null);

        ResponseEntity<?> response = videosController.likeVideo(999L, authentication);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertNotNull(body);
        assertEquals("Video not found", body.get("error"));
    }

    @Test
    void likeVideo_shouldRemoveLikeWhenAlreadyLiked() {
        VideoService.ReactionResult result = new VideoService.ReactionResult(9L, 2L, null);

        when(authentication.getName()).thenReturn("test@example.com");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(videoService.handleReaction(eq(1L), eq(testUser), eq(VideoReaction.ReactionType.LIKE))).thenReturn(result);

        ResponseEntity<?> response = videosController.likeVideo(1L, authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertNotNull(body);
        assertEquals(9L, body.get("likes"));
        assertEquals(2L, body.get("dislikes"));
        assertEquals("", body.get("userReaction"));
    }

    // ==================== DISLIKE ENDPOINT TESTS ====================

    @Test
    void dislikeVideo_shouldReturn401WhenNotAuthenticated() {
        ResponseEntity<?> response = videosController.dislikeVideo(1L, null);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertNotNull(body);
        assertEquals("Authentication required", body.get("error"));
    }

    @Test
    void dislikeVideo_shouldReturn401WhenUserNotFound() {
        when(authentication.getName()).thenReturn("unknown@example.com");
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        ResponseEntity<?> response = videosController.dislikeVideo(1L, authentication);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertNotNull(body);
        assertEquals("User not found", body.get("error"));
    }

    @Test
    void dislikeVideo_shouldReturnUpdatedReaction() {
        VideoService.ReactionResult result = new VideoService.ReactionResult(10L, 3L, "dislike");

        when(authentication.getName()).thenReturn("test@example.com");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(videoService.handleReaction(eq(1L), eq(testUser), eq(VideoReaction.ReactionType.DISLIKE))).thenReturn(result);

        ResponseEntity<?> response = videosController.dislikeVideo(1L, authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertNotNull(body);
        assertEquals(10L, body.get("likes"));
        assertEquals(3L, body.get("dislikes"));
        assertEquals("dislike", body.get("userReaction"));
        assertEquals("Reaction updated", body.get("message"));
    }

    @Test
    void dislikeVideo_shouldReturn404WhenVideoNotFound() {
        when(authentication.getName()).thenReturn("test@example.com");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(videoService.handleReaction(eq(999L), eq(testUser), eq(VideoReaction.ReactionType.DISLIKE))).thenReturn(null);

        ResponseEntity<?> response = videosController.dislikeVideo(999L, authentication);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertNotNull(body);
        assertEquals("Video not found", body.get("error"));
    }

    @Test
    void dislikeVideo_shouldRemoveDislikeWhenAlreadyDisliked() {
        VideoService.ReactionResult result = new VideoService.ReactionResult(10L, 1L, null);

        when(authentication.getName()).thenReturn("test@example.com");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(videoService.handleReaction(eq(1L), eq(testUser), eq(VideoReaction.ReactionType.DISLIKE))).thenReturn(result);

        ResponseEntity<?> response = videosController.dislikeVideo(1L, authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertNotNull(body);
        assertEquals(10L, body.get("likes"));
        assertEquals(1L, body.get("dislikes"));
        assertEquals("", body.get("userReaction"));
    }

    @Test
    void dislikeVideo_shouldChangeFromLikeToDislike() {
        VideoService.ReactionResult result = new VideoService.ReactionResult(9L, 3L, "dislike");

        when(authentication.getName()).thenReturn("test@example.com");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(videoService.handleReaction(eq(1L), eq(testUser), eq(VideoReaction.ReactionType.DISLIKE))).thenReturn(result);

        ResponseEntity<?> response = videosController.dislikeVideo(1L, authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertNotNull(body);
        assertEquals(9L, body.get("likes"));
        assertEquals(3L, body.get("dislikes"));
        assertEquals("dislike", body.get("userReaction"));
    }

    // ==================== UPLOAD VIDEO TEST ====================

    @Test
    void shouldUploadVideoAndSetThumbnail() throws IOException {
        MockMultipartFile videoFile = new MockMultipartFile("file", "video.mp4", "video/mp4", "video content".getBytes());
        MockMultipartFile thumbnailFile = new MockMultipartFile("thumbnail", "thumb.png", "image/png", "thumbnail content".getBytes());

        when(env.getProperty("pro_tube.store.dir", "store")).thenReturn("store");

        Video savedVideo = new Video();
        savedVideo.setId(1L);
        savedVideo.setTitle("Test Video");
        savedVideo.setDescription("Test Description");
        savedVideo.setFilename("1.mp4");
        savedVideo.setThumbnail("thumb.png");

        when(videoService.saveVideo(any(Video.class))).thenReturn(savedVideo);

        ResponseEntity<?> response = videosController.uploadVideo(
            videoFile,
            thumbnailFile,
            "Test Video",
            "Test Description",
            null
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());

        @SuppressWarnings("unchecked")
        java.util.Map<String, Object> body = (java.util.Map<String, Object>) response.getBody();
        Video responseVideo = (Video) body.get("video");

        assertEquals("Test Video", responseVideo.getTitle());
        assertEquals("1.mp4", responseVideo.getFilename());
        assertEquals("1.png", responseVideo.getThumbnail());

        verify(videoService, times(1)).saveVideo(argThat(video ->
            video.getTitle().equals("Test Video") &&
            video.getDescription() != null && video.getDescription().equals("Test Description") &&
            video.getFilename() != null && video.getFilename().endsWith(".mp4") &&
            video.getThumbnail() != null && video.getThumbnail().equals("1.png")
        ));
    }
}
