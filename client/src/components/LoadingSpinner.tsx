import { Oval } from 'react-loader-spinner';
import '../styles/ProtectedRoute.css';

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
}

export const LoadingSpinner = ({ size = 48, color = '#4F75FE' }: LoadingSpinnerProps) => (
  <div className="loading-container">
    <div className="loading-spinner" role="status" aria-live="polite" aria-busy="true">
      <Oval
        height={size}
        width={size}
        color={color}
        secondaryColor="#bdbdbd"
        strokeWidth={4}
        strokeWidthSecondary={4}
        ariaLabel="loading"
        visible
      />
    </div>
  </div>
);
