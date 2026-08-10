'use client';

import React, { useState } from 'react';
import { Check, Edit2, Trash2, Calendar, Tag, Save, X, GripVertical, Clock, Repeat, Flame, Sparkles, Timer, Play, FileText } from 'lucide-react';
import { Task, Priority, Category, Recurrence } from '@/types/todo';
import { formatRecurrence, getRenewalHint } from '@/lib/recurrence';
import { formatTimeString, calculateDuration, isTaskCurrentlyActive } from '@/lib/timeUtils';

interface TaskItemProps {
  task: Task;
  index: number;
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (
    id: string,
    newText: string,
    priority: Priority,
    category: Category,
    dueDate?: string,
    recurrence?: Recurrence,
    startTime?: string,
    endTime?: string,
    notes?: string
  ) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  isDragging?: boolean;
}

export function TaskItem({
  task,
  index,
  onToggleComplete,
  onDeleteTask,
  onUpdateTask,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging = false,
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [editPriority, setEditPriority] = useState<Priority>(task.priority);
  const [editCategory, setEditCategory] = useState<Category>(task.category);
  const [editDueDate, setEditDueDate] = useState<string>(task.due_date || '');
  const [editStartTime, setEditStartTime] = useState<string>(task.start_time || '');
  const [editEndTime, setEditEndTime] = useState<string>(task.end_time || '');
  const [editNotes, setEditNotes] = useState<string>(task.notes || '');
  const [editRecurrence, setEditRecurrence] = useState<Recurrence>(task.recurrence || 'none');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editText.trim()) return;

    onUpdateTask(
      task.id,
      editText.trim(),
      editPriority,
      editCategory,
      editDueDate || undefined,
      editRecurrence !== 'none' ? editRecurrence : undefined,
      editStartTime || undefined,
      editEndTime || undefined,
      editNotes.trim() || undefined
    );
    setIsEditing(false);
  };

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case 'high':
        return <span className="bg-red-50 dark:bg-red-950/70 text-red-700 dark:text-red-300 text-xs px-2 py-0.5 rounded-md font-semibold border border-red-200 dark:border-red-800/70">High</span>;
      case 'medium':
        return <span className="bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 text-xs px-2 py-0.5 rounded-md font-semibold border border-amber-200 dark:border-amber-800/70">Medium</span>;
      case 'low':
        return <span className="bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 text-xs px-2 py-0.5 rounded-md font-semibold border border-blue-200 dark:border-blue-800/70">Low</span>;
    }
  };

  const getCategoryBadge = (c: Category) => {
    return (
      <span className="bg-slate-100/80 dark:bg-dark-600 text-slate-700 dark:text-gray-200 text-xs px-2 py-0.5 rounded-md font-medium border border-slate-200/80 dark:border-dark-500 flex items-center gap-1">
        <Tag className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> {c}
      </span>
    );
  };

  const isDueSoon = (dueDateStr?: string | null, completed?: boolean): boolean => {
    if (!dueDateStr || completed) return false;
    const now = new Date();
    const due = new Date(dueDateStr.includes('T') ? dueDateStr : `${dueDateStr}T23:59:59`);
    if (isNaN(due.getTime())) return false;
    const diffMs = due.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours >= -24 && diffHours <= 24;
  };

  const isRecurring = Boolean(task.recurrence && task.recurrence !== 'none');
  const duration = calculateDuration(task.start_time, task.end_time);
  const isCurrentlyActive = isTaskCurrentlyActive(task.due_date, task.start_time, task.end_time, task.completed);

  return (
    <li
      draggable={!isEditing}
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
      className={`p-4 transition-all duration-200 hover:bg-gray-50/90 dark:hover:bg-dark-600/50 select-none relative group border-l-4 ${
        task.priority === 'high'
          ? 'border-l-red-500'
          : task.priority === 'medium'
          ? 'border-l-amber-500'
          : 'border-l-emerald-500'
      } ${task.completed ? 'opacity-60 bg-gray-50/30 dark:bg-dark-800/20' : ''} ${
        isCurrentlyActive ? 'bg-primary-50/30 dark:bg-primary-950/20 shadow-xs ring-1 ring-primary-500/30' : ''
      } ${
        isDragging
          ? 'opacity-30 bg-primary-50 dark:bg-primary-950/20 border-2 border-dashed border-primary-500 rounded-xl'
          : ''
      }`}
    >
      {isEditing ? (
        <form onSubmit={handleSave} className="space-y-3">
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-600 border border-gray-200 dark:border-dark-500 rounded-lg text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <select
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value as Priority)}
              className="px-2.5 py-1.5 bg-gray-50 dark:bg-dark-600 border border-gray-200 dark:border-dark-500 rounded-lg text-xs dark:text-gray-200"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <select
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value as Category)}
              className="px-2.5 py-1.5 bg-gray-50 dark:bg-dark-600 border border-gray-200 dark:border-dark-500 rounded-lg text-xs dark:text-gray-200"
            >
              <option value="General">General</option>
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
              <option value="Urgent">Urgent</option>
              <option value="Health">Health</option>
              <option value="Finance">Finance</option>
            </select>
            <select
              value={editRecurrence}
              onChange={(e) => setEditRecurrence(e.target.value as Recurrence)}
              className="px-2.5 py-1.5 bg-gray-50 dark:bg-dark-600 border border-gray-200 dark:border-dark-500 rounded-lg text-xs dark:text-gray-200"
            >
              <option value="none">No Recurrence</option>
              <option value="daily">🔁 Daily</option>
              <option value="weekly">🔁 Weekly</option>
              <option value="monthly">🔁 Monthly</option>
            </select>
            <input
              type="date"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
              className="px-2.5 py-1.5 bg-gray-50 dark:bg-dark-600 border border-gray-200 dark:border-dark-500 rounded-lg text-xs dark:text-gray-200"
              title="Due date"
            />
          </div>

          {/* Time Slot Editing */}
          <div className="p-2.5 bg-gray-50 dark:bg-dark-700/80 rounded-lg border border-gray-200 dark:border-dark-600 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-gray-500 dark:text-gray-400 font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-primary-500" /> Time:
            </span>
            <div className="flex items-center gap-1.5 flex-grow sm:flex-grow-0">
              <span className="text-[11px] text-gray-400">Start</span>
              <input
                type="time"
                value={editStartTime}
                onChange={(e) => setEditStartTime(e.target.value)}
                className="px-2 py-1 bg-white dark:bg-dark-600 border border-gray-200 dark:border-dark-500 rounded text-xs dark:text-gray-200"
              />
            </div>
            <div className="flex items-center gap-1.5 flex-grow sm:flex-grow-0">
              <span className="text-[11px] text-gray-400">End</span>
              <input
                type="time"
                value={editEndTime}
                onChange={(e) => setEditEndTime(e.target.value)}
                className="px-2 py-1 bg-white dark:bg-dark-600 border border-gray-200 dark:border-dark-500 rounded text-xs dark:text-gray-200"
              />
            </div>
            {(editStartTime || editEndTime) && (
              <button
                type="button"
                onClick={() => {
                  setEditStartTime('');
                  setEditEndTime('');
                }}
                className="text-[11px] text-red-500 hover:underline ml-auto"
              >
                Clear
              </button>
            )}
          </div>

          <div>
            <textarea
              rows={2}
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Task notes / description (optional)"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-600 border border-gray-200 dark:border-dark-500 rounded-lg text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary-500 resize-y"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 bg-gray-200 dark:bg-dark-600 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium flex items-center gap-1 hover:bg-gray-300 dark:hover:bg-dark-500"
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-primary-500 text-white rounded-lg text-xs font-medium flex items-center gap-1 hover:bg-primary-600"
            >
              <Save className="w-3.5 h-3.5" /> Save Changes
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-start gap-2.5 sm:gap-3 min-w-0 w-full">
          {/* Drag Handle & Checkbox */}
          <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
            <div
              className="cursor-grab active:cursor-grabbing text-slate-300 dark:text-gray-600 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors p-1"
              title="Drag to reorder task"
            >
              <GripVertical className="w-4 h-4" />
            </div>

            <button
              onClick={() => onToggleComplete(task.id)}
              className={`w-6 h-6 sm:w-5 sm:h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
                task.completed
                  ? 'bg-emerald-600 border-emerald-600 text-white scale-105'
                  : 'border-slate-300 dark:border-gray-500 hover:border-emerald-600'
              }`}
              title={
                task.completed
                  ? 'Mark as pending'
                  : isRecurring
                  ? 'Complete & Auto-Renew for next cycle'
                  : 'Mark as completed'
              }
            >
              {task.completed && <Check className="w-4 h-4 sm:w-3.5 sm:h-3.5 stroke-[3]" />}
            </button>
          </div>

          <div className="flex-grow space-y-2 min-w-0">
            {/* Title row with Action buttons directly inline at top-right */}
            <div className="flex items-start justify-between gap-2 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                <p
                  className={`text-sm sm:text-base font-semibold leading-snug transition-all break-words min-w-0 ${
                    task.completed
                      ? 'line-through text-slate-400 dark:text-gray-500'
                      : 'text-slate-800 dark:text-gray-100'
                  }`}
                >
                  {task.text}
                </p>

                {isCurrentlyActive && (
                  <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-xs animate-pulse">
                    <Play className="w-2.5 h-2.5 fill-white" /> Active Now
                  </span>
                )}

                {isRecurring && !task.completed && (
                  <span
                    className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-[11px] px-2 py-0.5 rounded-full font-semibold border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-1"
                    title={getRenewalHint(task.recurrence, task.due_date)}
                  >
                    <Repeat className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    {formatRecurrence(task.recurrence)}
                  </span>
                )}

                {task.streak !== undefined && task.streak > 0 && (
                  <span
                    className="bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 text-[11px] px-2 py-0.5 rounded-full font-bold border border-amber-200 dark:border-amber-800/50 flex items-center gap-1 shadow-2xs"
                    title={`Completed ${task.streak} time${task.streak > 1 ? 's' : ''} consecutively!`}
                  >
                    <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                    {task.streak} streak
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 shrink-0 opacity-90 group-hover:opacity-100 transition-opacity self-start">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 sm:p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-600 transition-colors"
                  title="Edit Task & Timing"
                >
                  <Edit2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                </button>
                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="p-2 sm:p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  title="Delete Task"
                >
                  <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                </button>
              </div>
            </div>

            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {getPriorityBadge(task.priority)}
              {getCategoryBadge(task.category)}

              {/* Timing Badge (Start & End Time) */}
              {(task.start_time || task.end_time) && (
                <span
                  className={`text-[11px] flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border font-semibold transition-colors ${
                    isCurrentlyActive
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-100 border-emerald-300 dark:border-emerald-600 font-bold'
                      : task.completed
                      ? 'text-slate-400 dark:text-gray-400 bg-slate-50 dark:bg-dark-800/50 border-slate-200 dark:border-dark-600'
                      : 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700/60'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-300 shrink-0" />
                  {task.start_time && task.end_time ? (
                    <>
                      <span>
                        {formatTimeString(task.start_time)} – {formatTimeString(task.end_time)}
                      </span>
                      {duration && (
                        <span className="text-[10px] text-emerald-700/80 dark:text-emerald-300/90 font-medium">
                          ({duration})
                        </span>
                      )}
                    </>
                  ) : task.start_time ? (
                    <span>From {formatTimeString(task.start_time)}</span>
                  ) : (
                    <span>Until {formatTimeString(task.end_time)}</span>
                  )}
                </span>
              )}

              {task.due_date && (
                <span
                  className={`text-[11px] flex items-center gap-1 px-2 py-0.5 rounded-md border font-medium transition-colors ${
                    isDueSoon(task.due_date, task.completed)
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/60 font-semibold'
                      : 'text-slate-500 dark:text-gray-400 bg-slate-50 dark:bg-dark-800 border-slate-200 dark:border-dark-600'
                  }`}
                >
                  <Calendar className="w-3 h-3 text-slate-400" />
                  Due: {task.due_date}
                </span>
              )}

              {isDueSoon(task.due_date, task.completed) && (
                <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-[11px] px-2 py-0.5 rounded-md font-semibold border border-amber-300 dark:border-amber-800/60 flex items-center gap-1 animate-pulse">
                  <Timer className="w-3 h-3 text-amber-600" /> Due soon
                </span>
              )}

              {task.completed && isRecurring && (
                <span className="text-[11px] text-emerald-700 dark:text-emerald-300 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/40 font-medium">
                  <Sparkles className="w-3 h-3 text-emerald-500" /> Cycle completed & renewed
                </span>
              )}
            </div>

            {/* Task Notes Display */}
            {task.notes && (
              <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50/90 dark:bg-dark-800/80 border border-slate-200/80 dark:border-dark-600/80 text-xs text-slate-700 dark:text-gray-200 flex items-start gap-2">
                <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="whitespace-pre-wrap break-words leading-relaxed text-[11px] sm:text-xs text-slate-700 dark:text-gray-300">
                    {task.notes}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </li>
  );
}


