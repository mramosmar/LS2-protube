import { Video } from '../App';
import VideoThumbnailHybrid from './VideoThumbnailHybrid';
import ThumbnailErrorBoundary from './ThumbnailErrorBoundary';
import './VideoGrid.css';

interface VideoGridProps {
  videos: Video[];
  onVideoSelect: (video: Video) => void;
}

const VideoGrid = ({ videos, onVideoSelect }: VideoGridProps) => {
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

  // Function to get upload time (deterministic based on video ID)
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

  if (videos.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📹</div>
        <h3>No hay videos disponibles</h3>
        <p>Revisa más tarde para ver contenido nuevo.</p>
      </div>
    );
  }

  return (
    <div className="video-grid">
      {videos.map((video) => (
        <div key={video.id} className="video-card" onClick={() => onVideoSelect(video)}>
          <ThumbnailErrorBoundary video={video} size="medium" showCategory={true}>
            <VideoThumbnailHybrid video={video} size="medium" showCategory={true} />
          </ThumbnailErrorBoundary>
          <div className="video-info">
            <div className="video-avatar">
              {(typeof video.user === 'string' ? video.user : video.user?.username || '?').charAt(0).toUpperCase()}
            </div>
            <div className="video-details">
              <h3 className="video-title">{video.title}</h3>
              <p className="video-user">
                {typeof video.user === 'string' ? video.user : video.user?.username || 'Unknown'}
              </p>
              <div className="video-metadata">
                <span className="video-views">{formatViews(video.id)}</span>
                <span className="video-separator">•</span>
                <span className="video-time">{getUploadTime(video.id)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideoGrid;
