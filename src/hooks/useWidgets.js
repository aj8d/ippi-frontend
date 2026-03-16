import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../auth/AuthContext';
import { API_ENDPOINTS } from '../config';

let saveTimeoutId = null;

const LOCAL_STORAGE_KEY = 'guestWidgets';

export function useWidgets() {
  const { token } = useAuth();

  // 状態管理
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 初回読み込みが完了したかどうか
  const initialLoadDone = useRef(false);

  const loadFromLocalStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsedWidgets = JSON.parse(saved);
        setWidgets(parsedWidgets);
      } else {
        setWidgets([]);
      }
      initialLoadDone.current = true;
      setLoading(false);
    } catch (err) {
      console.error('ローカルストレージの読み込みエラー:', err);
      setWidgets([]);
      setLoading(false);
    }
  }, []);

  const loadWidgets = useCallback(async () => {
    if (!token) {
      // 非ログイン時はローカルストレージから読み込む
      loadFromLocalStorage();
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.WIDGETS.BASE, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('ウィジェットの読み込みに失敗しました');
      }

      const data = await response.json();
      setWidgets(data);
      setError(null);
      initialLoadDone.current = true;
    } catch {
      console.error('Load widgets error');
      setError('ウィジェットの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, [token, loadFromLocalStorage]);

  const saveWidgets = useCallback(
    async (widgetsToSave) => {
      if (!initialLoadDone.current) return;

      // 既存のタイマーをクリア
      if (saveTimeoutId) {
        clearTimeout(saveTimeoutId);
      }

      // 1秒後に保存（デバウンス）
      saveTimeoutId = setTimeout(async () => {
        if (!token) {
          // 非ログイン時: ローカルストレージに保存
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(widgetsToSave));
            console.log('✅ ローカルストレージに保存完了');
          } catch (err) {
            console.error('ローカルストレージ保存エラー:', err);
          }
        } else {
          // ログイン時: バックエンドに保存
          try {
            const response = await fetch(API_ENDPOINTS.WIDGETS.BASE, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(widgetsToSave),
            });

            if (!response.ok) {
              throw new Error('保存に失敗しました');
            }

            console.log('✅ ウィジェット保存完了');
          } catch (err) {
            console.error('Save widgets error:', err);
          }
        }
      }, 1000);
    },
    [token],
  );

  const updateWidgets = useCallback(
    (updater) => {
      setWidgets((prev) => {
        const newWidgets = typeof updater === 'function' ? updater(prev) : updater;

        // 自動保存
        saveWidgets(newWidgets);

        return newWidgets;
      });
    },
    [saveWidgets],
  );

  useEffect(() => {
    loadWidgets();
  }, [loadWidgets]);

  return {
    widgets,
    setWidgets: updateWidgets, // 自動保存付きの更新関数
    loading,
    error,
    reload: loadWidgets, // 手動リロード用
  };
}
