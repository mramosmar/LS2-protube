import { useState, useMemo, useRef, useEffect } from 'react';
import { Video } from '../App';
import VideoThumbnailHybrid from './VideoThumbnailHybrid';
import './VideoPlayer.css';
import { calculateTitleSimilarity } from '../utils/videoRecommendations';

interface VideoPlayerProps {
  video: Video;
  onBack: () => void;
  relatedVideos: Video[];
  onVideoSelect: (video: Video) => void;
  selectedCategory: string;
}

const VideoPlayer = ({ video, onBack, relatedVideos, onVideoSelect, selectedCategory }: VideoPlayerProps) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showEndScreen, setShowEndScreen] = useState(false);
  const [autoplayCountdown, setAutoplayCountdown] = useState(10);
  const [autoplayCancelled, setAutoplayCancelled] = useState(false);
  const [previewTime, setPreviewTime] = useState<number | null>(null);
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup countdown on unmount or video change
  useEffect(() => {
    setShowEndScreen(false);
    setAutoplayCountdown(10);
    setAutoplayCancelled(false);
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [video.id]);

  // Handle video ended event
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleEnded = () => {
      setShowEndScreen(true);
      setAutoplayCountdown(10);
      setAutoplayCancelled(false);

      // Start countdown for autoplay
      countdownIntervalRef.current = setInterval(() => {
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
    return relatedVideos.filter((v) => v.meta?.categories?.includes(selectedCategory));
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
      if (relatedVideo.user.toLowerCase() === video.user.toLowerCase()) {
        groups.sameAuthor.push(relatedVideo);
      } else if (
        video.meta?.categories?.some((cat) =>
          relatedVideo.meta?.categories?.some((cat2) => cat2.toLowerCase() === cat.toLowerCase())
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
    if (relatedVideo.user.toLowerCase() === video.user.toLowerCase()) {
      return { text: 'Mismo autor', className: 'badge-author' };
    }

    const commonCategories =
      video.meta?.categories?.filter((cat) =>
        relatedVideo.meta?.categories?.some((cat2) => cat2.toLowerCase() === cat.toLowerCase())
      ) || [];

    if (commonCategories.length > 0) {
      return { text: commonCategories[0], className: 'badge-category' };
    }

    return null;
  };

  // Function to format view count (deterministic based on video ID)
  const formatViews = (id: number): string => {
    // Generate deterministic value using a simple hash function
    const seed = (id * 9301 + 49297) % 233280;
    const views = (seed % 1000000) + id * 1000;
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

  const getLikes = (id: number): string => {
    // Generate deterministic value using a simple hash function
    const seed = (id * 7919 + 37199) % 233280;
    const likes = (seed % 50000) + id * 100;
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
          <div className="video-player-wrapper">
            <video
              ref={videoRef}
              controls
              autoPlay
              width="100%"
              height="auto"
              src={`http://localhost:8080/media/${video.id}.mp4`}
              poster={`http://localhost:8080/media/${video.id}.webp`}
              className="video-element"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              Tu navegador no soporta la reproducción de video.
            </video>

            {/* Video preview tooltip */}
            {previewTime !== null && (
              <div
                className="video-preview-tooltip"
                style={{
                  left: `${previewPosition.x}px`,
                  top: `${previewPosition.y}px`
                }}
              >
                <div className="preview-video-container">
                  <video
                    ref={previewVideoRef}
                    src={`http://localhost:8080/media/${video.id}.mp4`}
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
                        <p className="end-screen-video-user">{recommendedVideo.user}</p>
                        <p className="end-screen-video-views">{formatViews(recommendedVideo.id)}</p>
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
              <div className="channel-avatar">{video.user.charAt(0).toUpperCase()}</div>
              <div className="channel-details">
                <h3 className="channel-name">{video.user}</h3>
                <p className="channel-subscribers">
                  {Math.floor(((video.id * 6151 + 21377) % 233280) % 1000)}K suscriptores
                </p>
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
                  {showFullDescription ? video.meta.description : `${video.meta.description.substring(0, 200)}...`}
                </p>
                {video.meta.tags && video.meta.tags.length > 0 && (
                  <div className="tags-section">
                    {video.meta.tags.slice(0, 5).map((tag, index) => (
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

          {video.meta?.comments && video.meta.comments.length > 0 && (
            <div className="comments-section">
              <h3 className="comments-title">{video.meta.comments.length} comentarios</h3>
              <div className="comments-list">
                {video.meta.comments.slice(0, 5).map((comment, index) => (
                  <div key={index} className="comment">
                    <div className="comment-avatar">{comment.author.charAt(0).toUpperCase()}</div>
                    <div className="comment-content">
                      <div className="comment-author">{comment.author}</div>
                      <div className="comment-text">{comment.text}</div>
                    </div>
                  </div>
                ))}
                {video.meta.comments.length > 5 && <button className="show-more-comments">Ver más comentarios</button>}
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
                      <p className="related-user">{relatedVideo.user}</p>
                      <p className="related-views">{formatViews(relatedVideo.id)}</p>
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
                      <p className="related-user">{relatedVideo.user}</p>
                      <p className="related-views">{formatViews(relatedVideo.id)}</p>
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
                      <p className="related-user">{relatedVideo.user}</p>
                      <p className="related-views">{formatViews(relatedVideo.id)}</p>
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
                      <p className="related-user">{relatedVideo.user}</p>
                      <p className="related-views">{formatViews(relatedVideo.id)}</p>
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
