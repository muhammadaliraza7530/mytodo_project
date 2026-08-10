'use client';

import React, { useState, useEffect } from 'react';
import { X, Database, Copy, Check, ExternalLink, RefreshCw, Key } from 'lucide-react';
import { getSupabaseConfig, resetSupabaseClient, SUPABASE_SQL_SCHEMA } from '@/lib/supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function SupabaseConfigModal({ isOpen, onClose, onSaved }: SupabaseConfigModalProps) {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'sql'>('config');

  useEffect(() => {
    if (isOpen) {
      const config = getSupabaseConfig();
      setUrl(config.url || '');
      setKey(config.key || '');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && key.trim()) {
      localStorage.setItem('custom_supabase_url', url.trim());
      localStorage.setItem('custom_supabase_key', key.trim());
    } else {
      localStorage.removeItem('custom_supabase_url');
      localStorage.removeItem('custom_supabase_key');
    }
    resetSupabaseClient();
    onSaved();
    onClose();
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-dark-700 rounded-2xl shadow-2xl border border-gray-200 dark:border-dark-600 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gray-50 dark:bg-dark-800 border-b border-gray-100 dark:border-dark-600 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-500">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Supabase Integration</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Configure database connection or copy SQL schema</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-dark-600 bg-gray-50/50 dark:bg-dark-800/50 px-5 pt-3">
          <button
            onClick={() => setActiveTab('config')}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'config'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            API Credentials
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'sql'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            SQL Schema setup
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {activeTab === 'config' ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-500" /> Supabase Project URL
                </label>
                <input
                  type="url"
                  placeholder="https://xyzproject.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-dark-600 border border-gray-200 dark:border-dark-500 rounded-xl text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-emerald-500" /> Supabase Anon / Public Key
                </label>
                <textarea
                  rows={3}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-dark-600 border border-gray-200 dark:border-dark-500 rounded-xl text-xs font-mono text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                💡 <strong>Note:</strong> You can set these in <code className="bg-emerald-100 dark:bg-emerald-900/50 px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="bg-emerald-100 dark:bg-emerald-900/50 px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> environment variables, or enter them here. If disconnected, local storage mode is active automatically!
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-100 dark:bg-dark-600 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-medium hover:bg-gray-200 dark:hover:bg-dark-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-md"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Save Credentials
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Execute this SQL statement inside your Supabase project&apos;s SQL Editor to create the <code className="bg-gray-100 dark:bg-dark-600 px-1 py-0.5 rounded text-emerald-500 font-semibold">tasks</code> table:
              </p>
              <div className="relative">
                <pre className="p-3.5 bg-dark-900 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto max-h-56 leading-relaxed border border-dark-700">
                  {SUPABASE_SQL_SCHEMA}
                </pre>
                <button
                  onClick={handleCopySql}
                  className="absolute top-2.5 right-2.5 p-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg text-xs flex items-center gap-1 shadow"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy SQL
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
