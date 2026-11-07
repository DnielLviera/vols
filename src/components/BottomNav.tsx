import React from 'react';
import { LayoutDashboard, ArrowLeftRight, StickyNote, Settings } from 'lucide-react';
import { useFinanceStore } from '../store/useFinanceStore';

interface NavItem {
  id: 'dashboard' | 'movements' | 'notes' | 'settings';
  label: string;
  icon: React.ElementType;
}

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useFinanceStore();

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'movements', label: 'Historial', icon: ArrowLeftRight },
    { id: 'notes', label: 'Notas', icon: StickyNote },
    { id: 'settings', label: 'Ajustes', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-2 pointer-events-none">
      <div className="max-w-md mx-auto glass-panel rounded-2xl border border-white/30 dark:border-slate-800/80 shadow-2xl backdrop-blur-2xl px-3 py-2 pointer-events-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'text-amber-500 dark:text-amber-400 font-semibold scale-105 bg-amber-500/10 dark:bg-amber-400/10'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 active:scale-95'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
