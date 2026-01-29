import { memo } from 'react';
import { Timer } from 'lucide-react';
import TimerWidget from '../widgets/TimerWidget';

function MobileListCanvas({ timerSettings }) {
  return (
    <div className="min-h-screen bg-gray-100 pb-32">
      {/* タイマーウィジェット */}
      <div className="p-4">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* ヘッダー */}
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
            <Timer className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">タイマー</span>
          </div>

          {/* タイマーコンテンツ */}
          <div className="min-h-[300px]">
            <TimerWidget settings={timerSettings} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(MobileListCanvas);
