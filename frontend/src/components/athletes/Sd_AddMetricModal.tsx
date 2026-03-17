import { useState } from 'react';
import { motion } from 'framer-motion';
import { Weight, Plus, Loader2 } from 'lucide-react';
import { Sd_Modal } from '../ui/Sd_Modal';
import { sd_pb } from '../../lib/sd_pocketbase';
import { sd_logActivity } from '../../utils/sd_activityLogger';
import type { sd_Athlete, sd_Metric } from '../../types/sd_types';

interface Sd_AddMetricModalProps {
  isOpen: boolean;
  onClose: () => void;
  athleteId: string;
  athlete?: sd_Athlete; // Pass full object for body fat calculation
  onSuccess: (newMetric: sd_Metric) => void;
}

export const Sd_AddMetricModal = ({ isOpen, onClose, athleteId, athlete, onSuccess }: Sd_AddMetricModalProps) => {
  const [sd_isLoading, setSd_IsLoading] = useState(false);
  const [sd_error, setSd_Error] = useState('');

  // Form State
  const [sd_weight, setSd_Weight] = useState('');
  const [sd_chest, setSd_Chest] = useState('');
  const [sd_waist, setSd_Waist] = useState('');
  const [sd_hips, setSd_Hips] = useState('');
  const [sd_bicep, setSd_Bicep] = useState('');
  const [sd_neck, setSd_Neck] = useState('');
  const [sd_measuredAt, setSd_MeasuredAt] = useState(new Date().toISOString().split('T')[0]);

  const sd_handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sd_weight) {
      setSd_Error('Вес обязателен для заполнения');
      return;
    }

    setSd_Error('');
    setSd_IsLoading(true);

    try {
      // Automatic Body Fat Calculation (Navy Method)
      let bodyFat = undefined;
      if (athlete && sd_waist && sd_neck) {
        const height = athlete.height ?? athlete.height_cm ?? 170;
        const gender = athlete.gender || 'male';
        const w = Number(sd_waist);
        const n = Number(sd_neck);
        const h = Number(sd_hips);

        if (gender === 'male') {
          // Men: 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450
          bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(w - n) + 0.15456 * Math.log10(height)) - 450;
        } else if (h || gender === 'female') {
          // Women: 495 / (1.29579 - 0.35004 * log10(waist + hips - neck) + 0.22100 * log10(height)) - 450
          bodyFat = 495 / (1.29579 - 0.35004 * Math.log10(w + (h || 0) - n) + 0.22100 * Math.log10(height)) - 450;
        }

        if (bodyFat !== undefined && (isNaN(bodyFat) || !isFinite(bodyFat) || bodyFat < 2 || bodyFat > 60)) {
          bodyFat = undefined;
        } else if (bodyFat !== undefined) {
          bodyFat = Number(bodyFat.toFixed(1));
        }
      }

      const record = await sd_pb.collection('metrics').create<sd_Metric>({
        athlete_id: athleteId,
        weight: Number(sd_weight) || 0,
        chest: Number(sd_chest) || 0,
        waist: Number(sd_waist) || 0,
        hips: Number(sd_hips) || 0,
        bicep: Number(sd_bicep) || 0,
        neck: Number(sd_neck) || 0,
        body_fat: bodyFat,
        measured_at: new Date(sd_measuredAt).toISOString(),
      });

      onSuccess(record);

      await sd_logActivity({
        action_type: 'create',
        entity_type: 'measurement',
        title: `Новый замер: ${sd_weight} кг`,
        entity_id: record.id
      });
      // Reset form
      setSd_Weight('');
      setSd_Chest('');
      setSd_Waist('');
      setSd_Hips('');
      setSd_Bicep('');
      setSd_Neck('');
      setSd_MeasuredAt(new Date().toISOString().split('T')[0]);
      onClose();
    } catch (err: unknown) {
      console.error('[AddMetric] Error:', err);
      let sd_message = 'Ошибка при сохранении замера';

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
      title="Новый замер"
      description="Запишите текущие показатели клиента"
    >
      <form onSubmit={sd_handleSubmit} className="space-y-5">
        {sd_error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100 font-medium">
            {sd_error}
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Дата</label>
              <input
                type="date"
                required
                value={sd_measuredAt}
                onChange={(e) => setSd_MeasuredAt(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-transparent hover:border-gray-200 focus:bg-white focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all outline-none font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Вес (кг) *</label>
              <div className="relative">
                <Weight className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="85.5"
                  value={sd_weight}
                  onChange={(e) => setSd_Weight(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 rounded-xl bg-gray-50 border border-transparent hover:border-gray-200 focus:bg-white focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all outline-none font-medium placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-500 mb-3 ml-1">Обхваты (опционально, см)</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  step="0.5"
                  placeholder="Грудь"
                  value={sd_chest}
                  onChange={(e) => setSd_Chest(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-transparent hover:border-gray-200 focus:bg-white focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all outline-none text-sm font-medium placeholder:text-gray-400"
                />
              </div>
              <div>
                <input
                  type="number"
                  step="0.5"
                  placeholder="Талия"
                  value={sd_waist}
                  onChange={(e) => setSd_Waist(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-transparent hover:border-gray-200 focus:bg-white focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all outline-none text-sm font-medium placeholder:text-gray-400"
                />
              </div>
              <div>
                <input
                  type="number"
                  step="0.5"
                  placeholder="Бедра"
                  value={sd_hips}
                  onChange={(e) => setSd_Hips(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-transparent hover:border-gray-200 focus:bg-white focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all outline-none text-sm font-medium placeholder:text-gray-400"
                />
              </div>
              <div>
                <input
                  type="number"
                  step="0.5"
                  placeholder="Шея"
                  value={sd_neck}
                  onChange={(e) => setSd_Neck(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-transparent hover:border-gray-200 focus:bg-white focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all outline-none text-sm font-medium placeholder:text-gray-400"
                />
              </div>
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
            {sd_isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /> Сохранить</>}
          </motion.button>
        </div>
      </form>
    </Sd_Modal>
  );
};
