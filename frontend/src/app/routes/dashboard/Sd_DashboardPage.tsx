import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useSdAthletes } from '../../../hooks/sd_useAthletes';
import { sd_useAuthStore } from '../../../stores/sd_useAuthStore';
import {
  Users, Activity, CheckCircle, AlertCircle,
  ArrowUpRight, Plus, Search, Filter, MoreHorizontal, FileText
} from 'lucide-react';
import { Sd_Notifications } from '../../../components/dashboard/Sd_Notifications';
import { useNavigate } from 'react-router-dom';
import { sd_translateGoal, sd_translateStatus, sd_getStatusColor, sd_getStatusBg } from '../../../utils/sd_translations';
import { Sd_AddReminderModal } from '../../../components/dashboard/Sd_AddReminderModal';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid } from 'recharts';
import { Sd_Select } from '../../../components/ui/Sd_Select';
import { sd_pb } from '../../../lib/sd_pocketbase';

const sd_chartFilterOptions = [
  { value: 'Год', label: 'Год' },
  { value: 'Месяц', label: 'Месяц' },
  { value: 'Неделя', label: 'Неделя' }
];

const sd_statusFilterOptions = [
  { value: 'all', label: 'Все' },
  { value: 'active', label: 'Активен' },
  { value: 'paused', label: 'Пауза' },
  { value: 'archived', label: 'Архив' }
];

