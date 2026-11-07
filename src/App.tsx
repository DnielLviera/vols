import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { MovementsList } from './components/MovementsList';
import { MovementModal } from './components/MovementModal';
import { FloatingActionButton } from './components/FloatingActionButton';
import { CategoryManager } from './components/CategoryManager';
import { useFinanceStore } from './store/useFinanceStore';

export const App: React.FC = () => {
  const [isMovementOpen, setIsMovementOpen] = useState(false);
  const { activeTab } = useFinanceStore();

  return (
    <Layout>
      {activeTab === 'dashboard' && <Dashboard />}

      {activeTab === 'movements' && (
        <MovementsList onAddMovement={() => setIsMovementOpen(true)} />
      )}

      {activeTab === 'notes' && (
        <div className="glass-card p-6 rounded-3xl text-center space-y-2 animate-fade-in">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Bloc de Notas</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Notas minimalistas y apuntes sobre tus finanzas (Fase 6).
          </p>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="glass-card p-4 rounded-3xl animate-fade-in">
          <CategoryManager />
        </div>
      )}

      <FloatingActionButton onClick={() => setIsMovementOpen(true)} />

      {isMovementOpen && <MovementModal open={isMovementOpen} onClose={() => setIsMovementOpen(false)} />}
    </Layout>
  );
};

export default App;
