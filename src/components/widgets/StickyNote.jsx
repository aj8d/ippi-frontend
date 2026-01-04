/**
 * StickyNote.jsx - 付箋ウィジェット
 *
 * 📚 このコンポーネントの役割：
 * - テキストを自由に入力できる付箋
 * - 背景色を変更可能（カラーパレット）
 * - 絵文字/アイコンを追加可能
 *
 * 💡 goghアプリのような付箋機能を実現
 */

import { useState } from 'react';

// 📚 使用可能な背景色（Tailwindのカラー）
const COLORS = [
  { name: 'yellow', bg: 'bg-yellow-100', border: 'border-yellow-300' },
  { name: 'pink', bg: 'bg-pink-100', border: 'border-pink-300' },
  { name: 'blue', bg: 'bg-blue-100', border: 'border-blue-300' },
  { name: 'green', bg: 'bg-green-100', border: 'border-green-300' },
  { name: 'purple', bg: 'bg-purple-100', border: 'border-purple-300' },
  { name: 'orange', bg: 'bg-orange-100', border: 'border-orange-300' },
];

// 📚 使用可能な絵文字
const EMOJIS = ['💡', '⭐', '❤️', '🔥', '✨', '📌', '🎯', '💪', '🚀', '✅'];

/**
 * StickyNote - 付箋コンポーネント
 *
 * @param {Object} data - 付箋のデータ { text, color, emoji }
 * @param {Function} onUpdate - データ更新時のコールバック
 */
function StickyNote({ data = {}, onUpdate }) {
  // 📚 デフォルト値を設定
  const { text = '', color = 'yellow', emoji = '' } = data;

  // 📚 カラーピッカーの表示状態
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  /**
   * 📚 現在の色設定を取得
   *
   * find でCOLORS配列から該当する色を探す
   * || で見つからない場合はデフォルト（黄色）
   */
  const currentColor = COLORS.find((c) => c.name === color) || COLORS[0];

  /**
   * 📚 テキスト変更ハンドラー
   */
  const handleTextChange = (e) => {
    onUpdate?.({ text: e.target.value });
  };

  /**
   * 📚 色変更ハンドラー
   */
  const handleColorChange = (colorName) => {
    onUpdate?.({ color: colorName });
    setShowColorPicker(false);
  };

  /**
   * 📚 絵文字変更ハンドラー
   */
  const handleEmojiChange = (selectedEmoji) => {
    // 同じ絵文字をクリックしたら解除
    onUpdate?.({ emoji: emoji === selectedEmoji ? '' : selectedEmoji });
    setShowEmojiPicker(false);
  };

  return (
    <div className={`flex flex-col h-full ${currentColor.bg} p-3`}>
      {/* 📚 ツールバー（色・絵文字選択） */}
      <div className="flex items-center gap-2 mb-2 flex-shrink-0">
        {/* 色選択ボタン */}
        <div className="relative">
          <button
            onClick={() => {
              setShowColorPicker(!showColorPicker);
              setShowEmojiPicker(false);
            }}
            className={`w-6 h-6 rounded-full ${currentColor.bg} ${currentColor.border} border-2 hover:scale-110 transition-transform`}
            title="色を変更"
          />

          {/* カラーパレット（ドロップダウン） */}
          {showColorPicker && (
            <div className="absolute top-8 left-0 z-10 bg-white rounded-lg shadow-lg p-2 flex gap-1">
              {COLORS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => handleColorChange(c.name)}
                  className={`w-6 h-6 rounded-full ${c.bg} ${c.border} border-2 hover:scale-110 transition-transform ${
                    color === c.name ? 'ring-2 ring-gray-400' : ''
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* 絵文字選択ボタン */}
        <div className="relative">
          <button
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowColorPicker(false);
            }}
            className="w-6 h-6 rounded bg-white/50 hover:bg-white/80 transition-colors flex items-center justify-center text-sm"
            title="絵文字を追加"
          >
            {emoji || '😊'}
          </button>

          {/* 絵文字パレット */}
          {showEmojiPicker && (
            <div className="absolute top-8 left-0 z-10 bg-white rounded-lg shadow-lg p-2 grid grid-cols-5 gap-2 min-w-[180px]">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => handleEmojiChange(e)}
                  className={`w-8 h-8 rounded hover:bg-gray-100 transition-colors text-xl flex items-center justify-center ${
                    emoji === e ? 'bg-gray-200' : ''
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 📚 テキストエリア */}
      <textarea
        value={text}
        onChange={handleTextChange}
        placeholder="メモを入力..."
        className={`flex-1 w-full resize-none bg-transparent border-none outline-none text-gray-800 placeholder-gray-400`}
        // 📚 クリック時にピッカーを閉じる
        onClick={() => {
          setShowColorPicker(false);
          setShowEmojiPicker(false);
        }}
      />
    </div>
  );
}

export default StickyNote;
