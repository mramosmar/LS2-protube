import { useState } from 'react';
import './Header.css';

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onLogoClick: () => void;
  onLogin: () => void;
}

const Header = ({
  searchTerm,
  onSearchChange,
  categories,
  selectedCategory,
  onCategoryChange,
  onLogoClick,
  onLogin,
}: HeaderProps) => {
  const [showCategories, setShowCategories] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleCategorySelect = (category: string) => {
    onCategoryChange(category);
    setShowCategories(false);
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
              onChange={(e) => onSearchChange(e.target.value)}
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
        <div className="category-selector">
          <button className="category-button" onClick={() => setShowCategories(!showCategories)}>
            {selectedCategory === 'all' ? 'Todas las categorías' : selectedCategory}
            <svg className="dropdown-icon" viewBox="0 0 24 24">
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </button>
          {showCategories && (
            <div className="category-dropdown">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`category-option ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(category)}
                >
                  {category === 'all' ? 'Todas las categorías' : category}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="channel-owner">
          <button className="video-avatar" onClick={onLogin}></button>
        </div>
      </div>
    </header>
  );
};

export default Header;
