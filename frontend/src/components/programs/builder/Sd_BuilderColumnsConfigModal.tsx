import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Save, Loader2, Trash2 } from 'lucide-react';
import { sd_useAuthStore } from '../../../stores/sd_useAuthStore';
import { sd_pb } from '../../../lib/sd_pocketbase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const Sd_BuilderColumnsConfigModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { sd_user } = sd_useAuthStore();
  
  // Инициализируем стейт из профиля юзера
  const [columns, setColumns] = useState<string[]>(() => {
    if (Array.isArray(sd_user?.custom_set_columns)) {
      return sd_user.custom_set_columns;
    }
    return [];
  });
  
  const [newColumnName, setNewColumnName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleAddColumn = () => {
    const trimmed = newColumnName.trim();
    if (trimmed && !columns.includes(trimmed)) {
      setColumns([...columns, trimmed]);
      setNewColumnName('');
    }
  };

  const handleRemoveColumn = (col: string) => {
    setColumns(columns.filter(c => c !== col));
  };

  const handleSave = async () => {
    if (!sd_user) return;
    setIsSaving(true);
    try {
      await sd_pb.collection('users').update(sd_user.id, {
        custom_set_columns: columns
      });
      // Обновляем модель и стор авторизации
      await sd_pb.collection('users').authRefresh();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Ошибка при сохранении колонок');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Колонки таблицы</h2>
            <p className="text-sm text-gray-500 mt-1">Добавьте RPE, Темп, Отдых и др.</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Базовые колонки */}
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Базовые (нельзя удалить)</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">Повторения</span>
              <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">Вес (кг)</span>
            </div>
          </div>

          {/* Кастомные колонки */}
          <div>
            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-3">Ваши колонки</h3>
            <div className="space-y-2">
              <AnimatePresence>
                {columns.map(col => (
                  <motion.div 
                    key={col}
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="flex items-center justify-between p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50 group"
                  >
                    <span className="font-medium text-indigo-900">{col}</span>
                    <button 
                      onClick={() => handleRemoveColumn(col)}
                      className="text-indigo-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {columns.length === 0 && (
                <div className="text-sm text-gray-400 italic py-2">У вас пока нет своих колонок.</div>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <input 
                type="text"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddColumn()}
                placeholder="Новая колонка..."
                className="flex-1 h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none text-sm"
              />
              <button 
                onClick={handleAddColumn}
                disabled={!newColumnName.trim()}
                className="h-11 px-4 bg-gray-900 border border-transparent disabled:opacity-50 text-white rounded-xl font-medium shadow-sm flex items-center justify-center transition-all hover:bg-black"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full h-12 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl font-medium shadow-md flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 text-lg"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Сохранить настройки
          </button>
        </div>
      </motion.div>
    </div>
  );
};
