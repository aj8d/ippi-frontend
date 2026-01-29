import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, UserMinus } from 'lucide-react';
import { API_ENDPOINTS } from '../config';
import UserAvatar from './UserAvatar';

export default function UserCard({
  user,
  showFollowButton = false,
  isFollowing = false,
  onFollowToggle,
  isCurrentUser = false,
  token,
}) {
  const navigate = useNavigate();
  const [followLoading, setFollowLoading] = useState(false);
  const [internalIsFollowing, setInternalIsFollowing] = useState(isFollowing);

  // propsのisFollowingが変更されたら内部状態も更新
  useEffect(() => {
    setInternalIsFollowing(isFollowing);
  }, [isFollowing]);

  // プロフィールページへ遷移
  const handleCardClick = () => {
    navigate(`/${user.customId}`);
  };

  // フォロー/アンフォロー処理
  const handleFollowClick = async (e) => {
    e.stopPropagation(); // カードのクリックイベントを止める

    console.log('フォローボタンクリック:', { token: !!token, followLoading, userId: user.userId });

    if (!token) {
      console.log('トークンがありません');
      return;
    }
    if (followLoading) {
      console.log('ローディング中');
      return;
    }

    setFollowLoading(true);
    try {
      const method = internalIsFollowing ? 'DELETE' : 'POST';
      const url = API_ENDPOINTS.follow(user.userId);
      console.log('API呼び出し:', { method, url });

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('APIレスポンス:', { ok: response.ok, status: response.status });

      if (response.ok) {
        const newFollowingState = !internalIsFollowing;
        setInternalIsFollowing(newFollowingState);

        // 親コンポーネントに通知
        if (onFollowToggle) {
          onFollowToggle(user.userId, newFollowingState);
        }
      } else {
        const errorData = await response.text();
        console.error('APIエラー:', errorData);
      }
    } catch (error) {
      console.error('フォロー処理エラー:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  // フォローボタンのレンダリング
  const renderFollowButton = () => {
    if (!showFollowButton || isCurrentUser) return null;

    return internalIsFollowing ? (
      <button
        onClick={handleFollowClick}
        disabled={followLoading}
        className="flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors disabled:opacity-50"
      >
        <UserMinus size={14} />
        フォロー中
      </button>
    ) : (
      <button
        onClick={handleFollowClick}
        disabled={followLoading}
        className="flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
      >
        <UserPlus size={14} />
        フォロー
      </button>
    );
  };

  return (
    <div
      onClick={handleCardClick}
      className="flex items-center justify-between p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors"
    >
      {/* ユーザー情報 */}
      <div className="flex items-center gap-3">
        {/* アバター */}
        <UserAvatar
          userId={user.userId}
          userName={user.userName}
          profileImageUrl={user.profileImageUrl}
          size="md"
          showStreakBadge={true}
        />

        {/* ユーザー詳細 */}
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-white">{user.userName}</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">@{user.customId}</span>
          {user.description && (
            <span className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-1">{user.description}</span>
          )}
        </div>
      </div>

      {/* フォローボタン */}
      {renderFollowButton()}
    </div>
  );
}
