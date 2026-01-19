/**
 * プロフィールウィジェット管理コンポーネント
 *
 * - Swapyを使った動的ウィジェットグリッドの管理
 * - ウィジェットの追加・削除・並び替え
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { createSwapy } from "swapy";
import { Plus } from "lucide-react";
import { API_ENDPOINTS } from "../config";
import { WIDGET_TYPES } from "./profile/widgetUtils";
import { WIDGET_INFO } from "./profile/widgetConfig";
import Widget from "./profile/Widget";

/**
 * ウィジェット追加ボタン（サイドバー用）
 */
export function WidgetAddButton({ onAddRow }) {
  const [showAddMenu, setShowAddMenu] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowAddMenu(!showAddMenu)}
        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
      >
        <Plus className="w-5 h-5" />
        カスタム要素を追加
      </button>

      {showAddMenu && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setShowAddMenu(false)} />
          <div className="absolute left-0 mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 z-[101]">
            <button
              onClick={() => {
                onAddRow(1);
                setShowAddMenu(false);
              }}
              className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-900 dark:text-white"
            >
              1列（1要素）
            </button>
            <button
              onClick={() => {
                onAddRow("2-1");
                setShowAddMenu(false);
              }}
              className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-900 dark:text-white"
            >
              2列（2/3 + 1/3）
            </button>
            <button
              onClick={() => {
                onAddRow("1-2");
                setShowAddMenu(false);
              }}
              className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-900 dark:text-white"
            >
              2列（1/3 + 2/3）
            </button>
            <button
              onClick={() => {
                onAddRow(3);
                setShowAddMenu(false);
              }}
              className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-900 dark:text-white"
            >
              3列（3要素）
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * プロフィールウィジェットマネージャー
 */
