import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { Play, Pause, Square, SkipForward, Check, PictureInPicture2 } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { useTimer } from '../../contexts/TimerContext';
import { useTimerCompletionNotification } from '../../hooks/useTimerCompletionNotification';
import { API_ENDPOINTS } from '../../config';
import { DEFAULT_SECTIONS, getTimeFromSection, formatTime, playAlarmSound } from './timerUtils';
import TimerWarningModal from '../TimerWarningModal';

function copyDocumentStyles(sourceDocument, targetDocument) {
  const styleNodes = sourceDocument.querySelectorAll('style, link[rel="stylesheet"]');

  styleNodes.forEach((node) => {
    targetDocument.head.appendChild(node.cloneNode(true));
  });
}

function TimerControls({
  hasStarted,
  onStart,
  onStop,
  onTogglePlayPause,
  isRunning,
  isIntervalMode,
  onSkip,
  isFlowmodoroMode,
  isWorkPhase,
  onFlowmodoroWorkComplete,
  className = '',
}) {
  const buttonClass = 'flex items-center gap-1 px-3 py-2 bg-gray-200 text-black rounded-full text-sm font-semibold hover:bg-gray-300 transition-all';

  return (
    <div className={`flex gap-2 justify-center flex-shrink-0 flex-wrap ${className}`}>
      {!hasStarted ? (
        <button onClick={onStart} className={buttonClass}>
          <Play size={16} />
        </button>
      ) : (
        <>
          <button onClick={onStop} className={buttonClass}>
            <Square size={16} />
          </button>
          <button onClick={onTogglePlayPause} className={buttonClass}>
            {isRunning ? <Pause size={16} /> : <Play size={16} />}
          </button>

          {isIntervalMode && (
            <button onClick={onSkip} className={buttonClass}>
              <SkipForward size={16} />
            </button>
          )}

          {isFlowmodoroMode && isWorkPhase && (
            <button onClick={onFlowmodoroWorkComplete} className={buttonClass}>
              <Check size={16} />
            </button>
          )}
        </>
      )}
    </div>
  );
}

