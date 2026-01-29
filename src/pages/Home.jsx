import { useState, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import FreeCanvas from '../components/FreeCanvas';
import MobileBottomNav from '../components/mobile/MobileBottomNav';
import MobileListCanvas from '../components/mobile/MobileListCanvas';
import FloatingAddButton from '../components/mobile/FloatingAddButton';
import TimerSettingsModal from '../components/sidebar/TimerSettingsModal';
import { useWidgets } from '../hooks/useWidgets';

function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [isMobileTimerModalOpen, setIsMobileTimerModalOpen] = useState(false);

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

  const [timerSettings, setTimerSettings] = useState({
    displayMode: initialSettings.displayMode,
    inputMinutes: '1',
    inputSeconds: '0',
    alarmVolume: initialSettings.alarmVolume,
  });

  const [displayMode, setDisplayMode] = useState(initialSettings.displayMode);
  const [totalCycles, setTotalCycles] = useState(initialSettings.totalCycles);
  const [countdownMinutes, setCountdownMinutes] = useState(initialSettings.countdownMinutes);
  const [pomodoroSections, setPomodoroSections] = useState(initialSettings.pomodoroSections);
  const [alarmVolume, setAlarmVolume] = useState(initialSettings.alarmVolume);

  const { widgets, setWidgets, loading } = useWidgets();

  const handleTimerSettingsChange = (settings) => {
    setTimerSettings(settings);
  };

  const saveMobileTimerSettings = useCallback(() => {
    const settings = {
      displayMode,
      totalCycles,
      pomodoroSections,
      countdownMinutes,
      alarmVolume,
    };
    localStorage.setItem('timerSettings', JSON.stringify(settings));

    // TimerWidgetに設定を反映
    setTimerSettings({
      displayMode,
      sections: pomodoroSections,
      totalCycles: parseInt(totalCycles) || 1,
      countdownMinutes: parseInt(countdownMinutes) || 25,
      alarmVolume,
    });
  }, [displayMode, totalCycles, pomodoroSections, countdownMinutes, alarmVolume]);

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

  const handleCloseMobileTimerModal = () => {
    saveMobileTimerSettings();
    setIsMobileTimerModalOpen(false);
  };

  const handleAddWidget = useCallback(
    (type, defaultSize) => {
      const getDefaultData = (widgetType) => {
        switch (widgetType) {
          case 'sticky':
            return { text: '', color: 'yellow', emoji: '' };
          case 'image':
            return { imageUrl: null, publicId: null };
          default:
            return {};
        }
      };

      setWidgets((prev) => {
        const maxZ = Math.max(...prev.map((w) => w.zIndex || 0), 0);
        const newWidget = {
          id: `widget-${Date.now()}`,
          type,
          x: 100 + Math.random() * 100,
          y: 100 + Math.random() * 100,
          width: defaultSize.width,
          height: defaultSize.height,
          data: getDefaultData(type),
          zIndex: maxZ + 1,
        };
        return [...prev, newWidget];
      });
    },
    [setWidgets],
  );

  const handleRemoveWidget = useCallback(
    (typeOrId) => {
      setWidgets((prev) => {
        const hasMatchingId = prev.some((widget) => widget.id === typeOrId);
        if (hasMatchingId) {
          return prev.filter((widget) => widget.id !== typeOrId);
        } else {
          return prev.filter((widget) => widget.type !== typeOrId);
        }
      });
    },
    [setWidgets],
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* デスクトップ用サイドバー */}
      <div className="hidden lg:block">
        <Sidebar
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          onTimerSettingsChange={handleTimerSettingsChange}
          onAddWidget={handleAddWidget}
          onRemoveWidget={handleRemoveWidget}
          activeWidgets={widgets}
        />
      </div>

      {/* メインコンテンツ */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {/* ローディング中の表示 */}
        {loading ? (
          <div className="flex items-center justify-center h-screen">
            <div className="text-gray-500">読み込み中...</div>
          </div>
        ) : (
          <>
            {/* デスクトップ：自由配置キャンバス */}
            <div className="hidden lg:block h-screen">
              <FreeCanvas widgets={widgets} setWidgets={setWidgets} timerSettings={timerSettings} />
            </div>

            {/* モバイル・タブレット：タイマーキャンバス */}
            <div className="lg:hidden">
              <MobileListCanvas timerSettings={timerSettings} />
            </div>
          </>
        )}
      </div>

      {/* モバイル用フローティングタイマー設定ボタン */}
      <FloatingAddButton onOpenTimerSettings={() => setIsMobileTimerModalOpen(true)} />

      {/* モバイル用タイマー設定モーダル */}
      <TimerSettingsModal
        isOpen={isMobileTimerModalOpen}
        displayMode={displayMode}
        totalCycles={totalCycles}
        countdownMinutes={countdownMinutes}
        pomodoroSections={pomodoroSections}
        alarmVolume={alarmVolume}
        onClose={handleCloseMobileTimerModal}
        onDisplayModeChange={setDisplayMode}
        onTotalCyclesChange={setTotalCycles}
        onCountdownMinutesChange={setCountdownMinutes}
        onSectionChange={handleSectionChange}
        onAddSection={handleAddSection}
        onRemoveSection={handleRemoveSection}
        onAlarmVolumeChange={setAlarmVolume}
      />

      {/* モバイル用ボトムナビゲーション */}
      <MobileBottomNav />
    </div>
  );
}

export default Home;
