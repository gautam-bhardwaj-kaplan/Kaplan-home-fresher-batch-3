import { useNavigate } from 'react-router-dom';
import type { NavSection, AppNavbarProps } from '../types';

const navItems: Array<{ key: NavSection; label: string; path: string }> = [
  { key: 'dashboard', label: 'Dashboard', path: '/dashboard' },
  { key: 'leaderboard', label: 'Leaderboard', path: '/leaderboard' },
  { key: 'profile', label: 'Profile', path: '/profile' },
];

export const AppNavbar = ({ active, userName, onLogout }: AppNavbarProps) => {
  const navigate = useNavigate();

  return (
    <header className="dashboard-header-shell">
      <div className="dashboard-header-content">
        <div className="dashboard-logo">Pebble</div>

        <div className="dashboard-header-actions">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`dashboard-nav-button ${active === item.key ? 'dashboard-nav-button-active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="dashboard-header-actions">
          {userName && <span className="dashboard-user-name">{userName}</span>}
          <button className="dashboard-logout-button" onClick={onLogout}>
            Log out
          </button>
        </div>
      </div>
    </header>
  );
};

