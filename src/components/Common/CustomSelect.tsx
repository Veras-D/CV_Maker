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
      style={{
        WebkitAppearance: 'none',
        MozAppearance: 'none',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 0.65rem center',
        backgroundSize: '0.85em 0.85em',
        paddingRight: '2rem'
      }}
      className={`w-full bg-slate-800 hover:bg-slate-750 text-slate-100 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-sky-500 cursor-pointer shadow-sm transition-colors ${className}`}
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
