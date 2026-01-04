/**
 * api.js - API呼び出しユーティリティ
 *
 * 📚 このファイルの役割：
 * - API呼び出しの共通処理
 * - 認証ヘッダーの自動付与
 * - エラーハンドリング
 */

import { API_BASE_URL } from '../config';

/**
 * API呼び出しのベース関数
 * @param {string} endpoint - APIエンドポイント
 * @param {Object} options - fetchオプション
 * @param {string} token - 認証トークン（オプション）
 * @returns {Promise<Response>}
 */
export async function apiRequest(endpoint, options = {}, token = null) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  return response;
}

/**
 * GETリクエスト
 * @param {string} endpoint - APIエンドポイント
 * @param {string} token - 認証トークン（オプション）
 * @returns {Promise<any>}
 */
export async function apiGet(endpoint, token = null) {
  const response = await apiRequest(endpoint, { method: 'GET' }, token);

  if (!response.ok) {
    throw new ApiError(response.status, await response.text());
  }

  return response.json();
}

/**
 * POSTリクエスト
 * @param {string} endpoint - APIエンドポイント
 * @param {Object} data - 送信データ
 * @param {string} token - 認証トークン（オプション）
 * @returns {Promise<any>}
 */
export async function apiPost(endpoint, data, token = null) {
  const response = await apiRequest(
    endpoint,
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
    token
  );

  if (!response.ok) {
    throw new ApiError(response.status, await response.text());
  }

  return response.json();
}

/**
 * PUTリクエスト
 * @param {string} endpoint - APIエンドポイント
 * @param {Object} data - 送信データ
 * @param {string} token - 認証トークン（オプション）
 * @returns {Promise<any>}
 */
export async function apiPut(endpoint, data, token = null) {
  const response = await apiRequest(
    endpoint,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    },
    token
  );

  if (!response.ok) {
    throw new ApiError(response.status, await response.text());
  }

  return response.json();
}

/**
 * DELETEリクエスト
 * @param {string} endpoint - APIエンドポイント
 * @param {string} token - 認証トークン（オプション）
 * @returns {Promise<any>}
 */
export async function apiDelete(endpoint, token = null) {
  const response = await apiRequest(endpoint, { method: 'DELETE' }, token);

  if (!response.ok) {
    throw new ApiError(response.status, await response.text());
  }

  // DELETEはレスポンスボディがない場合がある
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

/**
 * ファイルアップロード
 * @param {string} endpoint - APIエンドポイント
 * @param {FormData} formData - フォームデータ
 * @param {string} token - 認証トークン
 * @returns {Promise<any>}
 */
export async function apiUpload(endpoint, formData, token) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      // Content-Typeは設定しない（ブラウザが自動設定）
    },
    body: formData,
  });

  if (!response.ok) {
    throw new ApiError(response.status, await response.text());
  }

  return response.json();
}

/**
 * APIエラークラス
 */
export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}
