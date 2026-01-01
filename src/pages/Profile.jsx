import { useAuth } from '../auth/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import ActivityCalendar from '../components/ActivityCalendar';
import StatsWidget from '../components/StatsWidget';
import Sidebar from '../components/Sidebar';
import ProfileWidgetManager, { WidgetAddButton } from '../components/ProfileWidgetManager';
import { UserPlus, UserMinus, Users, MoreVertical, Edit, Upload } from 'lucide-react';
import { API_ENDPOINTS, API_BASE_URL } from '../config';

export default function Profile() {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [stats, setStats] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved !== null ? JSON.parse(saved) : true;
  });
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

  // フォロー関連のステート
  const [profileUserId, setProfileUserId] = useState(null);
  const [followStats, setFollowStats] = useState({ followersCount: 0, followingCount: 0, isFollowing: false });
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [addRowFunction, setAddRowFunction] = useState(null);

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
          setProfileUserId(data.userId);
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

  // スタッツ取得（自分のプロフィール＆ログイン状態）
  useEffect(() => {
    if (!isOwnProfile || !token) return;

    const fetchStats = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.AUTH.STATS, {
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
      const response = await fetch(API_ENDPOINTS.AUTH.UPDATE_PROFILE, {
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

      const response = await fetch(API_ENDPOINTS.AUTH.UPLOAD_IMAGE, {
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
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onTimerSettingsChange={() => {}}
        isOwnProfile={isOwnProfile}
        addRowFunction={addRowFunction}
      />

      {/* メインコンテンツ */}
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-20'} flex-1 transition-all duration-300`}>
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

              {/* フォロー統計 */}
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => navigate(`/${userCustomId}/followers`)}
                  className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <Users className="w-4 h-4" />
                  <span className="font-semibold">{followStats.followersCount}</span>
                  <span className="text-gray-500">フォロワー</span>
                </button>
                <button
                  onClick={() => navigate(`/${userCustomId}/following`)}
                  className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <span className="font-semibold">{followStats.followingCount}</span>
                  <span className="text-gray-500">フォロー中</span>
                </button>
              </div>

              {/* フォローボタン（他人のプロフィールの場合） */}
              {!isOwnProfile && (
                <button
                  onClick={handleFollowToggle}
                  disabled={isFollowLoading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors mb-4 ${
                    followStats.isFollowing
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  } disabled:opacity-50`}
                >
                  {isFollowLoading ? (
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : followStats.isFollowing ? (
                    <>
                      <UserMinus className="w-4 h-4" />
                      <span>フォロー中</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>フォローする</span>
                    </>
                  )}
                </button>
              )}

              {/* オプションメニュー（自分のプロフィールの場合） */}
              {isOwnProfile && (
                <div className="relative">
                  <button
                    onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    <MoreVertical className="w-5 h-5" />
                    <span>オプション</span>
                  </button>

                  {showOptionsMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowOptionsMenu(false)} />
                      <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            setEditingCustomId(userCustomId);
                            setShowOptionsMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                        >
                          <Edit className="w-4 h-4" />
                          <span>プロフィールを編集</span>
                        </button>
                        <label className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300 cursor-pointer">
                          <Upload className="w-4 h-4" />
                          <span>{uploading ? '保存中...' : '画像をアップロード'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              handleProfileImageUpload(e);
                              setShowOptionsMenu(false);
                            }}
                            disabled={uploading}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </>
                  )}
                  {uploadError && <p className="text-red-500 mt-2 text-xs">{uploadError}</p>}
                </div>
              )}
            </div>
          </div>

          {/* ユーザー情報 */}
          <hr className="my-5" />

          {/* 統計ウィジェット */}
          {/* <div className="mb-8">
            <StatsWidget customId={userCustomId} token={token} />
          </div> */}

          {/* GitHub-style アクティビティカレンダーを追加 */}
          {stats && stats.length > 0 && <ActivityCalendar stats={stats} />}

          {/* 動的ウィジェットマネージャー（Swapy対応） */}
          <ProfileWidgetManager
            customId={userCustomId}
            token={token}
            isOwnProfile={isOwnProfile}
            onAddRowCallback={(addRowFunc) => setAddRowFunction(() => addRowFunc)}
          />

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
