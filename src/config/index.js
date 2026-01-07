/**
 * config.js - アプリケーション設定
 *
 * 📚 このファイルの役割：
 * - API URLなどの環境依存の設定を一元管理
 * - 環境変数から値を取得、デフォルト値を提供
 */

// API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// APIエンドポイント
export const API_ENDPOINTS = {
  // ベースURL（画像URLの構築用）
  BASE: 'http://localhost:8080',

  // 認証
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    PROFILE: `${API_BASE_URL}/auth/profile`,
    PROFILE_BY_ID: (id) => `${API_BASE_URL}/auth/${id}`,
    UPDATE_PROFILE: `${API_BASE_URL}/auth/update-profile`,
    UPLOAD_IMAGE: `${API_BASE_URL}/auth/upload-profile-image`,
    STATS: `${API_BASE_URL}/auth/stats`,
    GOOGLE: `${API_BASE_URL}/auth/google`,
    GOOGLE_LOGIN: `${API_BASE_URL}/auth/google-login`,
  },

  // ユーザー
  USERS: {
    SEARCH: `${API_BASE_URL}/users/search`,
  },

  // フォロー
  FOLLOW: {
    BASE: (userId) => `${API_BASE_URL}/follow/${userId}`,
    STATS: (userId) => `${API_BASE_URL}/follow/stats/${userId}`,
    FOLLOWERS: (userId) => `${API_BASE_URL}/follow/followers/${userId}`,
    FOLLOWING: (userId) => `${API_BASE_URL}/follow/following/${userId}`,
    CHECK: (userId) => `${API_BASE_URL}/follow/check/${userId}`,
  },

  // ショートカット関数
  follow: (userId) => `${API_BASE_URL}/follow/${userId}`,

  // フィード
  FEED: {
    LIST: `${API_BASE_URL}/feed`,
    USER: (userId) => `${API_BASE_URL}/feed/user/${userId}`,
    // いいね
    LIKE: (feedId) => `${API_BASE_URL}/feed/${feedId}/like`,
    UNLIKE: (feedId) => `${API_BASE_URL}/feed/${feedId}/unlike`,
    // コメント
    COMMENTS: (feedId) => `${API_BASE_URL}/feed/${feedId}/comments`,
    COMMENT_DELETE: (feedId, commentId) => `${API_BASE_URL}/feed/${feedId}/comments/${commentId}`,
  },

  // テキストデータ
  TEXT_DATA: {
    BASE: `${API_BASE_URL}/text-data`,
    BY_ID: (id) => `${API_BASE_URL}/text-data/${id}`,
    WORK_SESSION: `${API_BASE_URL}/text-data/work-session`,
    START_TIMER: (id) => `${API_BASE_URL}/text-data/${id}/start-timer`,
    STOP_TIMER: (id) => `${API_BASE_URL}/text-data/${id}/stop-timer`,
    TIMER_STATUS: (id) => `${API_BASE_URL}/text-data/${id}/timer-status`,
  },

  // ウィジェット
  WIDGETS: {
    BASE: `${API_BASE_URL}/widgets`,
    BY_ID: (id) => `${API_BASE_URL}/widgets/${id}`,
  },

  // 画像
  IMAGES: {
    UPLOAD: `${API_BASE_URL}/images/upload`,
    DELETE: (publicId) => `${API_BASE_URL}/images/delete?publicId=${encodeURIComponent(publicId)}`,
  },

  // ユーザー統計
  USER_STATS: {
    ME: `${API_BASE_URL}/user-stats/me`,
    BY_ID: (userId) => `${API_BASE_URL}/user-stats/${userId}`,
    BY_CUSTOM_ID: (customId) => `${API_BASE_URL}/user-stats/user/${customId}`,
  },

  // アチーブメント
  ACHIEVEMENTS: {
    USER: `${API_BASE_URL}/achievements/user`,
    ALL: `${API_BASE_URL}/achievements/all`,
  },
};

// ページネーション設定
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
};

// ローカルストレージキー
export const STORAGE_KEYS = {
  TOKEN: 'token',
  WIDGETS: 'widgets',
  TIMER_SETTINGS: 'timerSettings',
};
