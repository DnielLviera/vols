import React, { useMemo, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  HandCoins,
  Inbox,
  Trash2,
  X,
} from 'lucide-react';
import { useFinanceStore } from '../store/useFinanceStore';
import { formatAmount } from '../utils/finance';
import type { Movement, MovementType } from '../types';

type Filter = 'all' | MovementType;

interface MovementsListProps {
  onAddMovement?: () => void;
}

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'income', label: 'Ingresos' },
  { id: 'expense', label: 'Egresos' },
  { id: 'tithe_payment', label: 'Diezmos' },
];

const TYPE_CONFIG = {
  income: {
    icon: ArrowDownLeft,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/15',
    sign: '+',
    fallback: 'Ingreso',
  },
  expense: {
    icon: ArrowUpRight,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-500/15',
    sign: '-',
    fallback: 'Egreso',
  },
  tithe_payment: {
    icon: HandCoins,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/15',
    sign: '-',
    fallback: 'Pago de diezmo',
  },
} as const;

const formatDate = (iso: string): string => {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;

  return date.toLocaleDateString('es-VE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getMonthKey = (iso: string): string => iso.slice(0, 7);

const formatMonth = (key: string): string => {
  const [year, month] = key.split('-').map(Number);
  const date = new Date(year, month - 1, 1);

  const label = date.toLocaleDateString('es-VE', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
};

export const MovementsList: React.FC<MovementsListProps> = ({ onAddMovement }) => {
  const { movements, categories, deleteMovement } = useFinanceStore();
  const [filter, setFilter] = useState<Filter>('all');
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const filtered = useMemo(
    () => (filter === 'all' ? movements : movements.filter((m) => m.type === filter)),
    [movements, filter]
  );

  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) =>
        a.date === b.date ? b.createdAt.localeCompare(a.createdAt) : b.date.localeCompare(a.date)
      ),
    [filtered]
  );

  const groups = useMemo(() => {
    const result: { key: string; items: Movement[] }[] = [];

    for (const movement of sorted) {
      const key = getMonthKey(movement.date);
      const last = result[result.length - 1];

      if (last && last.key === key) {
        last.items.push(movement);
      } else {
        result.push({ key, items: [movement] });
      }
    }

    return result;
  }, [sorted]);

  const totals = useMemo(
    () =>
      filtered.reduce(
        (acc, movement) => {
          if (movement.type === 'income') acc.income += movement.amount;
          if (movement.type === 'expense') acc.expense += movement.amount;
          if (movement.type === 'tithe_payment') acc.tithe += movement.amount;
          return acc;
        },
        { income: 0, expense: 0, tithe: 0 }
      ),
    [filtered]
  );

  const categoryName = (categoryId?: string): string => {
    if (!categoryId) return 'Sin categoría';
    return categories.find((category) => category.id === categoryId)?.name ?? 'Sin categoría';
  };

  const movementTitle = (movement: Movement): string => {
    if (movement.description) return movement.description;
    if (movement.type === 'expense') return categoryName(movement.categoryId);
    return TYPE_CONFIG[movement.type].fallback;
  };

  const movementSubtitle = (movement: Movement): string => {
    if (movement.type === 'expense') {
      return `${formatDate(movement.date)} · ${categoryName(movement.categoryId)}`;
    }

    return formatDate(movement.date);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Historial</h2>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {filtered.length} {filtered.length === 1 ? 'movimiento' : 'movimientos'}
        </span>
      </div>

      <div className="glass-card grid grid-cols-3 gap-2 rounded-2xl p-3 text-center">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Ingresos
          </p>
          <p className="mt-0.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
            {formatAmount(totals.income)}
          </p>
        </div>
        <div className="border-x border-slate-200/60 dark:border-slate-700/60">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Egresos
          </p>
          <p className="mt-0.5 text-sm font-bold text-red-600 dark:text-red-400">
            {formatAmount(totals.expense)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Diezmos
          </p>
          <p className="mt-0.5 text-sm font-bold text-amber-600 dark:text-amber-400">
            {formatAmount(totals.tithe)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1 rounded-2xl bg-slate-100 dark:bg-slate-800 p-1">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setFilter(item.id);
              setConfirmId(null);
            }}
            className={`rounded-xl px-2 py-1.5 text-xs font-semibold transition-colors duration-200 ${
              filter === item.id
                ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {sorted.length === 0 && (
        <div className="glass-card space-y-3 rounded-3xl p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <Inbox className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {filter === 'all' ? 'Aún no hay movimientos' : 'No hay movimientos en este filtro'}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Registra tu primer ingreso o egreso para verlo aquí.
            </p>
          </div>
          {onAddMovement && (
            <button
              type="button"
              onClick={onAddMovement}
              className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-4 py-2 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/30 transition-transform duration-100 active:scale-95"
            >
              Registrar movimiento
            </button>
          )}
        </div>
      )}

      {groups.map((group) => (
        <div key={group.key} className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {formatMonth(group.key)}
            </p>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              {group.items.length} {group.items.length === 1 ? 'mov.' : 'movs.'}
            </span>
          </div>

          {group.items.map((movement) => {
            const config = TYPE_CONFIG[movement.type];
            const Icon = config.icon;
            const isConfirming = confirmId === movement.id;

            return (
              <div key={movement.id} className="glass-card rounded-2xl p-3">
                <div className="flex items-center gap-3">
                  <div className={`rounded-xl p-2 ${config.bg} ${config.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {movementTitle(movement)}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {movementSubtitle(movement)}
                    </p>
                    {movement.type === 'income' && (movement.titheDeducted ?? 0) > 0 && (
                      <p className="mt-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                        Diezmo apartado: {formatAmount(movement.titheDeducted ?? 0)}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 text-right">
                    <p className={`text-sm font-bold ${config.color}`}>
                      {config.sign}
                      {formatAmount(movement.amount)}
                    </p>

                    {isConfirming ? (
                      <div className="mt-1 flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            deleteMovement(movement.id);
                            setConfirmId(null);
                          }}
                          aria-label="Confirmar eliminación"
                          className="rounded-lg bg-red-500/15 p-1.5 text-red-600 transition-transform duration-100 active:scale-95 dark:text-red-400"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmId(null)}
                          aria-label="Cancelar eliminación"
                          className="rounded-lg bg-slate-200/70 p-1.5 text-slate-500 transition-transform duration-100 active:scale-95 dark:bg-slate-700/70 dark:text-slate-300"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmId(movement.id)}
                        aria-label="Eliminar movimiento"
                        className="mt-1 rounded-lg p-1.5 text-slate-400 transition-colors duration-200 hover:text-red-500 active:scale-95"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default MovementsList;
