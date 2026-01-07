import { createPortal } from 'react-dom';
import { X, Trophy, Clock, Flame, CheckCircle2, Circle, Timer, ListChecks } from 'lucide-react';
import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config';
import { useAuth } from '../auth/AuthContext';

/**
 * アチーブメントモーダル
 * ユーザーのアチーブメント達成状況を表示
 */
export default function AchievementModal({ isOpen, onClose }) {
  const { token } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [achievedCount, setAchievedCount] = useState(0);

  useEffect(() => {
    if (isOpen && token) {
      fetchAchievements();
    }
  }, [isOpen, token]);

  const fetchAchievements = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.ACHIEVEMENTS.USER, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAchievements(data.achievements || []);
        setTotalCount(data.totalCount || 0);
        setAchievedCount(data.achievedCount || 0);
      }
    } catch (error) {
      console.error('アチーブメント取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  // アチーブメントタイプに応じたアイコンを取得
  const getTypeIcon = (type) => {
    switch (type) {
      case 'work_time':
        return <Clock className="w-5 h-5" />;
      case 'streak':
        return <Flame className="w-5 h-5" />;
      case 'timer_count':
        return <Timer className="w-5 h-5" />;
      case 'todo_count':
        return <ListChecks className="w-5 h-5" />;
      default:
        return <Trophy className="w-5 h-5" />;
    }
  };

  // タイプごとにグループ化
  const groupedAchievements = achievements.reduce((acc, achievement) => {
    const type = achievement.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(achievement);
    return acc;
  }, {});

  const typeLabels = {
    work_time: '累計作業時間',
    streak: '連続作業日数',
    timer_count: 'タイマー使用回数',
    todo_count: 'Todo完了数',
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* オーバーレイ */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* モーダルコンテンツ */}
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* ヘッダー */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-yellow-400 to-orange-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">アチーブメント</h2>
                <p className="text-sm opacity-90">
                  {achievedCount} / {totalCount} 達成
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="閉じる"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* プログレスバー */}
          <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="bg-white h-full transition-all duration-500"
              style={{ width: `${totalCount > 0 ? (achievedCount / totalCount) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* コンテンツ */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedAchievements).map(([type, items]) => (
                <div key={type} className="space-y-3">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    {getTypeIcon(type)}
                    {typeLabels[type] || type}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {items.map((achievement) => (
                      <div
                        key={achievement.id}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          achievement.achieved
                            ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-orange-300 shadow-md'
                            : 'bg-gray-50 border-gray-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex-shrink-0 mt-0.5 ${
                              achievement.achieved ? 'text-orange-500' : 'text-gray-400'
                            }`}
                          >
                            {achievement.achieved ? (
                              <CheckCircle2 className="w-6 h-6" />
                            ) : (
                              <Circle className="w-6 h-6" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4
                              className={`font-bold mb-1 ${achievement.achieved ? 'text-gray-900' : 'text-gray-500'}`}
                            >
                              {achievement.name}
                            </h4>
                            <p className={`text-sm ${achievement.achieved ? 'text-gray-600' : 'text-gray-400'}`}>
                              {achievement.description}
                            </p>
                            {achievement.achieved && achievement.achievedAt && (
                              <p className="text-xs text-orange-600 mt-2">
                                達成日時: {new Date(achievement.achievedAt).toLocaleDateString('ja-JP')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
