/**
 * タイマーに関するユーティリティ関数
 */

// デフォルトのポモドーロセクション
export const DEFAULT_SECTIONS = [{ id: 1, workMinutes: '25', workSeconds: '0', breakMinutes: '5', breakSeconds: '0' }];

// AudioContextのシングルトンインスタンス
let audioContext = null;

/**
 * AudioContextを取得（シングルトン）
 */
function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  // サスペンド状態の場合は再開
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
}

/**
 * 「ぴぴっ」というアラーム音を再生
 * @param {number} volume - 音量（0〜1）
 */
export function playAlarmSound(volume = 0.5) {
  if (volume <= 0) return; // 音量0なら再生しない

  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // 2回の短いビープ音を生成（ぴぴっ）
    const beepDuration = 0.1; // 各ビープの長さ（秒）
    const beepGap = 0.08; // ビープ間の間隔（秒）
    const frequency = 1200; // 高めの周波数（ぴっという音）

    for (let i = 0; i < 2; i++) {
      const startTime = now + i * (beepDuration + beepGap);

      // オシレーター（音を生成）
      const oscillator = ctx.createOscillator();
      oscillator.type = 'sine'; // サイン波（柔らかい音）
      oscillator.frequency.setValueAtTime(frequency, startTime);

      // ゲイン（音量制御）
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0, startTime);
      // フェードイン
      gainNode.gain.linearRampToValueAtTime(volume * 0.3, startTime + 0.01);
      // フェードアウト
      gainNode.gain.linearRampToValueAtTime(0, startTime + beepDuration);

      // 接続
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // 再生
      oscillator.start(startTime);
      oscillator.stop(startTime + beepDuration);
    }
  } catch (error) {
    console.error('アラーム音の再生エラー:', error);
  }
}

/**
 * セクションから時間（秒）を計算
 * @param {Object} section - セクション設定
 * @param {boolean} isWork - true: 作業時間, false: 休憩時間
 * @returns {number} 秒数
 */
export function getTimeFromSection(section, isWork) {
  if (isWork) {
    const mins = parseInt(section.workMinutes) || 0;
    return mins * 60;
  } else {
    const mins = parseInt(section.breakMinutes) || 0;
    return mins * 60;
  }
}

/**
 * 時間（秒）を「MM:SS」形式にフォーマット
 * @param {number} seconds - 秒数
 * @returns {string} MM:SS形式の文字列
 */
export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 進捗率（0〜1）を計算
 * @param {number} elapsed - 経過時間（秒）
 * @param {number} total - 合計時間（秒）
 * @returns {number} 進捗率（0〜1）
 */
export function calculateProgress(elapsed, total) {
  if (total === 0) return 0;
  return Math.min(elapsed / total, 1);
}

/**
 * SVGの円弧パスを計算
 * @param {number} progress - 進捗率（0〜1）
 * @param {number} size - SVGのサイズ
 * @param {number} strokeWidth - ストロークの幅
 * @returns {string} SVGパス文字列
 */
export function calculateArcPath(progress, size, strokeWidth) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return {
    radius,
    circumference,
    offset,
  };
}
