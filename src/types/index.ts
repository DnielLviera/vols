export type ThemeMode = 'light' | 'dark';

export type CategoryType = 'standard' | 'tithe';

export interface Category {
  id: string;
  name: string;
  percentage: number; // e.g., 50 for 50%
  color: string; // hex code or Tailwind class identifier
  type: CategoryType;
  icon?: string;
  isDefault?: boolean;
}

export type MovementType = 'income' | 'expense' | 'tithe_payment';

export interface Movement {
  id: string;
  amount: number;
  type: MovementType;
  categoryId?: string; // Target category for expense or distribution
  titheDeducted?: number;
  allocations?: Record<string, number>; // Distribution applied to categories (income only)
  paymentMethod?: 'fisico' | 'pago_movil' | 'transferencia' | 'otro';
  date: string; // YYYY-MM-DD
  description?: string;
  createdAt: string; // ISO string timestamp
}

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

export interface AppSettings {
  titheEnabled: boolean;
  tithePercentage: number; // default 10
}
