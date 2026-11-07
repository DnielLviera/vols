export const parseAmount = (value: string): number => {
  const normalized = value.replace(',', '.');
  const parsed = Number.parseFloat(normalized);

  if (Number.isNaN(parsed)) return 0;
  return Math.round(parsed * 100) / 100;
};

export const formatAmount = (value: number | string): string => {
  const amount = typeof value === 'string' ? parseAmount(value) : value;

  if (!Number.isFinite(amount)) return '0.00';

  return amount.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const getTodayISO = (): string => {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');

  return `${now.getFullYear()}-${month}-${day}`;
};
