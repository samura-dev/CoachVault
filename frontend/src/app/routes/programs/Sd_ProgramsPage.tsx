import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Plus, Activity, Trash2, Edit } from 'lucide-react';
import { sd_pb } from '../../../lib/sd_pocketbase';
import { sd_useAuthStore } from '../../../stores/sd_useAuthStore';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface ProgramPreview {
  id: string;
  name: string;
  description: string;
  duration_weeks: number;
  created: string;
  expand?: {
    'program_workouts_via_program_id'?: { id: string }[];
  }
}

export const Sd_ProgramsPage = () => {
  const navigate = useNavigate();
  const { sd_user } = sd_useAuthStore();
  const [programs, setPrograms] = useState<ProgramPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPrograms = useCallback(async () => {
    if (!sd_user) return;
    setIsLoading(true);
    try {
      const records = await sd_pb.collection('programs').getList<ProgramPreview>(1, 50, {
        filter: `coach_id = "${sd_user.id}"`,
        sort: '-created',
        expand: 'program_workouts_via_program_id'
      });
      setPrograms(records.items);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [sd_user]);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  const filteredPrograms = programs;

  return (
    <div className="w-full h-full space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <Dumbbell className="w-8 h-8 text-indigo-500" />
            База Программ
          </h1>
          <p className="text-gray-500">Шаблоны тренировочных планов для клиентов</p>
        </div>
        <button
          onClick={() => navigate('/programs/new')}
          className="h-11 px-6 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Создать программу
        </button>
      </motion.div>

      {/* Grid */}
      {isLoading ? (
        <div className="w-full h-64 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredPrograms.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full py-20 px-6 sm:px-12 flex flex-col items-center justify-center text-center bg-white rounded-[2rem] border-2 border-dashed border-gray-200"
        >
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
            <Dumbbell className="w-10 h-10 text-indigo-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Нет программ</h3>
          <p className="text-gray-500 mt-2 max-w-sm">
            Создайте свой первый шаблон тренировок, чтобы назначать его клиентам в один клик.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredPrograms.map((prog, idx) => (
              <motion.div
                key={prog.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all group flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => navigate(`/programs/${prog.id}/edit`)}
                      className="p-2 text-gray-400 hover:text-indigo-500 transition-colors bg-gray-50 hover:bg-indigo-50 rounded-xl"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 hover:bg-red-50 rounded-xl">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-2 line-clamp-1">{prog.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-6 flex-1">{prog.description || 'Без описания'}</p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-sm font-semibold text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="bg-gray-100 px-2 py-1 rounded-lg">{prog.duration_weeks} нед.</span>
                    <span className="bg-gray-100 px-2 py-1 rounded-lg">{(prog.expand?.['program_workouts_via_program_id']?.length || 0)} тренировок</span>
                  </div>
                  <span className="text-gray-400 font-medium text-xs">
                    {prog.created ? format(new Date(prog.created), 'd MMM yyyy', { locale: ru }) : '—'}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
