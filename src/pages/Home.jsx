import { useState } from 'react';
import { Menu, X, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import SwapyContainer from '../swapy/SwapyContainer';

function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* サイドバー */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
        {/* ヘッダー */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-2xl font-bold text-gray-800">iPPi</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
          </button>
        </div>

        {/* ナビゲーション */}
        <nav className="flex-1 p-4 space-y-2">
          <a
            href="/profile"
            className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-200"
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">プロフィール</span>}
          </a>
        </nav>

        {/* フッター */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">ログアウト</span>}
          </button>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1">
        <SwapyContainer />
      </div>
    </div>
  );
}

export default Home;
