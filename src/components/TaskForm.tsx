'use client';

import React, { useState } from 'react';
import { Plus, Tag, Calendar, AlertCircle, ChevronDown, ChevronUp, Repeat, Sparkles, Clock, Timer, X, FileText } from 'lucide-react';
import { Priority, Category, Recurrence } from '@/types/todo';
import { calculateDuration } from '@/lib/timeUtils';

interface TaskFormProps {
  onAddTask: (
    text: string,
    priority: Priority,
    category: Category,
    dueDate?: string,
    recurrence?: Recurrence,
    startTime?: string,
    endTime?: string,
    notes?: string
  ) => void;
}

const CATEGORIES: Category[] = ['General', 'Work', 'Personal', 'Urgent', 'Health', 'Finance'];
const RECURRENCE_OPTIONS: { value: Recurrence; label: string; description: string }[] = [
  { value: 'none', label: 'Does not repeat', description: 'One-time task' },
  { value: 'daily', label: 'Daily', description: 'Auto-renews every day' },
  { value: 'weekly', label: 'Weekly', description: 'Auto-renews every 7 days' },
  { value: 'monthly', label: 'Monthly', description: 'Auto-renews every month' },
];

export function TaskForm({ onAddTask }: TaskFormProps) {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<Category>('General');
  const [dueDate, setDueDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [recurrence, setRecurrence] = useState<Recurrence>('none');
  const [showOptions, setShowOptions] = useState(false);

  const handleRecurrenceSelect = (val: Recurrence) => {
    setRecurrence(val);
    // If setting recurring and no due date is set yet, default to today
    if (val !== 'none' && !dueDate) {
      const today = new Date().toISOString().split('T')[0];
      setDueDate(today);
    }
  };

  const setTimePreset = (start: string, end: string) => {
    setStartTime(start);
    setEndTime(end);
    if (!dueDate) {
      const today = new Date().toISOString().split('T')[0];
      setDueDate(today);
    }
  };

  const addDuration = (minutes: number) => {
    if (!startTime) {
      // Default start time to current rounded time
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(Math.floor(now.getMinutes() / 15) * 15).padStart(2, '0');
      setStartTime(`${h}:${m}`);
      
      const endTotalMin = now.getHours() * 60 + Math.floor(now.getMinutes() / 15) * 15 + minutes;
      const endH = String(Math.floor(endTotalMin / 60) % 24).padStart(2, '0');
      const endM = String(endTotalMin % 60).padStart(2, '0');
      setEndTime(`${endH}:${endM}`);
      return;
    }

    const [h, m] = startTime.split(':').map(Number);
    const totalMin = h * 60 + m + minutes;
    const endH = String(Math.floor(totalMin / 60) % 24).padStart(2, '0');
    const endM = String(totalMin % 60).padStart(2, '0');
    setEndTime(`${endH}:${endM}`);
  };

  const durationText = calculateDuration(startTime, endTime);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    onAddTask(
      text.trim(),
      priority,
      category,
      dueDate || undefined,
      recurrence !== 'none' ? recurrence : undefined,
      startTime || undefined,
      endTime || undefined,
      notes.trim() || undefined
    );
    setText('');
    setDueDate('');
    setStartTime('');
    setEndTime('');
    setNotes('');
    setRecurrence('none');
  };

  const hasExtraConfig = recurrence !== 'none' || startTime || endTime || dueDate || Boolean(notes.trim());

  return (
    <div className="bg-white dark:bg-dark-700 rounded-2xl shadow-xs hover:shadow-sm p-3.5 sm:p-5 mb-8 border border-slate-200/80 dark:border-dark-600 transition-all duration-200">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-2 sm:gap-3 items-center">
          <input
            id="task-input"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setShowOptions(true)}
            placeholder="What needs to be done today?"
            className="flex-grow px-3.5 sm:px-5 py-3 sm:py-3.5 bg-slate-50 dark:bg-dark-600/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 border border-slate-200 dark:border-dark-500 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm shadow-inner transition-all min-w-0"
            required
          />
          <button
            type="button"
            onClick={() => setShowOptions(!showOptions)}
            className={`p-3 sm:p-3.5 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold flex-shrink-0 ${
              hasExtraConfig
                ? 'bg-emerald-50 dark:bg-primary-500/10 text-emerald-700 dark:text-primary-400 border border-emerald-200 dark:border-primary-500/30'
                : 'bg-slate-100 dark:bg-dark-600 hover:bg-slate-200 dark:hover:bg-dark-500 text-slate-700 dark:text-gray-300'
            }`}
            title="Toggle scheduling & extra options"
          >
            {startTime && (
              <span className="flex items-center gap-1 text-emerald-700 dark:text-primary-400">
                <Clock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{startTime}</span>
              </span>
            )}
            {recurrence !== 'none' && (
              <span className="flex items-center gap-1">
                <Repeat className="w-3.5 h-3.5 animate-spin-slow" />
                <span className="capitalize hidden sm:inline">{recurrence}</span>
              </span>
            )}
            {showOptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 dark:bg-primary-500 dark:hover:bg-primary-600 active:scale-95 text-white px-3.5 sm:px-6 py-3 sm:py-3.5 rounded-xl transition-all duration-200 flex items-center gap-1.5 sm:gap-2 font-semibold text-xs sm:text-sm shadow-xs hover:shadow-sm whitespace-nowrap flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Task</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        {showOptions && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-600 space-y-4 animate-fadeIn">
            {/* Start Time & End Time Scheduling */}
            <div className="bg-gray-50/70 dark:bg-dark-800/60 p-3.5 rounded-xl border border-gray-200/60 dark:border-dark-600 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-700 dark:text-gray-200 font-semibold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary-500" /> Timing (Start & End Time)
                </label>
                {durationText && (
                  <span className="text-[11px] font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 px-2 py-0.5 rounded-md border border-primary-200/60 dark:border-primary-800/50 flex items-center gap-1">
                    <Timer className="w-3 h-3" /> Duration: {durationText}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="block text-[11px] text-gray-500 dark:text-gray-400 mb-1 font-medium">
                    Start Time
                  </span>
                  <div className="relative">
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-dark-600 border border-gray-200 dark:border-dark-500 rounded-lg text-xs dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <span className="block text-[11px] text-gray-500 dark:text-gray-400 mb-1 font-medium">
                    End Time
                  </span>
                  <div className="relative">
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-dark-600 border border-gray-200 dark:border-dark-500 rounded-lg text-xs dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* Quick time helpers */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] text-gray-400 font-medium">Quick presets:</span>
                <button
                  type="button"
                  onClick={() => addDuration(30)}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-white dark:bg-dark-600 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-dark-500 hover:bg-gray-100 dark:hover:bg-dark-500 font-medium transition-colors"
                >
                  +30 min
                </button>
                <button
                  type="button"
                  onClick={() => addDuration(60)}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-white dark:bg-dark-600 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-dark-500 hover:bg-gray-100 dark:hover:bg-dark-500 font-medium transition-colors"
                >
                  +1 hr
                </button>
                <button
                  type="button"
                  onClick={() => addDuration(120)}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-white dark:bg-dark-600 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-dark-500 hover:bg-gray-100 dark:hover:bg-dark-500 font-medium transition-colors"
                >
                  +2 hrs
                </button>
                <button
                  type="button"
                  onClick={() => setTimePreset('09:00', '10:00')}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-white dark:bg-dark-600 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-dark-500 hover:bg-gray-100 dark:hover:bg-dark-500 font-medium transition-colors"
                >
                  9:00 AM - 10:00 AM
                </button>
                <button
                  type="button"
                  onClick={() => setTimePreset('14:00', '15:00')}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-white dark:bg-dark-600 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-dark-500 hover:bg-gray-100 dark:hover:bg-dark-500 font-medium transition-colors"
                >
                  2:00 PM - 3:00 PM
                </button>
                {(startTime || endTime) && (
                  <button
                    type="button"
                    onClick={() => {
                      setStartTime('');
                      setEndTime('');
                    }}
                    className="text-[11px] px-2 py-0.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex items-center gap-0.5 ml-auto"
                  >
                    <X className="w-3 h-3" /> Clear time
                  </button>
                )}
              </div>
            </div>

            {/* Recurrence Selector */}
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-2 flex items-center gap-1.5">
                <Repeat className="w-3.5 h-3.5 text-primary-500" /> Recurrence (Auto-Renewal)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {RECURRENCE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleRecurrenceSelect(opt.value)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all border text-left flex flex-col justify-center ${
                      recurrence === opt.value
                        ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                        : 'bg-gray-50 dark:bg-dark-600 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-dark-500 hover:bg-gray-100 dark:hover:bg-dark-500'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 font-bold">
                      {opt.value !== 'none' && <Repeat className="w-3 h-3" />}
                      {opt.label}
                    </span>
                    <span
                      className={`text-[10px] truncate mt-0.5 ${
                        recurrence === opt.value
                          ? 'text-primary-100'
                          : 'text-gray-400 dark:text-gray-400'
                      }`}
                    >
                      {opt.description}
                    </span>
                  </button>
                ))}
              </div>

              {recurrence !== 'none' && (
                <div className="mt-2.5 p-2.5 bg-primary-50 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900/40 rounded-xl text-xs text-primary-700 dark:text-primary-300 flex items-center gap-2 animate-fadeIn">
                  <Sparkles className="w-4 h-4 text-primary-500 flex-shrink-0" />
                  <span>
                    <strong>Auto-Renewal active:</strong> Completing this task will record completion and automatically generate the next scheduled cycle!
                  </span>
                </div>
              )}
            </div>

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

            {/* Task Notes / Details */}
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-primary-500" /> Task Notes & Details
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add task notes, checklist items, links, or instructions..."
                className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-600 border border-gray-200 dark:border-dark-500 rounded-lg text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary-500 resize-y"
              />
            </div>

            {/* Category Pills & Due Date Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary-500" /> Due Date {recurrence !== 'none' ? '(Anchor Date)' : '(Optional)'}
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-600 border border-gray-200 dark:border-dark-500 rounded-lg text-xs dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}



