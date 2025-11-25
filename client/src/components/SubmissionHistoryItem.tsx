import type { RecentActivity } from '../types';
import { formatShortDate } from '../utils/date';

interface SubmissionHistoryItemProps {
  attempt: RecentActivity;
  index: number;
}

export const SubmissionHistoryItem = ({ attempt, index }: SubmissionHistoryItemProps) => {
  return (
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
  );
};

