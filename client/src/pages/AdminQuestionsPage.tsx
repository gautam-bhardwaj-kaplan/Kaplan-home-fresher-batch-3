import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  listAdminQuestions,
  deleteAdminQuestion,
  type AdminQuestionListItem,
  type ListFilters,
  type QuestionCategory,
  type Difficulty,
} from '../services/admin.questions';
import { QuestionModal } from '../components/QuestionModal';
import { QuestionStatsCards } from '../components/QuestionStatsCards';
import { Pagination } from '../components/Pagination';
import { Badge } from '../components/Badge';
import { ErrorAlert } from '../components/ErrorAlert';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { formatYMD, getTomorrowYMD, getDateStatus } from '../components/helpers/dateUtils';
import '../styles/AdminQuestions.css';
import deleteIcon from '../assets/deleteIcon.png';
import editIcon from '../assets/editIcon.png';

export const AdminQuestionsPage = () => {
  const [questions, setQuestions] = useState<AdminQuestionListItem[]>([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'' | QuestionCategory>('');
  const [status, setStatus] = useState<'' | 'active' | 'inactive'>('');
  const [difficulty, setDifficulty] = useState<'' | Difficulty>('');

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | undefined>(undefined);

  const [cardTotals, setCardTotals] = useState({ total: 0, active: 0, scheduled: 0, inactive: 0 });

  const loadQuestions = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const filters: ListFilters = { page, limit: 10 };
      if (category) filters.category = category;
      if (status) filters.status = status;
      if (difficulty) filters.difficulty = difficulty;
      const res = await listAdminQuestions(filters);
      setQuestions(res.questions);
      setPagination(res.pagination);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load questions';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [category, status, difficulty]);

  const loadCards = async () => {
    try {
      const [all, active, scheduled, inactive] = await Promise.all([
        listAdminQuestions({ page: 1, limit: 1 }),
        listAdminQuestions({ page: 1, limit: 1, status: 'active' }),
        listAdminQuestions({ page: 1, limit: 1, status: 'active', dateFrom: getTomorrowYMD() }),
        listAdminQuestions({ page: 1, limit: 1, status: 'inactive' }),
      ]);
      setCardTotals({
        total: all.pagination.totalItems,
        active: active.pagination.totalItems,
        scheduled: scheduled.pagination.totalItems,
        inactive: inactive.pagination.totalItems,
      });
    } catch {
      alert('Failed to load cards');
      setCardTotals({ total: 0, active: 0, scheduled: 0, inactive: 0 });
    }
  };

  useEffect(() => {
    loadQuestions(1);
    loadCards();
  }, [loadQuestions]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return questions;
    return questions.filter((q) => q.questionText.toLowerCase().includes(term));
  }, [questions, search]);

  const onDelete = async (id: string) => {
    if (!confirm('Delete this question? This will mark it inactive.')) return;
    try {
      await deleteAdminQuestion(id);
      await loadQuestions(pagination.currentPage);
      await loadCards();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Delete failed';
      alert(msg);
    }
  };

  const openEdit = (id: string) => {
    setEditId(id);
    setEditOpen(true);
  };

  const onSaved = async () => {
    await loadQuestions(pagination.currentPage);
    await loadCards();
  };

  return (
    <div className="admin-questions-page">
      <div className="admin-questions-sticky-section">
        <div className="admin-questions-header">
          <div className="admin-questions-title">Questions</div>
          <button className="admin-questions-create-button" onClick={() => setCreateOpen(true)}>+ Add Question</button>
        </div>

        <QuestionStatsCards
          total={cardTotals.total}
          active={cardTotals.active}
          scheduled={cardTotals.scheduled}
          inactive={cardTotals.inactive}
        />

        <div className="admin-questions-filters">
          <input 
            className="admin-input" 
            placeholder="Search questions..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
          <select 
            className="admin-select" 
            value={category} 
            onChange={(e) => setCategory(e.target.value as QuestionCategory | '')}
          >
            <option value="">All Categories</option>
            <option value="GENERAL">General</option>
            <option value="MATH">Math</option>
            <option value="ENGLISH">English</option>
            <option value="CODING">Coding</option>
            <option value="SCIENCE">Science</option>
          </select>
          <select 
            className="admin-select" 
            value={status} 
            onChange={(e) => setStatus(e.target.value as 'active' | 'inactive' | '')}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select 
            className="admin-select" 
            value={difficulty} 
            onChange={(e) => setDifficulty(e.target.value as Difficulty | '')}
          >
            <option value="">All Difficulty</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
      </div>

      {error && <ErrorAlert message={error} />}
      <div className="admin-table-container">
        <div className="admin-table-wrapper">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <table className="admin-questions-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Question</th>
                  <th>Category</th>
                  <th>Difficulty</th>
                  <th>Scheduled</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((q, idx) => {
                  const dateString = typeof q.scheduledDate === 'string' ? q.scheduledDate : q.scheduledDate instanceof Date ? q.scheduledDate.toISOString().split('T')[0] : '';
                  const statusLabel = getDateStatus(dateString);
                  const statusVariant = statusLabel === 'scheduled' ? 'blue' : statusLabel === 'published' ? 'green' : 'gray';

                  return (
                    <tr key={q.id}>
                      <td>{(pagination.currentPage - 1) * pagination.itemsPerPage + idx + 1}</td>
                      <td>{q.questionText}</td>
                      <td><Badge label={q.category} variant="blue" /></td>
                      <td><Badge label={q.difficulty || 'Unknown'} variant="yellow" /></td>
                      <td>{formatYMD(q.scheduledDate)}</td>
                      <td>
                        <Badge label={statusLabel} variant={statusVariant} />
                      </td>
                      <td>
                        <div className="admin-row-actions">
                          <button
                            className="admin-action-button"
                            onClick={() => openEdit(q.id)}
                            aria-label={`Edit question ${idx + 1}`}
                            title="Edit"
                          >
                            <img src={editIcon} alt="Edit" />
                          </button>
                          <button
                            className="admin-action-button admin-action-danger"
                            onClick={() => onDelete(q.id)}
                            aria-label={`Delete question ${idx + 1}`}
                            title="Delete"
                          >
                            <img src={deleteIcon} alt="Delete" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '1rem' }}>No questions found</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPrevious={() => loadQuestions(pagination.currentPage - 1)}
          onNext={() => loadQuestions(pagination.currentPage + 1)}
        />
      </div>

      <QuestionModal
        open={createOpen}
        mode="create"
        onClose={() => setCreateOpen(false)}
        onSaved={onSaved}
      />
      <QuestionModal
        open={editOpen}
        mode="edit"
        questionId={editId}
        onClose={() => setEditOpen(false)}
        onSaved={onSaved}
      />
    </div>
  );
};

export default AdminQuestionsPage;
