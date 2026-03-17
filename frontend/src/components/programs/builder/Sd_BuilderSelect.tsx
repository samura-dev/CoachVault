import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Sd_BuilderSelect: React.FC<Props> = ({ value, onChange, options, placeholder = 'Выберите...' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-12 px-4 bg-white/70 backdrop-blur-sm border border-zinc-200/60 rounded-2xl flex items-center justify-between text-sm transition-all hover:bg-white hover:border-zinc-300 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-400 font-medium shadow-sm"
      >
        <span className={selectedOption ? 'text-zinc-900 font-semibold' : 'text-zinc-400'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, type: "spring", stiffness: 400, damping: 30 }}
            className="absolute z-[200] top-full left-0 w-full mt-2 bg-white/95 backdrop-blur-2xl border border-zinc-200/50 rounded-[1.5rem] shadow-[0_16px_40px_-8px_rgba(0,0,0,0.2)] overflow-hidden py-2 p-1"
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-3 flex items-center justify-between text-sm hover:bg-zinc-100/80 rounded-xl transition-all text-left"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <span className={`font-semibold ${value === option.value ? 'text-rose-500' : 'text-zinc-700'}`}>
                  {option.label}
                </span>
                {value === option.value && <Check className="w-4 h-4 text-rose-500" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
