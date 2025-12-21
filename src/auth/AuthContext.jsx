import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // ページロード時にlocalStorageからトークンを復元
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      // プロフィール情報を取得
      fetchProfile(savedToken);
    }
    setLoading(false);
  }, []);

  // プロフィール情報を取得
  const fetchProfile = async (authToken) => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/profile', {
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
    }
  };

  // ユーザー登録
  const register = async (email, password, name) => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await response.json();
      if (response.ok) {
        // 登録成功時は自動ログイン
        const token = data.token;
        setToken(token);
        setUser(data);
        localStorage.setItem('token', token);
        return { success: true };
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
      const response = await fetch('http://localhost:8080/api/auth/login', {
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
        return { success: true };
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

  return (
    <AuthContext.Provider value={{ user, token, loading, register, login, logout }}>{children}</AuthContext.Provider>
  );
}

// useAuth フック
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
