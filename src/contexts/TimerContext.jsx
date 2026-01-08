/**
 * タイマー状態の共有コンテキスト
 *
 * - タイマーの実行状態をアプリ全体で共有
 * - ページ遷移や設定変更時の警告表示に使用
 */

import { createContext, useContext, useState, useCallback } from 'react';

const TimerContext = createContext(null);

// カスタムフック
// eslint-disable-next-line react-refresh/only-export-components
export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}

export function TimerProvider({ children }) {
  // タイマーが実行中かどうか
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  // タイマー停止関数を保持（TimerWidgetから登録）
  const [stopTimerCallback, setStopTimerCallback] = useState(null);

  // タイマー状態を更新
  const updateTimerState = useCallback((running) => {
    setIsTimerRunning(running);
  }, []);

  // 停止関数を登録
  const registerStopCallback = useCallback((callback) => {
    setStopTimerCallback(() => callback);
  }, []);

  // タイマーを停止
  const stopTimer = useCallback(() => {
    if (stopTimerCallback) {
      stopTimerCallback();
    }
  }, [stopTimerCallback]);

  return (
    <TimerContext.Provider
      value={{
        isTimerRunning,
        updateTimerState,
        registerStopCallback,
        stopTimer,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}
