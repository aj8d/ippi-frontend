import { Settings, LogOut, LogIn, BarChart3, Trophy } from 'lucide-react';

/**
 * サイドバーフッターコンポーネント
 */
export default function SidebarFooter({
  isOpen,
  user,
  onStatsClick,
  onProfileClick,
  onLogout,
  onLoginClick,
  onAchievementClick,
  onTooltip,
}) {
  return (
    <div className="p-4 border-t border-gray-200 space-y-2">
      {user ? (
        // ログイン時：アチーブメント、統計、プロフィール、ログアウトを表示
        <>
          {/* アチーブメントボタン */}
          <button
            onClick={onAchievementClick}
            onMouseEnter={(e) => {
              if (!isOpen && onTooltip) {
                const rect = e.currentTarget.getBoundingClientRect();
                onTooltip('アチーブメント', { x: rect.right + 20, y: rect.top + rect.height / 2 });
              }
            }}
            onMouseLeave={() => onTooltip && onTooltip(null)}
            className="w-full flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 rounded-lg transition-colors duration-200"
          >
            <Trophy className="w-5 h-5 flex-shrink-0" />
            {isOpen && (
              <span className="text-sm font-medium whitespace-nowrap opacity-0 animate-fade-in">アチーブメント</span>
            )}
          </button>
          {/* 統計ボタン */}
          <button
            onClick={onStatsClick}
            onMouseEnter={(e) => {
              if (!isOpen && onTooltip) {
                const rect = e.currentTarget.getBoundingClientRect();
                onTooltip('統計', { x: rect.right + 20, y: rect.top + rect.height / 2 });
              }
            }}
            onMouseLeave={() => onTooltip && onTooltip(null)}
            className="w-full flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-200"
          >
            <BarChart3 className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span className="text-sm font-medium whitespace-nowrap opacity-0 animate-fade-in">統計</span>}
          </button>
          <button
            onClick={onProfileClick}
            onMouseEnter={(e) => {
              if (!isOpen && onTooltip) {
                const rect = e.currentTarget.getBoundingClientRect();
                onTooltip('プロフィール', { x: rect.right + 20, y: rect.top + rect.height / 2 });
              }
            }}
            onMouseLeave={() => onTooltip && onTooltip(null)}
            className="w-full flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-200"
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {isOpen && (
              <span className="text-sm font-medium whitespace-nowrap opacity-0 animate-fade-in">プロフィール</span>
            )}
          </button>
          <button
            onClick={onLogout}
            onMouseEnter={(e) => {
              if (!isOpen && onTooltip) {
                const rect = e.currentTarget.getBoundingClientRect();
                onTooltip('ログアウト', { x: rect.right + 20, y: rect.top + rect.height / 2 });
              }
            }}
            onMouseLeave={() => onTooltip && onTooltip(null)}
            className="w-full flex items-center gap-4 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isOpen && (
              <span className="text-sm font-medium whitespace-nowrap opacity-0 animate-fade-in">ログアウト</span>
            )}
          </button>
        </>
      ) : (
        // ログオフ時：ログインボタンのみ表示
        <button
          onClick={onLoginClick}
          onMouseEnter={(e) => {
            if (!isOpen && onTooltip) {
              const rect = e.currentTarget.getBoundingClientRect();
              onTooltip('ログイン', { x: rect.right + 20, y: rect.top + rect.height / 2 });
            }
          }}
          onMouseLeave={() => onTooltip && onTooltip(null)}
          className="w-full flex items-center gap-4 px-4 py-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
        >
          <LogIn className="w-5 h-5 flex-shrink-0" />
          {isOpen && <span className="text-sm font-medium whitespace-nowrap opacity-0 animate-fade-in">ログイン</span>}
        </button>
      )}
    </div>
  );
}
