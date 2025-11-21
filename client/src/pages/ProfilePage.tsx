import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, getUserProgress } from '../services/auth.service';
import type { User, UserProgress } from '../types';
import { Oval } from 'react-loader-spinner';
import '../styles/ProfilePage.css';
import { AppNavbar } from '../components/AppNavbar';
import { BASE_BADGES } from '../constants/badges';
import { formatMonthYear, formatShortDate } from '../utils/date';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const ownedBadges = profile?.badges ?? [];
  const ownedBadgesMap = useMemo(() => new Map(ownedBadges.map((badge) => [badge.badgeId, badge])), [ownedBadges]);

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
                    Joined {formatMonthYear(profile.createdAt)}
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
            <div className="profile-badges-grid">
              {BASE_BADGES.map((badge) => {
                const ownedBadge = ownedBadgesMap.get(badge.badgeId);
                const isUnlocked = Boolean(ownedBadge);
                const iconSrc = ownedBadge?.iconUrl || badge.icon;
                const iconContent = iconSrc ? (
                  <img src={iconSrc} alt={`${badge.name} badge icon`} loading="lazy" />
                ) : (
                  <span aria-hidden="true">{badge.name.charAt(0)}</span>
                );

                return (
                  <div
                    key={badge.badgeId}
                    className={`profile-badge-card ${
                      isUnlocked ? 'profile-badge-card-earned' : 'profile-badge-card-locked'
                    }`}
                    title={badge.description}
                    aria-label={`${badge.name}${isUnlocked ? '' : ' (locked)'}`}
                  >
                    <div className="profile-badge-icon">{iconContent}</div>
                    <p className="profile-badge-name">{badge.name}</p>
                  </div>
                );
              })}
            </div>
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
                          <span className="profile-history-date">{formatShortDate(attempt.date)}</span>
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