// @designer: Premium Card with noise and magnetic effect
const Sd_PremiumCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  // If className doesn't include a background class, default to bg-white
  const hasBg = /bg-/.test(className);
  const bgClass = hasBg ? "" : "bg-white";

  return (
    <div
      className={`${bgClass} rounded-[2rem] p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.04),0_20px_25px_-5px_rgba(0,0,0,0.02)] border border-gray-100/50 relative overflow-hidden group/card ${className}`}
    >
      {/* Noise Texture */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none z-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export const Sd_DashboardPage = () => {
  const navigate = useNavigate();
  const { sd_user } = sd_useAuthStore();
  const { sd_athletes, sd_fetchAthletes } = useSdAthletes();

  const [sd_isReminderModalOpen, setSd_IsReminderModalOpen] = useState(false);
  const [sd_refreshReminders, setSd_RefreshReminders] = useState(0);

  // Filters State
  const [sd_chartFilter, setSd_ChartFilter] = useState('Август 2024');
  const [sd_workoutSearch, setSd_WorkoutSearch] = useState('');
  const [sd_workoutStatusFilter, setSd_WorkoutStatusFilter] = useState('all');

  const [sd_notesCount, setSd_NotesCount] = useState(0);
  const [sd_completedWorkoutsCount, setSd_CompletedWorkoutsCount] = useState(0);
  const [sd_monthlyGoal, setSd_MonthlyGoal] = useState({ current: 0, target: 20 });
  const [sd_dynamicChartData, setSd_DynamicChartData] = useState<{name: string, value: number}[]>([]);

  useEffect(() => {
    sd_fetchAthletes();

    const fetchStats = async () => {
      if (!sd_user) return;
      try {
        const notesRes = await sd_pb.collection('notes').getList(1, 1);
        setSd_NotesCount(notesRes.totalItems);

        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        firstDayOfMonth.setHours(0, 0, 0, 0);
        
        const workoutsRes = await sd_pb.collection('workout_logs').getList(1, 100, {
          filter: `is_completed = true`
        });
        setSd_CompletedWorkoutsCount(workoutsRes.totalItems);

        const thisMonthWorkouts = workoutsRes.items.filter(w => w.created >= firstDayOfMonth.toISOString()).length;
        setSd_MonthlyGoal({ current: thisMonthWorkouts, target: Math.max(20, sd_athletes.length * 4) || 20 });

        const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
        const chartData = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const nextD = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
          const val = workoutsRes.items.filter(w => w.created >= d.toISOString() && w.created < nextD.toISOString()).length;
          chartData.push({ name: months[d.getMonth()], value: val });
        }
        setSd_DynamicChartData(chartData);
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      }
    };

    fetchStats();
  }, [sd_fetchAthletes, sd_user, sd_athletes.length]);

  // Calculate dynamic stats
  const sd_activeCount = sd_athletes.filter(a => a.status === 'active').length;
  const sd_newCount = sd_athletes.filter(a => {
    if (!a.created) return false;
    const created = new Date(a.created);
    const now = new Date();
    return (now.getTime() - created.getTime()) < 7 * 24 * 60 * 60 * 1000;
  }).length;
  const sd_attentionCount = sd_athletes.filter(a => a.status === 'paused' || a.status === 'archived').length;
  const sd_monthlyProgress = sd_monthlyGoal.target > 0 ? Math.min(100, Math.round((sd_monthlyGoal.current / sd_monthlyGoal.target) * 100)) : 0;

  // Premium area chart data
  const sd_chartData = sd_dynamicChartData.length > 0 ? sd_dynamicChartData : [
    { name: 'Янв', value: 0 }, { name: 'Фев', value: 0 },
    { name: 'Мар', value: 0 }, { name: 'Апр', value: 0 },
    { name: 'Май', value: 0 }, { name: 'Июн', value: 0 },
  ];

  const sd_itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in zoom-in-95 duration-1000">
      {/* 1. Header Greeting */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-[2.25rem] font-bold text-gray-900 tracking-tight leading-tight">
            Доброе утро, {sd_user?.name?.split(' ')[0] || 'Тренер'}
          </h1>
          <p className="text-gray-400 text-base font-medium">
            Вот что происходит с твоими клиентами сегодня.
          </p>
        </div>
        <button
          onClick={() => setSd_IsReminderModalOpen(true)}
          className="bg-orange-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus className="w-5 h-5" />
          Новое событие
        </button>
      </div>

      {/* 2. Top Grid Layout - @frontend-engineer: tighter gaps (gap-4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Total Athletes Info */}
        <motion.div className="lg:col-span-4" variants={sd_itemVariants} initial="hidden" animate="show">
          <Sd_PremiumCard className="flex flex-col justify-between min-h-[420px]">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">База клиентов</h3>
                <div className="p-2 bg-gray-50 rounded-xl text-gray-400">
                  <Users className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-1">
                <h2 className="text-6xl font-black text-gray-900 tracking-tighter">
                  {sd_athletes.length}
                </h2>
                <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>+12% за неделю</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate('/athletes')}
                  className="flex-1 bg-[#1C1C1E] text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-gray-900/10 hover:shadow-gray-900/25 active:scale-95 transition-all"
                >
                  Управление
                </button>
                <button className="flex-1 bg-gray-50 text-gray-900 py-3.5 rounded-2xl font-bold text-sm border border-gray-100 hover:bg-gray-100 transition-all">
                  Экспорт
                </button>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-gray-50">
              <div className="flex justify-between items-center text-xs font-black text-gray-400 uppercase tracking-widest">
                <span>Распределение</span>
                <span className="text-orange-500 cursor-pointer hover:underline">Детали</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {[
                  { label: 'Актив', val: sd_activeCount, color: 'text-orange-500', bg: 'bg-orange-50' },
                  { label: 'Новые', val: sd_newCount, color: 'text-blue-500', bg: 'bg-blue-50' }
                ].map(stat => (
                  <div key={stat.label} className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-xl">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} font-black text-sm`}>
                      {stat.val}
                    </div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </Sd_PremiumCard>
        </motion.div>

        {/* 4 Status Cards */}
        <div className="lg:col-span-3 grid grid-cols-2 gap-4">
          {[
            { label: 'В работе', val: String(sd_activeCount || 0), icon: Activity, bg: 'bg-orange-500', text: 'text-white' },
            { label: 'Заметки', val: String(sd_notesCount), icon: FileText, bg: 'bg-white', text: 'text-gray-900' },
            { label: 'Тренировки', val: String(sd_completedWorkoutsCount), icon: CheckCircle, bg: 'bg-white', text: 'text-gray-900' },
            { label: 'Пауза', val: String(sd_attentionCount || 0), icon: AlertCircle, bg: 'bg-white', text: 'text-gray-900' },
          ].map((stat, i) => (
            <motion.div key={stat.label} variants={sd_itemVariants} initial="hidden" animate="show" transition={{ delay: i * 0.05 }}>
              <Sd_PremiumCard className={`p-0 h-[180px] flex flex-col items-center justify-center text-center group/status transition-all hover:translate-y-[-4px] ${stat.bg} ${stat.text}`}>
                <div className="flex flex-col items-center justify-center h-full w-full p-6">
                  <div className={`w-14 h-14 rounded-2xl mb-4 flex items-center justify-center transition-transform group-hover/status:scale-110 shadow-lg shadow-black/5 ${stat.bg === 'bg-white' ? 'bg-orange-50 text-orange-600' : 'bg-white/20 text-white'}`}>
                    <stat.icon className="w-7 h-7" />
                  </div>

                  <div className="space-y-1">
                    <h4 className={`text-4xl font-black leading-none tracking-tighter ${stat.bg === 'bg-orange-500' ? 'text-white' : 'text-gray-900'}`}>{stat.val}</h4>
                    <p className={`text-[11px] font-black opacity-60 uppercase tracking-[0.2em] mt-1`}>{stat.label}</p>
                  </div>
                </div>
              </Sd_PremiumCard>
            </motion.div>
          ))}
        </div>

        {/* Premium Dynamics Chart */}
        <motion.div className="lg:col-span-5" variants={sd_itemVariants} initial="hidden" animate="show">
          <Sd_PremiumCard className="flex flex-col h-full min-h-[300px]">
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-900">Динамика прогресса</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{sd_chartFilter === 'Год' ? 'Весь период' : 'Август 2024'}</p>
              </div>
              <div className="w-[120px]">
                <Sd_Select
                  value={sd_chartFilter}
                  onChange={(val) => setSd_ChartFilter(val)}
                  options={sd_chartFilterOptions}
                  className="bg-transparent border-0 text-gray-600 hover:text-gray-900 !px-0 !h-8 font-bold"
                />
              </div>
            </div>

            <div className="h-[250px] w-full mt-auto min-w-0">
              <ResponsiveContainer width="99%" height={250} minHeight={250} minWidth={0}>
                <AreaChart data={sd_chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sd_chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F97316" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#F97316" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 700 }}
                    dy={10}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={false} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '16px',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)',
                      padding: '12px 16px'
                    }}
                    labelStyle={{ fontWeight: 'black', marginBottom: '4px', fontSize: '10px', color: '#1C1C1E', textTransform: 'uppercase' }}
                    itemStyle={{ fontWeight: 'bold', fontSize: '12px', color: '#F97316' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#F97316"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#sd_chartGradient)"
                    animationDuration={2000}
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#F97316' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Sd_PremiumCard>
        </motion.div>
      </div>

      {/* 3. Bottom Row Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

        {/* Activity Index Pill */}
        <motion.div className="lg:col-span-3 h-full" variants={sd_itemVariants} initial="hidden" animate="show">
          <Sd_PremiumCard className="h-full flex flex-col items-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2 w-full text-left">Месячный план</h3>

            <div className="flex-1 flex flex-col items-center justify-center py-6">
              <div className="relative text-center">
                <div className="inline-flex items-center justify-center relative scale-[1.3]">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-gray-50" />
                    <motion.circle
                      cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="10" fill="transparent"
                      strokeDasharray={364.4}
                      initial={{ strokeDashoffset: 364.4 }}
                      animate={{ strokeDashoffset: 364.4 - (364.4 * sd_monthlyProgress) / 100 }}
                      transition={{ duration: 2, ease: "easeOut" }}
                      strokeLinecap="round"
                      className="text-orange-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-gray-900 leading-none">{sd_monthlyProgress}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full flex justify-between items-center pt-6 border-t border-gray-50 bg-white/50 relative z-20">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Сейчас</span>
                <p className="font-black text-gray-900 text-xl tracking-tighter">{sd_monthlyGoal.current}</p>
              </div>
              <div className="text-right space-y-1">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Цель</span>
                <p className="font-black text-gray-900 text-xl tracking-tighter">{sd_monthlyGoal.target}</p>
              </div>
            </div>
          </Sd_PremiumCard>
        </motion.div>

        {/* Recent Activities Table */}
        <motion.div className="lg:col-span-9" variants={sd_itemVariants} initial="hidden" animate="show">
          <Sd_PremiumCard className="min-h-[400px]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 relative z-50">
              <h3 className="text-lg font-bold text-gray-900">Последние тренировки</h3>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="flex-1 sm:flex-none flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 text-gray-400 focus-within:border-orange-500 focus-within:text-orange-500 transition-all">
                  <Search className="w-4 h-4 flex-none" />
                  <input
                    type="text"
                    placeholder="ПОИСК"
                    value={sd_workoutSearch}
                    onChange={(e) => setSd_WorkoutSearch(e.target.value)}
                    className="bg-transparent text-xs font-bold uppercase tracking-widest outline-none w-full sm:w-32 text-gray-900 placeholder-gray-400 min-w-0"
                  />
                </div>
                <div className="w-[120px] sm:w-[140px] flex-none relative z-50">
                  <Sd_Select
                    value={sd_workoutStatusFilter}
                    onChange={(val) => setSd_WorkoutStatusFilter(val)}
                    options={sd_statusFilterOptions}
                    icon={<Filter className="w-4 h-4" />}
                    className={sd_workoutStatusFilter !== 'all' ? 'bg-orange-50 border-orange-200 text-orange-500 h-10' : 'bg-gray-50 border-gray-100 text-gray-500 h-10'}
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto relative z-10 -mx-6 px-6 sm:mx-0 sm:px-0">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="text-gray-400 text-xs font-black uppercase tracking-[0.1em] border-b border-gray-50">
                    <th className="pb-4 pl-2 pr-4 font-black whitespace-nowrap">Клиент</th>
                    <th className="pb-4 px-4 font-black whitespace-nowrap">Направление</th>
                    <th className="pb-4 px-4 font-black whitespace-nowrap">Статус</th>
                    <th className="pb-4 px-4 font-black whitespace-nowrap">Дата</th>
                    <th className="pb-4 text-right pr-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50/50">
                  {sd_athletes
                    .filter(a => sd_workoutSearch ? a.name.toLowerCase().includes(sd_workoutSearch.toLowerCase()) : true)
                    .filter(a => sd_workoutStatusFilter !== 'all' ? a.status === sd_workoutStatusFilter : true)
                    .slice(0, 5).map((a, i) => (
                      <motion.tr
                        key={a.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + i * 0.05 }}
                        className="group hover:bg-gray-50/30 transition-all cursor-pointer"
                        onClick={() => navigate(`/athletes/${a.id}`)}
                      >
                        <td className="py-4 pl-2 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 flex-none rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs uppercase">
                              {a.name.charAt(0)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold text-gray-900 group-hover:text-orange-500 transition-colors truncate">{a.name}</p>
                              <p className="text-[10px] text-gray-400 font-medium truncate">@{a.id.slice(-4)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-xs font-bold text-gray-500 whitespace-nowrap">
                          {sd_translateGoal(a.goal)}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span
                            className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase inline-flex items-center gap-1.5"
                            style={{ backgroundColor: sd_getStatusBg(a.status), color: sd_getStatusColor(a.status) }}
                          >
                            {sd_translateStatus(a.status)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs font-bold text-gray-400 whitespace-nowrap">
                          {a.created ? new Date(a.created).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) : '—'}
                        </td>
                        <td className="py-4 text-right pr-2">
                          <button className="p-2 text-gray-300 hover:text-gray-900 rounded-lg hover:bg-white transition-all">
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                </tbody>
              </table>

              {sd_athletes.length === 0 && (
                <div className="py-16 flex flex-col items-center justify-center text-center text-gray-400 gap-3 opacity-30">
                  <Activity className="w-10 h-10" />
                  <p className="font-black text-[10px] uppercase tracking-widest">Активность не найдена</p>
                </div>
              )}
            </div>
          </Sd_PremiumCard>
        </motion.div>
      </div>

      {/* 4. Notifications */}
      <motion.section initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
        <Sd_Notifications onAddClick={() => setSd_IsReminderModalOpen(true)} sd_refreshTrigger={sd_refreshReminders} />
      </motion.section>

      <Sd_AddReminderModal isOpen={sd_isReminderModalOpen} onClose={() => setSd_IsReminderModalOpen(false)} onSuccess={() => setSd_RefreshReminders(prev => prev + 1)} />
    </div>
  );
};
