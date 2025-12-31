/**
 * ProfileWidgetManager.jsx - プロフィールウィジェット管理コンポーネント
 *
 * 📚 このコンポーネントの役割：
 * - Swapyを使った動的ウィジェットグリッドの管理
 * - ウィジェットの追加・削除・並び替え
 */

import { useState, useEffect, useRef } from 'react';
import { createSwapy } from 'swapy';
import { Plus, X, Flame, Clock, CheckCircle, Calendar, Type, TrendingUp } from 'lucide-react';
import { API_ENDPOINTS } from '../config';

// ウィジェットタイプ定義
const WIDGET_TYPES = {
  EMPTY: 'empty',
  STREAK: 'streak',
  TOTAL_TIME: 'totalTime',
  COMPLETED_TODOS: 'completedTodos',
  WORK_DAYS: 'workDays',
  WEEKLY_TIME: 'weeklyTime',
  TEXT: 'text',
};

// ウィジェットタイプの表示情報
const WIDGET_INFO = {
  [WIDGET_TYPES.EMPTY]: { label: '空', icon: null },
  [WIDGET_TYPES.STREAK]: { label: '連続作業日数', icon: Flame, color: 'from-orange-500 to-orange-600' },
  [WIDGET_TYPES.TOTAL_TIME]: { label: '累計作業時間', icon: Clock, color: 'from-blue-500 to-blue-600' },
  [WIDGET_TYPES.COMPLETED_TODOS]: { label: '完了Todo数', icon: CheckCircle, color: 'from-green-500 to-green-600' },
  [WIDGET_TYPES.WORK_DAYS]: { label: '累計作業日数', icon: Calendar, color: 'from-purple-500 to-purple-600' },
  [WIDGET_TYPES.WEEKLY_TIME]: { label: '今週の作業時間', icon: TrendingUp, color: 'from-pink-500 to-pink-600' },
  [WIDGET_TYPES.TEXT]: { label: 'カスタムテキスト', icon: Type, color: 'from-gray-500 to-gray-600' },
};

/**
 * 秒数を読みやすい形式に変換
 */
