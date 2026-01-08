import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config';

/**
 * プロフィールページ用のフォロー機能フック
 */
export function useProfileFollow(profileUserId, token) {
  const navigate = useNavigate();
  const [followStats, setFollowStats] = useState({ followersCount: 0, followingCount: 0, isFollowing: false });
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  // フォロー統計取得
  const fetchFollowStats = useCallback(async () => {
    if (!profileUserId) return;

    try {
      const headers = token
        ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        : { 'Content-Type': 'application/json' };

      const response = await fetch(API_ENDPOINTS.FOLLOW.STATS(profileUserId), {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setFollowStats(data);
      }
    } catch (error) {
      console.error('フォロー統計取得エラー:', error);
    }
  }, [profileUserId, token]);

  useEffect(() => {
    fetchFollowStats();
  }, [fetchFollowStats]);

  // フォロー/アンフォロー
  const handleFollowToggle = async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    if (!profileUserId) return;

    setIsFollowLoading(true);
    const method = followStats.isFollowing ? 'DELETE' : 'POST';

    try {
      const response = await fetch(API_ENDPOINTS.FOLLOW.BASE(profileUserId), {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFollowStats((prev) => ({
          ...prev,
          isFollowing: !prev.isFollowing,
          followersCount: data.followersCount,
        }));
      }
    } catch (error) {
      console.error('フォロー操作エラー:', error);
    } finally {
      setIsFollowLoading(false);
    }
  };

  return {
    followStats,
    isFollowLoading,
    handleFollowToggle,
  };
}
