import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, GripVertical, Plus } from 'lucide-react';
import { sd_useProgramBuilderStore } from '../../../stores/sd_useProgramBuilderStore';
import type { sd_ExerciseData } from '../../../stores/sd_useProgramBuilderStore';
import { sd_useAuthStore } from '../../../stores/sd_useAuthStore';
import { Sd_ExerciseAutocomplete } from './Sd_ExerciseAutocomplete';

interface Props {
  workoutId: string;
  exercise: sd_ExerciseData;
}

export const Sd_BuilderExerciseCard: React.FC<Props> = ({ workoutId, exercise }) => {
  const { sd_user } = sd_useAuthStore();
  const updateExerciseName = sd_useProgramBuilderStore(state => state.sd_updateExerciseName);
  const removeExercise = sd_useProgramBuilderStore(state => state.sd_removeExercise);
  const addSet = sd_useProgramBuilderStore(state => state.sd_addSet);
  const removeSet = sd_useProgramBuilderStore(state => state.sd_removeSet);
  const updateSetField = sd_useProgramBuilderStore(state => state.sd_updateSetField);

  // Достаем кастомные колонки из профиля (если есть) или берем стандартные
  const customColumns: string[] = Array.isArray(sd_user?.custom_set_columns) 
    ? sd_user.custom_set_columns 
    : [];
  
  const columns = ['reps', 'weight', ...customColumns];
  const colLabels: Record<string, string> = { reps: 'Повторения', weight: 'Вес (кг)' };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="bg-white/60 backdrop-blur-md border border-zinc-200/60 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden group/exercise"
    >
      {/* Header */}
      <div className="flex items-center gap-2 p-2.5 sm:p-4 bg-zinc-50/80 backdrop-blur-sm border-b border-zinc-200/50">
        <div className="cursor-grab text-zinc-400 hover:text-zinc-600 active:cursor-grabbing transition-colors flex-none">
          <GripVertical className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <Sd_ExerciseAutocomplete
            value={exercise.name}
            onChange={(val) => updateExerciseName(workoutId, exercise.id, val)}
          />
        </div>
        <button
          onClick={() => removeExercise(workoutId, exercise.id)}
          className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-white rounded-xl transition-all opacity-0 group-hover/exercise:opacity-100 shadow-sm border border-transparent hover:border-zinc-200/50 flex-none"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Sets Table */}
      <div className="p-2.5 sm:p-4 overflow-x-auto custom-scrollbar">
        <table className="w-full text-xs text-left">
          <thead className="text-[10px] sm:text-xs text-zinc-400 uppercase tracking-wider bg-transparent">
            <tr>
              <th className="py-2 font-bold w-12 text-center">Сет</th>
              {columns.map(col => (
                <th key={col} className="py-2 px-1 text-center font-bold break-words">{colLabels[col] || col}</th>
              ))}
              <th className="py-2 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {exercise.sets.map((set, setIdx) => (
              <tr key={set.id} className="border-t border-zinc-100/50 group/set transition-colors hover:bg-zinc-50/50">
                <td className="py-1 text-center text-zinc-500 font-bold">
                  {setIdx + 1}
                </td>
                {columns.map(col => (
                  <td key={col} className="py-1 px-1">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={set[col] || ''}
                      onChange={(e) => updateSetField(workoutId, exercise.id, set.id, col, e.target.value)}
                      className="w-full min-w-[3rem] text-center py-1.5 px-2 bg-zinc-100/50 border border-transparent rounded-lg focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-500/10 outline-none transition-all font-semibold text-zinc-900 placeholder:text-zinc-300 shadow-sm"
                      placeholder="—"
                    />
                  </td>
                ))}
                <td className="py-1 text-right">
                  <button
                    onClick={() => removeSet(workoutId, exercise.id, set.id)}
                    className="p-1.5 text-zinc-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors opacity-100 sm:opacity-0 sm:group-hover/set:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          onClick={() => addSet(workoutId, exercise.id)}
          className="mt-4 text-sm font-bold text-rose-500 hover:text-rose-600 flex items-center justify-center gap-1.5 transition-all px-4 py-3 hover:bg-rose-50 rounded-xl w-full border border-dashed border-transparent hover:border-rose-200"
        >
          <Plus className="w-4 h-4" /> Добавить подход
        </button>
      </div>
    </motion.div>
  );
};
