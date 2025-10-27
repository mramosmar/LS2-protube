import { Video } from '../App';
import VideoThumbnailHybrid from './VideoThumbnailHybrid';
import ThumbnailErrorBoundary from './ThumbnailErrorBoundary';
import './VideoGrid.css';

interface VideoGridProps {
  videos: Video[];
  onVideoSelect: (video: Video) => void;
}

const VideoGrid = ({ videos, onVideoSelect }: VideoGridProps) => {
  // Function to format view count (placeholder for now)
  const formatViews = (id: number): string => {
    // Simulate view count based on video id
    const views = Math.floor(Math.random() * 1000000) + id * 1000;
    if (views > 1000000) {
      return `${(views / 1000000).toFixed(1)}M visualizaciones`;
    } else if (views > 1000) {
      return `${(views / 1000).toFixed(1)}K visualizaciones`;
    }
    return `${views} visualizaciones`;
  };

  // Function to get upload time (placeholder)
  const getUploadTime = (_: number): string => {
    const days = Math.floor(Math.random() * 365) + 1;
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
            <div className="video-avatar">{video.user.charAt(0).toUpperCase()}</div>
            <div className="video-details">
              <h3 className="video-title">{video.title}</h3>
              <p className="video-user">{video.user}</p>
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
