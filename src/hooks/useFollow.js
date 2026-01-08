/**
 * フォロー機能用カスタムフック
 *
 * - フォロー/アンフォロー処理の共通化
 * - フォロー中のユーザーID管理
 * - フォロー統計の取得
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { API_ENDPOINTS } from '../config';

/**
 * フォロー機能を提供するカスタムフック
 * @returns {Object} フォロー関連の状態と関数
 */
export function useFollow() {
  const navigate = useNavigate();
  const { token, user: currentUser } = useAuth();

  const [followingIds, setFollowingIds] = useState(new Set());
  const [followingLoading, setFollowingLoading] = useState({});

  /**
   * 自分がフォローしているユーザーIDリストを取得
   */
  const fetchFollowingIds = useCallback(async () => {
    if (!token || !currentUser?.userId) return;

    try {
      const response = await fetch(API_ENDPOINTS.FOLLOW.FOLLOWING(currentUser.userId), {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const ids = new Set(data.map((u) => u.id));
        setFollowingIds(ids);
      }
    } catch (error) {
      console.error('フォロー中リスト取得エラー:', error);
    }
  }, [token, currentUser?.userId]);

  /**
   * フォロー/アンフォローを切り替える
   * @param {Event} e - イベントオブジェクト（オプション、クリックイベントの伝播防止用）
   * @param {number} userId - 対象ユーザーID
   * @returns {Promise<boolean>} 成功時true
   */
  const toggleFollow = useCallback(
    async (e, userId) => {
      if (e) e.stopPropagation();

      if (!token) {
        navigate('/login');
        return false;
      }

      setFollowingLoading((prev) => ({ ...prev, [userId]: true }));

      const isFollowing = followingIds.has(userId);
      const method = isFollowing ? 'DELETE' : 'POST';

      try {
        const response = await fetch(API_ENDPOINTS.FOLLOW.BASE(userId), {
          method,
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          setFollowingIds((prev) => {
            const newSet = new Set(prev);
            if (isFollowing) {
              newSet.delete(userId);
            } else {
              newSet.add(userId);
            }
            return newSet;
          });
          return true;
        } else {
          const error = await response.json();
          console.error('フォロー操作エラー:', error);
          return false;
        }
      } catch (error) {
        console.error('フォロー操作エラー:', error);
        return false;
      } finally {
        setFollowingLoading((prev) => ({ ...prev, [userId]: false }));
      }
    },
    [token, followingIds, navigate]
  );

  /**
   * ユーザーをフォローしているかチェック
   * @param {number} userId - 対象ユーザーID
   * @returns {boolean}
   */
  const isFollowing = useCallback(
    (userId) => {
      return followingIds.has(userId);
    },
    [followingIds]
  );

  /**
   * フォロー中のローディング状態を取得
   * @param {number} userId - 対象ユーザーID
   * @returns {boolean}
   */
  const isLoading = useCallback(
    (userId) => {
      return !!followingLoading[userId];
    },
    [followingLoading]
  );

  return {
    followingIds,
    fetchFollowingIds,
    toggleFollow,
    isFollowing,
    isLoading,
    currentUserId: currentUser?.userId,
  };
}

/**
 * 特定ユーザーのフォロー統計を取得するフック
 * @param {number} userId - 対象ユーザーID
 */
export function useFollowStats(userId) {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    followersCount: 0,
    followingCount: 0,
    isFollowing: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  /**
   * フォロー統計を取得
   */
  const fetchStats = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const headers = token
        ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        : { 'Content-Type': 'application/json' };

      const response = await fetch(API_ENDPOINTS.FOLLOW.STATS(userId), { headers });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('フォロー統計取得エラー:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, token]);

  /**
   * フォロー/アンフォローを切り替え、統計を更新
   */
  const toggleFollow = useCallback(async () => {
    if (!token) {
      navigate('/login');
      return false;
    }

    if (!userId) return false;

    setIsLoading(true);
    const method = stats.isFollowing ? 'DELETE' : 'POST';

    try {
      const response = await fetch(API_ENDPOINTS.FOLLOW.BASE(userId), {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats((prev) => ({
          ...prev,
          isFollowing: !prev.isFollowing,
          followersCount: data.followersCount,
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('フォロー操作エラー:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userId, token, stats.isFollowing, navigate]);

  return {
    stats,
    isLoading,
    fetchStats,
    toggleFollow,
  };
}
