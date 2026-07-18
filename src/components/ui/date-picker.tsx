"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

interface DatePickerProps {
  value?: string;
  onChange?: (date: string) => void;
  className?: string;
  align?: "left" | "right";
}

const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

const DAYS_SHORT = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Convert Sunday(0) to 6, Monday(1) to 0, etc.
}

function formatDate(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function parseDate(dateString?: string) {
  if (!dateString) return new Date();
  const [yyyy, mm, dd] = dateString.split('-');
  return new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd));
}

export function DatePicker({ value, onChange, className = "", align = "left" }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const initialDate = parseDate(value);
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleSelectDate = (day: number) => {
    const selectedDate = new Date(currentYear, currentMonth, day);
    if (onChange) {
      onChange(formatDate(selectedDate));
    }
    setIsOpen(false);
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const days = [];
  // Empty slots for previous month
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
  }
  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    const isSelected = value === formatDate(new Date(currentYear, currentMonth, d));
    const isToday = formatDate(new Date()) === formatDate(new Date(currentYear, currentMonth, d));

    days.push(
      <button
        key={d}
        type="button"
        onClick={() => handleSelectDate(d)}
        className={`h-8 w-8 flex items-center justify-center rounded-full text-sm transition-colors ${
          isSelected
            ? "bg-primary text-white font-bold shadow-sm shadow-primary/30"
            : isToday
            ? "bg-blue-50 dark:bg-blue-500/10 text-primary font-bold hover:bg-blue-100 dark:hover:bg-blue-500/20"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
      >
        {d}
      </button>
    );
  }

  // Formatting display value
  let displayValue = "Sélectionner...";
  if (value) {
    const parsed = parseDate(value);
    displayValue = `${parsed.getDate()} ${MONTHS[parsed.getMonth()]} ${parsed.getFullYear()}`;
  }

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-gray-50 dark:bg-gray-800 text-sm rounded-lg px-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors"
      >
        <span className="text-gray-900 dark:text-white">{displayValue}</span>
        <CalendarIcon className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className={`absolute top-full mt-2 z-50 p-4 bg-white dark:bg-dark-surface rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 w-72 animate-in fade-in zoom-in-95 duration-200 ${align === 'right' ? 'right-0' : 'left-0'}`}>
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="font-bold text-gray-900 dark:text-white text-sm">
              {MONTHS[currentMonth]} {currentYear}
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {DAYS_SHORT.map((day) => (
              <div key={day} className="text-xs font-semibold text-gray-400">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 justify-items-center">
            {days}
          </div>
        </div>
      )}
    </div>
  );
}
