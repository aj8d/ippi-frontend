import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
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
          <button onClick={handleLogout}>ログアウト</button>
          <button onClick={() => navigate('/')}>ホームへ戻る</button>
        </div>
      ) : (
        <p>ユーザー情報を読み込み中...</p>
      )}
    </div>
  );
}
