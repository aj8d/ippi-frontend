import { useAuth } from '../auth/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import ActivityCalendar from '../components/ActivityCalendar';
import Sidebar from '../components/Sidebar';
import MobileBottomNav from '../components/mobile/MobileBottomNav';
import ProfileWidgetManager from '../components/ProfileWidgetManager';
import UserAvatar from '../components/UserAvatar';
import { UserPlus, UserMinus, MoreVertical, Edit, Upload, AtSign } from 'lucide-react';
import { API_ENDPOINTS } from '../config';
import { useProfile } from '../hooks/useProfile';
import { useProfileFollow } from '../hooks/useProfileFollow';
import { useStats } from '../hooks/useStats';

export default function Profile() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  // カスタムフックで状態管理を分離
  const {
    profileImageUrl,
    setProfileImageUrl,
    userName,
    setUserName,
    userCustomId,
    setUserCustomId,
    profileUserId,
    isOwnProfile,
    loading,
    fetchLatestProfile,
  } = useProfile(id, user);

  const stats = useStats(userCustomId);
  const { followStats, isFollowLoading, handleFollowToggle } = useProfileFollow(profileUserId, token);

  // 残りのローカルステート
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [customIdError, setCustomIdError] = useState('');
  const [editingCustomId, setEditingCustomId] = useState('');
  const [editingName, setEditingName] = useState('');
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [addRowFunction, setAddRowFunction] = useState(null);

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
          name: editingName,
          customId: editingCustomId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsEditing(false);
        setUserName(data.name || '');
        setUserCustomId(data.customId || '');
        setEditingCustomId('');
        setEditingName('');
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
      {/* デスクトップ用サイドバー */}
      <div className="hidden md:block">
        <Sidebar
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          onTimerSettingsChange={() => {}}
          isOwnProfile={isOwnProfile}
          addRowFunction={addRowFunction}
        />
      </div>

      {/* メインコンテンツ */}
      <div className={`flex-1 transition-all duration-300 pb-20 md:pb-0 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
        <div className="p-4 md:p-5 max-w-6xl mx-auto">
          {/* プロフィールセクション */}
          <div className="mb-8 relative">
            {/* 右上のボタン（フォローボタンまたはオプションメニュー） */}
            <div className="absolute top-0 right-0 z-10">
              {/* フォローボタン（他人のプロフィールの場合） */}
              {!isOwnProfile && (
                <button
                  onClick={handleFollowToggle}
                  disabled={isFollowLoading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
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
                      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            setEditingCustomId(userCustomId);
                            setEditingName(userName);
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
                            className="hidden"
                            disabled={uploading}
                          />
                        </label>
                      </div>
                    </>
                  )}
                  {uploadError && <p className="text-red-500 mt-2 text-xs absolute right-0">{uploadError}</p>}
                </div>
              )}
            </div>

            {/* プロフィール情報 */}
            <div className="flex items-center gap-5">
              <UserAvatar
                userId={profileUserId}
                userName={userName}
                profileImageUrl={profileImageUrl}
                size="2xl"
                showStreakBadge={true}
                showBorder={true}
              />

              <div className="flex flex-col">
                <p className="text-lg mb-2.5 font-bold">{userName || '名前なし'}</p>
                {userCustomId && (
                  <p className="flex items-center gap-1 text-sm text-gray-500 mb-2 whitespace-nowrap">
                    <AtSign className="size-4" />
                    <span>{userCustomId}</span>
                  </p>
                )}

                {/* フォロー統計 */}
                <div className="flex items-center gap-4 mt-auto">
                  <button
                    onClick={() => navigate(`/${userCustomId}/following`)}
                    className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <span className="font-semibold">{followStats.followingCount}</span>
                    <span className="text-gray-500">フォロー中</span>
                  </button>
                  <button
                    onClick={() => navigate(`/${userCustomId}/followers`)}
                    className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <span className="font-semibold">{followStats.followersCount}</span>
                    <span className="text-gray-500">フォロワー</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ユーザー情報 */}
          <hr className="my-5" />

          {/* GitHub-style アクティビティカレンダーを追加 */}
          <ActivityCalendar stats={stats || []} />

          {/* 動的ウィジェットマネージャー（Swapy対応） */}
          <ProfileWidgetManager
            customId={userCustomId}
            token={token}
            isOwnProfile={isOwnProfile}
            onAddRowCallback={(addRowFunc) => setAddRowFunction(() => addRowFunc)}
          />
        </div>
      </div>

      {/* モバイル用ボトムナビゲーション */}
      <MobileBottomNav />

      {/* モーダル */}
      {isEditing && isOwnProfile && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => {
            setIsEditing(false);
            setEditingCustomId('');
            setEditingName('');
            setCustomIdError('');
          }}
        >
          {/* モーダル内容 */}
          <div className="bg-white rounded-lg p-7.5 max-w-md w-11/12 shadow-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-5 mt-0 text-xl font-bold">プロフィールを編集</h2>

            <div className="mb-3.75">
              <label className="block mb-1.25 font-bold">ID</label>
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

            <div className="mb-5">
              <label className="block mb-1.25 font-bold">名前</label>
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                maxLength={30}
                className="w-full p-2.5 rounded border border-gray-300 text-sm box-border"
              />
              <p className="text-xs text-gray-500 mt-1">30文字以内で入力してください</p>
            </div>

            <div className="flex gap-2.5 justify-end">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditingCustomId('');
                  setEditingName('');
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
