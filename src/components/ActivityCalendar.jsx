import { useState } from 'react';

const CALENDAR_EMPTY = '#ebedf0';
const CALENDAR_LEVELS = ['#9be9a8', '#40c463', '#30a14e', '#216e39'];

export default function ActivityCalendar({ stats }) {
  // Hooks
  const [tooltip, setTooltip] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // 利用可能な年のリストを取得
  const getAvailableYears = () => {
    if (!stats || stats.length === 0) return [];
    const yearsMap = new Map();
    stats.forEach((day) => {
      const year = parseInt(day.date.substring(0, 4), 10); // YYYY-MM-DD から年を抽出
      if (!yearsMap.has(year)) {
        yearsMap.set(year, true);
      }
    });
    return Array.from(yearsMap.keys()).sort((a, b) => b - a); // 降順
  };

  const availableYears = getAvailableYears();
  const currentYear = new Date().getFullYear();
  const defaultYear =
    availableYears.length > 0 ? (availableYears.includes(currentYear) ? currentYear : availableYears[0]) : currentYear;
  const [selectedYear, setSelectedYear] = useState(defaultYear);

  // データがない場合でもカレンダーを表示（現在の年で）
  const displayYear = availableYears.length > 0 ? selectedYear : currentYear;

  // 日付をパース（YYYY-MM-DD形式と仮定、タイムゾーン対応）
  const parseDate = (dateStr) => new Date(dateStr + 'T00:00:00Z');

  // 選択された年のデータでフィルタリング
  const filteredStats =
    stats && stats.length > 0
      ? stats.filter((day) => {
          const year = parseInt(day.date.substring(0, 4), 10);
          return year === displayYear;
        })
      : [];

  // フィルタリングされた統計データをマッピング
  const statsMap = {};
  if (filteredStats && filteredStats.length > 0) {
    filteredStats.forEach((day) => {
      statsMap[day.date] = day.count;
    });
  }

  // 選択年の1月1日と12月31日を設定
  const firstDate = parseDate(`${displayYear}-01-01`);
  const lastDate = parseDate(`${displayYear}-12-31`);

  // カラースケール関数（分数に基づいて色を決定）
  const getColor = (minutes) => {
    if (minutes === 0) return CALENDAR_EMPTY;
    if (minutes < 30) return CALENDAR_LEVELS[0];
    if (minutes < 60) return CALENDAR_LEVELS[1];
    if (minutes < 120) return CALENDAR_LEVELS[2];
    return CALENDAR_LEVELS[3];
  };

  // ツールチップテキスト
  const getTooltip = (date, minutes) => {
    const dateObj = new Date(date + 'T00:00:00Z');
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
    // 月の初日（1日）がある場合、その月を優先
    for (let day of week) {
      if (day && day.date.endsWith('-01')) {
        return new Date(day.date + 'T00:00:00Z').toLocaleDateString('ja-JP', { month: 'short' });
      }
    }
    // 月の初日がない場合は、週内で最後のデータがある日の月を返す
    for (let i = week.length - 1; i >= 0; i--) {
      if (week[i]) {
        return new Date(week[i].date + 'T00:00:00Z').toLocaleDateString('ja-JP', { month: 'short' });
      }
    }
    return '';
  };

  // 週が異なる月に属しているかチェック
  const isMonthChanged = (currentWeek, previousWeek) => {
    if (!previousWeek) return true; // 最初の週
    const currentMonth = getMonthLabel(currentWeek);
    const previousMonth = getMonthLabel(previousWeek);
    return currentMonth !== previousMonth;
  };

  return (
    <div className="mt-7.5 p-3.75 bg-gray-100 rounded-lg">
      <div className="flex items-center justify-between mb-3.75">
        <h2 className="text-lg font-bold">🎯 アクティビティカレンダー（過去365日）</h2>

        {/* 年選択タブ */}
        <div className="flex gap-2">
          {availableYears.length > 0 ? (
            availableYears.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={
                  selectedYear === year
                    ? 'px-3 py-1 rounded text-sm font-medium transition-colors bg-blue-600 text-white'
                    : 'px-3 py-1 rounded text-sm font-medium transition-colors bg-white text-gray-700 hover:bg-gray-200'
                }
              >
                {year}年
              </button>
            ))
          ) : (
            <button className="px-3 py-1 rounded text-sm font-medium bg-blue-600 text-white">{currentYear}年</button>
          )}
        </div>
      </div>

      <div className="mt-3.75 relative w-full overflow-hidden flex justify-center">
        <div className="overflow-x-auto max-w-full">
          <div className="inline-flex p-2.5 origin-left sm:scale-90 md:scale-100 lg:scale-100 gap-0.5">
            {/* 曜日ラベル（縦） */}
            <div className="flex flex-col gap-0.5">
              <div className="h-4.5 flex items-center justify-center" />
              {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
                <div key={day} className="text-xs font-bold text-center w-4 h-4 flex items-center justify-center">
                  {day}
                </div>
              ))}
            </div>

            {/* カレンダーグリッド */}
            <div className="flex gap-0.5 items-start">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-0.5 items-center">
                  {/* 月ラベル */}
                  <div className="text-xs font-bold h-4.5 flex items-center justify-center w-4 text-gray-600 leading-tight mb-1">
                    {isMonthChanged(week, weeks[weekIndex - 1]) ? getMonthLabel(week) : ''}
                  </div>

                  {/* 週のセル */}
                  {week.map((day, dayIndex) => (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className={`w-4 h-4 border border-gray-300 rounded-sm transition-all relative ${
                        day ? 'cursor-pointer' : 'cursor-default'
                      }`}
                      style={{
                        backgroundColor: day ? getColor(day.minutes) : CALENDAR_EMPTY,
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
          {[CALENDAR_EMPTY, ...CALENDAR_LEVELS].map((color) => (
            <div
              key={color}
              className="w-2.5 h-2.5 border border-gray-300 rounded-sm"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <span>More</span>
      </div>

      <p className="text-xs mt-2.5 text-gray-600">
        各セルはその日の作業時間を表しています。ホバーで詳細を確認できます。
      </p>
    </div>
  );
}
