import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Check, Trash2 } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

const API_URL = 'http://localhost:8080/api/text-data';

function SwapyTodo({ timerSeconds, onSelectedTodoChange }) {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTodoId, setSelectedTodoId] = useState(null); // 選択されたTODO ID
  const { token } = useAuth();

  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL, {
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
  }, [token]);

  const updateTodoTimer = useCallback(
    async (todoId, seconds) => {
      try {
        const updateData = { timerSeconds: Math.round(seconds) };
        const jsonBody = JSON.stringify(updateData);
        const utf8Bytes = new TextEncoder().encode(jsonBody);

        await fetch(`${API_URL}/${todoId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            Authorization: `Bearer ${token}`,
          },
          body: utf8Bytes,
        });
      } catch (err) {
        console.error('Failed to update todo timer:', err);
      }
    },
    [token]
  );

  // バックエンドから TODO を取得
  useEffect(() => {
    if (token) {
      fetchTodos();
    }
  }, [token, fetchTodos]);

  // timerSeconds が更新されたとき（タイマー停止/完了時のみ）、選択された TODO の timerSeconds を更新
  useEffect(() => {
    if (timerSeconds !== null && timerSeconds !== undefined && timerSeconds > 0 && selectedTodoId) {
      updateTodoTimer(selectedTodoId, timerSeconds);
    }
  }, [timerSeconds, selectedTodoId, updateTodoTimer]);

  const addTodo = async () => {
    if (!inputValue.trim()) return;

    try {
      const todoData = {
        text: inputValue,
        timerSeconds: 0,
      };
      const jsonBody = JSON.stringify(todoData);
      const utf8Bytes = new TextEncoder().encode(jsonBody);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Bearer ${token}`,
        },
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

  // TODO を選択するハンドラー
  const handleSelectTodo = (todoId) => {
    setSelectedTodoId(todoId);
    if (onSelectedTodoChange) {
      onSelectedTodoChange(todoId);
    }
  };

  const completeTodo = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setTodos(todos.filter((todo) => todo.id !== id));
        setError('');
        if (selectedTodoId === id) {
          setSelectedTodoId(null); // 選択されたTODOを解除
          if (onSelectedTodoChange) {
            onSelectedTodoChange(null);
          }
        }
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
              onClick={() => handleSelectTodo(todo.id)}
              className={`flex items-center gap-3 p-3 border rounded-lg transition-all cursor-pointer ${
                selectedTodoId === todo.id
                  ? 'bg-blue-100 border-blue-500 border-2'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  completeTodo(todo.id);
                }}
                className="flex-shrink-0 w-6 h-6 rounded border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 transition-all flex items-center justify-center"
              >
                <Check size={16} className="text-green-500 opacity-0 hover:opacity-100" />
              </button>
              <span className="flex-1 text-gray-800">{todo.text}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  completeTodo(todo.id);
                }}
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
