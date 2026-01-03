import { Square, PanelLeft, PanelRight, Columns3 } from 'lucide-react';

/**
 * プロフィールページ用のカスタム要素追加ボタン
 */
export default function CustomElementButtons({ isOpen, addRowFunction, onTooltip }) {
  if (!addRowFunction) return null;

  if (isOpen) {
    return (
      <div className="p-4">
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">カスタム要素追加</h3>
          <div className="space-y-2">
            <button
              onClick={() => addRowFunction(1)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-blue-100 hover:text-blue-600 rounded-lg transition-colors text-sm text-gray-700"
            >
              <Square className="w-4 h-4" />
              <span>1列追加</span>
            </button>
            <button
              onClick={() => addRowFunction('2-1')}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-blue-100 hover:text-blue-600 rounded-lg transition-colors text-sm text-gray-700"
            >
              <PanelRight className="w-4 h-4" />
              <span>2列追加</span>
            </button>
            <button
              onClick={() => addRowFunction('1-2')}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-blue-100 hover:text-blue-600 rounded-lg transition-colors text-sm text-gray-700"
            >
              <PanelLeft className="w-4 h-4" />
              <span>2列追加</span>
            </button>
            <button
              onClick={() => addRowFunction(3)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-blue-100 hover:text-blue-600 rounded-lg transition-colors text-sm text-gray-700"
            >
              <Columns3 className="w-4 h-4" />
              <span>3列追加</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Closed sidebar
  return (
    <div className="p-4">
      <div>
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => addRowFunction(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              onTooltip('1列追加', { x: rect.right + 10, y: rect.top + rect.height / 2 });
            }}
            onMouseLeave={() => onTooltip(null)}
          >
            <Square className="w-4 h-4" />
          </button>
          <button
            onClick={() => addRowFunction('2-1')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              onTooltip('2列（2/3 + 1/3）', { x: rect.right + 10, y: rect.top + rect.height / 2 });
            }}
            onMouseLeave={() => onTooltip(null)}
          >
            <Columns2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => addRowFunction('1-2')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              onTooltip('2列（1/3 + 2/3）', { x: rect.right + 10, y: rect.top + rect.height / 2 });
            }}
            onMouseLeave={() => onTooltip(null)}
          >
            <Columns2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => addRowFunction(3)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              onTooltip('3列追加', { x: rect.right + 10, y: rect.top + rect.height / 2 });
            }}
            onMouseLeave={() => onTooltip(null)}
          >
            <Columns3 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
