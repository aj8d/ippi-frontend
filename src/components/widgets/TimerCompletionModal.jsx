import { createPortal } from 'react-dom';

export default function TimerCompletionModal({ show, workTime, onClose }) {
  if (!show) return null;

  // 作業時間（秒）を時間と分に変換
  const getWorkTimeDisplay = () => {
    if (!workTime || workTime <= 0) {
      return '';
    }

    const hours = Math.floor(workTime / 3600);
    const minutes = Math.floor((workTime % 3600) / 60);

    let display = '';
    if (hours > 0) {
      display += `${hours}時間`;
    }
    if (minutes > 0) {
      display += `${minutes}分`;
    }

    return display;
  };

  const workTimeDisplay = getWorkTimeDisplay();

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-[90%] text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">完了！</h2>
        <p className="text-gray-600 mb-6">{workTimeDisplay}間の作業お疲れさまでした！</p>
        <button
          onClick={onClose}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          閉じる
        </button>
      </div>
    </div>,
    document.body,
  );
}
