/**
 * モバイル用ボトムナビゲーション
 *
 * - 768px以下で表示
 * - ヘッダー部分のナビゲーションをそのまま表示
 * - フッター部分はアコーディオン型メニュー
 */

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Rss, User, Menu, X, Settings, LogOut, LogIn, BarChart3, Trophy } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { useTimer } from '../../contexts/TimerContext';
import StatsModal from '../StatsModal';
import AchievementModal from '../AchievementModal';
import TimerWarningModal from '../TimerWarningModal';

export default function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isTimerRunning, stopTimer } = useTimer();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [warningActionType, setWarningActionType] = useState('navigate');

  // 現在のページを判定
  const isHomePage = location.pathname === '/' || location.pathname === '/home';
  const isSearchPage = location.pathname === '/search';
  const isFeedPage = location.pathname === '/feed';

  // ナビゲーションハンドラー（タイマー実行中の警告対応）
  const handleNavigation = (path, actionType = 'navigate') => {
    if (isTimerRunning && location.pathname !== path) {
      setWarningActionType(actionType);
      setPendingAction(() => () => {
        if (actionType === 'logout') {
          logout();
          navigate('/login');
        } else {
          navigate(path);
        }
      });
      setWarningModalOpen(true);
    } else {
      if (actionType === 'logout') {
        logout();
        navigate('/login');
      } else {
        navigate(path);
      }
    }
    setIsMenuOpen(false);
  };

  const handleWarningConfirm = () => {
    stopTimer();
    if (pendingAction) {
      pendingAction();
    }
    setWarningModalOpen(false);
    setPendingAction(null);
  };

  const navItems = [
    { icon: Home, label: 'ホーム', path: '/', active: isHomePage },
    { icon: Search, label: '検索', path: '/search', active: isSearchPage },
    { icon: Rss, label: 'フィード', path: '/feed', active: isFeedPage, requireAuth: true },
  ];

  return (
    <>
      {/* ボトムナビゲーション */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 lg:hidden">
        <div className="flex items-center justify-around h-16">
          {/* メインナビゲーション */}
          {navItems.map((item) => {
            if (item.requireAuth && !user) return null;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  item.active ? 'text-orange-500' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs mt-1">{item.label}</span>
              </button>
            );
          })}

          {/* メニューボタン */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isMenuOpen ? 'text-orange-500' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            <span className="text-xs mt-1">メニュー</span>
          </button>
        </div>
      </nav>

      {/* アコーディオンメニュー */}
      {isMenuOpen && (
        <>
          {/* オーバーレイ */}
          <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setIsMenuOpen(false)} />

          {/* メニューパネル */}
          <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 z-40 md:hidden animate-slide-up">
            <div className="p-4 space-y-2">
              {user ? (
                <>
                  {/* アチーブメント */}
                  <button
                    onClick={() => {
                      setIsAchievementModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 rounded-lg transition-colors"
                  >
                    <Trophy className="w-5 h-5" />
                    <span className="text-sm font-medium">アチーブメント</span>
                  </button>

                  {/* 統計 */}
                  <button
                    onClick={() => {
                      setIsStatsModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                  >
                    <BarChart3 className="w-5 h-5" />
                    <span className="text-sm font-medium">統計</span>
                  </button>

                  {/* プロフィール */}
                  <button
                    onClick={() => handleNavigation(`/${user.customId}`)}
                    className="w-full flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span className="text-sm font-medium">プロフィール</span>
                  </button>

                  {/* ログアウト */}
                  <button
                    onClick={() => handleNavigation('/login', 'logout')}
                    className="w-full flex items-center gap-4 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm font-medium">ログアウト</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleNavigation('/login')}
                  className="w-full flex items-center gap-4 px-4 py-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <LogIn className="w-5 h-5" />
                  <span className="text-sm font-medium">ログイン</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* モーダル */}
      <StatsModal isOpen={isStatsModalOpen} onClose={() => setIsStatsModalOpen(false)} />
      <AchievementModal isOpen={isAchievementModalOpen} onClose={() => setIsAchievementModalOpen(false)} />
      <TimerWarningModal
        isOpen={warningModalOpen}
        onClose={() => {
          setWarningModalOpen(false);
          setPendingAction(null);
        }}
        onConfirm={handleWarningConfirm}
        actionType={warningActionType}
      />
    </>
  );
}
