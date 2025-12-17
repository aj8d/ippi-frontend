import React, { useState } from 'react';
import { Plus, Check, Trash2 } from 'lucide-react';

function SwapyTodo() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const addTodo = () => {
    if (inputValue.trim()) {
      setTodos([...todos, { id: Date.now(), text: inputValue }]);
      setInputValue('');
    }
  };

  const completeTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 px-4">
      <div className="text-2xl font-bold text-gray-800 mb-2">TODO</div>

      <div className="flex gap-2 w-full max-w-xs">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="新しいタスク"
          className="flex-1 px-4 py-2 border-2 border-gray-300 text-black rounded-lg focus:outline-none focus:border-black"
        />
        <button
          onClick={addTodo}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all flex items-center gap-2"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="w-full max-w-xs flex flex-col gap-2">
        {todos.length === 0 ? (
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
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default SwapyTodo;
