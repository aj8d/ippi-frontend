import React, { useState, useEffect } from 'react';
import { Plus, Check, Trash2 } from 'lucide-react';

const API_URL = 'http://localhost:8080/api/text-data';

function SwapyTodo() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // バックエンドから TODO を取得
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      const data = await response.json();
      setTodos(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      console.error('Failed to fetch todos:', err);
      setError('データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async () => {
    if (!inputValue.trim()) return;

    try {
      const jsonBody = JSON.stringify({ text: inputValue });
      const utf8Bytes = new TextEncoder().encode(jsonBody);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: utf8Bytes,
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

  const completeTodo = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 px-4">
      <div className="text-2xl font-bold text-gray-800 mb-2">TODO</div>

      {error && (
        <div className="w-full max-w-xs p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-2 w-full max-w-xs">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="新しいタスク"
          disabled={loading}
          className="flex-1 px-4 py-2 border-2 border-gray-300 text-black rounded-lg focus:outline-none focus:border-black disabled:bg-gray-200"
        />
        <button
          onClick={addTodo}
          disabled={loading}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all flex items-center gap-2 disabled:bg-gray-400"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="w-full max-w-xs flex flex-col gap-2">
        {loading && todos.length === 0 ? (
          <div className="text-center text-gray-400 py-8">読み込み中...</div>
        ) : todos.length === 0 ? (
          <div className="text-center text-gray-400 py-8">タスクはありません</div>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-all"
            >
              <button
                onClick={() => completeTodo(todo.id)}
                className="flex-shrink-0 w-6 h-6 rounded border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 transition-all flex items-center justify-center"
              >
                <Check size={16} className="text-green-500 opacity-0 hover:opacity-100" />
              </button>
              <span className="flex-1 text-gray-800">{todo.text}</span>
              <button
                onClick={() => completeTodo(todo.id)}
                className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default SwapyTodo;
