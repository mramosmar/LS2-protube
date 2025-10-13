export const getEnv = () => {
  const { VITE_API_DOMAIN, VITE_MEDIA_DOMAIN, ...otherViteConfig } = import.meta.env;

  // Valores por defecto para desarrollo
  const apiDomain = VITE_API_DOMAIN || 'http://localhost:8080';
  const mediaDomain = VITE_MEDIA_DOMAIN || 'http://localhost:8080';

  return {
    API_BASE_URL: `${apiDomain}/api`,
    MEDIA_BASE_URL: `${mediaDomain}/media`,
    __vite__: otherViteConfig,
  };
};
