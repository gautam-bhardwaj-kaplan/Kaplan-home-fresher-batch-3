import {type QuestionStatsCardsProps} from '../types';

export const QuestionStatsCards = ({ total, active, scheduled, inactive }: QuestionStatsCardsProps) => (
  <div className="admin-questions-cards">
    <div className="admin-questions-card">
      <div className="admin-questions-card-label">Total Questions</div>
      <div className="admin-questions-card-value">{total}</div>
    </div>
    <div className="admin-questions-card">
      <div className="admin-questions-card-label">Active</div>
      <div className="admin-questions-card-value">{active}</div>
    </div>
    <div className="admin-questions-card">
      <div className="admin-questions-card-label">Scheduled</div>
      <div className="admin-questions-card-value">{scheduled}</div>
    </div>
    <div className="admin-questions-card">
      <div className="admin-questions-card-label">Inactive</div>
      <div className="admin-questions-card-value">{inactive}</div>
    </div>
  </div>
);
