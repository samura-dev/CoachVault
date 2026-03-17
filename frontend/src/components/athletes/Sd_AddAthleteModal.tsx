import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Target, Weight, CheckCircle2, Loader2, Trophy, Flame } from 'lucide-react';
import { Sd_Modal } from '../ui/Sd_Modal';
import { sd_pb } from '../../lib/sd_pocketbase';
import { sd_useAuthStore } from '../../stores/sd_useAuthStore';
import { sd_logActivity } from '../../utils/sd_activityLogger';
import type { sd_Athlete, sd_CompetitionType } from '../../types/sd_types';
import { Sd_Select } from '../ui/Sd_Select';

const sd_goalOptions = [
  { value: 'cutting', label: 'Сушка' },
  { value: 'bulking', label: 'Набор массы' },
  { value: 'maintenance', label: 'Поддержание' },
];

const sd_competitionOptions = [
  { value: '', label: 'Без специализации' },
  { value: 'bodybuilding', label: 'Бодибилдинг' },
  { value: 'powerlifting', label: 'Пауэрлифтинг' },
  { value: 'triathlon', label: 'Троеборье' },
  { value: 'weightlifting', label: 'Тяжелая атлетика' },
  { value: 'other', label: 'Другое' },
];

interface Sd_AddAthleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newAthlete: sd_Athlete) => void;
}

