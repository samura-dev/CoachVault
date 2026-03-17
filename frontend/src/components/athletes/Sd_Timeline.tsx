import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { FileText, Weight, Camera, Image as ImageIcon, X } from 'lucide-react';
import { sd_pb } from '../../lib/sd_pocketbase';
import type { sd_Metric, sd_Note, sd_Photo } from '../../types/sd_types';
import { Sd_AddPhotoModal } from './Sd_AddPhotoModal';
import { Sd_AddNoteModal } from '../notes/Sd_AddNoteModal';

// Unified timeline record
type sd_TimelineItem =
  | { type: 'metric'; data: sd_Metric; date: Date }
  | { type: 'note'; data: sd_Note; date: Date }
  | { type: 'photo'; data: sd_Photo; date: Date };

interface Sd_TimelineProps {
  athleteId: string;
}

export const Sd_Timeline = ({ athleteId }: Sd_TimelineProps) => {
  const [sd_history, setSd_History] = useState<sd_TimelineItem[]>([]);
  const [sd_isLoading, setSd_IsLoading] = useState(true);

  // Modals state
  const [sd_isPhotoModalOpen, setSd_IsPhotoModalOpen] = useState(false);
  const [sd_isNoteModalOpen, setSd_IsNoteModalOpen] = useState(false);

  // Lightbox state
  const [sd_lightboxImage, setSd_LightboxImage] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setSd_IsLoading(true);
    try {
      const [metricsRes, notesRes, photosRes] = await Promise.all([
        sd_pb.collection('metrics').getList<sd_Metric>(1, 50, { filter: `athlete_id = "${athleteId}"` }),
        sd_pb.collection('notes').getList<sd_Note>(1, 50, { filter: `athlete_id = "${athleteId}"` }),
        sd_pb.collection('photos').getList<sd_Photo>(1, 50, { filter: `athlete_id = "${athleteId}"` }),
      ]);

      const sd_parseDate = (dateStr: string | undefined): Date => {
        if (!dateStr) return new Date();
        const d = new Date(dateStr.replace(' ', 'T')); // Handle PocketBase space-separator
        return isNaN(d.getTime()) ? new Date() : d;
      };

      const items: sd_TimelineItem[] = [
        ...metricsRes.items.map(m => ({ type: 'metric' as const, data: m, date: sd_parseDate(m.created) })),
        ...notesRes.items.map(n => ({ type: 'note' as const, data: n, date: sd_parseDate(n.created) })),
        ...photosRes.items.map(p => ({ type: 'photo' as const, data: p, date: sd_parseDate(p.created) }))
      ];

      // Sort by date DESC
      items.sort((a, b) => b.date.getTime() - a.date.getTime());

      setSd_History(items);
    } catch (err) {
      console.error("Error fetching timeline:", err);
    } finally {
      setSd_IsLoading(false);
    }
  }, [athleteId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900 tracking-tight">Лента прогресса</h3>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSd_IsNoteModalOpen(true)}
            className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 flex items-center justify-center transition-colors"
            title="Добавить заметку"
          >
            <FileText className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSd_IsPhotoModalOpen(true)}
            className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 hover:bg-[var(--accent)] hover:text-white flex items-center justify-center transition-colors shadow-sm"
            title="Добавить фото"
          >
            <Camera className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-2 sm:p-5 overflow-y-auto sd_custom-scroll">
        {sd_isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin opacity-50" />
          </div>
        ) : sd_history.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-center text-gray-400 gap-3 px-4">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-gray-300" />
            </div>
            <p className="text-sm">Лента пуста. Добавьте первый замер, фотографию или заметку.</p>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 border-l-2 border-gray-100 space-y-8 py-4">
            {sd_history.map((item, idx) => {
              // Determine styles based on type
              let icon = null;
              let bgIcon = '';
              let ringIcon = '';
              let content = null;

              if (item.type === 'metric') {
                icon = <Weight className="w-4 h-4" />;
                bgIcon = 'bg-orange-50 text-[var(--accent)]';
                ringIcon = 'ring-white';

                const m = item.data as sd_Metric;
                content = (
                  <div className="bg-orange-50/50 rounded-2xl p-4 border border-orange-100/50">
                    <p className="font-bold text-gray-900 text-lg mb-1">{m.weight} кг</p>
                    <div className="flex flex-wrap gap-2 text-xs font-medium text-gray-500">
                      {m.chest && <span className="bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm">Грудь: {m.chest}</span>}
                      {m.waist && <span className="bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm">Талия: {m.waist}</span>}
                      {m.hips && <span className="bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm">Бедра: {m.hips}</span>}
                      {m.bicep && <span className="bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm">Бицепс: {m.bicep}</span>}
                      {m.body_fat && <span className="bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm">Жир: {m.body_fat}%</span>}
                    </div>
                  </div>
                );
              }
              else if (item.type === 'note') {
                icon = <FileText className="w-4 h-4" />;
                bgIcon = 'bg-blue-50 text-blue-500';
                ringIcon = 'ring-white';

                const n = item.data as sd_Note;
                content = (
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-gray-700 text-sm whitespace-pre-wrap">
                    {n.content}
                  </div>
                );
              }
              else if (item.type === 'photo') {
                icon = <Camera className="w-4 h-4" />;
                bgIcon = 'bg-purple-50 text-purple-500'; // Accent color specifically for photos, using purple conceptually or sticking to Awwwards style (maybe dark/gray)
                bgIcon = 'bg-slate-800 text-white'; // Let's use dark slate for photos to avoid purple-ban
                ringIcon = 'ring-white';

                const p = item.data as sd_Photo;
                const imgUrl = `${sd_pb.baseUrl}/api/files/${p.collectionId}/${p.id}/${p.image}?thumb=400x400`;
                const fullUrl = `${sd_pb.baseUrl}/api/files/${p.collectionId}/${p.id}/${p.image}`;

                // Label text
                const labelMap: Record<string, string> = { front: 'Спереди', side: 'Сбоку', back: 'Со спины', other: 'Другое' };
                const labelText = labelMap[p.label] || 'Фото';

                content = (
                  <div className="space-y-2">
                    <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm max-w-sm cursor-pointer group"
                      onClick={() => setSd_LightboxImage(fullUrl)}
                    >
                      <img src={imgUrl} alt="Progress" className="w-full h-auto object-cover aspect-[3/4]" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-white drop-shadow-md" />
                      </div>
                      <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-md">
                        {labelText}
                      </div>
                    </motion.div>
                    {p.note && <p className="text-sm text-gray-500 italic pl-1">{p.note}</p>}
                  </div>
                );
              }

              return (
                <motion.div
                  key={item.data.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative"
                >
                  {/* Timeline dot */}
                  <div className={`absolute -left-6 sm:-left-8 top-0 -translate-x-1/2 w-8 h-8 rounded-full ring-4 ${ringIcon} flex items-center justify-center shadow-sm ${bgIcon}`}>
                    {icon}
                  </div>

                  {/* Content Block */}
                  <div className="mb-1 ml-4 sm:ml-2">
                    <h4 className="text-sm font-bold text-gray-900 capitalize-first mb-2">
                      {item.date instanceof Date && !isNaN(item.date.getTime())
                        ? format(item.date, 'd MMMM yyyy, HH:mm', { locale: ru })
                        : 'Дата не указана'}
                    </h4>
                    {content}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <Sd_AddPhotoModal
        isOpen={sd_isPhotoModalOpen}
        onClose={() => setSd_IsPhotoModalOpen(false)}
        athleteId={athleteId}
        onSuccess={() => {
          fetchHistory();
        }}
      />

      <Sd_AddNoteModal
        isOpen={sd_isNoteModalOpen}
        onClose={() => setSd_IsNoteModalOpen(false)}
        athleteId={athleteId}
        onSuccess={() => {
          fetchHistory();
        }}
      />

      {/* Lightbox for Photos */}
      <AnimatePresence>
        {sd_lightboxImage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSd_LightboxImage(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl cursor-zoom-out"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative z-10 w-full max-w-4xl max-h-[90vh] flex items-center justify-center pointer-events-none"
            >
              <img
                src={sd_lightboxImage}
                alt="Full Progress"
                className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl pointer-events-auto"
              />
              <button
                onClick={() => setSd_LightboxImage(null)}
                className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors pointer-events-auto"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
