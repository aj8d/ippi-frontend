import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { TimerProvider } from './contexts/TimerContext';
import { AchievementNotificationProvider } from './providers/AchievementNotificationProvider';
import { TimerCompletionNotificationProvider } from './providers/TimerCompletionNotificationProvider';
import ProtectedRoute from './auth/ProtectedRoute';
import Login from './auth/Login';
import Register from './auth/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Search from './pages/Search';
import Feed from './pages/Feed';
import FollowList from './pages/FollowList';

function App() {
  return (
    <Router>
      <AuthProvider>
        <TimerProvider>
          <AchievementNotificationProvider>
            <TimerCompletionNotificationProvider>
              <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/search" element={<Search />} />
              <Route
                path="/feed"
                element={
                  <ProtectedRoute>
                    <Feed />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/:id/followers"
                element={
                  <ProtectedRoute>
                    <FollowList type="followers" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/:id/following"
                element={
                  <ProtectedRoute>
                    <FollowList type="following" />
                  </ProtectedRoute>
                }
              />
              <Route path="/:id" element={<Profile />} />
              <Route path="/" element={<Home />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </TimerCompletionNotificationProvider>
          </AchievementNotificationProvider>
        </TimerProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
