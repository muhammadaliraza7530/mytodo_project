import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseConfig(): { url: string | null; key: string | null } {
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('custom_supabase_url');
    const customKey = localStorage.getItem('custom_supabase_key');
    if (customUrl && customKey) {
      return { url: customUrl, key: customKey };
    }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || null;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || null;

  return { url, key };
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getSupabaseConfig();

  if (!url || !key) {
    return null;
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, key);
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
      return null;
    }
  }

  return supabaseInstance;
}

export function resetSupabaseClient() {
  supabaseInstance = null;
}

export const SUPABASE_SQL_SCHEMA = `-- Run this SQL query in your Supabase SQL Editor to set up the tasks table!

CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    text TEXT NOT NULL,
    completed BOOLEAN DEFAULT false,
    priority VARCHAR(20) DEFAULT 'medium',
    category VARCHAR(50) DEFAULT 'General',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    due_date DATE
);

-- Enable Row Level Security (RLS) or grant public access for demo
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on tasks" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Allow public insert on tasks" ON public.tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on tasks" ON public.tasks FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on tasks" ON public.tasks FOR DELETE USING (true);
`;
