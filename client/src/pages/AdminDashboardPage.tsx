import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Oval } from 'react-loader-spinner';
import '../styles/DashboardPage.css';

export const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulate short loading to align with ProtectedRoute UX
    setIsLoading(false);
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-loading" role="status" aria-live="polite" aria-busy="true">
          <Oval
            height={56}
            width={56}
            color="#1f2937"
            secondaryColor="#9ca3af"
            strokeWidth={4}
            strokeWidthSecondary={4}
            ariaLabel="loading"
            visible
          />
        </div>
      </div>
    );
  }

  const handleLogout = (): void => {
    logout();
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-logo">QUIZLY</div>
          <div className="dashboard-header-actions">
            <span className="dashboard-user-name">{user?.name}</span>
            <button className="dashboard-logout-button" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-hero">
          <h1 className="dashboard-welcome">Admin Dashboard</h1>
          <p className="dashboard-subtitle">Manage platform settings and user activity</p>
        </div>

        <div className="dashboard-actions">
          <button className="dashboard-primary-button">View Reports</button>
          <button className="dashboard-secondary-button">Manage Users</button>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;