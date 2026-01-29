import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, BarChart3, Clock, Calendar, TrendingUp } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { API_ENDPOINTS } from '../config';

function StatsModal({ isOpen, onClose }) {
  const { token } = useAuth();
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 統計データの取得
  useEffect(() => {
    if (!isOpen || !token) return;

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(API_ENDPOINTS.AUTH.STATS, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('統計データの取得に失敗しました');
        }

        const data = await response.json();
        setStats(data.stats || []);
      } catch (err) {
        console.error('Stats fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isOpen, token]);

  /**
   * 総作業時間（分）を計算
   */
  const getTotalMinutes = () => {
    return stats.reduce((sum, day) => sum + (day.count || 0), 0);
  };

  /**
   * 総作業時間を「X時間Y分」形式に変換
   */
  const formatTotalTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}時間${mins}分`;
    }
    return `${mins}分`;
  };

  /**
   * 作業日数を計算（count > 0 の日）
   */
  const getWorkDays = () => {
    return stats.filter((day) => day.count > 0).length;
  };

  /**
   * 平均作業時間（作業した日のみ）
   */
  const getAverageMinutes = () => {
    const workDays = getWorkDays();
    if (workDays === 0) return 0;
    return Math.round(getTotalMinutes() / workDays);
  };

  /**
   * 最長作業時間
   */
  const getMaxMinutes = () => {
    if (stats.length === 0) return 0;
    return Math.max(...stats.map((day) => day.count || 0));
  };

  /**
   * 過去7日間のデータを取得
   */
  const getLast7Days = () => {
    const today = new Date();
    const last7Days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayData = stats.find((s) => s.date === dateStr);
      last7Days.push({
        date: dateStr,
        dayName: ['日', '月', '火', '水', '木', '金', '土'][date.getDay()],
        count: dayData?.count || 0,
      });
    }

    return last7Days;
  };

  /**
   * グラフの最大値を計算（棒グラフのスケーリング用）
   */
  const getChartMax = () => {
    const last7 = getLast7Days();
    const max = Math.max(...last7.map((d) => d.count), 1);
    // 見やすいように少し余裕を持たせる
    return Math.ceil(max / 10) * 10 || 60;
  };

  // モーダルが開いていない場合は何も表示しない
  if (!isOpen) return null;

  const totalMinutes = getTotalMinutes();
  const workDays = getWorkDays();
  const avgMinutes = getAverageMinutes();
  const maxMinutes = getMaxMinutes();
  const last7Days = getLast7Days();
  const chartMax = getChartMax();

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" onClick={onClose}>
      {/* モーダルコンテンツ */}
      <div
        className="bg-white rounded-xl shadow-2xl w-[90%] max-w-2xl p-6 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">作業統計</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* ローディング表示 */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">読み込み中...</div>
          </div>
        )}

        {/* エラー表示 */}
        {error && (
          <div className="flex items-center justify-center py-12">
            <div className="text-red-500">{error}</div>
          </div>
        )}

        {/* 統計コンテンツ */}
        {!loading && !error && (
          <div className="space-y-6">
            {/* サマリーカード */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* 総作業時間 */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-600">総作業時間</span>
                </div>
                <div className="text-xl font-bold text-gray-800">{formatTotalTime(totalMinutes)}</div>
              </div>

              {/* 作業日数 */}
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-medium text-green-600">作業日数</span>
                </div>
                <div className="text-xl font-bold text-gray-800">{workDays}日</div>
              </div>

              {/* 平均作業時間 */}
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                  <span className="text-xs font-medium text-orange-600">日平均</span>
                </div>
                <div className="text-xl font-bold text-gray-800">{formatTotalTime(avgMinutes)}</div>
              </div>

              {/* 最長作業時間 */}
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-medium text-purple-600">最長記録</span>
                </div>
                <div className="text-xl font-bold text-gray-800">{formatTotalTime(maxMinutes)}</div>
              </div>
            </div>

            {/* 過去7日間のグラフ */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">過去7日間の作業時間</h3>

              {/* シンプルな棒グラフ */}
              <div className="flex items-end justify-between gap-2 h-40">
                {last7Days.map((day, index) => {
                  const heightPercent = chartMax > 0 ? (day.count / chartMax) * 100 : 0;
                  const isToday = index === last7Days.length - 1;

                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                      {/* 作業時間ラベル */}
                      <div className="text-xs text-gray-500 h-4">{day.count > 0 ? `${day.count}分` : ''}</div>

                      {/* バー */}
                      <div className="w-full flex-1 flex items-end">
                        <div
                          className={`w-full rounded-t-md transition-all duration-300 ${
                            isToday ? 'bg-blue-500' : 'bg-blue-300'
                          }`}
                          style={{
                            height: `${Math.max(heightPercent, day.count > 0 ? 5 : 0)}%`,
                            minHeight: day.count > 0 ? '4px' : '0',
                          }}
                        />
                      </div>

                      {/* 曜日ラベル */}
                      <div className={`text-xs font-medium ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                        {day.dayName}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* データがない場合のメッセージ */}
            {stats.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>まだ作業データがありません</p>
                <p className="text-sm mt-2">タイマーを使って作業を始めましょう！</p>
              </div>
            )}

            {/* 閉じるボタン */}
            <button
              onClick={onClose}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              閉じる
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

export default StatsModal;