function TimerPiPContent({
  badgeStyle,
  isIntervalMode,
  hasStarted,
  isRunning,
  isFlowmodoroMode,
  isWorkPhase,
  currentCycle,
  totalCycles,
  currentSectionIndex,
  sectionsLength,
  radius,
  circumference,
  bgColor,
  progressColor,
  strokeDashoffset,
  displayValue,
  onStart,
  onStop,
  onTogglePlayPause,
  onSkip,
  onFlowmodoroWorkComplete,
}) {
  return (
    <div className="h-screen w-screen bg-white text-gray-900 flex items-center justify-center p-4">
      <div className="w-full h-full rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 shadow-sm flex flex-col items-center justify-center p-5">
        <div className="mb-3 text-center">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badgeStyle.className}`}>
            {badgeStyle.label}
          </span>
          {isIntervalMode && (
            <div className="text-xs text-gray-500 mt-2">
              サイクル {currentCycle} / {totalCycles} | セクション {currentSectionIndex + 1} / {sectionsLength}
            </div>
          )}
        </div>

        <div className="relative flex items-center justify-center w-full max-w-[280px] aspect-square">
          <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r={radius} fill="none" stroke={bgColor} strokeWidth="12" />
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

          <div className="absolute inset-0 flex items-center justify-center px-3">
            <div className="font-mono text-4xl sm:text-5xl font-bold leading-none" style={{ color: progressColor }}>
              {displayValue}
            </div>
          </div>
        </div>

        <TimerControls
          hasStarted={hasStarted}
          onStart={onStart}
          onStop={onStop}
          onTogglePlayPause={onTogglePlayPause}
          isRunning={isRunning}
          isIntervalMode={isIntervalMode}
          onSkip={onSkip}
          isFlowmodoroMode={isFlowmodoroMode}
          isWorkPhase={isWorkPhase}
          onFlowmodoroWorkComplete={onFlowmodoroWorkComplete}
          className="mt-5"
        />
      </div>
    </div>
  );
}

function TimerWidget({ settings = {} }) {
  const { token } = useAuth();
  const { updateTimerState, registerStopCallback } = useTimer();
  const { showTimerCompletionNotification } = useTimerCompletionNotification();

  // props から設定を取得
  const displayMode = settings.displayMode || 'interval';
  const sections = settings.sections || DEFAULT_SECTIONS;
  const totalCycles = settings.totalCycles || 3; // デフォルト3サイクル
  const countdownMinutes = settings.countdownMinutes || 25; // デフォルト25分
  const alarmVolume = settings.alarmVolume !== undefined ? settings.alarmVolume : 0.5; // アラーム音量

  // モードの判定
  const isIntervalMode = displayMode === 'interval';
  const isCountupMode = displayMode === 'countup';
  const isCountdownMode = displayMode === 'countdown';
  const isFlowmodoroMode = displayMode === 'flowmodoro';

  // タイマーの状態管理
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0); // 現在のセクション
  const [currentCycle, setCurrentCycle] = useState(1); // 現在のサイクル数
  const [isWorkPhase, setIsWorkPhase] = useState(true); // true=作業, false=休憩
  const [totalTime, setTotalTime] = useState(0); // 現在のフェーズの合計時間（秒）
  const [elapsedTime, setElapsedTime] = useState(0); // 経過時間（秒）
  const [isRunning, setIsRunning] = useState(false); // 実行中かどうか
  const [hasStarted, setHasStarted] = useState(false); // タイマーが開始されたか
  const [showStopConfirmModal, setShowStopConfirmModal] = useState(false); // 停止確認モーダル

  // フローモドーロ用の状態管理
  const [flowmodoroWorkTime, setFlowmodoroWorkTime] = useState(0); // 今回の作業時間（秒）

  const intervalRef = useRef(null);
  const hasCompletedRef = useRef(false);
  const sectionsRef = useRef(sections);
  const totalCyclesRef = useRef(totalCycles);
  const currentSectionIndexRef = useRef(0); // 現在のセクションインデックスを追跡
  const isWorkPhaseRef = useRef(true); // 現在の作業/休憩フェーズを追跡
  const pipWindowRef = useRef(null);
  const pipRootRef = useRef(null);
  const [isPiPOpen, setIsPiPOpen] = useState(false);
  const [stopModalSource, setStopModalSource] = useState('main');
  const [tooltip, setTooltip] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // バックグラウンドでも正確に動作させるため、開始時刻を記録
  const phaseStartTimeRef = useRef(null); // フェーズ開始時刻（ミリ秒）
  const pausedElapsedRef = useRef(0); // 一時停止時の経過時間

  // 累積作業時間をトラッキング（秒）
  const [_totalWorkTime, setTotalWorkTime] = useState(0);
  const [completedWorkSessions, setCompletedWorkSessions] = useState(0);
  const totalWorkTimeRef = useRef(0);

  // 現在のフェーズで経過した作業時間（秒）をトラッキング
  const currentPhaseWorkTimeRef = useRef(0);

  // アラーム音量のrefを追跡
  const alarmVolumeRef = useRef(alarmVolume);
  useEffect(() => {
    alarmVolumeRef.current = alarmVolume;
  }, [alarmVolume]);

  // refs を最新の値で更新
  useEffect(() => {
    sectionsRef.current = sections;
    totalCyclesRef.current = totalCycles;
  }, [sections, totalCycles]);

  // currentSectionIndexRefを同期
  useEffect(() => {
    currentSectionIndexRef.current = currentSectionIndex;
  }, [currentSectionIndex]);

  // isWorkPhaseRefを同期
  useEffect(() => {
    isWorkPhaseRef.current = isWorkPhase;
  }, [isWorkPhase]);

  // currentSectionIndexが変更されたらrefも更新
  useEffect(() => {
    currentSectionIndexRef.current = currentSectionIndex;
  }, [currentSectionIndex]);

  // タイマー状態をコンテキストに通知
  useEffect(() => {
    updateTimerState(hasStarted);
  }, [hasStarted, updateTimerState]);

  /**
   * バックエンドに作業時間を送信
   * @param workSeconds 作業時間（秒）- 分単位に切り捨てて保存
   * @param sessionsCount セッション数（ログ用）
   */
  const saveWorkTimeToBackend = useCallback(
    async (workSeconds, sessionsCount) => {
      if (!token) return;

      // 秒を分に変換し、端数を切り捨て（60秒未満は0分）
      const workMinutes = Math.floor(workSeconds / 60);

      // 1分未満の場合は保存しない
      if (workMinutes < 1) {
        console.log(`⏭️ 作業時間が1分未満のため保存スキップ: ${workSeconds}秒`);
        return;
      }

      // 分を秒に戻す（端数切り捨て後の値）
      const truncatedSeconds = workMinutes * 60;

      try {
        // 今日の日付を取得（YYYY-MM-DD形式）
        const today = new Date().toISOString().split('T')[0];

        const response = await fetch(API_ENDPOINTS.TEXT_DATA.WORK_SESSION, {
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
    [token],
  );

  /**
   * タイマー完了をバックエンドに記録（今日のカウント加算）
   * ポモドーロ/フローモドーロの作業セッション完了時にのみ呼び出される
   */
  const recordTimerCompletion = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(API_ENDPOINTS.TEXT_DATA.TIMER_COMPLETION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`🔥 タイマー完了を記録: 今日の完了数 ${data.dailyTimerCompletions}`);
        // StreakWidgetに更新を通知
        window.dispatchEvent(new CustomEvent('timerCompleted'));
      }
    } catch (error) {
      console.error('タイマー完了の記録エラー:', error);
    }
  }, [token]);

  /**
   * セクションから時間（秒）を計算
   * (timerUtilsからインポート済みなのでコメントアウト)
   */
  // const getTimeFromSection = ... は timerUtils.js に移動済み

  /**
   * 次のフェーズに進む
   * @param actualElapsedTime スキップ時に渡される実際の経過時間（秒）
   * @param playSound アラーム音を鳴らすかどうか（デフォルト: true）
   */
  const goToNextPhase = useCallback(
    (actualElapsedTime = null, playSound = true) => {
      // フェーズ切り替え時にアラーム音を鳴らす
      if (playSound) {
        playAlarmSound(alarmVolumeRef.current);
      }

      const currentSections = sectionsRef.current;
      const currentTotalCycles = totalCyclesRef.current;
      const prevIsWorkPhase = isWorkPhaseRef.current; // refから取得
      const prevSectionIndex = currentSectionIndexRef.current;

      // 作業フェーズが完了した場合のみ作業時間を累積（休憩時間は含まない）
      if (prevIsWorkPhase) {
        // actualElapsedTimeが渡された場合（スキップ時）は実際の経過時間を使用
        // そうでない場合（自然完了時）は設定された作業時間を使用
        const workTime =
          actualElapsedTime !== null
            ? Math.floor(actualElapsedTime) // スキップ時: 実際の経過秒数（整数に切り捨て）
            : getTimeFromSection(currentSections[prevSectionIndex], true); // 完了時: 設定時間

        totalWorkTimeRef.current += workTime;
        setTotalWorkTime((prev) => prev + workTime);
        setCompletedWorkSessions((prev) => prev + 1);

        // 1分以上の作業時間があればタイマー完了を記録
        if (workTime >= 60) {
          recordTimerCompletion();
        }

        // 現在のフェーズの作業時間をリセット
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
                // 全サイクル完了 - タイマーを初期状態にリセット
                setIsRunning(false);
                setHasStarted(false);
                // バックエンドに作業時間を送信
                const finalWorkTime = totalWorkTimeRef.current;
                showTimerCompletionNotification(finalWorkTime);
                saveWorkTimeToBackend(finalWorkTime, currentSections.length * currentTotalCycles);
                // タイマー完了を記録
                recordTimerCompletion();
                // UI状態を初期状態にリセット
                setCurrentSectionIndex(0);
                setIsWorkPhase(true);
                setElapsedTime(0);
                setTotalTime(getTimeFromSection(currentSections[0], true));
                phaseStartTimeRef.current = null;
                pausedElapsedRef.current = 0;
                return 1; // サイクルを1にリセット
              }
              return nextCycle;
            });
            // 全サイクル完了の場合は以降の処理をスキップ
            return prevSectionIndex;
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
              // 全サイクル完了 - タイマーを初期状態にリセット
              setIsRunning(false);
              setHasStarted(false);
              // バックエンドに作業時間を送信
              const finalWorkTime = totalWorkTimeRef.current;
              showTimerCompletionNotification(finalWorkTime);
              saveWorkTimeToBackend(finalWorkTime, currentSections.length * currentTotalCycles);
              // タイマー完了を記録
              recordTimerCompletion();
              // UI状態を初期状態にリセット
              setCurrentSectionIndex(0);
              setIsWorkPhase(true);
              isWorkPhaseRef.current = true;
              setElapsedTime(0);
              setTotalTime(getTimeFromSection(currentSections[0], true));
              phaseStartTimeRef.current = null;
              pausedElapsedRef.current = 0;
              return 1; // サイクルを1にリセット
            }
            return nextCycle;
          });
          // 全サイクル完了の場合は以降の処理をスキップ
          return prevSectionIndex;
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
    [saveWorkTimeToBackend, recordTimerCompletion, showTimerCompletionNotification],
  );

  /**
   * タイマーのメインロジック（バックグラウンドでも正確に動作）
   * 開始時刻からの経過時間を計算する方式
   */
  useEffect(() => {
    if (isRunning) {
      hasCompletedRef.current = false;

      // フェーズ開始時刻を記録（再開時は一時停止時の経過時間を考慮）
      if (phaseStartTimeRef.current === null) {
        phaseStartTimeRef.current = Date.now() - pausedElapsedRef.current * 1000;
      }

      intervalRef.current = setInterval(() => {
        // 開始時刻からの経過時間を計算（バックグラウンドでも正確）
        const now = Date.now();
        const elapsed = (now - phaseStartTimeRef.current) / 1000; // 秒に変換

        setElapsedTime(elapsed);

        // インターバルモードのみ、タイマー完了チェックを行う
        if (isIntervalMode && elapsed >= totalTime && !hasCompletedRef.current) {
          hasCompletedRef.current = true;
          // インターバルをクリアしてから次のフェーズへ
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          goToNextPhase();
        }

        // カウントダウンモードは設定時間に達したら停止
        if (isCountdownMode && elapsed >= totalTime && !hasCompletedRef.current) {
          hasCompletedRef.current = true;
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setIsRunning(false);
          // アラーム音を鳴らす
          playAlarmSound(alarmVolumeRef.current);
          // 作業時間を保存
          const workTime = Math.floor(elapsed);
          if (workTime >= 60) {
            saveWorkTimeToBackend(workTime, 1);
            // 完了通知を表示
            showTimerCompletionNotification(workTime);
            // タイマー完了を記録
            recordTimerCompletion();
          }
          // タイマーを初期状態にリセット
          setHasStarted(false);
          setElapsedTime(0);
          phaseStartTimeRef.current = null;
          pausedElapsedRef.current = 0;
        }

        // フローモドーロモードで休憩終了時、自動的に次の作業に移行
        if (isFlowmodoroMode && !isWorkPhaseRef.current && elapsed >= totalTime && !hasCompletedRef.current) {
          hasCompletedRef.current = true;
          clearInterval(intervalRef.current);
          intervalRef.current = null;

          // アラーム音を鳴らす
          playAlarmSound(alarmVolumeRef.current);

          // 今回の作業時間を保存
          // タイマー完了を記録
          recordTimerCompletion();
          if (flowmodoroWorkTime >= 60) {
            saveWorkTimeToBackend(flowmodoroWorkTime, 1);
          }

          // 次の作業を開始
          setFlowmodoroWorkTime(0);
          setIsWorkPhase(true);
          isWorkPhaseRef.current = true;
          setTotalTime(Infinity);
          setElapsedTime(0);
          setIsRunning(true);
          phaseStartTimeRef.current = null;
          pausedElapsedRef.current = 0;
        }
      }, 100);
    } else {
      // 一時停止時は現在の経過時間を保存
      if (phaseStartTimeRef.current !== null) {
        pausedElapsedRef.current = elapsedTime;
        phaseStartTimeRef.current = null; // リセットして再開時に再計算
      }

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [
    isRunning,
    totalTime,
    goToNextPhase,
    isIntervalMode,
    isCountdownMode,
    isFlowmodoroMode,
    flowmodoroWorkTime,
    saveWorkTimeToBackend,
    elapsedTime,
    recordTimerCompletion,
    showTimerCompletionNotification,
  ]);

  // 進捗率の計算
  const progress = (() => {
    // カウントアップ: 進捗バーなし
    if (isCountupMode) {
      return 0;
    }

    // フローモドーロ: 作業中は進捗バーなし、休憩中は進捗率を表示
    if (isFlowmodoroMode) {
      if (!hasStarted || isWorkPhase) {
        return 0;
      }
      // 休憩中は進捗率を計算
      if (totalTime > 0 && totalTime !== Infinity) {
        return (elapsedTime / totalTime) * 100;
      }
      return 0;
    }

    // カウントダウン・インターバル: 経過率を計算
    if (totalTime > 0 && totalTime !== Infinity) {
      return (elapsedTime / totalTime) * 100;
    }

    return 0;
  })();

  // SVG円の計算
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const isPiPSupported =
    typeof window !== 'undefined' && typeof window.documentPictureInPicture?.requestWindow === 'function';

  /**
   * 表示モードに応じた値を返す
   */
  const getDisplayValue = () => {
    // カウントアップ: 経過時間を表示
    if (isCountupMode) {
      return formatTime(elapsedTime);
    }

    // フローモドーロ: 作業中は経過時間、休憩中は残り時間
    if (isFlowmodoroMode) {
      if (isWorkPhase) {
        return formatTime(elapsedTime);
      } else {
        // 休憩中は残り時間を表示
        const remaining = Math.max(0, totalTime - elapsedTime);
        return formatTime(remaining);
      }
    }

    // カウントダウン: 残り時間を表示
    if (isCountdownMode) {
      if (!hasStarted) {
        return formatTime(totalTime > 0 ? totalTime : 0);
      }
      const remaining = Math.max(0, totalTime - elapsedTime);
      return formatTime(remaining);
    }

    // インターバル（ポモドーロ）: 残り時間を表示
    if (isIntervalMode) {
      if (!hasStarted) {
        const initialTime = getTimeFromSection(sections[0], true);
        return formatTime(initialTime);
      }
      const remaining = Math.max(0, totalTime - elapsedTime);
      return formatTime(remaining);
    }

    return formatTime(0);
  };

  /**
   * スタートボタンの処理
   */
  const handleStart = useCallback(() => {
    // インターバル（ポモドーロ）モード
    if (isIntervalMode) {
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
        setTotalWorkTime(0);
        setCompletedWorkSessions(0);
        totalWorkTimeRef.current = 0;
        currentPhaseWorkTimeRef.current = 0;
        phaseStartTimeRef.current = null;
        pausedElapsedRef.current = 0;
      }
      return;
    }

    // カウントアップモード: 0から開始
    if (isCountupMode) {
      setTotalTime(Infinity); // 無制限
      setElapsedTime(0);
      setHasStarted(true);
      setIsRunning(true);
      totalWorkTimeRef.current = 0;
      phaseStartTimeRef.current = null;
      pausedElapsedRef.current = 0;
      return;
    }

    // カウントダウンモード: 設定された時間から開始
    if (isCountdownMode) {
      const timeInSeconds = countdownMinutes * 60;
      setTotalTime(timeInSeconds);
      setElapsedTime(0);
      setHasStarted(true);
      setIsRunning(true);
      totalWorkTimeRef.current = 0;
      phaseStartTimeRef.current = null;
      pausedElapsedRef.current = 0;
      return;
    }

    // フローモドーロモード: 作業時間を自由に計測、休憩時間は作業時間の1/5
    if (isFlowmodoroMode) {
      setTotalTime(Infinity); // 無制限
      setElapsedTime(0);
      setHasStarted(true);
      setIsRunning(true);
      setIsWorkPhase(true);
      totalWorkTimeRef.current = 0;
      phaseStartTimeRef.current = null;
      pausedElapsedRef.current = 0;
      return;
    }
  }, [sections, isIntervalMode, isCountupMode, isCountdownMode, isFlowmodoroMode, countdownMinutes]);

  /**
   * 停止ボタンクリック時の処理（確認モーダルを表示）
   */
  const handleStopClick = useCallback((source = 'main') => {
    setStopModalSource(source);
    setShowStopConfirmModal(true);
  }, []);

  /**
   * 停止確認後の実際の停止処理
   * 停止前に作業時間が1分以上あれば保存
   */
  const handleStopConfirmed = useCallback(() => {
    let finalWorkTime = 0;

    // インターバルモード: 累積作業時間 + 現在のフェーズ
    if (isIntervalMode) {
      let currentPhaseTime = 0;
      if (isWorkPhase && elapsedTime > 0) {
        currentPhaseTime = elapsedTime >= totalTime ? 0 : Math.floor(elapsedTime);
      }
      finalWorkTime = totalWorkTimeRef.current + currentPhaseTime;
    }
    // カウントアップ・カウントダウン・フローモドーロ: 経過時間をそのまま保存
    else {
      finalWorkTime = Math.floor(elapsedTime);
    }

    // 1分以上の作業時間があれば保存し、完了通知を表示
    if (finalWorkTime >= 60) {
      const sessionsCount = isIntervalMode
        ? completedWorkSessions + (elapsedTime > 0 && elapsedTime < totalTime ? 1 : 0)
        : 1;
      saveWorkTimeToBackend(finalWorkTime, sessionsCount);
      // 1分以上の作業記録がある場合は完了通知を表示
      showTimerCompletionNotification(finalWorkTime);
    }

    // 状態をリセット
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
    // 完了モーダルは表示する場合があるので、ここではリセットしない
    setTotalWorkTime(0);
    setCompletedWorkSessions(0);
    totalWorkTimeRef.current = 0;
    currentPhaseWorkTimeRef.current = 0;
    phaseStartTimeRef.current = null;
    pausedElapsedRef.current = 0;
    // フローモドーロのリセット
    setFlowmodoroWorkTime(0);
    // 停止確認モーダルを閉じる
    setShowStopConfirmModal(false);
  }, [
    isIntervalMode,
    isWorkPhase,
    elapsedTime,
    totalTime,
    completedWorkSessions,
    saveWorkTimeToBackend,
    showTimerCompletionNotification,
  ]);

  // 停止関数をコンテキストに登録
  useEffect(() => {
    registerStopCallback(handleStopConfirmed);
  }, [handleStopConfirmed, registerStopCallback]);

  /**
   * 再生/一時停止ボタンの処理
   * 一時停止では作業時間を保存しない（停止ボタンで保存する）
   */
  const togglePlayPause = useCallback(() => {
    setIsRunning(!isRunning);
  }, [isRunning]);

  /**
   * スキップボタンの処理（次のフェーズへ）
   * 作業フェーズをスキップする場合は実際の経過時間を記録
   * 休憩フェーズをスキップする場合は何も記録しない
   */
  const handleSkip = useCallback(() => {
    // 作業フェーズの場合のみ実際の経過時間を渡す（休憩フェーズはnullで何も記録しない）
    const actualTime = isWorkPhase ? elapsedTime : null;
    goToNextPhase(actualTime);
  }, [goToNextPhase, isWorkPhase, elapsedTime]);

  /**
   * フローモドーロ用：作業完了ボタンの処理
   * 作業時間から休憩時間を計算して自動的に休憩を開始
   */
  const handleFlowmodoroWorkComplete = useCallback(() => {
    if (!isFlowmodoroMode || !isRunning) return;

    // 作業時間を秒単位で計算（小数点以下は切り捨て）
    const workTimeInSeconds = Math.floor(elapsedTime);
    const workTimeInMinutes = Math.floor(workTimeInSeconds / 60);

    // 作業時間の /5 を休憩時間として計算（分未満は切り捨て、最小1分）
    const breakTimeInMinutes = Math.max(1, Math.floor(workTimeInMinutes / 5));
    const breakTimeInSeconds = breakTimeInMinutes * 60;

    // 作業時間を記録
    setFlowmodoroWorkTime(workTimeInSeconds);

    // 休憩時間を設定して自動的に休憩を開始
    setTotalTime(breakTimeInSeconds);
    setElapsedTime(0);
    setIsWorkPhase(false);
    isWorkPhaseRef.current = false;
    phaseStartTimeRef.current = null;
    pausedElapsedRef.current = 0;
  }, [isFlowmodoroMode, isRunning, elapsedTime]);

  // プログレスバーの色（停止中=グレー、作業中=オレンジ、休憩中=緑）
  const getColors = () => {
    if (!hasStarted || !isRunning) {
      // 停止中（未開始または一時停止）
      return {
        progress: '#9ca3af', // gray-400
        bg: 'rgba(156, 163, 175, 0.1)',
      };
    } else if (isIntervalMode) {
      // インターバルモードのみ作業/休憩で色分け
      if (isWorkPhase) {
        return {
          progress: '#f97316', // orange-500
          bg: 'rgba(249, 115, 22, 0.1)',
        };
      } else {
        return {
          progress: '#22c55e', // green-500
          bg: 'rgba(34, 197, 94, 0.1)',
        };
      }
    } else if (isFlowmodoroMode) {
      // フローモドーロモードも作業/休憩で色分け
      if (isWorkPhase) {
        return {
          progress: '#f97316', // orange-500
          bg: 'rgba(249, 115, 22, 0.1)',
        };
      } else {
        return {
          progress: '#22c55e', // green-500
          bg: 'rgba(34, 197, 94, 0.1)',
        };
      }
    } else {
      // その他のモード（カウント系）は常にオレンジ
      return {
        progress: '#f97316', // orange-500
        bg: 'rgba(249, 115, 22, 0.1)',
      };
    }
  };

  const colors = getColors();
  const progressColor = colors.progress;
  const bgColor = colors.bg;

  // フェーズバッジのスタイル
  const getBadgeStyle = () => {
    if (!hasStarted || !isRunning) {
      return { className: 'bg-gray-100 text-gray-600', label: '⏸️ 停止中' };
    }

    // ポモドーロモードとフローモドーロモードで作業/休憩を区別
    if (isIntervalMode || isFlowmodoroMode) {
      if (isWorkPhase) {
        return { className: 'bg-orange-100 text-orange-600', label: '🟠 作業中' };
      } else {
        return { className: 'bg-green-100 text-green-600', label: '🟢 休憩中' };
      }
    }

    // その他のモードは常にオレンジ（計測中）
    return { className: 'bg-orange-100 text-orange-600', label: '🟠 計測中' };
  };

  const badgeStyle = getBadgeStyle();
  const displayValue = getDisplayValue();

  const renderPiPWindow = useCallback(() => {
    if (!pipRootRef.current || !pipWindowRef.current) {
      return;
    }

    pipRootRef.current.render(
      <TimerPiPContent
        badgeStyle={badgeStyle}
        isIntervalMode={isIntervalMode}
        hasStarted={hasStarted}
        isRunning={isRunning}
        isFlowmodoroMode={isFlowmodoroMode}
        isWorkPhase={isWorkPhase}
        currentCycle={currentCycle}
        totalCycles={totalCycles}
        currentSectionIndex={currentSectionIndex}
        sectionsLength={sections.length}
        radius={radius}
        circumference={circumference}
        bgColor={bgColor}
        progressColor={progressColor}
        strokeDashoffset={strokeDashoffset}
        displayValue={displayValue}
        onStart={handleStart}
        onStop={() => handleStopClick('pip')}
        onTogglePlayPause={togglePlayPause}
        onSkip={handleSkip}
        onFlowmodoroWorkComplete={handleFlowmodoroWorkComplete}
      />,
    );
  }, [
    badgeStyle,
    isIntervalMode,
    hasStarted,
    isRunning,
    isFlowmodoroMode,
    isWorkPhase,
    currentCycle,
    totalCycles,
    currentSectionIndex,
    sections.length,
    radius,
    circumference,
    bgColor,
    progressColor,
    strokeDashoffset,
    displayValue,
    handleStart,
    handleStopClick,
    togglePlayPause,
    handleSkip,
    handleFlowmodoroWorkComplete,
  ]);

  const closePiPWindow = useCallback(() => {
    if (pipRootRef.current) {
      pipRootRef.current.unmount();
      pipRootRef.current = null;
    }

    if (pipWindowRef.current && !pipWindowRef.current.closed) {
      pipWindowRef.current.close();
    }

    pipWindowRef.current = null;
    setIsPiPOpen(false);
  }, []);

  const openPiPWindow = useCallback(async () => {
    if (!isPiPSupported) {
      return;
    }

    if (pipWindowRef.current && !pipWindowRef.current.closed) {
      pipWindowRef.current.focus();
      return;
    }

    try {
      const pipWindow = await window.documentPictureInPicture.requestWindow({
        width: 360,
        height: 420,
      });

      pipWindow.document.title = 'Timer';
      pipWindow.document.body.innerHTML = '';
      pipWindow.document.body.style.margin = '0';
      copyDocumentStyles(document, pipWindow.document);

      const container = pipWindow.document.createElement('div');
      container.id = 'timer-pip-root';
      container.style.width = '100vw';
      container.style.height = '100vh';
      pipWindow.document.body.appendChild(container);

      pipWindow.addEventListener(
        'pagehide',
        () => {
          if (pipRootRef.current) {
            pipRootRef.current.unmount();
            pipRootRef.current = null;
          }
          setShowStopConfirmModal(false);
          setStopModalSource('main');
          pipWindowRef.current = null;
          setIsPiPOpen(false);
        },
        { once: true },
      );

      pipWindowRef.current = pipWindow;
      pipRootRef.current = createRoot(container);
      setIsPiPOpen(true);
    } catch (error) {
      console.error('PiPウィンドウを開けませんでした:', error);
    }
  }, [isPiPSupported]);

  const togglePiPWindow = useCallback(() => {
    if (isPiPOpen) {
      closePiPWindow();
      return;
    }

    openPiPWindow();
  }, [closePiPWindow, isPiPOpen, openPiPWindow]);

  useEffect(() => {
    renderPiPWindow();
  }, [renderPiPWindow]);

  useEffect(() => {
    return () => {
      if (pipRootRef.current) {
        pipRootRef.current.unmount();
        pipRootRef.current = null;
      }

      if (pipWindowRef.current && !pipWindowRef.current.closed) {
        pipWindowRef.current.close();
      }

      pipWindowRef.current = null;
    };
  }, []);

  const handleTooltip = useCallback((text, pos = null) => {
    setTooltip(text);
    if (pos) {
      setTooltipPos(pos);
    }
  }, []);

  const stopModalPortalTarget =
    stopModalSource === 'pip' && pipWindowRef.current?.document?.body ? pipWindowRef.current.document.body : document.body;

  return (
    <div className="relative flex flex-col items-center justify-center h-full p-4 min-h-[200px] @container">
      {isPiPSupported && (
        <button
          onClick={togglePiPWindow}
          onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            handleTooltip(isPiPOpen ? 'PiPを閉じる' : 'PiPで表示', {
              x: rect.left + rect.width / 2,
              y: rect.bottom + 12,
            });
          }}
          onMouseLeave={() => handleTooltip(null)}
          className={`absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border transition-all ${
            isPiPOpen
              ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700'
              : 'border-gray-200 bg-white text-gray-500 hover:border-blue-200 hover:text-blue-600'
          }`}
        >
          <PictureInPicture2 size={16} />
        </button>
      )}

      {/* フェーズ表示 */}
      <div className="mb-2 text-center">
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badgeStyle.className}`}>
          {badgeStyle.label}
        </span>
        {/* ポモドーロモードのみサイクル・セクション情報を表示 */}
        {isIntervalMode && (
          <div className="text-xs text-gray-500 mt-1">
            サイクル {currentCycle} / {totalCycles} | セクション {currentSectionIndex + 1} / {sections.length}
          </div>
        )}
      </div>
      {/* 円形プログレスバー */}
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
            {displayValue}
          </div>
        </div>
      </div>

      <TimerControls
        hasStarted={hasStarted}
        onStart={handleStart}
        onStop={handleStopClick}
        onTogglePlayPause={togglePlayPause}
        isRunning={isRunning}
        isIntervalMode={isIntervalMode}
        onSkip={handleSkip}
        isFlowmodoroMode={isFlowmodoroMode}
        isWorkPhase={isWorkPhase}
        onFlowmodoroWorkComplete={handleFlowmodoroWorkComplete}
      />

      {/* 停止確認モーダル */}
      <TimerWarningModal
        isOpen={showStopConfirmModal}
        onClose={() => setShowStopConfirmModal(false)}
        onConfirm={handleStopConfirmed}
        actionType="stop"
        portalTarget={stopModalPortalTarget}
      />

      {tooltip &&
        createPortal(
          <div
            className="fixed bg-gray-800 text-white px-2.5 py-1.5 rounded text-xs font-medium whitespace-nowrap pointer-events-none z-[9999] shadow-md"
            style={{
              left: `${tooltipPos.x}px`,
              top: `${tooltipPos.y}px`,
              transform: 'translate(-50%, 0)',
            }}
          >
            {tooltip}
            <div
              className="absolute w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-800"
              style={{
                left: '50%',
                top: '-4px',
                transform: 'translateX(-50%)',
              }}
            />
          </div>,
          document.body,
        )}
    </div>
  );
}

export default TimerWidget;
