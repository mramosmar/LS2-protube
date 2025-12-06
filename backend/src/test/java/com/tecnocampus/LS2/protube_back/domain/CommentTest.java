package com.tecnocampus.LS2.protube_back.domain;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CommentTest {

    @Test
    void shouldCreateEmptyComment() {
        Comment comment = new Comment();

        assertNull(comment.getId());
        assertNull(comment.getContent());
        assertNull(comment.getUser());
        assertNull(comment.getVideo());
    }

    @Test
    void shouldCreateCommentWithParameters() {
        User user = new User();
        user.setEmail("test@example.com");
        user.setUsername("testuser");

        Video video = new Video();
        video.setTitle("Test Video");

        Comment comment = new Comment("Test content", user, video);

        assertEquals("Test content", comment.getContent());
        assertEquals(user, comment.getUser());
        assertEquals(video, comment.getVideo());
    }

    @Test
    void shouldSetAndGetId() {
        Comment comment = new Comment();
        comment.setId(1L);

        assertEquals(1L, comment.getId());
    }

    @Test
    void shouldSetAndGetContent() {
        Comment comment = new Comment();
        comment.setContent("This is a test comment");

        assertEquals("This is a test comment", comment.getContent());
    }

    @Test
    void shouldSetAndGetUser() {
        Comment comment = new Comment();
        User user = new User();
        user.setEmail("user@test.com");
        user.setUsername("username");

        comment.setUser(user);

        assertEquals(user, comment.getUser());
        assertEquals("user@test.com", comment.getUser().getEmail());
    }

    @Test
    void shouldSetAndGetVideo() {
        Comment comment = new Comment();
        Video video = new Video();
        video.setTitle("My Video");

        comment.setVideo(video);

        assertEquals(video, comment.getVideo());
        assertEquals("My Video", comment.getVideo().getTitle());
    }

    @Test
    void shouldUpdateContent() {
        Comment comment = new Comment();
        comment.setContent("Original content");

        assertEquals("Original content", comment.getContent());

        comment.setContent("Updated content");

        assertEquals("Updated content", comment.getContent());
    }

    @Test
    void shouldUpdateUser() {
        Comment comment = new Comment();

        User user1 = new User();
        user1.setEmail("user1@test.com");
        comment.setUser(user1);

        assertEquals("user1@test.com", comment.getUser().getEmail());

        User user2 = new User();
        user2.setEmail("user2@test.com");
        comment.setUser(user2);

        assertEquals("user2@test.com", comment.getUser().getEmail());
    }

    @Test
    void shouldUpdateVideo() {
        Comment comment = new Comment();

        Video video1 = new Video();
        video1.setTitle("Video 1");
        comment.setVideo(video1);

        assertEquals("Video 1", comment.getVideo().getTitle());

        Video video2 = new Video();
        video2.setTitle("Video 2");
        comment.setVideo(video2);

        assertEquals("Video 2", comment.getVideo().getTitle());
    }
}

