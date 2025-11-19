import { type PaginationProps } from '../types';

export const Pagination = ({ currentPage, totalPages, onPrevious, onNext }: PaginationProps) => (
  <div className="admin-pagination">
    <button 
      className="admin-action-button" 
      disabled={currentPage <= 1} 
      onClick={onPrevious}
      aria-label="Previous page"
    >
      Prev
    </button>
    <div style={{ alignSelf: 'center' }}>{currentPage} / {totalPages}</div>
    <button 
      className="admin-action-button" 
      disabled={currentPage >= totalPages} 
      onClick={onNext}
      aria-label="Next page"
    >
      Next
    </button>
  </div>
);
