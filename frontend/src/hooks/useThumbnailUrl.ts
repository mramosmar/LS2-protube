import { useState, useEffect } from 'react';
import { getEnv } from '../utils/Env';

interface ThumbnailCache {
  [key: string]: string;
}

const thumbnailCache: ThumbnailCache = {};

export const useThumbnailUrl = (videoId: number, title: string, filename?: string, thumbnail?: string) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const cacheKey = `thumbnail_${videoId}`;

    // If we have an explicit thumbnail filename, use it
    if (thumbnail) {
      const env = getEnv();
      setThumbnailUrl(`${env.MEDIA_BASE_URL}/${thumbnail}`);
      setIsLoading(false);
      return;
    }

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

    // Generate thumbnail URL based on filename or ID
    const generatedUrl = generateThumbnailUrl(videoId, filename);

    // Verify that the image exists before setting it
    const img = new Image();
    img.onload = () => {
      // Cache the thumbnail URL if image loads successfully
      thumbnailCache[cacheKey] = generatedUrl;
      setThumbnailUrl(generatedUrl);
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
    img.src = generatedUrl;

    // Cleanup function
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [videoId, title, filename, thumbnail]);

  return { thumbnailUrl, isLoading, hasError };
};

// Generate thumbnail URLs from the backend media endpoint
const generateThumbnailUrl = (videoId: number, filename?: string): string => {
  const env = getEnv();
  // Use filename if available (replacing extension with .webp), otherwise fallback to ID
  if (filename) {
    const baseName = filename.substring(0, filename.lastIndexOf('.')) || filename;
    return `${env.MEDIA_BASE_URL}/${baseName}.webp`;
  }
  return `${env.MEDIA_BASE_URL}/${videoId}.webp`;
};

export default useThumbnailUrl;
