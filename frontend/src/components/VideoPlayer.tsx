import { useState } from 'react';
import { Video } from '../App';
import VideoThumbnailHybrid from './VideoThumbnailHybrid';
import './VideoPlayer.css';

interface VideoPlayerProps {
    video: Video;
    onBack: () => void;
    relatedVideos: Video[];
    onVideoSelect: (video: Video) => void;
}

const VideoPlayer = ({ video, onBack, relatedVideos, onVideoSelect }: VideoPlayerProps) => {
    const [showFullDescription, setShowFullDescription] = useState(false);

    // Function to format duration
    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Function to format view count
    const formatViews = (id: number): string => {
        const views = Math.floor(Math.random() * 1000000) + id * 1000;
        if (views > 1000000) {
            return `${(views / 1000000).toFixed(1)}M visualizaciones`;
        } else if (views > 1000) {
            return `${(views / 1000).toFixed(1)}K visualizaciones`;
        }
        return `${views} visualizaciones`;
    };

    const getUploadTime = (id: number): string => {
        const days = Math.floor(Math.random() * 365) + 1;
        if (days > 30) {
            const months = Math.floor(days / 30);
            return `hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
        }
        return `hace ${days} ${days === 1 ? 'día' : 'días'}`;
    };

    const getLikes = (id: number): string => {
        const likes = Math.floor(Math.random() * 50000) + id * 100;
        if (likes > 1000) {
            return `${(likes / 1000).toFixed(1)}K`;
        }
        return likes.toString();
    };

    return (
        <div className="video-player-container">
            <div className="video-player-main">
                <button className="back-button" onClick={onBack}>
                    <svg viewBox="0 0 24 24" className="back-icon">
                        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                    </svg>
                    Volver
                </button>

                <div className="video-player">
                    <div className="video-player-wrapper">
                        <video
                            controls
                            width="100%"
                            height="auto"
                            src={`../store/${video.id}.mp4`}
                            poster={`../store/${video.id}.webp`}
                            className="video-element"
                        >
                            Tu navegador no soporta la reproducción de video.
                        </video>
                    </div>
                </div>

                <div className="video-info-section">
                    <h1 className="video-title-large">{video.title}</h1>

                    <div className="video-stats">
                        <div className="video-stats-left">
                            <span className="video-views-large">{formatViews(video.id)}</span>
                            <span className="video-separator">•</span>
                            <span className="video-date">{getUploadTime(video.id)}</span>
                        </div>

                        <div className="video-actions">
                            <button className="action-button">
                                <svg viewBox="0 0 24 24" className="action-icon">
                                    <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
                                </svg>
                                {getLikes(video.id)}
                            </button>

                            <button className="action-button">
                                <svg viewBox="0 0 24 24" className="action-icon">
                                    <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2z" />
                                </svg>
                            </button>

                            <button className="action-button">
                                <svg viewBox="0 0 24 24" className="action-icon">
                                    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.50-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
                                </svg>
                                Compartir
                            </button>

                            <button className="action-button">
                                <svg viewBox="0 0 24 24" className="action-icon">
                                    <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
                                </svg>
                                Guardar
                            </button>
                        </div>
                    </div>

                    <div className="channel-section">
                        <div className="channel-info">
                            <div className="channel-avatar">
                                {video.user.charAt(0).toUpperCase()}
                            </div>
                            <div className="channel-details">
                                <h3 className="channel-name">{video.user}</h3>
                                <p className="channel-subscribers">{Math.floor(Math.random() * 1000)}K suscriptores</p>
                            </div>
                        </div>
                        <button className="subscribe-button">Suscribirse</button>
                    </div>

                    {video.meta?.description && (
                        <div className="description-section">
                            <div className={`description-content ${showFullDescription ? 'expanded' : ''}`}>
                                <div className="description-metadata">
                                    <span>{formatViews(video.id)}</span>
                                    <span>•</span>
                                    <span>{getUploadTime(video.id)}</span>
                                </div>
                                <p className="description-text">
                                    {showFullDescription
                                        ? video.meta.description
                                        : `${video.meta.description.substring(0, 200)}...`
                                    }
                                </p>
                                {video.meta.tags && video.meta.tags.length > 0 && (
                                    <div className="tags-section">
                                        {video.meta.tags.slice(0, 5).map((tag, index) => (
                                            <span key={index} className="tag">#{tag}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button
                                className="description-toggle"
                                onClick={() => setShowFullDescription(!showFullDescription)}
                            >
                                {showFullDescription ? 'Mostrar menos' : 'Mostrar más'}
                            </button>
                        </div>
                    )}

                    {video.meta?.comments && video.meta.comments.length > 0 && (
                        <div className="comments-section">
                            <h3 className="comments-title">
                                {video.meta.comments.length} comentarios
                            </h3>
                            <div className="comments-list">
                                {video.meta.comments.slice(0, 5).map((comment, index) => (
                                    <div key={index} className="comment">
                                        <div className="comment-avatar">
                                            {comment.author.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="comment-content">
                                            <div className="comment-author">{comment.author}</div>
                                            <div className="comment-text">{comment.text}</div>
                                        </div>
                                    </div>
                                ))}
                                {video.meta.comments.length > 5 && (
                                    <button className="show-more-comments">
                                        Ver más comentarios
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="video-sidebar">
                <h3 className="sidebar-title">Videos relacionados</h3>
                <div className="related-videos">
                    {relatedVideos.map((relatedVideo) => (
                        <div
                            key={relatedVideo.id}
                            className="related-video"
                            onClick={() => onVideoSelect(relatedVideo)}
                        >
                            <div className="related-thumbnail">
                                <VideoThumbnailHybrid
                                    video={relatedVideo}
                                    size="small"
                                    showCategory={false}
                                    useRealImages={true}
                                />
                            </div>
                            <div className="related-info">
                                <h4 className="related-title">{relatedVideo.title}</h4>
                                <p className="related-user">{relatedVideo.user}</p>
                                <p className="related-views">{formatViews(relatedVideo.id)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;