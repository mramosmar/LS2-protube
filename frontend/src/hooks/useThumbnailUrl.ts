import { useState, useEffect } from 'react';
import { getEnv } from '../utils/Env';

interface ThumbnailCache {
  [key: string]: string;
}

const thumbnailCache: ThumbnailCache = {};

export const useThumbnailUrl = (videoId: number, title: string) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const cacheKey = `thumbnail_${videoId}`;

    // Check if thumbnail is already cached
    if (thumbnailCache[cacheKey]) {
      setThumbnailUrl(thumbnailCache[cacheKey]);
      setIsLoading(false);
      setHasError(false);
      return;
    }

    // Reset state
    setHasError(false);
    setIsLoading(true);

    // Generate thumbnail URL based on video ID
    const thumbnailUrl = generateThumbnailUrl(videoId);

    // Verify that the image exists before setting it
    const img = new Image();
    img.onload = () => {
      // Cache the thumbnail URL if image loads successfully
      thumbnailCache[cacheKey] = thumbnailUrl;
      setThumbnailUrl(thumbnailUrl);
      setIsLoading(false);
      setHasError(false);
    };

    img.onerror = () => {
      // If image fails to load, don't cache and set error state
      console.warn(`No se pudo cargar la miniatura para el video ID: ${videoId}`);
      setThumbnailUrl('');
      setIsLoading(false);
      setHasError(true);
    };

    // Start loading the image
    img.src = thumbnailUrl;

    // Cleanup function
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [videoId, title]);

  return { thumbnailUrl, isLoading, hasError };
};

// Generate thumbnail URLs from the backend media endpoint
const generateThumbnailUrl = (videoId: number): string => {
  const env = getEnv();
  // Use the media base URL from environment configuration
  return `${env.MEDIA_BASE_URL}/${videoId}.webp`;
};

export default useThumbnailUrl;
