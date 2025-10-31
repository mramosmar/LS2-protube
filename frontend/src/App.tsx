import './App.css';
import { useMemo, useState } from 'react';
import { useAllVideos } from './useAllVideos';
import VideoPlayer from './components/VideoPlayer';
import Header from './components/Header';
import VideoGrid from './components/VideoGrid';
import LoginModal from './components/LoginModal';
import { getRelatedVideos } from './utils/videoRecommendations';

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
  const [previousVideo, setPreviousVideo] = useState<Video | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const { loading, message, value: videos } = useAllVideos();

  // Handler for search that returns to grid view
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    if (selectedVideo && term !== '') {
      setPreviousVideo(selectedVideo); // Save current video before leaving
      setSelectedVideo(null); // Return to grid when searching from video player
    } else if (term === '' && previousVideo && !selectedVideo) {
      setSelectedVideo(previousVideo); // Restore previous video when clearing search
      setPreviousVideo(null);
    }
  };

  // Handler for category change that returns to grid view
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (selectedVideo) {
      setPreviousVideo(selectedVideo); // Save current video before leaving
      setSelectedVideo(null); // Return to grid when changing category from video player
    }
  };

  // Get unique categories from videos
    const categories = useMemo(() => {
        if (!videos) return [];
        const allCategories = videos.flatMap((video) => video.meta?.categories || []);
        return ['all', ...Array.from(new Set(allCategories))];
    }, [videos]);

  // Filter videos based on search and category
  const filteredVideos = useMemo(() => {
    if (!videos) return [];

    return videos
      .filter((video) => {
        if (searchTerm === '') {
          const matchesCategory = selectedCategory === 'all' || video.meta?.categories?.includes(selectedCategory);
          return matchesCategory;
        }

        const searchLower = searchTerm.toLowerCase();

        // Create a regex that matches the search term at the start of a word
        // \b is a word boundary, so it matches the start of words
        const wordBoundaryRegex = new RegExp(`\\b${searchLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');

        // Only search in video title for more precise results
        const matchesSearch = wordBoundaryRegex.test(video.title);

        const matchesCategory = selectedCategory === 'all' || video.meta?.categories?.includes(selectedCategory);

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => a.title.localeCompare(b.title, 'es', { sensitivity: 'base' }));
  }, [videos, searchTerm, selectedCategory]);

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
    setPreviousVideo(null); // Clear previous video when selecting a new one
  };

  const handleBackToGrid = () => {
    setSelectedVideo(null);
    setPreviousVideo(null); // Clear previous video when going back
  };

    const handleLogin = async (username: string, password: string) => {
        try {
            console.log('Login attempt:', username, password);
            setShowLoginModal(false);
        } catch (error) {
            console.error('Error during login:', error);
        }
    };

    const handleRegister = async (username: string, password: string, email: string) => {
        try {
            console.log('Register attempt:', username, password, email);
            setShowRegisterModal(false);
            setShowLoginModal(true);
        } catch (error) {
            console.error('Error during registration:', error);
        }
    };

    // Open modal handlers
    const handleLoginClick = () => setShowLoginModal(true);
    const handleRegisterClick = () => setShowRegisterModal(true);

// Close modal handlers
    const handleCloseLoginModal = () => setShowLoginModal(false);
    const handleCloseRegisterModal = () => setShowRegisterModal(false);

// Switch between modals handlers
    const switchToRegister = () => {
        setShowLoginModal(false);
        setShowRegisterModal(true);
    };

    const switchToLogin = () => {
        setShowRegisterModal(false);
        setShowLoginModal(true);
    };

  return (
    <div className="App">
      <Header
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        onLogoClick={handleBackToGrid}
        onLogin={handleLoginClick} // Pass the function to open the modal
      />
      <main className="main-content">
        {selectedVideo ? (
          <VideoPlayer
            video={selectedVideo}
            onBack={handleBackToGrid}
            relatedVideos={getRelatedVideos(selectedVideo, videos || [], 25)}
            onVideoSelect={handleVideoSelect}
            selectedCategory={selectedCategory}
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
      {showLoginModal && (
        <LoginModal
          onClose={handleCloseLoginModal}
          onLogin={handleLogin}
          setShowRegisterModal={switchToRegister}
        />
      )}

      {showRegisterModal && (
        <RegisterModal
          onClose={handleCloseRegisterModal}
          onRegister={handleRegister}
          onLoginClick={switchToLogin}
        />
      )}
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
