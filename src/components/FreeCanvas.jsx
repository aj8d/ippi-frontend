/**
 * FreeCanvas.jsx - 自由配置キャンバス
 *
 * 📚 このコンポーネントの役割：
 * - ウィジェットを自由にドラッグ＆配置できるエリア
 * - react-rnd ライブラリを使って移動・リサイズを実現
 * - 各ウィジェットの位置(x, y)とサイズ(width, height)を管理
 */

import { memo, useCallback } from 'react';
import { Rnd } from 'react-rnd';
import { X } from 'lucide-react';

// 📚 ウィジェットコンポーネントをインポート（後で作成）
// 今は仮のコンポーネントを使います
import TimerWidget from './widgets/TimerWidget';
import TodoWidget from './widgets/TodoWidget';
import StreakWidget from './widgets/StreakWidget';
import StickyNote from './widgets/StickyNote';
import ImageWidget from './widgets/ImageWidget'; // 📷 画像ウィジェット追加

/**
 * FreeCanvas - メインキャンバスコンポーネント
 *
 * @param {Array} widgets - ウィジェットの配列 [{id, type, x, y, width, height, data}, ...]
 * @param {Function} setWidgets - ウィジェット配列を更新する関数
 * @param {Object} timerSettings - タイマーの設定（displayMode, inputMinutes, inputSeconds）
 */
function FreeCanvas({ widgets, setWidgets, timerSettings }) {
  /**
   * 📚 ウィジェットの位置を更新する関数
   *
   * ドラッグが終わった時に呼ばれる
   * d.x, d.y = ドラッグ後の新しい座標
   */
  const handleDragStop = useCallback(
    (id, d) => {
      setWidgets((prev) =>
        prev.map(
          (widget) =>
            widget.id === id
              ? { ...widget, x: d.x, y: d.y } // 該当ウィジェットの座標を更新
              : widget // その他はそのまま
        )
      );
    },
    [setWidgets]
  );

  /**
   * 📚 ウィジェットのサイズを更新する関数
   *
   * リサイズが終わった時に呼ばれる
   * ref.offsetWidth, ref.offsetHeight = 新しいサイズ
   * position.x, position.y = リサイズ後の位置
   */
  const handleResizeStop = useCallback(
    (id, ref, position) => {
      setWidgets((prev) =>
        prev.map((widget) =>
          widget.id === id
            ? {
                ...widget,
                width: ref.offsetWidth,
                height: ref.offsetHeight,
                x: position.x,
                y: position.y,
              }
            : widget
        )
      );
    },
    [setWidgets]
  );

  /**
   * 📚 ウィジェットを削除する関数
   *
   * ×ボタンをクリックした時に呼ばれる
   * filter で該当IDを除外した新しい配列を作成
   */
  const handleDelete = useCallback(
    (id) => {
      setWidgets((prev) => prev.filter((widget) => widget.id !== id));
    },
    [setWidgets]
  );

  /**
   * 📚 ウィジェットのデータを更新する関数
   *
   * 付箋のテキストや色を変更した時などに使う
   */
  const handleUpdateData = useCallback(
    (id, newData) => {
      setWidgets((prev) =>
        prev.map((widget) => (widget.id === id ? { ...widget, data: { ...widget.data, ...newData } } : widget))
      );
    },
    [setWidgets]
  );

  /**
   * 📚 ウィジェットを前面に移動する関数
   *
   * 配列の順序を変えるのではなく、zIndexを更新する方法に変更
   * これによりドラッグ中の再レンダリング問題を回避
   */
  const bringToFront = useCallback(
    (id) => {
      setWidgets((prev) => {
        // 現在の最大zIndexを取得
        const maxZ = Math.max(...prev.map((w) => w.zIndex || 0), 0);
        // クリックされたウィジェットのzIndexを最大値+1に設定
        return prev.map((widget) => (widget.id === id ? { ...widget, zIndex: maxZ + 1 } : widget));
      });
    },
    [setWidgets]
  );

  /**
   * 📚 ウィジェットの種類に応じてコンポーネントを返す関数
   *
   * type によって表示するコンポーネントを切り替える
   */
  const renderWidget = (widget) => {
    switch (widget.type) {
      case 'timer':
        return <TimerWidget settings={timerSettings} />;
      case 'todo':
        return <TodoWidget />;
      case 'streak':
        return <StreakWidget />;
      case 'sticky':
        return <StickyNote data={widget.data} onUpdate={(newData) => handleUpdateData(widget.id, newData)} />;
      case 'image':
        return <ImageWidget data={widget.data} onUpdate={(newData) => handleUpdateData(widget.id, newData)} />;
      default:
        return <div className="p-4 text-gray-500">Unknown widget</div>;
    }
  };

  return (
    // 📚 キャンバス全体のコンテナ
    // relative: 子要素の absolute 配置の基準になる
    // overflow-auto: コンテンツがはみ出たらスクロール
    <div className="relative w-full h-screen bg-gray-100 overflow-auto">
      {/* 📚 ウィジェットがない時のガイド表示 */}
      {widgets.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <p className="text-lg mb-2">キャンバスは空です</p>
            <p className="text-sm">← サイドバーからウィジェットを追加してください</p>
          </div>
        </div>
      )}

      {/* 📚 ウィジェットをループで表示 */}
      {widgets.map((widget) => (
        /**
         * Rnd コンポーネント - react-rnd のメイン機能
         *
         * position: 現在の位置 {x, y}
         * size: 現在のサイズ {width, height}
         * onDragStop: ドラッグ終了時のコールバック
         * onResizeStop: リサイズ終了時のコールバック
         * bounds: 移動範囲の制限（"parent" = 親要素内）
         * minWidth/minHeight: 最小サイズ
         */
        <Rnd
          key={widget.id}
          position={{ x: widget.x, y: widget.y }}
          size={{ width: widget.width, height: widget.height }}
          onDragStop={(e, d) => handleDragStop(widget.id, d)}
          onResizeStop={(e, direction, ref, delta, position) => handleResizeStop(widget.id, ref, position)}
          bounds="parent"
          minWidth={200}
          minHeight={300}
          // 📚 ドラッグを開始できる領域を指定（ヘッダー部分のみ）
          dragHandleClassName="drag-handle"
          // 🚀 パフォーマンス最適化オプション
          enableUserSelectHack={false} // テキスト選択ハックを無効化（軽量化）
          style={{
            willChange: 'transform', // GPUアクセラレーション有効化
            zIndex: widget.zIndex || 0, // 🆕 zIndexで表示順を制御
          }}
        >
          {/* ウィジェットのカード */}
          <div
            className="w-full h-full bg-white rounded-xl shadow-lg overflow-hidden flex flex-col select-none"
            onMouseDown={() => bringToFront(widget.id)} // 🆕 クリック時に最前面へ
          >
            {/* 📚 ドラッグハンドル（ヘッダー部分） */}
            <div className="drag-handle flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200 cursor-move select-none">
              <span className="text-xs font-medium text-gray-500 uppercase">{widget.type}</span>
              {/* 削除ボタン */}
              <button
                onClick={() => handleDelete(widget.id)}
                className="p-1 hover:bg-red-100 rounded transition-colors"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
              </button>
            </div>

            {/* 📚 ウィジェットの中身（テキスト選択は可能） */}
            <div className="flex-1 overflow-auto select-text">{renderWidget(widget)}</div>
          </div>
        </Rnd>
      ))}
    </div>
  );
}

// 📚 memo でコンポーネントをメモ化（不要な再レンダリングを防ぐ）
export default memo(FreeCanvas);
