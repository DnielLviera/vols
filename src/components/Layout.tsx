import React, { useEffect } from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { useFinanceStore } from '../store/useFinanceStore';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { theme } = useFinanceStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 relative overflow-x-hidden transition-colors duration-300 pb-24">
      {/* Glassmorphism Ambient Glow Background Blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] max-w-[300px] h-[50vw] max-h-[300px] rounded-full bg-amber-400/20 dark:bg-amber-500/10 blur-[100px] pointer-events-none" />
      <div className="fixed top-[40%] right-[-10%] w-[60vw] max-w-[350px] h-[60vw] max-h-[350px] rounded-full bg-blue-500/15 dark:bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-5%] left-[20%] w-[55vw] max-w-[320px] h-[55vw] max-h-[320px] rounded-full bg-purple-500/15 dark:bg-purple-600/10 blur-[110px] pointer-events-none" />

      {/* Header */}
      <Header />

      {/* Main Container constrained for Mobile View */}
      <main className="max-w-md mx-auto px-4 pt-4 pb-8 relative z-10">
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};
