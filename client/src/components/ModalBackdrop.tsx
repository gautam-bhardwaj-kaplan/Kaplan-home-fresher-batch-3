import { type ModalBackdropProps } from '../types';

export const ModalBackdrop = ({ isOpen, onClose, children }: ModalBackdropProps) => {
  if (!isOpen) return null;

  return (
    <div 
      className="admin-modal-backdrop" 
      role="dialog" 
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {children}
    </div>
  );
};