function formatDuration(seconds) {
  if (!seconds || seconds === 0) return '0分';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}時間${minutes > 0 ? ` ${minutes}分` : ''}`;
  }
  return `${minutes}分`;
}

/**
 * ウィジェットコンポーネント
 */
function Widget({ widget, stats, onTypeChange, onTextChange, onDelete, isOwnProfile }) {
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
      <div className={`bg-gradient-to-br ${info.color} rounded-2xl p-4 text-white shadow-lg relative group`}>
        <div className="flex items-center gap-2 mb-2">
          {Icon && <Icon className="w-5 h-5" />}
          {isOwnProfile && (
            <select
              value={widget.type}
              onChange={(e) => onTypeChange(widget.id, e.target.value)}
              className="text-sm bg-white/20 backdrop-blur-sm rounded px-2 py-1 border-0 text-white"
            >
              {Object.entries(WIDGET_INFO).map(([type, info]) => (
                <option key={type} value={type} className="text-gray-900">
                  {info.label}
                </option>
              ))}
            </select>
          )}
          {!isOwnProfile && <span className="text-sm">{info.label}</span>}
        </div>
        {isOwnProfile ? (
          <textarea
            value={widget.customText || ''}
            onChange={(e) => onTextChange(widget.id, e.target.value)}
            placeholder="テキストを入力..."
            className="w-full bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 text-white placeholder-white/60 border-0 resize-none"
            rows={3}
          />
        ) : (
          <div className="text-base whitespace-pre-wrap">{widget.customText || ''}</div>
        )}
        {isOwnProfile && (
          <button
            onClick={() => onDelete(widget.id)}
            className="absolute top-2 right-2 p-1 rounded-lg bg-white/20 hover:bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity"
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
    <div className={`bg-gradient-to-br ${info.color} rounded-2xl p-4 text-white shadow-lg relative group`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5" />}
          {isOwnProfile ? (
            <select
              value={widget.type}
              onChange={(e) => onTypeChange(widget.id, e.target.value)}
              className="text-xs bg-white/20 backdrop-blur-sm rounded px-2 py-0.5 border-0 text-white"
            >
              {Object.entries(WIDGET_INFO).map(([type, info]) => (
                <option key={type} value={type} className="text-gray-900">
                  {info.label}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-xs opacity-90">{info.label}</span>
          )}
        </div>
        {isOwnProfile && (
          <button
            onClick={() => onDelete(widget.id)}
            className="p-1 rounded-lg bg-white/20 hover:bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="text-3xl font-bold">
        {value}
        <span className="text-lg font-normal ml-1">{unit}</span>
      </div>
      {subtitle && <div className="text-sm opacity-80 mt-1">{subtitle}</div>}
    </div>
  );
}

/**
 * プロフィールウィジェットマネージャー
 */
export default function ProfileWidgetManager({ customId, token, isOwnProfile }) {
  // ローカルストレージキー
  const STORAGE_KEY = `profile_widgets_${customId}`;

  // ローカルストレージから初期データを読み込み
  const [rows, setRows] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('ウィジェット読み込みエラー:', e);
      return [];
    }
  });

  const [stats, setStats] = useState(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const swapyRef = useRef(null);
  const containerRef = useRef(null);

  // 統計データを取得
  useEffect(() => {
    if (!customId) return;

    const fetchStats = async () => {
      try {
        const headers = token
          ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
          : { 'Content-Type': 'application/json' };

        const response = await fetch(API_ENDPOINTS.USER_STATS.BY_CUSTOM_ID(customId), { headers });

        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (err) {
        console.error('統計取得エラー:', err);
      }
    };

    fetchStats();
  }, [customId, token]);

  // ウィジェットをローカルストレージに保存
  useEffect(() => {
    if (rows.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
    }
  }, [rows, STORAGE_KEY]);

  // Swapyの初期化
  useEffect(() => {
    if (!isOwnProfile || !containerRef.current) return;

    // 既存のSwapyインスタンスを破棄
    if (swapyRef.current) {
      swapyRef.current.destroy();
    }

    // 新しいSwapyインスタンスを作成
    const swapy = createSwapy(containerRef.current, {
      animation: 'dynamic',
    });

    swapyRef.current = swapy;

    return () => {
      if (swapyRef.current) {
        swapyRef.current.destroy();
      }
    };
  }, [isOwnProfile, rows]);

  // 行を追加
  const addRow = (columns) => {
    const newRow = {
      id: `row-${Date.now()}`,
      columns,
      widgets: Array.from({ length: columns }, (_, i) => ({
        id: `widget-${Date.now()}-${i}`,
        type: WIDGET_TYPES.EMPTY,
        customText: '',
      })),
    };
    setRows([...rows, newRow]);
    setShowAddMenu(false);
  };

  // ウィジェットタイプを変更
  const handleTypeChange = (widgetId, newType) => {
    setRows(
      rows.map((row) => ({
        ...row,
        widgets: row.widgets.map((w) => (w.id === widgetId ? { ...w, type: newType } : w)),
      }))
    );
  };

  // カスタムテキストを変更
  const handleTextChange = (widgetId, text) => {
    setRows(
      rows.map((row) => ({
        ...row,
        widgets: row.widgets.map((w) => (w.id === widgetId ? { ...w, customText: text } : w)),
      }))
    );
  };

  // ウィジェットを削除
  const handleDelete = (widgetId) => {
    // ウィジェットが属する行を探して、その行を削除
    setRows(rows.filter((row) => !row.widgets.some((w) => w.id === widgetId)));
  };

  // ウィジェットがない場合は何も表示しない
  if (rows.length === 0 && !isOwnProfile) {
    return null;
  }

  return (
    <div className="mt-8">
      {isOwnProfile && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">カスタムウィジェット</h3>
          <div className="relative">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              要素を追加
            </button>

            {showAddMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 z-10">
                <button
                  onClick={() => addRow(1)}
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                >
                  1列（1要素）
                </button>
                <button
                  onClick={() => addRow(2)}
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                >
                  2列（2要素）
                </button>
                <button
                  onClick={() => addRow(3)}
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                >
                  3列（3要素）
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {rows.length === 0 && isOwnProfile ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
          <Plus className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">「要素を追加」ボタンからウィジェットを追加してください</p>
        </div>
      ) : rows.length > 0 ? (
        <div ref={containerRef} className="space-y-4">
          {rows.map((row) => (
            <div key={row.id} data-swapy-slot={row.id}>
              <div
                data-swapy-item={row.id}
                className={`grid gap-4 ${
                  row.columns === 1
                    ? 'grid-cols-1'
                    : row.columns === 2
                    ? 'grid-cols-1 md:grid-cols-2'
                    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                }`}
              >
                {row.widgets.map((widget) => (
                  <Widget
                    key={widget.id}
                    widget={widget}
                    stats={stats}
                    onTypeChange={handleTypeChange}
                    onTextChange={handleTextChange}
                    onDelete={handleDelete}
                    isOwnProfile={isOwnProfile}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
