export const formatYMD = (date: string | Date | undefined | null): string => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
};

export const formatDateShort = (date: string | Date | undefined | null): string => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const getTomorrowYMD = (): string => {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  return t.toISOString().split('T')[0];
};

export const getDateStatus = (scheduledDate: string | undefined | null): 'scheduled' | 'published' | 'inactive' => {
  const today = new Date().toISOString().split('T')[0];
  const sched = scheduledDate ? new Date(scheduledDate).toISOString().split('T')[0] : '';
  if (!sched) return 'inactive';
  return sched > today ? 'scheduled' : 'published';
};

export const getHeatmapColor = (accuracy: number): string => {
  if (accuracy >= 80) return '#10b981';
  if (accuracy >= 60) return '#3b82f6';
  if (accuracy >= 40) return '#f59e0b';
  if (accuracy >= 20) return '#ef4444';
  return '#9ca3af';
};

export const CHART_COLORS = ['#4F75FE', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
