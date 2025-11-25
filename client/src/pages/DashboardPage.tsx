import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserProgress } from '../services/auth.service';
import { getQuestionStats } from '../services/question.service';
import type { UserProgress } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import '../styles/DashboardPage.css';
import mainCard from '../assets/maincard.png';
import { AppNavbar } from '../components/AppNavbar';
import fireIcon from '../assets/fire.gif';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [totalQuestions, setTotalQuestions] = useState<number>(0);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const [progressData, questionStats] = await Promise.all([
          getUserProgress(),
          getQuestionStats(),
        ]);
        setProgress(progressData);
        setTotalQuestions(questionStats.totalQuestions);
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

  const handlePlayQuiz = (): void => {
    navigate('/quiz');
  };

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <LoadingSpinner containerClassName="dashboard-loading" />
      </div>
    );
  }

  const accuracy = progress?.overview.accuracy || 0;
  const totalPoints = progress?.overview.totalPoints || 0;
  const streakHistory = progress?.streakHistory ?? [];
  const recentActivity = progress?.recentActivity ?? [];
  const todayKey = new Date().toISOString().split('T')[0];
  const streakPreview = (() => {
    const historyMap = new Map(streakHistory.map((day) => [day.date, day]));

    const todayActivity = recentActivity.find((activity) => activity.date === todayKey);
    if (todayActivity) {
      historyMap.set(todayKey, {
        date: todayKey,
        hasAttempt: true,
        isCorrect: todayActivity.isCorrect,
      });
    } else if (!historyMap.has(todayKey)) {
      historyMap.set(todayKey, {
        date: todayKey,
        hasAttempt: false,
        isCorrect: false,
      });
    }

    const days: typeof streakHistory = [];
    for (let offset = 4; offset >= 0; offset -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - offset);
      const dateKey = date.toISOString().split('T')[0];
      const entry =
        historyMap.get(dateKey) ??
        {
          date: dateKey,
          hasAttempt: false,
          isCorrect: false,
        };
      days.push(entry);
    }
    return days;
  })();

  return (
    <div className="dashboard-container">
      <AppNavbar active="dashboard" onLogout={handleLogout} />

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
                    <p className="dashboard-quiz-description">
                      Today's quiz is Quiz of the Day no. {totalQuestions || 0}.
                    </p>
                  </div>
                  <div className="dashboard-quiz-plays">Plays: {progress?.overview.totalAttempts || 0}</div>
                  <button
                    className="dashboard-quiz-button"
                    onClick={handlePlayQuiz}
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
                  <img src={fireIcon} className="dashboard-streak-fire" alt="Fire" />
                </div>
                <p className="dashboard-streak-subtitle">Play a quiz to start a streak</p>
                <div className="dashboard-week-row">
                  {streakPreview.map((day, index) => {
                    const labelFull = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
                    const label = labelFull.charAt(0);
                    const statusClass = day.hasAttempt ? (day.isCorrect ? 'correct' : 'incorrect') : 'unattempted';
                    return (
                      <div key={`${day.date}-${index}`} className="dashboard-week-day">
                        <div className={`dashboard-week-dot ${statusClass}`}>
                          {day.hasAttempt && day.isCorrect && (
                            <svg width="14" height="14" viewBox="0 0 20 20" aria-hidden="true">
                              <polyline points="4 10 8 14 16 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                          {day.hasAttempt && !day.isCorrect && (
                            <svg width="14" height="14" viewBox="0 0 20 20" aria-hidden="true">
                              <path d="M5 5 L15 15 M15 5 L5 15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                          )}
                        </div>
                        <div className="dashboard-week-label">{label}</div>
                      </div>
                    );
                  })}
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