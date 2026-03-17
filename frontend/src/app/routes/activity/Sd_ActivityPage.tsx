import { useEffect } from 'react';
import { motion, type Variants } from 'framer-motion';
import {
  Search,
  UserPlus,
  Edit3,
  Trash2,
  Users,
  Dumbbell,
  FileText,
  Ruler,
  ListCheck,
  ChevronRight,
  Activity,
  Filter,
  Calendar
} from 'lucide-react';
import { sd_useActivityStore, type Sd_ActivityLog } from '../../../stores/sd_useActivityStore';
import { Sd_Select } from '../../../components/ui/Sd_Select';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { Sd_ActivityActionType, Sd_ActivityEntityType } from '../../../utils/sd_activityLogger';

const sd_getActionIcon = (action_type: string) => {
  switch (action_type) {
    case 'create': return <UserPlus className="w-5 h-5 text-emerald-500" />;
    case 'update': return <Edit3 className="w-5 h-5 text-blue-500" />;
    case 'delete': return <Trash2 className="w-5 h-5 text-red-500" />;
    case 'status_change': return <Activity className="w-5 h-5 text-orange-500" />;
    default: return <ListCheck className="w-5 h-5 text-gray-500" />;
  }
};

const sd_getActionBg = (action_type: string) => {
  switch (action_type) {
    case 'create': return 'bg-emerald-50 border-emerald-100';
    case 'update': return 'bg-blue-50 border-blue-100';
    case 'delete': return 'bg-red-50 border-red-100';
    case 'status_change': return 'bg-orange-50 border-orange-100';
    default: return 'bg-gray-50 border-gray-100';
  }
};

const sd_getEntityIcon = (entity_type: string) => {
  switch (entity_type) {
    case 'athlete': return <Users className="w-4 h-4" />;
    case 'workout': return <Dumbbell className="w-4 h-4" />;
    case 'note': return <FileText className="w-4 h-4" />;
    case 'measurement': return <Ruler className="w-4 h-4" />;
    case 'program': return <ListCheck className="w-4 h-4" />;
    default: return null;
  }
};

const sd_getEntityName = (entity_type: string) => {
  switch (entity_type) {
    case 'athlete': return 'Клиент';
    case 'workout': return 'Тренировка';
    case 'note': return 'Заметка';
    case 'measurement': return 'Замер';
    case 'program': return 'Программа';
    case 'auth': return 'Авторизация';
    case 'system': return 'Система';
    default: return entity_type;
  }
};

const sd_actionOptions = [
  { value: 'all', label: 'Все действия' },
  { value: 'create', label: 'Создание' },
  { value: 'update', label: 'Обновление' },
  { value: 'delete', label: 'Удаление' },
  { value: 'status_change', label: 'Смена статуса' },
];

const sd_entityOptions = [
  { value: 'all', label: 'Все объекты' },
  { value: 'athlete', label: 'Клиенты' },
  { value: 'workout', label: 'Тренировки' },
  { value: 'note', label: 'Заметки' },
  { value: 'measurement', label: 'Замеры' },
];

const sd_dateOptions = [
  { value: 'all', label: 'За все время' },
  { value: 'today', label: 'Сегодня' },
  { value: 'week', label: 'За неделю' },
  { value: 'month', label: 'За месяц' },
  { value: 'year', label: 'За год' },
];

