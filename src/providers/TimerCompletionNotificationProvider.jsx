import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, X } from 'lucide-react';
import { TimerCompletionNotificationContext } from '../contexts/TimerCompletionNotification';

export function TimerCompletionNotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);

  const showTimerCompletionNotification = useCallback((totalTime) => {
    setNotification({
      totalTime,
      id: Date.now(),
    });

    // 5秒後に自動で消す
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  }, []);

  const closeNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return (
    <TimerCompletionNotificationContext.Provider value={{ showTimerCompletionNotification }}>
      {children}
      <TimerCompletionNotification notification={notification} onClose={closeNotification} />
    </TimerCompletionNotificationContext.Provider>
  );
}

// 通知UIコンポーネント
function TimerCompletionNotification({ notification, onClose }) {
  if (!notification) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return createPortal(
    <div className="fixed top-4 right-4 z-[9999] animate-slide-in-right">
      <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg shadow-2xl p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 bg-white/20 rounded-full p-2">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-white font-bold text-sm">🎉 タイマー完了！</p>
                <p className="text-white font-semibold mt-1">作業お疲れさまでした</p>
                <p className="text-white/90 text-sm mt-0.5">作業時間: {formatTime(notification.totalTime)}</p>
              </div>
              <button onClick={onClose} className="flex-shrink-0 text-white/80 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
