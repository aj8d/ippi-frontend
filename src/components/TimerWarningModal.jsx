/**
 * TimerWarningModal.jsx - タイマー動作中の警告モーダル
 *
 * 📚 このコンポーネントの役割：
 * - タイマー動作中に操作を行おうとしたときに警告を表示
 * - 「続行」を選択するとタイマーを停止して操作を実行
 * - 「キャンセル」を選択すると操作をキャンセル
 */

import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

function TimerWarningModal({ isOpen, onClose, onConfirm, actionType = 'navigate' }) {
  if (!isOpen) return null;

  // 📚 操作タイプに応じたメッセージを取得
  const getMessage = () => {
    switch (actionType) {
      case 'navigate':
        return '別のページに移動しようとしています。';
      case 'settings':
        return 'タイマー設定を開こうとしています。';
      case 'stats':
        return '統計を開こうとしています。';
      case 'close':
        return 'ページを閉じようとしています。';
      default:
        return '操作を実行しようとしています。';
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center z-[9999]">
      {/* オーバーレイ */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* モーダル */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-amber-50">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-gray-800">タイマー動作中</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-amber-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6">
          <p className="text-gray-700 mb-2">{getMessage()}</p>
          <p className="text-gray-600 text-sm">
            タイマーが動作中です。続行すると、現在の作業時間を保存してタイマーを停止します。
          </p>
        </div>

        {/* フッター */}
        <div className="flex gap-3 p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            キャンセル
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
          >
            停止して続行
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default TimerWarningModal;
