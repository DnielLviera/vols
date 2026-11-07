import React from 'react';

interface NumericKeypadProps {
  value: string;
  onChange: (value: string) => void;
  onAccept?: () => void;
  disabled?: boolean;
}

interface KeyAction {
  id: string;
  label: React.ReactNode;
  className: string;
  onClick: () => void;
}

export const NumericKeypad: React.FC<NumericKeypadProps> = ({
  value,
  onChange,
  onAccept,
  disabled = false,
}) => {
  const clear = () => onChange('');
  const backspace = () => onChange(value.slice(0, -1));
  const appendDigit = (digit: string) => onChange(value + digit);
  const appendDecimal = () => {
    if (value.includes(',')) return;
    onChange(value + ',');
  };
  const appendDoubleZero = () => onChange(value + '00');

  const keys: KeyAction[] = [
    { id: 'clear', label: 'C', className: 'bg-red-500/10 text-red-600 dark:text-red-400', onClick: clear },
    { id: 'backspace', label: '⌫', className: 'bg-slate-200/70 dark:bg-slate-700/70 text-slate-700 dark:text-slate-200', onClick: backspace },
    { id: 'decimal', label: ',', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', onClick: appendDecimal },
    { id: 'double-zero', label: '00', className: 'bg-slate-200/70 dark:bg-slate-700/70 text-slate-700 dark:text-slate-200', onClick: appendDoubleZero },
    { id: '1', label: '1', className: 'bg-white/70 dark:bg-slate-700/70 text-slate-800 dark:text-slate-100', onClick: () => appendDigit('1') },
    { id: '2', label: '2', className: 'bg-white/70 dark:bg-slate-700/70 text-slate-800 dark:text-slate-100', onClick: () => appendDigit('2') },
    { id: '3', label: '3', className: 'bg-white/70 dark:bg-slate-700/70 text-slate-800 dark:text-slate-100', onClick: () => appendDigit('3') },
    { id: '4', label: '4', className: 'bg-white/70 dark:bg-slate-700/70 text-slate-800 dark:text-slate-100', onClick: () => appendDigit('4') },
    { id: '5', label: '5', className: 'bg-white/70 dark:bg-slate-700/70 text-slate-800 dark:text-slate-100', onClick: () => appendDigit('5') },
    { id: '6', label: '6', className: 'bg-white/70 dark:bg-slate-700/70 text-slate-800 dark:text-slate-100', onClick: () => appendDigit('6') },
    { id: '7', label: '7', className: 'bg-white/70 dark:bg-slate-700/70 text-slate-800 dark:text-slate-100', onClick: () => appendDigit('7') },
    { id: '8', label: '8', className: 'bg-white/70 dark:bg-slate-700/70 text-slate-800 dark:text-slate-100', onClick: () => appendDigit('8') },
    { id: '9', label: '9', className: 'bg-white/70 dark:bg-slate-700/70 text-slate-800 dark:text-slate-100', onClick: () => appendDigit('9') },
    { id: '0', label: '0', className: 'bg-white/70 dark:bg-slate-700/70 text-slate-800 dark:text-slate-100', onClick: () => appendDigit('0') },
  ];

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-800/70 px-4 py-3 text-right text-3xl font-bold text-slate-900 dark:text-slate-100 shadow-inner">
        {value ? value : '0'}
      </div>

      <div className="grid grid-cols-4 gap-2.5">
        {keys.map((key) => (
          <button
            key={key.id}
            type="button"
            onClick={key.onClick}
            className={`h-12 rounded-xl text-lg font-bold transition-transform duration-100 active:scale-95 ${key.className}`}
          >
            {key.label}
          </button>
        ))}
      </div>

      {onAccept && (
        <button
          type="button"
          onClick={onAccept}
          disabled={disabled}
          className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 py-3 text-base font-bold text-slate-950 shadow-lg shadow-amber-500/30 transition-transform duration-100 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
        >
          Aceptar
        </button>
      )}
    </div>
  );
};
