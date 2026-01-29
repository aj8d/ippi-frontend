import { Timer, ListTodo, Flame, StickyNote, Image } from 'lucide-react';

export const UNIQUE_WIDGETS = [
  { id: 'timer', icon: Timer, label: 'タイマー', defaultSize: { width: 300, height: 380 } },
  { id: 'todo', icon: ListTodo, label: 'TODO', defaultSize: { width: 280, height: 350 } },
  { id: 'streak', icon: Flame, label: 'ストリーク', defaultSize: { width: 180, height: 180 } },
];

export const MULTIPLE_WIDGETS = [
  { id: 'sticky', icon: StickyNote, label: '付箋', defaultSize: { width: 230, height: 200 } },
  { id: 'image', icon: Image, label: '画像', defaultSize: { width: 250, height: 250 } },
];
