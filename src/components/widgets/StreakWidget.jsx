/**
 * StreakWidget.jsx - キャンバス用ストリークウィジェット
 *
 * 📚 このコンポーネントの役割：
 * - 今日のタイマー完了回数を表示
 * - ポモドーロ/フローモドーロの作業セッション完了時にカウント
 */

import { useState, useEffect, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Flame } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { API_ENDPOINTS } from '../../config';

function StreakWidget() {
  const { token } = useAuth();
  const [displayCount, setDisplayCount] = useState(0);
  const [animationStage, setAnimationStage] = useState(0);
  const prevCountRef = useRef(0);

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
          const newCount = data.dailyTimerCompletions || 0;

          // カウントが変化した場合にアニメーションをトリガー
          if (newCount !== prevCountRef.current) {
            // ステージ1: 塗りつぶし開始
            setAnimationStage(1);

            // 400ms後に数字を更新し、ステージ2（解除）開始
            setTimeout(() => {
              setDisplayCount(newCount);
              setAnimationStage(2);
            }, 400);

            // 800ms後にアニメーション終了
            setTimeout(() => {
              setAnimationStage(0);
            }, 800);
          } else {
            // 初回または変化なし
            setDisplayCount(newCount);
          }

          prevCountRef.current = newCount;
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
    <div className="flex flex-col items-center justify-center h-full p-4 relative overflow-hidden">
      {/* 📚 炎アイコン（fill="currentColor" で塗りつぶし） */}
      <Flame size={48} className="text-orange-500 relative z-10" fill="currentColor" />

      {/* カウント数 */}
      <div className="text-4xl font-bold text-orange-500 mt-2 relative z-10">{displayCount}</div>

      {/* ステージ1: 上から下へのオレンジ色塗りつぶしアニメーション */}
      <AnimatePresence>
        {animationStage === 1 && (
          <motion.div
            className="absolute inset-0 bg-orange-500 z-20 pointer-events-none"
            initial={{ y: '-100%' }}
            animate={{ y: '0%' }}
            transition={{
              duration: 0.4,
              ease: 'easeInOut',
            }}
          />
        )}
      </AnimatePresence>

      {/* ステージ2: 上から下へのオレンジ色塗りつぶし解除アニメーション */}
      <AnimatePresence>
        {animationStage === 2 && (
          <motion.div
            className="absolute inset-0 bg-orange-500 z-20 pointer-events-none"
            initial={{ y: '0%' }}
            animate={{ y: '100%' }}
            transition={{
              duration: 0.4,
              ease: 'easeInOut',
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default StreakWidget;
