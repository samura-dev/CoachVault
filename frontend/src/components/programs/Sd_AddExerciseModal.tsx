import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Sd_Modal } from '../ui/Sd_Modal';
import { sd_pb } from '../../lib/sd_pocketbase';

interface Sd_AddExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  workoutId: string;
  currentExercisesCount: number;
  onSuccess: () => void;
}

export const Sd_AddExerciseModal = ({ isOpen, onClose, workoutId, currentExercisesCount, onSuccess }: Sd_AddExerciseModalProps) => {
  const [exerciseName, setExerciseName] = useState('');
  const [sets, setSets] = useState<number | ''>(3);
  const [reps, setReps] = useState('10-12');
  const [restTime, setRestTime] = useState('60 сек');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exerciseName || !sets || !reps) return;

    setIsLoading(true);
    try {
      await sd_pb.collection('program_exercises').create({
        workout_id: workoutId,
        exercise_name: exerciseName,
        sets: Number(sets),
        reps,
        rest_time: restTime,
        order: currentExercisesCount + 1
      });

      onSuccess();
      onClose();

      setExerciseName('');
      setSets(3);
      setReps('10-12');
      setRestTime('60 сек');
    } catch (err) {
      console.error(err);
      alert('Ошибка при добавлении упражнения');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sd_Modal isOpen={isOpen} onClose={onClose} title="Добавить упражнение" description="Заполните параметры для этого движения">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Название *</label>
          <input
            type="text"
            required
            placeholder="Напр. Жим лежа"
            value={exerciseName}
            onChange={(e) => setExerciseName(e.target.value)}
            className="w-full h-12 px-4 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Подходы *</label>
            <input
              type="number"
              required
              min="1"
              value={sets}
              onChange={(e) => setSets(Number(e.target.value) || '')}
              className="w-full h-12 px-4 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium text-center"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Повторения *</label>
            <input
              type="text"
              required
              placeholder="8-10, Макс"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              className="w-full h-12 px-4 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium text-center"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Отдых</label>
          <input
            type="text"
            placeholder="60-90 сек"
            value={restTime}
            onChange={(e) => setRestTime(e.target.value)}
            className="w-full h-12 px-4 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button type="button" onClick={onClose} disabled={isLoading} className="flex-1 h-12 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50">
            Отмена
          </button>
          <button type="submit" disabled={isLoading || !exerciseName || !sets || !reps} className="flex-[2] h-12 rounded-xl font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-50">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'В план'}
          </button>
        </div>
      </form>
    </Sd_Modal>
  );
};
