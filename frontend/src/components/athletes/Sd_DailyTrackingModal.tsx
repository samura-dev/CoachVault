import { useState, useEffect } from 'react';
import { Loader2, Droplets, Flame, Activity } from 'lucide-react';
import { Sd_Modal } from '../ui/Sd_Modal';
import { sd_pb } from '../../lib/sd_pocketbase';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

type sd_DailyTrackingRecord = {
  id?: string;
  date: string;
  calories?: number;
  protein?: number;
  water?: number;
  steps?: number;
  notes?: string;
  is_perfect?: boolean;
};

interface Sd_DailyTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  athleteId: string;
  selectedDate: Date;
  existingRecord?: sd_DailyTrackingRecord;
  onSuccess: () => void;
}

export const Sd_DailyTrackingModal = ({ isOpen, onClose, athleteId, selectedDate, existingRecord, onSuccess }: Sd_DailyTrackingModalProps) => {
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [water, setWater] = useState('');
  const [steps, setSteps] = useState('');
  const [isPerfect, setIsPerfect] = useState(false);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (existingRecord) {
      setCalories(existingRecord.calories !== undefined ? String(existingRecord.calories) : '');
      setProtein(existingRecord.protein !== undefined ? String(existingRecord.protein) : '');
      setWater(existingRecord.water !== undefined ? String(existingRecord.water) : '');
      setSteps(existingRecord.steps !== undefined ? String(existingRecord.steps) : '');
      setIsPerfect(existingRecord.is_perfect || false);
      setNotes(existingRecord.notes || '');
    } else {
      setCalories('');
      setProtein('');
      setWater('');
      setSteps('');
      setIsPerfect(false);
      setNotes('');
    }
  }, [existingRecord, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const data = {
      athlete_id: athleteId,
      date: format(selectedDate, 'yyyy-MM-dd'),
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      water: Number(water) || 0,
      steps: Number(steps) || 0,
      is_perfect: isPerfect,
      notes,
    };

    try {
      if (existingRecord?.id) {
        await sd_pb.collection('daily_tracking').update(existingRecord.id, data);
      } else {
        await sd_pb.collection('daily_tracking').create(data);
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Ошибка при сохранении дневника');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sd_Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Отчет за ${format(selectedDate, 'd MMMM', { locale: ru })}`}
      description="Внесите данные о питании и активности за выбранный день"
    >
      <form onSubmit={handleSubmit} className="space-y-5">

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5 ml-1">
              <Flame className="w-4 h-4 text-orange-500" /> Калории (ккал)
            </label>
            <input
              type="number"
              placeholder="Напр. 2500"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              className="w-full h-12 px-4 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5 ml-1">
              <div className="w-4 h-4 rounded text-[10px] font-bold bg-indigo-100 text-indigo-600 flex items-center justify-center">P</div>
              Белки (г)
            </label>
            <input
              type="number"
              placeholder="Напр. 150"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              className="w-full h-12 px-4 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5 ml-1">
              <Droplets className="w-4 h-4 text-blue-500" /> Вода (л)
            </label>
            <input
              type="number"
              step="0.1"
              placeholder="Напр. 2.5"
              value={water}
              onChange={(e) => setWater(e.target.value)}
              className="w-full h-12 px-4 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5 ml-1">
              <Activity className="w-4 h-4 text-green-500" /> Шаги
            </label>
            <input
              type="number"
              placeholder="Напр. 10000"
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              className="w-full h-12 px-4 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Заметки / Самочувствие</label>
          <textarea
            rows={3}
            placeholder="Как прошла тренировка, самочувствие, качество сна..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-4 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium resize-none"
          />
        </div>

        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:bg-white hover:border-indigo-100 transition-all" onClick={() => setIsPerfect(!isPerfect)}>
          <div className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${isPerfect ? 'bg-green-500' : 'bg-gray-200'}`}>
            {isPerfect && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
          </div>
          <div>
            <div className="font-bold text-gray-900 text-sm">Идеальный день</div>
            <div className="text-xs font-medium text-gray-500">Все макронутриенты и план выполнены</div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} disabled={isLoading} className="flex-1 h-12 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50">
            Отмена
          </button>
          <button type="submit" disabled={isLoading} className="flex-[2] h-12 rounded-xl font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-50">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Сохранить день'}
          </button>
        </div>
      </form>
    </Sd_Modal>
  );
};
