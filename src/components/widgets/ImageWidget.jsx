/**
 * ImageWidget.jsx - 画像ウィジェット
 *
 * 📚 このコンポーネントの役割：
 * - ローカルから画像を選択
 * - Cloudinaryにアップロード
 * - キャンバス上に画像を表示
 *
 * 💡 仕組み：
 * 1. ユーザーが画像を選択
 * 2. バックエンドAPI経由でCloudinaryにアップロード
 * 3. 返ってきたURLを data.imageUrl に保存
 * 4. 画像を表示
 */

import { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Loader2, X } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

const API_URL = 'http://localhost:8080/api/images';

function ImageWidget({ data = {}, onUpdate }) {
  const { token } = useAuth();

  // 📚 状態管理
  const [uploading, setUploading] = useState(false); // アップロード中かどうか
  const [error, setError] = useState(''); // エラーメッセージ

  // 📚 ファイル選択用の隠しinput要素への参照
  const fileInputRef = useRef(null);

  // data から画像情報を取得
  const { imageUrl, publicId } = data;

  /**
   * 📚 ファイル選択ダイアログを開く
   *
   * ボタンクリック時に隠しinput要素をクリックする
   */
  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * 📚 ファイル選択時の処理
   *
   * 1. ファイルを取得
   * 2. FormDataに詰めてAPIに送信
   * 3. 返ってきたURLをdataに保存
   */
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ファイルサイズチェック（5MB）
    if (file.size > 5 * 1024 * 1024) {
      setError('ファイルサイズは5MB以下にしてください');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // 📚 FormData: ファイルをサーバーに送るための形式
      const formData = new FormData();
      formData.append('file', file);

      // 📚 fetch でアップロード
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // Content-Type は FormData の場合は自動設定されるので指定しない
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'アップロードに失敗しました');
      }

      // 📚 成功したら親コンポーネントに通知
      onUpdate?.({
        imageUrl: result.url,
        publicId: result.publicId,
      });
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'アップロードに失敗しました');
    } finally {
      setUploading(false);
      // inputをリセット（同じファイルを再選択できるように）
      e.target.value = '';
    }
  };

  /**
   * 📚 画像を削除
   */
  const handleRemoveImage = async () => {
    if (!publicId) {
      // publicIdがなければローカルでクリアするだけ
      onUpdate?.({ imageUrl: null, publicId: null });
      return;
    }

    try {
      // Cloudinaryから削除
      await fetch(`${API_URL}/delete?publicId=${encodeURIComponent(publicId)}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // 成功したらデータをクリア
      onUpdate?.({ imageUrl: null, publicId: null });
    } catch (err) {
      console.error('Delete error:', err);
      // 削除に失敗してもローカルではクリア
      onUpdate?.({ imageUrl: null, publicId: null });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 📚 隠しファイル入力 */}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

      {/* エラー表示 */}
      {error && <div className="m-2 p-2 bg-red-100 border border-red-300 text-red-700 rounded text-xs">{error}</div>}

      {/* 📚 メインコンテンツ */}
      <div className="flex-1 flex items-center justify-center p-2">
        {uploading ? (
          // アップロード中
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-sm">アップロード中...</span>
          </div>
        ) : imageUrl ? (
          // 画像が設定されている場合
          <div className="relative w-full h-full group">
            <img src={imageUrl} alt="Uploaded" className="w-full h-full object-contain rounded" />
            {/* ホバー時に削除ボタン表示 */}
            <button
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        ) : (
          // 画像未設定：アップロードボタン表示
          <button
            onClick={handleSelectClick}
            className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6 text-gray-500" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">画像をアップロード</p>
              <p className="text-xs text-gray-500 mt-1">クリックして選択</p>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

export default ImageWidget;
