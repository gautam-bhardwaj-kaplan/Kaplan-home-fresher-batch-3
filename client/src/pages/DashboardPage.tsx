import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserProgress } from '../services/auth.service';
import type { UserProgress } from '../types';
import { Oval } from 'react-loader-spinner';
import '../styles/DashboardPage.css';

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
        {error && (
          <div className="dashboard-error">
            {error}
          </div>
        )}
        
        <div className="dashboard-hero">
          <h1 className="dashboard-welcome">
            Welcome back, {user?.name}!
          </h1>
          <p className="dashboard-subtitle">
            Continue your learning journey and track your progress
          </p>
        </div>

        <div className="dashboard-stats-grid">
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-label">Current Streak</div>
            <div className="dashboard-stat-value">{progress?.overview.currentStreak || 0}</div>
            <div className="dashboard-stat-unit">days</div>
          </div>

          <div className="dashboard-stat-card">
            <div className="dashboard-stat-label">Longest Streak</div>
            <div className="dashboard-stat-value">{progress?.overview.longestStreak || 0}</div>
            <div className="dashboard-stat-unit">days</div>
          </div>

          <div className="dashboard-stat-card">
            <div className="dashboard-stat-label">Total Points</div>
            <div className="dashboard-stat-value">{progress?.overview.totalPoints || 0}</div>
            <div className="dashboard-stat-unit">points</div>
          </div>

          <div className="dashboard-stat-card">
            <div className="dashboard-stat-label">Accuracy</div>
            <div className="dashboard-stat-value">{Math.round(accuracy)}%</div>
            <div className="dashboard-stat-unit">
              {progress?.overview.totalAttempts || 0} questions
            </div>
          </div>
        </div>

        <div className="dashboard-actions">
          <button
            className="dashboard-primary-button"
          >
            Start Quiz
          </button>
          <button
            className="dashboard-secondary-button"
          >
            View Leaderboard
          </button>
        </div>
      </main>
    </div>
  );
};