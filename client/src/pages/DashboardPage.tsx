import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserProgress } from '../services/auth.service';
import type { UserProgress } from '../types';
import { Oval } from 'react-loader-spinner';
import '../styles/DashboardPage.css';
import mainCard from '../assets/maincard.png';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const progressData = await getUserProgress();
        setProgress(progressData);
        setError('');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load progress';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, []);

  const handleLogout = (): void => {
    logout();
    navigate('/');
  };

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

  const accuracy = progress?.overview.accuracy || 0;
  const totalPoints = progress?.overview.totalPoints || 0;
  const streakPreview = (progress?.streakHistory ?? []).slice(-5);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header-shell">
        <div className="dashboard-header-content">
          <div className="dashboard-logo">QUIZLY</div>
          <div className="dashboard-header-actions"> 
            <button
              className="dashboard-nav-button dashboard-nav-button-active"
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
            </button>
            <button
              className="dashboard-nav-button"
              onClick={() => navigate('/leaderboard')}
            >
              Leaderboard
            </button>
            <button
              className="dashboard-nav-button"
              onClick={() => navigate('/profile')}
            >
              Profile
            </button>
          </div>
          <div className="dashboard-header-actions">
            <span className="dashboard-user-name">{user?.name}</span>
            <button className="dashboard-logout-button" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {error && (
          <div className="dashboard-error">
            {error}
          </div>
        )}

        <section className="dashboard-content-shell">
          <div className="dashboard-primary-layout">
            <article className="dashboard-quiz-card">
              <div className="dashboard-quiz-content">
                <div className="dashboard-quiz-text-section">
                  <h1 className="dashboard-quiz-title">Quiz of the Day</h1>
                  <div className="dashboard-quiz-description-container">
                    <p className="dashboard-quiz-description">Play our daily general knowledge trivia quiz.</p>
                    <p className="dashboard-quiz-description">Today's quiz is Quiz of the Day no.{' '}
                      {progress?.overview.totalAttempts || 0}.
                    </p>
                  </div>
                  <div className="dashboard-quiz-plays">Plays: {progress?.overview.totalAttempts || 0}</div>
                  <button
                    className="dashboard-quiz-button"
                    onClick={() => navigate('/dashboard')}
                  >
                    Play Now
                  </button>
                </div>
                <div className="dashboard-quiz-illustration">
                  <img
                    src={mainCard}
                    alt="Quiz friends"
                    loading="lazy"
                  />
                </div>
              </div>
            </article>

            <aside className="dashboard-side-stack">
              <div className="dashboard-streak-card">
                <div className="dashboard-streak-value">
                  <span>{progress?.overview.currentStreak || 0}</span>
                  <span className="dashboard-streak-icon" aria-hidden="true">🔥</span>
                </div>
                <p className="dashboard-streak-subtitle">Solve 3 problems to start a streak</p>
                <div className="dashboard-week-row">
                  {streakPreview.length === 0 && (
                    ['M', 'T', 'W', 'Th', 'F'].map((day) => (
                      <span key={day} className="dashboard-week-day">{day}</span>
                    ))
                  )}
                  {streakPreview.length > 0 &&
                    streakPreview.map((day) => (
                      <span
                        key={day.date}
                        className={`dashboard-week-day ${day.hasAttempt ? 'dashboard-week-day-active' : ''}`}
                      >
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                    ))}
                </div>
              </div>

              <div className="dashboard-pill-grid">
                <div className="dashboard-pill-card">
                  <p className="dashboard-pill-label">Total Points</p>
                  <p className="dashboard-pill-value">{totalPoints}</p>
                </div>
                <div className="dashboard-pill-card">
                  <p className="dashboard-pill-label">Accuracy</p>
                  <p className="dashboard-pill-value">{Math.round(accuracy)}%</p>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
};