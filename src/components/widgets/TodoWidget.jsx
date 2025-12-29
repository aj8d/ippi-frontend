/**
 * TodoWidget.jsx - キャンバス用TODOウィジェット
 *
 * 📚 このコンポーネントの役割：
 * - タスクの追加・完了・削除
 * - バックエンドと同期（CRUD操作）
 * - タイマーと連携可能
 */

import { useState, useEffect, useCallback } from 'react';
import { Plus, Check, Trash2 } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

const API_URL = 'http://localhost:8080/api/text-data';

function TodoWidget() {
  const { token } = useAuth();

  // 📚 状態管理
  const [todos, setTodos] = useState([]); // TODOリスト
  const [inputValue, setInputValue] = useState(''); // 入力フィールドの値
  const [loading, setLoading] = useState(false); // ローディング状態
  const [error, setError] = useState(''); // エラーメッセージ

  /**
   * 📚 バックエンドからTODOを取得
   *
   * useCallback = 関数をメモ化（不要な再生成を防ぐ）
   * token が変わった時だけ関数を再生成
   */
  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);

      // 📚 fetch API でバックエンドにリクエスト
      const response = await fetch(API_URL, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Bearer ${token}`, // JWT認証トークン
        },
      });

      const data = await response.json();
      setTodos(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      console.error('Failed to fetch todos:', err);
      setError('データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, [token]);

  /**
   * 📚 コンポーネントマウント時にTODOを取得
   *
   * useEffect の第2引数（依存配列）が空 = マウント時のみ実行
   * [token, fetchTodos] = token か fetchTodos が変わったら再実行
   */
  useEffect(() => {
    if (token) {
      fetchTodos();
    }
  }, [token, fetchTodos]);

  /**
   * 📚 TODOを追加
   */
  const addTodo = async () => {
    if (!inputValue.trim()) return;

    try {
      const todoData = {
        text: inputValue,
        timerSeconds: 0,
      };

      // 📚 POST リクエストで新しいTODOを作成
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(todoData),
      });

      if (response.ok) {
        const newTodo = await response.json();
        // 📚 スプレッド演算子で既存配列に追加
        setTodos([...todos, newTodo]);
        setInputValue('');
        setError('');
      }
    } catch (err) {
      console.error('Failed to add todo:', err);
      setError('タスクの追加に失敗しました');
    }
  };

  /**
   * 📚 TODOを削除（完了）
   */
  const completeTodo = async (id) => {
    try {
      // 📚 DELETE リクエストでTODOを削除
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // 📚 filter で該当IDを除外した新しい配列を作成
        setTodos(todos.filter((todo) => todo.id !== id));
        setError('');
      }
    } catch (err) {
      console.error('Failed to delete todo:', err);
      setError('タスクの削除に失敗しました');
    }
  };

  /**
   * 📚 Enterキーで追加
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  return (
    <div className="flex flex-col h-full p-4 gap-3">
      {/* ヘッダー */}
      <div className="text-lg font-bold text-gray-800 flex-shrink-0">TODO</div>

      {/* エラー表示 */}
      {error && <div className="p-2 bg-red-100 border border-red-300 text-red-700 rounded-lg text-xs">{error}</div>}

      {/* 📚 入力フィールド */}
      <div className="flex gap-2 flex-shrink-0">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="新しいタスク"
          disabled={loading}
          className="flex-1 px-3 py-2 border-2 border-gray-300 text-black text-sm rounded-lg focus:outline-none focus:border-black disabled:bg-gray-200"
        />
        <button
          onClick={addTodo}
          disabled={loading}
          className="px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all disabled:bg-gray-400"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* 📚 TODOリスト */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="flex flex-col gap-2">
          {loading && todos.length === 0 ? (
            <div className="text-center text-gray-400 py-4 text-sm">読み込み中...</div>
          ) : todos.length === 0 ? (
            <div className="text-center text-gray-400 py-4 text-sm">タスクはありません</div>
          ) : (
            todos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-all"
              >
                {/* 完了ボタン */}
                <button
                  onClick={() => completeTodo(todo.id)}
                  className="flex-shrink-0 w-5 h-5 rounded border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 transition-all flex items-center justify-center group"
                >
                  <Check size={14} className="text-green-500 opacity-0 group-hover:opacity-100" />
                </button>

                {/* タスク名 */}
                <span className="flex-1 text-gray-800 text-sm truncate">{todo.text}</span>

                {/* 削除ボタン */}
                <button
                  onClick={() => completeTodo(todo.id)}
                  className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default TodoWidget;
