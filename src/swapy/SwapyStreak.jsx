import React from 'react';
import { Flame } from 'lucide-react';

function SwapyStreak({ count }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <Flame size={48} className="text-orange-500" fill="currentColor" />
      <div className="text-4xl font-bold text-orange-500">{count}</div>
      <div className="text-sm text-gray-600">ストリーク</div>
    </div>
  );
}

export default SwapyStreak;
