import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, getUserProgress } from '../services/auth.service';
import type { User, UserProgress } from '../types';
import { LoadingSpinner, AppNavbar, BadgeCard, SubmissionHistoryItem } from '../components';
import '../styles/ProfilePage.css';
import { BASE_BADGES } from '../constants/badges';
import { formatMonthYear } from '../utils/date';

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
        <LoadingSpinner containerClassName="profile-loading" />
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
                return (
                  <BadgeCard
                    key={badge.badgeId}
                    badge={badge}
                    ownedBadge={ownedBadge}
                  />
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
                  <SubmissionHistoryItem
                    key={`${attempt.date}-${index}`}
                    attempt={attempt}
                    index={index}
                  />
                ))}
              </ul>
            )}
          </section>
        </section>
      </main>
    </div>
  );
};
