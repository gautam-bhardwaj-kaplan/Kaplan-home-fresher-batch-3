import { type ButtonHTMLAttributes } from 'react';

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export const LoadingButton = ({
  isLoading = false,
  loadingText,
  children,
  disabled,
  className = 'auth-primary-button',
  ...buttonProps
}: LoadingButtonProps) => {
  return (
    <button
      type="submit"
      className={className}
      disabled={disabled || isLoading}
      {...buttonProps}
    >
      {isLoading ? (
        <>
          <span className="auth-button-spinner" role="status" aria-label={loadingText || 'Loading'} />
          {loadingText && <span>{loadingText}</span>}
        </>
      ) : (
        children
      )}
    </button>
  );
};

