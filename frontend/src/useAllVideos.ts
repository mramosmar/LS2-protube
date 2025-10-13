import { useEffect, useState } from 'react';
import axios from 'axios';
import { getEnv } from './utils/Env';

type LoadingState = 'loading' | 'success' | 'error' | 'idle';

interface Video {
  id: number;
  title: string;
  user: string;
  duration: number;
  width: number;
  height: number;
  meta?: {
    description: string;
    categories: string[];
    tags: string[];
  };
}

export function useAllVideos() {
  const [value, setValue] = useState<Video[]>([]);
  const [message, setMessage] = useState<string>('Loading...');
  const [loading, setLoading] = useState<LoadingState>('idle');

  useEffect(() => {
    const getVideos = async () => {
      try {
        setLoading('loading');

        // Get environment configuration
        const env = getEnv();

        if (!env.API_BASE_URL) {
          throw new Error('API_BASE_URL no está configurado. Verifica las variables de entorno VITE_API_DOMAIN.');
        }

        const url = `${env.API_BASE_URL}/videos`;

        const response = await axios.get<Video[]>(url, {
          timeout: 10000, // 10 segundos de timeout
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 200) {
          if (Array.isArray(response.data)) {
            setValue(response.data);
            setMessage(`${response.data.length} videos cargados correctamente`);
          } else {
            throw new Error('La respuesta de la API no es un array válido');
          }
        } else {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        setLoading('success');
      } catch (error: unknown) {
        console.error('Error cargando videos:', error);
        setLoading('error');

        if (axios.isAxiosError(error)) {
          if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
            setMessage(
              'No se puede conectar al servidor. Verifica que el backend esté ejecutándose en http://localhost:8080'
            );
          } else if (error.response) {
            setMessage(`Error del servidor: ${error.response.status} - ${error.response.statusText}`);
          } else if (error.request) {
            setMessage('No se recibió respuesta del servidor. Verifica la conexión de red.');
          } else {
            setMessage(`Error de configuración: ${error.message}`);
          }
        } else {
          setMessage(`Error: ${(error as Error).message}`);
        }
      }
    };
    getVideos();
  }, []);

  return { value, message, loading };
}
