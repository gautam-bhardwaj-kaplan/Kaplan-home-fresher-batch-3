import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, getUserProgress } from '../services/auth.service';
import type { User, UserProgress } from '../types';
import { Oval } from 'react-loader-spinner';
import '../styles/ProfilePage.css';
import { AppNavbar } from '../components/AppNavbar';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [profileData, progressData] = await Promise.all([
          getUserProfile(),
          getUserProgress()
        ]);
        setProfile(profileData);
        setProgress(progressData);
        setError('');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleLogout = (): void => {
    logout();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="profile-container">
        <div className="profile-loading" role="status" aria-live="polite" aria-busy="true">
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

  const submissionHistory = (progress?.recentActivity ?? []).slice(0, 20);
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

  return (
    <div className="profile-container">
      <AppNavbar active="profile" onLogout={handleLogout} />

      <main className="profile-main">
        {error && (
          <div className="profile-error">
            {error}
          </div>
        )}

        <section className="profile-content-shell">
          <div className="profile-header-section">
            <div className="profile-avatar-section">
              <div className="profile-avatar">
                {profile?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="profile-info">
                <h1 className="profile-name">{profile?.name || 'User'}</h1>
                <p className="profile-email">{profile?.email}</p>
                {profile?.createdAt && (
                  <p className="profile-joined-date">
                    Joined{' '}
                    {new Date(profile.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                )}
              </div>
            </div>
            <div className="profile-stats-overview">
              <div className="profile-stat-item">
                <span className="profile-stat-label">Total Points</span>
                <span className="profile-stat-value">{profile?.totalPoints || 0}</span>
              </div>
              <div className="profile-stat-item">
                <span className="profile-stat-label">Accuracy</span>
                <span className="profile-stat-value">{Math.round(profile?.accuracy || 0)}%</span>
              </div>
              <div className="profile-stat-item">
                <span className="profile-stat-label">Current Streak</span>
                <span className="profile-stat-value">{profile?.currentStreak || 0} days</span>
              </div>
              <div className="profile-stat-item">
                <span className="profile-stat-label">Longest Streak</span>
                <span className="profile-stat-value">{profile?.longestStreak || 0} days</span>
              </div>
            </div>
          </div>

          <div className="profile-badges-section">
            <h2 className="profile-section-title">Badges</h2>
            {profile?.badges && profile.badges.length > 0 ? (
              <div className="profile-badges-grid">
                {profile.badges.map((badge) => {
                  const badgeInitial = badge.name?.charAt(0).toUpperCase() || '🏆';

                  return (
                    <div key={badge.badgeId} className="profile-badge-card">
                      <div className="profile-badge-icon">
                        {badge.iconUrl ? (
                          <img src={badge.iconUrl} alt={`${badge.name} icon`} loading="lazy" />
                        ) : (
                          <span>{badgeInitial}</span>
                        )}
                      </div>
                      <div className="profile-badge-info">
                        <div className="profile-badge-header">
                          <h3 className="profile-badge-name">{badge.name}</h3>
                        </div>
                        <p className="profile-badge-date">
                          Earned on{' '}
                          {new Date(badge.earnedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="profile-empty-state">
                No badges earned yet. Keep taking quizzes to unlock achievements!
              </div>
            )}
          </div>

          <section className="profile-history-section">
            <div className="profile-history-header">
              <h2 className="profile-section-title">Submission History</h2>
              <p className="profile-history-subtitle">Last {submissionHistory.length || '0'} attempts</p>
            </div>
            {submissionHistory.length === 0 ? (
              <div className="profile-history-empty">
                No submissions yet. Take a quiz to see your progress grow.
              </div>
            ) : (
              <ul className="profile-history-list">
                {submissionHistory.map((attempt, index) => (
                  <li key={`${attempt.date}-${index}`} className="profile-history-item">
                    <div className="profile-history-main">
                      <div className="profile-history-question-section">
                        <p className="profile-history-question">{attempt.questionText || 'Question not available'}</p>
                        <div className="profile-history-tags">
                          <span className="profile-history-category">{attempt.category}</span>
                          <span className="profile-history-date">{formatDate(attempt.date)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="profile-history-meta">
                      <span className="profile-history-points">+{attempt.points} pts</span>
                      <span className={`profile-history-status ${attempt.isCorrect ? 'correct' : 'incorrect'}`}>
                        {attempt.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </section>
      </main>
    </div>
  );
};
