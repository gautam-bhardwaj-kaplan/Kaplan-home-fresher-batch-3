import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { NavSection, AppNavbarProps } from '../types';

const userNavItems: Array<{ key: NavSection; label: string; path: string }> = [
  { key: 'dashboard', label: 'Dashboard', path: '/dashboard' },
  { key: 'leaderboard', label: 'Leaderboard', path: '/leaderboard' },
  { key: 'profile', label: 'Profile', path: '/profile' },
];

const adminNavItems: Array<{ key: NavSection; label: string; path: string }> = [
  { key: 'admin-dashboard', label: 'Dashboard', path: '/admin/dashboard' },
  { key: 'admin-questions', label: 'Questions', path: '/admin/questions' },
  { key: 'admin-users', label: 'Users', path: '/admin/users' },
];

export const AppNavbar = ({ active, onLogout, mode, userName }: AppNavbarProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const displayName = (userName ?? user?.name ?? 'User').trim() || 'User';
  
  const isAdmin = mode === 'admin' || user?.role === 'ADMIN';
  const navItems = isAdmin ? adminNavItems : userNavItems;
  const initials = displayName
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2) || 'U';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
    onLogout();
  };

  return (
    <header className="dashboard-header-shell">
      <div className="dashboard-header-content">
        <div className="dashboard-logo">Pebble</div>

        <nav className="dashboard-header-actions" aria-label="Primary navigation">
          <ul className="dashboard-nav-list">
            {navItems.map((item) => (
              <li key={item.key}>
                <button
                  type="button"
                  className={`dashboard-nav-button ${active === item.key ? 'dashboard-nav-button-active' : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="dashboard-header-actions">
          <div className="dashboard-user-menu" ref={menuRef}>
            <button
              type="button"
              className="dashboard-user-avatar"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Account menu"
              aria-expanded={menuOpen}
            >
              {initials}
            </button>
            {menuOpen && (
              <div className="dashboard-user-dropdown" role="menu">
                <span className="dashboard-user-dropdown-label">Signed in as</span>
                <span className="dashboard-user-name">{displayName.charAt(0).toUpperCase() + displayName.slice(1)}</span>
                <button type="button" className="dashboard-user-logout" onClick={handleLogout}>
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
