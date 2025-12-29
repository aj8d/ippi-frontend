import { useAuth } from '../auth/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ActivityCalendar from '../components/ActivityCalendar';
import Sidebar from '../components/Sidebar';
import { createSwapy } from 'swapy';

export default function Profile() {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [stats, setStats] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [userName, setUserName] = useState('');
  const [userDescription, setUserDescription] = useState('');
  const [userCustomId, setUserCustomId] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [customIdError, setCustomIdError] = useState('');
  const [editingCustomId, setEditingCustomId] = useState('');

  // Swapy初期化
  useEffect(() => {
    if (!isOwnProfile) return;

    const container = document.querySelector('.swapy-container');
    if (!container) return;

    const swapy = createSwapy(container, {
      animation: 'dynamic',
    });

    return () => {
      swapy.destroy();
    };
  }, [isOwnProfile]);

  // ログイン後のプロフィール初期化
  useEffect(() => {
    if (user && !id) {
      // ログイン中で URL に id がない場合は、自分の customId で自動リダイレクト
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
        const response = await fetch(`http://localhost:8080/api/auth/${id}`, {
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
          // 自分のプロフィールか判定（ログイン中で customId が一致）
          setIsOwnProfile(user && user.customId === id);
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

  // スタッツ取得（自分のプロフィール＆ログイン状態）
  useEffect(() => {
    if (!isOwnProfile || !token) return;

    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/auth/stats', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
        } else {
          console.error('Failed to fetch stats');
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [isOwnProfile, token]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const fetchLatestProfile = async () => {
    if (!token) return;
    try {
      const response = await fetch('http://localhost:8080/api/auth/profile', {
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
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (editingCustomId && editingCustomId.length < 3) {
      setCustomIdError('IDは3文字以上である必要があります');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('http://localhost:8080/api/auth/update-profile', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userName,
          description: userDescription,
          customId: editingCustomId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsEditing(false);
        setUserCustomId(data.customId || '');
        setEditingCustomId('');
        setCustomIdError('');
        await fetchLatestProfile();
      } else {
        const errorText = await response.text();
        console.error('Update error:', errorText);
        if (errorText.includes('既に使用されています')) {
          setCustomIdError('このIDは既に使用されています');
        } else {
          alert('プロフィール更新に失敗しました');
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('プロフィール更新中にエラーが発生しました');
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8080/api/auth/upload-profile-image', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setProfileImageUrl(data.profileImageUrl);
        await fetchLatestProfile();
      } else {
        const errorText = await response.text();
        console.error('Upload error response:', errorText);
        setUploadError(`アップロード失敗: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError(`エラー: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {isOwnProfile && <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} onTimerSettingsChange={() => {}} />}

      {/* メインコンテンツ */}
      <div
        className={`${
          isOwnProfile && sidebarOpen ? 'ml-64' : isOwnProfile ? 'ml-20' : 'ml-0'
        } flex-1 transition-all duration-300`}
      >
        <div className="p-5 max-w-6xl mx-auto">
          {/* プロフィール画像セクション */}
          <div className="mb-8 flex items-center gap-5">
            <div className="w-48 h-48 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden border-4 border-green-500">
              {profileImageUrl ? (
                <img src={profileImageUrl} alt="プロフィール" className="w-full h-full object-cover" />
              ) : (
                <div className="text-5xl">👤</div>
              )}
            </div>

            <div>
              <p className="text-lg mb-2.5 font-bold">{userName || '名前なし'}</p>
              {userCustomId && <p className="text-sm text-gray-500 mb-2">ID: {userCustomId}</p>}
              <p className="text-sm text-gray-600 mb-3.75 whitespace-pre-wrap">
                {userDescription || '説明文はまだ設定されていません'}
              </p>
              {isOwnProfile && (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setEditingCustomId(userCustomId);
                    }}
                    className="px-4 py-2 bg-green-500 text-white rounded cursor-pointer mb-2.5 hover:bg-green-600"
                  >
                    編集
                  </button>

                  {/* 画像アップロード */}
                  <div className="mt-2.5">
                    <label
                      className={`inline-block px-4 py-2 bg-green-500 text-white rounded cursor-pointer transition-opacity ${
                        uploading ? 'opacity-60 cursor-not-allowed' : 'opacity-100 hover:bg-green-600'
                      }`}
                    >
                      {uploading ? '保存中...' : '画像をアップロード'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImageUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                    {uploadError && <p className="text-red-500 mt-2 text-xs">{uploadError}</p>}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ユーザー情報 */}
          <hr className="my-5" />

          {/* GitHub-style アクティビティカレンダーを追加 */}
          {stats && stats.length > 0 && <ActivityCalendar stats={stats} />}

          {/* iPhone ウィジェット風 - 統計情報（Swapy対応） */}
          {isOwnProfile && (
            <div className="swapy-container mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* スロット1: 本日の達成 */}
              <div data-swapy-slot="achievement">
                <div
                  data-swapy-item="achievement-widget"
                  className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6 text-white shadow-lg"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm opacity-90">本日の達成</p>
                      <h3 className="text-3xl font-bold mt-2">
                        {stats && stats.length > 0 ? Math.floor(Math.random() * 10) : 0}/10
                      </h3>
                      <p className="text-sm opacity-75 mt-2">タスク完了</p>
                    </div>
                    <div className="text-4xl">✓</div>
                  </div>
                  <div className="bg-white/20 rounded-full h-2 mt-4">
                    <div className="bg-white rounded-full h-2 w-3/5"></div>
                  </div>
                </div>
              </div>

              {/* スロット2: 総タスク数 */}
              <div data-swapy-slot="total-tasks">
                <div
                  data-swapy-item="total-tasks-widget"
                  className="bg-white rounded-3xl p-6 shadow-md border border-gray-100"
                >
                  <p className="text-gray-600 text-sm font-medium">総タスク数</p>
                  <div className="text-center mt-4">
                    <div className="text-5xl font-bold text-purple-600">
                      {stats && stats.length > 0 ? stats.length : 0}
                    </div>
                    <p className="text-gray-500 text-sm mt-3">登録済み</p>
                  </div>
                  <button className="w-full mt-4 bg-purple-500 hover:bg-purple-600 text-white rounded-full py-2 font-semibold transition">
                    詳細を見る
                  </button>
                </div>
              </div>

              {/* スロット3: 連続記録 */}
              <div data-swapy-slot="streak">
                <div
                  data-swapy-item="streak-widget"
                  className="bg-white rounded-3xl p-6 shadow-md border border-gray-100"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-600 text-sm">連続記録</p>
                      <h3 className="text-3xl font-bold text-orange-500 mt-2">7日</h3>
                    </div>
                    <div className="text-4xl">🔥</div>
                  </div>
                  <p className="text-gray-500 text-xs mt-4">調子いいですね！</p>
                </div>
              </div>

              {/* スロット4: 今週の統計 */}
              <div data-swapy-slot="weekly-stats" className="lg:col-span-2">
                <div
                  data-swapy-item="weekly-stats-widget"
                  className="bg-white rounded-3xl p-6 shadow-md border border-gray-100"
                >
                  <p className="text-gray-700 font-semibold mb-4">今週の統計</p>
                  <div className="flex justify-between items-end gap-2">
                    {['月', '火', '水', '木', '金', '土', '日'].map((day, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div
                          className={`w-8 rounded-full transition ${
                            [
                              'bg-blue-500',
                              'bg-blue-400',
                              'bg-gray-200',
                              'bg-blue-500',
                              'bg-blue-400',
                              'bg-gray-200',
                              'bg-blue-300',
                            ][i]
                          }`}
                          style={{ height: ['60px', '50px', '10px', '70px', '55px', '15px', '45px'][i] }}
                        ></div>
                        <p className="text-xs text-gray-600 mt-2">{day}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* スロット5: クイックアクション */}
              <div data-swapy-slot="quick-actions">
                <div
                  data-swapy-item="quick-actions-widget"
                  className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-6 text-white shadow-lg"
                >
                  <p className="text-sm opacity-90 mb-4">クイックアクション</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="bg-white/20 hover:bg-white/30 rounded-2xl py-3 font-semibold transition text-xs">
                      新規タスク
                    </button>
                    <button className="bg-white/20 hover:bg-white/30 rounded-2xl py-3 font-semibold transition text-xs">
                      集中開始
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-5">
            {isOwnProfile ? (
              <>
                <button onClick={handleLogout} className="mr-2.5 px-3 py-2 bg-gray-300 rounded hover:bg-gray-400">
                  ログアウト
                </button>
                <button onClick={() => navigate('/')} className="px-3 py-2 bg-gray-300 rounded hover:bg-gray-400">
                  ホームへ戻る
                </button>
              </>
            ) : (
              <button onClick={() => navigate('/')} className="px-3 py-2 bg-gray-300 rounded hover:bg-gray-400">
                ホームへ戻る
              </button>
            )}
          </div>
        </div>
      </div>

      {/* モーダル */}
      {isEditing && isOwnProfile && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => {
            setIsEditing(false);
            setEditingCustomId('');
            setCustomIdError('');
          }}
        >
          {/* モーダル内容 */}
          <div className="bg-white rounded-lg p-7.5 max-w-md w-11/12 shadow-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-5 mt-0 text-xl font-bold">プロフィールを編集</h2>

            <div className="mb-3.75">
              <label className="block mb-1.25 font-bold">カスタムID</label>
              <input
                type="text"
                value={editingCustomId}
                onChange={(e) => {
                  setEditingCustomId(e.target.value);
                  setCustomIdError('');
                }}
                placeholder="例: myprofile"
                className="w-full p-2.5 rounded border border-gray-300 text-sm box-border"
              />
              {customIdError && <p className="text-red-500 text-xs mt-1">{customIdError}</p>}
              <p className="text-xs text-gray-500 mt-1">3〜50文字の英数字とハイフン、アンダースコアが使用できます</p>
            </div>

            <div className="mb-3.75">
              <label className="block mb-1.25 font-bold">名前</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full p-2.5 rounded border border-gray-300 text-sm box-border"
              />
            </div>

            <div className="mb-5">
              <label className="block mb-1.25 font-bold">説明文</label>
              <textarea
                value={userDescription}
                onChange={(e) => setUserDescription(e.target.value)}
                placeholder="自己紹介を入力してください..."
                className="w-full p-2.5 rounded border border-gray-300 text-sm min-h-24 font-inherit resize-vertical box-border"
              />
            </div>

            <div className="flex gap-2.5 justify-end">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditingCustomId('');
                  setCustomIdError('');
                }}
                className="px-5 py-2.5 bg-gray-600 text-white rounded cursor-pointer text-sm hover:bg-gray-700"
              >
                キャンセル
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className={`px-5 py-2.5 bg-green-500 text-white rounded text-sm font-bold hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {isSaving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
