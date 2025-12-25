import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import SwapyContainer from '../swapy/SwapyContainer';

function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [timerSettings, setTimerSettings] = useState({
    displayMode: 'countdown',
    inputMinutes: '1',
    inputSeconds: '0',
  });

  const handleTimerSettingsChange = (settings) => {
    setTimerSettings(settings);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} onTimerSettingsChange={handleTimerSettingsChange} />

      {/* メインコンテンツ */}
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-20'} flex-1 transition-all duration-300`}>
        <SwapyContainer timerSettings={timerSettings} />
      </div>
    </div>
  );
}

export default Home;
