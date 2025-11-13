import { useNavigate } from 'react-router-dom';
import asset1 from '../assets/asset1.png';
import asset2 from '../assets/asset2.png';
import '../styles/LandingPage.css';

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <header className="landing-header-shell">
        <div className="landing-header">
          <div className="landing-logo">QUIZLY</div>

          <div className="landing-header-actions">
            <button
              className="landing-login-button"
              onClick={() => navigate('/login')}
            >
              Log in
            </button>
            <button
              className="landing-primary-button"
              onClick={() => navigate('/signup')}
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
          </span>
          <span className="landing-headline-row">
            question count
            <img src={asset2} alt="" className="landing-headline-icon" />
          </span>
        </h1>

        <p className="landing-subheadline">
          Don't let your brain fall asleep from boredom. Challenge yourself daily with engaging quizzes and track your progress in minutes with Quizly.
        </p>

        <div className="landing-cta-buttons">
          <button
            className="landing-login-button"
            onClick={() => navigate('/login')}
          >
            Log in
          </button>
          <button
            className="landing-primary-button"
            onClick={() => navigate('/signup')}
          >
            Sign up
          </button>
        </div>
      </main>
    </div>
  );
};

