import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { API_ENDPOINTS } from '../config';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, setTokenAndUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    if (result.success && result.customId) {
      navigate(`/${result.customId}`);
    } else if (result.success) {
      // customId がない場合はホームに遷移
      navigate('/');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setError('');
      setLoading(true);

      // Google ID Token をバックエンドに送信
      const response = await fetch(API_ENDPOINTS.AUTH.GOOGLE_LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: credentialResponse.credential,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // AuthContextを更新してユーザー状態を反映
        setTokenAndUser(data.token, {
          userId: data.userId,
          email: data.email,
          name: data.name,
          profileImageUrl: data.profileImageUrl,
          description: data.description,
          customId: data.customId,
        });
        
        // customId がある場合はプロフィールページにリダイレクト
        if (data.customId) {
          navigate(`/${data.customId}`);
        } else {
          // customId がない場合は設定ページへ誘導
          navigate('/register?step=2&google=true');
        }
      } else {
        setError(data.message || 'Google ログインに失敗しました');
      }
    } catch (err) {
      setError('エラーが発生しました: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google ログインに失敗しました。コンソールでエラーを確認してください。');
    console.error('Google OAuth Error occurred');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* カード型コンテナ */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Login</h1>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* ログインフォーム */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* メールアドレス入力 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="example@email.com"
            />
          </div>

          {/* パスワード入力 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="••••••••"
            />
          </div>

          {/* ログインボタン */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition duration-200 transform hover:scale-105 active:scale-95"
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        {/* 区切り線 */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-3 text-gray-500 text-sm">または</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Google Sign-In */}
        <GoogleOAuthProvider clientId="226358310830-ej5ltkmrnaq3bgcog0p4nler40viutfd.apps.googleusercontent.com">
          <div className="flex justify-center mb-6">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              text="signin_with"
              theme="outline"
              size="large"
            />
          </div>
        </GoogleOAuthProvider>

        {/* 登録リンク */}
        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-gray-600 text-sm">
            アカウントがない場合は{' '}
            <a href="/register" className="text-blue-600 hover:text-blue-700 font-semibold underline">
              登録はこちら
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
