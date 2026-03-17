export const sd_translateGoal = (goal: string): string => {
  const map: Record<string, string> = {
    'cutting': 'Сушка',
    'bulking': 'Набор',
    'maintenance': 'Поддержание',
  };
  return map[goal] || goal;
};

export const sd_translateStatus = (status: string): string => {
  const map: Record<string, string> = {
    'active': 'Активен',
    'paused': 'Пауза',
    'archived': 'Архив',
  };
  return map[status] || status;
};

export const sd_getStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    'active': 'var(--success)',
    'paused': '#F59E0B', // Orange
    'archived': '#6B7280', // Gray
  };
  return map[status] || 'var(--text-muted)';
};

export const sd_getStatusBg = (status: string): string => {
  const map: Record<string, string> = {
    'active': 'var(--success-light)',
    'paused': '#FEF3C7', // Orange light
    'archived': '#F3F4F6', // Gray light
  };
  return map[status] || 'var(--border)';
};
