import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TaskFlow - Next.js Supabase Task Manager',
  description: 'Organize your day with style using Next.js 15, TypeScript, and Supabase.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-50/90 dark:bg-gradient-to-br dark:from-dark-900 dark:to-dark-800 text-slate-800 dark:text-gray-200 min-h-screen transition-colors duration-300 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
