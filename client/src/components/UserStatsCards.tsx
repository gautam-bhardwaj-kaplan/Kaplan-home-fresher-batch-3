import {type UserStatsCardsProps} from '../types';

export const UserStatsCards = ({ totalUsers, activeUsers, avgAccuracy, longestStreak }: UserStatsCardsProps) => (
  <div className="admin-questions-cards">
    <div className="admin-questions-card">
      <div className="admin-questions-card-label">Total Users</div>
      <div className="admin-questions-card-value">{totalUsers}</div>
    </div>
    <div className="admin-questions-card">
      <div className="admin-questions-card-label">Active Users</div>
      <div className="admin-questions-card-value">{activeUsers}</div>
    </div>
    <div className="admin-questions-card">
      <div className="admin-questions-card-label">Avg Accuracy</div>
      <div className="admin-questions-card-value">{avgAccuracy}%</div>
    </div>
    <div className="admin-questions-card">
      <div className="admin-questions-card-label">Longest Streak</div>
      <div className="admin-questions-card-value">{longestStreak}</div>
    </div>
  </div>
);
