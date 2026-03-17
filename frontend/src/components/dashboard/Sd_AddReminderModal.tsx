import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Calendar, Users, Loader2, Sparkles } from 'lucide-react';
import { Sd_Modal } from '../ui/Sd_Modal';
import { sd_pb } from '../../lib/sd_pocketbase';
import { sd_useAuthStore } from '../../stores/sd_useAuthStore';
import { Sd_Select } from '../ui/Sd_Select';
import type { sd_Athlete, sd_Reminder } from '../../types/sd_types';
import { sd_reminderTemplates } from '../../utils/sd_reminderUtils';

interface Sd_AddReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newReminder: sd_Reminder) => void;
}

export const Sd_AddReminderModal = ({ isOpen, onClose, onSuccess }: Sd_AddReminderModalProps) => {
  const { sd_user } = sd_useAuthStore();
  const [sd_athletes, setSd_Athletes] = useState<sd_Athlete[]>([]);
  const [sd_isLoading, setSd_IsLoading] = useState(false);

  // Form State
  const [sd_title, setSd_Title] = useState('');
  const [sd_description, setSd_Description] = useState('');
  const [sd_athleteId, setSd_AthleteId] = useState<string>('');
  const [sd_dueDate, setSd_DueDate] = useState(new Date().toISOString().slice(0, 16));
  const [sd_type, setSd_Type] = useState<sd_Reminder['type']>('other');

  const sd_mapReminderTypeForBackend = (sd_value: sd_Reminder['type']): sd_Reminder['type'] => {
    if (sd_value === 'check_in') return 'training';
    return sd_value || 'other';
  };

  useEffect(() => {
    if (isOpen) {
      sd_pb.collection('athletes').getList<sd_Athlete>(1, 100, { sort: 'name' })
        .then(res => setSd_Athletes(res.items))
        .catch(err => console.error(err));
    }
  }, [isOpen]);

  const sd_applyTemplate = (idx: number) => {
    const template = sd_reminderTemplates[idx];
    setSd_Title(template.title);
    setSd_Description(template.description);
    setSd_Type(template.type);
  };

  const sd_handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sd_user) return;

    setSd_IsLoading(true);
    try {
      const record = await sd_pb.collection('reminders').create<sd_Reminder>({
        coach_id: sd_user.id,
        athlete_id: sd_athleteId || undefined,
        title: sd_title,
        description: sd_description,
        due_date: new Date(sd_dueDate).toISOString(),
        is_completed: false,
        type: sd_mapReminderTypeForBackend(sd_type),
        priority: 'medium',
      });
      onSuccess(record);
      onClose();
      // Reset
      setSd_Title('');
      setSd_Description('');
      setSd_AthleteId('');
    } catch (err) {
      console.error(err);
    } finally {
      setSd_IsLoading(false);
    }
  };

  return (
    <Sd_Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Новое напоминание"
      description="Создайте задачу для себя или для контроля клиента"
    >
      <form onSubmit={sd_handleSubmit} className="space-y-6">
        {/* Templates Quick Select */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-500" /> Быстрые шаблоны
          </label>
          <div className="flex flex-wrap gap-2">
            {sd_reminderTemplates.slice(0, 10).map((t, i) => (
              <button
                key={i}
                type="button"
                onClick={() => sd_applyTemplate(i)}
                className="px-4 py-2 rounded-xl bg-orange-50 text-[var(--accent)] text-xs font-semibold hover:bg-orange-100 transition-colors"
              >
                {t.title}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Заголовок</label>
            <div className="relative">
              <Bell className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                required
                value={sd_title}
                onChange={e => setSd_Title(e.target.value)}
                placeholder="Например: Проверить питание"
                className="sd_input pl-12"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Описание (необязательно)</label>
            <textarea
              rows={2}
              value={sd_description}
              onChange={e => setSd_Description(e.target.value)}
              placeholder="Детали задачи..."
              className="w-full p-4 rounded-2xl bg-gray-50 border-0 focus:bg-white focus:shadow-[0_0_0_2px_rgba(249,115,22,0.1)] transition-all outline-none font-medium resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Athlete Select */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Клиент</label>
              <Sd_Select
                value={sd_athleteId}
                onChange={(val) => setSd_AthleteId(val)}
                options={[
                  { value: '', label: 'Для себя (Общее)' },
                  ...sd_athletes.map(a => ({ value: a.id, label: a.name }))
                ]}
                icon={<Users className="w-5 h-5" />}
                className="bg-transparent border-t-0 border-l-0 border-r-0 border-b-2 rounded-none border-gray-200 hover:border-gray-300 focus:border-orange-500 !px-12 h-[52px]"
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Когда</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="datetime-local"
                  required
                  value={sd_dueDate}
                  onChange={e => setSd_DueDate(e.target.value)}
                  className="sd_input pl-12 appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 pb-12 md:pb-0 flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:flex-1 h-14 rounded-2xl font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Отмена
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={sd_isLoading}
            className="w-full sm:flex-[2] h-14 rounded-2xl font-bold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition-colors shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2"
          >
            {sd_isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Создать'}
          </motion.button>
        </div>
      </form>
    </Sd_Modal>
  );
};
