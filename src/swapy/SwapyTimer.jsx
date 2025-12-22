import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

const API_URL = 'http://localhost:8080/api/text-data';

function SwapyTimer({ onComplete, onUpdate, selectedTodoId }) {
  const { token } = useAuth();
  const [totalTime, setTotalTime] = useState(60);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [displayMode, setDisplayMode] = useState('countdown');
  const [inputMinutes, setInputMinutes] = useState('1');
  const [inputSeconds, setInputSeconds] = useState('0');
  const intervalRef = useRef(null);
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    if (isRunning) {
      hasCompletedRef.current = false;
      intervalRef.current = setInterval(() => {
        setElapsedTime((prev) => {
          const newElapsed = prev + 0.1;
          if (newElapsed >= totalTime && !hasCompletedRef.current) {
            hasCompletedRef.current = true;
            setIsRunning(false);
            if (onComplete) {
              // タイマー完了時に経過秒数を渡す
              onComplete(Math.round(totalTime));
            }
            if (onUpdate) {
              // 完了時にも onUpdate を呼ぶ
              onUpdate(Math.round(totalTime));
            }
            return totalTime;
          }
          return newElapsed;
        });
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, totalTime, onComplete, onUpdate]);

  const progress = (elapsedTime / totalTime) * 100;
  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDisplayValue = () => {
    if (displayMode === 'countdown') {
      const remaining = Math.max(0, totalTime - elapsedTime);
      return formatTime(remaining);
    } else if (displayMode === 'countup') {
      return formatTime(elapsedTime);
    } else {
      return `${Math.round(progress)}%`;
    }
  };

  // サーバーにタイマー開始を通知
  const startTimerOnServer = useCallback(async () => {
    try {
      await fetch(`${API_URL}/${selectedTodoId}/start-timer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error('Failed to start timer on server:', err);
    }
  }, [selectedTodoId, token]);

  // サーバーにタイマー停止を通知
  const stopTimerOnServer = useCallback(async () => {
    try {
      await fetch(`${API_URL}/${selectedTodoId}/stop-timer`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error('Failed to stop timer on server:', err);
    }
  }, [selectedTodoId, token]);

  // ページ復帰時にサーバーから状態を取得
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && selectedTodoId && isRunning) {
        // ページが表示に戻った場合、サーバーから最新の状態を取得
        (async () => {
          try {
            const response = await fetch(`${API_URL}/${selectedTodoId}/timer-status`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.timerRunning) {
              // サーバー上で実行中の場合、最新の経過時間を設定
              setElapsedTime(data.elapsedSeconds);
            }
          } catch (err) {
            console.error('Failed to sync timer status:', err);
          }
        })();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [selectedTodoId, isRunning, token]);

  const handleStart = () => {
    if (!selectedTodoId) {
      alert('タスクを選択してからタイマーを開始してください');
      return;
    }

    const mins = parseInt(inputMinutes) || 0;
    const secs = parseInt(inputSeconds) || 0;
    const newTotal = mins * 60 + secs;

    if (newTotal > 0) {
      setTotalTime(newTotal);
      setElapsedTime(0);
      setIsRunning(true);
      // サーバーにも開始を通知
      startTimerOnServer();
    }
  };

  const handleReset = () => {
    hasCompletedRef.current = false;
    setIsRunning(false);
    setElapsedTime(0);
  };

  const togglePlayPause = () => {
    const willStop = isRunning;
    setIsRunning(!isRunning);

    // 停止時に親に秒数を通知＆サーバーに通知
    if (willStop) {
      if (onUpdate) {
        onUpdate(Math.round(elapsedTime));
      }
      stopTimerOnServer();
    } else {
      // 再開時もサーバーに通知
      startTimerOnServer();
    }
  };

  return (
    <div className={`flex flex-col items-center`}>
      <div className="relative flex items-center justify-center mb-8">
        <svg className="transform -rotate-90" width="320" height="320">
          <circle cx="160" cy="160" r={radius} fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="20" />
          <circle
            cx="160"
            cy="160"
            r={radius}
            fill="none"
            stroke="#000000"
            strokeWidth="20"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-5xl font-mono font-bold text-black">{getDisplayValue()}</div>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3">
        <div className="flex items-center gap-3 justify-center">
          <span className="text-gray-600 text-sm w-28 text-right">カウントダウン</span>
          <button
            onClick={() => setDisplayMode(displayMode === 'countdown' ? 'countup' : 'countdown')}
            className={`relative w-12 h-7 rounded-full transition-colors ${
              displayMode === 'countdown' ? 'bg-black' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                displayMode === 'countdown' ? 'translate-x-0' : 'translate-x-5'
              }`}
            />
          </button>
          <span className="text-gray-600 text-sm w-28">カウントアップ</span>
        </div>

        <div className="flex items-center gap-3 justify-center">
          <span className="text-gray-600 text-sm w-28 text-right">時間表示</span>
          <button
            onClick={() => setDisplayMode(displayMode === 'progress' ? 'countdown' : 'progress')}
            className={`relative w-12 h-7 rounded-full transition-colors ${
              displayMode === 'progress' ? 'bg-black' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                displayMode === 'progress' ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <span className="text-gray-600 text-sm w-28">進行度</span>
        </div>
      </div>

      {!isRunning && elapsedTime === 0 && (
        <div className="mb-6 flex gap-4 justify-center">
          <div className="flex flex-col">
            <label className="text-gray-600 text-sm mb-2">分</label>
            <input
              type="number"
              min="0"
              max="99"
              value={inputMinutes}
              onChange={(e) => setInputMinutes(e.target.value)}
              className="w-20 px-4 py-2 border-2 border-gray-300 text-black text-center rounded-lg focus:outline-none focus:border-black"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-gray-600 text-sm mb-2">秒</label>
            <input
              type="number"
              min="0"
              max="59"
              value={inputSeconds}
              onChange={(e) => setInputSeconds(e.target.value)}
              className="w-20 px-4 py-2 border-2 border-gray-300 text-black text-center rounded-lg focus:outline-none focus:border-black"
            />
          </div>
        </div>
      )}

      <div className="flex gap-4 justify-center">
        {elapsedTime === 0 && !isRunning ? (
          <button
            onClick={handleStart}
            className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition-all shadow-lg"
          >
            <Play size={20} fill="white" />
            スタート
          </button>
        ) : (
          <>
            <button
              onClick={togglePlayPause}
              className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-black rounded-full font-semibold hover:bg-gray-300 transition-all"
            >
              {isRunning ? <Pause size={20} /> : <Play size={20} fill="black" />}
              {isRunning ? '一時停止' : '再開'}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-black rounded-full font-semibold hover:bg-gray-300 transition-all"
            >
              <RotateCcw size={20} />
              リセット
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default SwapyTimer;
