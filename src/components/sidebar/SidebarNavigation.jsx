import { Home, Search, MessageSquareHeart } from 'lucide-react';

export default function SidebarNavigation({
  isOpen,
  user,
  isHomePage,
  isSearchPage,
  isFeedPage,
  onHomeClick,
  onSearchClick,
  onFeedClick,
  onTooltip,
}) {
  const renderButton = (Icon, isActive, label, onClick) => {
    const buttonClass = isOpen
      ? 'flex items-center justify-center p-2 hover:bg-gray-100 rounded-lg transition-colors flex-1'
      : 'p-2 hover:bg-gray-100 rounded-lg transition-colors';

    return (
      <button
        onClick={onClick}
        className={buttonClass}
        onMouseEnter={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          onTooltip(label, { x: rect.right + 10, y: rect.top + rect.height / 2 });
        }}
        onMouseLeave={() => onTooltip(null)}
      >
        <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-600'}`} />
      </button>
    );
  };

  return (
    <div className="border-b border-gray-200 p-4">
      {isOpen ? (
        <div className="flex items-center gap-2">
          {renderButton(Home, isHomePage, 'ホーム', onHomeClick)}
          {renderButton(Search, isSearchPage, '検索', onSearchClick)}
          {user && renderButton(MessageSquareHeart, isFeedPage, 'フィード', onFeedClick)}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          {renderButton(Home, isHomePage, 'ホーム', onHomeClick)}
          {renderButton(Search, isSearchPage, '検索', onSearchClick)}
          {user && renderButton(MessageSquareHeart, isFeedPage, 'フィード', onFeedClick)}
        </div>
      )}
    </div>
  );
}
