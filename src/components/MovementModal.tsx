import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useFinanceStore } from '../store/useFinanceStore';
import { NumericKeypad } from './NumericKeypad';
import { formatAmount, getTodayISO, parseAmount } from '../utils/finance';

interface MovementModalProps {
  open: boolean;
  onClose: () => void;
}

type MovementType = 'income' | 'expense';

export const MovementModal: React.FC<MovementModalProps> = ({ open, onClose }) => {
  const { settings, categories, updateSettings, addMovement } = useFinanceStore();
  const [type, setType] = useState<MovementType>('income');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(getTodayISO());
  const [description, setDescription] = useState('');
  const [titheEnabled, setTitheEnabled] = useState(settings.titheEnabled);

  if (!open) return null;

  const parsedAmount = parseAmount(amount);
  const canSubmit = parsedAmount > 0 && (type === 'income' || Boolean(categoryId));
  const expenseCategories = categories.filter((category) => category.type !== 'tithe');

  const handleSubmit = () => {
    if (parsedAmount <= 0) return;

    if (type === 'income') {
      addMovement({
        amount: parsedAmount,
        type: 'income',
        date: getTodayISO(),
        description: description.trim() || undefined,
      });
    } else if (categoryId) {
      addMovement({
        amount: parsedAmount,
        type: 'expense',
        categoryId,
        date,
        description: description.trim() || undefined,
      });
    }

    onClose();
  };

  const toggleTithe = (checked: boolean) => {
    setTitheEnabled(checked);
    updateSettings({ titheEnabled: checked });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md rounded-t-3xl border border-white/40 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-5 pb-8 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Nuevo movimiento
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-xl bg-slate-100 dark:bg-slate-800 p-2 text-slate-600 dark:text-slate-300 transition-transform duration-100 active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 dark:bg-slate-800 p-1">
          <button
            type="button"
            onClick={() => setType('income')}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors duration-200 ${
              type === 'income'
                ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Ingreso
          </button>
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors duration-200 ${
              type === 'expense'
                ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Egreso
          </button>
        </div>

        <div className="glass-card mb-4 rounded-2xl p-4">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Monto
            </span>
            <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {formatAmount(amount) || '0.00'}
            </span>
          </div>

          {type === 'income' && (
            <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
              <input
                type="checkbox"
                checked={titheEnabled}
                onChange={(event) => toggleTithe(event.target.checked)}
                className="h-4 w-4 accent-amber-500"
              />
              Apartar 10% para el diezmo
            </label>
          )}

          {type === 'income' && settings.titheEnabled && parsedAmount > 0 && (
            <div className="mt-3 space-y-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Diezmo (10%)</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  {formatAmount((parsedAmount * settings.tithePercentage) / 100)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Restante para categorías</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {formatAmount(parsedAmount - (parsedAmount * settings.tithePercentage) / 100)}
                </span>
              </div>
            </div>
          )}
        </div>

        <NumericKeypad
          value={amount}
          onChange={setAmount}
          onAccept={handleSubmit}
          disabled={!canSubmit}
        />

        {type === 'expense' && (
          <div className="mt-4 space-y-3 rounded-2xl bg-slate-100 dark:bg-slate-800 p-3">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
              Categoría
            </label>
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100"
            >
              <option value="">Selecciona una categoría</option>
              {expenseCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
              Fecha
            </label>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100"
            />

            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
              Descripción (opcional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Ej: compra ropa, préstamo, pago servicios..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100"
            />
          </div>
        )}
      </div>
    </div>
  );
};
