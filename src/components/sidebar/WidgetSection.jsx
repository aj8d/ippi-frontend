import { Settings2, Trash2 } from 'lucide-react';
import { UNIQUE_WIDGETS, MULTIPLE_WIDGETS } from './SidebarWidgets';

export default function WidgetSection({
  isOpen,
  isHomePage,
  activeWidgets,
  showDeleteMenu,
  onTimerClick,
  onUniqueWidgetClick,
  onAddWidget,
  onRemoveWidget,
  onDeleteMenuToggle,
  onTooltip,
  token,
}) {
  const isWidgetActive = (type) => {
    return activeWidgets.some((w) => w.type === type);
  };

  if (!isHomePage) return null;

  if (isOpen) {
    return (
      <div className="p-4">
        <div>
          <h3 className="text-xs font-semibold text-gray-500 tracking-wider mb-3">要素</h3>
          <div className="space-y-2">
            {/* タイマー設定 */}
            <button
              onClick={onTimerClick}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-blue-100 hover:text-blue-600 rounded-lg transition-colors text-sm text-gray-700"
            >
              <Settings2 className="w-4 h-4" />
              <span className="whitespace-nowrap opacity-0 animate-fade-in">タイマー設定</span>
            </button>

            {/* 区切り線 */}
            <div className="border-t border-gray-200 my-3" />

            {/* 一意ウィジェット */}
            <h3 className="text-xs font-semibold text-gray-500 tracking-wider mb-3">ツール</h3>
            {UNIQUE_WIDGETS.map((widget) => {
              const isActive = isWidgetActive(widget.id);
              return (
                <button
                  key={widget.id}
                  onClick={() => onUniqueWidgetClick(widget)}
                  className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                    isActive
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-600'
                  }`}
                >
                  <widget.icon className="w-4 h-4" />
                  <span className="whitespace-nowrap opacity-0 animate-fade-in">{widget.label}</span>
                </button>
              );
            })}

            {/* 区切り線 */}
            <div className="border-t border-gray-200 my-3" />

            {/* 複数追加可能なウィジェット */}
            <h3 className="text-xs font-semibold text-gray-500 tracking-wider mb-3">メモ</h3>
            {MULTIPLE_WIDGETS.filter((widget) => {
              // 画像ウィジェットはログイン時のみ表示
              if (widget.id === 'image' && !token) return false;
              return true;
            }).map((widget) => (
              <button
                key={widget.id}
                onClick={() => onAddWidget?.(widget.id, widget.defaultSize)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-blue-100 hover:text-blue-600 rounded-lg transition-colors text-sm text-gray-700"
              >
                <widget.icon className="w-4 h-4" />
                <span className="whitespace-nowrap opacity-0 animate-fade-in">{widget.label}</span>
              </button>
            ))}

            {/* 区切り線 */}
            <div className="border-t border-gray-200 my-3" />

            {/* 削除メニュー */}
            <div className="relative">
              <button
                onClick={() => onDeleteMenuToggle(!showDeleteMenu)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors text-sm"
              >
                <Trash2 className="w-4 h-4" />
                <span className="whitespace-nowrap opacity-0 animate-fade-in">削除メニュー</span>
              </button>
              {showDeleteMenu && (
                <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-10">
                  <button
                    onClick={() => {
                      if (window.confirm('付箋を全て削除しますか？この操作は取り消せません。')) {
                        const stickyWidgets = activeWidgets.filter((w) => w.type === 'sticky');
                        stickyWidgets.forEach((w) => onRemoveWidget?.(w.id));
                        onDeleteMenuToggle(false);
                      }
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors text-sm"
                  >
                    <span>付箋を全て削除</span>
                  </button>
                  {token && (
                    <button
                      onClick={() => {
                        if (window.confirm('画像を全て削除しますか？この操作は取り消せません。')) {
                          const imageWidgets = activeWidgets.filter((w) => w.type === 'image');
                          imageWidgets.forEach((w) => onRemoveWidget?.(w.id));
                          onDeleteMenuToggle(false);
                        }
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors text-sm"
                    >
                      <span>画像を全て削除</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (window.confirm('ツールとメモを全て削除しますか？この操作は取り消せません。')) {
                        // ツール（UNIQUE_WIDGETS）とメモ（付箋・画像）を全て削除
                        const allRemovableWidgets = activeWidgets.filter(
                          (w) =>
                            w.type === 'sticky' ||
                            w.type === 'image' ||
                            w.type === 'timer' ||
                            w.type === 'todo' ||
                            w.type === 'streak',
                        );
                        allRemovableWidgets.forEach((w) => onRemoveWidget?.(w.id));
                        onDeleteMenuToggle(false);
                      }
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors text-sm border-t border-gray-200"
                  >
                    <span>全て削除</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Closed sidebar
  return (
    <div className="p-4">
      <div className="flex flex-col items-center gap-2">
        {/* タイマー設定（アイコンのみ） */}
        <button
          onClick={onTimerClick}
          className="p-2 hover:bg-blue-100 hover:text-blue-600 rounded-lg transition-colors text-gray-600"
          onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            onTooltip('インターバル設定', { x: rect.right + 20, y: rect.top + rect.height / 2 });
          }}
          onMouseLeave={() => onTooltip(null)}
        >
          <Settings2 className="w-5 h-5" />
        </button>
        {/* 区切り線 */}
        <div className="w-8 border-t border-gray-200 my-1" />

        {/* 一意ウィジェット */}
        {UNIQUE_WIDGETS.map((widget) => {
          const isActive = isWidgetActive(widget.id);
          return (
            <button
              key={widget.id}
              onClick={() => onUniqueWidgetClick(widget)}
              className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-blue-500 text-white hover:bg-blue-600' : 'text-gray-600 hover:bg-blue-100 hover:text-blue-600'}`}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                onTooltip(widget.label, {
                  x: rect.right + 20,
                  y: rect.top + rect.height / 2,
                });
              }}
              onMouseLeave={() => onTooltip(null)}
            >
              <widget.icon className="w-5 h-5" />
            </button>
          );
        })}
        {/* 区切り線 */}
        <div className="w-8 border-t border-gray-200 my-1" />
        {/* 複数追加可能なウィジェット */}
        {MULTIPLE_WIDGETS.filter((widget) => {
          // 画像ウィジェットはログイン時のみ
          if (widget.id === 'image' && !token) return false;
          return true;
        }).map((widget) => (
          <button
            key={widget.id}
            onClick={() => onAddWidget?.(widget.id, widget.defaultSize)}
            className="p-2 hover:bg-blue-100 hover:text-blue-600 rounded-lg transition-colors text-gray-600"
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              onTooltip(widget.label, { x: rect.right + 20, y: rect.top + rect.height / 2 });
            }}
            onMouseLeave={() => onTooltip(null)}
          >
            <widget.icon className="w-5 h-5" />
          </button>
        ))}
        {/* 区切り線 */}
        <div className="w-8 border-t border-gray-200 my-1" />
        {/* 削除メニュー（アイコンのみ） */}
        <div className="relative">
          <button
            onClick={() => onDeleteMenuToggle(!showDeleteMenu)}
            className="p-2 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              onTooltip('削除メニュー', { x: rect.right + 20, y: rect.top + rect.height / 2 });
            }}
            onMouseLeave={() => onTooltip(null)}
          >
            <Trash2 className="w-5 h-5" />
          </button>
          {showDeleteMenu && (
            <div className="absolute left-full ml-2 top-0 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-10">
              <button
                onClick={() => {
                  const stickyWidgets = activeWidgets.filter((w) => w.type === 'sticky');
                  stickyWidgets.forEach((w) => onRemoveWidget?.(w.id));
                  onDeleteMenuToggle(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors text-sm whitespace-nowrap"
              >
                <span>付箋を全て削除</span>
              </button>
              <button
                onClick={() => {
                  const imageWidgets = activeWidgets.filter((w) => w.type === 'image');
                  imageWidgets.forEach((w) => onRemoveWidget?.(w.id));
                  onDeleteMenuToggle(false);
                }}
                className="flex  w-full items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors text-sm whitespace-nowrap"
              >
                <span>画像を全て削除</span>
              </button>
              <button
                onClick={() => {
                  const allRemovableWidgets = activeWidgets.filter((w) => w.type === 'sticky' || w.type === 'image');
                  allRemovableWidgets.forEach((w) => onRemoveWidget?.(w.id));
                  onDeleteMenuToggle(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors text-sm border-t border-gray-200 whitespace-nowrap"
              >
                <span>全ての要素を削除</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
