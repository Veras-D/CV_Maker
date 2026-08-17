import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
  isPro?: boolean;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  onProClick?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  onProClick,
  className = ""
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedVal = e.target.value;
    const opt = options.find(o => o.value === selectedVal);
    if (opt?.isPro && onProClick) {
      onProClick(selectedVal);
    } else {
      onChange(selectedVal);
    }
  };

  return (
    <select
      value={value}
      onChange={handleChange}
      className={`w-full bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-sky-500 cursor-pointer shadow-sm transition-colors ${className}`}
    >
      {options.map((option) => (
        <option 
          key={option.value} 
          value={option.value} 
          className="bg-slate-900 text-slate-100 py-1"
        >
          {option.label} {option.isPro ? '🔒 [PRO]' : ''}
        </option>
      ))}
    </select>
  );
};
