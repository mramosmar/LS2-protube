import './App.css';
import { useMemo, useState } from 'react';
import { useAllVideos } from './useAllVideos';
import VideoPlayer from './components/VideoPlayer';
import Header from './components/Header';
import VideoGrid from './components/VideoGrid';

export interface Video {
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
    comments?: Array<{
      text: string;
      author: string;
    }>;
  };
}

function App() {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { loading, message, value: videos } = useAllVideos();

  // Get unique categories from videos
  const categories = useMemo(() => {
    if (!videos) return [];
    const allCategories = videos.flatMap((video) => video.meta?.categories || []);
    return ['all', ...new Set(allCategories)];
  }, [videos]);

  // Filter videos based on search and category
  const filteredVideos = useMemo(() => {
    if (!videos) return [];

    return videos.filter((video) => {
      const matchesSearch =
        searchTerm === '' ||
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.meta?.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = selectedCategory === 'all' || video.meta?.categories?.includes(selectedCategory);

      return matchesSearch && matchesCategory;
    });
  }, [videos, searchTerm, selectedCategory]);

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
  };

  const handleBackToGrid = () => {
    setSelectedVideo(null);
  };

  return (
    <div className="App">
      <Header
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onLogoClick={handleBackToGrid}
      />
      <main className="main-content">
        {selectedVideo ? (
          <VideoPlayer
            video={selectedVideo}
            onBack={handleBackToGrid}
            relatedVideos={videos?.filter((v) => v.id !== selectedVideo.id).slice(0, 10) || []}
            onVideoSelect={handleVideoSelect}
          />
        ) : (
          <ContentApp
            loading={loading}
            message={message}
            videos={filteredVideos}
            onVideoSelect={handleVideoSelect}
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
          />
        )}
      </main>
    </div>
  );
}

interface ContentAppProps {
  loading: 'loading' | 'success' | 'error' | 'idle';
  message: string;
  videos: Video[];
  onVideoSelect: (video: Video) => void;
  searchTerm: string;
  selectedCategory: string;
}

function ContentApp({ loading, message, videos, onVideoSelect, searchTerm, selectedCategory }: ContentAppProps) {
  switch (loading) {
    case 'loading':
      return (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Cargando videos...</p>
        </div>
      );

    case 'error':
      return (
        <div className="error">
          <h3>Error al cargar videos</h3>
          <p>{message}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '10px',
              padding: '10px 20px',
              backgroundColor: '#ff4444',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Reintentar
          </button>
        </div>
      );

    case 'success':
      if (videos.length === 0 && (searchTerm || selectedCategory !== 'all')) {
        return (
          <div className="no-results">
            <h3>No se encontraron videos</h3>
            <p>Intenta con otros términos de búsqueda o selecciona una categoría diferente.</p>
          </div>
        );
      }

      if (videos.length === 0) {
        return (
          <div className="no-videos">
            <h3>No hay videos disponibles</h3>
            <p>No se encontraron videos en el servidor.</p>
          </div>
        );
      }

      return <VideoGrid videos={videos} onVideoSelect={onVideoSelect} />;

    case 'idle':
    default:
      return (
        <div className="loading">
          <p>Inicializando...</p>
        </div>
      );
  }
}

// Función para formatear la duración en minutos:segundos
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default App;
