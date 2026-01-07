import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Trophy, X } from 'lucide-react';
import { AchievementNotificationContext } from '../contexts/AchievementNotification';

export function AchievementNotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);

  const showAchievementNotification = useCallback((achievementName, achievementDescription) => {
    setNotification({
      name: achievementName,
      description: achievementDescription,
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
    <AchievementNotificationContext.Provider value={{ showAchievementNotification }}>
      {children}
      <AchievementNotification notification={notification} onClose={closeNotification} />
    </AchievementNotificationContext.Provider>
  );
}

// 通知UIコンポーネント
function AchievementNotification({ notification, onClose }) {
  if (!notification) return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-[9999] animate-slide-in-right">
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-2xl p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 bg-white/20 rounded-full p-2">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-white font-bold text-sm">🎉 アチーブメント達成！</p>
                <p className="text-white font-semibold mt-1">{notification.name}</p>
                <p className="text-white/90 text-sm mt-0.5">{notification.description}</p>
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
