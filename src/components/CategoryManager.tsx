import React, { useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { useFinanceStore } from '../store/useFinanceStore';
import type { Category, CategoryType } from '../types';

export const CategoryManager: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useFinanceStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [percentage, setPercentage] = useState('10');
  const [color, setColor] = useState('#10b981');
  const [type, setType] = useState<CategoryType>('standard');

  const openAdd = () => {
    setEditingId(null);
    setName('');
    setPercentage('10');
    setColor('#10b981');
    setType('standard');
    setIsFormOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditingId(category.id);
    setName(category.name);
    setPercentage(`${category.percentage}`);
    setColor(category.color);
    setType(category.type);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setName('');
    setPercentage('10');
    setColor('#10b981');
    setType('standard');
  };

  const save = () => {
    const parsedPercentage = Number(percentage);

    if (!name.trim() || !Number.isFinite(parsedPercentage) || parsedPercentage <= 0) return;

    const categoryData = {
      name: name.trim(),
      percentage: parsedPercentage,
      color,
      type,
    };

    if (editingId) {
      updateCategory(editingId, categoryData);
    } else {
      addCategory(categoryData);
    }

    closeForm();
  };

  const remove = (id: string) => {
    deleteCategory(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Categorías</h2>
        <button
          type="button"
          onClick={openAdd}
          className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-3 py-2 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/30 transition-transform duration-100 active:scale-95"
        >
          <span className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            Nueva
          </span>
        </button>
      </div>

      <div className="space-y-2.5">
        {categories.map((category) => (
          <div
            key={category.id}
            className="glass-card rounded-2xl p-4"
          >
            <div className="flex items-center gap-3">
              <span
                className="h-3.5 w-3.5 shrink-0 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {category.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {category.type === 'tithe' ? 'Diezmo' : 'Categoría'} · {category.percentage}%
                </p>
              </div>
              <button
                type="button"
                onClick={() => openEdit(category)}
                aria-label={`Editar ${category.name}`}
                className="rounded-xl bg-slate-100 dark:bg-slate-800 p-2 text-slate-600 dark:text-slate-300 transition-transform duration-100 active:scale-95"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => remove(category.id)}
                disabled={category.isDefault}
                aria-label={`Eliminar ${category.name}`}
                className="rounded-xl bg-red-500/10 p-2 text-red-600 dark:text-red-400 transition-transform duration-100 active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={closeForm}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-md rounded-t-3xl border border-white/40 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-5 pb-8 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {editingId ? 'Editar categoría' : 'Nueva categoría'}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                aria-label="Cerrar"
                className="rounded-xl bg-slate-100 dark:bg-slate-800 p-2 text-slate-600 dark:text-slate-300 transition-transform duration-100 active:scale-95"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                Nombre
              </label>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ej: Caridad, Educación, Salud..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100"
              />

              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                Porcentaje
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={percentage}
                onChange={(event) => setPercentage(event.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100"
              />

              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={color}
                  onChange={(event) => setColor(event.target.value)}
                  className="h-11 w-14 cursor-pointer rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1"
                />
                <span className="text-sm text-slate-600 dark:text-slate-300">{color}</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={!name.trim() || Number(percentage) <= 0}
                  className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-3 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-40 disabled:pointer-events-none"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
