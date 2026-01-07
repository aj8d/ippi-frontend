import { useEffect, useRef } from 'react';
import { useAchievementNotification } from './useAchievementNotification';
import { API_ENDPOINTS } from '../config';

/**
 * アチーブメント達成をポーリングで確認するカスタムフック
 */
export function useAchievementChecker(token) {
  const { showAchievementNotification } = useAchievementNotification();
  const lastCheckedRef = useRef(new Set());
  const isCheckingRef = useRef(false);

  useEffect(() => {
    if (!token) return;

    const checkAchievements = async () => {
      if (isCheckingRef.current) return;
      isCheckingRef.current = true;

      try {
        const response = await fetch(API_ENDPOINTS.ACHIEVEMENTS.USER, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const achievements = data.achievements || [];

          // 新しく達成されたアチーブメントを検出
          achievements.forEach((achievement) => {
            if (achievement.achieved && !lastCheckedRef.current.has(achievement.id)) {
              // 初回読み込み時は通知しない（achievedAtが最近5秒以内の場合のみ通知）
              const achievedAt = achievement.achievedAt;
              const now = Date.now();
              const fiveSecondsAgo = now - 5000;

              if (achievedAt && achievedAt > fiveSecondsAgo) {
                showAchievementNotification(achievement.name, achievement.description);
              }

              lastCheckedRef.current.add(achievement.id);
            }
          });
        }
      } catch (error) {
        console.error('アチーブメントチェックエラー:', error);
      } finally {
        isCheckingRef.current = false;
      }
    };

    // 初回チェック
    checkAchievements();

    // 5秒ごとにチェック
    const interval = setInterval(checkAchievements, 5000);

    return () => clearInterval(interval);
  }, [token, showAchievementNotification]);
}
