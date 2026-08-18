import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export interface DatePickerDropdownProps {
  year: number;
  month: number;
  value: string;
  todayStr: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDay: (day: number) => void;
  onSetToday: () => void;
  onClose: () => void;
}

export const DatePickerCalendarDropdown: React.FC<DatePickerDropdownProps> = ({
  year,
  month,
  value,
  todayStr,
  onPrevMonth,
  onNextMonth,
  onSelectDay,
  onSetToday,
  onClose
}) => {
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarCells = [];

  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarCells.push({ day: daysInPrevMonth - i, currentMonth: false });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push({ day: i, currentMonth: true });
  }

  const remainingCells = (7 - (calendarCells.length % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    calendarCells.push({ day: i, currentMonth: false });
  }

  const formatCellStr = (d: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  return (
    <div className="absolute left-0 bottom-full mb-1 z-[99999] w-64 bg-slate-900 border border-slate-750 rounded-xl p-3 shadow-2xl space-y-2.5 animate-in fade-in zoom-in-95 duration-100">
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
        <button
          type="button"
          onClick={onPrevMonth}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="text-xs font-bold text-slate-100 font-sans">
          {MONTH_NAMES[month]} {year}
        </span>

        <button
          type="button"
          onClick={onNextMonth}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {DAY_NAMES.map((d, i) => (
          <span key={i} className="text-[10px] font-bold text-slate-500 uppercase">
            {d}
          </span>
        ))}
      </div>

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

          const cellDateStr = formatCellStr(cell.day);
          const isSelected = value === cellDateStr;
          const isToday = todayStr === cellDateStr;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectDay(cell.day)}
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

      <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between">
        <button
          type="button"
          onClick={onSetToday}
          className="text-[10px] text-sky-400 hover:text-sky-300 font-semibold hover:underline cursor-pointer"
        >
          Today
        </button>

        <button
          type="button"
          onClick={onClose}
          className="text-[10px] text-slate-400 hover:text-slate-200 cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
};
