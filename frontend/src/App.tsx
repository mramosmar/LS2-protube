import './App.css';
import { useMemo, useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { useAllVideos } from './useAllVideos';
import VideoPlayer from './components/VideoPlayer';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import VideoGrid from './components/VideoGrid';
import LoginModal from './pages/LoginModal.tsx';
import { getRelatedVideos } from './utils/videoRecommendations';
import RegisterModal from './pages/RegisterModal.tsx';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const { loading, message, value: videos } = useAllVideos();
  const navigate = useNavigate();

  // Handler for search
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  // Handler for category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
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

  // Helper function to create URL-friendly slug from title
  const createSlug = (title: string): string => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/-+/g, '-') // Replace multiple - with single -
      .replace(/^-+|-+$/g, '') // Remove leading/trailing -
      .trim();
  };

  const handleVideoSelect = (video: Video) => {
    // Navigate to the video URL with ID and title slug
    const slug = createSlug(video.title);
    navigate(`/video/${video.id}/${slug}`);
  };

  const handleBackToGrid = () => {
    // Navigate back to home
    navigate('/');
  };

  // Open modal handlers
  const handleLoginClick = () => setShowLoginModal(true);

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
        onLogoClick={handleBackToGrid}
        onLogin={handleLoginClick}
      />
      <Sidebar
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        onHomeClick={handleBackToGrid}
        isCollapsed={sidebarCollapsed}
        onToggle={setSidebarCollapsed}
      />
      <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Routes>
          <Route
            path="/"
            element={
              <ContentApp
                loading={loading}
                message={message}
                videos={filteredVideos}
                onVideoSelect={handleVideoSelect}
                searchTerm={searchTerm}
                selectedCategory={selectedCategory}
              />
            }
          />
          <Route
            path="/video/:videoId/:videoTitle"
            element={
              <VideoPlayerRoute
                videos={videos || []}
                onBack={handleBackToGrid}
                onVideoSelect={handleVideoSelect}
                selectedCategory={selectedCategory}
              />
            }
          />
        </Routes>
      </main>
      {showLoginModal && (
        <LoginModal
          onClose={handleCloseLoginModal}
          onSwitchToRegister={switchToRegister} // Changed from setShowRegisterModal
        />
      )}

      {showRegisterModal && (
        <RegisterModal
          onClose={handleCloseRegisterModal}
          onSwitchToLogin={switchToLogin} // Changed from onLoginClick
        />
      )}
    </div>
  );
}

interface VideoPlayerRouteProps {
  videos: Video[];
  onBack: () => void;
  onVideoSelect: (video: Video) => void;
  selectedCategory: string;
}

function VideoPlayerRoute({ videos, onBack, onVideoSelect, selectedCategory }: VideoPlayerRouteProps) {
  const { videoId, videoTitle } = useParams<{ videoId: string; videoTitle: string }>();
  const navigate = useNavigate();

  // Find the video by ID
  const video = useMemo(() => {
    if (!videoId || !videos) return null;
    return videos.find((v) => v.id === parseInt(videoId, 10));
  }, [videoId, videos]);

  // Redirect to home if video not found
  useEffect(() => {
    if (videoId && videos.length > 0 && !video) {
      navigate('/');
    }
  }, [video, videoId, videos, navigate]);

  if (!video) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Cargando video...</p>
      </div>
    );
  }

  return (
    <VideoPlayer
      video={video}
      onBack={onBack}
      relatedVideos={getRelatedVideos(video, videos, 25)}
      onVideoSelect={onVideoSelect}
      selectedCategory={selectedCategory}
    />
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

export default App;
