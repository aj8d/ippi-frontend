import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config';
import { DEFAULT_PROFILE_THEME, normalizeProfileTheme } from '../components/profile/profileThemes';

export function useProfile(id, user) {
  const navigate = useNavigate();
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [userName, setUserName] = useState('');
  const [userDescription, setUserDescription] = useState('');
  const [userCustomId, setUserCustomId] = useState('');
  const [profileTheme, setProfileTheme] = useState(DEFAULT_PROFILE_THEME);
  const [profileUserId, setProfileUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  // isOwnProfileを計算（userIdで比較）
  const isOwnProfile = user && profileUserId && user.userId === profileUserId;

  // ログイン後のプロフィール初期化
  useEffect(() => {
    if (user && !id) {
      if (user.customId) {
        navigate(`/${user.customId}`, { replace: true });
      }
    }
  }, [user, id, navigate]);

  // URL パラメータでプロフィールを取得
  useEffect(() => {
    if (!id) {
      return;
    }

    const fetchProfileById = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.AUTH.PROFILE_BY_ID(id), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProfileImageUrl(data.profileImageUrl);
          setUserName(data.name);
          setUserDescription(data.description || '');
          setUserCustomId(data.customId || '');
          if (data.profileTheme || data.profileThemePreset) {
            setProfileTheme(normalizeProfileTheme(data.profileTheme || data.profileThemePreset));
          }
          setProfileUserId(data.userId);
        } else {
          console.error('Failed to fetch profile');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchProfileById();
  }, [id, user]);

  const fetchLatestProfile = useCallback(async (token) => {
    if (!token) return;
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.PROFILE, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfileImageUrl(data.profileImageUrl);
        setUserName(data.name);
        setUserDescription(data.description || '');
        setUserCustomId(data.customId || '');
        if (data.profileTheme || data.profileThemePreset) {
          setProfileTheme(normalizeProfileTheme(data.profileTheme || data.profileThemePreset));
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }, []);

  return {
    profileImageUrl,
    setProfileImageUrl,
    userName,
    setUserName,
    userDescription,
    setUserDescription,
    userCustomId,
    setUserCustomId,
    profileTheme,
    setProfileTheme,
    profileUserId,
    isOwnProfile,
    loading,
    fetchLatestProfile,
  };
}