export default function ProfileWidgetManager({ customId, token, isOwnProfile, onAddRowCallback }) {
  // ローカルストレージキー（データ構造変更のため v2 に更新）
  const STORAGE_KEY = `profile_widgets_v2_${customId}`;

  // ローカルストレージから初期データを読み込み
  const [rows, setRows] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];

      const data = JSON.parse(saved);

      // データがフラット配列かチェック
      if (Array.isArray(data)) {
        // 各アイテムがwidgetプロパティを持つ（フラット構造）かチェック
        const isFlat = data.every((item) => item && typeof item === "object" && "id" in item && "type" in item);

        if (isFlat) {
          return data;
        }
      }

      // 古いデータ構造の場合は空配列を返す
      console.warn("古いデータ構造を検出しました。新しい構造に移行してください。");
      return [];
    } catch (e) {
      console.error("ウィジェット読み込みエラー:", e);
      return [];
    }
  });

  const [stats, setStats] = useState(null);
  const swapyRef = useRef(null);
  const containerRef = useRef(null);

  // 統計データを取得
  useEffect(() => {
    if (!customId) return;

    const fetchStats = async () => {
      try {
        const headers = token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };

        const response = await fetch(API_ENDPOINTS.USER_STATS.BY_CUSTOM_ID(customId), { headers });

        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (err) {
        console.error("統計取得エラー:", err);
      }
    };

    fetchStats();
  }, [customId, token]);

  // ウィジェットをローカルストレージに保存
  useEffect(() => {
    if (rows.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
    }
  }, [rows, STORAGE_KEY]);

  // Swapyのonswapイベントハンドラ
  const handleSwap = useCallback((event) => {
    const { data } = event;
    if (!data) return;

    // data.arrayは新しい順序を表す配列 [{slotId, itemId}, ...]
    const newOrder = data.array.map((slot) => slot.itemId);

    setRows((prevRows) => {
      const reordered = newOrder.map((itemId) => prevRows.find((widget) => widget.id === itemId)).filter(Boolean);
      return reordered;
    });
  }, []);

  // Swapyの初期化
  useEffect(() => {
    if (!isOwnProfile || !containerRef.current) return;

    // 既存のSwapyインスタンスを破棄
    if (swapyRef.current) {
      swapyRef.current.destroy();
    }

    // 新しいSwapyインスタンスを作成
    const swapy = createSwapy(containerRef.current, {
      animation: "dynamic",
    });

    // Swapイベントを監視
    swapy.onSwap(handleSwap);

    swapyRef.current = swapy;

    return () => {
      if (swapyRef.current) {
        swapyRef.current.destroy();
      }
    };
  }, [isOwnProfile, rows, handleSwap]);

  // ウィジェットを追加（列数分または特定パターン）
  const addRow = useCallback((pattern) => {
    let newWidgets;

    if (pattern === 1) {
      // 1列（全幅）
      newWidgets = [
        {
          id: `widget-${Date.now()}-0`,
          type: WIDGET_TYPES.EMPTY,
          customText: "",
          width: "full",
        },
      ];
    } else if (pattern === "2-1") {
      // 2/3 + 1/3
      newWidgets = [
        {
          id: `widget-${Date.now()}-0`,
          type: WIDGET_TYPES.EMPTY,
          customText: "",
          width: "two-thirds",
        },
        {
          id: `widget-${Date.now()}-1`,
          type: WIDGET_TYPES.EMPTY,
          customText: "",
          width: "one-third",
        },
      ];
    } else if (pattern === "1-2") {
      // 1/3 + 2/3
      newWidgets = [
        {
          id: `widget-${Date.now()}-0`,
          type: WIDGET_TYPES.EMPTY,
          customText: "",
          width: "one-third",
        },
        {
          id: `widget-${Date.now()}-1`,
          type: WIDGET_TYPES.EMPTY,
          customText: "",
          width: "two-thirds",
        },
      ];
    } else if (pattern === 3) {
      // 3列（各1/3）
      newWidgets = Array.from({ length: 3 }, (_, i) => ({
        id: `widget-${Date.now()}-${i}`,
        type: WIDGET_TYPES.EMPTY,
        customText: "",
        width: "third",
      }));
    } else {
      // デフォルト
      newWidgets = [];
    }

    setRows((prevRows) => [...prevRows, ...newWidgets]);
  }, []);

  // 外部からのコールバック登録
  useEffect(() => {
    if (onAddRowCallback) {
      onAddRowCallback(addRow);
    }
  }, [addRow, onAddRowCallback]);

  // ウィジェットタイプを変更
  const handleTypeChange = (widgetId, newType) => {
    setRows(rows.map((widget) => (widget.id === widgetId ? { ...widget, type: newType } : widget)));
  };

  // カスタムテキストを変更
  const handleTextChange = (widgetId, text) => {
    setRows(rows.map((widget) => (widget.id === widgetId ? { ...widget, customText: text } : widget)));
  };

  // 画像URLを変更
  const handleImageChange = (widgetId, imageUrl) => {
    setRows(rows.map((widget) => (widget.id === widgetId ? { ...widget, imageUrl } : widget)));
  };

  // 画像のリンクURLを変更
  const handleLinkChange = (widgetId, linkUrl) => {
    setRows(rows.map((widget) => (widget.id === widgetId ? { ...widget, linkUrl } : widget)));
  };

  // ウィジェットを削除
  const handleDelete = (widgetId) => {
    setRows(rows.filter((widget) => widget.id !== widgetId));
  };

  // ウィジェットがない場合は何も表示しない
  if (rows.length === 0 && !isOwnProfile) {
    return null;
  }

  return (
    <div className="mt-8">
      {rows.length === 0 && isOwnProfile ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
          <Plus className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">「要素を追加」ボタンからウィジェットを追加してください</p>
        </div>
      ) : rows.length > 0 ? (
        <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 select-none">
          {rows.map((widget) => (
            <div
              key={widget.id}
              data-swapy-slot={widget.id}
              className={
                widget.width === "full"
                  ? "md:col-span-2 lg:col-span-3 select-none"
                  : widget.width === "two-thirds"
                  ? "md:col-span-2 lg:col-span-2 select-none"
                  : widget.width === "one-third"
                  ? "md:col-span-2 lg:col-span-1 select-none"
                  : "lg:col-span-1 select-none"
              }
            >
              <div data-swapy-item={widget.id} className="select-none">
                <Widget
                  widget={widget}
                  stats={stats}
                  onTypeChange={handleTypeChange}
                  onTextChange={handleTextChange}
                  onImageChange={handleImageChange}
                  onLinkChange={handleLinkChange}
                  onDelete={handleDelete}
                  isOwnProfile={isOwnProfile}
                />
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
