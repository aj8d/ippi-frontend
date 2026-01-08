import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { API_ENDPOINTS } from '../config';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    // 初期化時にlocalStorageから復元
    return localStorage.getItem('token') || null;
  });
  const [loading, setLoading] = useState(() => {
    // トークンがない場合はloadingをfalseにする
    return localStorage.getItem('token') ? true : false;
  });

  // プロフィール情報を取得
  const fetchProfile = useCallback(async (authToken) => {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.PROFILE, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        // トークンが無効の場合はクリア
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // トークンが変更されたときにプロフィール情報を取得
  useEffect(() => {
    if (token) {
      fetchProfile(token);
    } else {
      setLoading(false);
    }
  }, [token, fetchProfile]);

  // ユーザー登録
  const register = async (email, password, name, customId) => {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name, customId }),
      });
      const data = await response.json();
      if (response.ok) {
        // 登録成功時は自動ログイン
        const token = data.token;
        setToken(token);
        setUser(data);
        localStorage.setItem('token', token);
        return { success: true, customId: data.customId };
      } else {
        return { success: false, message: data };
      }
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, message: error.message };
    }
  };

  // ユーザーログイン
  const login = async (email, password) => {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        const token = data.token;
        setToken(token);
        setUser(data);
        localStorage.setItem('token', token);
        return { success: true, customId: data.customId };
      } else {
        return { success: false, message: data };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, message: error.message };
    }
  };

  // ユーザーログアウト
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  // 外部からトークンを設定してユーザー情報を取得（Google認証用）
  const setTokenAndUser = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
  };

  // ユーザー情報を再取得
  const refreshUser = async () => {
    const currentToken = token || localStorage.getItem('token');
    if (currentToken) {
      await fetchProfile(currentToken);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, register, login, logout, setTokenAndUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// useAuth フック
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
