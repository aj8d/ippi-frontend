/**
 * UserAvatar.jsx - ユーザーアバターコンポーネント
 *
 * ストリークが1以上の場合、右下に炎マークを表示します。
 * Discordのオンライン表示のようなデザイン。
 */

import { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { API_ENDPOINTS } from '../config';

function UserAvatar({
  userId,
  userName,
  profileImageUrl,
  size = 'md',
  showStreakBadge = true,
  showBorder = false,
  className = '',
}) {
  const { token } = useAuth();
  const [dailyCompletions, setDailyCompletions] = useState(0);

  // サイズの設定
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
    '2xl': 'w-48 h-48',
  };

  const badgeSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
    '2xl': 'w-10 h-10',
  };

  const iconSizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
    '2xl': 'w-6 h-6',
  };

  const borderClasses = {
    sm: 'border-2',
    md: 'border-2',
    lg: 'border-2',
    xl: 'border-4',
    '2xl': 'border-4',
  };

  // プロフィール画像URLの処理
  const getAvatarUrl = () => {
    if (!profileImageUrl) return null;

    if (profileImageUrl.startsWith('http://') || profileImageUrl.startsWith('https://')) {
      return profileImageUrl;
    }

    return `${API_ENDPOINTS.BASE}${profileImageUrl}`;
  };

  const avatarUrl = getAvatarUrl();

  // ユーザーのストリーク情報を取得
  useEffect(() => {
    if (!showStreakBadge || !token || !userId) return;

    const fetchStreakStatus = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.USER_STATS.BASE}/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setDailyCompletions(data.dailyTimerCompletions || 0);
        }
      } catch (error) {
        console.error('Failed to fetch streak status:', error);
      }
    };

    fetchStreakStatus();
  }, [userId, token, showStreakBadge]);

  const hasStreak = dailyCompletions >= 1;
  const borderColor = showBorder ? (hasStreak ? 'border-orange-500' : 'border-gray-400') : 'border-transparent';

  return (
    <div className={`relative inline-block ${className}`}>
      {/* アバター画像 */}
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0 ${
          showBorder ? `${borderClasses[size]} ${borderColor}` : ''
        }`}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-xl font-bold">
            {userName?.charAt(0)?.toUpperCase() || '?'}
          </div>
        )}
      </div>

      {/* ストリークバッジ（Discordのオンライン表示風） */}
      {showStreakBadge && hasStreak && (
        <div
          className={`absolute bottom-0 right-0 ${badgeSizeClasses[size]} bg-orange-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center`}
          title={`今日のタイマー完了数: ${dailyCompletions}`}
        >
          <Flame className={`${iconSizeClasses[size]} text-white`} fill="currentColor" />
        </div>
      )}

      {/* ストリークが0の場合の灰色丸バッジ */}
      {showStreakBadge && !hasStreak && showBorder && (
        <div
          className={`absolute bottom-0 right-0 ${badgeSizeClasses[size]} bg-gray-400 rounded-full border-2 border-white dark:border-gray-800`}
          title="今日はまだタイマーを完了していません"
        />
      )}
    </div>
  );
}

export default UserAvatar;
