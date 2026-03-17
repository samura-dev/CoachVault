import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Target, Weight, Activity, Loader2, Shield, Tag } from 'lucide-react';
import { Sd_Modal } from '../ui/Sd_Modal';
import type { sd_Athlete, sd_CompetitionType } from '../../types/sd_types';
import { Sd_Select } from '../ui/Sd_Select';
import { sd_pb } from '../../lib/sd_pocketbase';
import { sd_logActivity } from '../../utils/sd_activityLogger';

const sd_goalOptions = [
  { value: 'cutting', label: 'Сушка / Похудение' },
  { value: 'bulking', label: 'Набор массы' },
  { value: 'maintenance', label: 'Поддержание' },
];

const sd_competitionOptions = [
  { value: 'other', label: 'Другое' },
  { value: 'bodybuilding', label: 'Бодибилдинг' },
  { value: 'powerlifting', label: 'Пауэрлифтинг' },
  { value: 'triathlon', label: 'Троеборье' },
  { value: 'weightlifting', label: 'Тяжелая атлетика' },
];

const sd_statusOptions = [
  { value: 'active', label: 'Активен' },
  { value: 'paused', label: 'Пауза' },
  { value: 'archived', label: 'Архив' },
];

interface Sd_EditAthleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  athlete: sd_Athlete;
  onSuccess: (updatedAthlete: sd_Athlete) => void;
}

