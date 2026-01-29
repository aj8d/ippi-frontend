import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeftFromLine, ArrowRightFromLine } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useTimer } from '../contexts/TimerContext';
import StatsModal from './StatsModal';
import TimerWarningModal from './TimerWarningModal';
import SidebarNavigation from './sidebar/SidebarNavigation';
import WidgetSection from './sidebar/WidgetSection';
import CustomElementButtons from './sidebar/CustomElementButtons';
import SidebarFooter from './sidebar/SidebarFooter';
import TimerSettingsModal from './sidebar/TimerSettingsModal';

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
  const { logout, user, token } = useAuth();
  const { isTimerRunning, stopTimer } = useTimer();
  const location = useLocation();
  const navigate = useNavigate();

  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [warningActionType, setWarningActionType] = useState('navigate');
  const [pendingAction, setPendingAction] = useState(null);

  const [tooltip, setTooltip] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const [showDeleteMenu, setShowDeleteMenu] = useState(false);

  // サイドバーの開閉状態をlocalStorageに保存
  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(isOpen));
  }, [isOpen]);

  const isHomePage = location.pathname === '/' || location.pathname === '/home';
  const isSearchPage = location.pathname === '/search';
  const isFeedPage = location.pathname === '/feed';
  const isProfilePage = location.pathname.includes('/@') || (user && location.pathname === `/${user.customId}`);

  const isWidgetActive = (type) => {
    return activeWidgets.some((w) => w.type === type);
  };

  const handleUniqueWidgetClick = (widget) => {
    if (isWidgetActive(widget.id)) {
      onRemoveWidget?.(widget.id);
    } else {
      onAddWidget?.(widget.id, widget.defaultSize);
    }
  };

  const loadTimerSettings = () => {
    try {
      const saved = localStorage.getItem('timerSettings');
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
      console.error('タイマー設定の読み込みエラー:', error);
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
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [totalCycles, setTotalCycles] = useState(initialSettings.totalCycles);
  const [countdownMinutes, setCountdownMinutes] = useState(initialSettings.countdownMinutes);
  const [alarmVolume, setAlarmVolume] = useState(initialSettings.alarmVolume);
  const [pomodoroSections, setPomodoroSections] = useState(initialSettings.pomodoroSections);

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

  useEffect(() => {
    notifyTimerSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddSection = () => {
    const newId = Math.max(...pomodoroSections.map((s) => s.id), 0) + 1;
    setPomodoroSections([...pomodoroSections, { id: newId, workMinutes: '25', breakMinutes: '5' }]);
  };

  const handleRemoveSection = (id) => {
    if (pomodoroSections.length > 1) {
      setPomodoroSections(pomodoroSections.filter((s) => s.id !== id));
    }
  };

  const handleSectionChange = (id, field, value) => {
    setPomodoroSections(pomodoroSections.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const notifyTimerSettings = (
    sections = pomodoroSections,
    mode = displayMode,
    cycles = totalCycles,
    cdMinutes = countdownMinutes,
    volume = alarmVolume,
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

  const handleCloseModal = () => {
    notifyTimerSettings();
    setIsTimerModalOpen(false);
  };

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
    [isTimerRunning],
  );

  const handleWarningConfirm = useCallback(() => {
    stopTimer();
    if (pendingAction) {
      setTimeout(() => {
        pendingAction();
        setPendingAction(null);
      }, 100);
    }
  }, [stopTimer, pendingAction]);

  const handleTimerSettingsClick = () => {
    showTimerWarning('settings', () => setIsTimerModalOpen(true));
  };

  const handleTimerClick = handleTimerSettingsClick;

  const handleStatsClick = () => {
    showTimerWarning('stats', () => setIsStatsModalOpen(true));
  };

  const handleProfileClick = () => {
    if (user?.customId) {
      showTimerWarning('navigate', () => navigate(`/${user.customId}`));
    }
  };

  const handleHomeClick = () => {
    showTimerWarning('navigate', () => navigate('/'));
  };

  const handleSearchClick = () => {
    showTimerWarning('navigate', () => navigate('/search'));
  };

  const handleFeedClick = () => {
    showTimerWarning('navigate', () => navigate('/feed'));
  };

  const handleLogout = () => {
    showTimerWarning('navigate', () => logout());
  };

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isTimerRunning) {
        e.preventDefault();
        e.returnValue = 'タイマーが動作中です。ページを離れると作業時間が保存されます。';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isTimerRunning]);

  const handleTooltip = (text, pos = null) => {
    setTooltip(text);
    if (pos) setTooltipPos(pos);
  };

  return (
    <div
      className={`${isOpen ? 'w-64' : 'w-20'} bg-white shadow-lg transition-all duration-300 flex flex-col fixed h-screen left-0 top-0 z-50`}
    >
      {/* ヘッダー */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        {isOpen && (
          <button onClick={() => handleHomeClick()} className="flex items-baseline gap-1">
            <img src="/images/alarm-clock-microsoft.webp" alt="logo" className="w-8 h-8" />
            <span className="text-gray-800 relative bottom-[6px]">ippi</span>
          </button>
        )}
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
                handleTooltip('折りたたむ', { x: rect.right + 20, y: rect.top + rect.height / 2 });
              }}
              onMouseLeave={() => handleTooltip(null)}
            />
          ) : (
            <ArrowRightFromLine
              className="w-5 h-5 text-gray-600"
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                handleTooltip('展開', { x: rect.right + 20, y: rect.top + rect.height / 2 });
              }}
              onMouseLeave={() => handleTooltip(null)}
            />
          )}
        </button>
      </div>

      {/* navi */}
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

      {/* ウィジェットセクション（ホームのみ） */}
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

      {/* カスタム要素追加ボタン（プロフィールのみ） */}
      {isProfilePage && isOwnProfile && (
        <CustomElementButtons isOpen={isOpen} addRowFunction={addRowFunction} onTooltip={handleTooltip} />
      )}

      {/* spacer */}
      <div className="flex-1"></div>

      {/* footer */}
      <SidebarFooter
        isOpen={isOpen}
        user={user}
        onStatsClick={handleStatsClick}
        onProfileClick={handleProfileClick}
        onLogout={handleLogout}
        onLoginClick={() => navigate('/login')}
        onTooltip={handleTooltip}
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
              transform: 'translate(0, -50%)',
            }}
          >
            {tooltip}
            <div
              className="absolute w-0 h-0 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-gray-800"
              style={{
                left: '-4px',
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            />
          </div>,
          document.body,
        )}
    </div>
  );
}

export default Sidebar;
