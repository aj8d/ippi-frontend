import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { API_ENDPOINTS } from '../config';

export default function Register() {
  const [searchParams] = useSearchParams();
  const isGoogleRedirect = searchParams.get('google') === 'true';
  const initialStep = searchParams.get('step') === '2' ? 2 : 1;

  const [step, setStep] = useState(initialStep); // 1: メール/パスワード, 2: ユーザーID/名前
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [customId, setCustomId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleToken, setGoogleToken] = useState(null); // Google認証時のトークン
  const { register, user, token, refreshUser } = useAuth();
  const navigate = useNavigate();

  // Google認証済みでStep 2に来た場合、既存のユーザー情報を使用
  useEffect(() => {
    if (isGoogleRedirect && token && user) {
      setGoogleToken(token);
      setEmail(user.email || '');
      setName(user.name || '');
    }
  }, [isGoogleRedirect, token, user]);

  // Step 1: メール/パスワード入力の送信
  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('メールアドレスは必須です');
      return;
    }

    if (!password.trim()) {
      setError('パスワードは必須です');
      return;
    }

    if (password.length < 6) {
      setError('パスワードは6文字以上である必要があります');
      return;
    }

    // Step 2へ進む
    setStep(2);
  };

  // Step 2: ユーザーID/名前入力の送信
  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!customId.trim()) {
      setError('IDは必須です');
      return;
    }

    if (customId.length < 3) {
      setError('IDは3文字以上である必要があります');
      return;
    }

    setLoading(true);

    // Google認証済みの場合はプロフィール更新API を呼ぶ
    if (googleToken || isGoogleRedirect) {
      try {
        const authToken = googleToken || token;
        const response = await fetch(API_ENDPOINTS.AUTH.UPDATE_PROFILE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ customId, name }),
        });

        if (response.ok) {
          // AuthContextのユーザー情報を更新してから遷移
          await refreshUser();
          navigate(`/${customId}`);
        } else {
          const data = await response.json();
          setError(data.message || data || 'プロフィールの更新に失敗しました');
        }
      } catch {
        console.error('Profile update error');
        setError('プロフィールの更新中にエラーが発生しました');
      } finally {
        setLoading(false);
      }
      return;
    }

    // 通常の登録フロー
    const result = await register(email, password, name, customId);
    if (result.success && result.customId) {
      navigate(`/${result.customId}`);
    } else if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  // Google Sign-Up成功
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setError('');
      setLoading(true);

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
        localStorage.setItem('token', data.token);
        // Google認証は Step 2へ直接進む
        setGoogleToken(data.token);
        setEmail(data.email || '');
        setStep(2);
      } else {
        setError(data.message || 'Google登録に失敗しました');
      }
    } catch {
      console.error('Google registration error');
      setError('Google登録中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google登録に失敗しました。コンソールでエラーを確認してください。');
    console.error('Google OAuth Error occurred');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* カード型コンテナ */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {googleToken || isGoogleRedirect ? 'ID設定' : 'Sign Up'}
          </h1>
          {googleToken || isGoogleRedirect ? (
            <p className="text-gray-600 text-sm">あと少しで完了です！ユーザーIDを設定してください</p>
          ) : (
            <p className="text-gray-600 text-sm">Step {step} of 2</p>
          )}
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* ステップ 1: メール/パスワード入力 */}
        {step === 1 && (
          <>
            <form onSubmit={handleStep1Submit} className="space-y-5">
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
                <p className="text-xs text-gray-500 mt-1">6文字以上のパスワードを設定してください</p>
              </div>

              {/* 次へボタン */}
              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200 transform hover:scale-105 active:scale-95"
              >
                次へ
              </button>
            </form>

            {/* 区切り線 */}
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-3 text-gray-500 text-sm">または</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Google Sign-Up */}
            <GoogleOAuthProvider clientId="226358310830-ej5ltkmrnaq3bgcog0p4nler40viutfd.apps.googleusercontent.com">
              <div className="flex justify-center mb-6">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  text="signup_with"
                  theme="outline"
                  size="large"
                />
              </div>
            </GoogleOAuthProvider>

            {/* ログインリンク */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-gray-600 text-sm">
                既にアカウントをお持ちの場合は{' '}
                <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold underline">
                  ログインはこちら
                </a>
              </p>
            </div>
          </>
        )}

        {/* ステップ 2: ユーザーID/名前入力 */}
        {step === 2 && (
          <>
            <form onSubmit={handleStep2Submit} className="space-y-5">
              {/* ユーザーID入力 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ユーザーID</label>
                <input
                  type="text"
                  value={customId}
                  onChange={(e) => setCustomId(e.target.value)}
                  placeholder="3文字以上50文字以下"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              {/* 名前入力 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">名前（オプション）</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="例：太郎"
                />
              </div>

              {/* ボタングループ */}
              <div className="flex gap-3">
                {!googleToken && !isGoogleRedirect && (
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-2 px-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition duration-200"
                  >
                    戻る
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className={`${
                    !googleToken && !isGoogleRedirect ? 'flex-1' : 'w-full'
                  } py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition duration-200 transform hover:scale-105 active:scale-95`}
                >
                  {loading ? '登録中...' : '登録'}
                </button>
              </div>
            </form>

            {/* 戻るリンク */}
            {!googleToken && !isGoogleRedirect && (
              <div className="text-center pt-4 border-t border-gray-200">
                <button
                  onClick={() => setStep(1)}
                  className="text-blue-600 hover:text-blue-700 font-semibold text-sm underline bg-none border-none cursor-pointer"
                >
                  前のステップに戻る
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