export const Sd_AddAthleteModal = ({ isOpen, onClose, onSuccess }: Sd_AddAthleteModalProps) => {
  const { sd_user } = sd_useAuthStore();
  const [sd_isLoading, setSd_IsLoading] = useState(false);
  const [sd_error, setSd_Error] = useState('');

  // Form State
  const [sd_formData, setSd_FormData] = useState<{
    name: string;
    gender: sd_Athlete['gender'];
    height: string;
    goal: sd_Athlete['goal'];
    start_weight: string;
    target_weight: string;
    tags: string[];
    competition_type: sd_CompetitionType | '';
  }>({
    name: '',
    gender: 'male',
    height: '',
    goal: 'maintenance',
    start_weight: '',
    target_weight: '',
    tags: [] as string[],
    competition_type: '',
  });

  const sd_handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sd_user) return;

    setSd_Error('');
    setSd_IsLoading(true);

    try {
      const record = await sd_pb.collection('athletes').create<sd_Athlete>({
        coach_id: sd_user.id,
        name: sd_formData.name,
        gender: sd_formData.gender,
        height: Number(sd_formData.height) || 170,
        goal: sd_formData.goal,
        start_weight: Number(sd_formData.start_weight) || 0,
        target_weight: Number(sd_formData.target_weight) || 0,
        status: 'active',
        is_coach_self: false,
        tags: sd_formData.tags,
        competition_type: sd_formData.competition_type || null,
      });

      onSuccess(record);

      await sd_logActivity({
        action_type: 'create',
        entity_type: 'athlete',
        title: `Добавлен новый клиент: ${sd_formData.name}`,
        entity_id: record.id,
        details: { goal: sd_formData.goal, start_weight: sd_formData.start_weight }
      });

      // Reset form
      setSd_FormData({
        name: '',
        gender: 'male',
        height: '',
        goal: 'maintenance',
        start_weight: '',
        target_weight: '',
        tags: [],
        competition_type: ''
      });
      onClose();
    } catch (err: unknown) {
      console.error('[AddAthlete] Error:', err);
      let sd_message = 'Ошибка при создании клиента';

      if (err && typeof err === 'object') {
        const errObj = err as { response?: { message?: string; data?: Record<string, { message?: string }> }; message?: string };
        if (errObj.response?.message) {
          sd_message = errObj.response.message;
        }
        if (errObj.response?.data) {
          const errors = Object.values(errObj.response.data);
          if (errors.length > 0 && errors[0]?.message) {
            sd_message = `${sd_message}: ${errors[0].message}`;
          }
        } else if (errObj.message) {
          sd_message = errObj.message;
        }
      } else if (err instanceof Error) {
        sd_message = err.message;
      }

      setSd_Error(sd_message);
    } finally {
      setSd_IsLoading(false);
    }
  };

  return (
    <Sd_Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Новый клиент"
      description="Добавьте подопечного для отслеживания его прогресса"
    >
      <form onSubmit={sd_handleSubmit} className="space-y-5">
        {sd_error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100 font-medium">
            {sd_error}
          </div>
        )}

        <div className="space-y-4">
          {/* Имя и Пол */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Имя и Фамилия</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="Иван Иванов"
                  value={sd_formData.name}
                  onChange={(e) => setSd_FormData({ ...sd_formData, name: e.target.value })}
                  className="w-full h-12 pl-11 pr-4 rounded-xl bg-gray-50 border border-transparent hover:border-gray-200 focus:bg-white focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all outline-none font-medium placeholder:text-gray-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Пол</label>
              <Sd_Select
                value={sd_formData.gender}
                onChange={(val) => setSd_FormData({ ...sd_formData, gender: val as sd_Athlete['gender'] })}
                options={[
                  { value: 'male', label: 'М' },
                  { value: 'female', label: 'Ж' },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Рост (см)</label>
              <input
                type="number"
                required
                placeholder="175"
                value={sd_formData.height}
                onChange={(e) => setSd_FormData({ ...sd_formData, height: e.target.value })}
                className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-transparent hover:border-gray-200 focus:bg-white focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all outline-none font-medium placeholder:text-gray-400"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Главная цель</label>
                <Sd_Select
                  value={sd_formData.goal}
                  onChange={(val) => setSd_FormData({ ...sd_formData, goal: val as sd_Athlete['goal'] })}
                  options={sd_goalOptions}
                  icon={<Target className="w-5 h-5" />}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Специализация</label>
                <Sd_Select
                  value={sd_formData.competition_type ?? ''}
                  onChange={(val) => setSd_FormData({ ...sd_formData, competition_type: val as sd_CompetitionType })}
                  options={sd_competitionOptions}
                  icon={<Trophy className="w-5 h-5" />}
                />
              </div>
            </div>
          </div>

          {/* Вес */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Стартовый вес (кг)</label>
              <div className="relative">
                <Weight className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="85.5"
                  value={sd_formData.start_weight}
                  onChange={(e) => setSd_FormData({ ...sd_formData, start_weight: e.target.value })}
                  className="w-full h-12 pl-11 pr-4 rounded-xl bg-gray-50 border border-transparent hover:border-gray-200 focus:bg-white focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all outline-none font-medium placeholder:text-gray-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Целевой вес (кг)</label>
              <div className="relative">
                <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="80.0"
                  value={sd_formData.target_weight}
                  onChange={(e) => setSd_FormData({ ...sd_formData, target_weight: e.target.value })}
                  className="w-full h-12 pl-11 pr-4 rounded-xl bg-gray-50 border border-transparent hover:border-gray-200 focus:bg-white focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all outline-none font-medium placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Приоритет (Теги) */}
          <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Приоритет клиента</label>
              <div className="flex gap-2">
                {[
                  { id: 'low', label: 'Низкий', color: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
                  { id: 'medium', label: 'Средний', color: 'bg-orange-500', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
                  { id: 'high', label: 'Высокий', color: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
                ].map((priority) => (
                  <button
                    key={priority.id}
                    type="button"
                    onClick={() => {
                      const newTags = sd_formData.tags.includes(priority.id) ? [] : [priority.id];
                      setSd_FormData({ ...sd_formData, tags: newTags });
                    }}
                    className={`flex-1 py-1.5 px-2 rounded-xl border-2 transition-all flex items-center justify-center gap-1.5 text-[13px] font-bold ${sd_formData.tags.includes(priority.id)
                      ? `${priority.bg} ${priority.border} ${priority.text} scale-[1.02] shadow-sm`
                      : 'bg-white border-gray-100 text-gray-400 grayscale opacity-60'
                      }`}
                  >
                    <Flame className={`w-3.5 h-3.5 ${sd_formData.tags.includes(priority.id) ? priority.text : 'text-gray-300'}`} />
                    {priority.label}
                  </button>
                ))}
              </div>
            </div>
        </div>

        <div className="pt-2 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={sd_isLoading}
            className="flex-1 h-12 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Отмена
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={sd_isLoading}
            className="flex-[2] h-12 rounded-xl font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition-colors shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {sd_isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Создать клиента'}
          </motion.button>
        </div>
      </form>
    </Sd_Modal>
  );
};
