/**
 * StreakWidget.jsx - キャンバス用ストリークウィジェット
 *
 * 📚 このコンポーネントの役割：
 * - 連続記録（ストリーク）を炎アイコンで表示
 * - シンプルな表示専用ウィジェット
 */

import { Flame } from 'lucide-react';

function StreakWidget({ count = 0 }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      {/* 📚 炎アイコン（fill="currentColor" で塗りつぶし） */}
      <Flame size={48} className="text-orange-500" fill="currentColor" />

      {/* カウント数 */}
      <div className="text-4xl font-bold text-orange-500 mt-2">{count}</div>

      {/* ラベル */}
      <div className="text-sm text-gray-600 mt-1">ストリーク</div>
    </div>
  );
}

export default StreakWidget;
