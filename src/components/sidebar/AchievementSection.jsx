import { Trophy } from 'lucide-react';

/**
 * アチーブメントセクションコンポーネント
 */
export default function AchievementSection({ isOpen, onAchievementClick, onTooltip }) {
  return (
    <div className="border-b border-gray-200 p-4">
      {isOpen ? (
        <button
          onClick={onAchievementClick}
          className="w-full flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            onTooltip('アチーブメント', { x: rect.right + 10, y: rect.top + rect.height / 2 });
          }}
          onMouseLeave={() => onTooltip(null)}
        >
          <Trophy className="w-5 h-5 text-yellow-600" />
          <span className="text-sm font-medium text-gray-700">アチーブメント</span>
        </button>
      ) : (
        <button
          onClick={onAchievementClick}
          className="w-full p-2 hover:bg-gray-100 rounded-lg transition-colors"
          onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            onTooltip('アチーブメント', { x: rect.right + 10, y: rect.top + rect.height / 2 });
          }}
          onMouseLeave={() => onTooltip(null)}
        >
          <Trophy className="w-5 h-5 text-yellow-600 mx-auto" />
        </button>
      )}
    </div>
  );
}
