package com.tecnocampus.LS2.protube_back.application;

import com.tecnocampus.LS2.protube_back.Persistance.VideoRepository;
import com.tecnocampus.LS2.protube_back.Persistance.CommentRepository;
import com.tecnocampus.LS2.protube_back.domain.Comment;
import com.tecnocampus.LS2.protube_back.domain.Video;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class VideoService {

    private final VideoRepository videoRepository;
    private final CommentRepository commentRepository;

    @Autowired
    public VideoService(VideoRepository videoRepository, CommentRepository commentRepository) {
        this.videoRepository = videoRepository;
        this.commentRepository = commentRepository;
    }

    public List<Video> getAllVideos() {
        return videoRepository.findAll();
    }

    public Optional<Video> getVideoById(Long id) {
        return videoRepository.findById(id);
    }

    @Transactional

    public Video saveVideo(Video video) {
        Video savedVideo = videoRepository.save(video);
        if (savedVideo.getFilename() == null) {
            savedVideo.setFilename(savedVideo.getId() + ".mp4");
            savedVideo = videoRepository.save(savedVideo);
        }
        return savedVideo;
    }

    @Transactional
    public void addComment(Long videoId, Comment comment) {
        Optional<Video> videoOpt = videoRepository.findById(videoId);
        if (videoOpt.isPresent()) {
            Video video = videoOpt.get();
            video.addComment(comment);
            commentRepository.save(comment);
            videoRepository.save(video);
        } else {
            throw new RuntimeException("Video not found with id: " + videoId);
        }
    }
    @Transactional
    public void importVideo(String title, String description, long duration, int width, int height, long views, long likes, com.tecnocampus.LS2.protube_back.domain.User user, java.util.Set<String> categories, java.util.Set<String> tags, java.util.List<Comment> comments, java.io.File jsonFile, java.nio.file.Path rootPath, String thumbnailFilename) {
        String originalFilename = jsonFile.getName().replace(".json", ".mp4");
        
        // Check if video already exists by filename
        if (videoRepository.findByFilename(originalFilename).isPresent()) {
            // Video already imported, skip
            return;
        }

        // Create Video Entity
        Video video = new Video();
        video.setTitle(title);
        video.setDescription(description);
        video.setDuration(duration);
        video.setWidth(width);
        video.setHeight(height);
        video.setViews(views);
        video.setLikes(likes);
        video.setUser(user);
        video.setCategories(categories);
        video.setTags(tags);
        video.setFilename(originalFilename); // Set filename
        video.setThumbnail(thumbnailFilename); // Set thumbnail

        // Add comments
        if (comments != null) {
            for (Comment comment : comments) {
                video.addComment(comment);
            }
        }

        // Save to DB
        videoRepository.save(video);
        
        // NO renaming
        // NO deletion of JSON file
    }

    private void renameFile(java.nio.file.Path rootPath, String oldId, Long newId, String extension) {
        java.io.File oldFile = new java.io.File(rootPath.toFile(), oldId + extension);
        if (oldFile.exists()) {
            java.io.File newFile = new java.io.File(rootPath.toFile(), newId + extension);
            oldFile.renameTo(newFile);
        }
    }
}
