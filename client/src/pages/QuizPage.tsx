import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getTodayQuestion, submitAnswer } from '../services/question.service';
import type { Question, Submission, TodayQuestionResponse } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import '../styles/QuizPage.css';
import partyGif from '../assets/party.gif';

export const QuizPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [question, setQuestion] = useState<Question | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [hasAttempted, setHasAttempted] = useState<boolean>(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [showPartyAnimation, setShowPartyAnimation] = useState<boolean>(false);

  useEffect(() => {
    const loadQuestion = async () => {
      try {
        setIsLoading(true);
        setError('');
        const questionData: TodayQuestionResponse = await getTodayQuestion();
        setQuestion(questionData.question);
        setHasAttempted(questionData.hasAttempted);
        setSubmission(questionData.submission);
        if (questionData.hasAttempted && questionData.submission) {
          setSelectedAnswer(questionData.submission.submittedAnswer);
        } else {
          setStartTime(Date.now());
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load question';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestion();
  }, []);

  useEffect(() => {
    if (startTime && !hasAttempted) {
      const timer = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [startTime, hasAttempted]);

  const handleSubmitAnswer = async (): Promise<void> => {
    if (!question || !selectedAnswer.trim()) {
      setError('Please select or enter an answer');
      return;
    }

    if (hasAttempted) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const result = await submitAnswer(question.id, selectedAnswer.trim(), timeSpent);
      setSubmission({
        id: result.submission.id,
        submittedAnswer: selectedAnswer.trim(),
        isCorrect: result.submission.isCorrect,
        pointsEarned: result.submission.pointsEarned,
        correctAnswer: result.submission.correctAnswer,
        explanation: result.submission.explanation,
      });
      setHasAttempted(true);
      if (result.submission.isCorrect) {
        setShowPartyAnimation(true);
        setTimeout(() => {
          setShowPartyAnimation(false);
        }, 2000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit answer';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = (): void => {
    navigate('/dashboard');
  };

  const handleLogout = (): void => {
    logout();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="quiz-container">
        <LoadingSpinner containerClassName="quiz-loading" />
      </div>
    );
  }

  return (
    <div className="quiz-container">
      {showPartyAnimation && (
        <div className="quiz-party-overlay" aria-hidden="true">
          <img src={partyGif} alt="Celebration" className="quiz-party-animation" />
        </div>
      )}
      <header className="quiz-header-shell">
        <div className="quiz-header-content">
          <button className="quiz-back-button" onClick={handleBack}>
            Back
          </button>
          <div className="quiz-header-actions">
            <button className="quiz-logout-button" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className={`quiz-main ${!question ? 'quiz-main-centered' : ''}`}>
        {!question && !isLoading && (
          <div className="quiz-content quiz-content-centered">
            <div className="quiz-empty-card">
              <div className="quiz-empty-icon">📝</div>
              <h2 className="quiz-empty-title">No Question Available</h2>
              <p className="quiz-empty-message">
                {error || "There's no question scheduled for today. Check back tomorrow!"}
              </p>
            </div>
          </div>
        )}

        {question && (
          <div className="quiz-content">
            <div className="quiz-card">
              <div className="quiz-question-section">
                <p className="quiz-question-text">{question.questionText}</p>
                <div className="quiz-meta">
                  <span className="quiz-category">{question.category}</span>
                  <span className="quiz-difficulty">{question.difficulty}</span>
                  <span className="quiz-points">{question.points} pts</span>
                </div>
              </div>

              {!hasAttempted ? (
                <>
                  {question.questionType === 'MCQ' && question.options ? (
                    <div className="quiz-options">
                      {question.options.map((option, index) => (
                        <button
                          key={index}
                          className={`quiz-option ${selectedAnswer === option ? 'quiz-option-selected' : ''}`}
                          onClick={() => setSelectedAnswer(option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="quiz-input-container">
                      <textarea
                        className="quiz-input"
                        value={selectedAnswer}
                        onChange={(e) => setSelectedAnswer(e.target.value)}
                        placeholder="Enter your answer..."
                        rows={4}
                      />
                    </div>
                  )}

                  {error && (
                    <div className="quiz-error">
                      {error}
                    </div>
                  )}

                  <div className="quiz-actions">
                    <button
                      className="quiz-submit-button"
                      onClick={handleSubmitAnswer}
                      disabled={isSubmitting || !selectedAnswer.trim()}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Answer'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="quiz-result">
                  <div className={`quiz-result-badge ${submission?.isCorrect ? 'quiz-result-correct' : 'quiz-result-incorrect'}`}>
                    {submission?.isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                  </div>
                  
                  <div className="quiz-result-details">
                    <p className="quiz-result-answer">
                      <strong>Your answer:</strong> {submission?.submittedAnswer}
                    </p>
                    {submission?.correctAnswer && (
                      <p className="quiz-result-correct-answer">
                        <strong>Correct answer:</strong> {submission.correctAnswer}
                      </p>
                    )}
                    {submission?.explanation && (
                      <p className="quiz-result-explanation">
                        <strong>Explanation:</strong> {submission.explanation}
                      </p>
                    )}
                    {submission?.isCorrect && (
                      <p className="quiz-result-points">
                        Points earned: <strong>{submission.pointsEarned || 0}</strong>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

