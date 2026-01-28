import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeftFromLine, ArrowRightFromLine } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { useTimer } from "../contexts/TimerContext";
import StatsModal from "./StatsModal";
import AchievementModal from "./AchievementModal";
import TimerWarningModal from "./TimerWarningModal";
import SidebarNavigation from "./sidebar/SidebarNavigation";
import WidgetSection from "./sidebar/WidgetSection";
import CustomElementButtons from "./sidebar/CustomElementButtons";
import SidebarFooter from "./sidebar/SidebarFooter";
import TimerSettingsModal from "./sidebar/TimerSettingsModal";

/**
 * Sidebar コンポーネント
 *
 * @param {Array} activeWidgets - 現在キャンバスにあるウィジェットの配列
 * @param {Function} onAddWidget - ウィジェット追加関数
 * @param {Function} onRemoveWidget - ウィジェット削除関数（typeで削除）
 * @param {boolean} isOwnProfile - 自分のプロフィールかどうか
 * @param {Function} addRowFunction - カスタム要素追加関数
 */
function Sidebar({ isOpen, setIsOpen, onTimerSettingsChange, onAddWidget, onRemoveWidget, activeWidgets = [], isOwnProfile = false, addRowFunction = null }) {
  const { logout, user, token } = useAuth();
  const { isTimerRunning, stopTimer } = useTimer();
  const location = useLocation();
  const navigate = useNavigate();

  // 警告モーダルの状態
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [warningActionType, setWarningActionType] = useState("navigate");
  const [pendingAction, setPendingAction] = useState(null);

  // カスタムツールチップの状態
  const [tooltip, setTooltip] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // 削除メニューの状態
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);

  // サイドバーの開閉状態をlocalStorageに保存
  useEffect(() => {
    localStorage.setItem("sidebarOpen", JSON.stringify(isOpen));
  }, [isOpen]);

  // 現在のページを判定
  const isHomePage = location.pathname === "/" || location.pathname === "/home";
  const isSearchPage = location.pathname === "/search";
  const isFeedPage = location.pathname === "/feed";
  const isProfilePage = location.pathname.includes("/@") || (user && location.pathname === `/${user.customId}`);

  /**
   * 一意ウィジェットが追加済みかチェック
   * activeWidgets 配列に同じ type があれば true
   */
  const isWidgetActive = (type) => {
    return activeWidgets.some((w) => w.type === type);
  };

  /**
   * 一意ウィジェットのクリックハンドラー
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

  // モーダル状態管理
  // localStorageからタイマー設定を読み込む
  const loadTimerSettings = () => {
    try {
      const saved = localStorage.getItem("timerSettings");
      if (saved) {
        const settings = JSON.parse(saved);
        return {
          displayMode: settings.displayMode || 'countdown',
          totalCycles: settings.totalCycles || '3',
          pomodoroSections: settings.pomodoroSections || [{ id: 1, workMinutes: '25', breakMinutes: '5' }],
          countdownMinutes: settings.countdownMinutes || '25',
          alarmVolume: settings.alarmVolume !== undefined ? settings.alarmVolume : 0.5,
        };
      }
    } catch (error) {
      console.error("タイマー設定の読み込みエラー:", error);
    }
    return {
      displayMode: 'countdown',
      totalCycles: '3',
      pomodoroSections: [{ id: 1, workMinutes: '25', breakMinutes: '5' }],
      countdownMinutes: '25',
      alarmVolume: 0.5,
    };
  };

  const initialSettings = loadTimerSettings();
  const [displayMode, setDisplayMode] = useState(initialSettings.displayMode);
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false); // 統計モーダル
  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false); // アチーブメントモーダル
  const [totalCycles, setTotalCycles] = useState(initialSettings.totalCycles); // サイクル数（デフォルト3サイクル）
  const [countdownMinutes, setCountdownMinutes] = useState(initialSettings.countdownMinutes); // カウントダウン時間（分）
  const [alarmVolume, setAlarmVolume] = useState(initialSettings.alarmVolume); // アラーム音量（0〜1）

  // ポモドーロセクション管理
  // 各セクションは { id, workMinutes, breakMinutes } を持つ
  const [pomodoroSections, setPomodoroSections] = useState(initialSettings.pomodoroSections);

  // タイマー設定をlocalStorageに保存
  useEffect(() => {
    const settings = {
      displayMode,
      totalCycles,
      pomodoroSections,
      countdownMinutes,
      alarmVolume,
    };
    localStorage.setItem('timerSettings', JSON.stringify(settings));
  }, [displayMode, totalCycles, pomodoroSections, countdownMinutes, alarmVolume]);

  // 初回マウント時に保存された設定をTimerWidgetへ通知
  useEffect(() => {
    notifyTimerSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 初回のみ実行

  // セクション追加
  const handleAddSection = () => {
    const newId = Math.max(...pomodoroSections.map((s) => s.id), 0) + 1;
    setPomodoroSections([...pomodoroSections, { id: newId, workMinutes: "25", breakMinutes: "5" }]);
  };

  // セクション削除
  const handleRemoveSection = (id) => {
    if (pomodoroSections.length > 1) {
      setPomodoroSections(pomodoroSections.filter((s) => s.id !== id));
    }
  };

  // セクションの値更新
  const handleSectionChange = (id, field, value) => {
    setPomodoroSections(pomodoroSections.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  // 設定変更時にTimerWidgetへ通知
  const notifyTimerSettings = (
    sections = pomodoroSections,
    mode = displayMode,
    cycles = totalCycles,
    cdMinutes = countdownMinutes,
    volume = alarmVolume
  ) => {
    onTimerSettingsChange?.({
      displayMode: mode,
      sections: sections,
      totalCycles: parseInt(cycles) || 1,
      countdownMinutes: parseInt(cdMinutes) || 25,
      alarmVolume: volume,
    });
  };

  const handleDisplayModeChange = (mode) => {
    setDisplayMode(mode);
    notifyTimerSettings(pomodoroSections, mode);
  };

  // モーダルを閉じる時に設定を適用
  const handleCloseModal = () => {
    notifyTimerSettings();
    setIsTimerModalOpen(false);
  };

  // タイマー動作中の警告を表示して操作を遅延実行
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

  // 警告モーダルで確認後にアクション実行
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

  // タイマー設定ボタンクリック
  const handleTimerSettingsClick = () => {
    showTimerWarning("settings", () => setIsTimerModalOpen(true));
  };

  // タイマー設定ボタンクリック（エイリアス）
  const handleTimerClick = handleTimerSettingsClick;

  // 統計ボタンクリック
  const handleStatsClick = () => {
    showTimerWarning("stats", () => setIsStatsModalOpen(true));
  };

  // プロフィールクリック（ページ遷移）
  const handleProfileClick = () => {
    if (user?.customId) {
      showTimerWarning("navigate", () => navigate(`/${user.customId}`));
    }
  };

  // ホームクリック（ページ遷移）
  const handleHomeClick = () => {
    showTimerWarning("navigate", () => navigate("/"));
  };

  // 検索クリック（ページ遷移）
  const handleSearchClick = () => {
    showTimerWarning("navigate", () => navigate("/search"));
  };

  // フィードクリック（ページ遷移）
  const handleFeedClick = () => {
    showTimerWarning("navigate", () => navigate("/feed"));
  };

  const handleLogout = () => {
    showTimerWarning("navigate", () => logout());
  };

  // ブラウザを閉じる/リロード時の警告
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isTimerRunning) {
        e.preventDefault();
        // Chrome requires returnValue to be set
        e.returnValue = "タイマーが動作中です。ページを離れると作業時間が保存されます。";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isTimerRunning]);

  const handleTooltip = (text, pos = null) => {
    setTooltip(text);
    if (pos) setTooltipPos(pos);
  };

  return (
    <div className={`${isOpen ? "w-64" : "w-20"} bg-white shadow-lg transition-all duration-300 flex flex-col fixed h-screen left-0 top-0 z-50`}>
      {/* ヘッダー */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        {isOpen && <h1 className="text-2xl font-bold text-gray-800">iPPi</h1>}
        <button
          onClick={() => {
            setTooltip(null);
            setIsOpen(!isOpen);
          }}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {isOpen ? (
            <ArrowLeftFromLine
              className="w-5 h-5 text-gray-600"
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                handleTooltip("折りたたむ", { x: rect.right + 20, y: rect.top + rect.height / 2 });
              }}
              onMouseLeave={() => handleTooltip(null)}
            />
          ) : (
            <ArrowRightFromLine
              className="w-5 h-5 text-gray-600"
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                handleTooltip("展開", { x: rect.right + 20, y: rect.top + rect.height / 2 });
              }}
              onMouseLeave={() => handleTooltip(null)}
            />
          )}
        </button>
      </div>

      {/* ナビゲーション */}
      <SidebarNavigation
        isOpen={isOpen}
        user={user}
        isHomePage={isHomePage}
        isSearchPage={isSearchPage}
        isFeedPage={isFeedPage}
        onHomeClick={handleHomeClick}
        onSearchClick={handleSearchClick}
        onFeedClick={handleFeedClick}
        onTooltip={handleTooltip}
      />

      {/* ウィジェットセクション（ホームページのみ表示） */}
      {isHomePage && (
        <WidgetSection
          isOpen={isOpen}
          isHomePage={isHomePage}
          activeWidgets={activeWidgets}
          showDeleteMenu={showDeleteMenu}
          onTimerClick={handleTimerClick}
          onUniqueWidgetClick={handleUniqueWidgetClick}
          onAddWidget={onAddWidget}
          onRemoveWidget={onRemoveWidget}
          onDeleteMenuToggle={setShowDeleteMenu}
          onTooltip={handleTooltip}
          token={token}
        />
      )}

      {/* カスタム要素追加ボタン（プロフィールページ） */}
      {isProfilePage && isOwnProfile && <CustomElementButtons isOpen={isOpen} addRowFunction={addRowFunction} onTooltip={handleTooltip} />}

      {/* 空のスペーサー */}
      <div className="flex-1"></div>

      {/* フッター */}
      <SidebarFooter
        isOpen={isOpen}
        user={user}
        onStatsClick={handleStatsClick}
        onProfileClick={handleProfileClick}
        onLogout={handleLogout}
        onLoginClick={() => navigate("/login")}
        onAchievementClick={() => setIsAchievementModalOpen(true)}
      />

      {/* タイマー設定モーダル */}
      <TimerSettingsModal
        isOpen={isTimerModalOpen}
        displayMode={displayMode}
        totalCycles={totalCycles}
        countdownMinutes={countdownMinutes}
        pomodoroSections={pomodoroSections}
        alarmVolume={alarmVolume}
        onClose={handleCloseModal}
        onDisplayModeChange={handleDisplayModeChange}
        onTotalCyclesChange={setTotalCycles}
        onCountdownMinutesChange={setCountdownMinutes}
        onSectionChange={handleSectionChange}
        onAddSection={handleAddSection}
        onRemoveSection={handleRemoveSection}
        onAlarmVolumeChange={setAlarmVolume}
      />

      {/* 統計モーダル */}
      <StatsModal isOpen={isStatsModalOpen} onClose={() => setIsStatsModalOpen(false)} />

      {/* アチーブメントモーダル */}
      <AchievementModal isOpen={isAchievementModalOpen} onClose={() => setIsAchievementModalOpen(false)} />

      {/* タイマー警告モーダル */}
      <TimerWarningModal
        isOpen={warningModalOpen}
        onClose={() => {
          setWarningModalOpen(false);
          setPendingAction(null);
        }}
        onConfirm={handleWarningConfirm}
        actionType={warningActionType}
      />

      {/* カスタムツールチップ */}
      {tooltip &&
        createPortal(
          <div
            className="fixed bg-gray-800 text-white px-2.5 py-1.5 rounded text-xs font-medium whitespace-nowrap pointer-events-none z-[9999] shadow-md"
            style={{
              left: `${tooltipPos.x}px`,
              top: `${tooltipPos.y}px`,
              transform: "translate(0, -50%)",
            }}
          >
            {tooltip}
            {/* 左向き三角形ポインター */}
            <div
              className="absolute w-0 h-0 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-gray-800"
              style={{
                left: "-4px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
          </div>,
          document.body
        )}
    </div>
  );
}

export default Sidebar;
