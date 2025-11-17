import { Outlet, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../styles/AdminDashboard.css";

export const AdminLayout = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== "ADMIN") return <Navigate to="/dashboard" replace />;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const path = location.pathname;

  return (
    <div className="admin-dashboard-container">
      <header className="admin-dashboard-header-shell">
        <div className="admin-dashboard-header-content">

          <div className="admin-dashboard-logo">QUIZLY</div>

          <div className="admin-dashboard-header-actions">
            <button
              className={`admin-nav-button ${path === "/admin/dashboard" ? "admin-nav-button-active" : ""}`}
              onClick={() => navigate("/admin/dashboard")}
            >
              Dashboard
            </button>

            <button
              className={`admin-nav-button ${path === "/admin/questions" ? "admin-nav-button-active" : ""}`}
              onClick={() => navigate("/admin/questions")}
            >
              Questions
            </button>

            <button
              className={`admin-nav-button ${path === "/admin/users" ? "admin-nav-button-active" : ""}`}
              onClick={() => navigate("/admin/users")}
            >
              Users
            </button>
          </div>

          <div className="admin-dashboard-header-actions">
            <span className="admin-dashboard-user-name">{user?.name}</span>
            <button className="admin-dashboard-logout-button" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="admin-dashboard-main">
        <section className="admin-dashboard-content-shell">
          <Outlet /> 
        </section>
      </main>
    </div>
  );
};

export default AdminLayout;
