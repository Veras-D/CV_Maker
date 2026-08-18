import React, { useState, useEffect } from 'react';
import { DollarSign } from 'lucide-react';
import { CustomSelect, SelectOption } from './CustomSelect';

interface CurrencyInputProps {
  value: string; // e.g. "145,000 USD / yr"
  onChange: (value: string) => void;
  className?: string;
}

const CURRENCY_OPTIONS: SelectOption[] = [
  { value: 'USD / yr', label: 'USD / yr' },
  { value: 'USD / mo', label: 'USD / mo' },
  { value: 'EUR / yr', label: 'EUR / yr' },
  { value: 'EUR / mo', label: 'EUR / mo' },
  { value: 'GBP / yr', label: 'GBP / yr' },
  { value: 'CZK / mo', label: 'CZK / mo' }
];

// Parse value into formatted amount and currency unit
const parseCurrencyValue = (val: string) => {
  if (!val) return { amount: '', currency: 'USD / yr' };
  const clean = val.trim();
  const digitsOnly = clean.replace(/[^\d]/g, '');
  const numPart = digitsOnly ? Number(digitsOnly.slice(0, 9)).toLocaleString('en-US') : '';
  
  const matchedCurr = CURRENCY_OPTIONS.find(opt => clean.toLowerCase().includes(opt.value.toLowerCase()));
  return {
    amount: numPart,
    currency: matchedCurr ? matchedCurr.value : 'USD / yr'
  };
};

export const CustomCurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  className = ''
}) => {
  const initial = parseCurrencyValue(value);
  const [amount, setAmount] = useState(initial.amount);
  const [currency, setCurrency] = useState(initial.currency);

  useEffect(() => {
    const parsed = parseCurrencyValue(value);
    setAmount(parsed.amount);
    if (parsed.currency) setCurrency(parsed.currency);
  }, [value]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip non-digits and limit to max 9 digits (999,999,999)
    const rawDigits = e.target.value.replace(/[^\d]/g, '').slice(0, 9);
    if (!rawDigits) {
      setAmount('');
      onChange('');
      return;
    }
    const formatted = Number(rawDigits).toLocaleString('en-US');
    setAmount(formatted);
    onChange(`${formatted} ${currency}`);
  };

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
    if (amount) {
      onChange(`${amount} ${newCurrency}`);
    }
  };

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {/* Number Amount Input with Auto-formatting */}
      <div className="relative flex-1 min-w-[90px]">
        <DollarSign className="w-3.5 h-3.5 text-emerald-400 absolute left-2 top-2 pointer-events-none" />
        <input
          type="text"
          placeholder="145,000"
          value={amount}
          onChange={handleAmountChange}
          className="w-full bg-slate-800 border border-slate-700 hover:border-slate-600 focus:border-sky-500 rounded-lg pl-6 pr-1.5 py-1.5 text-xs text-emerald-400 font-mono focus:outline-none placeholder:text-slate-500 transition-colors"
        />
      </div>

      {/* Currency Selector */}
      <div className="w-[108px] shrink-0">
        <CustomSelect
          options={CURRENCY_OPTIONS}
          value={currency}
          onChange={handleCurrencyChange}
          className="w-full text-xs"
        />
      </div>
    </div>
  );
};
