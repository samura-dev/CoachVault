import { useState, useEffect } from 'react';
import { Loader2, User } from 'lucide-react';
import { Sd_Modal } from '../ui/Sd_Modal';
import { sd_pb } from '../../lib/sd_pocketbase';
import { sd_useAuthStore } from '../../stores/sd_useAuthStore';
import { sd_logActivity } from '../../utils/sd_activityLogger';
import type { sd_Athlete } from '../../types/sd_types';

interface NutritionPlan {
  tdee: number;
  target_calories: number;
  macros: { p: number; f: number; c: number };
  formula: string;
}

interface Sd_SaveNutritionModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: NutritionPlan;
}

export const Sd_SaveNutritionModal = ({ isOpen, onClose, plan }: Sd_SaveNutritionModalProps) => {
  const { sd_user } = sd_useAuthStore();
  const [athletes, setAthletes] = useState<sd_Athlete[]>([]);
  const [selectedAthleteId, setSelectedAthleteId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (isOpen && sd_user) {
      setIsFetching(true);
      sd_pb.collection('athletes').getFullList<sd_Athlete>({
        filter: `coach_id = "${sd_user.id}" && status = "active"`,
        sort: 'name',
      })
        .then(res => {
          setAthletes(res);
          if (res.length > 0) setSelectedAthleteId(res[0].id);
        })
        .catch(console.error)
        .finally(() => setIsFetching(false));
    }
  }, [isOpen, sd_user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAthleteId) return;

    setIsLoading(true);
    try {
      await sd_pb.collection('athletes').update(selectedAthleteId, {
        nutrition_plan: plan
      });

      const athlete = athletes.find(a => a.id === selectedAthleteId);

      await sd_logActivity({
        action_type: 'update',
        entity_type: 'measurement',
        title: `Обновлен план питания для клиента ${athlete?.name}`,
        entity_id: selectedAthleteId,
        details: { calories: Math.round(plan.target_calories) }
      });

      onClose();
    } catch (err) {
      console.error(err);
      alert('Ошибка при сохранении');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sd_Modal isOpen={isOpen} onClose={onClose} title="Сохранить план питания" description="Привязать расчетный план к профилю клиента">
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Выберите клиента</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedAthleteId}
              onChange={(e) => setSelectedAthleteId(e.target.value)}
              disabled={isFetching || athletes.length === 0}
              className="w-full h-12 pl-11 pr-4 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-[var(--accent)] outline-none font-medium appearance-none"
            >
              {isFetching ? (
                <option>Загрузка...</option>
              ) : athletes.length === 0 ? (
                <option>Нет доступных клиентов</option>
              ) : (
                athletes.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))
              )}
            </select>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 uppercase font-bold">Цель</div>
            <div className="text-xl font-black text-gray-900">{Math.round(plan.target_calories)} ккал</div>
          </div>
          <div className="flex gap-4 text-right">
            <div>
              <div className="text-[10px] text-gray-400 uppercase font-bold">Белки</div>
              <div className="font-bold text-rose-500">{plan.macros.p}г</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-400 uppercase font-bold">Жиры</div>
              <div className="font-bold text-amber-500">{plan.macros.f}г</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-400 uppercase font-bold">Углеводы</div>
              <div className="font-bold text-blue-500">{plan.macros.c}г</div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} disabled={isLoading} className="flex-1 h-12 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50">
            Отмена
          </button>
          <button type="submit" disabled={isLoading || !selectedAthleteId} className="flex-[2] h-12 rounded-xl font-semibold text-white bg-[#FF5D8F] hover:bg-[#ff477e] transition-colors shadow-lg shadow-[#FF5D8F]/20 flex items-center justify-center gap-2 disabled:opacity-50">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Сохранить план'}
          </button>
        </div>
      </form>
    </Sd_Modal>
  );
};
