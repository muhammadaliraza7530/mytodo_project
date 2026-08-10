'use client';

import React, { useState } from 'react';
import { Plus, Tag, Calendar, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Priority, Category } from '@/types/todo';

interface TaskFormProps {
  onAddTask: (text: string, priority: Priority, category: Category, dueDate?: string) => void;
}

const CATEGORIES: Category[] = ['General', 'Work', 'Personal', 'Urgent', 'Health', 'Finance'];

export function TaskForm({ onAddTask }: TaskFormProps) {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<Category>('General');
  const [dueDate, setDueDate] = useState('');
  const [showOptions, setShowOptions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    onAddTask(text.trim(), priority, category, dueDate || undefined);
    setText('');
    setDueDate('');
  };

  return (
    <div className="bg-white dark:bg-dark-700 rounded-2xl shadow-sm hover:shadow-md p-5 mb-8 border border-gray-100 dark:border-dark-600 transition-all duration-200">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3 items-center">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setShowOptions(true)}
            placeholder="What needs to be done today?"
            className="flex-grow px-5 py-3.5 bg-gray-50 dark:bg-dark-600/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 border border-gray-200/50 dark:border-dark-500 text-gray-800 dark:text-white placeholder-gray-400 text-sm shadow-inner transition-all"
            required
          />
          <button
            type="button"
            onClick={() => setShowOptions(!showOptions)}
            className="p-3.5 rounded-xl bg-gray-100 dark:bg-dark-600 hover:bg-gray-200 dark:hover:bg-dark-500 text-gray-600 dark:text-gray-300 transition-colors"
            title="Toggle extra options"
          >
            {showOptions ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          <button
            type="submit"
            className="bg-primary-500 hover:bg-primary-600 active:scale-95 text-white px-6 py-3.5 rounded-xl transition-all duration-200 flex items-center gap-2 font-semibold text-sm shadow-sm hover:shadow-md whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>

        {showOptions && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-600 space-y-4 animate-fadeIn">
            {/* Priority Selector */}
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-primary-500" /> Priority Level
              </label>
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold capitalize transition-all border ${
                      priority === p
                        ? p === 'high'
                          ? 'bg-red-500 text-white border-red-500 shadow-sm'
                          : p === 'medium'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                          : 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                        : 'bg-gray-50 dark:bg-dark-600 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-dark-500 hover:bg-gray-100 dark:hover:bg-dark-500'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Pills */}
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-2 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-primary-500" /> Category
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      category === cat
                        ? 'bg-primary-500 text-white shadow-xs'
                        : 'bg-gray-100 dark:bg-dark-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-500'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary-500" /> Due Date (Optional)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 bg-gray-50 dark:bg-dark-600 border border-gray-200 dark:border-dark-500 rounded-lg text-xs dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

