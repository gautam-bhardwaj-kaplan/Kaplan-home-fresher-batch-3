import { useState, type FormEvent, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FormInput, LoadingButton } from '../components';
import '../styles/AuthPage.css';

export const SignupPage = () => {
  const navigate = useNavigate();
  const { signup, isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const isButtonLoading = isSubmitting || authLoading;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setPassword('');
      setConfirmPassword('');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsSubmitting(true);

    try {
      await signup({ name, email, password });
      setError('');
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Start your learning journey today</p>

        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <FormInput
            label="Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value.replace(/\d+/g, ''))}
            placeholder="Enter your name"
            required
            minLength={2}
            maxLength={50}
            pattern="^[^0-9]*$"
            title="Name cannot contain numbers"
            disabled={isSubmitting || authLoading}
          />

          <FormInput
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            disabled={isSubmitting || authLoading}
          />

          <FormInput
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            required
            minLength={8}
            hint="Must contain uppercase, lowercase, number, and special character"
            disabled={isSubmitting || authLoading}
          />

          <FormInput
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            required
            disabled={isSubmitting || authLoading}
          />

          <LoadingButton
            isLoading={isButtonLoading}
            loadingText="Creating account"
            disabled={isButtonLoading}
          >
            Sign up
          </LoadingButton>
        </form>

        <p className="auth-footer-text">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};