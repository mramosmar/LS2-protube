import { useRef, useState, useEffect } from 'react';
import useThumbnailUrl from '../hooks/useThumbnailUrl';
import FallbackThumbnail from './FallbackThumbnail';
import './VideoThumbnailHybrid.css';

interface VideoThumbnailHybridProps {
  video: {
    id: number;
    title: string;
    user: string;
    duration: number;
    meta?: {
      categories?: string[];
    };
  };
  size?: 'small' | 'medium' | 'large';
  showCategory?: boolean;
}

const VideoThumbnailHybrid = ({ video, size = 'medium', showCategory = true }: VideoThumbnailHybridProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const { thumbnailUrl, isLoading, hasError } = useThumbnailUrl(video.id, video.title);
  const imgRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hoverTimeoutRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Validate video data
  const isVideoValid = video && typeof video.id === 'number' && video.title && video.user && isFinite(video.duration);

  if (!isVideoValid) {
    console.warn('Invalid video data in VideoThumbnailHybrid:', video);
    return <FallbackThumbnail video={video} size={size} showCategory={showCategory} />;
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'thumbnail-hybrid-small';
      case 'large':
        return 'thumbnail-hybrid-large';
      default:
        return 'thumbnail-hybrid-medium';
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  // Handle mouse enter - delay before showing video
  const handleMouseEnter = () => {
    setIsHovering(true);
    // Wait 500ms before starting video preview
    hoverTimeoutRef.current = setTimeout(() => {
      setShowVideo(true);
      // Start playing video after a brief delay to ensure it's loaded
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play().catch(() => {
            // Ignore play errors (e.g., user interaction required)
          });
        }
      }, 100);
    }, 500);
  };

  // Handle mouse leave - stop video and reset
  const handleMouseLeave = () => {
    setIsHovering(false);
    setShowVideo(false);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // If there's an error loading the real image or hook reports error, use fallback
  if (imageError || hasError || (!isLoading && !thumbnailUrl)) {
    return <FallbackThumbnail video={video} size={size} showCategory={showCategory} />;
  }

  return (
    <div
      ref={containerRef}
      className={`video-thumbnail-hybrid ${getSizeClasses()} ${isHovering ? 'hovering' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Loading placeholder */}
      {(isLoading || !imageLoaded) && !showVideo && (
        <div
          className="thumbnail-loading"
          style={{
            backgroundColor: '#303030',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            color: '#666',
          }}
        >
          ⏳
        </div>
      )}

      {/* Real image */}
      <img
        ref={imgRef}
        src={thumbnailUrl}
        alt={video.title}
        className={`thumbnail-image ${imageLoaded ? 'loaded' : ''} ${showVideo ? 'hidden' : ''}`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
      />

      {/* Video preview on hover */}
      {showVideo && (
        <video
          ref={videoRef}
          className="thumbnail-video"
          src={`http://localhost:8080/media/${video.id}.mp4`}
          loop
          muted
          playsInline
          preload="metadata"
        />
      )}

      {/* Overlay elements */}
      <div className="thumbnail-overlay">
        <div className="video-duration">{formatDuration(video.duration)}</div>
        {showCategory && video.meta?.categories && video.meta.categories.length > 0 && (
          <div className="video-category">{video.meta.categories[0]}</div>
        )}
      </div>
    </div>
  );
};

export default VideoThumbnailHybrid;
