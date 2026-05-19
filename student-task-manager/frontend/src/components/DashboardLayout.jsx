import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Dashboard', icon: '📊', path: '/student/dashboard', roles: ['student'] },
  { label: 'Dashboard', icon: '📊', path: '/admin/dashboard', roles: ['admin'] },
];

const DashboardLayout = ({ children, onSearchChange, searchValue }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredNav = navItems.filter((item) => item.roles.includes(user?.role));

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">t</div>
        </div>

        <nav className="sidebar-nav">
          {filteredNav.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`nav-item ${item.path === location.pathname ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.path === location.pathname && <span className="nav-dot" />}
            </Link>
          ))}
        </nav>

        <div className="sidebar-workspace">
          <div className="workspace-label">Workspace</div>
          <div className="workspace-select">
            <span>Tino Digital Agency</span>
            <span className="workspace-arrow">▼</span>
          </div>
        </div>
      </aside>

      <div className="main-area">
        <header className="main-header">
          <div className="header-left">
            <div className="greeting-row">
              <h1 className="greeting">
                Hello, {user?.name?.split(' ')[0] || 'User'}! <span className="greeting-emoji">🕐</span>
              </h1>
            </div>
            <div className="status-row">
              <span className="status-text">You've got tasks today</span>
            </div>
          </div>

          <div className="header-center">
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search tasks..."
                className="search-input"
                value={searchValue || ''}
                onChange={(e) => onSearchChange?.(e.target.value)}
              />
              {searchValue && (
                <button className="search-clear" onClick={() => onSearchChange?.('')}>✕</button>
              )}
            </div>
          </div>

          <div className="header-right">
            <div className="user-profile-card">
              <div className="profile-avatar">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="profile-info">
                <div className="profile-name">{user?.name || 'User'}</div>
                <div className="profile-role">{user?.role === 'admin' ? 'Administrator' : 'User'}</div>
              </div>
              <div className="profile-actions">
                <button className="icon-btn" title="Notifications">🔔</button>
                <button className="icon-btn" title="Messages">✉️</button>
              </div>
              <button onClick={handleLogout} className="logout-btn" title="Logout">⏻</button>
            </div>
          </div>
        </header>

        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
