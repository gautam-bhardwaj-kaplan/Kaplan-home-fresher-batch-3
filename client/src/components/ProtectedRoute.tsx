import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Oval } from 'react-loader-spinner';
import '../styles/ProtectedRoute.css';
import type { ProtectedRouteProps } from '../types';

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" role="status" aria-live="polite" aria-busy="true">
          <Oval
            height={48}
            width={48}
            color="#4a4a4a"
            secondaryColor="#bdbdbd"
            strokeWidth={4}
            strokeWidthSecondary={4}
            ariaLabel="loading"
            visible
          />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
