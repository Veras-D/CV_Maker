import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface CustomDatePickerProps {
  value: string; // Format: 'YYYY-MM-DD'
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  className = '',
  placeholder = 'Select date'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial selected date or fallback to today
  const parseDate = (str: string) => {
    if (!str) return new Date();
    const [year, month, day] = str.split('-').map(Number);
    if (!year || !month || !day) return new Date();
    return new Date(year, month - 1, day);
  };

  const selectedDate = value ? parseDate(value) : null;
  const [viewDate, setViewDate] = useState<Date>(selectedDate || new Date());

  // Keep viewDate in sync when value changes from external updates
  useEffect(() => {
    if (value) {
      setViewDate(parseDate(value));
    }
  }, [value]);

  // Click outside listener to close calendar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const prevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Days calculations
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Helper to format date as 'YYYY-MM-DD'
  const formatDateString = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  const handleSelectDay = (day: number) => {
    const dateStr = formatDateString(year, month, day);
    onChange(dateStr);
    setIsOpen(false);
  };

  const handleSetToday = () => {
    const today = new Date();
    const dateStr = formatDateString(today.getFullYear(), today.getMonth(), today.getDate());
    onChange(dateStr);
    setViewDate(today);
    setIsOpen(false);
  };

  const todayStr = formatDateString(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

  // Generate calendar days
  const calendarCells = [];

  // Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarCells.push({
      day: daysInPrevMonth - i,
      currentMonth: false,
      isPrev: true
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push({
      day: i,
      currentMonth: true
    });
  }

  // Next month leading days to fill grid (35 or 42 cells)
  const remainingCells = (7 - (calendarCells.length % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    calendarCells.push({
      day: i,
      currentMonth: false,
      isNext: true
    });
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      
      {/* Trigger Input Button */}
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

      {/* Calendar Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 bottom-full mb-1 z-[99999] w-64 bg-slate-900 border border-slate-750 rounded-xl p-3 shadow-2xl space-y-2.5 animate-in fade-in zoom-in-95 duration-100">
          
          {/* Header Month / Year Navigation */}
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-bold text-slate-100 font-sans">
              {monthNames[month]} {year}
            </span>

            <button
              type="button"
              onClick={nextMonth}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {dayNames.map((d, i) => (
              <span key={i} className="text-[10px] font-bold text-slate-500 uppercase">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map((cell, idx) => {
              if (!cell.currentMonth) {
                return (
                  <span
                    key={idx}
                    className="h-7 flex items-center justify-center text-[11px] text-slate-600 select-none font-mono"
                  >
                    {cell.day}
                  </span>
                );
              }

              const cellDateStr = formatDateString(year, month, cell.day);
              const isSelected = value === cellDateStr;
              const isToday = todayStr === cellDateStr;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDay(cell.day)}
                  className={`h-7 rounded-lg text-[11px] font-mono flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sky-600 text-white font-bold shadow-md shadow-sky-600/30'
                      : isToday
                      ? 'border border-sky-500/50 text-sky-300 hover:bg-slate-800'
                      : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {/* Footer Shortcuts */}
          <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={handleSetToday}
              className="text-[10px] text-sky-400 hover:text-sky-300 font-semibold hover:underline cursor-pointer"
            >
              Today
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[10px] text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Close
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
