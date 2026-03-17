import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

export interface Sd_SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface Sd_SelectProps {
  value: string | undefined;
  onChange: (value: string) => void;
  options: Sd_SelectOption[];
  placeholder?: string;
  className?: string; // Appears on the trigger
  icon?: React.ReactNode;
  disabled?: boolean;
}

export const Sd_Select = ({
  value,
  onChange,
  options,
  placeholder = 'Выберите...',
  className = '',
  icon,
  disabled = false
}: Sd_SelectProps) => {
  const [sd_isOpen, setSd_IsOpen] = useState(false);
  const sd_containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sd_containerRef.current && !sd_containerRef.current.contains(event.target as Node)) {
        setSd_IsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${disabled ? 'opacity-50 pointer-events-none' : ''}`} ref={sd_containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setSd_IsOpen(!sd_isOpen)}
        className={`w-full flex items-center justify-between text-left h-12 px-4 rounded-xl bg-gray-50 border transition-all outline-none font-medium text-sm
          ${sd_isOpen ? 'bg-white border-[var(--accent)] ring-2 ring-[var(--accent)]/20' : 'border-transparent hover:border-gray-200'}
          ${className}
        `}
      >
        <div className="flex items-center gap-2 truncate">
          {icon && <span className="text-gray-400 shrink-0">{icon}</span>}
          {selectedOption ? (
            <span className="text-gray-900 truncate flex items-center gap-2">
              {selectedOption.icon && <span className="shrink-0">{selectedOption.icon}</span>}
              {selectedOption.label}
            </span>
          ) : (
            <span className="text-gray-400 truncate">{placeholder}</span>
          )}
        </div>
        <motion.div
          animate={{ rotate: sd_isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 20 }}
          className="shrink-0 ml-2"
        >
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </motion.div>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {sd_isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 24 }}
            className="absolute z-50 w-full min-w-[200px] mt-2 bg-white/80 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-xl overflow-hidden py-2"
          >
            <div className="max-h-60 overflow-y-auto custom-scrollbar px-2 space-y-1">
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setSd_IsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 text-sm font-medium rounded-xl flex items-center justify-between transition-colors
                      ${isSelected ? 'bg-orange-50 text-orange-900' : 'text-gray-700 hover:bg-gray-50'}
                    `}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {option.icon && <span className="shrink-0 opacity-80">{option.icon}</span>}
                      <span className="truncate">{option.label}</span>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-orange-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
