import { useState, useMemo, useRef, useEffect } from 'react';
import { Video } from '../App';
import VideoThumbnailHybrid from './VideoThumbnailHybrid';
import './VideoPlayer.css';
import { calculateTitleSimilarity } from '../utils/videoRecommendations';
import { commentService } from '../../services/commentService';
import { viewService } from '../../services/viewService';

interface VideoPlayerProps {
  video: Video;
  onBack: () => void;
  relatedVideos: Video[];
  onVideoSelect: (video: Video) => void;
  selectedCategory: string;
  isAuthenticated?: boolean;
  currentUser?: string;
  onLoginClick?: () => void;
}

const getUsername = (u: string | { username: string } | null | undefined): string => {
  if (!u) return '';
  if (typeof u === 'string') return u;
  return u.username || '';
};

const VideoPlayer = ({
  video,
  relatedVideos,
  onVideoSelect,
  selectedCategory,
  isAuthenticated = false,
  currentUser,
  onLoginClick,
}: VideoPlayerProps) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showEndScreen, setShowEndScreen] = useState(false);
  const [autoplayCountdown, setAutoplayCountdown] = useState(10);
  const [autoplayCancelled, setAutoplayCancelled] = useState(false);
  const [previewTime, setPreviewTime] = useState<number | null>(null);
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [localComments, setLocalComments] = useState(video.comments || []);
  const [localViews, setLocalViews] = useState(video.views);
  const [localLikes, setLocalLikes] = useState(video.likes);
  const [localDislikes, setLocalDislikes] = useState(video.dislikes || 0);
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(null);
  const [viewCounted, setViewCounted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [volume, setVolume] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const countdownIntervalRef = useRef<any>(null);
  const controlsTimeoutRef = useRef<any>(null);

  // Cleanup countdown on unmount or video change
  useEffect(() => {
    setShowEndScreen(false);
    setAutoplayCountdown(10);
    setAutoplayCancelled(false);
    setLocalComments(video.comments || []);
    setNewComment('');
    setCommentError(null);
    setLocalViews(video.views);
    setViewCounted(false);
    setIsPlaying(true);
    setCurrentTime(0);
    setDuration(0);
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [video.id]);

  // Update time and duration
  useEffect(() => {
    const loadReaction = async () => {
      try {
        const result = await viewService.getReaction(video.id);
        setLocalLikes(result.likes);
        setLocalDislikes(result.dislikes);
        setUserReaction(result.userReaction === 'like' ? 'like' : result.userReaction === 'dislike' ? 'dislike' : null);
      } catch (error) {
        console.error('Error loading reaction:', error);
        setLocalLikes(video.likes);
        setLocalDislikes(video.dislikes || 0);
        setUserReaction(null);
      }
    };

    loadReaction();

    const videoElement = videoRef.current;
    if (!videoElement) return;

    const updateTime = () => setCurrentTime(videoElement.currentTime);
    const updateDuration = () => setDuration(videoElement.duration);
    const handlePlayState = () => setIsPlaying(!videoElement.paused);

    videoElement.addEventListener('timeupdate', updateTime);
    videoElement.addEventListener('loadedmetadata', updateDuration);
    videoElement.addEventListener('play', handlePlayState);
    videoElement.addEventListener('pause', handlePlayState);

    return () => {
      videoElement.removeEventListener('timeupdate', updateTime);
      videoElement.removeEventListener('loadedmetadata', updateDuration);
      videoElement.removeEventListener('play', handlePlayState);
      videoElement.removeEventListener('pause', handlePlayState);
    };
  }, [video.id]);

  // Auto-hide controls
  const resetControlsTimeout = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    const videoContainer = videoRef.current?.parentElement;
    if (videoContainer) {
      if (!document.fullscreenElement) {
        videoContainer.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleSpeedChange = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      setShowSpeedMenu(false);
    }
  };

  // Handle comment submission
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setCommentError('Debes iniciar sesión para comentar');
      if (onLoginClick) {
        onLoginClick();
      }
      return;
    }

    if (!newComment.trim()) {
      setCommentError('El comentario no puede estar vacío');
      return;
    }

    setIsSubmittingComment(true);
    setCommentError(null);

    try {
      await commentService.addComment(video.id, newComment);

      // Add comment locally
      const newCommentObj = {
        content: newComment,
        user: currentUser || 'Usuario',
      };

      setLocalComments([...localComments, newCommentObj]);
      setNewComment('');
    } catch (error) {
      setCommentError(error instanceof Error ? error.message : 'Error al enviar el comentario');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Handle like button click
  const handleLike = async () => {
    if (!isAuthenticated) {
      if (onLoginClick) {
        onLoginClick();
      }
      return;
    }

    try {
      const result = await viewService.likeVideo(video.id);
      setLocalLikes(result.likes);
      setLocalDislikes(result.dislikes);
      setUserReaction(result.userReaction === 'like' ? 'like' : result.userReaction === 'dislike' ? 'dislike' : null);
    } catch (error) {
      if (error instanceof Error && error.message === 'Authentication required') {
        if (onLoginClick) {
          onLoginClick();
        }
      } else {
        console.error('Error handling like:', error);
      }
    }
  };

  // Handle dislike button click
  const handleDislike = async () => {
    if (!isAuthenticated) {
      if (onLoginClick) {
        onLoginClick();
      }
      return;
    }

    try {
      const result = await viewService.dislikeVideo(video.id);
      setLocalLikes(result.likes);
      setLocalDislikes(result.dislikes);
      setUserReaction(result.userReaction === 'like' ? 'like' : result.userReaction === 'dislike' ? 'dislike' : null);
    } catch (error) {
      if (error instanceof Error && error.message === 'Authentication required') {
        if (onLoginClick) {
          onLoginClick();
        }
      } else {
        console.error('Error handling dislike:', error);
      }
    }
  };

  // Handle video ended event
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleEnded = () => {
      setShowEndScreen(true);
      setAutoplayCountdown(10);
      setAutoplayCancelled(false);

      // Start countdown for autoplay
      countdownIntervalRef.current = window.setInterval(() => {
        setAutoplayCountdown((prev) => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    const handlePlay = () => {
      setShowEndScreen(false);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };

    videoElement.addEventListener('ended', handleEnded);
    videoElement.addEventListener('play', handlePlay);

    return () => {
      videoElement.removeEventListener('ended', handleEnded);
      videoElement.removeEventListener('play', handlePlay);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [video.id]);

  // Increment view count when video starts playing
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleFirstPlay = async () => {
      if (!viewCounted) {
        setViewCounted(true);
        try {
          const result = await viewService.incrementView(video.id);
          setLocalViews(result.views);
        } catch (error) {
          console.error('Error incrementing view count:', error);
          // Still update locally even if API fails
          setLocalViews((prev) => prev + 1);
        }
      }
    };

    videoElement.addEventListener('play', handleFirstPlay);

    return () => {
      videoElement.removeEventListener('play', handleFirstPlay);
    };
  }, [video.id, viewCounted]);

  // Handle autoplay when countdown reaches 0
  useEffect(() => {
    if (autoplayCountdown === 0 && showEndScreen && !autoplayCancelled) {
      const recommendedVideos = getRecommendedVideosForEndScreen();
      const firstRecommended = recommendedVideos[0];
      if (firstRecommended) {
        onVideoSelect(firstRecommended);
      }
    }
  }, [autoplayCountdown, showEndScreen, autoplayCancelled]);

  // Filter related videos by selected category if needed
  const filteredRelatedVideos = useMemo(() => {
    if (selectedCategory === 'all') {
      return relatedVideos;
    }
    return relatedVideos.filter((v) => v.categories?.includes(selectedCategory));
  }, [relatedVideos, selectedCategory]);

  // Get all videos without category filter for "others" section
  const allRelatedVideos = useMemo(() => {
    return relatedVideos;
  }, [relatedVideos]);

  // Group related videos by relationship type
  const groupedRelatedVideos = useMemo(() => {
    const groups: {
      sameAuthor: Video[];
      sameCategory: Video[];
      similarTitle: Video[];
      others: Video[];
    } = {
      sameAuthor: [],
      sameCategory: [],
      similarTitle: [],
      others: [],
    };

    // Crear un array con los videos y su puntuación de similitud de título
    const videosWithTitleScore = filteredRelatedVideos.map((relatedVideo) => ({
      video: relatedVideo,
      titleScore: calculateTitleSimilarity(video, relatedVideo),
    }));

    // También calcular similitud para TODOS los videos (sin filtro de categoría) para "Otros similares"
    const allVideosWithTitleScore = allRelatedVideos.map((relatedVideo) => ({
      video: relatedVideo,
      titleScore: calculateTitleSimilarity(video, relatedVideo),
    }));

    videosWithTitleScore.forEach(({ video: relatedVideo, titleScore }) => {
      // Categorizar por tipo de relación (prioridad)
      const videoUser = getUsername(video.user);
      const relatedUser = getUsername(relatedVideo.user);

      if (relatedUser.toLowerCase() === videoUser.toLowerCase()) {
        groups.sameAuthor.push(relatedVideo);
      } else if (
        video.categories?.some((cat) =>
          relatedVideo.categories?.some((cat2) => cat2.toLowerCase() === cat.toLowerCase())
        )
      ) {
        groups.sameCategory.push(relatedVideo);
      } else if (titleScore > 0) {
        // Si hay palabras en común en el título, va a similarTitle
        groups.similarTitle.push(relatedVideo);
      } else {
        groups.others.push(relatedVideo);
      }
    });

    // Agregar a "similarTitle" videos de TODAS las categorías que tengan similitud de título
    // pero que no estén ya incluidos en otros grupos
    const alreadyInGroups = new Set([
      video.id,
      ...groups.sameAuthor.map((v) => v.id),
      ...groups.sameCategory.map((v) => v.id),
      ...groups.similarTitle.map((v) => v.id),
      ...groups.others.map((v) => v.id),
    ]);

    allVideosWithTitleScore.forEach(({ video: relatedVideo, titleScore }) => {
      if (titleScore > 0 && !alreadyInGroups.has(relatedVideo.id)) {
        groups.similarTitle.push(relatedVideo);
        alreadyInGroups.add(relatedVideo.id);
      }
    });

    // Obtener IDs de videos ya clasificados
    const alreadyIncludedIds = new Set([
      video.id,
      ...groups.sameAuthor.map((v) => v.id),
      ...groups.sameCategory.map((v) => v.id),
      ...groups.similarTitle.map((v) => v.id),
      ...groups.others.map((v) => v.id),
    ]);

    // Crear lista de videos sobrantes (de todas las categorías)
    const remainingVideos = allRelatedVideos.filter((v) => !alreadyIncludedIds.has(v.id));

    // Ordenar aleatoriamente los videos sobrantes usando hash
    remainingVideos.sort((a, b) => {
      const seed = video.id * 2654435761;
      const hashA = ((a.id ^ seed) * 1103515245 + 12345) % 2147483647;
      const hashB = ((b.id ^ seed) * 1103515245 + 12345) % 2147483647;
      return hashB - hashA;
    });

    // Seleccionar videos aleatorios de los sobrantes
    groups.others = remainingVideos.slice(0, 5);
    groups.similarTitle.sort((a, b) => {
      const scoreA = calculateTitleSimilarity(video, a);
      const scoreB = calculateTitleSimilarity(video, b);
      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }
      // Si tienen la misma puntuación, ordenar de manera pseudo-aleatoria determinista
      const hashA = (a.id * 7919 + video.id * 6151) % 233280;
      const hashB = (b.id * 7919 + video.id * 6151) % 233280;
      return hashB - hashA;
    });

    // Los videos en "others" ya están seleccionados (3 aleatorios), no necesitan más ordenamiento

    return groups;
  }, [video, filteredRelatedVideos, allRelatedVideos]);

  // Get recommended videos for end screen (maximum 12 videos)
  const getRecommendedVideosForEndScreen = () => {
    const recommendations: Video[] = [];

    // Add same author videos (max 3)
    recommendations.push(...groupedRelatedVideos.sameAuthor.slice(0, 3));

    // Add same category videos (max 4)
    const remainingSlots = 12 - recommendations.length;
    recommendations.push(...groupedRelatedVideos.sameCategory.slice(0, Math.min(4, remainingSlots)));

    // Add similar title videos (max 3)
    const remainingSlots2 = 12 - recommendations.length;
    recommendations.push(...groupedRelatedVideos.similarTitle.slice(0, Math.min(3, remainingSlots2)));

    // Fill remaining with other videos
    const remainingSlots3 = 12 - recommendations.length;
    recommendations.push(...groupedRelatedVideos.others.slice(0, remainingSlots3));

    return recommendations;
  };

  const handleCancelAutoplay = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    setAutoplayCancelled(true);
    setAutoplayCountdown(0);
  };

  const handleReplay = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setShowEndScreen(false);
    }
  };

  // Función para obtener el badge de relación
  const getRelationBadge = (relatedVideo: Video): { text: string; className: string } | null => {
    const videoUser = getUsername(video.user);
    const relatedUser = getUsername(relatedVideo.user);

    if (relatedUser.toLowerCase() === videoUser.toLowerCase()) {
      return { text: 'Mismo autor', className: 'badge-author' };
    }

    const commonCategories =
      video.categories?.filter((cat) =>
        relatedVideo.categories?.some((cat2) => cat2.toLowerCase() === cat.toLowerCase())
      ) || [];

    if (commonCategories.length > 0) {
      return { text: commonCategories[0], className: 'badge-category' };
    }

    return null;
  };

  // Function to format view count
  const formatViews = (views: number): string => {
    if (views > 1000000) {
      return `${(views / 1000000).toFixed(1)}M visualizaciones`;
    } else if (views > 1000) {
      return `${(views / 1000).toFixed(1)}K visualizaciones`;
    }
    return `${views} visualizaciones`;
  };

  const getUploadTime = (id: number): string => {
    // Generate deterministic value using a simple hash function
    const seed = (id * 8121 + 28411) % 233280;
    const days = (seed % 365) + 1;
    if (days > 30) {
      const months = Math.floor(days / 30);
      return `hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
    }
    return `hace ${days} ${days === 1 ? 'día' : 'días'}`;
  };

  const getLikes = (likes: number): string => {
    if (likes > 1000) {
      return `${(likes / 1000).toFixed(1)}K`;
    }
    return likes.toString();
  };

  // Handle mouse move over video for preview
  const handleMouseMove = (e: React.MouseEvent<HTMLVideoElement>) => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const rect = videoElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Only show preview when hovering near the bottom (progress bar area)
    const isNearProgressBar = y > rect.height - 80;

    if (!isNearProgressBar) {
      setPreviewTime(null);
      return;
    }

    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const time = percentage * videoElement.duration;

    if (!isNaN(time)) {
      setPreviewTime(time);
      setPreviewPosition({ x: e.clientX, y: rect.bottom });

      // Update preview video time
      if (previewVideoRef.current) {
        previewVideoRef.current.currentTime = time;
      }
    }
  };

  const handleMouseLeave = () => {
    setPreviewTime(null);
  };

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="video-player-container">
      <div className="video-player-main">
        <div className="video-player">
          <div
            className="video-player-wrapper"
            onMouseMove={resetControlsTimeout}
            onMouseLeave={() => setShowControls(false)}
          >
            <video
              ref={videoRef}
              autoPlay
              width="100%"
              height="auto"
              src={`http://localhost:8080/media/${video.filename || video.id + '.mp4'}`}
              poster={`http://localhost:8080/media/${video.filename ? video.filename.replace('.mp4', '.webp') : video.id + '.webp'}`}
              className="video-element"
              onClick={handlePlayPause}
            >
              Tu navegador no soporta la reproducción de video.
            </video>

            {/* Top controls - Mute, Fullscreen, Playback speed */}
            <div className={`video-top-controls ${showControls ? 'visible' : ''}`}>
              <button
                className="control-button"
                onClick={handleMuteToggle}
                title={isMuted ? 'Activar sonido' : 'Silenciar'}
              >
                <svg viewBox="0 0 24 24" className="control-icon">
                  {isMuted ? (
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                  ) : (
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                  )}
                </svg>
              </button>
              <button className="control-button" onClick={handleFullscreen} title="Pantalla completa">
                <svg viewBox="0 0 24 24" className="control-icon">
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                </svg>
              </button>
              <div className="speed-control">
                <button
                  className="control-button speed-button"
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  title="Velocidad de reproducción"
                >
                  <span className="speed-text">{playbackSpeed}x</span>
                </button>
                {showSpeedMenu && (
                  <div className="speed-menu">
                    {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((speed) => (
                      <button
                        key={speed}
                        className={`speed-option ${playbackSpeed === speed ? 'active' : ''}`}
                        onClick={() => handleSpeedChange(speed)}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom controls - Play/Pause and Progress bar */}
            <div className={`video-bottom-controls ${showControls ? 'visible' : ''}`}>
              <div className="controls-row">
                <button className="control-button play-pause-btn" onClick={handlePlayPause}>
                  <svg viewBox="0 0 24 24" className="control-icon">
                    {isPlaying ? <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /> : <path d="M8 5v14l11-7z" />}
                  </svg>
                </button>
                <span className="time-display">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
                <div
                  className="progress-container"
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const wrapperRect = e.currentTarget.closest('.video-player-wrapper')?.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const percentage = Math.max(0, Math.min(1, x / rect.width));
                    const time = percentage * duration;

                    if (!isNaN(time) && wrapperRect) {
                      setPreviewTime(time);
                      // Position relative to the wrapper, centered on mouse X position within wrapper
                      const xRelativeToWrapper = e.clientX - wrapperRect.left;
                      const yRelativeToWrapper = rect.top - wrapperRect.top - 130;
                      setPreviewPosition({ x: xRelativeToWrapper, y: yRelativeToWrapper });

                      if (previewVideoRef.current) {
                        previewVideoRef.current.currentTime = time;
                      }
                    }
                  }}
                  onMouseLeave={() => setPreviewTime(null)}
                >
                  <div className="progress-filled" style={{ width: `${(currentTime / duration) * 100}%` }} />
                  <input
                    type="range"
                    className="progress-bar"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleProgressChange}
                    step="0.1"
                  />
                </div>
              </div>
            </div>

            {/* Video preview tooltip */}
            {previewTime !== null && (
              <div
                className="video-preview-tooltip"
                style={{
                  left: `${previewPosition.x}px`,
                  top: `${previewPosition.y}px`,
                }}
              >
                <div className="preview-video-container">
                  <video
                    ref={previewVideoRef}
                    src={`http://localhost:8080/media/${video.filename || video.id + '.mp4'}`}
                    muted
                    className="preview-video"
                  />
                </div>
                <div className="preview-timestamp">{formatTime(previewTime)}</div>
              </div>
            )}

            {/* End Screen with Recommended Videos */}
            {showEndScreen && (
              <div className="video-end-screen">
                <div className="end-screen-header">
                  <h2 className="end-screen-title">A continuación</h2>
                  {autoplayCountdown > 0 && (
                    <div className="autoplay-info">
                      <span className="autoplay-text">Reproducción automática en {autoplayCountdown}s</span>
                      <button className="cancel-autoplay-btn" onClick={handleCancelAutoplay}>
                        Cancelar
                      </button>
                    </div>
                  )}
                  <button className="replay-btn" onClick={handleReplay}>
                    <svg viewBox="0 0 24 24" className="replay-icon">
                      <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                    </svg>
                    Reproducir de nuevo
                  </button>
                </div>

                <div className="end-screen-videos">
                  {getRecommendedVideosForEndScreen().map((recommendedVideo, index) => (
                    <div
                      key={recommendedVideo.id}
                      className={`end-screen-video ${index === 0 && autoplayCountdown > 0 ? 'next-video' : ''}`}
                      onClick={() => {
                        handleCancelAutoplay();
                        onVideoSelect(recommendedVideo);
                      }}
                    >
                      <div className="end-screen-thumbnail">
                        <VideoThumbnailHybrid video={recommendedVideo} size="medium" showCategory={false} />
                        {index === 0 && autoplayCountdown > 0 && (
                          <div className="next-video-overlay">
                            <div className="next-video-badge">Siguiente</div>
                          </div>
                        )}
                      </div>
                      <div className="end-screen-video-info">
                        <h4 className="end-screen-video-title">{recommendedVideo.title}</h4>
                        <p className="end-screen-video-user">{getUsername(recommendedVideo.user)}</p>
                        <p className="end-screen-video-views">{formatViews(recommendedVideo.views)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="video-info-section">
          <h1 className="video-title-large">{video.title}</h1>

          <div className="video-stats">
            <div className="video-stats-left">
              <span className="video-views-large">{formatViews(localViews)}</span>
              <span className="video-separator">•</span>
              <span className="video-date">{getUploadTime(video.id)}</span>
            </div>

            <div className="video-actions">
              <button className={`action-button ${userReaction === 'like' ? 'active' : ''}`} onClick={handleLike}>
                <svg viewBox="0 0 24 24" className="action-icon">
                  <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
                </svg>
                {getLikes(localLikes)}
              </button>

              <button className={`action-button ${userReaction === 'dislike' ? 'active' : ''}`} onClick={handleDislike}>
                <svg viewBox="0 0 24 24" className="action-icon">
                  <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2z" />
                </svg>
                {localDislikes > 0 ? getLikes(localDislikes) : ''}
              </button>
            </div>
          </div>

          <div className="channel-section">
            <div className="channel-info">
              <div className="channel-avatar">{getUsername(video.user).charAt(0).toUpperCase()}</div>
              <div className="channel-details">
                <h3 className="channel-name">{getUsername(video.user)}</h3>
                <p className="channel-subscribers">
                  {Math.floor(((video.id * 6151 + 21377) % 233280) % 1000)}K suscriptores
                </p>
              </div>
            </div>
          </div>

          {video.description && (
            <div className="description-section">
              <div className={`description-content ${showFullDescription ? 'expanded' : ''}`}>
                <div className="description-metadata">
                  <span>{formatViews(localViews)}</span>
                  <span>•</span>
                  <span>{getUploadTime(video.id)}</span>
                </div>
                <p className="description-text">
                  {showFullDescription ? video.description : `${video.description.substring(0, 200)}...`}
                </p>
                {video.tags && video.tags.length > 0 && (
                  <div className="tags-section">
                    {video.tags.slice(0, 5).map((tag, index) => (
                      <span key={index} className="tag">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button className="description-toggle" onClick={() => setShowFullDescription(!showFullDescription)}>
                {showFullDescription ? 'Mostrar menos' : 'Mostrar más'}
              </button>
            </div>
          )}

          {localComments && localComments.length > 0 && (
            <div className="comments-section">
              <h3 className="comments-title">{localComments.length} comentarios</h3>

              {/* Comment form for authenticated users */}
              {isAuthenticated ? (
                <form className="comment-form" onSubmit={handleSubmitComment}>
                  <div className="comment-input-wrapper">
                    <div className="comment-avatar-small">{currentUser?.charAt(0).toUpperCase()}</div>
                    <input
                      type="text"
                      className="comment-input"
                      placeholder="Añade un comentario público..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      disabled={isSubmittingComment}
                    />
                  </div>
                  {commentError && <div className="comment-error">{commentError}</div>}
                  {newComment.trim() && (
                    <div className="comment-form-actions">
                      <button
                        type="button"
                        className="comment-cancel-btn"
                        onClick={() => {
                          setNewComment('');
                          setCommentError(null);
                        }}
                        disabled={isSubmittingComment}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="comment-submit-btn"
                        disabled={isSubmittingComment || !newComment.trim()}
                      >
                        {isSubmittingComment ? 'Enviando...' : 'Comentar'}
                      </button>
                    </div>
                  )}
                </form>
              ) : (
                <div className="comment-login-prompt">
                  <p>
                    <button className="comment-login-link" onClick={onLoginClick}>
                      Inicia sesión
                    </button>{' '}
                    para dejar un comentario
                  </p>
                </div>
              )}

              <div className="comments-list">
                {localComments.map((comment, index) => (
                  <div key={index} className="comment">
                    <div className="comment-avatar">{getUsername(comment.user).charAt(0).toUpperCase()}</div>
                    <div className="comment-content">
                      <div className="comment-author">{getUsername(comment.user)}</div>
                      <div className="comment-text">{comment.content}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="video-sidebar">
        <h3 className="sidebar-title">Videos relacionados</h3>
        <div className="related-videos">
          {/* Videos del mismo autor */}
          {groupedRelatedVideos.sameAuthor.length > 0 && (
            <>
              <div className="related-section-title">Del mismo autor</div>
              {groupedRelatedVideos.sameAuthor.map((relatedVideo) => {
                const badge = getRelationBadge(relatedVideo);
                return (
                  <div key={relatedVideo.id} className="related-video" onClick={() => onVideoSelect(relatedVideo)}>
                    <div className="related-thumbnail">
                      <VideoThumbnailHybrid video={relatedVideo} size="small" showCategory={false} />
                    </div>
                    <div className="related-info">
                      <h4 className="related-title">{relatedVideo.title}</h4>
                      <p className="related-user">{getUsername(relatedVideo.user)}</p>
                      <p className="related-views">{formatViews(relatedVideo.views)}</p>
                      {badge && <span className={`relation-badge ${badge.className}`}>{badge.text}</span>}
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* Videos de la misma categoría */}
          {groupedRelatedVideos.sameCategory.length > 0 && (
            <>
              <div className="related-section-title">De categorías similares</div>
              {groupedRelatedVideos.sameCategory.map((relatedVideo) => {
                const badge = getRelationBadge(relatedVideo);
                return (
                  <div key={relatedVideo.id} className="related-video" onClick={() => onVideoSelect(relatedVideo)}>
                    <div className="related-thumbnail">
                      <VideoThumbnailHybrid video={relatedVideo} size="small" showCategory={false} />
                    </div>
                    <div className="related-info">
                      <h4 className="related-title">{relatedVideo.title}</h4>
                      <p className="related-user">{getUsername(relatedVideo.user)}</p>
                      <p className="related-views">{formatViews(relatedVideo.views)}</p>
                      {badge && <span className={`relation-badge ${badge.className}`}>{badge.text}</span>}
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* Videos con títulos similares */}
          {groupedRelatedVideos.similarTitle.length > 0 && (
            <>
              <div className="related-section-title">Otros similares</div>
              {groupedRelatedVideos.similarTitle.map((relatedVideo) => {
                const badge = getRelationBadge(relatedVideo);
                return (
                  <div key={relatedVideo.id} className="related-video" onClick={() => onVideoSelect(relatedVideo)}>
                    <div className="related-thumbnail">
                      <VideoThumbnailHybrid video={relatedVideo} size="small" showCategory={false} />
                    </div>
                    <div className="related-info">
                      <h4 className="related-title">{relatedVideo.title}</h4>
                      <p className="related-user">{getUsername(relatedVideo.user)}</p>
                      <p className="related-views">{formatViews(relatedVideo.views)}</p>
                      {badge && <span className={`relation-badge ${badge.className}`}>{badge.text}</span>}
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* Otros videos */}
          {groupedRelatedVideos.others.length > 0 && (
            <>
              <div className="related-section-title">Otros</div>
              {groupedRelatedVideos.others.map((relatedVideo) => {
                const badge = getRelationBadge(relatedVideo);
                return (
                  <div key={relatedVideo.id} className="related-video" onClick={() => onVideoSelect(relatedVideo)}>
                    <div className="related-thumbnail">
                      <VideoThumbnailHybrid video={relatedVideo} size="small" showCategory={false} />
                    </div>
                    <div className="related-info">
                      <h4 className="related-title">{relatedVideo.title}</h4>
                      <p className="related-user">{getUsername(relatedVideo.user)}</p>
                      <p className="related-views">{formatViews(relatedVideo.views)}</p>
                      {badge && <span className={`relation-badge ${badge.className}`}>{badge.text}</span>}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
