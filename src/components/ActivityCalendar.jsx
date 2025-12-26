import { useState } from 'react';

export default function ActivityCalendar({ stats }) {
  const [tooltip, setTooltip] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  if (!stats || stats.length === 0) {
    return <p>統計データがありません</p>;
  }

  // 日付をパース（YYYY-MM-DD形式と仮定）
  const parseDate = (dateStr) => new Date(dateStr + 'T00:00:00');

  // 最初と最後の日付を取得
  const firstDate = parseDate(stats[0].date);
  const lastDate = parseDate(stats[stats.length - 1].date);

  // 統計データをマップ化（日付 -> 分数）
  const statsMap = {};
  stats.forEach((day) => {
    statsMap[day.date] = day.count;
  });

  // カラースケール関数（分数に基づいて色を決定）
  const getColor = (minutes) => {
    if (minutes === 0) return '#ebedf0';
    if (minutes < 30) return '#c6e48b';
    if (minutes < 60) return '#7bc96f';
    if (minutes < 120) return '#239a3b';
    return '#196127';
  };

  // ツールチップテキスト
  const getTooltip = (date, minutes) => {
    const dateObj = new Date(date + 'T00:00:00');
    const dayName = dateObj.toLocaleDateString('ja-JP', { weekday: 'short' });
    const dateStr = dateObj.toLocaleDateString('ja-JP');
    if (minutes === 0) {
      return `${dayName} ${dateStr} - 作業時間なし`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${dayName} ${dateStr} - ${hours}時間${mins}分`;
    }
    return `${dayName} ${dateStr} - ${mins}分`;
  };

  // 日付配列を生成
  const generateCalendar = () => {
    const calendar = [];
    let currentDate = new Date(firstDate);

    while (currentDate <= lastDate) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      calendar.push({
        date: dateStr,
        minutes: statsMap[dateStr] || 0,
        dayOfWeek: currentDate.getDay(),
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return calendar;
  };

  const calendar = generateCalendar();

  // 週ごとにグループ化（横向きレイアウト用）
  const weeks = [];
  let currentWeek = new Array(7).fill(null);

  calendar.forEach((day) => {
    const dayIndex = day.dayOfWeek;
    currentWeek[dayIndex] = day;

    // 土曜日の場合は週を保存して新しい週を開始
    if (dayIndex === 6) {
      weeks.push(currentWeek);
      currentWeek = new Array(7).fill(null);
    }
  });

  // 最後の週を追加
  if (currentWeek.some((day) => day !== null)) {
    weeks.push(currentWeek);
  }

  // 月の変わり目を検出
  const getMonthLabel = (week) => {
    for (let day of week) {
      if (day) {
        return new Date(day.date + 'T00:00:00').toLocaleDateString('ja-JP', { month: 'short' });
      }
    }
    return '';
  };

  return (
    <div className="mt-7.5 p-3.75 bg-gray-100 rounded-lg">
      <h2 className="text-lg font-bold">🎯 アクティビティカレンダー（過去365日）</h2>

      <div className="mt-3.75 relative w-full overflow-hidden flex justify-center">
        <div className="overflow-x-auto max-w-full">
          <div className="inline-flex p-2.5 origin-left sm:scale-90 md:scale-100 lg:scale-100">
            {/* 曜日ラベル */}
            <div className="flex mb-1.25">
              <div className="w-5" />
              <div className="flex gap-0.5">
                {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
                  <div key={day} className="text-xs font-bold text-center w-4 h-4 flex items-center justify-center">
                    {day}
                  </div>
                ))}
              </div>
            </div>

            {/* カレンダーグリッド */}
            <div className="flex gap-0.5 items-start">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-0.5 items-center">
                  {/* 月ラベル */}
                  <div className="text-xs font-bold h-4.5 flex items-center justify-center w-4 text-gray-600 leading-tight">
                    {weekIndex % 4 === 0 ? getMonthLabel(week) : ''}
                  </div>

                  {/* 週のセル */}
                  {week.map((day, dayIndex) => (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className={`w-4 h-4 border border-gray-300 rounded-sm transition-all relative ${
                        day ? 'cursor-pointer' : 'cursor-default'
                      }`}
                      style={{
                        backgroundColor: day ? getColor(day.minutes) : '#f0f0f0',
                      }}
                      onMouseEnter={(e) => {
                        if (day) {
                          e.target.style.boxShadow = '0 0 4px rgba(0,0,0,0.3)';
                          e.target.style.transform = 'scale(1.1)';
                          const rect = e.target.getBoundingClientRect();
                          setTooltip(getTooltip(day.date, day.minutes));
                          setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 5 });
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (day) {
                          e.target.style.boxShadow = 'none';
                          e.target.style.transform = 'scale(1)';
                          setTooltip(null);
                        }
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* カスタムツールチップ（上に表示） */}
      {tooltip && (
        <div
          className="fixed bg-gray-800 text-white px-2.5 py-1.5 rounded text-xs font-medium whitespace-nowrap pointer-events-none z-50 shadow-md"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          {tooltip}
          <div
            className="absolute w-0 h-0 border-l-2 border-r-2 border-t-2 border-l-transparent border-r-transparent border-t-gray-800"
            style={{
              bottom: '-4px',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          />
        </div>
      )}

      {/* カラー凡例 */}
      <div className="mt-3.75 flex items-center gap-2.5 text-xs">
        <span>Less</span>
        <div className="flex gap-0.5">
          <div className="w-2.5 h-2.5 bg-gray-200 border border-gray-300 rounded-sm" />
          <div className="w-2.5 h-2.5 bg-green-300 border border-gray-300 rounded-sm" />
          <div className="w-2.5 h-2.5 bg-green-500 border border-gray-300 rounded-sm" />
          <div className="w-2.5 h-2.5 bg-green-700 border border-gray-300 rounded-sm" />
          <div className="w-2.5 h-2.5 bg-green-900 border border-gray-300 rounded-sm" />
        </div>
        <span>More</span>
      </div>

      <p className="text-xs mt-2.5 text-gray-600">
        各セルはその日の作業時間を表しています。ホバーで詳細を確認できます。
      </p>
    </div>
  );
}
