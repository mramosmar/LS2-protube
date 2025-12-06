package com.tecnocampus.LS2.protube_back.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "video_reactions", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"video_id", "user_id"})
})
public class VideoReaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "video_id", nullable = false)
    private Video video;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReactionType reactionType;

    public enum ReactionType {
        LIKE, DISLIKE
    }

    public VideoReaction() {}

    public VideoReaction(Video video, User user, ReactionType reactionType) {
        this.video = video;
        this.user = user;
        this.reactionType = reactionType;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Video getVideo() { return video; }
    public void setVideo(Video video) { this.video = video; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public ReactionType getReactionType() { return reactionType; }
    public void setReactionType(ReactionType reactionType) { this.reactionType = reactionType; }
}

