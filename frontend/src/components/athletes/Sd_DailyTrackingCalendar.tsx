import { useState, useEffect, useCallback } from 'react';
import { sd_pb } from '../../lib/sd_pocketbase';
import { format, subDays, startOfDay, isSameDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Loader2, Plus } from 'lucide-react';
import { Sd_DailyTrackingModal } from './Sd_DailyTrackingModal';

export const Sd_DailyTrackingCalendar = ({ athleteId }: { athleteId: string }) => {
  type sd_DailyTrackingRecord = {
    id: string;
    date: string;
    calories?: number;
    protein?: number;
    water?: number;
    steps?: number;
    notes?: string;
    is_perfect?: boolean;
  };

  const [records, setRecords] = useState<sd_DailyTrackingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRecords = useCallback(async () => {
    setIsLoading(true);
    try {
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
      const res = await sd_pb.collection('daily_tracking').getList<sd_DailyTrackingRecord>(1, 50, {
        filter: `athlete_id = "${athleteId}" && date >= "${thirtyDaysAgo}"`,
        sort: '-date',
      });
      setRecords(res.items);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [athleteId]);

  useEffect(() => {
    if (athleteId) fetchRecords();
  }, [athleteId, fetchRecords]);

  // Generate last 28 days (4 weeks) for a clean grid
  const days = Array.from({ length: 28 }).map((_, i) => {
    const d = subDays(startOfDay(new Date()), 27 - i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const record = records.find(r => r.date.startsWith(dateStr));
    return { date: d, record };
  });

  const getBlockColor = (record: sd_DailyTrackingRecord | undefined) => {
    if (!record) return 'bg-gray-100 hover:bg-gray-200 border-gray-100'; // Missing data
    if (record.is_perfect) return 'bg-green-500 hover:bg-green-600 border-green-600 shadow-sm shadow-green-500/20'; // Perfect
    return 'bg-orange-400 hover:bg-orange-500 border-orange-500 shadow-sm shadow-orange-400/20'; // Partial/Logged
  };

  const todayRecord = records.find(r => isSameDay(new Date(r.date), new Date()));

  return (
    <div className="w-full space-y-6">
      <div className="sd_bento-card relative overflow-hidden">
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Кольца активности</h3>
            <p className="text-sm font-medium text-gray-500 mt-1">Отслеживание привычек за последние 28 дней</p>
          </div>
          <button
            onClick={() => {
              setSelectedDate(new Date());
              setIsModalOpen(true);
            }}
            className="h-10 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl font-bold text-sm transition-colors flex items-center gap-2"
          >
            {todayRecord ? 'Изменить сегодня' : <><Plus className="w-4 h-4" /> Заполнить сегодня</>}
          </button>
        </div>

        {isLoading ? (
          <div className="h-32 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
          </div>
        ) : (
          <div className="relative z-10">
            {/* The Grid */}
            <div className="flex flex-wrap gap-2">
              {days.map((day, i) => (
                <div
                  key={i}
                  className="group relative"
                  onClick={() => {
                    setSelectedDate(day.date);
                    setIsModalOpen(true);
                  }}
                >
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${getBlockColor(day.record)}`}
                  >
                    <span className="text-[10px] sm:text-xs font-black text-white mix-blend-difference opacity-50 block">
                      {format(day.date, 'dd')}
                    </span>
                  </div>

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg opacity-0 -translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 transition-all z-20 shadow-xl">
                    <div className="font-bold mb-1">{format(day.date, 'd MMMM, EE', { locale: ru })}</div>
                    {day.record ? (
                      <div className="text-gray-300">
                        {(day.record.calories ?? 0) > 0 && <div>{day.record.calories} ккал</div>}
                        {(day.record.protein ?? 0) > 0 && <div>{day.record.protein}г белка</div>}
                        {day.record.is_perfect && <div className="text-green-400 font-bold mt-1">Идеальный день</div>}
                      </div>
                    ) : (
                      <div className="text-gray-400">Нет данных</div>
                    )}
                    <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 mt-6 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-gray-100" /> Пропуск</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-orange-400" /> Заполнен</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-green-500" /> Идеальный</div>
            </div>
          </div>
        )}
      </div>

      <Sd_DailyTrackingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        athleteId={athleteId}
        selectedDate={selectedDate}
        existingRecord={days.find(d => isSameDay(d.date, selectedDate))?.record}
        onSuccess={fetchRecords}
      />
    </div>
  );
};
