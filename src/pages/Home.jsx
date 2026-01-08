/**
 * ホームページ（メインキャンバス）
 *
 * - 自由配置キャンバスを表示
 * - サイドバーからウィジェットを追加
 * - ウィジェットの位置・サイズを管理
 * - バックエンドにレイアウトを自動保存 ← 🆕
 * - モバイル対応：縦並びリスト表示
 *
 * 構造：
 * - useWidgets: バックエンドと同期するカスタムフック
 * - handleAddWidget: 新しいウィジェットを追加する関数
 */

import { useState, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import FreeCanvas from '../components/FreeCanvas';
import MobileBottomNav from '../components/mobile/MobileBottomNav';
import MobileListCanvas from '../components/mobile/MobileListCanvas';
import FloatingAddButton from '../components/mobile/FloatingAddButton';
import { useWidgets } from '../hooks/useWidgets'; // カスタムフック
import { useAchievementChecker } from '../hooks/useAchievementChecker';
import { useAuth } from '../auth/AuthContext';

function Home() {
  const { token } = useAuth();

  // アチーブメント通知チェック
  useAchievementChecker(token);

  // サイドバーの開閉状態（localStorageから読み込む）
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // タイマーの設定（サイドバーのアコーディオンで変更）
  const [timerSettings, setTimerSettings] = useState({
    displayMode: 'countdown',
    inputMinutes: '1',
    inputSeconds: '0',
  });

  /**
   * useWidgets カスタムフック
   *
   * - widgets: バックエンドから読み込んだウィジェット配列
   * - setWidgets: 更新すると自動でバックエンドに保存
   * - loading: 読み込み中かどうか
   */
  const { widgets, setWidgets, loading } = useWidgets();

  /**
   * タイマー設定が変更された時のハンドラー
   */
  const handleTimerSettingsChange = (settings) => {
    setTimerSettings(settings);
  };

  /**
   * 新しいウィジェットを追加する関数
   *
   * @param {string} type - ウィジェットの種類
   * @param {Object} defaultSize - デフォルトサイズ {width, height}
   *
   * useCallback でメモ化（毎回新しい関数を作らない）
   * これにより Sidebar の不要な再レンダリングを防ぐ
   */
  const handleAddWidget = useCallback(
    (type, defaultSize) => {
      // ウィジェットタイプごとのデフォルトデータを設定
      const getDefaultData = (widgetType) => {
        switch (widgetType) {
          case 'sticky':
            return { text: '', color: 'yellow', emoji: '' };
          case 'image':
            return { imageUrl: null, publicId: null }; // 画像ウィジェット用
          default:
            return {};
        }
      };

      // スプレッド演算子で既存配列に追加
      setWidgets((prev) => {
        // 現在の最大zIndexを取得
        const maxZ = Math.max(...prev.map((w) => w.zIndex || 0), 0);

        const newWidget = {
          // Date.now() でユニークなIDを生成
          id: `widget-${Date.now()}`,
          type,
          // 新しいウィジェットは画面中央付近に配置
          // ランダムなオフセットを加えて重ならないようにする
          x: 100 + Math.random() * 100,
          y: 100 + Math.random() * 100,
          width: defaultSize.width,
          height: defaultSize.height,
          // ウィジェット固有のデータ
          data: getDefaultData(type),
          // 新しいウィジェットを最前面に表示
          zIndex: maxZ + 1,
        };

        return [...prev, newWidget];
      });
    },
    [setWidgets]
  );

  /**
   * ウィジェットをタイプまたはIDで削除する関数
   *
   * 一意ウィジェット（タイマー、TODO、ストリーク）を
   * サイドバーから削除する時に使用
   * 複数ウィジェット（付箋、画像）を個別に削除する時にも使用
   */
  const handleRemoveWidget = useCallback(
    (typeOrId) => {
      setWidgets((prev) => {
        // まずIDでマッチするか確認
        const hasMatchingId = prev.some((widget) => widget.id === typeOrId);

        if (hasMatchingId) {
          // IDでマッチした場合はIDで削除
          return prev.filter((widget) => widget.id !== typeOrId);
        } else {
          // IDでマッチしない場合はtypeで削除（一意ウィジェット用）
          return prev.filter((widget) => widget.type !== typeOrId);
        }
      });
    },
    [setWidgets]
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* デスクトップ用サイドバー */}
      <div className="hidden md:block">
        <Sidebar
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          onTimerSettingsChange={handleTimerSettingsChange}
          onAddWidget={handleAddWidget}
          onRemoveWidget={handleRemoveWidget}
          activeWidgets={widgets}
        />
      </div>

      {/* メインコンテンツ */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
        {/* ローディング中の表示 */}
        {loading ? (
          <div className="flex items-center justify-center h-screen">
            <div className="text-gray-500">読み込み中...</div>
          </div>
        ) : (
          <>
            {/* デスクトップ：自由配置キャンバス */}
            <div className="hidden md:block h-screen">
              <FreeCanvas widgets={widgets} setWidgets={setWidgets} timerSettings={timerSettings} />
            </div>

            {/* モバイル：リストキャンバス */}
            <div className="md:hidden">
              <MobileListCanvas widgets={widgets} setWidgets={setWidgets} timerSettings={timerSettings} />
            </div>
          </>
        )}
      </div>

      {/* モバイル用フローティング追加ボタン */}
      <FloatingAddButton activeWidgets={widgets} onAddWidget={handleAddWidget} onRemoveWidget={handleRemoveWidget} />

      {/* モバイル用ボトムナビゲーション */}
      <MobileBottomNav />
    </div>
  );
}

export default Home;