export const Sd_EditAthleteModal = ({ isOpen, onClose, athlete, onSuccess }: Sd_EditAthleteModalProps) => {
  const [sd_name, setSd_Name] = useState(athlete.name);
  const [sd_goal, setSd_Goal] = useState<sd_Athlete['goal']>(athlete.goal);
  const [sd_gender, setSd_Gender] = useState<sd_Athlete['gender']>(athlete.gender || 'male');
  const [sd_height, setSd_Height] = useState(athlete.height || '');
  const [sd_startWeight, setSd_StartWeight] = useState(athlete.start_weight);
  const [sd_targetWeight, setSd_TargetWeight] = useState(athlete.target_weight);
  const [sd_status, setSd_Status] = useState<sd_Athlete['status']>(athlete.status);
  const [sd_competitionType, setSd_CompetitionType] = useState<sd_CompetitionType>(athlete.competition_type || 'other');
  const [sd_tags, setSd_Tags] = useState<string[]>(athlete.tags || []);

  const [sd_isLoading, setSd_IsLoading] = useState(false);
  const [sd_error, setSd_Error] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSd_Name(athlete.name);
      setSd_Goal(athlete.goal);
      setSd_StartWeight(athlete.start_weight);
      setSd_TargetWeight(athlete.target_weight);
      setSd_Status(athlete.status);
      setSd_CompetitionType(athlete.competition_type || 'other');
      setSd_Tags(athlete.tags || []);
    }
  }, [isOpen, athlete]);

  const sd_toggleTag = (tag: string) => {
    setSd_Tags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [tag]); // Only one priority tag for now
  };

  const sd_handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSd_IsLoading(true);
    setSd_Error('');

    try {
      const record = await sd_pb.collection('athletes').update<sd_Athlete>(athlete.id, {
        name: sd_name,
        gender: sd_gender,
        height: Number(sd_height) || 0,
        goal: sd_goal,
        start_weight: sd_startWeight,
        target_weight: sd_targetWeight,
        status: sd_status,
        competition_type: sd_competitionType,
        tags: sd_tags
      });
      onSuccess(record);

      await sd_logActivity({
        action_type: 'update',
        entity_type: 'athlete',
        title: `Обновлены данные клиента: ${sd_name}`,
        entity_id: record.id
      });

      onClose();
    } catch (err: unknown) {
      console.error('[EditAthlete Error]', err);
      setSd_Error(err instanceof Error ? err.message : 'Не удалось сохранить изменения');
    } finally {
      setSd_IsLoading(false);
    }
  };

  return (
    <Sd_Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Редактировать клиента"
      description="Измените данные и цели вашего подопечного"
    >
      <form onSubmit={sd_handleSubmit} className="space-y-6">
        {sd_error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100 font-medium">
            {sd_error}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Имя и Пол */}
          <div className="grid grid-cols-3 gap-4 md:col-span-2">
            <div className="col-span-2 space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 ml-1">Имя и Фамилия</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={sd_name}
                  onChange={e => setSd_Name(e.target.value)}
                  className="sd_input pl-12"
                  placeholder="Алексей Смирнов"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 ml-1">Пол</label>
              <Sd_Select
                value={sd_gender}
                onChange={(val) => setSd_Gender(val as sd_Athlete['gender'])}
                options={[
                  { value: 'male', label: 'М' },
                  { value: 'female', label: 'Ж' },
                ]}
                className="bg-transparent border-t-0 border-l-0 border-r-0 border-b-2 rounded-none border-gray-200 hover:border-gray-300 focus:border-orange-500 h-[52px]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 ml-1">Рост (см)</label>
            <input
              type="number"
              required
              value={sd_height}
              onChange={e => setSd_Height(e.target.value)}
              className="sd_input"
              placeholder="175"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 ml-1">Статус</label>
            <Sd_Select
              value={sd_status}
              onChange={(val) => setSd_Status(val as sd_Athlete['status'])}
              options={sd_statusOptions}
              icon={<Activity className="w-5 h-5" />}
              className="bg-transparent border-t-0 border-l-0 border-r-0 border-b-2 rounded-none border-gray-200 hover:border-gray-300 focus:border-orange-500 !px-12 h-[52px]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 ml-1">Категория</label>
            <Sd_Select
              value={sd_competitionType}
              onChange={(val) => setSd_CompetitionType(val as sd_CompetitionType)}
              options={sd_competitionOptions}
              icon={<Shield className="w-5 h-5" />}
              className="bg-transparent border-t-0 border-l-0 border-r-0 border-b-2 rounded-none border-gray-200 hover:border-gray-300 focus:border-orange-500 !px-12 h-[52px]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 ml-1">Цель</label>
            <Sd_Select
              value={sd_goal}
              onChange={(val) => setSd_Goal(val as sd_Athlete['goal'])}
              options={sd_goalOptions}
              icon={<Target className="w-5 h-5" />}
              className="bg-transparent border-t-0 border-l-0 border-r-0 border-b-2 rounded-none border-gray-200 hover:border-gray-300 focus:border-orange-500 !px-12 h-[52px]"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-semibold text-gray-700 ml-1">Приоритет</label>
            <div className="flex gap-2">
              {['high', 'medium', 'low'].map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => sd_toggleTag(tag)}
                  className={`flex-1 h-14 rounded-xl border-0 font-semibold text-sm transition-all flex items-center justify-center gap-2 ${sd_tags.includes(tag)
                    ? tag === 'high' ? 'bg-red-50 text-red-600' : tag === 'medium' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                    }`}
                >
                  <Tag className="w-4 h-4" />
                  {tag === 'high' ? 'Высокий' : tag === 'medium' ? 'Средний' : 'Низкий'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 ml-1">Начальный вес (кг)</label>
            <div className="relative">
              <Weight className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                step="0.1"
                required
                value={sd_startWeight}
                onChange={e => setSd_StartWeight(Number(e.target.value))}
                className="sd_input pl-12"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 ml-1">Целевой вес (кг)</label>
            <div className="relative">
              <Weight className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                step="0.1"
                required
                value={sd_targetWeight}
                onChange={e => setSd_TargetWeight(Number(e.target.value))}
                className="sd_input pl-12"
              />
            </div>
          </div>
        </div>

        <div className="pt-6 flex gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-14 rounded-2xl font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Отмена
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={sd_isLoading}
            className="flex-[2] h-14 rounded-2xl font-bold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition-colors shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2"
          >
            {sd_isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Сохранить изменения'}
          </motion.button>
        </div>
      </form>
    </Sd_Modal>
  );
};
