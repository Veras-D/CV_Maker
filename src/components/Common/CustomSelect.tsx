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
  const [openUpward, setOpenUpward] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleToggle = () => {
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpward(spaceBelow < 180);
    }
    setIsOpen(!isOpen);
  };

  return (
    <div ref={containerRef} className={`relative inline-block w-full text-left ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        className="w-full bg-slate-800 hover:bg-slate-750 text-slate-100 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-medium flex items-center justify-between gap-1 shadow-sm focus:outline-none focus:border-sky-500 transition-colors"
      >
        <span className="truncate flex items-center gap-1">
          {selectedOption ? selectedOption.label : placeholder}
          {selectedOption?.isPro && <Lock className="w-3 h-3 text-amber-400" />}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className={`absolute left-0 right-0 w-full min-w-[120px] bg-slate-900 border border-slate-750 rounded-lg shadow-xl z-50 py-1 max-h-40 overflow-y-auto ${
            openUpward ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
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
                className={`w-full px-2.5 py-1 text-xs text-left flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'bg-sky-600/20 text-sky-400 font-semibold border-l-2 border-sky-500'
                    : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="truncate">{option.label}</span>
                {option.isPro && (
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded font-mono border border-amber-500/30 flex items-center gap-0.5 shrink-0 ml-1">
                    <Lock className="w-2.5 h-2.5" />
                    <span>PRO</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
