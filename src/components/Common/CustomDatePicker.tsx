import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DatePickerCalendarDropdown } from './DatePickerCalendarDropdown';

interface CustomDatePickerProps {
  value: string; // Format: 'YYYY-MM-DD'
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

function parseDate(str: string): Date {
  if (!str) return new Date();
  const [year, month, day] = str.split('-').map(Number);
  if (!year || !month || !day) return new Date();
  return new Date(year, month - 1, day);
}

function formatDateString(y: number, m: number, d: number): string {
  const mm = String(m + 1).padStart(2, '0');
  const dd = String(d).padStart(2, '0');
  return `${y}-${mm}-${dd}`;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  className = '',
  placeholder = 'Select date'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewDate, setViewDate] = useState<Date>(() => parseDate(value));

  useEffect(() => {
    if (value) setViewDate(parseDate(value));
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const today = new Date();
  const todayStr = formatDateString(today.getFullYear(), today.getMonth(), today.getDate());

  const handleSelectDay = (day: number) => {
    onChange(formatDateString(year, month, day));
    setIsOpen(false);
  };

  const handleSetToday = () => {
    onChange(todayStr);
    setViewDate(today);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 focus:border-sky-500 rounded-lg px-3 py-1.5 text-xs text-slate-100 flex items-center justify-between transition-all cursor-pointer focus:outline-none"
      >
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span className="font-mono text-xs">{value || placeholder}</span>
        </div>
      </button>

      {isOpen && (
        <DatePickerCalendarDropdown
          year={year}
          month={month}
          value={value}
          todayStr={todayStr}
          onPrevMonth={() => setViewDate(new Date(year, month - 1, 1))}
          onNextMonth={() => setViewDate(new Date(year, month + 1, 1))}
          onSelectDay={handleSelectDay}
          onSetToday={handleSetToday}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
