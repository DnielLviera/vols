import React, { useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, PiggyBank, Wallet, X } from 'lucide-react';
import { useFinanceStore } from '../store/useFinanceStore';
import { formatAmount } from '../utils/finance';
import type { Movement } from '../types';

type DetailState = { type: 'category'; categoryId: string } | { type: 'month'; month: string };

export const Dashboard: React.FC = () => {
  const {
    categories,
    categoryBalances,
    categoryEntered,
    categorySpent,
    movements,
    titheAccumulated,
  } = useFinanceStore();

  const [detail, setDetail] = useState<DetailState | null>(null);

  const standardCategories = useMemo(
    () => categories.filter((category) => category.type === 'standard'),
    [categories]
  );

  const totalBalance = useMemo(
    () =>
      standardCategories.reduce(
        (total, category) => total + (categoryBalances[category.id] ?? 0),
        0
      ),
    [standardCategories, categoryBalances]
  );

  const currentMonth = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const monthMovements = useMemo(
    () => movements.filter((movement) => movement.date.startsWith(currentMonth)),
    [movements, currentMonth]
  );

  const monthlyIncome = useMemo(
    () => monthMovements.filter((m) => m.type === 'income').reduce((t, m) => t + m.amount, 0),
    [monthMovements]
  );

  const monthlyExpense = useMemo(
    () => monthMovements.filter((m) => m.type === 'expense').reduce((t, m) => t + m.amount, 0),
    [monthMovements]
  );

  const selectedCategory =
    detail?.type === 'category'
      ? categories.find((c) => c.id === detail.categoryId) ?? null
      : null;

  const detailMovements = useMemo(() => {
    if (detail?.type === 'category') {
      return movements.filter(
        (m) => m.type === 'expense' && m.categoryId === detail.categoryId
      );
    }
    if (detail?.type === 'month') {
      return movements.filter((m) => m.date.startsWith(detail.month));
    }
    return [] as Movement[];
  }, [detail, movements]);

  const closeDetail = () => setDetail(null);

  const renderMovementList = (items: Movement[], emptyText: string) => (
    <div className="space-y-2 max-h-[50vh] overflow-y-auto">
      {items.length === 0 && (
        <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">{emptyText}</p>
      )}
      {items.map((movement) => (
        <div
          key={movement.id}
          className="flex items-center justify-between gap-3 rounded-xl bg-slate-100 dark:bg-slate-800/70 p-3"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
              {movement.description || movement.type}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{movement.date}</p>
          </div>
          <p className="shrink-0 text-sm font-bold text-slate-900 dark:text-slate-100">
            {formatAmount(movement.amount)}
          </p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="glass-card relative overflow-hidden rounded-3xl p-5">
        <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-amber-400/10 dark:bg-amber-400/5 blur-2xl" />
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Balance total
            </p>
            <h2 className="mt-1 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {formatAmount(totalBalance)}
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Disponible después de asignaciones y diezmo
            </p>
          </div>
          <div className="rounded-2xl bg-amber-500/15 p-3 text-amber-600 dark:text-amber-400">
            <Wallet className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setDetail({ type: 'month', month: currentMonth })}
          className="glass-card rounded-3xl p-4 text-left transition-transform duration-100 active:scale-95"
        >
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-emerald-500/15 p-2 text-emerald-600 dark:text-emerald-400">
              <ArrowDownLeft className="h-4 w-4" />
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Ingresos del mes
            </p>
          </div>
          <p className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">
            {formatAmount(monthlyIncome)}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setDetail({ type: 'month', month: currentMonth })}
          className="glass-card rounded-3xl p-4 text-left transition-transform duration-100 active:scale-95"
        >
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-red-500/15 p-2 text-red-600 dark:text-red-400">
              <ArrowUpRight className="h-4 w-4" />
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Egresos del mes
            </p>
          </div>
          <p className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">
            {formatAmount(monthlyExpense)}
          </p>
        </button>
      </div>

      <div className="glass-card rounded-3xl p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-amber-500/15 p-2.5 text-amber-600 dark:text-amber-400">
            <PiggyBank className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Diezmo acumulado
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Por pagar / Diezmo</p>
          </div>
          <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
            {formatAmount(titheAccumulated)}
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Distribución por categorías
        </h3>

        {standardCategories.map((category) => {
          const entered = categoryEntered[category.id] ?? 0;
          const spent = categorySpent[category.id] ?? 0;
          const remaining = categoryBalances[category.id] ?? 0;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => setDetail({ type: 'category', categoryId: category.id })}
              className="glass-card w-full rounded-2xl p-4 text-left transition-transform duration-100 active:scale-95"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {category.name}
                    </p>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {category.percentage}%
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Restante disponible
                  </p>
                  <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {formatAmount(remaining)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Entrado</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {formatAmount(entered)}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Gastado</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {formatAmount(spent)}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {detail?.type === 'month' && detail.month && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={closeDetail}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-md rounded-t-3xl border border-white/40 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-5 pb-8 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Movimientos del mes
              </h2>
              <button
                type="button"
                onClick={closeDetail}
                aria-label="Cerrar"
                className="rounded-xl bg-slate-100 dark:bg-slate-800 p-2 text-slate-600 dark:text-slate-300 transition-transform duration-100 active:scale-95"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {renderMovementList(monthMovements, 'No hay movimientos registrados en este mes.')}
          </div>
        </div>
      )}

      {detail?.type === 'category' && selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={closeDetail}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-md rounded-t-3xl border border-white/40 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-5 pb-8 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {selectedCategory.name}
              </h2>
              <button
                type="button"
                onClick={closeDetail}
                aria-label="Cerrar"
                className="rounded-xl bg-slate-100 dark:bg-slate-800 p-2 text-slate-600 dark:text-slate-300 transition-transform duration-100 active:scale-95"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="glass-card mb-4 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Entrado
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {formatAmount(categoryEntered[selectedCategory.id] ?? 0)}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Gastado
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {formatAmount(categorySpent[selectedCategory.id] ?? 0)}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Restante
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {formatAmount(categoryBalances[selectedCategory.id] ?? 0)}
                </span>
              </div>
            </div>
            {renderMovementList(
              detailMovements,
              'No hay egresos registrados para esta categoría.'
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
