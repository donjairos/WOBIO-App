import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC<{ className?: string, showLabel?: boolean }> = ({ className = '', showLabel = false }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center gap-2 p-2 rounded-full transition-colors ${
        theme === 'dark'
          ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      } ${className}`}
      aria-label="Toggle Dark Mode"
    >
      {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      {showLabel && <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
    </button>
  );
};