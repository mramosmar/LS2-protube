import { useEffect, useRef, useState } from 'react';
import './VideoThumbnail.css';

interface VideoThumbnailProps {
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

const VideoThumbnail = ({ video, size = 'medium', showCategory = true }: VideoThumbnailProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Generate a gradient based on video properties
  const generateGradient = (id: number, title: string, user: string) => {
    // Validate inputs and provide defaults
    const safeId = isFinite(id) ? id : 0;
    const safeTitle = title || 'default';
    const safeUser = user || 'user';

    // Use video properties to create consistent colors
    const hash1 = safeTitle.split('').reduce((a, b) => a + b.charCodeAt(0), 0) + safeId;
    const hash2 = safeUser.split('').reduce((a, b) => a + b.charCodeAt(0), 0) + safeId;

    // Ensure all calculations result in finite values
    const hue1 = Math.abs(hash1) % 360;
    const hue2 = ((Math.abs(hash2) % 360) + 120) % 360; // Offset for variety

    const saturation = 70 + (Math.abs(hash1) % 30); // 70-100%
    const lightness1 = 40 + (Math.abs(hash1) % 20); // 40-60%
    const lightness2 = 20 + (Math.abs(hash2) % 20); // 20-40%
    const angle = Math.abs(hash1 + hash2) % 180; // 0-180 degrees

    return {
      color1: `hsl(${hue1}, ${saturation}%, ${lightness1}%)`,
      color2: `hsl(${hue2}, ${saturation}%, ${lightness2}%)`,
      angle: angle,
    };
  };

  // Generate thumbnail patterns
  const generateThumbnailArt = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Validate video data
    if (!video || typeof video.id !== 'number' || !video.title || !video.user) {
      console.warn('Invalid video data for thumbnail generation:', video);
      return;
    }

    const width = canvas.width;
    const height = canvas.height;

    // Validate canvas dimensions
    if (!isFinite(width) || !isFinite(height) || width <= 0 || height <= 0) {
      console.warn('Invalid canvas dimensions:', { width, height });
      return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Generate gradient
    const { color1, color2, angle } = generateGradient(video.id, video.title, video.user);

    // Ensure values are finite and valid
    const safeAngle = isFinite(angle) ? angle : 45;
    const x1 = 0;
    const y1 = 0;
    const x2 = width * Math.cos((safeAngle * Math.PI) / 180);
    const y2 = height * Math.sin((safeAngle * Math.PI) / 180);

    // Validate all gradient parameters
    const safeX1 = isFinite(x1) ? x1 : 0;
    const safeY1 = isFinite(y1) ? y1 : 0;
    const safeX2 = isFinite(x2) ? x2 : width;
    const safeY2 = isFinite(y2) ? y2 : height;

    const gradient = ctx.createLinearGradient(safeX1, safeY1, safeX2, safeY2);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(0.5, color2);
    gradient.addColorStop(1, color1);

    // Fill background with gradient
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add some geometric patterns based on video content
    const titleHash = video.title.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const userHash = video.user.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const patternType = titleHash % 5;

    // Enhanced patterns with better visual appeal
    ctx.globalAlpha = 0.4;

    switch (patternType) {
      case 0: // Floating circles with depth
        for (let i = 0; i < 6; i++) {
          const x = ((titleHash * (i + 1) * 37) % (width * 1.2)) - width * 0.1;
          const y = ((titleHash * (i + 2) * 23) % (height * 1.2)) - height * 0.1;
          const radius = 15 + ((titleHash + i * 17) % 45);

          const circleGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
          circleGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
          circleGradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = circleGradient;
          ctx.fill();
        }
        break;

      case 1: // Dynamic triangular pattern
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        for (let i = 0; i < 4; i++) {
          const centerX = ((titleHash * (i + 1) * 41) % (width * 0.8)) + width * 0.1;
          const centerY = ((userHash * (i + 2) * 31) % (height * 0.8)) + height * 0.1;
          const size = 25 + ((titleHash + i * 19) % 35);
          const rotation = (titleHash + i * 43) % 360;

          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.rotate((rotation * Math.PI) / 180);

          ctx.beginPath();
          ctx.moveTo(0, -size);
          ctx.lineTo(-size * 0.866, size * 0.5);
          ctx.lineTo(size * 0.866, size * 0.5);
          ctx.closePath();
          ctx.fill();

          ctx.restore();
        }
        break;

      case 2: // Flowing rectangles
        for (let i = 0; i < 5; i++) {
          const x = (titleHash * (i + 1) * 29) % (width - 60);
          const y = (userHash * (i + 3) * 37) % (height - 40);
          const w = 20 + ((titleHash + i * 13) % 50);
          const h = 15 + ((userHash + i * 17) % 35);
          const rotation = ((titleHash + i * 23) % 60) - 30;

          ctx.save();
          ctx.translate(x + w / 2, y + h / 2);
          ctx.rotate((rotation * Math.PI) / 180);

          ctx.fillStyle = `rgba(255, 255, 255, ${0.08 + (i % 3) * 0.04})`;
          ctx.fillRect(-w / 2, -h / 2, w, h);

          ctx.restore();
        }
        break;

      case 3: // Curved lines network
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        for (let i = 0; i < 6; i++) {
          const x1 = (titleHash * i * 31) % width;
          const y1 = (userHash * i * 23) % height;
          const x2 = (titleHash * (i + 3) * 37) % width;
          const y2 = (userHash * (i + 3) * 29) % height;

          const cpx = (x1 + x2) / 2 + ((titleHash * i * 19) % 100) - 50;
          const cpy = (y1 + y2) / 2 + ((userHash * i * 17) % 100) - 50;

          ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 + (i % 4) * 0.05})`;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.quadraticCurveTo(cpx, cpy, x2, y2);
          ctx.stroke();
        }
        break;

      case 4: // Spiral pattern
        const centerX = width / 2;
        const centerY = height / 2;
        const maxRadius = Math.min(width, height) / 3;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 3;
        ctx.beginPath();

        for (let angle = 0; angle < Math.PI * 6; angle += 0.1) {
          const radius = (angle / (Math.PI * 6)) * maxRadius;
          const x = centerX + Math.cos(angle + titleHash * 0.01) * radius;
          const y = centerY + Math.sin(angle + titleHash * 0.01) * radius;

          if (angle === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
        break;
    }

    // Reset alpha
    ctx.globalAlpha = 1.0;

    // Add a subtle vignette effect
    const vignette = ctx.createRadialGradient(
      width / 2,
      height / 2,
      0,
      width / 2,
      height / 2,
      Math.max(width, height) / 2
    );
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(0.7, 'rgba(0, 0, 0, 0.1)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.4)');

    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    // Add central icon based on category with enhanced styling
    let centerText = '▶';
    let iconColor = 'rgba(255, 255, 255, 0.9)';

    if (video.meta?.categories && video.meta.categories.length > 0) {
      const category = video.meta.categories[0].toLowerCase();
      switch (category) {
        case 'music':
          centerText = '♪';
          iconColor = 'rgba(255, 100, 150, 0.9)';
          break;
        case 'gaming':
          centerText = '🎮';
          break;
        case 'sports':
          centerText = '⚽';
          break;
        case 'education':
          centerText = '📚';
          break;
        case 'comedy':
          centerText = '😂';
          break;
        case 'news':
          centerText = '📰';
          break;
        case 'tech':
        case 'technology':
          centerText = '⚙️';
          iconColor = 'rgba(100, 200, 255, 0.9)';
          break;
        default:
          centerText = '▶';
      }
    }

    // Add glow effect to central icon
    ctx.shadowColor = iconColor;
    ctx.shadowBlur = 15;
    ctx.fillStyle = iconColor;
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(centerText, width / 2, height / 2);

    // Reset shadow
    ctx.shadowBlur = 0;

    setImageLoaded(true);
  };

  useEffect(() => {
    generateThumbnailArt();
  }, [video.id, video.title, video.user]);

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
    // Validate input and provide default
    const safeSeconds = isFinite(seconds) && seconds >= 0 ? seconds : 0;
    const mins = Math.floor(safeSeconds / 60);
    const secs = Math.floor(safeSeconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`video-thumbnail ${getSizeClasses()}`}>
      <canvas ref={canvasRef} width={320} height={180} className={`thumbnail-canvas ${imageLoaded ? 'loaded' : ''}`} />
      <div className="thumbnail-overlay">
        <div className="video-duration">{formatDuration(video.duration)}</div>
        {showCategory && video.meta?.categories && video.meta.categories.length > 0 && (
          <div className="video-category">{video.meta.categories[0]}</div>
        )}
      </div>
    </div>
  );
};

export default VideoThumbnail;