export const Sd_ActivityPage = () => {
  const navigate = useNavigate();
  const {
    sd_logs,
    sd_isLoading,
    sd_fetchLogs,
    sd_loadMore,
    sd_currentPage,
    sd_totalPages,
    sd_filterText,
    sd_filterAction,
    sd_filterEntity,
    sd_filterDate,
    sd_setFilters
  } = sd_useActivityStore();

  useEffect(() => {
    sd_fetchLogs();
  }, [sd_fetchLogs]);

  const sd_containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const sd_itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 overflow-hidden rounded-[2.5rem] bg-white p-8 pb-10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] relative">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-orange-100/50 via-orange-50/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-blue-50/40 via-transparent to-transparent rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

        <div className="relative z-10 space-y-2">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">История Активности</h1>
          <p className="text-gray-500 font-medium max-w-lg">Журнал всех ваших действий в системе. Отслеживайте изменения по клиентам, программам и тренировкам.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 bg-white/50 backdrop-blur-md p-4 rounded-3xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск по событиям..."
            value={sd_filterText}
            onChange={(e) => sd_setFilters({ text: e.target.value })}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm font-medium"
          />
        </div>

        <div className="w-[180px]">
          <Sd_Select
            value={sd_filterDate}
            onChange={(val) => sd_setFilters({ date: val as typeof sd_filterDate })}
            options={sd_dateOptions}
            icon={<Calendar className="w-4 h-4" />}
            className="bg-white"
          />
        </div>

        <div className="w-[180px]">
          <Sd_Select
            value={sd_filterAction}
            onChange={(val) => sd_setFilters({ action: val as Sd_ActivityActionType | 'all' })}
            options={sd_actionOptions}
            icon={<Filter className="w-4 h-4" />}
            className="bg-white"
          />
        </div>

        <div className="w-[180px]">
          <Sd_Select
            value={sd_filterEntity}
            onChange={(val) => sd_setFilters({ entity: val as Sd_ActivityEntityType | 'all' })}
            options={sd_entityOptions}
            icon={<ListCheck className="w-4 h-4" />}
            className="bg-white"
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)]">
        {sd_isLoading && sd_logs.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 rounded-full border-4 border-orange-100 border-t-orange-500 animate-spin"></div>
          </div>
        ) : sd_logs.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4 text-gray-300">
              <Activity className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Нет активности</h3>
            <p className="text-gray-500">По заданным фильтрам ничего не найдено.</p>
          </div>
        ) : (
          <motion.div
            variants={sd_containerVariants}
            initial="hidden"
            animate="show"
            className="relative"
          >
            {/* Timeline Line */}
            <div className="absolute left-[27px] top-4 bottom-4 w-px bg-gray-100 z-0"></div>

            <div className="space-y-8 relative z-10">
              {sd_logs.map((log: Sd_ActivityLog) => {
                const isClickable = log.entity_type === 'athlete' && log.entity_id;
                return (
                  <motion.div key={log.id} variants={sd_itemVariants} className="flex gap-6 group">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center shrink-0 z-10 transition-transform group-hover:scale-110 ${sd_getActionBg(log.action_type)}`}>
                      {sd_getActionIcon(log.action_type)}
                    </div>

                    {/* Content Card */}
                    <div
                      onClick={() => {
                        if (isClickable) navigate(`/athletes/${log.entity_id}`);
                      }}
                      className={`flex-1 bg-white border border-gray-100 rounded-3xl p-5 shadow-sm transition-all duration-300 ${isClickable ? 'cursor-pointer hover:shadow-md hover:border-orange-200' : ''}`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 text-gray-500 text-[10px] uppercase font-black tracking-widest leading-none">
                            {sd_getEntityIcon(log.entity_type)}
                            {sd_getEntityName(log.entity_type)}
                          </span>
                          <span className="text-xs font-bold text-gray-400">
                            {log.created ? format(new Date(log.created), "d MMM yyyy, HH:mm", { locale: ru }) : '—'}
                          </span>
                        </div>
                        {isClickable && (
                          <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-4 group-hover:translate-x-0 cursor-pointer">
                            Перейти <ChevronRight className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      <h4 className="text-base font-bold text-gray-900 mb-1">{log.title}</h4>

                      {Boolean(log.details) && (
                        <div className="text-sm text-gray-500 mt-2 p-3 bg-gray-50/50 rounded-xl leading-relaxed whitespace-pre-wrap">
                          {typeof log.details === 'string' 
                            ? log.details 
                            : Object.entries(log.details as Record<string, unknown>).map(([key, value]) => `${key}: ${value}`).join('\n')}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Load More Button */}
            {sd_currentPage < sd_totalPages && (
              <div className="mt-12 text-center">
                <button
                  onClick={sd_loadMore}
                  disabled={sd_isLoading}
                  className="px-8 py-3 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-900 hover:bg-gray-50 hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  {sd_isLoading ? 'Загрузка...' : 'Загрузить еще'}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};
