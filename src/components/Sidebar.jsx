import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Settings, LogOut, Timer, ChevronDown, ListTodo, StickyNote, Image, Flame } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'motion/react';
import { useAuth } from '../auth/AuthContext';

/**
 * 📚 一意のウィジェット（1つしか追加できない）
 *
 * unique: true = キャンバスに1つだけ
 * 再クリックで削除される
 */
const UNIQUE_WIDGETS = [
  { id: 'timer', icon: Timer, label: 'タイマー', defaultSize: { width: 250, height: 320 } },
  { id: 'todo', icon: ListTodo, label: 'TODO', defaultSize: { width: 280, height: 350 } },
  { id: 'streak', icon: Flame, label: 'ストリーク', defaultSize: { width: 180, height: 180 } },
];

/**
 * 📚 複数追加可能なウィジェット
 *
 * クリックするたびに新しいインスタンスが追加される
 */
const MULTIPLE_WIDGETS = [
  { id: 'sticky', icon: StickyNote, label: '付箋', defaultSize: { width: 200, height: 200 } },
  { id: 'image', icon: Image, label: '画像', defaultSize: { width: 250, height: 250 } },
];

/**
 * Sidebar コンポーネント
 *
 * @param {Array} activeWidgets - 現在キャンバスにあるウィジェットの配列
 * @param {Function} onAddWidget - ウィジェット追加関数
 * @param {Function} onRemoveWidget - ウィジェット削除関数（typeで削除）
 */
function Sidebar({ isOpen, setIsOpen, onTimerSettingsChange, onAddWidget, onRemoveWidget, activeWidgets = [] }) {
  const { logout, user } = useAuth();

  /**
   * 📚 一意ウィジェットが追加済みかチェック
   * activeWidgets 配列に同じ type があれば true
   */
  const isWidgetActive = (type) => {
    return activeWidgets.some((w) => w.type === type);
  };

  /**
   * 📚 一意ウィジェットのクリックハンドラー
   * - 未追加 → 追加
   * - 追加済み → 削除
   */
  const handleUniqueWidgetClick = (widget) => {
    if (isWidgetActive(widget.id)) {
      // 既に追加済み → 削除
      onRemoveWidget?.(widget.id);
    } else {
      // 未追加 → 追加
      onAddWidget?.(widget.id, widget.defaultSize);
    }
  };
  const navigate = useNavigate();
  const [displayMode, setDisplayMode] = useState('countdown');
  const [inputMinutes, setInputMinutes] = useState('1');
  const [inputSeconds, setInputSeconds] = useState('0');
  const [timerSettingsExpanded, setTimerSettingsExpanded] = useState(false);

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
      <div className="border-b border-gray-200">
        {isOpen && (
          <>
            {/* タイトル */}
            <button
              onClick={() => setTimerSettingsExpanded(!timerSettingsExpanded)}
              className="w-full p-4 flex items-center justify-between gap-2 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-700">タイマー設定</h3>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${
                  timerSettingsExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* 展開時の設定内容 */}
            <AnimatePresence>
              {timerSettingsExpanded && (
                <motion.div
                  className="p-4 space-y-4 bg-gray-50"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
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
                        <select
                          value={inputMinutes}
                          onChange={(e) => handleMinutesChange(e.target.value)}
                          className="w-full px-2 py-2 border-2 border-gray-300 text-gray-800 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer"
                        >
                          {[...Array(60)].map((_, i) => (
                            <option key={i} value={String(i)}>
                              {i}分
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <select
                          value={inputSeconds}
                          onChange={(e) => handleSecondsChange(e.target.value)}
                          className="w-full px-2 py-2 border-2 border-gray-300 text-gray-800 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer"
                        >
                          {[...Array(60)].map((_, i) => (
                            <option key={i} value={String(i)}>
                              {i}秒
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* 📚 ウィジェット追加セクション */}
      <div className="border-b border-gray-200 p-4">
        {isOpen ? (
          // サイドバーが開いている時：ラベル付きボタン
          <div className="space-y-4">
            {/* 一意ウィジェット（1つだけ） */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">ツール</h3>
              <div className="grid grid-cols-2 gap-2">
                {UNIQUE_WIDGETS.map((widget) => {
                  const isActive = isWidgetActive(widget.id);
                  return (
                    <button
                      key={widget.id}
                      onClick={() => handleUniqueWidgetClick(widget)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                        isActive
                          ? 'bg-blue-500 text-white hover:bg-blue-600' // 追加済み：ハイライト
                          : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-600' // 未追加
                      }`}
                    >
                      <widget.icon className="w-4 h-4" />
                      <span>{widget.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 複数追加可能なウィジェット */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">メモ</h3>
              <div className="grid grid-cols-2 gap-2">
                {MULTIPLE_WIDGETS.map((widget) => (
                  <button
                    key={widget.id}
                    onClick={() => onAddWidget?.(widget.id, widget.defaultSize)}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-blue-100 hover:text-blue-600 rounded-lg transition-colors text-sm text-gray-700"
                  >
                    <widget.icon className="w-4 h-4" />
                    <span>{widget.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // サイドバーが閉じている時：アイコンのみ
          <div className="flex flex-col items-center gap-2">
            {/* 一意ウィジェット */}
            {UNIQUE_WIDGETS.map((widget) => {
              const isActive = isWidgetActive(widget.id);
              return (
                <button
                  key={widget.id}
                  onClick={() => handleUniqueWidgetClick(widget)}
                  className={`p-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'text-gray-600 hover:bg-blue-100 hover:text-blue-600'
                  }`}
                  title={isActive ? `${widget.label}を削除` : widget.label}
                >
                  <widget.icon className="w-5 h-5" />
                </button>
              );
            })}
            {/* 区切り線 */}
            <div className="w-8 border-t border-gray-200 my-1" />
            {/* 複数追加可能なウィジェット */}
            {MULTIPLE_WIDGETS.map((widget) => (
              <button
                key={widget.id}
                onClick={() => onAddWidget?.(widget.id, widget.defaultSize)}
                className="p-2 hover:bg-blue-100 hover:text-blue-600 rounded-lg transition-colors text-gray-600"
                title={widget.label}
              >
                <widget.icon className="w-5 h-5" />
              </button>
            ))}
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
