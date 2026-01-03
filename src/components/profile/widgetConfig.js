import { Flame, Clock, CheckCircle, Calendar, Type, TrendingUp } from 'lucide-react';
import { WIDGET_TYPES } from './widgetUtils';

// ウィジェットタイプの表示情報
export const WIDGET_INFO = {
  [WIDGET_TYPES.EMPTY]: { label: '空', icon: null },
  [WIDGET_TYPES.STREAK]: {
    label: '連続作業日数',
    icon: Flame,
    color: 'from-orange-50 to-orange-100',
    textColor: 'text-orange-600 dark:text-orange-400',
  },
  [WIDGET_TYPES.TOTAL_TIME]: {
    label: '累計作業時間',
    icon: Clock,
    color: 'from-blue-50 to-blue-100',
    textColor: 'text-blue-600 dark:text-blue-400',
  },
  [WIDGET_TYPES.COMPLETED_TODOS]: {
    label: '完了Todo数',
    icon: CheckCircle,
    color: 'from-green-50 to-green-100',
    textColor: 'text-green-600 dark:text-green-400',
  },
  [WIDGET_TYPES.WORK_DAYS]: {
    label: '累計作業日数',
    icon: Calendar,
    color: 'from-purple-50 to-purple-100',
    textColor: 'text-purple-600 dark:text-purple-400',
  },
  [WIDGET_TYPES.WEEKLY_TIME]: {
    label: '今週の作業時間',
    icon: TrendingUp,
    color: 'from-pink-50 to-pink-100',
    textColor: 'text-pink-600 dark:text-pink-400',
  },
  [WIDGET_TYPES.TEXT]: {
    label: 'カスタムテキスト',
    icon: Type,
    color: 'from-gray-50 to-gray-100',
    textColor: 'text-gray-600 dark:text-gray-400',
  },
};
