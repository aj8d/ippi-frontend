/**
 * ユーザー統計表示ウィジェット
 *
 * - ユーザーの作業統計を表示
 * - ストリーク、累計時間、完了Todo数など
 */

import { useState, useEffect } from 'react';
import { Flame, Clock, CheckCircle, Calendar, Trophy, Timer } from 'lucide-react';
import { API_ENDPOINTS } from '../config';

/**
 * 秒数を読みやすい形式に変換
 */
function formatDuration(seconds) {
  if (!seconds || seconds === 0) return '0分';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}時間${minutes > 0 ? ` ${minutes}分` : ''}`;
  }
  return `${minutes}分`;
}

/**
 * ユーザー統計ウィジェット
 * @param {Object} props
 * @param {string} props.customId - ユーザーのcustomId
 * @param {string} props.token - 認証トークン（オプション）
 * @param {boolean} props.compact - コンパクト表示モード
 */
export default function StatsWidget({ customId, token, compact = false }) {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!customId) return;

      setIsLoading(true);
      setError(null);

      try {
        const headers = token
          ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
          : { 'Content-Type': 'application/json' };

        const response = await fetch(API_ENDPOINTS.USER_STATS.BY_CUSTOM_ID(customId), {
          headers,
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          setError('統計を取得できませんでした');
        }
      } catch (err) {
        console.error('統計取得エラー:', err);
        setError('統計を取得できませんでした');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [customId, token]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <p className="text-gray-500 text-sm">{error}</p>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // コンパクトモード
  if (compact) {
    return (
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1 text-orange-500">
          <Flame className="w-4 h-4" />
          <span className="font-medium">{stats.currentStreak}日</span>
        </div>
        <div className="flex items-center gap-1 text-blue-500">
          <Clock className="w-4 h-4" />
          <span className="font-medium">{formatDuration(stats.totalWorkSeconds)}</span>
        </div>
        <div className="flex items-center gap-1 text-green-500">
          <CheckCircle className="w-4 h-4" />
          <span className="font-medium">{stats.completedTodos}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📊 作業統計</h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* 連続作業日数 */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">連続日数</span>
          </div>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {stats.currentStreak}
            <span className="text-sm font-normal">日</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">最長: {stats.longestStreak}日</p>
        </div>

        {/* 累計作業時間 */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">累計時間</span>
          </div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {Math.floor((stats.totalWorkHours || 0) * 10) / 10}
            <span className="text-sm font-normal">時間</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            今週: {formatDuration(stats.weeklyWorkSeconds)}
          </p>
        </div>

        {/* 完了したTodo */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">完了Todo</span>
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.completedTodos}
            <span className="text-sm font-normal">件</span>
          </p>
        </div>

        {/* 累計作業日数 */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-purple-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">作業日数</span>
          </div>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {stats.totalWorkDays}
            <span className="text-sm font-normal">日</span>
          </p>
        </div>

        {/* タイマー使用回数 */}
        <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Timer className="w-5 h-5 text-pink-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">セッション</span>
          </div>
          <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">
            {stats.totalTimerSessions}
            <span className="text-sm font-normal">回</span>
          </p>
        </div>

        {/* 平均作業時間/日 */}
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">平均/日</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {Math.round(stats.averageWorkMinutesPerDay || 0)}
            <span className="text-sm font-normal">分</span>
          </p>
        </div>
      </div>

      {/* 今月の作業時間 */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">今月の作業時間</span>
          <span className="font-medium text-gray-900 dark:text-white">{formatDuration(stats.monthlyWorkSeconds)}</span>
        </div>
      </div>
    </div>
  );
}
