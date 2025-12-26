import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ActivityCalendar from '../components/ActivityCalendar';
import Sidebar from '../components/Sidebar';

export default function Profile() {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(user?.profileImageUrl || null);
  const [uploadError, setUploadError] = useState(null);
  const [userName, setUserName] = useState(user?.name || '');
  const [userDescription, setUserDescription] = useState(user?.description || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!token) return;

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
  }, [token]);

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
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSaveProfile = async () => {
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
        }),
      });

      if (response.ok) {
        setIsEditing(false);
        await fetchLatestProfile();
      } else {
        const errorText = await response.text();
        console.error('Update error:', errorText);
        alert('プロフィール更新に失敗しました');
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} onTimerSettingsChange={() => {}} />

      {/* メインコンテンツ */}
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-20'} flex-1 transition-all duration-300`}>
        <div className="p-5 max-w-6xl mx-auto">
          {user ? (
            <div>
              {/* プロフィール画像セクション */}
              <div className="mb-8 flex items-center gap-5">
                <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden border-4 border-green-500">
                  {profileImageUrl ? (
                    <img src={profileImageUrl} alt="プロフィール" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-5xl">👤</div>
                  )}
                </div>

                <div>
                  <p className="text-lg mb-2.5 font-bold">{userName || '名前なし'}</p>
                  <p className="text-sm text-gray-600 mb-3.75 whitespace-pre-wrap">
                    {userDescription || '説明文はまだ設定されていません'}
                  </p>
                  <button
                    onClick={() => setIsEditing(true)}
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
                </div>
              </div>

              {/* ユーザー情報 */}
              <hr className="my-5" />

              {/* GitHub-style アクティビティカレンダーを追加 */}
              {stats && stats.length > 0 && <ActivityCalendar stats={stats} />}

              <div className="mt-5">
                <button onClick={handleLogout} className="mr-2.5 px-3 py-2 bg-gray-300 rounded hover:bg-gray-400">
                  ログアウト
                </button>
                <button onClick={() => navigate('/')} className="px-3 py-2 bg-gray-300 rounded hover:bg-gray-400">
                  ホームへ戻る
                </button>
              </div>
            </div>
          ) : (
            <p>ユーザー情報を読み込み中...</p>
          )}
        </div>
      </div>

      {/* モーダル */}
      {isEditing && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => {
            setIsEditing(false);
            setUserName(user?.name || '');
            setUserDescription(user?.description || '');
          }}
        >
          {/* モーダル内容 */}
          <div className="bg-white rounded-lg p-7.5 max-w-md w-11/12 shadow-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-5 mt-0 text-xl font-bold">プロフィールを編集</h2>

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
                  setUserName(user?.name || '');
                  setUserDescription(user?.description || '');
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
