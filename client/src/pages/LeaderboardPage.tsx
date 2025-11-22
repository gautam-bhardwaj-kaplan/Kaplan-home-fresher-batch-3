import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getLeaderboard, type LeaderboardType, type LeaderboardPeriod } from '../services/leaderboard.service';
import type { LeaderboardEntry, LeaderboardResponse } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { AppNavbar } from '../components/AppNavbar';
import '../styles/LeaderboardPage.css';

export const LeaderboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [type, setType] = useState<LeaderboardType>('points');
  const [period, setPeriod] = useState<LeaderboardPeriod>('all');
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const loadLeaderboard = async (selectedType: LeaderboardType, selectedPeriod: LeaderboardPeriod) => {
    try {
      setIsLoading(true);
      setError('');
      const response = await getLeaderboard(selectedType, selectedPeriod, 20);
      setData(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load leaderboard';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadLeaderboard(type, period);
  }, [type, period]);

  const handleLogout = (): void => {
    logout();
    navigate('/');
  };

  const leaderboardEntries = data?.leaderboard ?? [];
  const podium = leaderboardEntries.slice(0, 3);
  const leaderboardTop = leaderboardEntries.slice(0, 10);

  const getUserInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  };

  const formatTypeLabel = (t: LeaderboardType) => (t === 'points' ? 'Points' : 'Streak');

  const formatPeriodLabel = (p: LeaderboardPeriod) => {
    if (p === 'week') return 'This Week';
    if (p === 'month') return 'This Month';
    return 'All Time';
  };

  return (
    <div className="leaderboard-container">
      <AppNavbar active="leaderboard" onLogout={handleLogout} />

      <main className="leaderboard-main">
        {isLoading ? (
          <LoadingSpinner containerClassName="leaderboard-loading" />
        ) : (
          <section className="leaderboard-shell">
            {error && (
              <div className="leaderboard-error">
                {error}
              </div>
            )}

            <div className="leaderboard-header-row">
              <div>
                <h1 className="leaderboard-title">Leaderboard</h1>
                <p className="leaderboard-subtitle">
                  {formatTypeLabel(type)} • {formatPeriodLabel(period)}
                </p>
              </div>

              <div className="leaderboard-switches">
                <div className="leaderboard-toggle">
                  <button
                    className={`leaderboard-toggle-button ${type === 'points' ? 'active' : ''}`}
                    onClick={() => setType('points')}
                  >
                    Points
                  </button>
                  <button
                    className={`leaderboard-toggle-button ${type === 'streak' ? 'active' : ''}`}
                    onClick={() => setType('streak')}
                  >
                    Streak
                  </button>
                </div>

                <div className="leaderboard-period-toggle">
                  <button
                    className={`leaderboard-period-button ${period === 'all' ? 'active' : ''}`}
                    onClick={() => setPeriod('all')}
                  >
                    All time
                  </button>
                  <button
                    className={`leaderboard-period-button ${period === 'week' ? 'active' : ''}`}
                    onClick={() => setPeriod('week')}
                  >
                    Week
                  </button>
                  <button
                    className={`leaderboard-period-button ${period === 'month' ? 'active' : ''}`}
                    onClick={() => setPeriod('month')}
                  >
                    Month
                  </button>
                </div>
              </div>
            </div>

            <div className="leaderboard-layout">
              <section className="leaderboard-podium-card">
                <div className="leaderboard-podium">
                  {podium[1] && (
                    <div className="leaderboard-podium-column second">
                      <div className="leaderboard-avatar">
                        <span>{getUserInitials(podium[1].name)}</span>
                      </div>
                      <div className="leaderboard-podium-name">{podium[1].name}</div>
                      <div className="leaderboard-podium-block second-block">
                        <span className="leaderboard-podium-rank">2</span>
                      </div>
                    </div>
                  )}

                  {podium[0] && (
                    <div className="leaderboard-podium-column first">
                      <div className="leaderboard-avatar large">
                        <span>{getUserInitials(podium[0].name)}</span>
                      </div>
                      <div className="leaderboard-podium-name">{podium[0].name}</div>
                      <div className="leaderboard-podium-block first-block">
                        <span className="leaderboard-podium-trophy">🏆</span>
                      </div>
                    </div>
                  )}

                  {podium[2] && (
                    <div className="leaderboard-podium-column third">
                      <div className="leaderboard-avatar">
                        <span>{getUserInitials(podium[2].name)}</span>
                      </div>
                      <div className="leaderboard-podium-name">{podium[2].name}</div>
                      <div className="leaderboard-podium-block third-block">
                        <span className="leaderboard-podium-rank">3</span>
                      </div>
                    </div>
                  )}
                </div>

                {data?.currentUser && (
                  <div className="leaderboard-current-user">
                    <div className="leaderboard-current-rank">
                      Your rank: <strong>#{data.currentUser.rank}</strong>
                    </div>
                    <div className="leaderboard-current-stats">
                      <span>
                        Points: <strong>{data.currentUser.totalPoints}</strong>
                      </span>
                      <span>
                        Streak: <strong>{data.currentUser.currentStreak}</strong>
                      </span>
                    </div>
                  </div>
                )}
              </section>

              <section className="leaderboard-table-card">
                <div className="leaderboard-table-header">
                  <span>User Ranking</span>
                  <span>{formatTypeLabel(type)}</span>
                </div>

                {leaderboardTop.length === 0 ? (
                  <div className="leaderboard-empty-table">
                    No players yet. Be the first to appear on the leaderboard!
                  </div>
                ) : (
                  <ul className="leaderboard-table-list">
                    {leaderboardTop.map((entry: LeaderboardEntry) => (
                      <li
                        key={entry.userId}
                        className={`leaderboard-table-row ${
                          user?.id === entry.userId ? 'leaderboard-table-row-current' : ''
                        }`}
                      >
                        <div className="leaderboard-table-user">
                          <span className="leaderboard-table-rank">{entry.rank}</span>
                          <div className="leaderboard-table-user-main">
                            <div className="leaderboard-avatar small">
                              <span>{getUserInitials(entry.name)}</span>
                            </div>
                            <span className="leaderboard-table-name">{entry.name}</span>
                          </div>
                        </div>
                        <div className="leaderboard-table-score">
                          <span className="leaderboard-table-value">
                            {type === 'points' ? entry.totalPoints : entry.currentStreak}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};