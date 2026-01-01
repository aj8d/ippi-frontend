/**
 * Home.jsx - ホームページ（メインキャンバス）
 *
 * 📚 このページの役割：
 * - 自由配置キャンバスを表示
 * - サイドバーからウィジェットを追加
 * - ウィジェットの位置・サイズを管理
 * - バックエンドにレイアウトを自動保存 ← 🆕
 *
 * 💡 構造：
 * - useWidgets: バックエンドと同期するカスタムフック
 * - handleAddWidget: 新しいウィジェットを追加する関数
 */

import { useState, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import FreeCanvas from '../components/FreeCanvas';
import { useWidgets } from '../hooks/useWidgets'; // 🆕 カスタムフック

function Home() {
  // 📚 サイドバーの開閉状態（localStorageから読み込む）
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // 📚 タイマーの設定（サイドバーのアコーディオンで変更）
  const [timerSettings, setTimerSettings] = useState({
    displayMode: 'countdown',
    inputMinutes: '1',
    inputSeconds: '0',
  });

  /**
   * 📚 useWidgets カスタムフック
   *
   * - widgets: バックエンドから読み込んだウィジェット配列
   * - setWidgets: 更新すると自動でバックエンドに保存
   * - loading: 読み込み中かどうか
   */
  const { widgets, setWidgets, loading } = useWidgets();

  /**
   * 📚 タイマー設定が変更された時のハンドラー
   */
  const handleTimerSettingsChange = (settings) => {
    setTimerSettings(settings);
  };

  /**
   * 📚 新しいウィジェットを追加する関数
   *
   * @param {string} type - ウィジェットの種類
   * @param {Object} defaultSize - デフォルトサイズ {width, height}
   *
   * useCallback でメモ化（毎回新しい関数を作らない）
   * これにより Sidebar の不要な再レンダリングを防ぐ
   */
  const handleAddWidget = useCallback(
    (type, defaultSize) => {
      // 📚 ウィジェットタイプごとのデフォルトデータを設定
      const getDefaultData = (widgetType) => {
        switch (widgetType) {
          case 'sticky':
            return { text: '', color: 'yellow', emoji: '' };
          case 'image':
            return { imageUrl: null, publicId: null }; // 📷 画像ウィジェット用
          default:
            return {};
        }
      };

      // 📚 スプレッド演算子で既存配列に追加
      setWidgets((prev) => {
        // 現在の最大zIndexを取得
        const maxZ = Math.max(...prev.map((w) => w.zIndex || 0), 0);

        const newWidget = {
          // 📚 Date.now() でユニークなIDを生成
          id: `widget-${Date.now()}`,
          type,
          // 📚 新しいウィジェットは画面中央付近に配置
          // ランダムなオフセットを加えて重ならないようにする
          x: 100 + Math.random() * 100,
          y: 100 + Math.random() * 100,
          width: defaultSize.width,
          height: defaultSize.height,
          // 📚 ウィジェット固有のデータ
          data: getDefaultData(type),
          // 📚 新しいウィジェットを最前面に表示
          zIndex: maxZ + 1,
        };

        return [...prev, newWidget];
      });
    },
    [setWidgets]
  );

  /**
   * 📚 ウィジェットをタイプで削除する関数
   *
   * 一意ウィジェット（タイマー、TODO、ストリーク）を
   * サイドバーから削除する時に使用
   */
  const handleRemoveWidgetByType = useCallback(
    (type) => {
      setWidgets((prev) => prev.filter((widget) => widget.type !== type));
    },
    [setWidgets]
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* サイドバー */}
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onTimerSettingsChange={handleTimerSettingsChange}
        onAddWidget={handleAddWidget}
        onRemoveWidget={handleRemoveWidgetByType} // 📚 タイプで削除する関数
        activeWidgets={widgets} // 📚 現在のウィジェット配列を渡す
      />

      {/* 📚 メインコンテンツ（キャンバス） */}
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-20'} flex-1 transition-all duration-300`}>
        {/* 🆕 ローディング中の表示 */}
        {loading ? (
          <div className="flex items-center justify-center h-screen">
            <div className="text-gray-500">読み込み中...</div>
          </div>
        ) : (
          <FreeCanvas widgets={widgets} setWidgets={setWidgets} timerSettings={timerSettings} />
        )}
      </div>
    </div>
  );
}

export default Home;
