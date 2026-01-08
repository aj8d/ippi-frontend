/**
 * キャンバス用TODOウィジェット
 *
 * - タスクの追加・完了・削除
 * - ログイン時: バックエンドと同期
 * - 非ログイン時: ローカルストレージで動作
 */

import { useState, useEffect, useCallback } from 'react';
import { Plus, Check, Trash2 } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { API_ENDPOINTS } from '../../config';

const LOCAL_STORAGE_KEY = 'guestTodos';

function TodoWidget() {
  const { token } = useAuth();

  // 状態管理
  const [todos, setTodos] = useState([]); // TODOリスト
  const [inputValue, setInputValue] = useState(''); // 入力フィールドの値
  const [loading, setLoading] = useState(false); // ローディング状態
  const [error, setError] = useState(''); // エラーメッセージ

  /**
   * ローカルストレージから読み込み（非ログイン時）
   */
  const loadFromLocalStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        setTodos(JSON.parse(saved));
      } else {
        setTodos([]);
      }
    } catch (err) {
      console.error('ローカルストレージの読み込みエラー:', err);
      setTodos([]);
    }
  }, []);

  /**
   * ローカルストレージに保存（非ログイン時）
   */
  const saveToLocalStorage = useCallback((todosToSave) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todosToSave));
    } catch (err) {
      console.error('ローカルストレージ保存エラー:', err);
    }
  }, []);

  /**
   * TODOを取得（ログイン時: バックエンド、非ログイン時: ローカルストレージ）
   */
  const fetchTodos = useCallback(async () => {
    if (!token) {
      // 非ログイン時: ローカルストレージから読み込む
      loadFromLocalStorage();
      return;
    }

    // ログイン時: バックエンドから取得
    try {
      setLoading(true);

      const response = await fetch(API_ENDPOINTS.TEXT_DATA.BASE, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Bearer ${token}`,
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
  }, [token, loadFromLocalStorage]);

  /**
   * コンポーネントマウント時にTODOを取得
   */
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  /**
   * TODOを追加（ログイン時: バックエンド、非ログイン時: ローカルストレージ）
   */
  const addTodo = async () => {
    if (!inputValue.trim()) return;

    if (!token) {
      // 非ログイン時: ローカルストレージに保存
      const newTodo = {
        id: Date.now(), // 一意のIDを生成
        text: inputValue,
        timerSeconds: 0,
      };
      const updatedTodos = [...todos, newTodo];
      setTodos(updatedTodos);
      saveToLocalStorage(updatedTodos);
      setInputValue('');
      setError('');
      return;
    }

    // ログイン時: バックエンドに保存
    try {
      const todoData = {
        text: inputValue,
        timerSeconds: 0,
      };

      const response = await fetch(API_ENDPOINTS.TEXT_DATA.BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(todoData),
      });

      if (response.ok) {
        const newTodo = await response.json();
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
   * TODOを削除（完了）（ログイン時: バックエンド、非ログイン時: ローカルストレージ）
   */
  const completeTodo = async (id) => {
    if (!token) {
      // 非ログイン時: ローカルストレージから削除
      const updatedTodos = todos.filter((todo) => todo.id !== id);
      setTodos(updatedTodos);
      saveToLocalStorage(updatedTodos);
      setError('');
      return;
    }

    // ログイン時: バックエンドから削除
    try {
      const response = await fetch(API_ENDPOINTS.TEXT_DATA.BY_ID(id), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setTodos(todos.filter((todo) => todo.id !== id));
        setError('');
      }
    } catch (err) {
      console.error('Failed to delete todo:', err);
      setError('タスクの削除に失敗しました');
    }
  };

  /**
   * Enterキーで追加
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  return (
    <div className="flex flex-col h-full p-4 gap-3">
      {/* ヘッダー
      <div className="text-lg font-bold text-gray-800 flex-shrink-0">TODO</div> */}

      {/* エラー表示 */}
      {error && <div className="p-2 bg-red-100 border border-red-300 text-red-700 rounded-lg text-xs">{error}</div>}

      {/* 入力フィールド */}
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

      {/* TODOリスト */}
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
