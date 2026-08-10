'use client';

import React from 'react';
import {
  Bell,
  BellRing,
  BellOff,
  Volume2,
  VolumeX,
  X,
  CheckCircle2,
  Clock,
  Sparkles,
  Play,
  ShieldCheck,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { Task } from '@/types/todo';
import { formatTimeString, calculateDuration } from '@/lib/timeUtils';
import { getTodayDateString } from '@/lib/notificationUtils';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  permission: NotificationPermission;
  onRequestPermission: () => Promise<void>;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onTestNotification: () => void;
  tasks: Task[];
  notificationLog: { id: string; taskText: string; startTime: string; timestamp: string }[];
}

export function NotificationSettingsModal({
  isOpen,
  onClose,
  permission,
  onRequestPermission,
  soundEnabled,
  onToggleSound,
  onTestNotification,
  tasks,
  notificationLog,
}: NotificationSettingsModalProps) {
  if (!isOpen) return null;

  const todayStr = getTodayDateString();
  const timedTasksToday = tasks.filter((t) => {
    if (t.completed || !t.start_time) return false;
    if (t.due_date) {
      const taskDate = t.due_date.split('T')[0];
      if (taskDate !== todayStr) return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-dark-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary-500/10 text-primary-500 rounded-2xl border border-primary-500/20">
              <Bell className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Start Time Alerts
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Browser notifications & sound alerts when task start time arrives
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-dark-700 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto py-5 space-y-6 flex-1 pr-1">
          {/* Section 1: Browser Native Notifications Status */}
          <div className="bg-gray-50 dark:bg-dark-700/60 border border-gray-200 dark:border-dark-600 rounded-2xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    Desktop Notifications
                  </span>
                  {permission === 'granted' ? (
                    <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs px-2 py-0.5 rounded-full font-bold border border-emerald-500/20 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Enabled
                    </span>
                  ) : permission === 'denied' ? (
                    <span className="bg-red-500/10 text-red-600 dark:text-red-400 text-xs px-2 py-0.5 rounded-full font-bold border border-red-500/20 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Blocked
                    </span>
                  ) : (
                    <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs px-2 py-0.5 rounded-full font-bold border border-amber-500/20">
                      Not Requested
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Receive browser notifications when a scheduled task start time is reached.
                </p>
              </div>

              {permission !== 'granted' && (
                <button
                  onClick={onRequestPermission}
                  className="px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex-shrink-0"
                >
                  Enable
                </button>
              )}
            </div>
          </div>

          {/* Section 2: Sound Chime Toggle */}
          <div className="bg-gray-50 dark:bg-dark-700/60 border border-gray-200 dark:border-dark-600 rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl ${
                  soundEnabled
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : 'bg-gray-200 dark:bg-dark-600 text-gray-400'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Audio Chime Alert
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Play an upbeat audio tone when task start time arrives
                </p>
              </div>
            </div>

            <button
              onClick={onToggleSound}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                soundEnabled ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-dark-600'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform absolute top-0.5 ${
                  soundEnabled ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Section 3: Test Notification Button */}
          <div className="p-4 bg-gradient-to-r from-emerald-500/10 via-primary-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-500" /> Test Notification System
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                Test audio chime, browser popup, and on-screen alert card right now.
              </p>
            </div>
            <button
              onClick={onTestNotification}
              className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 flex-shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Test Alert
            </button>
          </div>

          {/* Section 4: Upcoming Timed Tasks Today */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2.5 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary-500" />
              Today&apos;s Timed Tasks ({timedTasksToday.length})
            </h3>

            {timedTasksToday.length === 0 ? (
              <div className="p-4 bg-gray-50 dark:bg-dark-700/40 rounded-2xl border border-gray-200 dark:border-dark-600 text-center text-xs text-gray-500 dark:text-gray-400">
                No upcoming timed tasks scheduled for today. Add a start time to a task to receive start alerts!
              </div>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {timedTasksToday.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 bg-gray-50 dark:bg-dark-700/50 border border-gray-200 dark:border-dark-600 rounded-xl flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="truncate">
                      <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                        {task.text}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5">
                        {task.category} • Priority: {task.priority}
                      </p>
                    </div>
                    <span className="bg-primary-500/10 text-primary-600 dark:text-primary-300 font-bold px-2 py-1 rounded-lg border border-primary-500/20 whitespace-nowrap">
                      {formatTimeString(task.start_time)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 5: Notification History Log */}
          {notificationLog.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2.5 flex items-center gap-2">
                <BellRing className="w-4 h-4 text-emerald-500" />
                Session Notification History
              </h3>
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {notificationLog.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-xl flex items-center justify-between text-xs text-gray-700 dark:text-gray-300"
                  >
                    <span className="truncate font-medium">🔔 {log.taskText}</span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                      {log.startTime} ({log.timestamp})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-gray-100 dark:border-dark-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-xl transition-all"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
}
