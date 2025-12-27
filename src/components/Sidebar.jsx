import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Settings, LogOut, Timer } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

function Sidebar({ isOpen, setIsOpen, onTimerSettingsChange }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [displayMode, setDisplayMode] = useState('countdown');
  const [inputMinutes, setInputMinutes] = useState('1');
  const [inputSeconds, setInputSeconds] = useState('0');

  const handleDisplayModeChange = (mode) => {
    setDisplayMode(mode);
    onTimerSettingsChange({ displayMode: mode, inputMinutes, inputSeconds });
  };

  const handleMinutesChange = (value) => {
    console.log('handleMinutesChange called with:', value);
    setInputMinutes(value);
    onTimerSettingsChange({ displayMode, inputMinutes: value, inputSeconds });
  };

  const handleSecondsChange = (value) => {
    console.log('handleSecondsChange called with:', value);
    setInputSeconds(value);
    onTimerSettingsChange({ displayMode, inputMinutes, inputSeconds: value });
  };

  const handleLogout = () => {
    logout();
  };

  const handleProfileClick = () => {
    if (user?.customId) {
      navigate(`/${user.customId}`);
    }
  };

  return (
    <div
      className={`${
        isOpen ? 'w-64' : 'w-20'
      } bg-white shadow-lg transition-all duration-300 flex flex-col fixed h-screen left-0 top-0`}
    >
      {/* ヘッダー */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        {isOpen && <h1 className="text-2xl font-bold text-gray-800">iPPi</h1>}
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          {isOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
        </button>
      </div>

      {/* タイマー設定 */}
      <div className="p-4 border-b border-gray-200">
        {isOpen && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-gray-600" />
              <h3 className="text-sm font-semibold text-gray-700">タイマー設定</h3>
            </div>

            {/* 表示モード */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">表示モード</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDisplayModeChange('countdown')}
                  className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                    displayMode === 'countdown'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  カウント
                </button>
                <button
                  onClick={() => handleDisplayModeChange('progress')}
                  className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                    displayMode === 'progress'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  進行度
                </button>
              </div>
            </div>

            {/* タイマー時間設定 */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">デフォルト時間</label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={inputMinutes}
                    onChange={(e) => handleMinutesChange(e.target.value)}
                    className="w-full px-2 py-2 border-2 border-gray-300 text-gray-800 text-center text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="分"
                  />
                  <p className="text-xs text-gray-500 text-center mt-1">分</p>
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={inputSeconds}
                    onChange={(e) => handleSecondsChange(e.target.value)}
                    className="w-full px-2 py-2 border-2 border-gray-300 text-gray-800 text-center text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="秒"
                  />
                  <p className="text-xs text-gray-500 text-center mt-1">秒</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 p-4 space-y-2">
        <button
          onClick={handleProfileClick}
          className="w-full flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-200"
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {isOpen && <span className="text-sm font-medium">プロフィール</span>}
        </button>
      </nav>

      {/* フッター */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {isOpen && <span className="text-sm font-medium">ログアウト</span>}
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
