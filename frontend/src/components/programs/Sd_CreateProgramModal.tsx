import { useState } from 'react';
import { Loader2, Dumbbell } from 'lucide-react';
import { Sd_Modal } from '../ui/Sd_Modal';
import { sd_pb } from '../../lib/sd_pocketbase';
import { sd_useAuthStore } from '../../stores/sd_useAuthStore';
import { sd_logActivity } from '../../utils/sd_activityLogger';

interface Sd_CreateProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (programId: string) => void;
}

export const Sd_CreateProgramModal = ({ isOpen, onClose, onSuccess }: Sd_CreateProgramModalProps) => {
  const { sd_user } = sd_useAuthStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [durationWeeks, setDurationWeeks] = useState<number | ''>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sd_user || !name || !durationWeeks) return;

    setIsLoading(true);
    try {
      const record = await sd_pb.collection('programs').create({
        coach_id: sd_user.id,
        name,
        description,
        duration_weeks: Number(durationWeeks)
      });

      await sd_logActivity({
        action_type: 'create',
        entity_type: 'note', // Можно добавить 'program' в типы сущностей позже
        title: `Создана новая программа: ${name}`,
        entity_id: record.id,
      });

      onSuccess(record.id);
      onClose();

      // Сброс формы
      setName('');
      setDescription('');
      setDurationWeeks('');
    } catch (err) {
      console.error(err);
      alert('Ошибка при создании программы');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sd_Modal isOpen={isOpen} onClose={onClose} title="Создать программу" description="Создайте шаблон для последующего назначения клиентам">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Название программы *</label>
          <div className="relative">
            <Dumbbell className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              required
              placeholder="Напр. Массагедон 2.0"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-12 pl-11 pr-4 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Описание</label>
          <textarea
            placeholder="Цели, особенности и рекомендации..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full h-24 p-4 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Длительность (недель) *</label>
          <input
            type="number"
            required
            min="1"
            max="52"
            value={durationWeeks}
            onChange={(e) => setDurationWeeks(Number(e.target.value) || '')}
            className="w-full h-12 px-4 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} disabled={isLoading} className="flex-1 h-12 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50">
            Отмена
          </button>
          <button type="submit" disabled={isLoading || !name || !durationWeeks} className="flex-[2] h-12 rounded-xl font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-50">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Создать'}
          </button>
        </div>
      </form>
    </Sd_Modal>
  );
};
