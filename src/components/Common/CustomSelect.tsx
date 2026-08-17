import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Lock } from 'lucide-react';

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
  placeholder = "Select...",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-800 hover:bg-slate-750 text-slate-100 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-medium flex items-center justify-between gap-2 shadow-sm focus:outline-none focus:border-sky-500 transition-all"
      >
        <span className="truncate flex items-center gap-1.5">
          {selectedOption ? selectedOption.label : placeholder}
          {selectedOption?.isPro && <Lock className="w-3 h-3 text-amber-400" />}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-full min-w-[160px] bg-slate-900 border border-slate-750 rounded-lg shadow-xl z-50 py-1 overflow-hidden">
          {options.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (option.isPro && onProClick) {
                  onProClick(option.value);
                } else {
                  onChange(option.value);
                }
              }}
              className={`w-full px-3 py-2 text-xs text-left flex items-center justify-between transition-colors ${
                option.value === value 
                  ? 'bg-sky-600/20 text-sky-400 font-semibold' 
                  : 'text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>{option.label}</span>
              {option.isPro && (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono border border-amber-500/30 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  <span>PRO</span>
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
