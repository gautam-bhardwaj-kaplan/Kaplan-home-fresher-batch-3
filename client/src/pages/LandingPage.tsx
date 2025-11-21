import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import asset1 from '../assets/asset1.png';
import asset2 from '../assets/asset2.png';
import '../styles/LandingPage.css';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const goToLogin = (): void => {
    if (isAuthenticated) {
      const destination = user?.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard';
      navigate(destination);
      return;
    }
    navigate('/login');
  };

  const goToSignup = (): void => {
    if (isAuthenticated) {
      const destination = user?.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard';
      navigate(destination);
      return;
    }
    navigate('/signup');
  };

  return (
    <div className="landing-container">
      <header className="landing-header-shell">
        <div className="landing-header">
          <div className="landing-logo">Pebble</div>

          <div className="landing-header-actions">
            <button
              className="landing-login-button"
              onClick={goToLogin}
            >
              Log in
            </button>
            <button
              className="landing-primary-button"
              onClick={goToSignup}
            >
              Start for free
            </button>
          </div>
        </div>
      </header>

      <main className="landing-hero">
        <h1 className="landing-headline">
          <span className="landing-headline-row">
            <img src={asset1} alt="" className="landing-headline-icon" />
            Make every
            <img src={asset2} alt="" className="landing-headline-icon" />
          </span>
          <span className="landing-headline-row">question count</span>
        </h1>

        <p className="landing-subheadline">
          Don't let your brain fall asleep from boredom. Challenge yourself daily with engaging quizzes and track your progress with Pebble.
        </p>

        <div className="landing-cta-buttons">
          <button
            className="landing-login-button"
            onClick={goToLogin}
          >
            Log in
          </button>
          <button
            className="landing-primary-button"
            onClick={goToSignup}
          >
            Sign up
          </button>
        </div>
      </main>
    </div>
  );
};
