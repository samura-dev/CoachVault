import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const sd_predefinedExercises = [
  // Грудь
  'Жим лежа', 'Жим гантелей лежа', 'Жим на наклонной скамье', 'Сведение рук в кроссовере', 'Отжимания на брусьях', 'Сведение рук в тренажере (Бабочка)',
  // Спина
  'Подтягивания', 'Тяга штанги в наклоне', 'Тяга верхнего блока', 'Тяга нижнего блока', 'Тяга гантели к поясу', 'Пулловер с гантелью',
  // Ноги
  'Приседания со штангой', 'Жим ногами', 'Выпады с гантелями', 'Болгарские сплит-приседания', 'Сгибание ног в тренажере', 'Разгибание ног в тренажере', 'Мертвая тяга (на прямых ногах)', 'Подъем на икры',
  // Плечи
  'Армейский жим', 'Жим гантелей сидя', 'Махи гантелями в стороны', 'Махи гантелями перед собой', 'Отведения рук в тренажере (задняя дельта)', 'Тяга штанги к подбородку',
  // Руки (Бицепс/Трицепс)
  'Подъем штанги на бицепс', 'Молотки с гантелями', 'Подъем гантелей на бицепс с супинацией', 'Французский жим', 'Разгибание рук на блоке', 'Разгибание руки с гантелью из-за головы',
  // Пресс
  'Скручивания', 'Планка', 'Подъем ног в висе', 'Русская скрутка', 'Молитва на блоке'
];

export const Sd_ExerciseAutocomplete: React.FC<Props> = ({ value, onChange, placeholder = "Название упражнения" }) => {
  const [sd_isOpen, setSd_IsOpen] = useState(false);
  const sd_wrapperRef = useRef<HTMLDivElement>(null);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sd_wrapperRef.current && !sd_wrapperRef.current.contains(event.target as Node)) {
        setSd_IsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sd_filteredOptions = value?.trim() === ''
    ? sd_predefinedExercises
    : sd_predefinedExercises.filter(ex => 
        ex.toLowerCase().includes(value.toLowerCase())
      );

  return (
    <div className="relative flex-1" ref={sd_wrapperRef}>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setSd_IsOpen(true);
        }}
        onFocus={() => setSd_IsOpen(true)}
        className="w-full text-lg font-bold text-zinc-900 bg-transparent outline-none placeholder:text-zinc-300 tracking-tight"
        placeholder={placeholder}
      />

      <AnimatePresence>
        {sd_isOpen && sd_filteredOptions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-xl border border-zinc-200/50 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] z-50 overflow-hidden max-h-60 overflow-y-auto custom-scrollbar"
          >
            <ul className="py-2">
              {sd_filteredOptions.map((option, idx) => (
                <li
                  key={idx}
                  onClick={() => {
                    onChange(option);
                    setSd_IsOpen(false);
                  }}
                  className="px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-rose-50 hover:text-rose-600 cursor-pointer transition-colors"
                >
                  {/* Highlight matching text logic */}
                  {value ? (
                    (() => {
                      const regex = new RegExp(`(${value})`, 'gi');
                      const parts = option.split(regex);
                      return parts.map((part, i) => 
                        regex.test(part) ? <span key={i} className="text-zinc-950 bg-rose-100 rounded-sm px-0.5">{part}</span> : part
                      );
                    })()
                  ) : (
                    option
                  )}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
