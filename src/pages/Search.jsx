/**
 * Search.jsx - ユーザー検索ページ
 *
 * 📚 このコンポーネントの役割：
 * - ユーザー名またはIDで検索
 * - 検索結果をリスト表示
 * - クリックでプロフィールページへ遷移
 * - フォロー/アンフォロー機能
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, User, ArrowLeft } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import UserCard from '../components/UserCard';
import { useAuth } from '../auth/AuthContext';
import { useFollow } from '../hooks/useFollow';
import { API_ENDPOINTS } from '../config';

function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { token } = useAuth();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // 📚 カスタムフックでフォロー機能を管理
  const { fetchFollowingIds, isFollowing, currentUserId } = useFollow();

  // 初回読み込み時にフォロー中リストを取得
  useEffect(() => {
    if (token) {
      fetchFollowingIds();
    }
  }, [token, fetchFollowingIds]);

  // 📚 検索実行
  const performSearch = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const response = await fetch(`${API_ENDPOINTS.USERS.SEARCH}?query=${encodeURIComponent(searchQuery.trim())}`);
      if (response.ok) {
        const data = await response.json();
        // APIレスポンスをUserCard用に変換
        const formattedResults = data.map((user) => ({
          userId: user.id,
          customId: user.customId,
          userName: user.name,
          profileImageUrl: user.profileImageUrl,
          description: user.description,
        }));
        setResults(formattedResults);
      } else {
        console.error('検索に失敗しました');
        setResults([]);
      }
    } catch (error) {
      console.error('検索エラー:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 📚 URLパラメータから検索を実行
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      performSearch(q);
    }
  }, [searchParams, performSearch]);

  // 📚 検索フォーム送信
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
      performSearch(query.trim());
    }
  };

  // 📚 フォロートグルコールバック
  const handleFollowToggle = async (userId, isNowFollowing) => {
    console.log(`User ${userId} is now ${isNowFollowing ? 'followed' : 'unfollowed'}`);
    // フォロー中リストを再取得して最新状態に同期
    await fetchFollowingIds();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* サイドバー */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} activeWidgets={[]} />

      {/* メインコンテンツ */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* ヘッダー */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>ホームに戻る</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">ユーザー検索</h1>
            <p className="text-gray-600 mt-1">ユーザー名またはIDで検索できます</p>
          </div>

          {/* 検索フォーム */}
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ユーザー名またはIDを入力..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-lg"
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                検索
              </button>
            </div>
          </form>

          {/* 検索結果 */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600 mt-4">検索中...</p>
              </div>
            ) : hasSearched && results.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">「{searchParams.get('q')}」に一致するユーザーが見つかりませんでした</p>
              </div>
            ) : (
              results.map((user) => (
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

          {/* 検索前の状態 */}
          {!hasSearched && !isLoading && (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">ユーザーを検索してみましょう</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchPage;
