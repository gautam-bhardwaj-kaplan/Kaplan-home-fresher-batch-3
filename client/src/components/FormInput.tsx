import { type InputHTMLAttributes } from 'react';

interface FormInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  containerClassName?: string;
}

export const FormInput = ({
  label,
  required = false,
  hint,
  error,
  containerClassName,
  id,
  ...inputProps
}: FormInputProps) => {
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={containerClassName || 'auth-form-group'}>
      <label htmlFor={inputId} className="auth-label">
        {label} {required && <span className="required-asterisk">*</span>}
      </label>
      <input
        id={inputId}
        className="auth-input"
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={hint ? `${inputId}-hint` : undefined}
        {...inputProps}
      />
      {hint && !error && (
        <small className="auth-hint" id={`${inputId}-hint`}>
          {hint}
        </small>
      )}
      {error && (
        <small className="auth-error-text" role="alert">
          {error}
        </small>
      )}
    </div>
  );
};

