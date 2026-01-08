import { useContext } from 'react';
import { TimerCompletionNotificationContext } from '../contexts/TimerCompletionNotification';

export function useTimerCompletionNotification() {
  const context = useContext(TimerCompletionNotificationContext);

  if (!context) {
    throw new Error('useTimerCompletionNotification must be used within TimerCompletionNotificationProvider');
  }

  return context;
}
