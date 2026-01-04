/**
 * Feed.jsx - フィードページ
 *
 * 📚 このコンポーネントの役割：
 * - フォローしているユーザーのアクティビティを表示
 * - Duolingoライクなフィード形式
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Clock, Flame, Trophy, Heart, RefreshCw, MessageCircle, Send, Trash2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../auth/AuthContext';
import { API_ENDPOINTS } from '../config';

function Feed() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [feedItems, setFeedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [emptyMessage, setEmptyMessage] = useState('');
  const [expandedComments, setExpandedComments] = useState({});
  const [commentTexts, setCommentTexts] = useState({});
  const [submittingComment, setSubmittingComment] = useState({});

  // 📚 フィードデータを取得
  const fetchFeed = useCallback(
    async (pageNum = 0, append = false) => {
      if (!token) return;

      if (pageNum === 0) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const response = await fetch(`${API_ENDPOINTS.FEED.LIST}?page=${pageNum}&size=20`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();

          if (append) {
            setFeedItems((prev) => [...prev, ...data.items]);
          } else {
            setFeedItems(data.items || []);
          }

          setHasMore(data.hasMore || false);
          setEmptyMessage(data.message || '');
        } else {
          console.error('フィードの取得に失敗しました');
        }
      } catch (error) {
        console.error('フィード取得エラー:', error);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [token]
  );

  // 初回読み込み
  useEffect(() => {
    fetchFeed(0, false);
  }, [fetchFeed]);

  // もっと読み込む
  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFeed(nextPage, true);
  };

  // リフレッシュ
  const handleRefresh = () => {
    setPage(0);
    fetchFeed(0, false);
  };

  // 📚 いいねをトグル
  const handleLike = async (feedId, isLiked) => {
    if (!token) return;

    try {
      const endpoint = isLiked ? API_ENDPOINTS.FEED.UNLIKE(feedId) : API_ENDPOINTS.FEED.LIKE(feedId);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // いいね状態を更新
        setFeedItems((prev) =>
          prev.map((item) =>
            item.id === feedId
              ? {
                  ...item,
                  isLiked: !isLiked,
                  likeCount: isLiked ? (item.likeCount || 1) - 1 : (item.likeCount || 0) + 1,
                }
              : item
          )
        );
      }
    } catch (error) {
      console.error('いいねエラー:', error);
    }
  };

  // 📚 コメントを投稿
  const handleSubmitComment = async (feedId) => {
    const commentText = commentTexts[feedId]?.trim();
    if (!commentText || !token) return;

    setSubmittingComment((prev) => ({ ...prev, [feedId]: true }));

    try {
      const response = await fetch(API_ENDPOINTS.FEED.COMMENTS(feedId), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: commentText }),
      });

      if (response.ok) {
        const newComment = await response.json();
        // コメントリストを更新
        setFeedItems((prev) =>
          prev.map((item) =>
            item.id === feedId
              ? {
                  ...item,
                  comments: [...(item.comments || []), newComment],
                  commentCount: (item.commentCount || 0) + 1,
                }
              : item
          )
        );
        // 入力欄をクリア
        setCommentTexts((prev) => ({ ...prev, [feedId]: '' }));
      }
    } catch (error) {
      console.error('コメント投稿エラー:', error);
    } finally {
      setSubmittingComment((prev) => ({ ...prev, [feedId]: false }));
    }
  };

  // 📚 コメントを削除
  const handleDeleteComment = async (feedId, commentId) => {
    if (!token || !window.confirm('このコメントを削除しますか？')) return;

    try {
      const response = await fetch(API_ENDPOINTS.FEED.COMMENT_DELETE(feedId, commentId), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // コメントリストから削除
        setFeedItems((prev) =>
          prev.map((item) =>
            item.id === feedId
              ? {
                  ...item,
                  comments: (item.comments || []).filter((c) => c.id !== commentId),
                  commentCount: Math.max((item.commentCount || 1) - 1, 0),
                }
              : item
          )
        );
      }
    } catch (error) {
      console.error('コメント削除エラー:', error);
    }
  };

  // 📚 コメント表示をトグル
  const toggleComments = (feedId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [feedId]: !prev[feedId],
    }));
  };

  // 📚 アクティビティの種類に応じたアイコンを取得
  const getActivityIcon = (type) => {
    switch (type) {
      case 'work_completed':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'streak':
        return <Flame className="w-5 h-5 text-orange-500" />;
      case 'achievement':
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'follow':
        return <Heart className="w-5 h-5 text-pink-500" />;
      default:
        return <Users className="w-5 h-5 text-gray-500" />;
    }
  };

  // 📚 時間を相対表示に変換
  const formatRelativeTime = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'たった今';
    if (minutes < 60) return `${minutes}分前`;
    if (hours < 24) return `${hours}時間前`;
    if (days < 7) return `${days}日前`;
    return new Date(timestamp).toLocaleDateString('ja-JP');
  };

  // 📚 relatedDataから追加情報を取得
  const parseRelatedData = (relatedData) => {
    if (!relatedData) return null;
    try {
      return JSON.parse(relatedData);
    } catch {
      return null;
    }
  };

  // 📚 アクティビティのバッジを取得
  const getActivityBadge = (type, relatedData) => {
    const data = parseRelatedData(relatedData);
    if (!data) return null;

    switch (type) {
      case 'work_completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            <Clock className="w-3 h-3" />
            {data.minutes}分
          </span>
        );
      case 'streak':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
            <Flame className="w-3 h-3" />
            {data.streakDays}日連続
          </span>
        );
      case 'achievement':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            <Trophy className="w-3 h-3" />
            達成！
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* サイドバー */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} activeWidgets={[]} />

      {/* メインコンテンツ */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* ヘッダー */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>ホームに戻る</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">フィード</h1>
              <p className="text-gray-600 mt-1">フォローしているユーザーのアクティビティ</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="更新"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* フィードコンテンツ */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 mt-4">読み込み中...</p>
            </div>
          ) : feedItems.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">まだフィードがありません</h3>
              <p className="text-gray-600 mb-6">
                {emptyMessage || 'ユーザーをフォローすると、ここにアクティビティが表示されます。'}
              </p>
              <button
                onClick={() => navigate('/search')}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                ユーザーを探す
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {feedItems.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    {/* ユーザーアバター */}
                    <div
                      className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 cursor-pointer"
                      onClick={() => item.userCustomId && navigate(`/${item.userCustomId}`)}
                    >
                      {item.userProfileImageUrl ? (
                        <img
                          src={item.userProfileImageUrl}
                          alt={item.userName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-lg font-bold">
                          {item.userName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      )}
                    </div>

                    {/* アクティビティ内容 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="font-semibold text-gray-900 hover:underline cursor-pointer"
                          onClick={() => item.userCustomId && navigate(`/${item.userCustomId}`)}
                        >
                          {item.userName}
                        </span>
                        {item.userCustomId && <span className="text-gray-500 text-sm">@{item.userCustomId}</span>}
                        {getActivityBadge(item.activityType, item.relatedData)}
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        {getActivityIcon(item.activityType)}
                        <span>{item.message}</span>
                      </div>
                      <p className="text-gray-500 text-sm mt-2">{formatRelativeTime(item.createdAt)}</p>

                      {/* いいね・コメントボタン */}
                      <div className="flex items-center gap-4 mt-3">
                        {/* いいねボタン */}
                        <button
                          onClick={() => handleLike(item.id, item.isLiked)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                            item.isLiked
                              ? 'text-pink-600 bg-pink-50 hover:bg-pink-100'
                              : 'text-gray-600 bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${item.isLiked ? 'fill-current' : ''}`} />
                          <span className="text-sm font-medium">{item.likeCount || 0}</span>
                        </button>

                        {/* コメントボタン */}
                        <button
                          onClick={() => toggleComments(item.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">{item.commentCount || 0}</span>
                        </button>
                      </div>

                      {/* コメントセクション */}
                      {expandedComments[item.id] && (
                        <div className="mt-4 space-y-3">
                          {/* コメント入力 */}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={commentTexts[item.id] || ''}
                              onChange={(e) => setCommentTexts((prev) => ({ ...prev, [item.id]: e.target.value }))}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSubmitComment(item.id);
                                }
                              }}
                              placeholder="コメントを追加..."
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              disabled={submittingComment[item.id]}
                            />
                            <button
                              onClick={() => handleSubmitComment(item.id)}
                              disabled={!commentTexts[item.id]?.trim() || submittingComment[item.id]}
                              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </div>

                          {/* コメントリスト */}
                          {item.comments && item.comments.length > 0 && (
                            <div className="space-y-2 pl-2 border-l-2 border-gray-200">
                              {item.comments.map((comment) => (
                                <div key={comment.id} className="flex items-start gap-2 group">
                                  {/* コメント投稿者のアバター */}
                                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                                    {comment.userProfileImageUrl ? (
                                      <img
                                        src={comment.userProfileImageUrl}
                                        alt={comment.userName}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs font-bold">
                                        {comment.userName?.charAt(0)?.toUpperCase() || '?'}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-sm text-gray-900">{comment.userName}</span>
                                      <span className="text-xs text-gray-500">
                                        {formatRelativeTime(comment.createdAt)}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-700 mt-0.5">{comment.text}</p>
                                  </div>
                                  {comment.userId === localStorage.getItem('userId') && (
                                    <button
                                      onClick={() => handleDeleteComment(item.id, comment.id)}
                                      className="opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:bg-red-50 rounded transition-all"
                                      title="削除"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* もっと読み込むボタン */}
              {hasMore && (
                <div className="text-center py-4">
                  <button
                    onClick={loadMore}
                    disabled={isLoadingMore}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    {isLoadingMore ? '読み込み中...' : 'もっと見る'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* フォロー機能の説明 */}
          <div className="mt-8 bg-blue-50 rounded-xl p-6">
            <h3 className="font-semibold text-blue-900 mb-2">💡 フィードについて</h3>
            <p className="text-blue-800 text-sm">
              フィードでは、フォローしているユーザーの作業記録やストリーク達成などのアクティビティを見ることができます。
              ユーザーを検索してフォローしてみましょう！
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Feed;
