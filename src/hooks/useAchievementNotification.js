import { useContext } from 'react';
import { AchievementNotificationContext } from '../contexts/AchievementNotification';

export function useAchievementNotification() {
  const context = useContext(AchievementNotificationContext);
  if (!context) {
    throw new Error('useAchievementNotification must be used within AchievementNotificationProvider');
  }
  return context;
}
