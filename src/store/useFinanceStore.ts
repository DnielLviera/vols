import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings, Category, Movement, Note, ThemeMode } from '../types';

interface FinanceState {
  // Theme
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;

  // Settings
  settings: AppSettings;
  toggleTitheEnabled: () => void;
  updateSettings: (settings: Partial<AppSettings>) => void;

  // Categories
  categories: Category[];
  categoryBalances: Record<string, number>;
  categoryEntered: Record<string, number>;
  categorySpent: Record<string, number>;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Active Tab / View navigation
  activeTab: 'dashboard' | 'movements' | 'notes' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'movements' | 'notes' | 'settings') => void;

  // Movements / Transactions
  movements: Movement[];
  addMovement: (movement: Omit<Movement, 'id' | 'createdAt'>) => void;
  deleteMovement: (id: string) => void;

  // Tithe accumulated balance tracking (resets to 0 when paid)
  titheAccumulated: number;
  payTithe: (amount: number, paymentMethod: 'fisico' | 'pago_movil' | 'transferencia' | 'otro', description?: string) => void;

  // Notes
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'updatedAt'>) => void;
  updateNote: (id: string, title: string, content: string) => void;
  deleteNote: (id: string) => void;
}

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'tithe-default',
    name: 'Diezmo',
    percentage: 10,
    color: '#f59e0b', // Ámbar / Dorado
    type: 'tithe',
    isDefault: true,
  },
  {
    id: 'necesidades-default',
    name: 'Necesidades',
    percentage: 50,
    color: '#ef4444', // Rojo suave
    type: 'standard',
    isDefault: true,
  },
  {
    id: 'deseos-default',
    name: 'Deseos',
    percentage: 30,
    color: '#a855f7', // Rosa / Morado suave
    type: 'standard',
    isDefault: true,
  },
  {
    id: 'ahorros-default',
    name: 'Ahorros / Inversión',
    percentage: 20,
    color: '#3b82f6', // Azul suave
    type: 'standard',
    isDefault: true,
  },
];

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      toggleTheme: () => {
        const nextTheme = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: nextTheme });
        if (typeof document !== 'undefined') {
          if (nextTheme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },
      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== 'undefined') {
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },

      settings: {
        titheEnabled: true,
        tithePercentage: 10,
      },
      toggleTitheEnabled: () =>
        set((state) => ({
          settings: { ...state.settings, titheEnabled: !state.settings.titheEnabled },
        })),
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      categories: DEFAULT_CATEGORIES,
      categoryBalances: {
        'tithe-default': 0,
        'necesidades-default': 0,
        'deseos-default': 0,
        'ahorros-default': 0,
      },
      categoryEntered: {
        'tithe-default': 0,
        'necesidades-default': 0,
        'deseos-default': 0,
        'ahorros-default': 0,
      },
      categorySpent: {
        'tithe-default': 0,
        'necesidades-default': 0,
        'deseos-default': 0,
        'ahorros-default': 0,
      },
      addCategory: (categoryData) => {
        const newCategory = { ...categoryData, id: `cat-${Date.now()}` };

        return set((state) => ({
          categories: [...state.categories, newCategory],
          categoryBalances: { ...state.categoryBalances, [newCategory.id]: 0 },
          categoryEntered: { ...state.categoryEntered, [newCategory.id]: 0 },
          categorySpent: { ...state.categorySpent, [newCategory.id]: 0 },
        }));
      },
      updateCategory: (id, categoryData) =>
        set((state) => ({
          categories: state.categories.map((cat) =>
            cat.id === id ? { ...cat, ...categoryData } : cat
          ),
        })),
      deleteCategory: (id) =>
        set((state) => {
          const nextBalances = { ...state.categoryBalances };
          const nextEntered = { ...state.categoryEntered };
          const nextSpent = { ...state.categorySpent };
          delete nextBalances[id];
          delete nextEntered[id];
          delete nextSpent[id];

          return {
            categories: state.categories.filter((cat) => cat.id !== id && !cat.isDefault),
            categoryBalances: nextBalances,
            categoryEntered: nextEntered,
            categorySpent: nextSpent,
          };
        }),

      activeTab: 'dashboard',
      setActiveTab: (activeTab) => set({ activeTab }),

      movements: [],
      titheAccumulated: 0,

      addMovement: (movementData) => {
        const id = `mov-${Date.now()}`;
        const createdAt = new Date().toISOString();
        const newMovement: Movement = { ...movementData, id, createdAt };

        if (movementData.type === 'income') {
          const { titheEnabled, tithePercentage } = get().settings;
          const titheAmount = titheEnabled ? (movementData.amount * tithePercentage) / 100 : 0;
          const remainingAmount = movementData.amount - titheAmount;
          const allocations: Record<string, number> = {};

          const standardCategories = get().categories.filter(
            (category) => category.type === 'standard'
          );
          let allocatedTotal = 0;

          for (const category of standardCategories) {
            const allocation = (remainingAmount * category.percentage) / 100;
            allocations[category.id] = allocation;
            allocatedTotal += allocation;
          }

          const lastCategory = standardCategories[standardCategories.length - 1];
          if (lastCategory) {
            allocations[lastCategory.id] = (allocations[lastCategory.id] ?? 0) + (remainingAmount - allocatedTotal);
          }

          const movementWithTithe: Movement = {
            ...newMovement,
            titheDeducted: titheAmount,
            allocations,
          };

          set((state) => ({
            movements: [movementWithTithe, ...state.movements],
            titheAccumulated: state.titheAccumulated + titheAmount,
            categoryBalances: Object.fromEntries(
              Object.entries(state.categoryBalances).map(([categoryId, balance]) => [
                categoryId,
                balance + (allocations[categoryId] ?? 0),
              ])
            ),
            categoryEntered: Object.fromEntries(
              Object.entries(state.categoryEntered).map(([categoryId, entered]) => [
                categoryId,
                entered + (allocations[categoryId] ?? 0),
              ])
            ),
          }));
        } else {
          const categoryId = movementData.categoryId;
          const category = categoryId
            ? get().categories.find((item) => item.id === categoryId)
            : undefined;
          const shouldUpdateBalance =
            Boolean(categoryId) && Boolean(category) && category?.type !== 'tithe';

          set((state) => ({
            movements: [newMovement, ...state.movements],
            categoryBalances:
              shouldUpdateBalance && categoryId
                ? {
                    ...state.categoryBalances,
                    [categoryId]: (state.categoryBalances[categoryId] ?? 0) - movementData.amount,
                  }
                : state.categoryBalances,
            categorySpent:
              shouldUpdateBalance && categoryId
                ? {
                    ...state.categorySpent,
                    [categoryId]: (state.categorySpent[categoryId] ?? 0) + movementData.amount,
                  }
                : state.categorySpent,
          }));
        }
      },

      deleteMovement: (id) =>
        set((state) => {
          const movement = state.movements.find((item) => item.id === id);

          if (!movement) {
            return { movements: state.movements };
          }

          const nextMovements = state.movements.filter((item) => item.id !== id);

          if (movement.type === 'income') {
            const nextBalances = { ...state.categoryBalances };
            const nextEntered = { ...state.categoryEntered };

            for (const [categoryId, amount] of Object.entries(movement.allocations ?? {})) {
              nextBalances[categoryId] = (nextBalances[categoryId] ?? 0) - amount;
              nextEntered[categoryId] = Math.max(0, (nextEntered[categoryId] ?? 0) - amount);
            }

            return {
              movements: nextMovements,
              categoryBalances: nextBalances,
              categoryEntered: nextEntered,
              titheAccumulated: Math.max(0, state.titheAccumulated - (movement.titheDeducted ?? 0)),
            };
          }

          if (movement.type === 'expense' && movement.categoryId) {
            const category = state.categories.find((item) => item.id === movement.categoryId);

            if (category && category.type !== 'tithe') {
              return {
                movements: nextMovements,
                categoryBalances: {
                  ...state.categoryBalances,
                  [movement.categoryId]:
                    (state.categoryBalances[movement.categoryId] ?? 0) + movement.amount,
                },
                categorySpent: {
                  ...state.categorySpent,
                  [movement.categoryId]: Math.max(
                    0,
                    (state.categorySpent[movement.categoryId] ?? 0) - movement.amount
                  ),
                },
              };
            }
          }

          return { movements: nextMovements };
        }),

      payTithe: (amount, paymentMethod, description = 'Pago de Diezmo') => {
        const id = `mov-${Date.now()}`;
        const createdAt = new Date().toISOString();
        const today = new Date().toISOString().split('T')[0];

        const titheMovement: Movement = {
          id,
          amount,
          type: 'tithe_payment',
          categoryId: 'tithe-default',
          paymentMethod,
          date: today,
          description,
          createdAt,
        };

        set((state) => ({
          movements: [titheMovement, ...state.movements],
          // Reset the tithe wallet after payment
          titheAccumulated: 0,
        }));
      },

      notes: [
        {
          id: 'note-1',
          title: 'Bienvenido a tu control financiero',
          content: 'Usa este espacio para anotar presupuestos pendientes, metas o recordatorios importantes.',
          updatedAt: new Date().toISOString(),
        },
      ],
      addNote: (noteData) =>
        set((state) => ({
          notes: [
            {
              ...noteData,
              id: `note-${Date.now()}`,
              updatedAt: new Date().toISOString(),
            },
            ...state.notes,
          ],
        })),
      updateNote: (id, title, content) =>
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, title, content, updatedAt: new Date().toISOString() } : n
          ),
        })),
      deleteNote: (id) =>
        set((state) => ({
          notes: state.notes.filter((n) => n.id !== id),
        })),
    }),
    {
      name: 'finanzas-personales-storage',
    }
  )
);
