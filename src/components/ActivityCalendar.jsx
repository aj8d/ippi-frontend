export default function ActivityCalendar({ stats }) {
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
    <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
      <h2>🎯 アクティビティカレンダー（過去365日）</h2>

      <div style={{ overflowX: 'auto', marginTop: '15px' }}>
        <div style={{ display: 'inline-block', padding: '10px' }}>
          {/* 曜日ラベル */}
          <div style={{ display: 'flex', marginBottom: '5px' }}>
            <div style={{ width: '30px' }} />
            <div style={{ display: 'flex', gap: '4px' }}>
              {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
                <div
                  key={day}
                  style={{
                    fontSize: '11px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>

          {/* カレンダーグリッド */}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {weeks.map((week, weekIndex) => (
              <div
                key={weekIndex}
                style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}
              >
                {/* 月ラベル */}
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 'bold',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'flex-end',
                    minWidth: '24px',
                    textAlign: 'center',
                    color: '#666',
                  }}
                >
                  {weekIndex % 4 === 0 ? getMonthLabel(week) : ''}
                </div>

                {/* 週のセル */}
                {week.map((day, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    title={day ? getTooltip(day.date, day.minutes) : ''}
                    style={{
                      width: '24px',
                      height: '24px',
                      backgroundColor: day ? getColor(day.minutes) : '#f0f0f0',
                      border: '1px solid #ddd',
                      borderRadius: '3px',
                      cursor: day ? 'pointer' : 'default',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (day) {
                        e.target.style.boxShadow = '0 0 4px rgba(0,0,0,0.3)';
                        e.target.style.transform = 'scale(1.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (day) {
                        e.target.style.boxShadow = 'none';
                        e.target.style.transform = 'scale(1)';
                      }
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* カラー凡例 */}
      <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
        <span>Less</span>
        <div style={{ display: 'flex', gap: '2px' }}>
          <div
            style={{
              width: '14px',
              height: '14px',
              backgroundColor: '#ebedf0',
              border: '1px solid #ddd',
              borderRadius: '2px',
            }}
          />
          <div
            style={{
              width: '14px',
              height: '14px',
              backgroundColor: '#c6e48b',
              border: '1px solid #ddd',
              borderRadius: '2px',
            }}
          />
          <div
            style={{
              width: '14px',
              height: '14px',
              backgroundColor: '#7bc96f',
              border: '1px solid #ddd',
              borderRadius: '2px',
            }}
          />
          <div
            style={{
              width: '14px',
              height: '14px',
              backgroundColor: '#239a3b',
              border: '1px solid #ddd',
              borderRadius: '2px',
            }}
          />
          <div
            style={{
              width: '14px',
              height: '14px',
              backgroundColor: '#196127',
              border: '1px solid #ddd',
              borderRadius: '2px',
            }}
          />
        </div>
        <span>More</span>
      </div>

      <p style={{ fontSize: '12px', marginTop: '10px', color: '#666' }}>
        各セルはその日の作業時間を表しています。ホバーで詳細を確認できます。
      </p>
    </div>
  );
}
