import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, Plus, Loader2, Dumbbell } from 'lucide-react';
import { sd_useProgramBuilderStore } from '../../../stores/sd_useProgramBuilderStore';
import { sd_useAuthStore } from '../../../stores/sd_useAuthStore';
import { sd_pb } from '../../../lib/sd_pocketbase';
import { Sd_BuilderDayConfig } from '../../../components/programs/builder/Sd_BuilderDayConfig';
import { Sd_BuilderColumnsConfigModal } from '../../../components/programs/builder/Sd_BuilderColumnsConfigModal';
import { Sd_BuilderSelect } from '../../../components/programs/builder/Sd_BuilderSelect';
import { useState } from 'react';
import type { sd_ProgramExerciseRecord, sd_ProgramRecord, sd_ProgramWorkoutRecord } from '../../../types/sd_types';

export const Sd_FullProgramBuilderPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { sd_user } = sd_useAuthStore();
  
  const [isColumnsConfigOpen, setIsColumnsConfigOpen] = useState(false);

  const program = sd_useProgramBuilderStore(state => state.program);
  const isSaving = sd_useProgramBuilderStore(state => state.isSaving);
  const setField = sd_useProgramBuilderStore(state => state.sd_setProgramField);
  const addWorkout = sd_useProgramBuilderStore(state => state.sd_addWorkout);
  const initProgram = sd_useProgramBuilderStore(state => state.sd_initProgram);

  // Загрузка программы (если передан id для редактирования)
  useEffect(() => {
    const fetchProgram = async () => {
      if (!id) return;
      try {
        const record = await sd_pb.collection('programs').getOne<sd_ProgramRecord>(id, {
          expand: 'program_workouts_via_program_id.program_exercises_via_workout_id'
        });
        
        const loadedWorkouts = (record.expand?.['program_workouts_via_program_id'] || []).map((w: sd_ProgramWorkoutRecord) => ({
          id: w.id,
          name: w.name,
          day_number: w.day_number,
          exercises: (w.expand?.['program_exercises_via_workout_id'] || []).map((e: sd_ProgramExerciseRecord) => ({
            id: e.id,
            name: e.exercise_name,
            order: e.order,
            sets: e.sets_data || []
          })).sort((a, b) => a.order - b.order)
        })).sort((a, b) => a.day_number - b.day_number);

        initProgram({
          name: record.name,
          description: record.description,
          specialization: record.specialization || '',
          goals: record.goals || '',
          duration_weeks: record.duration_weeks || 4,
          workouts: loadedWorkouts
        });
      } catch (err) {
        console.error('Ошибка загрузки программы:', err);
      }
    };
    fetchProgram();
  }, [id, initProgram]);

  // Защита от закрытия вкладки
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handleSave = async () => {
    if (!sd_user) return;
    
    // Глубокая валидация
    if (!program.name.trim()) {
      alert('⚠️ Введите название программы');
      return;
    }
    if (program.workouts.length === 0) {
      alert('⚠️ Программа не может быть пустой. Добавьте хотя бы один тренировочный день.');
      return;
    }
    for (const workout of program.workouts) {
      if (!workout.name.trim()) {
        alert('⚠️ У одного из дней отсутствует название.');
        return;
      }
      if (workout.exercises.length === 0) {
        alert(`⚠️ День "${workout.name}" пуст. Добавьте упражнения или удалите этот день.`);
        return;
      }
      for (const ex of workout.exercises) {
        if (!ex.name.trim()) {
          alert(`⚠️ В дне "${workout.name}" есть упражнение без названия. Пожалуйста, заполните его.`);
          return;
        }
      }
    }

    sd_useProgramBuilderStore.setState({ isSaving: true });
    
    try {
      let programId = id;
      
      const programData = {
        coach_id: sd_user.id,
        name: program.name,
        description: program.description,
        specialization: program.specialization,
        goals: program.goals,
        duration_weeks: program.duration_weeks
      };

      // 1. Создаем или обновляем программу
      if (programId) {
        await sd_pb.collection('programs').update(programId, programData);
        
        // ВАЖНО: При редактировании мы удаляем старые дни и упражнения, и пересоздаем, 
        // чтобы не писать миллион сложных сверок ID и каскадных обновлений.
        // Это атомарная и простая стратегия для шаблонов.
        const oldWorkouts = await sd_pb.collection('program_workouts').getFullList({ filter: `program_id = "${programId}"` });
        for (const w of oldWorkouts) {
          await sd_pb.collection('program_workouts').delete(w.id);
        }
      } else {
        const newProgram = await sd_pb.collection('programs').create(programData);
        programId = newProgram.id;
      }

      // 2. Создаем дни (workouts)
      for (const workout of program.workouts) {
        const newWorkout = await sd_pb.collection('program_workouts').create({
          program_id: programId,
          day_number: workout.day_number,
          name: workout.name
        });

        // 3. Создаем упражнения в этом дне (exercises)
        for (const exercise of workout.exercises) {
          await sd_pb.collection('program_exercises').create({
            workout_id: newWorkout.id,
            exercise_name: exercise.name,
            order: exercise.order,
            sets_data: exercise.sets,
            // Fallback поля на случай старых правил валидации
            sets: exercise.sets.length > 0 ? exercise.sets.length : 1,
            reps: String(exercise.sets[0]?.reps || "10")
          });
        }
      }

      navigate('/programs');
    } catch (err) {
      console.error(err);
      alert('Ошибка при сохранении программы');
    } finally {
      sd_useProgramBuilderStore.setState({ isSaving: false });
    }
  };

  const handleClose = () => {
    if (window.confirm('Вы уверены, что хотите выйти? Несохраненные изменения будут потеряны.')) {
      navigate('/programs');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-900/40 backdrop-blur-xl flex items-center justify-center p-0 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-[96vw] h-[94vh] bg-zinc-50/95 backdrop-blur-2xl flex flex-col rounded-2xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] ring-1 ring-white/50 overflow-hidden relative"
      >
        {/* Header */}
        <header className="h-20 flex-none bg-transparent border-b border-zinc-200/60 flex items-center justify-between px-8 lg:px-10 px-safe z-10">
        <div className="flex items-center gap-5">
          <button 
            onClick={handleClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-gray-900 leading-tight">
              {id ? 'Редактирование программы' : 'Новая программа'}
            </h1>
            <span className="text-xs font-medium text-gray-500">{program.workouts.length} тренировок</span>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="hidden md:flex h-11 px-6 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white rounded-2xl font-semibold shadow-[0_8px_20px_-8px_rgba(244,63,94,0.6)] items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Сохранить в базу
        </button>
      </header>

        {/* Main Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden sd_custom-scroll">
        {/* Left Sidebar: Global Settings */}
        <div className="w-full md:w-80 flex-none bg-white/40 border-b md:border-b-0 md:border-r border-zinc-200/60 md:overflow-y-auto sd_custom-scroll p-6 md:p-8 pb-10 md:pb-8">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Настройки шаблона</h2>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-zinc-800 mb-2">Название программы</label>
              <input 
                type="text" 
                value={program.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder="Например: Фуллбади Новичок"
                className="w-full h-12 px-4 bg-white/70 backdrop-blur-sm border border-zinc-200/60 rounded-2xl focus:bg-white focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 transition-all outline-none font-medium placeholder:text-zinc-400 shadow-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-zinc-800 mb-2">Описание</label>
              <textarea 
                value={program.description}
                onChange={(e) => setField('description', e.target.value)}
                placeholder="Кратко о программе..."
                rows={3}
                className="w-full p-4 bg-white/70 backdrop-blur-sm border border-zinc-200/60 rounded-2xl focus:bg-white focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 transition-all outline-none resize-none font-medium placeholder:text-zinc-400 shadow-sm"
              />
            </div>

            <div className="relative z-50">
              <label className="block text-sm font-semibold text-zinc-800 mb-2">Специализация</label>
              <Sd_BuilderSelect 
                value={program.specialization}
                onChange={(val) => setField('specialization', val)}
                options={[
                  { value: 'Рекомпозиция', label: 'Рекомпозиция' },
                  { value: 'Набор массы', label: 'Набор массы' },
                  { value: 'Похудение', label: 'Похудение' },
                  { value: 'Сила', label: 'Сила' },
                  { value: 'Функционал', label: 'Функционал' },
                  { value: 'Реабилитация', label: 'Реабилитация' },
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-800 mb-2">Длительность (недель)</label>
              <input 
                type="number" 
                min="1" max="52"
                value={program.duration_weeks}
                onChange={(e) => setField('duration_weeks', parseInt(e.target.value) || 4)}
                className="w-full h-12 px-4 bg-white/70 backdrop-blur-sm border border-zinc-200/60 rounded-2xl focus:bg-white focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 transition-all outline-none font-medium shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-800 mb-2">Главные цели (через запятую)</label>
              <textarea 
                value={program.goals}
                onChange={(e) => setField('goals', e.target.value)}
                placeholder="Техника, выносливость, гипертрофия..."
                rows={2}
                className="w-full p-4 bg-white/70 backdrop-blur-sm border border-zinc-200/60 rounded-2xl focus:bg-white focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 transition-all outline-none resize-none font-medium placeholder:text-zinc-400 shadow-sm"
              />
            </div>

            <div className="pt-6 border-t border-zinc-200/60 flex flex-col gap-3">
              <button
                onClick={() => setIsColumnsConfigOpen(true)}
                className="w-full h-12 bg-zinc-900 hover:bg-black text-white rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-zinc-900/20"
              >
                Настроить колонки таблицы
              </button>
              
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full md:hidden h-14 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white rounded-2xl font-bold text-lg shadow-[0_8px_20px_-8px_rgba(244,63,94,0.6)] flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98]"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-6 h-6" />}
                Сохранить в базу
              </button>
            </div>
          </div>
        </div>

        {/* Main Canvas: Days and Exercises */}
        <div className="flex-none md:flex-1 w-full md:w-auto shrink-0 md:overflow-y-auto overflow-x-hidden p-3 md:p-6 lg:p-12 sd_custom-scroll relative pb-32 lg:pb-12 border-t md:border-t-0 border-zinc-200/60 bg-white/20">
          {/* Subtle background gradient to add depth */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-100/50 via-zinc-50/20 to-transparent pointer-events-none" />
          
          <div className="max-w-4xl mx-auto space-y-10 relative z-10">
            
            {program.workouts.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="w-full h-80 border-2 border-dashed border-zinc-200 rounded-[2.5rem] flex flex-col items-center justify-center text-center bg-white/40 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              >
                <div className="w-20 h-20 bg-zinc-900 rounded-[1.5rem] flex items-center justify-center text-white mb-6 shadow-xl shadow-zinc-900/20">
                  <Dumbbell className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-zinc-900 tracking-tight">Программа пуста</h3>
                <p className="text-zinc-500 mt-3 max-w-sm mb-8 font-medium">Начните конструировать неделю, добавив первый тренировочный день.</p>
                <button
                  onClick={addWorkout}
                  className="px-8 h-14 bg-zinc-900 hover:bg-black text-white rounded-2xl font-bold shadow-xl shadow-zinc-900/20 flex items-center gap-3 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Plus className="w-5 h-5" /> Создать первый день
                </button>
              </motion.div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {program.workouts.map((workout, index) => (
                    <motion.div
                      key={workout.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200/60 overflow-hidden"
                    >
                      <Sd_BuilderDayConfig workout={workout} index={index} />
                    </motion.div>
                  ))}
                </AnimatePresence>

                <button
                  onClick={addWorkout}
                  className="w-full h-20 bg-white/40 backdrop-blur-sm border-2 border-dashed border-zinc-200 rounded-2xl flex items-center justify-center text-zinc-500 font-bold hover:border-zinc-300 hover:text-zinc-900 hover:bg-white/60 transition-all duration-300 gap-3"
                >
                  <Plus className="w-6 h-6" /> Добавить еще один день
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      </motion.div>

      <Sd_BuilderColumnsConfigModal 
        isOpen={isColumnsConfigOpen}
        onClose={() => setIsColumnsConfigOpen(false)}
      />
    </div>
  );
};
