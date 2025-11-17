import { useEffect } from 'react';
import './Sidebar.css';

interface SidebarProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onHomeClick: () => void;
  isCollapsed: boolean;
  onToggle: (collapsed: boolean) => void;
}

const Sidebar = ({
  categories,
  selectedCategory,
  onCategoryChange,
  onHomeClick,
  isCollapsed,
  onToggle,
}: SidebarProps) => {
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024 && !isCollapsed) {
        onToggle(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isCollapsed, onToggle]);

  const handleHomeClick = () => {
    onCategoryChange('all');
    onHomeClick();
    // Cerrar sidebar en móviles después de seleccionar
    if (window.innerWidth <= 1024) {
      onToggle(true);
    }
  };

  const handleCategoryClick = (category: string) => {
    onCategoryChange(category);
    // Cerrar sidebar en móviles después de seleccionar
    if (window.innerWidth <= 1024) {
      onToggle(true);
    }
  };

  return (
    <>
      <button className="sidebar-toggle" onClick={() => onToggle(!isCollapsed)}>
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
        </svg>
      </button>

      {!isCollapsed && window.innerWidth <= 1024 && <div className="sidebar-overlay" onClick={() => onToggle(true)} />}

      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <nav className="sidebar-nav">
          <div className="sidebar-section">
            <button className={`sidebar-item ${selectedCategory === 'all' ? 'active' : ''}`} onClick={handleHomeClick}>
              <svg className="sidebar-icon" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
              <span className="sidebar-label">Inicio</span>
            </button>
          </div>

          <div className="sidebar-divider"></div>

          <div className="sidebar-section">
            <h3 className="sidebar-section-title">
              <span>Explorar</span>
            </h3>
            {categories
              .filter((cat) => cat !== 'all')
              .map((category) => (
                <button
                  key={category}
                  className={`sidebar-item ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => handleCategoryClick(category)}
                >
                  <svg className="sidebar-icon" viewBox="0 0 24 24">
                    <path d="M3.5 18.99l11 .01c.67 0 1.27-.33 1.63-.84L20.5 12l-4.37-6.16c-.36-.51-.96-.84-1.63-.84l-11 .01L8.34 12 3.5 18.99z" />
                  </svg>
                  <span className="sidebar-label">{category}</span>
                </button>
              ))}
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
