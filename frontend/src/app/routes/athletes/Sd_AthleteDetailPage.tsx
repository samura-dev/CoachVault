import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, AlertCircle, Settings } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { sd_pb } from '../../../lib/sd_pocketbase';
import type { sd_Athlete, sd_Metric, sd_ClientProgramRecord } from '../../../types/sd_types';
import { Sd_AddMetricModal } from '../../../components/athletes/Sd_AddMetricModal';
import { Sd_Timeline } from '../../../components/athletes/Sd_Timeline';
import { sd_translateGoal } from '../../../utils/sd_translations';
import { Sd_EditAthleteModal } from '../../../components/athletes/Sd_EditAthleteModal';
import { Sd_AssignProgramModal } from '../../../components/athletes/Sd_AssignProgramModal';
import { Sd_DailyTrackingCalendar } from '../../../components/athletes/Sd_DailyTrackingCalendar';
import { Sd_PhotoGallery } from '../../../components/athletes/Sd_PhotoGallery';
import { Plus, Dumbbell, Target } from 'lucide-react';

export const Sd_AthleteDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [sd_athlete, setSd_Athlete] = useState<sd_Athlete | null>(null);
  const [sd_metrics, setSd_Metrics] = useState<sd_Metric[]>([]);
  const [sd_isLoading, setSd_IsLoading] = useState(true);
  const [sd_error, setSd_Error] = useState('');
  const [sd_isMetricModalOpen, setSd_IsMetricModalOpen] = useState(false);
  const [sd_isEditModalOpen, setSd_IsEditModalOpen] = useState(false);
  const [sd_isAssignProgramModalOpen, setSd_IsAssignProgramModalOpen] = useState(false);
  const [sd_clientPrograms, setSd_ClientPrograms] = useState<sd_ClientProgramRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'plan' | 'diary' | 'photos'>('overview');

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const loadAthleteData = async () => {
      setSd_IsLoading(true);
      setSd_Error('');
      try {
        const [athleteRes, metricsRes, programsRes] = await Promise.all([
          sd_pb.collection('athletes').getOne<sd_Athlete>(id),
          sd_pb.collection('metrics').getList<sd_Metric>(1, 100, {
            filter: `athlete_id = "${id}"`,
            sort: 'measured_at'
          }),
          sd_pb.collection('client_programs').getList<sd_ClientProgramRecord>(1, 10, {
            filter: `athlete_id = "${id}" && status = "active"`,
            expand: 'program_id',
            sort: '-created'
          })
        ] as const);

        if (cancelled) return;

        if (!athleteRes) {
          setSd_Error('Клиент не найден');
          return;
        }

        setSd_Athlete(athleteRes);
        setSd_Metrics(metricsRes.items || []);
        setSd_ClientPrograms(programsRes.items);
      } catch (err: unknown) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Ошибка загрузки данных';
          setSd_Error(message);
        }
      } finally {
        if (!cancelled) {
          setSd_IsLoading(false);
        }
      }
    };

    loadAthleteData();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Chart Data preparation
  const chartData = sd_metrics.map(m => ({
    date: format(new Date(m.measured_at), 'd MMM', { locale: ru }),
    weight: m.weight,
    fullDate: format(new Date(m.measured_at), 'd MMMM yyyy', { locale: ru })
  }));

  // Progress logic
  const currentWeight = sd_metrics.length > 0 ? sd_metrics[sd_metrics.length - 1].weight : (sd_athlete?.start_weight || 0);
  const startWeight = sd_athlete?.start_weight || 0;
  const targetWeight = sd_athlete?.target_weight || 0;

  let sd_progressPercent = 0;
  if (Math.abs(startWeight - targetWeight) > 0) {
    const totalDiff = Math.abs(startWeight - targetWeight);
    const currentDiff = Math.abs(startWeight - currentWeight);
    sd_progressPercent = Math.min(100, Math.max(0, Math.round((currentDiff / totalDiff) * 100)));
  }

  const sd_progressStatus = sd_progressPercent >= 100 ? 'Достигнута' : sd_progressPercent > 0 ? 'В процессе' : 'На старте';

  if (sd_isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (sd_error || !sd_athlete) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Клиент не найден</h2>        <button
          onClick={() => navigate('/athletes')}
          className="px-6 py-2 bg-gray-100 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition-colors"
        >
          Вернуться к списку
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Top Navigation */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/athletes')}
        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition-colors group w-max"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        К списку клиентов
      </motion.button>

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sd_bento-card relative overflow-hidden flex flex-col md:flex-row gap-8 items-start md:items-center justify-between"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 z-10 w-full">
          <div className="relative shrink-0 flex self-center sm:self-auto">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-orange-100 to-orange-50 flex items-center justify-center text-orange-500 font-bold text-3xl shadow-inner border-4 border-white">
              {sd_athlete.name.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 right-0 sm:-right-1 w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
              <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full ${sd_athlete.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
            </div>
          </div>

          <div className="space-y-3 w-full text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight leading-tight">
              {sd_athlete.name}
            </h1>
            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 sm:gap-4 text-xs sm:text-sm font-medium text-gray-500 bg-white/50 px-3 py-1.5 rounded-lg border border-gray-100 w-full sm:w-fit">
              <span className="flex items-center gap-1.5">
                <TargetIcon goal={sd_athlete.goal} />
                {sd_translateGoal(sd_athlete.goal)}
              </span>
              <span className="hidden sm:block w-1 h-1 bg-gray-300 rounded-full shrink-0" />
              <span className="bg-white/60 px-2 py-0.5 rounded-md min-w-max">{sd_athlete.start_weight} кг ➔ {sd_athlete.target_weight} кг</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 z-10 w-full md:w-auto">
          {/* Edit Button */}
          <button
            onClick={() => setSd_IsEditModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-500 hover:text-black transition-colors font-medium text-sm"
          >
            <Settings className="w-4 h-4" />
            Редактировать
          </button>

          {/* Progress Status Card */}
          <div className="w-full md:w-72 bg-gray-50/50 rounded-2xl p-5 border border-gray-100 flex flex-col justify-center">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-gray-600">Прогресс к цели</span>
              <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-md">
                {sd_progressStatus}
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${sd_progressPercent}%` }}
                transition={{ duration: 1, delay: 0.2, type: 'spring' }}
                className="bg-[var(--accent)] h-2.5 rounded-full"
              />
            </div>

            <div className="flex justify-between text-xs font-medium text-gray-500">
              <span>{sd_athlete.start_weight}</span>
              <span>{sd_progressPercent}%</span>
              <span>{sd_athlete.target_weight}</span>
            </div>
          </div>
        </div>

        {/* Decorative glow */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-orange-500/5 blur-[80px] rounded-full mix-blend-multiply pointer-events-none" />
      </motion.div>

      {/* Tabs Layout */}
      <div className="flex flex-wrap items-center gap-1 p-1 bg-gray-100/80 backdrop-blur-sm rounded-2xl w-full sm:w-max">
        {(['overview', 'plan', 'diary', 'photos'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 sm:flex-none relative px-4 sm:px-6 py-2.5 text-sm font-bold transition-colors rounded-xl z-0"
          >
            {activeTab === tab && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-white shadow-sm rounded-xl -z-10"
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
            )}
            <span className={activeTab === tab ? "text-gray-900" : "text-gray-500"}>
              {tab === 'overview' ? 'Обзор' : tab === 'plan' ? 'План' : tab === 'diary' ? 'Дневник' : 'Активы'}
            </span>
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Left Column (Charts) */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="sd_bento-card h-[400px] flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Динамика веса</h3>
                <button
                  onClick={() => setSd_IsMetricModalOpen(true)}
                  className="text-sm font-medium text-[var(--accent)] hover:text-orange-600 transition-colors"
                >
                  Добавить замер
                </button>
              </div>
              <div className="flex-1 bg-white rounded-xl border border-gray-100 p-4 relative overflow-hidden flex flex-col">
                {sd_metrics.length < 2 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 gap-2">
                    <TrendingUp className="w-10 h-10 text-gray-300" />
                    <p>Недостаточно данных для графика.<br />Добавьте замеры.</p>
                  </div>
                ) : (
                  <div className="flex-1 w-full h-full min-h-[250px] min-w-0">
                    <ResponsiveContainer width="100%" height="100%" minHeight={250} minWidth={0}>
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F97316" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis
                          dataKey="date"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#9ca3af', fontSize: 12 }}
                          dy={10}
                        />
                        <YAxis
                          domain={['dataMin - 2', 'dataMax + 2']}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#9ca3af', fontSize: 12 }}
                        />
                        <Tooltip
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                          labelStyle={{ color: '#6b7280', marginBottom: '4px' }}
                          itemStyle={{ color: '#111827', fontWeight: 600 }}
                          formatter={(value: unknown) => {
                            const v = (typeof value === 'number' || typeof value === 'string') ? value : 0;
                            return [`${v} кг`, 'Вес'] as [string, string];
                          }}
                          labelFormatter={(label: unknown, payload: unknown) => {
                            const arr = Array.isArray(payload) ? payload : [];
                            const fullDate = (arr[0] as { payload?: { fullDate?: string } } | undefined)?.payload?.fullDate;
                            return fullDate || String(label ?? '');
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="weight"
                          stroke="#F97316"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorWeight)"
                          activeDot={{ r: 6, fill: '#F97316', stroke: '#fff', strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Detailed Measurements List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="sd_bento-card"
            >
              <div className="flex items-center gap-2 mb-6 text-gray-900">
                <TrendingUp className="w-5 h-5 text-[var(--accent)]" />
                <h3 className="text-lg font-bold">История замеров</h3>
              </div>

              <div className="overflow-x-auto -mx-6 px-6">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="py-4 pr-4 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Дата</th>
                      <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Вес (кг)</th>
                      <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Грудь (см)</th>
                      <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Талия (см)</th>
                      <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Бедра (см)</th>
                      <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Жир (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {[...sd_metrics].sort((a, b) => new Date(b.measured_at).getTime() - new Date(a.measured_at).getTime()).map((m, idx, arr) => {
                      const prev = arr[idx + 1];
                      const weightDiff = prev ? (m.weight - prev.weight).toFixed(1) : null;
                      const chestDiff = prev && m.chest && prev.chest ? (m.chest - prev.chest).toFixed(1) : null;
                      const waistDiff = prev && m.waist && prev.waist ? (m.waist - prev.waist).toFixed(1) : null;
                      const hipsDiff = prev && m.hips && prev.hips ? (m.hips - prev.hips).toFixed(1) : null;

                      return (
                        <tr key={m.id} className="group hover:bg-gray-50/50 transition-colors">
                          <td className="py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                            {format(new Date(m.measured_at), 'd MMM yyyy', { locale: ru })}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-gray-900">{m.weight}</span>
                              {weightDiff !== null && (
                                <div className={`flex items-center text-[10px] font-bold ${Number(weightDiff) >= 0 ? 'text-orange-500' : 'text-green-500'}`}>
                                  {Number(weightDiff) >= 0 ? '+' : ''}{weightDiff}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-600 font-medium">{m.chest || '—'}</span>
                            {chestDiff !== null && Number(chestDiff) !== 0 && (
                              <div className={`text-[10px] font-medium ${Number(chestDiff) > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                                {Number(chestDiff) > 0 ? '+' : ''}{chestDiff}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-600 font-medium">{m.waist || '—'}</span>
                            {waistDiff !== null && Number(waistDiff) !== 0 && (
                              <div className={`text-[10px] font-medium ${Number(waistDiff) > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                                {Number(waistDiff) > 0 ? '+' : ''}{waistDiff}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-600 font-medium">{m.hips || '—'}</span>
                            {hipsDiff !== null && Number(hipsDiff) !== 0 && (
                              <div className={`text-[10px] font-medium ${Number(hipsDiff) > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                                {Number(hipsDiff) > 0 ? '+' : ''}{hipsDiff}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600 font-medium">{m.body_fat ? `${m.body_fat}%` : '—'}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {sd_metrics.length === 0 && (
                <div className="py-12 text-center text-gray-400 border border-dashed border-gray-100 rounded-xl mt-4">
                  <p>История замеров пока пуста</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column (Timeline & Info) */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="sd_bento-card h-[400px]"
            >
              <Sd_Timeline athleteId={id || ''} />
            </motion.div>
          </div>
        </motion.div>
      )}

      {activeTab === 'plan' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full space-y-8"
        >
          {/* Nutrition Summary (if exists) */}
          {sd_athlete.nutrition_plan && (
            <div className="sd_bento-card bg-gradient-to-br from-indigo-900 to-indigo-950 text-white border-transparent">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-indigo-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">План питания</h3>
                    <p className="text-indigo-200 text-sm">Расчет от {format(new Date(sd_athlete.updated), 'd MMM yyyy', { locale: ru })}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black">{Math.round(sd_athlete.nutrition_plan.target_calories)} <span className="text-lg text-indigo-300 font-medium">ккал</span></div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="text-indigo-300 text-xs font-bold uppercase mb-1">Белки</div>
                  <div className="text-2xl font-bold">{sd_athlete.nutrition_plan.macros.p}г</div>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="text-indigo-300 text-xs font-bold uppercase mb-1">Жиры</div>
                  <div className="text-2xl font-bold">{sd_athlete.nutrition_plan.macros.f}г</div>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="text-indigo-300 text-xs font-bold uppercase mb-1">Углеводы</div>
                  <div className="text-2xl font-bold">{sd_athlete.nutrition_plan.macros.c}г</div>
                </div>
              </div>
            </div>
          )}

          {/* Active Programs */}
          <div className="sd_bento-card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-indigo-500" />
                <h3 className="text-lg font-bold text-gray-900">Активные программы</h3>
              </div>
              <button
                onClick={() => setSd_IsAssignProgramModalOpen(true)}
                className="text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Назначить
              </button>
            </div>

            {sd_clientPrograms.length === 0 ? (
              <div className="py-12 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center text-center">
                <Dumbbell className="w-8 h-8 text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">Нет активных программ</p>
                <p className="text-sm text-gray-400 mt-1">Здесь отобразятся назначенные тренировочные циклы.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sd_clientPrograms.map((cp) => {
                  const sd_hasProgram = Boolean(cp.expand?.program_id);
                  return (
                  <div key={cp.id} className="p-5 rounded-2xl border border-gray-100 bg-gray-50 flex items-center justify-between group">
                    <div>
                      <h4 className="font-bold text-gray-900">{cp.expand?.program_id?.name || 'Неизвестная программа'}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Старт: {format(new Date(cp.start_date), 'd MMM yyyy', { locale: ru })}
                        {cp.end_date && ` — Завершение: ${format(new Date(cp.end_date), 'd MMMM', { locale: ru })}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={sd_hasProgram ? () => navigate(`/athletes/${id}/program/${cp.id}`) : undefined}
                        disabled={!sd_hasProgram}
                        className={`px-4 py-2 bg-white rounded-xl shadow-sm text-sm font-bold border border-gray-200 transition-all opacity-0 group-hover:opacity-100 ${sd_hasProgram ? 'text-gray-700 hover:text-indigo-600' : 'text-gray-300 pointer-events-none'}`}
                      >
                        Подробнее
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const sd_confirm = window.confirm('Удалить программу у клиента?');
                          if (!sd_confirm) return;
                          await sd_pb.collection('client_programs').delete(cp.id);
                          setSd_ClientPrograms(prev => prev.filter(p => p.id !== cp.id));
                        }}
                        className="px-3 py-2 bg-white rounded-xl shadow-sm text-sm font-bold border border-gray-200 text-red-500 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                )})}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {activeTab === 'diary' && sd_athlete && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full space-y-8"
        >
          <Sd_DailyTrackingCalendar athleteId={sd_athlete.id} />
        </motion.div>
      )}

      {activeTab === 'photos' && sd_athlete && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          <Sd_PhotoGallery athleteId={sd_athlete.id} />
        </motion.div>
      )}

      <Sd_AddMetricModal
        isOpen={sd_isMetricModalOpen}
        onClose={() => setSd_IsMetricModalOpen(false)}
        athleteId={id || ''}
        athlete={sd_athlete}
        onSuccess={(newMetric) => {
          setSd_Metrics((prev) => [...prev, newMetric].sort((a, b) => new Date(b.measured_at).getTime() - new Date(a.measured_at).getTime()));
        }}
      />

      {sd_athlete && (
        <Sd_EditAthleteModal
          isOpen={sd_isEditModalOpen}
          onClose={() => setSd_IsEditModalOpen(false)}
          athlete={sd_athlete}
          onSuccess={(updated) => setSd_Athlete(updated)}
        />
      )}

      {sd_athlete && (
        <Sd_AssignProgramModal
          isOpen={sd_isAssignProgramModalOpen}
          onClose={() => setSd_IsAssignProgramModalOpen(false)}
          athleteId={sd_athlete.id}
          athleteName={sd_athlete.name}
          onSuccess={() => {
            // Refetch active programs
            sd_pb.collection('client_programs').getList<sd_ClientProgramRecord>(1, 10, {
              filter: `athlete_id = "${id}" && status = "active"`,
              expand: 'program_id',
              sort: '-created'
            }).then(res => setSd_ClientPrograms(res.items));
          }}
        />
      )}
    </div>
  );
};

// Helper component
const TargetIcon = ({ goal }: { goal: string }) => {
  if (goal === 'cutting') return <TrendingUp className="w-4 h-4 text-blue-500 rotate-180" />;
  if (goal === 'bulking') return <TrendingUp className="w-4 h-4 text-orange-500" />;
  return <TrendingUp className="w-4 h-4 text-green-500" />;
};
