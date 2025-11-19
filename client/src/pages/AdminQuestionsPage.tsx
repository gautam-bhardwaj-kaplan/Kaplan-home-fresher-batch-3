import { useEffect, useMemo, useState } from 'react';
import {
  listAdminQuestions,
  deleteAdminQuestion,
  getAdminQuestion,
  createAdminQuestion,
  updateAdminQuestion,
} from '../services/admin.questions';
import type {
  AdminQuestionListItem,
  AdminQuestionDetail,
  ListFilters,
  QuestionCategory,
  Difficulty,
  QuestionType,
} from '../services/admin.questions';
import '../styles/AdminQuestions.css';
import deleteIcon from '../assets/deleteIcon.png';
import editIcon from '../assets/editIcon.png';

type ModalMode = 'create' | 'edit';

const formatYMD = (date: string | Date) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
};

interface QuestionModalProps {
  open: boolean;
  mode: ModalMode;
  questionId?: string;
  onClose: () => void;
  onSaved: () => void;
}

const defaultOptions = ['', '', '', ''];

const QuestionModal = ({ open, mode, questionId, onClose, onSaved }: QuestionModalProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const [questionType, setQuestionType] = useState<QuestionType>('MCQ');
  const [questionText, setQuestionText] = useState('');
  const [category, setCategory] = useState<QuestionCategory>('GENERAL');
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [points, setPoints] = useState<number>(10);
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [options, setOptions] = useState<string[]>([...defaultOptions]);
  const [correctAnswer, setCorrectAnswer] = useState<string>('');
  const [acceptedAnswers, setAcceptedAnswers] = useState<string>('');
  const [caseSensitive, setCaseSensitive] = useState<boolean>(false);
  const [explanation, setExplanation] = useState<string>('');

  useEffect(() => {
    const loadForEdit = async (id: string) => {
      setLoading(true);
      setError('');
      try {
        const res = await getAdminQuestion(id);
        const q = res.question as AdminQuestionDetail;
        setQuestionType(q.questionType || 'MCQ');
        setQuestionText(q.questionText || '');
        setCategory(q.category || 'GENERAL');
        setDifficulty(q.difficulty || 'MEDIUM');
        setPoints(q.points || 10);
        setScheduledDate(formatYMD(q.scheduledDate));
        setOptions(q.options && q.options.length ? [...q.options] : [...defaultOptions]);
        setCorrectAnswer(q.correctAnswer || '');
        setAcceptedAnswers((q.acceptedAnswers || []).join(', '));
        setCaseSensitive(Boolean(q.caseSensitive));
        setExplanation(q.explanation || '');
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load question';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    if (open && mode === 'edit' && questionId) {
      loadForEdit(questionId);
    }
    if (open && mode === 'create') {
      setQuestionType('MCQ');
      setQuestionText('');
      setCategory('GENERAL');
      setDifficulty('MEDIUM');
      setPoints(10);
      setScheduledDate('');
      setOptions([...defaultOptions]);
      setCorrectAnswer('');
      setAcceptedAnswers('');
      setCaseSensitive(false);
      setExplanation('');
      setError('');
    }
  }, [open, mode, questionId]);

  const save = async () => {
    setError('');
    
    if (!scheduledDate) {
      setError('Scheduled date is required');
      return;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(scheduledDate);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      setError('Scheduled date cannot be in the past');
      return;
    }
    
    if (!explanation || explanation.trim().length === 0) {
      setError('Explanation is required');
      return;
    }
    
    setLoading(true);
    try {
      const payload: Partial<AdminQuestionDetail> & {
        scheduledDate: string;
        category: QuestionCategory;
        questionText: string;
        correctAnswer: string;
        questionType?: QuestionType;
        points?: number;
        options?: string[];
        acceptedAnswers?: string[];
        difficulty?: Difficulty;
        explanation: string;
      } = {
        scheduledDate:scheduledDate,
        category,
        difficulty,
        questionText,
        correctAnswer,
        questionType,
        points,
        explanation: explanation.trim(),
      };

      if (questionType === 'MCQ') {
        payload.options = options.filter((o) => o && o.trim().length > 0);
      } else {
        payload.acceptedAnswers = acceptedAnswers
          .split(',')
          .map((a) => a.trim())
          .filter((a) => a.length > 0);
        payload.caseSensitive = caseSensitive;
      }

      if (mode === 'create') {
        await createAdminQuestion(payload);
      } else if (mode === 'edit' && questionId) {
        await updateAdminQuestion(questionId, payload);
      }

      onSaved();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save question';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
      <div className="admin-modal">
        <div className="admin-modal-header">
          <div className="admin-modal-title">{mode === 'create' ? 'Add Question' : 'Edit Question'}</div>
          <button className="admin-modal-close" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        {error && <div className="admin-error-message">{error}</div>}
        <div className="admin-modal-body">
          <div className="admin-floating-label-group">
            <select 
              className="admin-select" 
              value={questionType} 
              onChange={(e) => setQuestionType(e.target.value as QuestionType)}
            >
              <option value="" disabled hidden></option>
              <option value="MCQ">Multiple Choice Question</option>
              <option value="SHORT_ANSWER">Short Answer</option>
            </select>
            <label className={questionType ? 'admin-label-floating' : ''}>Question Type</label>
          </div>

          <div className="admin-floating-label-group">
            <select 
              className="admin-select" 
              value={difficulty} 
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            >
              <option value="" disabled hidden></option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
            <label className={difficulty ? 'admin-label-floating' : ''}>Difficulty</label>
          </div>

          <div className="admin-floating-label-group">
            <select 
              className="admin-select" 
              value={category} 
              onChange={(e) => setCategory(e.target.value as QuestionCategory)}
            >
              <option value="" disabled hidden></option>
              <option value="GENERAL">General</option>
              <option value="MATH">Math</option>
              <option value="ENGLISH">English</option>
              <option value="CODING">Coding</option>
              <option value="SCIENCE">Science</option>
            </select>
            <label className={category ? 'admin-label-floating' : ''}>Category</label>
          </div>

          <div className="admin-floating-label-group">
            <input 
              className="admin-input" 
              type="number" 
              min={1} 
              max={100} 
              value={points} 
              onChange={(e) => setPoints(Number(e.target.value))}
              placeholder=" "
            />
            <label className={points ? 'admin-label-floating' : ''}>Points</label>
          </div>

          <div className="admin-floating-label-group">
            <input 
              className="admin-input admin-date" 
              type="date" 
              value={scheduledDate} 
              onChange={(e) => setScheduledDate(e.target.value)}
            />
            <label className="admin-label-floating">Schedule Date</label>
          </div>

          <div className="admin-textarea admin-floating-label-group">
            <textarea 
              className="admin-input" 
              value={questionText} 
              onChange={(e) => setQuestionText(e.target.value)} 
              placeholder=" "
            />
            <label className={questionText ? 'admin-label-floating' : ''}>Question</label>
          </div>

          {questionType === 'MCQ' ? (
            <div className="admin-options-section">
              {options.map((opt, idx) => (
                <div key={idx} className="admin-floating-label-group">
                  <input 
                    className="admin-input" 
                    value={opt} 
                    onChange={(e) => {
                      const next = [...options];
                      next[idx] = e.target.value;
                      setOptions(next);
                    }}
                    placeholder=" "
                  />
                  <label className={opt ? 'admin-label-floating' : ''}>{`Option ${idx + 1}`}</label>
                </div>
              ))}
              <div className="admin-floating-label-group">
                <input 
                  className="admin-input" 
                  value={correctAnswer} 
                  onChange={(e) => setCorrectAnswer(e.target.value)} 
                  placeholder=" "
                />
                <label className={correctAnswer ? 'admin-label-floating' : ''}>Correct Answer</label>
              </div>
            </div>
          ) : (
            <div className="admin-options-section">
              <div className="admin-floating-label-group">
                <input 
                  className="admin-input" 
                  value={correctAnswer} 
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  placeholder=" "
                />
                <label className={correctAnswer ? 'admin-label-floating' : ''}>Correct Answer</label>
              </div>
              <div className="admin-floating-label-group">
                <input 
                  className="admin-input" 
                  value={acceptedAnswers} 
                  onChange={(e) => setAcceptedAnswers(e.target.value)}
                  placeholder=" "
                />
                <label className={acceptedAnswers ? 'admin-label-floating' : ''}>Accepted Answers (comma-separated)</label>
              </div>
              <div>
                <label className="admin-checkbox-label">
                  <input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} /> 
                  <span>Case Sensitive</span>
                </label>
              </div>
            </div>
          )}

          <div className="admin-textarea admin-floating-label-group">
            <textarea 
              className="admin-input" 
              value={explanation} 
              onChange={(e) => setExplanation(e.target.value)} 
              placeholder=" "
            />
            <label className={explanation ? 'admin-label-floating' : ''}>Explanation</label>
          </div>
        </div>

        <div className="admin-modal-footer">
          <button className="admin-secondary" onClick={onClose}>Cancel</button>
          <button className="admin-primary" onClick={save} disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
};

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

  const loadQuestions = async (page = 1) => {
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
  };

  const getTomorrowYMD = () => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    return t.toISOString().split('T')[0];
  };

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
    } catch (err) {
      alert('Failed to load cards');
      setCardTotals({ total: 0, active: 0, scheduled: 0, inactive: 0 });
    }
  };

  useEffect(() => {
    loadQuestions(1);
    loadCards();
  }, [category, status, difficulty]);

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

        <div className="admin-questions-cards">
          <div className="admin-questions-card">
            <div className="admin-questions-card-label">Total Questions</div>
            <div className="admin-questions-card-value">{cardTotals.total}</div>
          </div>
          <div className="admin-questions-card">
            <div className="admin-questions-card-label">Active</div>
            <div className="admin-questions-card-value">{cardTotals.active}</div>
          </div>
          <div className="admin-questions-card">
            <div className="admin-questions-card-label">Scheduled</div>
            <div className="admin-questions-card-value">{cardTotals.scheduled}</div>
          </div>
          <div className="admin-questions-card">
            <div className="admin-questions-card-label">Inactive</div>
            <div className="admin-questions-card-value">{cardTotals.inactive}</div>
          </div>
        </div>

        <div className="admin-questions-filters">
          <input className="admin-input" placeholder="Search questions..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="admin-select" value={category} onChange={(e) => setCategory(e.target.value as QuestionCategory | '')}>
            <option value="">All Categories</option>
            <option value="GENERAL">General</option>
            <option value="MATH">Math</option>
            <option value="ENGLISH">English</option>
            <option value="CODING">Coding</option>
            <option value="SCIENCE">Science</option>
          </select>
          <select className="admin-select" value={status} onChange={(e) => setStatus(e.target.value as 'active' | 'inactive' | '')}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select className="admin-select" value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty | '')}>
            <option value="">All Difficulty</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
      </div>

      {error && <div style={{ color: '#8a1a1a' }}>{error}</div>}
      <div className="admin-table-container">
        <div className="admin-table-wrapper">
          {loading ? (
            <div style={{ padding: '1rem' }}>Loading...</div>
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
                  const today = new Date().toISOString().split('T')[0];
                  const sched = q.scheduledDate ? new Date(q.scheduledDate).toISOString().split('T')[0] : '';
                  let statusLabel: 'inactive' | 'scheduled' | 'published';
                  if (!q.isActive) statusLabel = 'inactive';
                  else if (sched > today) statusLabel = 'scheduled';
                  else statusLabel = 'published';

                  return (
                    <tr key={q.id}>
                      <td>{(pagination.currentPage - 1) * pagination.itemsPerPage + idx + 1}</td>
                      <td>{q.questionText}</td>
                      <td><span className="admin-badge admin-badge-blue">{q.category}</span></td>
                      <td><span className="admin-badge admin-badge-yellow">{q.difficulty}</span></td>
                      <td>{formatYMD(q.scheduledDate)}</td>
                      <td>
                        {statusLabel === 'scheduled' && (
                          <span className="admin-badge admin-badge-blue">scheduled</span>
                        )}
                        {statusLabel === 'published' && (
                          <span className="admin-badge admin-badge-green">published</span>
                        )}
                        {statusLabel === 'inactive' && (
                          <span className="admin-badge admin-badge-gray">inactive</span>
                        )}
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
        <div className="admin-pagination">
          <button className="admin-action-button" disabled={pagination.currentPage <= 1} onClick={() => loadQuestions(pagination.currentPage - 1)}>Prev</button>
          <div style={{ alignSelf: 'center' }}>{pagination.currentPage} / {pagination.totalPages}</div>
          <button className="admin-action-button" disabled={pagination.currentPage >= pagination.totalPages} onClick={() => loadQuestions(pagination.currentPage + 1)}>Next</button>
        </div>
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
