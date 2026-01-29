import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { API_ENDPOINTS } from '../config';

export function useFollow() {
  const navigate = useNavigate();
  const { token, user: currentUser } = useAuth();

  const [followingIds, setFollowingIds] = useState(new Set());
  const [followingLoading, setFollowingLoading] = useState({});

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
    [token, followingIds, navigate],
  );

  const isFollowing = useCallback(
    (userId) => {
      return followingIds.has(userId);
    },
    [followingIds],
  );

  const isLoading = useCallback(
    (userId) => {
      return !!followingLoading[userId];
    },
    [followingLoading],
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

export function useFollowStats(userId) {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    followersCount: 0,
    followingCount: 0,
    isFollowing: false,
  });
  const [isLoading, setIsLoading] = useState(false);

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
