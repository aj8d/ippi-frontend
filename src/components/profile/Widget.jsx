import { X } from 'lucide-react';
import { WIDGET_TYPES } from './widgetUtils';
import { WIDGET_INFO } from './widgetConfig';
import { formatDuration } from './widgetUtils';

/**
 * ウィジェットコンポーネント
 */
export default function Widget({ widget, stats, onTypeChange, onTextChange, onDelete, isOwnProfile }) {
  const info = WIDGET_INFO[widget.type];
  const Icon = info?.icon;

  // 空ウィジェット
  if (widget.type === WIDGET_TYPES.EMPTY) {
    // 他ユーザーの場合は何も表示しない
    if (!isOwnProfile) {
      return (
        <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-4 h-full min-h-[120px] flex items-center justify-center"></div>
      );
    }

    // 自分のプロフィールの場合はドロップダウンを表示
    return (
      <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-4 h-full min-h-[120px] flex items-center justify-center relative group">
        <select
          value={widget.type}
          onChange={(e) => onTypeChange(widget.id, e.target.value)}
          className="w-full max-w-[200px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
        >
          <option value={WIDGET_TYPES.EMPTY}>内容を選択...</option>
          {Object.entries(WIDGET_INFO).map(([type, info]) => {
            if (type !== WIDGET_TYPES.EMPTY) {
              return (
                <option key={type} value={type}>
                  {info.label}
                </option>
              );
            }
            return null;
          })}
        </select>
        <button
          onClick={() => onDelete(widget.id)}
          className="absolute top-2 right-2 p-1 rounded-lg bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // テキストウィジェット
  if (widget.type === WIDGET_TYPES.TEXT) {
    return (
      <div
        className={`bg-gradient-to-br ${info.color} dark:from-gray-900/20 dark:to-gray-800/20 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 relative group`}
      >
        <div className="flex items-center gap-2 mb-2">
          {Icon && <Icon className={`w-5 h-5 ${info.textColor}`} />}
          {isOwnProfile ? (
            <select
              value={widget.type}
              onChange={(e) => onTypeChange(widget.id, e.target.value)}
              className="text-sm bg-white dark:bg-gray-800 rounded px-2 py-1 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            >
              {Object.entries(WIDGET_INFO).map(([type, info]) => (
                <option key={type} value={type}>
                  {info.label}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-sm text-gray-600 dark:text-gray-400">{info.label}</span>
          )}
        </div>
        {isOwnProfile ? (
          <textarea
            value={widget.customText || ''}
            onChange={(e) => onTextChange(widget.id, e.target.value)}
            placeholder="テキストを入力..."
            className="w-full bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 border border-gray-200 dark:border-gray-700 resize-none"
            rows={3}
          />
        ) : (
          <div className="text-base whitespace-pre-wrap text-gray-700 dark:text-gray-300">
            {widget.customText || ''}
          </div>
        )}
        {isOwnProfile && (
          <button
            onClick={() => onDelete(widget.id)}
            className="absolute top-2 right-2 p-1 rounded-lg bg-red-500 text-white hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  // 統計ウィジェット
  let value = '0';
  let unit = '';
  let subtitle = '';

  switch (widget.type) {
    case WIDGET_TYPES.STREAK:
      value = stats?.currentStreak || 0;
      unit = '日';
      subtitle = `最長: ${stats?.longestStreak || 0}日`;
      break;
    case WIDGET_TYPES.TOTAL_TIME:
      value = Math.floor((stats?.totalWorkHours || 0) * 10) / 10;
      unit = '時間';
      subtitle = formatDuration(stats?.totalWorkSeconds || 0);
      break;
    case WIDGET_TYPES.COMPLETED_TODOS:
      value = stats?.completedTodos || 0;
      unit = '件';
      break;
    case WIDGET_TYPES.WORK_DAYS:
      value = stats?.totalWorkDays || 0;
      unit = '日';
      break;
    case WIDGET_TYPES.WEEKLY_TIME:
      value = Math.floor((stats?.weeklyWorkHours || 0) * 10) / 10;
      unit = '時間';
      subtitle = formatDuration(stats?.weeklyWorkSeconds || 0);
      break;
  }

  return (
    <div
      className={`bg-gradient-to-br ${info.color} dark:from-${info.color.split('-')[1]}-900/20 dark:to-${
        info.color.split('-')[1]
      }-800/20 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 relative group`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          {Icon && <Icon className={`w-5 h-5 ${info.textColor.split(' ')[0]}`} />}
          {isOwnProfile ? (
            <select
              value={widget.type}
              onChange={(e) => onTypeChange(widget.id, e.target.value)}
              className="text-xs bg-white dark:bg-gray-800 rounded px-2 py-0.5 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            >
              {Object.entries(WIDGET_INFO).map(([type, info]) => (
                <option key={type} value={type}>
                  {info.label}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-xs text-gray-600 dark:text-gray-400">{info.label}</span>
          )}
        </div>
        {isOwnProfile && (
          <button
            onClick={() => onDelete(widget.id)}
            className="p-1 rounded-lg bg-red-500 text-white hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className={`text-3xl font-bold ${info.textColor}`}>
        {value}
        <span className="text-lg font-normal ml-1">{unit}</span>
      </div>
      {subtitle && <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">{subtitle}</div>}
    </div>
  );
}
