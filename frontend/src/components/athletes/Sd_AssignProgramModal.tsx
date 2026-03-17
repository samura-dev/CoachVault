import { useState, useEffect } from 'react';
import { Loader2, Dumbbell, Calendar } from 'lucide-react';
import { Sd_Modal } from '../ui/Sd_Modal';
import { sd_pb } from '../../lib/sd_pocketbase';
import { sd_useAuthStore } from '../../stores/sd_useAuthStore';
import { sd_logActivity } from '../../utils/sd_activityLogger';
import { format } from 'date-fns';

interface ProgramPreview {
  id: string;
  name: string;
  duration_weeks: number;
}

interface Sd_AssignProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  athleteId: string;
  athleteName: string;
  onSuccess: () => void;
}

export const Sd_AssignProgramModal = ({ isOpen, onClose, athleteId, athleteName, onSuccess }: Sd_AssignProgramModalProps) => {
  const { sd_user } = sd_useAuthStore();
  const [programs, setPrograms] = useState<ProgramPreview[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (isOpen && sd_user) {
      setIsFetching(true);
      sd_pb.collection('programs').getList<ProgramPreview>(1, 100, {
        filter: `coach_id = "${sd_user.id}"`,
        sort: 'name',
      })
        .then(res => {
          setPrograms(res.items);
          if (res.items.length > 0) setSelectedProgramId(res.items[0].id);
        })
        .catch(console.error)
        .finally(() => setIsFetching(false));
    }
  }, [isOpen, sd_user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgramId || !startDate) return;

    setIsLoading(true);
    try {
      await sd_pb.collection('client_programs').create({
        athlete_id: athleteId,
        program_id: selectedProgramId,
        start_date: new Date(startDate).toISOString(),
        status: 'active'
      });

      const prog = programs.find(p => p.id === selectedProgramId);

      await sd_logActivity({
        action_type: 'update',
        entity_type: 'athlete',
        title: `Назначена программа "${prog?.name}" для ${athleteName}`,
        entity_id: athleteId,
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Ошибка при назначении программы');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sd_Modal isOpen={isOpen} onClose={onClose} title="Назначить программу" description={`Выберите тренировочный план для клиента ${athleteName}`}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Программа *</label>
          <div className="relative">
            <Dumbbell className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              required
              value={selectedProgramId}
              onChange={(e) => setSelectedProgramId(e.target.value)}
              disabled={isFetching || programs.length === 0}
              className="w-full h-12 pl-11 pr-4 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-indigo-500 outline-none font-medium appearance-none"
            >
              {isFetching ? (
                <option>Загрузка...</option>
              ) : programs.length === 0 ? (
                <option value="">Нет доступных программ</option>
              ) : (
                programs.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.duration_weeks} нед.)</option>
                ))
              )}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Дата начала *</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full h-12 pl-11 pr-4 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} disabled={isLoading} className="flex-1 h-12 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50">
            Отмена
          </button>
          <button type="submit" disabled={isLoading || !selectedProgramId} className="flex-[2] h-12 rounded-xl font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-50">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Назначить'}
          </button>
        </div>
      </form>
    </Sd_Modal>
  );
};
