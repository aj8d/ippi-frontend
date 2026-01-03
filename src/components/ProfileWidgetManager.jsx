/**
 * ProfileWidgetManager.jsx - プロフィールウィジェット管理コンポーネント
 *
 * 📚 このコンポーネントの役割：
 * - Swapyを使った動的ウィジェットグリッドの管理
 * - ウィジェットの追加・削除・並び替え
 */

import { useState, useEffect, useRef, useCallback } from 'react';
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

/**
 * ウィジェット追加ボタン（サイドバー用）
 */
export function WidgetAddButton({ onAddRow }) {
  const [showAddMenu, setShowAddMenu] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowAddMenu(!showAddMenu)}
        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
      >
        <Plus className="w-5 h-5" />
        カスタム要素を追加
      </button>

      {showAddMenu && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setShowAddMenu(false)} />
          <div className="absolute left-0 mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 z-[101]">
            <button
              onClick={() => {
                onAddRow(1);
                setShowAddMenu(false);
              }}
              className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-900 dark:text-white"
            >
              1列（1要素）
            </button>
            <button
              onClick={() => {
                onAddRow('2-1');
                setShowAddMenu(false);
              }}
              className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-900 dark:text-white"
            >
              2列（2/3 + 1/3）
            </button>
            <button
              onClick={() => {
                onAddRow('1-2');
                setShowAddMenu(false);
              }}
              className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-900 dark:text-white"
            >
              2列（1/3 + 2/3）
            </button>
            <button
              onClick={() => {
                onAddRow(3);
                setShowAddMenu(false);
              }}
              className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-900 dark:text-white"
            >
              3列（3要素）
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * プロフィールウィジェットマネージャー
 */
export default function ProfileWidgetManager({ customId, token, isOwnProfile, onAddRowCallback }) {
  // ローカルストレージキー（データ構造変更のため v2 に更新）
  const STORAGE_KEY = `profile_widgets_v2_${customId}`;

  // ローカルストレージから初期データを読み込み
  const [rows, setRows] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];

      const data = JSON.parse(saved);

      // データがフラット配列かチェック
      if (Array.isArray(data)) {
        // 各アイテムがwidgetプロパティを持つ（フラット構造）かチェック
        const isFlat = data.every((item) => item && typeof item === 'object' && 'id' in item && 'type' in item);

        if (isFlat) {
          return data;
        }
      }

      // 古いデータ構造の場合は空配列を返す
      console.warn('古いデータ構造を検出しました。新しい構造に移行してください。');
      return [];
    } catch (e) {
      console.error('ウィジェット読み込みエラー:', e);
      return [];
    }
  });

  const [stats, setStats] = useState(null);
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

  // Swapyのonswapイベントハンドラ
  const handleSwap = useCallback((event) => {
    const { data } = event;
    if (!data) return;

    // data.arrayは新しい順序を表す配列 [{slotId, itemId}, ...]
    const newOrder = data.array.map((slot) => slot.itemId);

    setRows((prevRows) => {
      const reordered = newOrder.map((itemId) => prevRows.find((widget) => widget.id === itemId)).filter(Boolean);
      return reordered;
    });
  }, []);

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

    // Swapイベントを監視
    swapy.onSwap(handleSwap);

    swapyRef.current = swapy;

    return () => {
      if (swapyRef.current) {
        swapyRef.current.destroy();
      }
    };
  }, [isOwnProfile, rows, handleSwap]);

  // ウィジェットを追加（列数分または特定パターン）
  const addRow = useCallback((pattern) => {
    let newWidgets;

    if (pattern === 1) {
      // 1列（全幅）
      newWidgets = [
        {
          id: `widget-${Date.now()}-0`,
          type: WIDGET_TYPES.EMPTY,
          customText: '',
          width: 'full',
        },
      ];
    } else if (pattern === '2-1') {
      // 2/3 + 1/3
      newWidgets = [
        {
          id: `widget-${Date.now()}-0`,
          type: WIDGET_TYPES.EMPTY,
          customText: '',
          width: 'two-thirds',
        },
        {
          id: `widget-${Date.now()}-1`,
          type: WIDGET_TYPES.EMPTY,
          customText: '',
          width: 'one-third',
        },
      ];
    } else if (pattern === '1-2') {
      // 1/3 + 2/3
      newWidgets = [
        {
          id: `widget-${Date.now()}-0`,
          type: WIDGET_TYPES.EMPTY,
          customText: '',
          width: 'one-third',
        },
        {
          id: `widget-${Date.now()}-1`,
          type: WIDGET_TYPES.EMPTY,
          customText: '',
          width: 'two-thirds',
        },
      ];
    } else if (pattern === 3) {
      // 3列（各1/3）
      newWidgets = Array.from({ length: 3 }, (_, i) => ({
        id: `widget-${Date.now()}-${i}`,
        type: WIDGET_TYPES.EMPTY,
        customText: '',
        width: 'third',
      }));
    } else {
      // デフォルト
      newWidgets = [];
    }

    setRows((prevRows) => [...prevRows, ...newWidgets]);
  }, []);

  // 外部からのコールバック登録
  useEffect(() => {
    if (onAddRowCallback) {
      onAddRowCallback(addRow);
    }
  }, [addRow, onAddRowCallback]);

  // ウィジェットタイプを変更
  const handleTypeChange = (widgetId, newType) => {
    setRows(rows.map((widget) => (widget.id === widgetId ? { ...widget, type: newType } : widget)));
  };

  // カスタムテキストを変更
  const handleTextChange = (widgetId, text) => {
    setRows(rows.map((widget) => (widget.id === widgetId ? { ...widget, customText: text } : widget)));
  };

  // ウィジェットを削除
  const handleDelete = (widgetId) => {
    setRows(rows.filter((widget) => widget.id !== widgetId));
  };

  // ウィジェットがない場合は何も表示しない
  if (rows.length === 0 && !isOwnProfile) {
    return null;
  }

  return (
    <div className="mt-8">
      {rows.length === 0 && isOwnProfile ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
          <Plus className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">「要素を追加」ボタンからウィジェットを追加してください</p>
        </div>
      ) : rows.length > 0 ? (
        <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 select-none">
          {rows.map((widget) => (
            <div
              key={widget.id}
              data-swapy-slot={widget.id}
              className={
                widget.width === 'full'
                  ? 'md:col-span-2 lg:col-span-3 select-none'
                  : widget.width === 'two-thirds'
                  ? 'md:col-span-2 lg:col-span-2 select-none'
                  : widget.width === 'one-third'
                  ? 'md:col-span-2 lg:col-span-1 select-none'
                  : 'lg:col-span-1 select-none'
              }
            >
              <div data-swapy-item={widget.id} className="select-none">
                <Widget
                  widget={widget}
                  stats={stats}
                  onTypeChange={handleTypeChange}
                  onTextChange={handleTextChange}
                  onDelete={handleDelete}
                  isOwnProfile={isOwnProfile}
                />
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
