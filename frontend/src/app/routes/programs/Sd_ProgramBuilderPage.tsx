import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { sd_pb } from '../../../lib/sd_pocketbase';
import { Sd_AddExerciseModal } from '../../../components/programs/Sd_AddExerciseModal';
import { ArrowLeft, Plus, GripVertical, Trash2, Edit2, Loader2, Clock } from 'lucide-react';
import type { sd_ProgramExerciseRecord, sd_ProgramRecord, sd_ProgramWorkoutRecord } from '../../../types/sd_types';

export const Sd_ProgramBuilderPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [program, setProgram] = useState<sd_ProgramRecord | null>(null);
  const [activeWorkoutId, setActiveWorkoutId] = useState<string | null>(null);

  const fetchProgramData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const record = await sd_pb.collection('programs').getOne<sd_ProgramRecord>(id, {
        expand: 'program_workouts_via_program_id.program_exercises_via_workout_id'
      });
      setProgram(record);
    } catch (err) {
      console.error(err);
      navigate('/programs');
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchProgramData();
  }, [fetchProgramData]);

  const handleAddWorkout = async () => {
    try {
      const workouts = program?.expand?.['program_workouts_via_program_id'] || [];
      const newDayIndex = workouts.length + 1;

      await sd_pb.collection('program_workouts').create({
        program_id: id,
        name: `День ${newDayIndex}`,
        day_number: newDayIndex
      });
      fetchProgramData();
    } catch (err) {
      console.error(err);
      alert('Ошибка при добавлении тренировочного дня');
    }
  };

  if (isLoading || !program) {
    return (
      <div className="w-full h-[80vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const workouts = (program.expand?.['program_workouts_via_program_id'] || []).sort((a: sd_ProgramWorkoutRecord, b: sd_ProgramWorkoutRecord) => a.day_number - b.day_number);

  return (
    <div className="w-full h-full space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4"
      >
        <button
          onClick={() => navigate('/programs')}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors w-max"
        >
          <ArrowLeft className="w-4 h-4" /> К списку программ
        </button>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{program.name}</h1>
            <p className="text-gray-500 mt-1 max-w-2xl">{program.description || 'Без описания'}</p>
            <div className="flex items-center gap-3 mt-4 text-sm font-semibold text-gray-600">
              <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg flex items-center gap-1">
                <Clock className="w-4 h-4" /> {program.duration_weeks} недель
              </span>
              <span className="bg-gray-100 px-2 py-1 rounded-lg">
                В этой программе {workouts.length} тренировок
              </span>
            </div>
          </div>

          <button
            onClick={handleAddWorkout}
            className="h-11 px-6 bg-gray-900 hover:bg-black text-white rounded-xl font-medium shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Добавить тренировку
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
        {workouts.map((workout: sd_ProgramWorkoutRecord) => {
          const exercises = (workout.expand?.['program_exercises_via_workout_id'] || []).sort((a: sd_ProgramExerciseRecord, b: sd_ProgramExerciseRecord) => a.order - b.order);

          return (
            <motion.div
              key={workout.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden flex flex-col"
            >
              {/* Workout Header */}
              <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                    {workout.day_number}
                  </div>
                  <h3 className="font-bold text-gray-900">{workout.name}</h3>
                </div>
                <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Exercises List */}
              <div className="p-4 flex-1 space-y-3">
                {exercises.length === 0 ? (
                  <div className="text-center py-6 text-sm text-gray-500 border-2 border-dashed border-gray-100 rounded-xl">
                    Нет упражнений. <br />Нажмите + добавить
                  </div>
                ) : (
                  exercises.map((ex: sd_ProgramExerciseRecord) => (
                    <div key={ex.id} className="group relative flex items-center bg-white border border-gray-100 rounded-xl p-3 hover:border-gray-300 hover:shadow-sm transition-all">
                      <GripVertical className="absolute left-0 w-4 h-4 text-transparent group-hover:text-gray-300 cursor-grab" />
                      <div className="pl-3 flex-1 flex flex-col">
                        <span className="font-bold text-sm text-gray-900 break-words">{ex.exercise_name}</span>
                        <div className="flex items-center gap-3 mt-1.5 text-xs font-semibold text-gray-500">
                          <span className="bg-gray-100 px-1.5 py-0.5 rounded">{ex.sets} подх.</span>
                          <span>{ex.reps}</span>
                          {ex.rest_time && <span className="text-gray-400">• Отдых: {ex.rest_time}</span>}
                        </div>
                      </div>
                      <button className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add Exercise Button */}
              <div className="p-4 border-t border-gray-50 bg-white">
                <button
                  onClick={() => setActiveWorkoutId(workout.id)}
                  className="w-full py-2.5 bg-gray-50 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 border border-transparent hover:border-indigo-100"
                >
                  <Plus className="w-4 h-4" /> Упражнение
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <Sd_AddExerciseModal
        isOpen={!!activeWorkoutId}
        onClose={() => setActiveWorkoutId(null)}
        workoutId={activeWorkoutId || ''}
        currentExercisesCount={
          activeWorkoutId
            ? (workouts.find((w: sd_ProgramWorkoutRecord) => w.id === activeWorkoutId)?.expand?.['program_exercises_via_workout_id']?.length || 0)
            : 0
        }
        onSuccess={() => {
          fetchProgramData();
        }}
      />
    </div>
  );
};
