package com.tecnocampus.LS2.protube_back.Persistance;

import com.tecnocampus.LS2.protube_back.domain.User;
import com.tecnocampus.LS2.protube_back.domain.Video;
import com.tecnocampus.LS2.protube_back.domain.VideoReaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VideoReactionRepository extends JpaRepository<VideoReaction, Long> {
    Optional<VideoReaction> findByVideoAndUser(Video video, User user);
    void deleteByVideoAndUser(Video video, User user);
    long countByVideoAndReactionType(Video video, VideoReaction.ReactionType reactionType);
}

