/**
 * TimerWidget.jsx - キャンバス用タイマーウィジェット
 *
 * 📚 このコンポーネントの役割：
 * - 円形プログレスバーでタイマーを表示
 * - カウントダウン/進行度の切り替え対応
 * - TODOと連携してタイマー記録を保存
 *
 * 💡 元の SwapyTimer.jsx を簡略化して再利用しやすくしています
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

const API_URL = 'http://localhost:8080/api/text-data';

function TimerWidget({ settings = {} }) {
  // eslint-disable-next-line no-unused-vars
  const { token } = useAuth(); // 将来的にバックエンド連携で使用

  // 📚 props から設定を取得（デフォルト値あり）
  const displayMode = settings.displayMode || 'countdown';
  const inputMinutes = settings.inputMinutes || '1';
  const inputSeconds = settings.inputSeconds || '0';

  // 📚 タイマーの状態管理
  const [totalTime, setTotalTime] = useState(60); // 合計時間（秒）
  const [elapsedTime, setElapsedTime] = useState(0); // 経過時間（秒）
  const [isRunning, setIsRunning] = useState(false); // 実行中かどうか

  const intervalRef = useRef(null);
  const hasCompletedRef = useRef(false);

  /**
   * 📚 タイマーのメインロジック
   *
   * useEffect = コンポーネントの状態変化に応じて実行される処理
   * isRunning が true になったら 0.1秒ごとに elapsedTime を増やす
   */
  useEffect(() => {
    if (isRunning) {
      hasCompletedRef.current = false;

      // 📚 setInterval: 指定した間隔で繰り返し実行
      intervalRef.current = setInterval(() => {
        setElapsedTime((prev) => {
          const newElapsed = prev + 0.1;

          // タイマー完了チェック
          if (newElapsed >= totalTime && !hasCompletedRef.current) {
            hasCompletedRef.current = true;
            setIsRunning(false);
            return totalTime;
          }
          return newElapsed;
        });
      }, 100); // 100ms = 0.1秒ごと
    } else {
      // 停止時はインターバルをクリア
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    // 📚 クリーンアップ関数（コンポーネント解除時に実行）
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, totalTime]);

  // 📚 進捗率の計算（0〜100%）
  const progress = (elapsedTime / totalTime) * 100;

  // 📚 SVG円の計算
  const radius = 80; // 円の半径
  const circumference = 2 * Math.PI * radius; // 円周
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  /**
   * 📚 秒数を「MM:SS」形式に変換
   */
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * 📚 表示モードに応じた値を返す
   */
  const getDisplayValue = () => {
    // 開始前は設定時間を表示
    if (!isRunning && elapsedTime === 0) {
      const inputMins = parseInt(inputMinutes) || 0;
      const inputSecs = parseInt(inputSeconds) || 0;
      const inputTotal = inputMins * 60 + inputSecs;

      if (displayMode === 'countdown') {
        return formatTime(inputTotal);
      } else {
        return '0%';
      }
    }

    // 実行中・完了後
    if (displayMode === 'countdown') {
      const remaining = Math.max(0, totalTime - elapsedTime);
      return formatTime(remaining);
    } else {
      return `${Math.round(progress)}%`;
    }
  };

  /**
   * 📚 スタートボタンの処理
   */
  const handleStart = useCallback(() => {
    const mins = parseInt(inputMinutes) || 0;
    const secs = parseInt(inputSeconds) || 0;
    const newTotal = mins * 60 + secs;

    if (newTotal > 0) {
      setTotalTime(newTotal);
      setElapsedTime(0);
      setIsRunning(true);
    }
  }, [inputMinutes, inputSeconds]);

  /**
   * 📚 リセットボタンの処理
   */
  const handleReset = useCallback(() => {
    hasCompletedRef.current = false;
    setIsRunning(false);
    setElapsedTime(0);
  }, []);

  /**
   * 📚 再生/一時停止ボタンの処理
   */
  const togglePlayPause = useCallback(() => {
    setIsRunning(!isRunning);
  }, [isRunning]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 min-h-[200px] @container">
      {/* 📚 円形プログレスバー */}
      <div className="relative flex items-center justify-center mb-4 w-[85%] max-w-[600px] aspect-square">
        <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 200 200">
          {/* 背景の円 */}
          <circle cx="100" cy="100" r={radius} fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="12" />
          {/* 進捗を示す円 */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#000000"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>

        {/* 中央のタイム表示 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-2">
          <div className="font-mono font-bold text-black leading-none @[150px]:text-2xl @[200px]:text-3xl @[300px]:text-5xl @[400px]:text-6xl @[500px]:text-7xl text-xl">
            {getDisplayValue()}
          </div>
        </div>
      </div>

      {/* 📚 コントロールボタン */}
      <div className="flex gap-2 justify-center flex-shrink-0">
        {elapsedTime === 0 && !isRunning ? (
          // 開始前：スタートボタン
          <button
            onClick={handleStart}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-all"
          >
            <Play size={16} fill="white" />
            スタート
          </button>
        ) : (
          // 実行中・一時停止中：コントロールボタン
          <>
            <button
              onClick={togglePlayPause}
              className="flex items-center gap-1 px-3 py-2 bg-gray-200 text-black rounded-full text-sm font-semibold hover:bg-gray-300 transition-all"
            >
              {isRunning ? <Pause size={16} /> : <Play size={16} fill="black" />}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-3 py-2 bg-gray-200 text-black rounded-full text-sm font-semibold hover:bg-gray-300 transition-all"
            >
              <RotateCcw size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default TimerWidget;
