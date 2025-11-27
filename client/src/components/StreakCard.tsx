import type { StreakDay } from '../types';
import fireIcon from '../assets/fire.gif';

interface StreakCardProps {
  currentStreak: number;
  streakPreview: StreakDay[];
}

export const StreakCard = ({ currentStreak, streakPreview }: StreakCardProps) => {
  return (
    <div className="dashboard-streak-card">
      <div className="dashboard-streak-value">
        <span>{currentStreak}</span>
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
  );
};

