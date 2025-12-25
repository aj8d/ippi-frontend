import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ActivityCalendar from '../components/ActivityCalendar';
import Sidebar from '../components/Sidebar';

export default function Profile() {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/auth/stats', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
        } else {
          console.error('Failed to fetch stats');
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 過去7日間の統計を表示
  const recentStats = stats ? stats.slice(-7).reverse() : [];
  const totalMinutes = stats ? stats.reduce((sum, day) => sum + day.count, 0) : 0;
  const totalHours = (totalMinutes / 60).toFixed(1);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} onTimerSettingsChange={() => {}} />

      {/* メインコンテンツ */}
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-20'} flex-1 transition-all duration-300`}>
        <div style={{ padding: '20px' }}>
          <h1>プロフィール</h1>
          {user ? (
            <div>
              <p>
                <strong>ID:</strong> {user.userId}
              </p>
              <p>
                <strong>名前:</strong> {user.name}
              </p>
              <p>
                <strong>メール:</strong> {user.email}
              </p>

              {/* 統計情報を表示 */}
              <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                <h2>📊 統計情報</h2>
                {loading ? (
                  <p>統計データを読み込み中...</p>
                ) : stats && stats.length > 0 ? (
                  <div>
                    <p>
                      <strong>合計作業時間（過去365日）:</strong> {totalHours}時間 ({totalMinutes}分)
                    </p>
                    <h3>過去7日間の作業時間:</h3>
                    <div style={{ display: 'flex', gap: '5px', alignItems: 'flex-end', height: '100px' }}>
                      {recentStats.map((day, index) => (
                        <div
                          key={index}
                          title={`${day.date}: ${day.count}分`}
                          style={{
                            width: '30px',
                            height: `${Math.max(day.count * 2, 20)}px`,
                            backgroundColor: day.count > 0 ? '#4CAF50' : '#ddd',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        />
                      ))}
                    </div>
                    <p style={{ fontSize: '12px', marginTop: '10px' }}>🟩 = 作業時間あり | ⬜ = 作業時間なし</p>
                  </div>
                ) : (
                  <p>統計データがまだありません</p>
                )}
              </div>

              {/* GitHub-style アクティビティカレンダーを追加 */}
              {stats && stats.length > 0 && <ActivityCalendar stats={stats} />}

              <div style={{ marginTop: '20px' }}>
                <button onClick={handleLogout} style={{ marginRight: '10px' }}>
                  ログアウト
                </button>
                <button onClick={() => navigate('/')}>ホームへ戻る</button>
              </div>
            </div>
          ) : (
            <p>ユーザー情報を読み込み中...</p>
          )}
        </div>
      </div>
    </div>
  );
}
