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

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const isVideoValid = video && typeof video.id === 'number' && video.title && video.user && isFinite(video.duration);

  if (!isVideoValid) {
    return <FallbackThumbnail video={video} size={size} showCategory={showCategory} />;
  }

  if (imageError || hasError || (!isLoading && !thumbnailUrl)) {
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

  const handleMouseEnter = () => {
    setIsHovering(true);
    hoverTimeoutRef.current = window.setTimeout(() => {
      setShowVideo(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play().catch(() => {});
        }
      }, 100);
    }, 500);
  };

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

  return (
    <div
      ref={containerRef}
      className={`video-thumbnail-hybrid ${getSizeClasses()} ${isHovering ? 'hovering' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
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

      <img
        ref={imgRef}
        src={thumbnailUrl}
        alt={video.title}
        className={`thumbnail-image ${imageLoaded ? 'loaded' : ''} ${showVideo ? 'hidden' : ''}`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
      />

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

      <div className="thumbnail-overlay">
        <div className="video-duration">{formatDuration(video.duration)}</div>
      </div>
    </div>
  );
};

export default VideoThumbnailHybrid;
