/**
 * フローティングタイマー設定ボタン
 *
 * - モバイルでタイマー設定を開く
 * - 右下に固定表示
 */

import { Settings } from "lucide-react";

export default function FloatingAddButton({ onOpenTimerSettings }) {
  return (
    <div className="fixed bottom-20 right-4 z-40 lg:hidden">
      {/* タイマー設定ボタン */}
      <button onClick={onOpenTimerSettings} className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center bg-blue-500 hover:bg-blue-600 transition-all duration-300">
        <Settings className="w-6 h-6 text-white" />
      </button>
    </div>
  );
}
