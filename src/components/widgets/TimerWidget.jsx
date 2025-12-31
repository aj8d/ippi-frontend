/**
 * TimerWidget.jsx - ポモドーロタイマーウィジェット
 *
 * 📚 このコンポーネントの役割：
 * - 円形プログレスバーでタイマーを表示
 * - カウントダウン/進行度の切り替え対応
 * - ポモドーロサイクル（作業→休憩→作業...）の繰り返し
 * - 複数セクションのサイクル対応
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Play, Pause, Square, SkipForward, X } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { useTimer } from '../../contexts/TimerContext';

// 📚 作業時間保存用のエンドポイント（/work-sessionを使用）
const API_URL = 'http://localhost:8080/api/text-data/work-session';

// 📚 デフォルトのポモドーロセクション
const DEFAULT_SECTIONS = [{ id: 1, workMinutes: '25', workSeconds: '0', breakMinutes: '5', breakSeconds: '0' }];

function TimerWidget({ settings = {} }) {
  const { token } = useAuth();
  const { updateTimerState, registerStopCallback } = useTimer();

  // 📚 props から設定を取得
  const displayMode = settings.displayMode || 'countdown';
  const sections = settings.sections || DEFAULT_SECTIONS;
  const totalCycles = settings.totalCycles || 3; // デフォルト3サイクル

  // 📚 タイマーの状態管理
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0); // 現在のセクション
  const [currentCycle, setCurrentCycle] = useState(1); // 現在のサイクル数
  const [isWorkPhase, setIsWorkPhase] = useState(true); // true=作業, false=休憩
  const [totalTime, setTotalTime] = useState(0); // 現在のフェーズの合計時間（秒）
  const [elapsedTime, setElapsedTime] = useState(0); // 経過時間（秒）
  const [isRunning, setIsRunning] = useState(false); // 実行中かどうか
  const [hasStarted, setHasStarted] = useState(false); // タイマーが開始されたか
  const [showCompletionModal, setShowCompletionModal] = useState(false); // 完了モーダル

  const intervalRef = useRef(null);
  const hasCompletedRef = useRef(false);
  const sectionsRef = useRef(sections);
  const totalCyclesRef = useRef(totalCycles);
  const currentSectionIndexRef = useRef(0); // 現在のセクションインデックスを追跡
  const isWorkPhaseRef = useRef(true); // 現在の作業/休憩フェーズを追跡

  // 📚 バックグラウンドでも正確に動作させるため、開始時刻を記録
  const phaseStartTimeRef = useRef(null); // フェーズ開始時刻（ミリ秒）
  const pausedElapsedRef = useRef(0); // 一時停止時の経過時間

  // 📚 累積作業時間をトラッキング（秒）
  // eslint-disable-next-line no-unused-vars
  const [totalWorkTime, setTotalWorkTime] = useState(0);
  // eslint-disable-next-line no-unused-vars
  const [completedWorkSessions, setCompletedWorkSessions] = useState(0);
  const totalWorkTimeRef = useRef(0);

  // 📚 現在のフェーズで経過した作業時間（秒）をトラッキング
  const currentPhaseWorkTimeRef = useRef(0);

  // 📚 refs を最新の値で更新
  useEffect(() => {
    sectionsRef.current = sections;
    totalCyclesRef.current = totalCycles;
  }, [sections, totalCycles]);

  // 📚 currentSectionIndexRefを同期
  useEffect(() => {
    currentSectionIndexRef.current = currentSectionIndex;
  }, [currentSectionIndex]);

  // 📚 isWorkPhaseRefを同期
  useEffect(() => {
    isWorkPhaseRef.current = isWorkPhase;
  }, [isWorkPhase]);

  // 📚 currentSectionIndexが変更されたらrefも更新
  useEffect(() => {
    currentSectionIndexRef.current = currentSectionIndex;
  }, [currentSectionIndex]);

  // 📚 タイマー状態をコンテキストに通知
  useEffect(() => {
    updateTimerState(hasStarted);
  }, [hasStarted, updateTimerState]);

  /**
   * 📚 バックエンドに作業時間を送信
   * @param workSeconds 作業時間（秒）- 分単位に切り捨てて保存
   * @param sessionsCount セッション数（ログ用）
   */
  const saveWorkTimeToBackend = useCallback(
    async (workSeconds, sessionsCount) => {
      if (!token) return;

      // 📚 秒を分に変換し、端数を切り捨て（60秒未満は0分）
      const workMinutes = Math.floor(workSeconds / 60);

      // 📚 1分未満の場合は保存しない
      if (workMinutes < 1) {
        console.log(`⏭️ 作業時間が1分未満のため保存スキップ: ${workSeconds}秒`);
        return;
      }

      // 📚 分を秒に戻す（端数切り捨て後の値）
      const truncatedSeconds = workMinutes * 60;

      try {
        // 今日の日付を取得（YYYY-MM-DD形式）
        const today = new Date().toISOString().split('T')[0];

        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            date: today,
            timerSeconds: truncatedSeconds,
          }),
        });

        if (!response.ok) {
          throw new Error('作業時間の保存に失敗しました');
        }

        console.log(`✅ 作業時間を保存: ${workMinutes}分 (${truncatedSeconds}秒, ${sessionsCount}セッション)`);
      } catch (error) {
        console.error('作業時間の保存エラー:', error);
      }
    },
    [token]
  );

  /**
   * 📚 セクションから時間（秒）を計算
   */
  const getTimeFromSection = useCallback((section, isWork) => {
    if (isWork) {
      const mins = parseInt(section.workMinutes) || 0;
      return mins * 60;
    } else {
      const mins = parseInt(section.breakMinutes) || 0;
      return mins * 60;
    }
  }, []);

  /**
   * 📚 次のフェーズに進む
   * @param actualElapsedTime スキップ時に渡される実際の経過時間（秒）
   */
  const goToNextPhase = useCallback(
    (actualElapsedTime = null) => {
      const currentSections = sectionsRef.current;
      const currentTotalCycles = totalCyclesRef.current;
      const prevIsWorkPhase = isWorkPhaseRef.current; // refから取得
      const prevSectionIndex = currentSectionIndexRef.current;

      // 📚 作業フェーズが完了した場合のみ作業時間を累積（休憩時間は含まない）
      if (prevIsWorkPhase) {
        // 📚 actualElapsedTimeが渡された場合（スキップ時）は実際の経過時間を使用
        // そうでない場合（自然完了時）は設定された作業時間を使用
        const workTime =
          actualElapsedTime !== null
            ? Math.floor(actualElapsedTime) // スキップ時: 実際の経過秒数（整数に切り捨て）
            : getTimeFromSection(currentSections[prevSectionIndex], true); // 完了時: 設定時間

        totalWorkTimeRef.current += workTime;
        setTotalWorkTime((prev) => prev + workTime);
        setCompletedWorkSessions((prev) => prev + 1);

        // 📚 現在のフェーズの作業時間をリセット
        currentPhaseWorkTimeRef.current = 0;
      }

      if (prevIsWorkPhase) {
        // 作業 → 休憩
        const breakTime = getTimeFromSection(currentSections[prevSectionIndex], false);
        if (breakTime > 0) {
          // 休憩時間がある場合
          setIsWorkPhase(false);
          isWorkPhaseRef.current = false; // refも更新
          setTotalTime(breakTime);
          setElapsedTime(0);
          hasCompletedRef.current = false;
          phaseStartTimeRef.current = null;
          pausedElapsedRef.current = 0;
          // セクションインデックスは変わらない
        } else {
          // 休憩時間が0の場合は次のセクションへ（作業フェーズのまま）
          const nextIndex = (prevSectionIndex + 1) % currentSections.length;

          // 最後のセクションの場合、サイクルをカウント
          if (nextIndex === 0) {
            setCurrentCycle((prevCycle) => {
              const nextCycle = prevCycle + 1;
              if (nextCycle > currentTotalCycles) {
                // 全サイクル完了
                setIsRunning(false);
                setShowCompletionModal(true);
                // バックエンドに作業時間を送信
                const finalWorkTime = totalWorkTimeRef.current;
                setTimeout(() => {
                  saveWorkTimeToBackend(finalWorkTime, currentSections.length * currentTotalCycles);
                }, 0);
                return prevCycle;
              }
              return nextCycle;
            });
          }

          setCurrentSectionIndex(nextIndex);
          const nextWorkTime = getTimeFromSection(currentSections[nextIndex], true);
          setTotalTime(nextWorkTime);
          setElapsedTime(0);
          hasCompletedRef.current = false;
          phaseStartTimeRef.current = null;
          pausedElapsedRef.current = 0;
        }
      } else {
        // 休憩 → 次のセクションの作業
        const nextIndex = (prevSectionIndex + 1) % currentSections.length;

        // 最後のセクションの場合、サイクルをカウント
        if (nextIndex === 0) {
          setCurrentCycle((prevCycle) => {
            const nextCycle = prevCycle + 1;
            if (nextCycle > currentTotalCycles) {
              // 全サイクル完了
              setIsRunning(false);
              setShowCompletionModal(true);
              // バックエンドに作業時間を送信
              const finalWorkTime = totalWorkTimeRef.current;
              setTimeout(() => {
                saveWorkTimeToBackend(finalWorkTime, currentSections.length * currentTotalCycles);
              }, 0);
              return prevCycle;
            }
            return nextCycle;
          });
        }

        setIsWorkPhase(true);
        isWorkPhaseRef.current = true; // refも更新
        setCurrentSectionIndex(nextIndex);
        const nextWorkTime = getTimeFromSection(currentSections[nextIndex], true);
        setTotalTime(nextWorkTime);
        setElapsedTime(0);
        hasCompletedRef.current = false;
        phaseStartTimeRef.current = null;
        pausedElapsedRef.current = 0;
      }
    },
    [getTimeFromSection, saveWorkTimeToBackend]
  );

  /**
   * 📚 タイマーのメインロジック（バックグラウンドでも正確に動作）
   * 開始時刻からの経過時間を計算する方式
   */
  useEffect(() => {
    if (isRunning) {
      hasCompletedRef.current = false;

      // 📚 フェーズ開始時刻を記録（再開時は一時停止時の経過時間を考慮）
      if (phaseStartTimeRef.current === null) {
        phaseStartTimeRef.current = Date.now() - pausedElapsedRef.current * 1000;
      }

      intervalRef.current = setInterval(() => {
        // 📚 開始時刻からの経過時間を計算（バックグラウンドでも正確）
        const now = Date.now();
        const elapsed = (now - phaseStartTimeRef.current) / 1000; // 秒に変換

        setElapsedTime(elapsed);

        // タイマー完了チェック
        if (elapsed >= totalTime && !hasCompletedRef.current) {
          hasCompletedRef.current = true;
          // インターバルをクリアしてから次のフェーズへ
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          goToNextPhase();
        }
      }, 100);
    } else {
      // 📚 一時停止時は現在の経過時間を保存
      if (phaseStartTimeRef.current !== null) {
        pausedElapsedRef.current = elapsedTime;
      }

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, totalTime, goToNextPhase, elapsedTime]);

  // 📚 進捗率の計算
  const progress = totalTime > 0 ? (elapsedTime / totalTime) * 100 : 0;

  // 📚 SVG円の計算
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
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
    // 開始前は最初のセクションの作業時間を表示
    if (!hasStarted) {
      const initialTime = getTimeFromSection(sections[0], true);
      if (displayMode === 'countdown') {
        return formatTime(initialTime);
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
    const initialTime = getTimeFromSection(sections[0], true);
    if (initialTime > 0) {
      setCurrentSectionIndex(0);
      currentSectionIndexRef.current = 0;
      setCurrentCycle(1);
      setIsWorkPhase(true);
      isWorkPhaseRef.current = true;
      setTotalTime(initialTime);
      setElapsedTime(0);
      setHasStarted(true);
      setIsRunning(true);
      // 累積時間をリセット
      setTotalWorkTime(0);
      setCompletedWorkSessions(0);
      totalWorkTimeRef.current = 0;
      currentPhaseWorkTimeRef.current = 0;
      // 📚 開始時刻をリセット
      phaseStartTimeRef.current = null;
      pausedElapsedRef.current = 0;
    }
  }, [sections, getTimeFromSection]);

  /**
   * 📚 停止ボタンの処理
   * 停止前に作業時間が1分以上あれば保存
   */
  const handleStop = useCallback(() => {
    // 📚 現在の作業フェーズの経過時間を計算
    let currentPhaseTime = 0;
    if (isWorkPhase && elapsedTime > 0) {
      // フェーズが完了している場合（elapsedTime >= totalTime）は設定時間を使用
      // 完了していない場合は実際の経過時間を使用
      currentPhaseTime =
        elapsedTime >= totalTime
          ? totalTime // 完了済み: 設定時間（goToNextPhaseで既に記録済みなので0にすべき？）
          : Math.floor(elapsedTime); // 未完了: 実際の経過時間

      // 📚 フェーズが完了済みの場合は既にgoToNextPhaseで記録されているので加算しない
      if (elapsedTime >= totalTime) {
        currentPhaseTime = 0;
      }
    }

    const finalWorkTime = totalWorkTimeRef.current + currentPhaseTime;

    // 📚 1分以上の作業時間があれば保存
    if (finalWorkTime >= 60) {
      const sessionsCount = completedWorkSessions + (currentPhaseTime > 0 ? 1 : 0);
      saveWorkTimeToBackend(finalWorkTime, sessionsCount);
    }

    hasCompletedRef.current = false;
    setIsRunning(false);
    setHasStarted(false);
    setCurrentSectionIndex(0);
    currentSectionIndexRef.current = 0;
    setCurrentCycle(1);
    setIsWorkPhase(true);
    isWorkPhaseRef.current = true;
    setElapsedTime(0);
    setTotalTime(0);
    setShowCompletionModal(false);
    // 累積時間をリセット
    setTotalWorkTime(0);
    setCompletedWorkSessions(0);
    totalWorkTimeRef.current = 0;
    currentPhaseWorkTimeRef.current = 0;
    // 📚 開始時刻をリセット
    phaseStartTimeRef.current = null;
    pausedElapsedRef.current = 0;
  }, [isWorkPhase, elapsedTime, totalTime, completedWorkSessions, saveWorkTimeToBackend]);

  // 📚 停止関数をコンテキストに登録
  useEffect(() => {
    registerStopCallback(handleStop);
  }, [handleStop, registerStopCallback]);

  /**
   * 📚 再生/一時停止ボタンの処理
   * 一時停止では作業時間を保存しない（停止ボタンで保存する）
   */
  const togglePlayPause = useCallback(() => {
    setIsRunning(!isRunning);
  }, [isRunning]);

  /**
   * 📚 スキップボタンの処理（次のフェーズへ）
   * 作業フェーズをスキップする場合は実際の経過時間を記録
   * 休憩フェーズをスキップする場合は何も記録しない
   */
  const handleSkip = useCallback(() => {
    // 📚 作業フェーズの場合のみ実際の経過時間を渡す（休憩フェーズはnullで何も記録しない）
    const actualTime = isWorkPhase ? elapsedTime : null;
    goToNextPhase(actualTime);
  }, [goToNextPhase, isWorkPhase, elapsedTime]);

  // 📚 プログレスバーの色（停止中=グレー、作業中=オレンジ、休憩中=緑）
  const getColors = () => {
    if (!hasStarted || !isRunning) {
      // 停止中（未開始または一時停止）
      return {
        progress: '#9ca3af', // gray-400
        bg: 'rgba(156, 163, 175, 0.1)',
      };
    } else if (isWorkPhase) {
      // 作業中
      return {
        progress: '#f97316', // orange-500
        bg: 'rgba(249, 115, 22, 0.1)',
      };
    } else {
      // 休憩中
      return {
        progress: '#22c55e', // green-500
        bg: 'rgba(34, 197, 94, 0.1)',
      };
    }
  };

  const colors = getColors();
  const progressColor = colors.progress;
  const bgColor = colors.bg;

  // 📚 フェーズバッジのスタイル
  const getBadgeStyle = () => {
    if (!hasStarted || !isRunning) {
      return { className: 'bg-gray-100 text-gray-600', label: '⏸️ 停止中' };
    } else if (isWorkPhase) {
      return { className: 'bg-orange-100 text-orange-600', label: '🟠 作業中' };
    } else {
      return { className: 'bg-green-100 text-green-600', label: '🟢 休憩中' };
    }
  };

  const badgeStyle = getBadgeStyle();

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 min-h-[200px] @container">
      {/* 📚 フェーズ表示 */}
      <div className="mb-2 text-center">
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badgeStyle.className}`}>
          {badgeStyle.label}
        </span>
        <div className="text-xs text-gray-500 mt-1">
          サイクル {currentCycle} / {totalCycles} | セクション {currentSectionIndex + 1} / {sections.length}
        </div>
      </div>
      {/* 📚 円形プログレスバー */}
      <div className="relative flex items-center justify-center mb-4 w-[85%] max-w-[600px] aspect-square">
        <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 200 200">
          {/* 背景の円 */}
          <circle cx="100" cy="100" r={radius} fill="none" stroke={bgColor} strokeWidth="12" />
          {/* 進捗を示す円 */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={progressColor}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-100"
          />
        </svg>

        {/* 中央のタイム表示 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-2">
          <div
            className="font-mono font-bold leading-none @[150px]:text-2xl @[200px]:text-3xl @[300px]:text-5xl @[400px]:text-6xl @[500px]:text-7xl text-xl"
            style={{ color: progressColor }}
          >
            {getDisplayValue()}
          </div>
        </div>
      </div>

      {/* 📚 コントロールボタン */}
      <div className="flex gap-2 justify-center flex-shrink-0">
        {!hasStarted ? (
          // 開始前：スタートボタン
          <button
            onClick={handleStart}
            className="flex items-center gap-1 px-3 py-2 bg-gray-200 text-black rounded-full text-sm font-semibold hover:bg-gray-300 transition-all"
          >
            <Play size={16} />
          </button>
        ) : (
          // 実行中・一時停止中：コントロールボタン
          <>
            <button
              onClick={handleStop}
              className="flex items-center gap-1 px-3 py-2 bg-gray-200 text-black rounded-full text-sm font-semibold hover:bg-gray-300 transition-all"
              title="停止"
            >
              <Square size={16} />
            </button>
            <button
              onClick={togglePlayPause}
              className="flex items-center gap-1 px-3 py-2 bg-gray-200 text-black rounded-full text-sm font-semibold hover:bg-gray-300 transition-all"
            >
              {isRunning ? <Pause size={16} /> : <Play size={16} />}
            </button>

            <button
              onClick={handleSkip}
              className="flex items-center gap-1 px-3 py-2 bg-gray-200 text-black rounded-full text-sm font-semibold hover:bg-gray-300 transition-all"
              title="次のフェーズへスキップ"
            >
              <SkipForward size={16} />
            </button>
          </>
        )}
      </div>

      {/* 📚 完了モーダル（Portalで画面全体に表示） */}
      {showCompletionModal &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
            onClick={() => {
              setShowCompletionModal(false);
              handleStop();
            }}
          >
            <div
              className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-[90%] text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">完了！</h2>
              <p className="text-gray-600 mb-6">
                {totalCycles}サイクル ({sections.length}セクション × {totalCycles}) を完了しました！
              </p>
              <button
                onClick={() => {
                  setShowCompletionModal(false);
                  handleStop();
                }}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

export default TimerWidget;
