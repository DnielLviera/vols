import React from 'react';
import { Sun, Moon, Wallet } from 'lucide-react';
import { useFinanceStore } from '../store/useFinanceStore';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useFinanceStore();

  return (
    <header className="sticky top-0 z-40 w-full px-4 py-3 glass-panel backdrop-blur-xl border-b border-white/20 dark:border-slate-800/60 shadow-sm transition-colors duration-300">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 shadow-md shadow-amber-500/20">
            <Wallet className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
              Mis Finanzas
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Control Personal & Categorías
            </p>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          aria-label="Cambiar tema"
          className="p-2.5 rounded-xl glass-input text-slate-700 dark:text-slate-200 hover:bg-white/40 dark:hover:bg-slate-800/80 active:scale-95 transition-all duration-200 cursor-pointer shadow-sm"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-700" />
          )}
        </button>
      </div>
    </header>
  );
};
