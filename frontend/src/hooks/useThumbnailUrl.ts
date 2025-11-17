import { useState, useEffect } from 'react';
import { getEnv } from '../utils/Env';

interface ThumbnailCache {
  [key: string]: string;
}

const thumbnailCache: ThumbnailCache = {};

export const useThumbnailUrl = (videoId: number, title: string, thumbnailExt?: string) => {
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

    // If we have a specific thumbnail extension, try that first
    if (thumbnailExt) {
      const thumbnailUrl = generateThumbnailUrl(videoId, thumbnailExt);
      tryLoadThumbnail(thumbnailUrl, cacheKey);
    } else {
      // Otherwise, try common formats in order of preference
      tryMultipleFormats(videoId, cacheKey);
    }

    // Cleanup function
    return () => {
      // Cleanup handled in image load functions
    };
  }, [videoId, title, thumbnailExt]);

  // Try to load a specific thumbnail URL
  const tryLoadThumbnail = (url: string, cacheKey: string) => {
    const img = new Image();
    img.onload = () => {
      // Cache the thumbnail URL if image loads successfully
      thumbnailCache[cacheKey] = url;
      setThumbnailUrl(url);
      setIsLoading(false);
      setHasError(false);
    };

    img.onerror = () => {
      // If image fails to load, don't cache and set error state
      console.warn(`No se pudo cargar la miniatura: ${url}`);
      setThumbnailUrl('');
      setIsLoading(false);
      setHasError(true);
    };

    // Start loading the image
    img.src = url;
  };

  // Try multiple thumbnail formats
  const tryMultipleFormats = (videoId: number, cacheKey: string) => {
    const formats = ['.webp', '.png', '.jpg', '.jpeg'];
    let currentIndex = 0;

    const tryNext = () => {
      if (currentIndex >= formats.length) {
        // All formats failed
        console.warn(`No se pudo cargar la miniatura para el video ID: ${videoId}`);
        setThumbnailUrl('');
        setIsLoading(false);
        setHasError(true);
        return;
      }

      const format = formats[currentIndex];
      const url = generateThumbnailUrl(videoId, format);

      const img = new Image();
      img.onload = () => {
        // Successfully loaded - cache and set
        thumbnailCache[cacheKey] = url;
        setThumbnailUrl(url);
        setIsLoading(false);
        setHasError(false);
      };

      img.onerror = () => {
        // Try next format
        currentIndex++;
        tryNext();
      };

      img.src = url;
    };

    tryNext();
  };

  return { thumbnailUrl, isLoading, hasError };
};

// Generate thumbnail URLs from the backend media endpoint
const generateThumbnailUrl = (videoId: number, extension: string = '.webp'): string => {
  const env = getEnv();
  // Use the media base URL from environment configuration
  // Ensure extension starts with a dot
  const ext = extension.startsWith('.') ? extension : `.${extension}`;
  return `${env.MEDIA_BASE_URL}/${videoId}${ext}`;
};

export default useThumbnailUrl;
