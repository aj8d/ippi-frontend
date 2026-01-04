/**
 * TimerCompletionModal.jsx - タイマー完了モーダル
 */

import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function TimerCompletionModal({ show, totalCycles, sectionsLength, onClose }) {
  if (!show) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-[90%] text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">完了！</h2>
        <p className="text-gray-600 mb-6">
          {totalCycles}サイクル ({sectionsLength}セクション × {totalCycles}) を完了しました！
        </p>
        <button
          onClick={onClose}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          閉じる
        </button>
      </div>
    </div>,
    document.body
  );
}
