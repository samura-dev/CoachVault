import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Camera, X } from 'lucide-react';
import { sd_pb, sd_PB_URL } from '../../lib/sd_pocketbase';
import type { sd_Photo } from '../../types/sd_types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Sd_UploadPhotoModal } from './Sd_UploadPhotoModal';

interface Props {
  athleteId: string;
}

const LABEL_TRANSLATIONS: Record<string, string> = {
  front: 'Спереди',
  side: 'Сбоку',
  back: 'Со спины',
  other: 'Другое'
};

export const Sd_PhotoGallery = ({ athleteId }: Props) => {
  const [sd_photos, setSd_Photos] = useState<sd_Photo[]>([]);
  const [sd_isLoading, setSd_IsLoading] = useState(true);
  const [sd_isUploadOpen, setSd_IsUploadOpen] = useState(false);
  
  // Lightbox 
  const [sd_selectedPhoto, setSd_SelectedPhoto] = useState<sd_Photo | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchPhotos = async () => {
      try {
        const res = await sd_pb.collection('photos').getList<sd_Photo>(1, 100, {
          filter: `athlete_id = "${athleteId}"`,
          sort: '-taken_at'
        });
        if (!cancelled) {
          setSd_Photos(res.items);
          setSd_IsLoading(false);
        }
      } catch (err) {
        console.error('Ошибка при загрузке фото:', err);
        if (!cancelled) setSd_IsLoading(false);
      }
    };
    
    fetchPhotos();
    return () => { cancelled = true; };
  }, [athleteId]);

  const handleDelete = async (photoId: string) => {
    const confirm = window.confirm('Вы точно хотите удалить это фото?');
    if (!confirm) return;

    try {
      await sd_pb.collection('photos').delete(photoId);
      setSd_Photos(prev => prev.filter(p => p.id !== photoId));
      if (sd_selectedPhoto?.id === photoId) setSd_SelectedPhoto(null);
    } catch (err) {
      console.error(err);
      alert('Ошибка при удалении');
    }
  };

  const getImageUrl = (photo: sd_Photo, thumb?: string) => {
    let url = `${sd_PB_URL}/api/files/${photo.collectionId}/${photo.id}/${photo.image}`;
    if (thumb) url += `?thumb=${thumb}`;
    return url;
  };

  if (sd_isLoading) {
    return <div className="py-20 flex justify-center"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="w-full space-y-8">
      {/* Шапка */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-gray-200/60 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-inner">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Галерея прогресса</h2>
            <p className="text-sm text-gray-500 font-medium">Фотографии "До / После"</p>
          </div>
        </div>
        <button
          onClick={() => setSd_IsUploadOpen(true)}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/30 w-full md:w-auto hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5" /> Загрузить фото
        </button>
      </div>

      {/* Grid */}
      {sd_photos.length === 0 ? (
        <div className="w-full border-2 border-dashed border-gray-200 rounded-[2rem] bg-gray-50/50 py-24 flex flex-col items-center justify-center text-center">
          <Camera className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-900">У клиента пока нет фотографий</h3>
          <p className="text-gray-500 max-w-sm mt-3 font-medium">Загрузите первое фото, чтобы начать отслеживать визуальный прогресс.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <AnimatePresence>
            {sd_photos.map(photo => (
              <motion.div
                key={photo.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative aspect-[3/4] bg-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-zoom-in"
                onClick={() => setSd_SelectedPhoto(photo)}
              >
                <img 
                  src={getImageUrl(photo, '400x400')} 
                  alt={photo.label}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Overlay (gradient top & bottom) */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-transparent to-gray-900/40 opacity-80" />
                
                {/* Top badges */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                  <div className="px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-lg border border-white/20 text-white text-xs font-bold tracking-wide uppercase">
                    {LABEL_TRANSLATIONS[photo.label] || photo.label}
                  </div>
                  
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(photo.id); }}
                    className="p-2 bg-white/20 hover:bg-red-500/80 backdrop-blur-md text-white rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Bottom info */}
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white text-sm font-bold truncate">
                    {format(new Date(photo.taken_at), 'd MMMM yyyy', { locale: ru })}
                  </p>
                  {photo.note && (
                    <p className="text-gray-300 text-xs font-medium truncate mt-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      {photo.note}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {sd_selectedPhoto && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSd_SelectedPhoto(null)}
              className="absolute inset-0 bg-zinc-950/90 backdrop-blur-sm"
            />
            
            <motion.div
              layoutId={sd_selectedPhoto.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-4xl max-h-[90vh] w-full bg-black rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
            >
              {/* Image side */}
              <div className="flex-1 bg-zinc-900 flex items-center justify-center p-0.5 md:min-h-[600px]">
                <img 
                  src={getImageUrl(sd_selectedPhoto)} 
                  className="w-full h-full object-contain rounded-[1.4rem]" 
                  alt="Full size preview" 
                />
              </div>
              
              {/* Sidebar Info */}
              <div className="w-full md:w-80 bg-zinc-950 p-6 md:p-8 flex flex-col text-white">
                <button
                  onClick={() => setSd_SelectedPhoto(null)}
                  className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all backdrop-blur-md"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="flex-1 space-y-6 mt-12 md:mt-4">
                  <div>
                    <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">Дата съемки</div>
                    <div className="text-2xl font-bold text-zinc-100">
                      {format(new Date(sd_selectedPhoto.taken_at), 'dd MMM yyyy', { locale: ru })}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-2">Ракурс</div>
                    <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-lg text-sm font-semibold border border-zinc-700/50">
                      {LABEL_TRANSLATIONS[sd_selectedPhoto.label] || sd_selectedPhoto.label}
                    </span>
                  </div>

                  {sd_selectedPhoto.note && (
                    <div>
                      <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-2">Заметка</div>
                      <p className="text-sm font-medium text-zinc-300 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
                        {sd_selectedPhoto.note}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-zinc-800 mt-auto">
                   <button
                    onClick={() => handleDelete(sd_selectedPhoto.id)}
                    className="w-full py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl font-bold transition-colors flex justify-center items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> Удалить
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Sd_UploadPhotoModal 
        isOpen={sd_isUploadOpen}
        onClose={() => setSd_IsUploadOpen(false)}
        athleteId={athleteId}
        onSuccess={(photo) => {
          setSd_Photos(prev => [photo, ...prev].sort((a,b) => new Date(b.taken_at).getTime() - new Date(a.taken_at).getTime()));
        }}
      />
    </div>
  );
};
