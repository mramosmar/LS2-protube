import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onLogoClick: () => void;
  onLogin: () => void;
  isAuthenticated: boolean;
  username?: string;
  onLogout: () => void;
  onUpload: () => void;
}

const Header = ({
  searchTerm,
  onSearchChange,
  onLogoClick,
  onLogin,
  isAuthenticated,
  username,
  onLogout,
  onUpload,
}: HeaderProps) => {
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowLogoutMenu(false);
      }
    };

    if (showLogoutMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLogoutMenu]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to home page to show search results if not already there
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSearchChange(value);
    // Navigate to home page when typing in search if not already there
    if (location.pathname !== '/' && value.length > 0) {
      navigate('/');
    }
  };

  const handleAvatarClick = () => {
    if (isAuthenticated) {
      setShowLogoutMenu(!showLogoutMenu);
    } else {
      onLogin();
    }
  };

  const handleLogout = () => {
    setShowLogoutMenu(false);
    onLogout();
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="logo-container" onClick={onLogoClick}>
          <img src="/protube-logo-removebg-preview.png" className="app-logo" alt="logo" />
          <h1 className="app-title">ProTube</h1>
        </div>
      </div>

      <div className="header-center">
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar videos..."
              value={searchTerm}
              onChange={handleSearchInputChange}
              className="search-input"
            />
            <button type="submit" className="search-button">
              <svg className="search-icon" viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      <div className="header-right">
        {isAuthenticated && (
          <button className="upload-button" onClick={onUpload} title="Subir video">
            <svg className="upload-icon" viewBox="0 0 24 24" width="24" height="24">
              <path
                fill="currentColor"
                d="M14,13V17H10V13H7L12,8L17,13M19.35,10.03C18.67,6.59 15.64,4 12,4C9.11,4 6.6,5.64 5.35,8.03C2.34,8.36 0,10.9 0,14A6,6 0 0,0 6,20H19A5,5 0 0,0 24,15C24,12.36 21.95,10.22 19.35,10.03Z"
              />
            </svg>
            <span className="upload-text">Subir</span>
          </button>
        )}
        <div className="channel-owner" ref={menuRef}>
          <button
            className="video-avatar"
            onClick={handleAvatarClick}
            title={isAuthenticated ? username : 'Iniciar sesión'}
          >
            {isAuthenticated && username && <span className="avatar-initial">{username.charAt(0).toUpperCase()}</span>}
          </button>
          {isAuthenticated && showLogoutMenu && (
            <div className="logout-menu">
              <div className="logout-menu-header">
                <span className="logout-menu-username">{username}</span>
              </div>
              <button className="logout-button" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
