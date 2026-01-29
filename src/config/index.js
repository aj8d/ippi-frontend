export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const BASE_SERVER_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:8080';

export const API_ENDPOINTS = {
  BASE: BASE_SERVER_URL,

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

  USERS: {
    SEARCH: `${API_BASE_URL}/users/search`,
  },

  FOLLOW: {
    BASE: (userId) => `${API_BASE_URL}/follow/${userId}`,
    STATS: (userId) => `${API_BASE_URL}/follow/stats/${userId}`,
    FOLLOWERS: (userId) => `${API_BASE_URL}/follow/followers/${userId}`,
    FOLLOWING: (userId) => `${API_BASE_URL}/follow/following/${userId}`,
    CHECK: (userId) => `${API_BASE_URL}/follow/check/${userId}`,
  },

  follow: (userId) => `${API_BASE_URL}/follow/${userId}`,

  FEED: {
    LIST: `${API_BASE_URL}/feed`,
    USER: (userId) => `${API_BASE_URL}/feed/user/${userId}`,
    LIKE: (feedId) => `${API_BASE_URL}/feed/${feedId}/like`,
    UNLIKE: (feedId) => `${API_BASE_URL}/feed/${feedId}/unlike`,
    COMMENTS: (feedId) => `${API_BASE_URL}/feed/${feedId}/comments`,
    COMMENT_DELETE: (feedId, commentId) => `${API_BASE_URL}/feed/${feedId}/comments/${commentId}`,
  },

  TEXT_DATA: {
    BASE: `${API_BASE_URL}/text-data`,
    BY_ID: (id) => `${API_BASE_URL}/text-data/${id}`,
    WORK_SESSION: `${API_BASE_URL}/text-data/work-session`,
    START_TIMER: (id) => `${API_BASE_URL}/text-data/${id}/start-timer`,
    STOP_TIMER: (id) => `${API_BASE_URL}/text-data/${id}/stop-timer`,
    TIMER_STATUS: (id) => `${API_BASE_URL}/text-data/${id}/timer-status`,
    TIMER_COMPLETION: `${API_BASE_URL}/text-data/timer-completion`,
  },

  WIDGETS: {
    BASE: `${API_BASE_URL}/widgets`,
    BY_ID: (id) => `${API_BASE_URL}/widgets/${id}`,
  },

  IMAGES: {
    UPLOAD: `${API_BASE_URL}/images/upload`,
    DELETE: (publicId) => `${API_BASE_URL}/images/delete?publicId=${encodeURIComponent(publicId)}`,
  },

  USER_STATS: {
    BASE: `${API_BASE_URL}/user-stats`,
    ME: `${API_BASE_URL}/user-stats/me`,
    BY_ID: (userId) => `${API_BASE_URL}/user-stats/${userId}`,
    BY_CUSTOM_ID: (customId) => `${API_BASE_URL}/user-stats/user/${customId}`,
    DAILY_ACTIVITY: (customId) => `${API_BASE_URL}/user-stats/user/${customId}/daily-activity`,
  },
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
};

export const STORAGE_KEYS = {
  TOKEN: 'token',
  WIDGETS: 'widgets',
  TIMER_SETTINGS: 'timerSettings',
};
