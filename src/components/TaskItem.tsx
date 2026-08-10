'use client';

import React, { useState } from 'react';
import { Check, Edit2, Trash2, Calendar, Tag, Save, X, GripVertical, Clock } from 'lucide-react';
import { Task, Priority, Category } from '@/types/todo';

interface TaskItemProps {
  task: Task;
  index: number;
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, newText: string, priority: Priority, category: Category, dueDate?: string) => void;
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editText.trim()) return;

    onUpdateTask(task.id, editText.trim(), editPriority, editCategory, editDueDate || undefined);
    setIsEditing(false);
  };

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case 'high':
        return <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs px-2 py-0.5 rounded-md font-medium border border-red-200 dark:border-red-800/50">High</span>;
      case 'medium':
        return <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs px-2 py-0.5 rounded-md font-medium border border-amber-200 dark:border-amber-800/50">Medium</span>;
      case 'low':
        return <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs px-2 py-0.5 rounded-md font-medium border border-blue-200 dark:border-blue-800/50">Low</span>;
    }
  };

  const getCategoryBadge = (c: Category) => {
    return (
      <span className="bg-gray-100 dark:bg-dark-600 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
        <Tag className="w-3 h-3 text-primary-500" /> {c}
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
            <input
              type="date"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
              className="px-2.5 py-1.5 bg-gray-50 dark:bg-dark-600 border border-gray-200 dark:border-dark-500 rounded-lg text-xs dark:text-gray-200"
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3 flex-grow">
            {/* Drag Handle */}
            <div
              className="mt-1 cursor-grab active:cursor-grabbing text-gray-300 dark:text-gray-600 hover:text-primary-500 dark:hover:text-primary-400 transition-colors p-0.5"
              title="Drag to reorder task"
            >
              <GripVertical className="w-4 h-4" />
            </div>

            <button
              onClick={() => onToggleComplete(task.id)}
              className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                task.completed
                  ? 'bg-emerald-500 border-emerald-500 text-white scale-105'
                  : 'border-gray-300 dark:border-gray-500 hover:border-emerald-500'
              }`}
              title={task.completed ? 'Mark as pending' : 'Mark as completed'}
            >
              {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </button>

            <div className="flex-grow space-y-1.5">
              <p
                className={`text-sm font-semibold leading-snug transition-all ${
                  task.completed
                    ? 'line-through text-gray-400 dark:text-gray-500'
                    : 'text-gray-800 dark:text-gray-100'
                }`}
              >
                {task.text}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                {getPriorityBadge(task.priority)}
                {getCategoryBadge(task.category)}
                {task.due_date && (
                  <span
                    className={`text-[11px] flex items-center gap-1 px-2 py-0.5 rounded-md border font-medium transition-colors ${
                      isDueSoon(task.due_date, task.completed)
                        ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700/60 font-semibold'
                        : 'text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-dark-800 border-gray-200/80 dark:border-dark-600'
                    }`}
                  >
                    <Calendar className="w-3 h-3 text-gray-400" />
                    Due: {task.due_date}
                  </span>
                )}
                {isDueSoon(task.due_date, task.completed) && (
                  <span className="bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 text-[11px] px-2 py-0.5 rounded-md font-semibold border border-orange-300 dark:border-orange-800/60 flex items-center gap-1 animate-pulse">
                    <Clock className="w-3 h-3 text-orange-500" /> Due soon
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 self-end sm:self-center opacity-90 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors"
              title="Edit Task"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDeleteTask(task.id)}
              className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              title="Delete Task"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
