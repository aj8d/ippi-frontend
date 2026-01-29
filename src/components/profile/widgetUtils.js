// ウィジェットタイプ定義
export const WIDGET_TYPES = {
  EMPTY: 'empty',
  STREAK: 'streak',
  TOTAL_TIME: 'totalTime',
  COMPLETED_TODOS: 'completedTodos',
  WORK_DAYS: 'workDays',
  WEEKLY_TIME: 'weeklyTime',
  TEXT: 'text',
  IMAGE: 'image',
};

export function formatDuration(seconds) {
  if (!seconds || seconds === 0) return '0分';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}時間${minutes > 0 ? ` ${minutes}分` : ''}`;
  }
  return `${minutes}分`;
}
