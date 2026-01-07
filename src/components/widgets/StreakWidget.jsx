/**
 * StreakWidget.jsx - キャンバス用ストリークウィジェット
 *
 * 📚 このコンポーネントの役割：
 * - 今日のタイマー完了回数を表示
 * - ポモドーロ/フローモドーロの作業セッション完了時にカウント
 */

import { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { API_ENDPOINTS } from '../../config';

function StreakWidget() {
  const { token } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!token) return;

    const fetchDailyCount = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.USER_STATS.ME, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCount(data.dailyTimerCompletions || 0);
        }
      } catch (error) {
        console.error('Failed to fetch daily count:', error);
      }
    };

    fetchDailyCount();

    // タイマー完了イベントをリッスンして自動更新
    const handleTimerCompleted = () => {
      fetchDailyCount();
    };

    window.addEventListener('timerCompleted', handleTimerCompleted);

    return () => {
      window.removeEventListener('timerCompleted', handleTimerCompleted);
    };
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      {/* 📚 炎アイコン（fill="currentColor" で塗りつぶし） */}
      <Flame size={48} className="text-orange-500" fill="currentColor" />

      {/* カウント数 */}
      <div className="text-4xl font-bold text-orange-500 mt-2">{count}</div>
    </div>
  );
}

export default StreakWidget;
