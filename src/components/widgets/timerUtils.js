/**
 * タイマーに関するユーティリティ関数
 */

// デフォルトのポモドーロセクション
export const DEFAULT_SECTIONS = [{ id: 1, workMinutes: '25', workSeconds: '0', breakMinutes: '5', breakSeconds: '0' }];

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
