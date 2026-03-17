import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { sd_pb } from '../../../lib/sd_pocketbase';
import { ArrowLeft, Play, Loader2, Save } from 'lucide-react';
import type { sd_ClientProgramRecord, sd_ProgramRecord, sd_ProgramWorkoutRecord, sd_ProgramExerciseRecord } from '../../../types/sd_types';

export const Sd_ClientProgramTrackerPage = () => {
  const { id, programId } = useParams<{ id: string; programId: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [clientProgram, setClientProgram] = useState<sd_ClientProgramRecord | null>(null);
  const [workouts, setWorkouts] = useState<sd_ProgramWorkoutRecord[]>([]);
  const [activeWorkoutDay, setActiveWorkoutDay] = useState<sd_ProgramWorkoutRecord | null>(null);

  // To track inputs
  const [setInputs, setSetInputs] = useState<Record<string, { weight: string; reps: string }>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!id || !programId) return;

    const loadData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const cp = await sd_pb.collection('client_programs').getOne<sd_ClientProgramRecord>(programId, {
          expand: 'program_id,athlete_id'
        });
        setClientProgram(cp);

        const progId = cp.program_id;
        const program = await sd_pb.collection('programs').getOne<sd_ProgramRecord>(progId, {
          filter: `id = "${progId}"`, // Assuming record.program_id refers to progId here
          expand: 'program_workouts_via_program_id.program_exercises_via_workout_id'
        });

        const w = (program.expand?.['program_workouts_via_program_id'] || []).sort((a, b) => a.day_number - b.day_number);
        setWorkouts(w);
      } catch (err) {
        console.error("Error loading tracker data", err);
        setError('Не удалось загрузить программу. Проверьте назначение и доступы.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, programId, navigate]);

  const handleStartWorkout = (workout: sd_ProgramWorkoutRecord) => {
    setActiveWorkoutDay(workout);

    // Initialize empty state for inputs based on expected sets
    const initialInputs: Record<string, { weight: string; reps: string }> = {};
    const exercises = (workout.expand?.['program_exercises_via_workout_id'] || []).sort((a, b) => a.order - b.order);

    exercises.forEach((ex: sd_ProgramExerciseRecord) => {
      for (let i = 1; i <= ex.sets; i++) {
        initialInputs[`${ex.id}-${i}`] = { weight: '', reps: '' };
      }
    });

    setSetInputs(initialInputs);
  };

  const handleInputChange = (exerciseId: string, setNum: number, field: 'weight' | 'reps', value: string) => {
    let sd_nextValue = value;
    if (value !== '') {
      const sd_numeric = Number(value);
      if (Number.isNaN(sd_numeric)) {
        sd_nextValue = '';
      } else {
        sd_nextValue = String(Math.max(0, sd_numeric));
      }
    }
    setSetInputs(prev => ({
      ...prev,
      [`${exerciseId}-${setNum}`]: {
        ...prev[`${exerciseId}-${setNum}`],
        [field]: sd_nextValue
      }
    }));
  };

  const handleSaveWorkout = async () => {
    if (!activeWorkoutDay) return;
    setIsSaving(true);

    try {
      // 1. Create Workout Log
      const workoutLog = await sd_pb.collection('workout_logs').create({
        client_program_id: programId,
        program_workout_id: activeWorkoutDay.id,
        athlete_id: id,
        date: new Date().toISOString(),
        status: 'completed'
      });

      // 2. Create Set Logs
      const exercises = activeWorkoutDay.expand?.['program_exercises_via_workout_id'] || [];
      const setPromises = [];

      for (const ex of exercises) {
        for (let i = 1; i <= ex.sets; i++) {
          const inputs = setInputs[`${ex.id}-${i}`];
          if (inputs?.weight || inputs?.reps) {
            setPromises.push(
              sd_pb.collection('set_logs').create({
                workout_log_id: workoutLog.id,
                exercise_id: ex.id,
                set_number: i,
                weight: Number(inputs.weight) || 0,
                reps: Number(inputs.reps) || 0
              })
            );
          }
        }
      }

      await Promise.all(setPromises);

      alert('Тренировка успешно сохранена!');
      setActiveWorkoutDay(null);
    } catch (err) {
      console.error(err);
      alert('Ошибка при сохранении тренировки');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-[80vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (error || !clientProgram) {
    return (
      <div className="w-full h-[80vh] flex flex-col items-center justify-center text-center gap-4">
        <p className="text-gray-500 font-medium">{error || 'Данные программы не найдены.'}</p>
        <button
          onClick={() => navigate(`/athletes/${id}`)}
          className="px-6 py-2 bg-gray-100 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition-colors"
        >
          Вернуться в профиль клиента
        </button>
      </div>
    );
  }

  const athleteName = clientProgram.expand?.athlete_id?.name || 'Клиент';
  const programName = clientProgram.expand?.program_id?.name || 'Программа';

  return (
    <div className="w-full space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4"
      >
        <button
          onClick={() => {
            if (activeWorkoutDay) setActiveWorkoutDay(null);
            else navigate(`/athletes/${id}`);
          }}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors w-max"
        >
          <ArrowLeft className="w-4 h-4" /> {activeWorkoutDay ? 'К списку тренировок' : 'В профиль клиента'}
        </button>

        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{programName}</h1>
          <p className="text-gray-500 mt-1">Отслеживание для: <span className="font-semibold text-gray-700">{athleteName}</span></p>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {!activeWorkoutDay ? (
          <motion.div
            key="overview"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {workouts.map(workout => {
              const exercisesCount = workout.expand?.['program_exercises_via_workout_id']?.length || 0;
              return (
                <div key={workout.id} className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm flex flex-col items-start justify-between">
                  <div>
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-lg mb-4">
                      {workout.day_number}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{workout.name}</h3>
                    <p className="text-gray-500 text-sm font-medium">{exercisesCount} упражнений</p>
                  </div>
                  <button
                    onClick={() => handleStartWorkout(workout)}
                    className="mt-8 w-full py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" /> Начать логгинг
                  </button>
                </div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="player"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="w-full bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col lg:flex-row gap-0"
          >
            {/* Player Sidebar / Info */}
            <div className="w-full lg:w-[350px] bg-gray-50 p-8 border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl mb-6 shadow-inner">
                  {activeWorkoutDay.day_number}
                </div>
                <h2 className="text-2xl font-black text-gray-900 leading-tight mb-2">
                  {activeWorkoutDay.name}
                </h2>
                <p className="text-gray-500 font-medium">Заполните фактические веса и количество повторений, выполненных клиентом.</p>
              </div>

              <div className="mt-12">
                <button
                  onClick={handleSaveWorkout}
                  disabled={isSaving}
                  className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Завершить и Сохранить
                </button>
              </div>
            </div>

            {/* Exercises List */}
            <div className="flex-1 p-8 bg-white">
              <div className="space-y-8">
                {(activeWorkoutDay.expand?.['program_exercises_via_workout_id'] || []).sort((a, b) => a.order - b.order).map((ex: sd_ProgramExerciseRecord, idx: number) => (
                  <div key={ex.id} className="relative">
                    {/* Connect line between exercises */}
                    {idx !== 0 && (
                      <div className="absolute -top-8 left-4 w-px h-8 bg-gray-200" />
                    )}

                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0 z-10 box-content border-4 border-white">
                        {idx + 1}
                      </div>
                      <div className="flex-1 space-y-4 pt-1">
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">{ex.exercise_name}</h4>
                          <p className="text-sm font-semibold text-gray-500 mt-1">
                            План: {ex.sets} подх. × {ex.reps} {ex.rest_time ? `• Отдых: ${ex.rest_time}` : ''}
                          </p>
                        </div>

                        {/* Sets Data Entry */}
                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3">
                          <div className="grid grid-cols-12 gap-2 pb-2 border-b border-gray-200 text-xs font-bold text-gray-400 uppercase tracking-wider px-2">
                            <div className="col-span-2">Сет</div>
                            <div className="col-span-5 text-center">Вес (кг)</div>
                            <div className="col-span-5 text-center">Факт повторов</div>
                          </div>

                          {Array.from({ length: ex.sets }).map((_, i) => (
                            <div key={i} className="grid grid-cols-12 gap-3 items-center">
                              <div className="col-span-2 pl-2 font-bold text-gray-500">{i + 1}</div>
                              <div className="col-span-5">
                                  <input
                                    type="number"
                                  min="0"
                                    placeholder="0"
                                    value={setInputs[`${ex.id}-${i + 1}`]?.weight || ''}
                                    onChange={(e) => handleInputChange(ex.id, i + 1, 'weight', e.target.value)}
                                    className="w-full bg-white h-10 rounded-lg text-center font-bold text-gray-900 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-gray-300"
                                  />
                              </div>
                              <div className="col-span-5">
                                <input
                                  type="number"
                                  min="0"
                                  placeholder={ex.reps.split('-')[0] || "0"}
                                  value={setInputs[`${ex.id}-${i + 1}`]?.reps || ''}
                                  onChange={(e) => handleInputChange(ex.id, i + 1, 'reps', e.target.value)}
                                  className="w-full bg-white h-10 rounded-lg text-center font-bold text-gray-900 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-gray-300"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {(activeWorkoutDay.expand?.['program_exercises_via_workout_id']?.length === 0) && (
                  <div className="text-center py-12 text-gray-500">В этот день не задано упражнений</div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
