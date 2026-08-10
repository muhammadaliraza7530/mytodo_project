'use client';

import React from 'react';
import { Keyboard, X, Search, Plus, CornerDownLeft, Ban } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    {
      key: 'N',
      description: 'Quickly focus the New Task input field',
      icon: Plus,
    },
    {
      key: '/',
      description: 'Focus the Search tasks input bar',
      icon: Search,
    },
    {
      key: 'Esc',
      description: 'Close active modals, alert popups, or clear search focus',
      icon: Ban,
    },
    {
      key: 'Enter',
      description: 'Submit task form when typing',
      icon: CornerDownLeft,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-dark-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary-500/10 text-primary-500 rounded-2xl border border-primary-500/20">
              <Keyboard className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Keyboard Shortcuts
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Navigate TaskFlow faster with key commands
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

        {/* Shortcuts List */}
        <div className="py-5 space-y-3">
          {shortcuts.map((sc) => {
            const Icon = sc.icon;
            return (
              <div
                key={sc.key}
                className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-dark-700/60 border border-gray-200/80 dark:border-dark-600 rounded-2xl"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-200/60 dark:bg-dark-600 text-gray-700 dark:text-gray-300 rounded-xl">
                    <Icon className="w-4 h-4 text-primary-500" />
                  </div>
                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                    {sc.description}
                  </span>
                </div>
                <kbd className="px-3 py-1.5 bg-white dark:bg-dark-600 border border-gray-300 dark:border-dark-500 rounded-xl text-xs font-bold text-gray-800 dark:text-white shadow-xs font-mono">
                  {sc.key}
                </kbd>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-100 dark:border-dark-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
