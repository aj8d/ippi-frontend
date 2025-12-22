import { useCallback, useEffect, useRef, useState } from 'react';
import { createSwapy } from 'swapy';
import SwapyItem from './SwapyItem';
import SwapyTimer from './SwapyTimer';
import SwapyStreak from './SwapyStreak';
import SwapyTodo from './SwapyTodo';

function SwapyContainer() {
  const containerRef = useRef(null);
  const swapyRef = useRef(null);
  const [streak, setStreak] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [selectedTodoId, setSelectedTodoId] = useState(null);

  const handleTimerComplete = useCallback((seconds) => {
    // タイマー完了時に秒数を更新してから streak をインクリメント
    setElapsedSeconds(seconds);
    setStreak((prev) => prev + 1);
  }, []);

  const handleTimerUpdate = useCallback((seconds) => {
    setElapsedSeconds(seconds);
  }, []);

  const handleSelectedTodoChange = useCallback((todoId) => {
    setSelectedTodoId(todoId);
  }, []);

  const items = [
    {
      id: 'item-1',
      content: (
        <SwapyTimer
          key="timer-1"
          onComplete={handleTimerComplete}
          onUpdate={handleTimerUpdate}
          selectedTodoId={selectedTodoId}
        />
      ),
    },
    { id: 'item-2', content: <SwapyStreak key="streak" count={streak} /> },
    {
      id: 'item-3',
      content: <SwapyTodo key="todo" timerSeconds={elapsedSeconds} onSelectedTodoChange={handleSelectedTodoChange} />,
    },
  ];

  useEffect(() => {
    if (containerRef.current) {
      if (swapyRef.current) {
        swapyRef.current.destroy();
      }

      const swapy = createSwapy(containerRef.current, {
        animation: 'dynamic',
      });

      swapyRef.current = swapy;

      return () => {
        if (swapyRef.current) {
          swapyRef.current.destroy();
        }
      };
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="max-w-6xl mx-auto">
        <div ref={containerRef} data-swapy-container className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <SwapyItem key={item.id} slotId={`slot-${item.id}`} itemId={item.id}>
              {item.content}
            </SwapyItem>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SwapyContainer;
