/**
 * フォロワー/フォロー中一覧ページ
 *
 * - フォロワー一覧を表示
 * - フォロー中一覧を表示
 * - フォロー/アンフォロー機能
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import MobileBottomNav from '../components/mobile/MobileBottomNav';
import UserCard from '../components/UserCard';
import { useAuth } from '../auth/AuthContext';
import { useFollow } from '../hooks/useFollow';
import { API_ENDPOINTS } from '../config';

function FollowList({ type }) {
  const navigate = useNavigate();
  const { id } = useParams(); // ユーザーのcustomId
  const { token } = useAuth();

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [profileUserId, setProfileUserId] = useState(null);
  const [profileUserName, setProfileUserName] = useState('');

  // カスタムフックでフォロー機能を管理
  const { fetchFollowingIds, isFollowing, currentUserId } = useFollow();

  // プロフィールユーザーのIDを取得
  useEffect(() => {
    const fetchProfileUser = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.AUTH.PROFILE_BY_ID(id));
        if (response.ok) {
          const data = await response.json();
          setProfileUserId(data.userId);
          setProfileUserName(data.name);
        }
      } catch (error) {
        console.error('ユーザー情報取得エラー:', error);
      }
    };

    if (id) {
      fetchProfileUser();
    }
  }, [id]);

  // 自分がフォローしているユーザーIDを取得
  useEffect(() => {
    if (token) {
      fetchFollowingIds();
    }
  }, [token, fetchFollowingIds]);

  // フォロワー/フォロー中一覧を取得
  const fetchUsers = useCallback(async () => {
    if (!profileUserId) return;

    setIsLoading(true);
    try {
      const endpoint =
        type === 'followers'
          ? API_ENDPOINTS.FOLLOW.FOLLOWERS(profileUserId)
          : API_ENDPOINTS.FOLLOW.FOLLOWING(profileUserId);

      const headers = token
        ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        : { 'Content-Type': 'application/json' };

      const response = await fetch(endpoint, { headers });

      if (response.ok) {
        const data = await response.json();
        // APIレスポンスをUserCard用に変換
        const formattedUsers = data.map((user) => ({
          userId: user.id,
          customId: user.customId,
          userName: user.name,
          profileImageUrl: user.profileImageUrl,
          description: user.description,
        }));
        setUsers(formattedUsers);
      }
    } catch (error) {
      console.error('ユーザー一覧取得エラー:', error);
    } finally {
      setIsLoading(false);
    }
  }, [profileUserId, type, token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // フォロートグルコールバック
  const handleFollowToggle = async (userId, isNowFollowing) => {
    console.log(`User ${userId} is now ${isNowFollowing ? 'followed' : 'unfollowed'}`);
    // フォロー中リストを再取得して最新状態に同期
    await fetchFollowingIds();
    // ユーザー一覧も再取得
    await fetchUsers();
  };

  const title = type === 'followers' ? 'フォロワー' : 'フォロー中';

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* デスクトップ用サイドバー */}
      <div className="hidden md:block">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} activeWidgets={[]} />
      </div>

      {/* メインコンテンツ */}
      <div className={`flex-1 transition-all duration-300 pb-20 md:pb-0 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* ヘッダー */}
          <div className="mb-8">
            <button
              onClick={() => navigate(`/${id}`)}
              className="hidden md:flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>プロフィールに戻る</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              {profileUserName}さんの{title}
            </h1>
            <p className="text-gray-600 mt-1">{users.length}人</p>
          </div>

          {/* ユーザー一覧 */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600 mt-4">読み込み中...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                <p className="text-gray-500">
                  {type === 'followers' ? 'まだフォロワーがいません' : 'まだ誰もフォローしていません'}
                </p>
              </div>
            ) : (
              users.map((user) => (
                <UserCard
                  key={user.userId}
                  user={user}
                  showFollowButton={true}
                  isFollowing={isFollowing(user.userId)}
                  onFollowToggle={handleFollowToggle}
                  isCurrentUser={currentUserId === user.userId}
                  token={token}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* モバイル用ボトムナビゲーション */}
      <MobileBottomNav />
    </div>
  );
}

export default FollowList;
