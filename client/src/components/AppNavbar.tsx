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

export const AppNavbar = ({ active, onLogout, mode }: AppNavbarProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const isAdmin = mode === 'admin' || user?.role === 'ADMIN';
  const navItems = isAdmin ? adminNavItems : userNavItems;

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
          <button className="dashboard-logout-button" onClick={onLogout}>
            Log out
          </button>
        </div>
      </div>
    </header>
  );
};
