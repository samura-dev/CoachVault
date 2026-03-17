import { useState, useEffect } from 'react';
import { Users, FileText, Loader2, Shield, ShieldOff } from 'lucide-react';
import { Sd_Modal } from '../ui/Sd_Modal';
import { sd_pb } from '../../lib/sd_pocketbase';
import type { sd_Athlete, sd_Note } from '../../types/sd_types';
import { Sd_Select } from '../ui/Sd_Select';
import { sd_logActivity } from '../../utils/sd_activityLogger';

type sd_UiNoteType = 'general' | 'training' | 'nutrition' | 'medical';

const sd_categoryOptions: Array<{ value: sd_UiNoteType; label: string }> = [
  { value: 'general', label: 'Общее' },
  { value: 'training', label: 'Тренировка' },
  { value: 'nutrition', label: 'Питание' },
  { value: 'medical', label: 'Здоровье' },
];

interface Sd_AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newNote: sd_Note & { expand?: { athlete_id: sd_Athlete } }, isEdit?: boolean) => void;
  athleteId?: string;
  initialNote?: sd_Note & { expand?: { athlete_id: sd_Athlete } };
}

export const Sd_AddNoteModal = ({ isOpen, onClose, onSuccess, athleteId: initialAthleteId, initialNote }: Sd_AddNoteModalProps) => {
  const [sd_athletes, setSd_Athletes] = useState<sd_Athlete[]>([]);
  const [sd_isLoading, setSd_IsLoading] = useState(false);
  const [sd_isFetchingAthletes, setSd_IsFetchingAthletes] = useState(true);
  const [sd_error, setSd_Error] = useState('');

  // Form State
  const [sd_athleteId, setSd_AthleteId] = useState(initialAthleteId || '');
  const [sd_content, setSd_Content] = useState('');
  const [sd_type, setSd_Type] = useState<sd_UiNoteType>('general');
  const [sd_importance, setSd_Importance] = useState<'low' | 'medium' | 'high'>('low');
  const [sd_isPrivate, setSd_IsPrivate] = useState(false);

  const sd_mapNoteTypeForBackend = (sd_value: typeof sd_type): sd_Note['type'] => {
    if (sd_value === 'training') return 'general';
    if (sd_value === 'nutrition') return 'diet';
    if (sd_value === 'medical') return 'injury';
    return sd_value;
  };

  // Fetch athletes when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialAthleteId) {
        setSd_AthleteId(initialAthleteId);
      }
      
      if (initialNote) {
        setSd_AthleteId(initialNote.athlete_id);
        setSd_Content(initialNote.content);
        setSd_Importance((initialNote.importance as 'low'|'medium'|'high') || 'low');
        setSd_IsPrivate(initialNote.is_private || false);
        
        let uiType: sd_UiNoteType = 'general';
        if (initialNote.type === 'diet') uiType = 'nutrition';
        else if (initialNote.type === 'injury') uiType = 'medical';
        else if (initialNote.type === 'general') uiType = 'general'; // Note: training goes to general in DB too
        setSd_Type(uiType);
      } else {
        setSd_Content('');
        setSd_Type('general');
        setSd_Importance('low');
        setSd_IsPrivate(false);
      }

      setSd_IsFetchingAthletes(true);
      sd_pb.collection('athletes')
        .getList<sd_Athlete>(1, 100, { sort: 'name' })
        .then((res) => {
          setSd_Athletes(res.items);
          if (res.items.length > 0 && !sd_athleteId && !initialAthleteId && !initialNote) {
            setSd_AthleteId(res.items[0].id);
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setSd_IsFetchingAthletes(false));
    }
  }, [isOpen, initialAthleteId, sd_athleteId, initialNote]);

  const sd_handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sd_athleteId || !sd_content.trim()) {
      setSd_Error('Выберите клиента и напишите текст заметки');
      return;
    }

    setSd_Error('');
    setSd_IsLoading(true);

    try {
      const data: Partial<sd_Note> = {
        athlete_id: sd_athleteId,
        content: sd_content.trim(),
        type: sd_mapNoteTypeForBackend(sd_type),
        importance: sd_importance,
        is_private: sd_isPrivate,
      };

      let record;
      if (initialNote?.id) {
        record = await sd_pb.collection('notes').update<sd_Note>(initialNote.id, data);
      } else {
        record = await sd_pb.collection('notes').create<sd_Note>(data as sd_Note);
      }

      // Fetch expanded athlete for the UI right away
      const expandedRecord = await sd_pb.collection('notes').getOne<sd_Note & { expand: { athlete_id: sd_Athlete } }>(record.id, {
        expand: 'athlete_id'
      });

      await sd_logActivity({
        action_type: initialNote ? 'update' : 'create',
        entity_type: 'note',
        title: `${initialNote ? 'Изменена' : 'Создана'} заметка (${sd_type === 'general' ? 'Общая' : 'Важная'} / ${sd_importance === 'high' ? 'Высокая' : sd_importance === 'medium' ? 'Средняя' : 'Низкая'})`,
        entity_id: record.id
      });

      onSuccess(expandedRecord, !!initialNote);
      setSd_Content('');
      onClose();
    } catch (err: unknown) {
      console.error('[Note Create Error]', err);
      let sd_message = 'Ошибка при сохранении заметки';

      if (typeof err === 'object' && err !== null) {
        const pocketErr = err as {
          data?: { data?: Record<string, { message?: string }> };
          message?: string;
        };
        if (pocketErr.data?.data) {
          const firstError = Object.values(pocketErr.data.data)[0];
          if (firstError?.message) sd_message = firstError.message;
        } else if (pocketErr.message) {
          sd_message = pocketErr.message;
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
      title={initialNote ? "Редактировать заметку" : "Новая заметка"}
      description="Запишите важные наблюдения по тренировочному процессу"
    >
      <form onSubmit={sd_handleSubmit} className="space-y-5">
        {sd_error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100 font-medium">
            {sd_error}
          </div>
        )}

        <div className="space-y-4">
          {/* Выбор атлета */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Клиент</label>
            <Sd_Select
              value={sd_athleteId}
              onChange={(val) => setSd_AthleteId(val)}
              options={
                sd_isFetchingAthletes
                  ? [{ value: '', label: 'Загрузка клиентов...' }]
                  : sd_athletes.length === 0 && !initialAthleteId && !initialNote
                    ? [{ value: '', label: 'Нет доступных клиентов' }]
                    : sd_athletes.map(a => ({ value: a.id, label: a.name }))
              }
              icon={<Users className="w-5 h-5" />}
              disabled={sd_isFetchingAthletes || !!initialAthleteId}
              className="bg-transparent border-t-0 border-l-0 border-r-0 border-b-2 rounded-none border-gray-200 hover:border-gray-300 focus:border-orange-500 !px-12 h-[52px]"
            />
          </div>

          {/* Текст заметки */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Текст заметки</label>
            <div className="relative">
              <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
              <textarea
                required
                rows={4}
                placeholder="Напишите здесь важную информацию о клиенте или тренировке..."
                value={sd_content}
                onChange={(e) => setSd_Content(e.target.value)}
                className="w-full py-3.5 pl-11 pr-4 rounded-xl bg-gray-50 border border-transparent hover:border-gray-200 focus:bg-white focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all outline-none font-medium placeholder:text-gray-400 resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Тип заметки */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Категория</label>
              <Sd_Select
                value={sd_type}
                onChange={(val) => setSd_Type(val as sd_UiNoteType)}
                options={sd_categoryOptions}
                className="w-full h-12 bg-gray-50 border-transparent hover:border-gray-200 focus:bg-white focus:border-[var(--accent)]"
              />
            </div>

            {/* Приватность */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Видимость</label>
              <button
                type="button"
                onClick={() => setSd_IsPrivate(!sd_isPrivate)}
                className={`w-full h-12 px-4 rounded-xl border transition-all flex items-center justify-center gap-2 font-medium ${sd_isPrivate
                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : 'bg-green-50 border-green-200 text-green-700'
                  }`}
              >
                {sd_isPrivate ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                {sd_isPrivate ? 'Для себя' : 'Публичная'}
              </button>
            </div>
          </div>

          {/* Важность */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Важность</label>
            <div className="flex gap-2">
              {[
                { id: 'low', label: 'Низкая', color: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
                { id: 'medium', label: 'Средняя', color: 'bg-orange-500', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
                { id: 'high', label: 'Высокая', color: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
              ].map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => setSd_Importance(tag.id as 'low' | 'medium' | 'high')}
                  className={`flex-1 py-2.5 rounded-xl border-2 transition-all flex items-center justify-center gap-2 text-sm font-bold ${sd_importance === tag.id
                    ? `${tag.bg} ${tag.border} ${tag.text} scale-[1.02] shadow-sm`
                    : 'bg-white border-gray-100 text-gray-400 grayscale opacity-60'
                    }`}
                >
                  <div className={`w-2 h-2 rounded-full ${tag.color}`} />
                  {tag.label}
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
          <button
            type="submit"
            disabled={sd_isLoading || sd_athletes.length === 0}
            className="flex-[2] h-12 rounded-xl font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] active:scale-95 transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {sd_isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (initialNote ? 'Сохранить изменения' : 'Сохранить заметку')}
          </button>
        </div>
      </form>
    </Sd_Modal>
  );
};
