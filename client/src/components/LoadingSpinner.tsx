import { Oval } from 'react-loader-spinner';
import '../styles/ProtectedRoute.css';
import type { LoadingSpinnerProps } from '../types';

export const LoadingSpinner = ({ 
  size = 56, 
  color = '#1f2937',
  secondaryColor = '#9ca3af',
  containerClassName
}: LoadingSpinnerProps) => (
  <div className={containerClassName || "loading-container"}>
    <div className="loading-spinner" role="status" aria-live="polite" aria-busy="true">
      <Oval
        height={size}
        width={size}
        color={color}
        secondaryColor={secondaryColor}
        strokeWidth={4}
        strokeWidthSecondary={4}
        ariaLabel="loading"
        visible
      />
    </div>
  </div>
);
