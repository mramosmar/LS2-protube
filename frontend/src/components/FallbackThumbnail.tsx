import React from 'react';
import './VideoThumbnail.css';

interface FallbackThumbnailProps {
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

const FallbackThumbnail: React.FC<FallbackThumbnailProps> = ({ video, size = 'medium', showCategory = true }) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'thumbnail-small';
      case 'large':
        return 'thumbnail-large';
      default:
        return 'thumbnail-medium';
    }
  };

  const formatDuration = (seconds: number): string => {
    const safeSeconds = isFinite(seconds) && seconds >= 0 ? seconds : 0;
    const mins = Math.floor(safeSeconds / 60);
    const secs = Math.floor(safeSeconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Simple color based on video ID
  const getBackgroundColor = () => {
    const colors = ['#ff4444', '#44ff44', '#4444ff', '#ffff44', '#ff44ff', '#44ffff', '#ff8844', '#8844ff'];
    return colors[Math.abs(video.id || 0) % colors.length];
  };

  return (
    <div className={`video-thumbnail ${getSizeClasses()}`}>
      <div
        className="fallback-thumbnail"
        style={{
          backgroundColor: '#404040',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          borderRadius: '12px',
        }}
      >
        <div
          style={{
            fontSize: '48px',
            color: '#888',
          }}
        >
          📺
        </div>

        <div className="thumbnail-overlay">
          <div className="video-duration">{formatDuration(video.duration)}</div>
          {showCategory && video.meta?.categories && video.meta.categories.length > 0 && (
            <div className="video-category">{video.meta.categories[0]}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FallbackThumbnail;
