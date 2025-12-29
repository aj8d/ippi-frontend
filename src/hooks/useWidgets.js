/**
 * useWidgets.js - ウィジェット管理カスタムフック
 *
 * 📚 このフックの役割：
 * - バックエンドからウィジェットを読み込む
 * - ウィジェットの変更を自動保存する（デバウンス付き）
 * - ウィジェットの追加・削除・更新を管理
 *
 * 💡 カスタムフックとは：
 * - React の機能（useState, useEffect など）を再利用可能な形にまとめたもの
 * - "use" で始まる関数名で、フック内で他のフックを使える
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../auth/AuthContext';

// 📚 サーバーのコンテキストパスが /api なので、/widgets だけでOK
const API_URL = 'http://localhost:8080/api/widgets';

/**
 * 📚 デバウンス用タイマーID
 *
 * デバウンスとは：
 * 連続した操作を一定時間待ってから1回だけ実行する
 * 例: ウィジェットをドラッグ中に何度も保存しないように
 */
let saveTimeoutId = null;

export function useWidgets() {
  const { token } = useAuth();

  // 📚 状態管理
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 📚 初回読み込みが完了したかどうか
  const initialLoadDone = useRef(false);

  /**
   * 📚 バックエンドからウィジェットを読み込む
   */
  const loadWidgets = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(API_URL, {
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
    } catch (err) {
      console.error('Load widgets error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  /**
   * 📚 バックエンドにウィジェットを保存
   *
   * デバウンス付き: 1秒間変更がなければ保存
   */
  const saveWidgets = useCallback(
    async (widgetsToSave) => {
      if (!token || !initialLoadDone.current) return;

      // 既存のタイマーをクリア
      if (saveTimeoutId) {
        clearTimeout(saveTimeoutId);
      }

      // 📚 1秒後に保存（デバウンス）
      saveTimeoutId = setTimeout(async () => {
        try {
          const response = await fetch(API_URL, {
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
      }, 1000);
    },
    [token]
  );

  /**
   * 📚 ウィジェットを更新して自動保存
   *
   * この関数を setWidgets の代わりに使う
   */
  const updateWidgets = useCallback(
    (updater) => {
      setWidgets((prev) => {
        // updater が関数なら実行、そうでなければそのまま使う
        const newWidgets = typeof updater === 'function' ? updater(prev) : updater;

        // 自動保存
        saveWidgets(newWidgets);

        return newWidgets;
      });
    },
    [saveWidgets]
  );

  /**
   * 📚 初回マウント時にウィジェットを読み込む
   */
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
