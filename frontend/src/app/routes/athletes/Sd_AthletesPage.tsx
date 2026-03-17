import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, MoreVertical, Plus, Filter, Search, ChevronDown } from 'lucide-react';
import { sd_pb } from '../../../lib/sd_pocketbase';
import type { sd_Athlete } from '../../../types/sd_types';
import { Sd_AddAthleteModal } from '../../../components/athletes/Sd_AddAthleteModal';
import { sd_translateGoal, sd_translateStatus, sd_getStatusColor, sd_getStatusBg } from '../../../utils/sd_translations';

export const Sd_AthletesPage = () => {
  const navigate = useNavigate();
  const [athletes, setAthletes] = useState<sd_Athlete[]>([]);
  const [sd_isModalOpen, setSd_IsModalOpen] = useState(false);

  // Search and Filter State
  const [sd_searchQuery, setSd_SearchQuery] = useState('');
  const [sd_statusFilter, setSd_StatusFilter] = useState<'all' | 'active' | 'paused' | 'archived'>('all');
  const [sd_isFilterOpen, setSd_IsFilterOpen] = useState(false);

  useEffect(() => {
    sd_pb
      .collection('athletes')
      .getList<sd_Athlete>(1, 50)
      .then((res) => setAthletes(res.items))
      .catch(console.error);
  }, []);

  // Filtering Logic
  const sd_filteredAthletes = athletes.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(sd_searchQuery.toLowerCase());
    const matchesStatus = sd_statusFilter === 'all' || a.status === sd_statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
      >
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-[var(--accent)]" />
            Клиенты
          </h1>
          <p className="text-[var(--text-secondary)] mt-1 ml-11 opacity-80">
            Управляйте базой ваших подопечных
          </p>
        </div>
        <motion.button
          onClick={() => setSd_IsModalOpen(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          className="h-12 px-6 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium rounded-xl transition-colors shadow-md shadow-orange-500/20 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Добавить клиента
        </motion.button>
      </motion.div>

      {/* Main Content Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.1 }}
        className="sd_bento-card"
      >
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[var(--accent)] transition-colors" />
            <input
              type="text"
              placeholder="Поиск по имени..."
              value={sd_searchQuery}
              onChange={(e) => setSd_SearchQuery(e.target.value)}
              className="h-12 w-full pl-[54px] pr-4 rounded-xl bg-gray-50 border border-transparent hover:border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all placeholder:text-gray-400 font-medium"
            />
          </div>

          <div className="relative w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSd_IsFilterOpen(!sd_isFilterOpen)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-50 text-gray-600 font-medium hover:bg-gray-100 border border-transparent hover:border-gray-200 shadow-sm transition-all w-full sm:w-auto justify-center"
            >
              <Filter className="w-4 h-4" />
              {sd_statusFilter === 'all' ? 'Все статусы' : sd_translateStatus(sd_statusFilter)}
              <ChevronDown className={`w-4 h-4 transition-transform ${sd_isFilterOpen ? 'rotate-180' : ''}`} />
            </motion.button>

            {sd_isFilterOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-20 p-2"
              >
                {(['all', 'active', 'paused', 'archived'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setSd_StatusFilter(status);
                      setSd_IsFilterOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${sd_statusFilter === status
                      ? 'bg-orange-50 text-[var(--accent)]'
                      : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    {status === 'all' ? 'Все статусы' : sd_translateStatus(status)}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>

        {/* List */}
        {sd_filteredAthletes.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-4">
              <Users className="w-10 h-10 text-orange-400" />
            </div>
            <p className="text-lg font-bold text-[var(--text-primary)]">Список пуст</p>
            <p className="text-[var(--text-secondary)] mt-1">
              {sd_searchQuery || sd_statusFilter !== 'all'
                ? 'Нет клиентов, соответствующих фильтрам'
                : 'Здесь пока нет ни одного клиента.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sd_filteredAthletes.map((a, i) => (
              <motion.div
                key={a.id}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-50px" }}
                variants={{
                  hidden: { opacity: 0, scale: 0.95, y: 20 },
                  show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24, delay: (i % 10) * 0.05 } }
                }}
                whileHover={{ scale: 1.02, y: -4, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/athletes/${a.id}`)}
                className="p-5 rounded-2xl border border-gray-100 hover:border-orange-100 bg-white shadow-sm hover:shadow-xl hover:shadow-orange-500/5 transition-all group relative overflow-hidden cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-lg shrink-0 shadow-inner group-hover:shadow-orange-200 transition-all">
                    {a.name.charAt(0)}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, backgroundColor: 'var(--bg-hover)' }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 -mr-2 -mt-2 rounded-lg text-gray-400 hover:text-gray-900 transition-colors"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </motion.button>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 text-lg group-hover:text-[var(--accent)] transition-colors line-clamp-1">{a.name}</h3>
                  <p className="text-gray-500 text-sm mt-1 line-clamp-1">Цель: {sd_translateGoal(a.goal)}</p>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <span
                    className="px-3 py-1.5 text-xs font-semibold rounded-full flex items-center gap-1.5 w-max shadow-sm"
                    style={{ backgroundColor: sd_getStatusBg(a.status), color: sd_getStatusColor(a.status) }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: sd_getStatusColor(a.status) }}></span>
                    {sd_translateStatus(a.status)}
                  </span>

                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                    <Users className="w-4 h-4 text-[var(--accent)]" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Modals */}
      <Sd_AddAthleteModal
        isOpen={sd_isModalOpen}
        onClose={() => setSd_IsModalOpen(false)}
        onSuccess={(newAthlete) => setAthletes([newAthlete, ...athletes])}
      />
    </div>
  );
};
