import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { AppNavbar } from "../components/AppNavbar";
import "../styles/AdminDashboard.css";
import "../styles/DashboardPage.css";

export const AdminLayout = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== "ADMIN") return <Navigate to="/dashboard" replace />;

  const handleLogout = () => {
    logout();
  };

  const path = location.pathname;
  let activeSection: 'admin-dashboard' | 'admin-questions' | 'admin-users' = 'admin-dashboard';
  
  if (path === "/admin/questions") {
    activeSection = 'admin-questions';
  } else if (path === "/admin/users") {
    activeSection = 'admin-users';
  }

  return (
    <div className="admin-dashboard-container">
      <AppNavbar active={activeSection} onLogout={handleLogout} mode="admin" />

      <main className="admin-dashboard-main">
        <section className="admin-dashboard-content-shell">
          <Outlet /> 
        </section>
      </main>
    </div>
  );
};

export default AdminLayout;
