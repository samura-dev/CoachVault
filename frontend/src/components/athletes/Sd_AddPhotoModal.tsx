import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Image as ImageIcon, Loader2, UploadCloud } from 'lucide-react';
import { Sd_Modal } from '../ui/Sd_Modal';
import { sd_pb } from '../../lib/sd_pocketbase';
import type { sd_Photo } from '../../types/sd_types';
import { sd_logActivity } from '../../utils/sd_activityLogger';
import { Sd_Select } from '../ui/Sd_Select';

const sd_labelOptions = [
  { value: 'front', label: 'Спереди' },
  { value: 'side', label: 'Сбоку' },
  { value: 'back', label: 'Со спины' },
  { value: 'other', label: 'Другое' },
];

interface Sd_AddPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  athleteId: string;
  onSuccess: (newPhoto: sd_Photo) => void;
}

export const Sd_AddPhotoModal = ({ isOpen, onClose, athleteId, onSuccess }: Sd_AddPhotoModalProps) => {
  const [sd_isLoading, setSd_IsLoading] = useState(false);
  const [sd_error, setSd_Error] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [sd_file, setSd_File] = useState<File | null>(null);
  const [sd_previewUrl, setSd_PreviewUrl] = useState<string | null>(null);
  const [sd_label, setSd_Label] = useState<'front' | 'side' | 'back' | 'other'>('front');
  const [sd_note, setSd_Note] = useState('');
  const [sd_takenAt, setSd_TakenAt] = useState(new Date().toISOString().split('T')[0]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5242880) { // 5MB limit check based on pocketbase collection rule
        setSd_Error('Файл слишком большой. Максимальный размер 5MB.');
        return;
      }
      setSd_File(selectedFile);
      setSd_Error('');

      const objectUrl = URL.createObjectURL(selectedFile);
      setSd_PreviewUrl(objectUrl);
    }
  };

  const sd_handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sd_file) {
      setSd_Error('Пожалуйста, выберите фото.');
      return;
    }

    setSd_Error('');
    setSd_IsLoading(true);

    try {
      const formData = new FormData();
      formData.append('athlete_id', athleteId);
      formData.append('image', sd_file);
      formData.append('label', sd_label);
      if (sd_note) formData.append('note', sd_note);
      formData.append('taken_at', new Date(sd_takenAt).toISOString());

      const record = await sd_pb.collection('photos').create<sd_Photo>(formData);

      await sd_logActivity({
        action_type: 'create',
        entity_type: 'measurement',
        title: `Загружено фото замера (${sd_label === 'front' ? 'Спереди' : sd_label === 'side' ? 'Сбоку' : sd_label === 'back' ? 'Со спины' : 'Другое'})`,
        entity_id: record.id
      });

      onSuccess(record);

      // Cleanup
      if (sd_previewUrl) URL.revokeObjectURL(sd_previewUrl);
      setSd_File(null);
      setSd_PreviewUrl(null);
      setSd_Label('front');
      setSd_Note('');
      setSd_TakenAt(new Date().toISOString().split('T')[0]);
      onClose();
    } catch (err: unknown) {
      console.error(err);
      const sd_message = err instanceof Error ? err.message : 'Ошибка при загрузке фото';
      setSd_Error(sd_message);
    } finally {
      setSd_IsLoading(false);
    }
  };

  return (
    <Sd_Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Загрузить фото"
      description="Зафиксируйте физическую форму"
    >
      <form onSubmit={sd_handleSubmit} className="space-y-5">
        {sd_error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100 font-medium">
            {sd_error}
          </div>
        )}

        <div className="space-y-4">
          {/* File Upload Area */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Фотография</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`w-full aspect-video rounded-2xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all overflow-hidden relative group
                ${sd_previewUrl ? 'border-transparent bg-black/5' : 'border-gray-200 hover:border-[var(--accent)] hover:bg-orange-50/50 bg-gray-50'}`}
            >
              {sd_previewUrl ? (
                <>
                  <img src={sd_previewUrl} alt="Preview" className="w-full h-full object-contain" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white font-medium flex items-center gap-2">
                      <UploadCloud className="w-5 h-5" /> Изменить фото
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-[var(--accent)] transition-colors">
                  <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-1">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <p className="font-medium text-sm">Нажмите для загрузки файла</p>
                  <p className="text-xs text-gray-400">JPEG, PNG, WEBP до 5mb</p>
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/jpeg, image/png, image/webp"
              onChange={handleFileChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Ракурс</label>
              <Sd_Select
                value={sd_label}
                onChange={(val) => setSd_Label(val as 'front' | 'side' | 'back' | 'other')}
                options={sd_labelOptions}
                icon={<Camera className="w-5 h-5" />}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Дата</label>
              <input
                type="date"
                required
                value={sd_takenAt}
                onChange={(e) => setSd_TakenAt(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-transparent hover:border-gray-200 focus:bg-white focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all outline-none font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Комментарий (опционально)</label>
            <textarea
              value={sd_note}
              onChange={(e) => setSd_Note(e.target.value)}
              placeholder="Опишите изменения или условия съемки..."
              rows={3}
              className="w-full p-4 rounded-xl bg-gray-50 border border-transparent hover:border-gray-200 focus:bg-white focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all outline-none text-sm font-medium resize-none placeholder:text-gray-400 sd_custom-scroll"
            />
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
            {sd_isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Загрузить фото'}
          </motion.button>
        </div>
      </form>
    </Sd_Modal>
  );
};
