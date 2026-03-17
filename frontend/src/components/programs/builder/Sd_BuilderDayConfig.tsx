import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Copy } from 'lucide-react';
import { sd_useProgramBuilderStore } from '../../../stores/sd_useProgramBuilderStore';
import type { sd_WorkoutDayData } from '../../../stores/sd_useProgramBuilderStore';
import { Sd_BuilderExerciseCard } from './Sd_BuilderExerciseCard';

interface Props {
  workout: sd_WorkoutDayData;
  index: number;
}

export const Sd_BuilderDayConfig: React.FC<Props> = ({ workout, index }) => {
  const updateWorkoutName = sd_useProgramBuilderStore(state => state.sd_updateWorkoutName);
  const removeWorkout = sd_useProgramBuilderStore(state => state.sd_removeWorkout);
  const duplicateWorkout = sd_useProgramBuilderStore(state => state.sd_duplicateWorkout);
  const addExercise = sd_useProgramBuilderStore(state => state.sd_addExercise);

  return (
    <div className="space-y-4 p-2.5 sm:p-6 lg:p-8">
      {/* Day Header */}
      <div className="flex items-center justify-between group/header gap-2">
        <div className="flex items-center gap-2.5 w-full">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-zinc-100/80 backdrop-blur-md flex items-center justify-center rounded-2xl text-zinc-900 font-bold text-lg shadow-sm border border-zinc-200/50 flex-none shrink-0">
            {index + 1}
          </div>
          <input
            type="text"
            value={workout.name}
            onChange={(e) => updateWorkoutName(workout.id, e.target.value)}
            className="text-xl sm:text-2xl font-bold text-zinc-900 bg-transparent border-none outline-none focus:ring-0 placeholder:text-zinc-300 w-full tracking-tight px-0 min-w-0"
            placeholder="Название дня"
          />
        </div>
        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover/header:opacity-100 transition-all duration-300 flex-none">
          <button
            onClick={() => duplicateWorkout(workout.id)}
            className="p-2 sm:p-3 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100/80 rounded-2xl transition-all"
            title="Дублировать день"
          >
            <Copy className="w-5 h-5 flex-none" />
          </button>
          <button
            onClick={() => removeWorkout(workout.id)}
            className="p-2 sm:p-3 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
            title="Удалить день"
          >
            <Trash2 className="w-5 h-5 flex-none" />
          </button>
        </div>
      </div>

      {/* Exercises Canvas */}
      <div className="pl-0 sm:pl-[64px] space-y-5">
        <AnimatePresence>
          {workout.exercises.map((exercise) => (
            <Sd_BuilderExerciseCard 
              key={exercise.id} 
              workoutId={workout.id} 
              exercise={exercise} 
            />
          ))}
        </AnimatePresence>

        <button
          onClick={() => addExercise(workout.id, 'Новое упражнение')}
          className="h-14 w-full bg-zinc-50/50 hover:bg-white border-2 border-dashed border-zinc-200 rounded-2xl flex items-center justify-center gap-2 text-zinc-500 font-semibold transition-all duration-300 hover:border-zinc-300 hover:shadow-sm"
        >
          <Plus className="w-5 h-5" /> Добавить упражнение
        </button>
      </div>
    </div>
  );
};
