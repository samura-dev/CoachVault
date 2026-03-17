import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle2, Clock, Trash2, Calendar } from 'lucide-react';
import { sd_pb } from '../../lib/sd_pocketbase';
import { sd_useAuthStore } from '../../stores/sd_useAuthStore';
import type { sd_Reminder } from '../../types/sd_types';
import { cn } from '../../lib/sd_utils';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Sd_NotificationsProps {
  onAddClick: () => void;
  sd_refreshTrigger?: number;
}

export const Sd_Notifications = ({ onAddClick, sd_refreshTrigger }: Sd_NotificationsProps) => {
  const { sd_user } = sd_useAuthStore();
  type sd_ReminderWithExpand = sd_Reminder & { expand?: { athlete_id?: { name?: string } } };
  const [sd_reminders, setSd_Reminders] = useState<sd_ReminderWithExpand[]>([]);
  const [sd_isLoading, setSd_IsLoading] = useState(true);

  const fetchReminders = useCallback(async () => {
    if (!sd_user) return;
    setSd_IsLoading(true);
    try {
      const records = await sd_pb.collection('reminders').getList<sd_ReminderWithExpand>(1, 10, {
        filter: `coach_id = "${sd_user.id}" && is_completed = false`,
        sort: 'due_date',
        expand: 'athlete_id'
      });
      setSd_Reminders(records.items);
    } catch (err) {
      console.error('[Reminders] Fetch error:', err);
      // Fallback or empty state
    } finally {
      setSd_IsLoading(false);
    }
  }, [sd_user]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders, sd_refreshTrigger]);

  const sd_toggleComplete = async (reminder: sd_Reminder) => {
    try {
      await sd_pb.collection('reminders').update(reminder.id, {
        is_completed: true
      });
      setSd_Reminders(prev => prev.filter(r => r.id !== reminder.id));
    } catch (err) {
      console.error('[Reminders] Update error:', err);
    }
  };

  const sd_deleteReminder = async (id: string) => {
    try {
      await sd_pb.collection('reminders').delete(id);
      setSd_Reminders(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('[Reminders] Delete error:', err);
    }
  };

  if (sd_isLoading) return (
    <div className="w-full h-48 flex items-center justify-center bg-white rounded-[2rem] border border-gray-100 shadow-sm">
      <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin opacity-50" />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          Напоминания
          {sd_reminders.length > 0 && (
            <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-[10px] flex items-center justify-center animate-pulse">
              {sd_reminders.length}
            </span>
          )}
        </h3>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={onAddClick}
          className="p-2 rounded-xl bg-orange-500 text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-colors"
        >
          <Calendar className="w-5 h-5" />
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {sd_reminders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="col-span-full p-8 rounded-[2rem] bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center group"
            >
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                <Bell className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 font-semibold">На сегодня всё спокойно!</p>
              <p className="text-gray-400 text-sm mt-1">Новых напоминаний нет.</p>
            </motion.div>
          ) : (
            sd_reminders.map((reminder, idx) => (
              <motion.div
                key={reminder.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ delay: idx * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
                className="group p-5 rounded-[2rem] bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 transition-all relative overflow-hidden"
              >
                {/* Type Indicator Bar */}
                <div className={cn(
                  "absolute left-0 top-0 bottom-0 w-1.5",
                  reminder.type === 'measurement' ? "bg-blue-500" :
                    reminder.type === 'payment' ? "bg-emerald-500" :
                      reminder.type === 'check_in' ? "bg-orange-500" : "bg-gray-400"
                )} />

                <div className="flex justify-between items-start mb-3 pl-2">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "p-2 rounded-xl text-white shadow-lg shadow-gray-500/10",
                      reminder.type === 'measurement' ? "bg-blue-500" :
                        reminder.type === 'payment' ? "bg-emerald-500" :
                          reminder.type === 'check_in' ? "bg-orange-500" : "bg-gray-400"
                    )}>
                      {reminder.type === 'measurement' ? <Clock className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                    </div>
                    {reminder.athlete_id && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] bg-orange-50 px-2 py-0.5 rounded-full">
                        {reminder.expand?.athlete_id?.name || 'Клиент'}
                      </span>
                    )}
                  </div>
                  <button onClick={() => sd_deleteReminder(reminder.id)} className="p-1 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="pl-2">
                  <h4 className="font-bold text-gray-900 group-hover:text-[var(--accent)] transition-colors mb-1 line-clamp-1">{reminder.title}</h4>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">{reminder.description}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400">
                      <Clock className="w-3.5 h-3.5" />
                      {format(new Date(reminder.due_date), 'd MMM, HH:mm', { locale: ru })}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => sd_toggleComplete(reminder)}
                      className="w-10 h-10 rounded-2xl bg-gray-50 hover:bg-green-50 text-gray-400 hover:text-green-600 transition-all flex items-center justify-center shadow-inner"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
