import { useState, useEffect } from 'react';
import {
  getAdminQuestion,
  createAdminQuestion,
  updateAdminQuestion,
  type AdminQuestionDetail,
  type QuestionCategory,
  type Difficulty,
  type QuestionType,
} from '../services/admin.questions';
import { ModalBackdrop } from './ModalBackdrop';
import { formatYMD } from './helpers/dateUtils';
import { type QuestionModalProps } from '../types';

const defaultOptions = ['', '', '', ''];

export const QuestionModal = ({ open, mode, questionId, onClose, onSaved }: QuestionModalProps) => {
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
    } else if (open && mode === 'create') {
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
        scheduledDate,
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

  return (
    <ModalBackdrop isOpen={open} onClose={onClose}>
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
    </ModalBackdrop>
  );
};
