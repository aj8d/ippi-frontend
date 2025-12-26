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
  const [uploading, setUploading] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(user?.profileImageUrl || null);
  const [uploadError, setUploadError] = useState(null);
  const [userName, setUserName] = useState(user?.name || '');
  const [userDescription, setUserDescription] = useState(user?.description || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  const fetchLatestProfile = async () => {
    if (!token) return;
    try {
      const response = await fetch('http://localhost:8080/api/auth/profile', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfileImageUrl(data.profileImageUrl);
        setUserName(data.name);
        setUserDescription(data.description || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('http://localhost:8080/api/auth/update-profile', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userName,
          description: userDescription,
        }),
      });

      if (response.ok) {
        setIsEditing(false);
        await fetchLatestProfile();
      } else {
        const errorText = await response.text();
        console.error('Update error:', errorText);
        alert('プロフィール更新に失敗しました');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('プロフィール更新中にエラーが発生しました');
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8080/api/auth/upload-profile-image', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setProfileImageUrl(data.profileImageUrl);
        await fetchLatestProfile();
      } else {
        const errorText = await response.text();
        console.error('Upload error response:', errorText);
        setUploadError(`アップロード失敗: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError(`エラー: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  // 過去7日間の統計を表示
  const recentStats = stats ? stats.slice(-7).reverse() : [];
  const totalMinutes = stats ? stats.reduce((sum, day) => sum + day.count, 0) : 0;
  const totalHours = (totalMinutes / 60).toFixed(1);

  // バグ調査：データをコンソール出力
  console.log('Stats data:', stats);
  console.log('Recent stats:', recentStats);
  console.log('Total minutes:', totalMinutes);
  console.log('Total hours:', totalHours);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} onTimerSettingsChange={() => {}} />

      {/* メインコンテンツ */}
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-20'} flex-1 transition-all duration-300`}>
        <div style={{ padding: '20px' }}>
          {user ? (
            <div>
              {/* プロフィール画像セクション */}
              <div style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    backgroundColor: '#e0e0e0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    border: '3px solid #4CAF50',
                  }}
                >
                  {profileImageUrl ? (
                    <img
                      src={profileImageUrl}
                      alt="プロフィール"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ fontSize: '48px' }}>👤</div>
                  )}
                </div>

                <div>
                  <p style={{ fontSize: '18px', marginBottom: '10px' }}>
                    <strong>{userName || '名前なし'}</strong>
                  </p>
                  <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px', whiteSpace: 'pre-wrap' }}>
                    {userDescription || '説明文はまだ設定されていません'}
                  </p>
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginBottom: '10px',
                    }}
                  >
                    編集
                  </button>

                  {/* 画像アップロード */}
                  <div style={{ marginTop: '10px' }}>
                    <label
                      style={{
                        display: 'inline-block',
                        padding: '8px 16px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        borderRadius: '4px',
                        cursor: uploading ? 'not-allowed' : 'pointer',
                        opacity: uploading ? 0.6 : 1,
                      }}
                    >
                      {uploading ? '保存中...' : '画像をアップロード'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImageUpload}
                        disabled={uploading}
                        style={{ display: 'none' }}
                      />
                    </label>
                    {uploadError && <p style={{ color: 'red', marginTop: '8px', fontSize: '12px' }}>{uploadError}</p>}
                  </div>
                </div>
              </div>

              {/* ユーザー情報 */}
              <hr style={{ margin: '20px 0' }} />

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
                    <div
                      style={{
                        display: 'flex',
                        gap: '5px',
                        alignItems: 'flex-end',
                        height: '150px',
                        justifyContent: 'center',
                        borderBottom: '1px solid #ddd',
                        paddingBottom: '10px',
                      }}
                    >
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
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => (e.target.style.opacity = '0.8')}
                          onMouseLeave={(e) => (e.target.style.opacity = '1')}
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

      {/* モーダル */}
      {isEditing && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => {
            setIsEditing(false);
            setUserName(user?.name || '');
            setUserDescription(user?.description || '');
          }}
        >
          {/* モーダル内容 */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '30px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: '20px', marginTop: 0 }}>プロフィールを編集</h2>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>名前</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>説明文</label>
              <textarea
                value={userDescription}
                onChange={(e) => setUserDescription(e.target.value)}
                placeholder="自己紹介を入力してください..."
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  minHeight: '100px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setUserName(user?.name || '');
                  setUserDescription(user?.description || '');
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#999',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                キャンセル
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  opacity: isSaving ? 0.6 : 1,
                }}
              >
                {isSaving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
