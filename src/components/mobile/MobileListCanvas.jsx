/**
 * モバイル用リストキャンバス
 *
 * - ウィジェットを縦並びリストで表示
 * - スワイプで削除
 * - タイマー設定を受け取る
 */

import { memo, useCallback } from 'react';
import { X } from 'lucide-react';
import TimerWidget from '../widgets/TimerWidget';
import TodoWidget from '../widgets/TodoWidget';
import StreakWidget from '../widgets/StreakWidget';
import StickyNote from '../widgets/StickyNote';
import ImageWidget from '../widgets/ImageWidget';

/**
 * モバイル用リストキャンバス
 */
function MobileListCanvas({ widgets, setWidgets, timerSettings }) {
  /**
   * ウィジェットを削除
   */
  const handleDelete = useCallback(
    (id) => {
      setWidgets((prev) => prev.filter((widget) => widget.id !== id));
    },
    [setWidgets]
  );

  /**
   * ウィジェットのデータを更新
   */
  const handleUpdateData = useCallback(
    (id, newData) => {
      setWidgets((prev) =>
        prev.map((widget) => (widget.id === id ? { ...widget, data: { ...widget.data, ...newData } } : widget))
      );
    },
    [setWidgets]
  );

  /**
   * ウィジェットの種類に応じてコンポーネントを返す
   */
  const renderWidget = (widget) => {
    switch (widget.type) {
      case 'timer':
        return <TimerWidget settings={timerSettings} />;
      case 'todo':
        return <TodoWidget />;
      case 'streak':
        return <StreakWidget />;
      case 'sticky':
        return <StickyNote data={widget.data} onUpdate={(newData) => handleUpdateData(widget.id, newData)} />;
      case 'image':
        return <ImageWidget data={widget.data} onUpdate={(newData) => handleUpdateData(widget.id, newData)} />;
      default:
        return <div className="p-4 text-gray-500">Unknown widget</div>;
    }
  };

  /**
   * ウィジェットタイプの日本語名を取得
   */
  const getWidgetLabel = (type) => {
    const labels = {
      timer: 'タイマー',
      todo: 'TODO',
      streak: 'ストリーク',
      sticky: '付箋',
      image: '画像',
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-32">
      {/* ウィジェットがない時のガイド */}
      {widgets.length === 0 && (
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <div className="text-center text-gray-400 px-8">
            <p className="text-lg mb-2">キャンバスは空です</p>
            <p className="text-sm">右下の＋ボタンからウィジェットを追加してください</p>
          </div>
        </div>
      )}

      {/* ウィジェットリスト */}
      <div className="p-4 space-y-4">
        {widgets.map((widget) => (
          <div key={widget.id} className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* ヘッダー */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-600 uppercase">{getWidgetLabel(widget.type)}</span>
              <button
                onClick={() => handleDelete(widget.id)}
                className="p-1.5 hover:bg-red-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
              </button>
            </div>

            {/* コンテンツ */}
            <div className="min-h-[200px]">{renderWidget(widget)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(MobileListCanvas);
