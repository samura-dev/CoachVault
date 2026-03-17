import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Camera, Loader2 } from 'lucide-react';
import { sd_pb } from '../../lib/sd_pocketbase';
import type { sd_Photo } from '../../types/sd_types';
import { format } from 'date-fns';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  athleteId: string;
  onSuccess: (photo: sd_Photo) => void;
}

export const Sd_UploadPhotoModal = ({ isOpen, onClose, athleteId, onSuccess }: Props) => {
  const [sd_isUploading, setSd_IsUploading] = useState(false);
  const [sd_error, setSd_Error] = useState('');
  
  const [sd_file, setSd_File] = useState<File | null>(null);
  const [sd_preview, setSd_Preview] = useState<string | null>(null);
  
  const [sd_label, setSd_Label] = useState<'front' | 'side' | 'back' | 'other'>('front');
  const [sd_takenAt, setSd_TakenAt] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [sd_note, setSd_Note] = useState('');

  const sd_fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setSd_Error('Пожалуйста, выберите изображение (JPG, PNG, WEBP).');
      return;
    }
    
    // Больше 5 мб
    if (file.size > 5 * 1024 * 1024) {
      setSd_Error('Файл слишком большой. Максимум 5 МБ.');
      return;
    }

    setSd_Error('');
    setSd_File(file);
    
    // Превьюшка
    const reader = new FileReader();
    reader.onload = (e) => setSd_Preview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleClose = () => {
    setSd_File(null);
    setSd_Preview(null);
    setSd_Label('front');
    setSd_Note('');
    setSd_Error('');
    setSd_TakenAt(format(new Date(), 'yyyy-MM-dd'));
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sd_file) {
      setSd_Error('Выберите фотографию!');
      return;
    }

    setSd_IsUploading(true);
    setSd_Error('');

    try {
      const formData = new FormData();
      formData.append('athlete_id', athleteId);
      formData.append('image', sd_file);
      formData.append('label', sd_label);
      formData.append('taken_at', new Date(sd_takenAt).toISOString());
      if (sd_note) formData.append('note', sd_note);

      const record = await sd_pb.collection('photos').create<sd_Photo>(formData);
      onSuccess(record);
      handleClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setSd_Error('Ошибка загрузки: ' + err.message);
      } else {
        setSd_Error('Произошла неизвестная ошибка загрузки.');
      }
    } finally {
      setSd_IsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden"
        >
          <div className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">Загрузка фото</h2>
              <button
                onClick={handleClose}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {sd_error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-100">
                {sd_error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Зона загрузки / Превью */}
              <div>
                <input
                  type="file"
                  accept="image/jpeg, image/png, image/webp"
                  className="hidden"
                  ref={sd_fileInputRef}
                  onChange={handleFileChange}
                />
                
                {sd_preview ? (
                  <div className="relative w-full h-80 rounded-3xl overflow-hidden group">
                    <img src={sd_preview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <button
                        type="button"
                        onClick={() => sd_fileInputRef.current?.click()}
                        className="px-6 py-3 bg-white/20 text-white font-bold rounded-2xl hover:bg-white/30 backdrop-blur-md transition-all flex items-center gap-2"
                      >
                        <Camera className="w-5 h-5" /> Изменить фото
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => sd_fileInputRef.current?.click()}
                    className="w-full h-64 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center gap-4 text-gray-400 hover:text-indigo-500 hover:border-indigo-300 hover:bg-indigo-50/50 cursor-pointer transition-all"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                      <Upload className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-gray-700">Нажмите для загрузки</p>
                      <p className="text-sm mt-1">PNG, JPG, WEBP до 5 МБ</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Настройки фото */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Ракурс</label>
                  <select
                    value={sd_label}
                    onChange={(e) => setSd_Label(e.target.value as 'front' | 'side' | 'back' | 'other')}
                    className="w-full h-12 bg-gray-50 border border-gray-200 rounded-2xl px-4 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-medium transition-all"
                  >
                    <option value="front">Спереди (Фронт)</option>
                    <option value="side">Сбоку (Профиль)</option>
                    <option value="back">Сзади (Спина)</option>
                    <option value="other">Другое</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Дата съемки</label>
                  <input
                    type="date"
                    value={sd_takenAt}
                    max={format(new Date(), 'yyyy-MM-dd')}
                    onChange={(e) => setSd_TakenAt(e.target.value)}
                    className="w-full h-12 bg-gray-50 border border-gray-200 rounded-2xl px-4 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-medium transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Краткая заметка (необязательно)</label>
                <input
                  type="text"
                  value={sd_note}
                  onChange={(e) => setSd_Note(e.target.value)}
                  placeholder="Вес на фото: 85кг, старт сушки"
                  className="w-full h-12 bg-gray-50 border border-gray-200 rounded-2xl px-4 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-medium transition-all placeholder:text-gray-400"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={!sd_file || sd_isUploading}
                  className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
                >
                  {sd_isUploading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Загрузка...</>
                  ) : (
                    'Добавить фотографию'
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
