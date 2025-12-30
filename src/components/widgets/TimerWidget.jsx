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
import { Play, Pause, RotateCcw, SkipForward, X } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

const API_URL = 'http://localhost:8080/api/text-data';

// 📚 デフォルトのポモドーロセクション
const DEFAULT_SECTIONS = [{ id: 1, workMinutes: '25', workSeconds: '0', breakMinutes: '5', breakSeconds: '0' }];

function TimerWidget({ settings = {} }) {
  // eslint-disable-next-line no-unused-vars
  const { token } = useAuth();

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

  // 📚 refs を最新の値で更新
  useEffect(() => {
    sectionsRef.current = sections;
    totalCyclesRef.current = totalCycles;
  }, [sections, totalCycles]);

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
   */
  const goToNextPhase = useCallback(() => {
    const currentSections = sectionsRef.current;
    const currentTotalCycles = totalCyclesRef.current;

    setIsWorkPhase((prevIsWorkPhase) => {
      setCurrentSectionIndex((prevSectionIndex) => {
        if (prevIsWorkPhase) {
          // 作業 → 休憩
          const breakTime = getTimeFromSection(currentSections[prevSectionIndex], false);
          if (breakTime > 0) {
            setTotalTime(breakTime);
            setElapsedTime(0);
            hasCompletedRef.current = false;
            return prevSectionIndex; // セクションは変わらない
          } else {
            // 休憩時間が0の場合は次のセクションへ
            const nextIndex = (prevSectionIndex + 1) % currentSections.length;

            // 最後のセクションの場合、サイクルをカウント
            if (nextIndex === 0) {
              setCurrentCycle((prevCycle) => {
                const nextCycle = prevCycle + 1;
                if (nextCycle > currentTotalCycles) {
                  // 全サイクル完了
                  setIsRunning(false);
                  setShowCompletionModal(true);
                  return prevCycle;
                }
                return nextCycle;
              });
            }

            const nextWorkTime = getTimeFromSection(currentSections[nextIndex], true);
            setTotalTime(nextWorkTime);
            setElapsedTime(0);
            hasCompletedRef.current = false;
            return nextIndex; // 次のセクションへ
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
                return prevCycle;
              }
              return nextCycle;
            });
          }

          const nextWorkTime = getTimeFromSection(currentSections[nextIndex], true);
          setTotalTime(nextWorkTime);
          setElapsedTime(0);
          hasCompletedRef.current = false;
          return nextIndex;
        }
      });

      // isWorkPhaseを切り替え（作業→休憩の場合のみ）
      return !prevIsWorkPhase; // 必ず反転
    });
  }, [getTimeFromSection]);

  /**
   * 📚 タイマーのメインロジック
   */
  useEffect(() => {
    if (isRunning) {
      hasCompletedRef.current = false;

      intervalRef.current = setInterval(() => {
        setElapsedTime((prev) => {
          const newElapsed = prev + 0.1;

          // タイマー完了チェック
          if (newElapsed >= totalTime && !hasCompletedRef.current) {
            hasCompletedRef.current = true;
            // 次のフェーズへ自動で進む
            setTimeout(() => {
              goToNextPhase();
            }, 100);
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
  }, [isRunning, totalTime, goToNextPhase]);

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
      setCurrentCycle(1);
      setIsWorkPhase(true);
      setTotalTime(initialTime);
      setElapsedTime(0);
      setHasStarted(true);
      setIsRunning(true);
    }
  }, [sections, getTimeFromSection]);

  /**
   * 📚 リセットボタンの処理
   */
  const handleReset = useCallback(() => {
    hasCompletedRef.current = false;
    setIsRunning(false);
    setHasStarted(false);
    setCurrentSectionIndex(0);
    setCurrentCycle(1);
    setIsWorkPhase(true);
    setElapsedTime(0);
    setTotalTime(0);
    setShowCompletionModal(false);
  }, []);

  /**
   * 📚 再生/一時停止ボタンの処理
   */
  const togglePlayPause = useCallback(() => {
    setIsRunning(!isRunning);
  }, [isRunning]);

  /**
   * 📚 スキップボタンの処理（次のフェーズへ）
   */
  const handleSkip = useCallback(() => {
    goToNextPhase();
  }, [goToNextPhase]);

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
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-all"
          >
            <Play size={16} fill="white" />
            スタート
          </button>
        ) : (
          // 実行中・一時停止中：コントロールボタン
          <>
            <button
              onClick={handleSkip}
              className="flex items-center gap-1 px-3 py-2 bg-gray-200 text-black rounded-full text-sm font-semibold hover:bg-gray-300 transition-all"
              title="次のフェーズへスキップ"
            >
              <SkipForward size={16} />
            </button>
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

      {/* 📚 完了モーダル（Portalで画面全体に表示） */}
      {showCompletionModal &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
            onClick={() => {
              setShowCompletionModal(false);
              handleReset();
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
                  handleReset();
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
