/**
 * フローティング追加ボタン
 *
 * - モバイルでウィジェット追加用
 * - 右下に固定表示
 * - クリックでメニュー開閉
 */

import { useState } from 'react';
import { Plus, X, Timer, CheckSquare, Flame, StickyNote, Image } from 'lucide-react';

const WIDGET_OPTIONS = [
  { id: 'timer', label: 'タイマー', icon: Timer, unique: true, defaultSize: { width: 300, height: 380 } },
  { id: 'todo', label: 'TODO', icon: CheckSquare, unique: true, defaultSize: { width: 300, height: 400 } },
  { id: 'streak', label: 'ストリーク', icon: Flame, unique: true, defaultSize: { width: 300, height: 380 } },
  { id: 'sticky', label: '付箋', icon: StickyNote, unique: false, defaultSize: { width: 250, height: 300 } },
  { id: 'image', label: '画像', icon: Image, unique: false, defaultSize: { width: 300, height: 300 } },
];

export default function FloatingAddButton({ activeWidgets = [], onAddWidget, onRemoveWidget }) {
  const [isOpen, setIsOpen] = useState(false);

  // ウィジェットが追加済みかチェック
  const isWidgetActive = (type) => {
    return activeWidgets.some((w) => w.type === type);
  };

  // ウィジェットクリック処理
  const handleWidgetClick = (widget) => {
    if (widget.unique) {
      // 一意ウィジェット：トグル
      if (isWidgetActive(widget.id)) {
        onRemoveWidget?.(widget.id);
      } else {
        onAddWidget?.(widget.id, widget.defaultSize);
      }
    } else {
      // 複数配置可能ウィジェット：追加
      onAddWidget?.(widget.id, widget.defaultSize);
    }
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-20 right-4 z-40 md:hidden">
      {/* メニュー */}
      {isOpen && (
        <>
          {/* オーバーレイ */}
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />

          {/* ウィジェットメニュー */}
          <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-48 z-40 animate-scale-up">
            {WIDGET_OPTIONS.map((widget) => {
              const Icon = widget.icon;
              const isActive = widget.unique && isWidgetActive(widget.id);

              return (
                <button
                  key={widget.id}
                  onClick={() => handleWidgetClick(widget)}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                    isActive ? 'bg-orange-50 text-orange-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{widget.label}</span>
                  {isActive && <span className="ml-auto text-xs text-orange-500">追加済み</span>}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* フローティングボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isOpen ? 'bg-gray-600 rotate-45' : 'bg-orange-500 hover:bg-orange-600'
        }`}
      >
        {isOpen ? <X className="w-6 h-6 text-white" /> : <Plus className="w-6 h-6 text-white" />}
      </button>
    </div>
  );
}
