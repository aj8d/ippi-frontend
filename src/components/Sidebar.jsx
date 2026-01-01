import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Settings,
  LogOut,
  Timer,
  ListTodo,
  StickyNote,
  Image,
  Flame,
  Plus,
  Trash2,
  Home,
  Search,
  MessageSquareHeart,
  BarChart3,
  ArrowLeftFromLine,
  ArrowRightFromLine,
} from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'motion/react';
import { useAuth } from '../auth/AuthContext';
import { useTimer } from '../contexts/TimerContext';
import StatsModal from './StatsModal';
import TimerWarningModal from './TimerWarningModal';
import { WidgetAddButton } from './ProfileWidgetManager';

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
 * @param {boolean} isOwnProfile - 自分のプロフィールかどうか
 * @param {Function} addRowFunction - カスタム要素追加関数
 */
function Sidebar({
  isOpen,
  setIsOpen,
  onTimerSettingsChange,
  onAddWidget,
  onRemoveWidget,
  activeWidgets = [],
  isOwnProfile = false,
  addRowFunction = null,
}) {
  const { logout, user } = useAuth();
  const { isTimerRunning, stopTimer } = useTimer();
  const location = useLocation();
  const navigate = useNavigate();

  // 📚 警告モーダルの状態
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [warningActionType, setWarningActionType] = useState('navigate');
  const [pendingAction, setPendingAction] = useState(null);

  // 📚 現在のページを判定
  const isHomePage = location.pathname === '/' || location.pathname === '/home';
  const isSearchPage = location.pathname === '/search';
  const isFeedPage = location.pathname === '/feed';
  const isProfilePage = location.pathname.includes('/@') || (user && location.pathname === `/${user.customId}`);

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

  // 📚 モーダル状態管理
  // localStorageからタイマー設定を読み込む
  const loadTimerSettings = () => {
    try {
      const saved = localStorage.getItem('timerSettings');
      if (saved) {
        const settings = JSON.parse(saved);
        return {
          displayMode: settings.displayMode || 'countdown',
          totalCycles: settings.totalCycles || '3',
          pomodoroSections: settings.pomodoroSections || [{ id: 1, workMinutes: '25', breakMinutes: '5' }],
        };
      }
    } catch (error) {
      console.error('タイマー設定の読み込みエラー:', error);
    }
    return {
      displayMode: 'countdown',
      totalCycles: '3',
      pomodoroSections: [{ id: 1, workMinutes: '25', breakMinutes: '5' }],
    };
  };

  const initialSettings = loadTimerSettings();
  const [displayMode, setDisplayMode] = useState(initialSettings.displayMode);
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false); // 統計モーダル
  const [totalCycles, setTotalCycles] = useState(initialSettings.totalCycles); // 📚 サイクル数（デフォルト3サイクル）

  // 📚 ポモドーロセクション管理
  // 各セクションは { id, workMinutes, breakMinutes } を持つ
  const [pomodoroSections, setPomodoroSections] = useState(initialSettings.pomodoroSections);

  // 📚 タイマー設定をlocalStorageに保存
  useEffect(() => {
    const settings = {
      displayMode,
      totalCycles,
      pomodoroSections,
    };
    localStorage.setItem('timerSettings', JSON.stringify(settings));
  }, [displayMode, totalCycles, pomodoroSections]);

  // 📚 初回マウント時に保存された設定をTimerWidgetへ通知
  useEffect(() => {
    notifyTimerSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 初回のみ実行

  // 📚 セクション追加
  const handleAddSection = () => {
    const newId = Math.max(...pomodoroSections.map((s) => s.id), 0) + 1;
    setPomodoroSections([...pomodoroSections, { id: newId, workMinutes: '25', breakMinutes: '5' }]);
  };

  // 📚 セクション削除
  const handleRemoveSection = (id) => {
    if (pomodoroSections.length > 1) {
      setPomodoroSections(pomodoroSections.filter((s) => s.id !== id));
    }
  };

  // 📚 セクションの値更新
  const handleSectionChange = (id, field, value) => {
    setPomodoroSections(pomodoroSections.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  // 📚 設定変更時にTimerWidgetへ通知
  const notifyTimerSettings = (sections = pomodoroSections, mode = displayMode, cycles = totalCycles) => {
    onTimerSettingsChange?.({
      displayMode: mode,
      sections: sections,
      totalCycles: parseInt(cycles) || 1,
    });
  };

  const handleDisplayModeChange = (mode) => {
    setDisplayMode(mode);
    notifyTimerSettings(pomodoroSections, mode);
  };

  // 📚 モーダルを閉じる時に設定を適用
  const handleCloseModal = () => {
    notifyTimerSettings();
    setIsTimerModalOpen(false);
  };

  // 📚 タイマー動作中の警告を表示して操作を遅延実行
  const showTimerWarning = useCallback(
    (actionType, action) => {
      if (isTimerRunning) {
        setWarningActionType(actionType);
        setPendingAction(() => action);
        setWarningModalOpen(true);
      } else {
        action();
      }
    },
    [isTimerRunning]
  );

  // 📚 警告モーダルで確認後にアクション実行
  const handleWarningConfirm = useCallback(() => {
    stopTimer();
    if (pendingAction) {
      // タイマー停止後に少し待ってからアクション実行
      setTimeout(() => {
        pendingAction();
        setPendingAction(null);
      }, 100);
    }
  }, [stopTimer, pendingAction]);

  // 📚 タイマー設定ボタンクリック
  const handleTimerSettingsClick = () => {
    showTimerWarning('settings', () => setIsTimerModalOpen(true));
  };

  // 📚 統計ボタンクリック
  const handleStatsClick = () => {
    showTimerWarning('stats', () => setIsStatsModalOpen(true));
  };

  // 📚 プロフィールクリック（ページ遷移）
  const handleProfileClick = () => {
    if (user?.customId) {
      showTimerWarning('navigate', () => navigate(`/${user.customId}`));
    }
  };

  // 📚 ホームクリック（ページ遷移）
  const handleHomeClick = () => {
    showTimerWarning('navigate', () => navigate('/'));
  };

  // 📚 検索クリック（ページ遷移）
  const handleSearchClick = () => {
    showTimerWarning('navigate', () => navigate('/search'));
  };

  // 📚 フィードクリック（ページ遷移）
  const handleFeedClick = () => {
    showTimerWarning('navigate', () => navigate('/feed'));
  };

  const handleLogout = () => {
    showTimerWarning('navigate', () => logout());
  };

  // 📚 ブラウザを閉じる/リロード時の警告
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isTimerRunning) {
        e.preventDefault();
        // Chrome requires returnValue to be set
        e.returnValue = 'タイマーが動作中です。ページを離れると作業時間が保存されます。';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isTimerRunning]);

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
          {isOpen ? (
            <ArrowLeftFromLine className="w-5 h-5 text-gray-600" />
          ) : (
            <ArrowRightFromLine className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* アイコンナビゲーション */}
      <div className="border-b border-gray-200 p-4">
        {isOpen ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleHomeClick}
              className="flex items-center justify-center p-2 hover:bg-gray-100 rounded-lg transition-colors flex-1"
              title="ホーム"
            >
              <Home className={`w-5 h-5 ${isHomePage ? 'text-blue-600' : 'text-gray-600'}`} />
            </button>
            <button
              onClick={handleSearchClick}
              className="flex items-center justify-center p-2 hover:bg-gray-100 rounded-lg transition-colors flex-1"
              title="検索"
            >
              <Search className={`w-5 h-5 ${isSearchPage ? 'text-blue-600' : 'text-gray-600'}`} />
            </button>
            <button
              onClick={handleFeedClick}
              className="flex items-center justify-center p-2 hover:bg-gray-100 rounded-lg transition-colors flex-1"
              title="フィード"
            >
              <MessageSquareHeart className={`w-5 h-5 ${isFeedPage ? 'text-blue-600' : 'text-gray-600'}`} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleHomeClick}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="ホーム"
            >
              <Home className={`w-5 h-5 ${isHomePage ? 'text-blue-600' : 'text-gray-600'}`} />
            </button>
            <button
              onClick={handleSearchClick}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="検索"
            >
              <Search className={`w-5 h-5 ${isSearchPage ? 'text-blue-600' : 'text-gray-600'}`} />
            </button>
            <button
              onClick={handleFeedClick}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="フィード"
            >
              <MessageSquareHeart className={`w-5 h-5 ${isFeedPage ? 'text-blue-600' : 'text-gray-600'}`} />
            </button>
          </div>
        )}
      </div>

      {/* タイマー設定ボタン */}
      {isHomePage && isOpen && (
        <div className="border-b border-gray-200 p-4">
          <button
            onClick={handleTimerSettingsClick}
            className="w-full flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">タイマー設定</span>
          </button>
        </div>
      )}

      {/* 📚 カスタム要素追加セクション（プロフィールページ & 自分のプロフィール & サイドバー開いている時のみ） */}
      {isProfilePage && isOwnProfile && addRowFunction && isOpen && (
        <div className="border-b border-gray-200 p-4">
          <WidgetAddButton onAddRow={addRowFunction} />
        </div>
      )}

      {/* 📚 ウィジェット追加セクション（Homeページでのみ表示） */}
      {isHomePage && (
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
      )}

      {/* 空のスペーサー */}
      <div className="flex-1"></div>

      {/* フッター */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        {/* 📊 統計ボタン */}
        <button
          onClick={handleStatsClick}
          className="w-full flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-200"
        >
          <BarChart3 className="w-5 h-5 flex-shrink-0" />
          {isOpen && <span className="text-sm font-medium">統計</span>}
        </button>
        <button
          onClick={handleProfileClick}
          className="w-full flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-200"
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {isOpen && <span className="text-sm font-medium">プロフィール</span>}
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {isOpen && <span className="text-sm font-medium">ログアウト</span>}
        </button>
      </div>

      {/* タイマー設定モーダル（Portalで画面全体に表示） */}
      {isTimerModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
            onClick={handleCloseModal}
          >
            {/* モーダルコンテンツ */}
            <div
              className="bg-white rounded-xl shadow-2xl w-[90%] max-w-lg p-6 max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* ヘッダー */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Timer className="w-5 h-5 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-800">インターバル設定</h2>
                </div>
                <button onClick={handleCloseModal} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* 設定内容 */}
              <div className="space-y-6">
                {/* 表示モード */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700">表示モード</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleDisplayModeChange('countdown')}
                      className={`flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        displayMode === 'countdown'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      カウント
                    </button>
                    <button
                      onClick={() => handleDisplayModeChange('progress')}
                      className={`flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        displayMode === 'progress'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      進行度
                    </button>
                  </div>
                </div>

                {/* サイクル数設定 */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700">サイクル数</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={totalCycles}
                      onChange={(e) => setTotalCycles(e.target.value)}
                      className="w-20 px-3 py-2 border border-gray-300 text-gray-800 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-center"
                    />
                    <span className="text-sm text-gray-600">サイクル</span>
                    <span className="text-xs text-gray-500">全セクションを何回繰り返すか</span>
                  </div>
                </div>

                {/* ポモドーロセクション */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-700">セクション設定</label>
                    <span className="text-xs text-gray-500">順番に繰り返します</span>
                  </div>

                  <div className="space-y-4">
                    {pomodoroSections.map((section, index) => (
                      <div key={section.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        {/* セクションヘッダー */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-600">セクション {index + 1}</span>
                          {pomodoroSections.length > 1 && (
                            <button
                              onClick={() => handleRemoveSection(section.id)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* 作業時間・休憩時間（同じ行） */}
                        <div className="flex items-center justify-between">
                          {/* 作業時間 */}
                          <div className="flex-1 flex items-center gap-2">
                            <span className="text-xs text-gray-500">🔴</span>
                            <input
                              type="number"
                              min="1"
                              max="999"
                              value={section.workMinutes}
                              onChange={(e) => handleSectionChange(section.id, 'workMinutes', e.target.value)}
                              className="flex-1 max-w-[60px] px-2 py-1.5 border border-gray-300 text-gray-800 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-center"
                            />
                            <span className="text-xs text-gray-600">分</span>
                          </div>

                          <span className="text-gray-400 px-2">→</span>

                          {/* 休憩時間 */}
                          <div className="flex-1 flex items-center justify-end gap-2">
                            <span className="text-xs text-gray-500">🟢</span>
                            <input
                              type="number"
                              min="1"
                              max="999"
                              value={section.breakMinutes}
                              onChange={(e) => handleSectionChange(section.id, 'breakMinutes', e.target.value)}
                              className="flex-1 max-w-[60px] px-2 py-1.5 border border-gray-300 text-gray-800 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-center"
                            />
                            <span className="text-xs text-gray-600">分</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* セクション追加ボタン */}
                  <button
                    onClick={handleAddSection}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">セクションを追加</span>
                  </button>
                </div>

                {/* 閉じるボタン */}
                <button
                  onClick={handleCloseModal}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  完了
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* 📊 統計モーダル */}
      <StatsModal isOpen={isStatsModalOpen} onClose={() => setIsStatsModalOpen(false)} />

      {/* ⚠️ タイマー警告モーダル */}
      <TimerWarningModal
        isOpen={warningModalOpen}
        onClose={() => {
          setWarningModalOpen(false);
          setPendingAction(null);
        }}
        onConfirm={handleWarningConfirm}
        actionType={warningActionType}
      />
    </div>
  );
}

export default Sidebar;
