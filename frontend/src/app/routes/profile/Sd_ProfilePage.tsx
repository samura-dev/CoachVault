import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Key, Loader2, Camera, Activity, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { sd_Athlete } from '../../../types/sd_types';
import { sd_logActivity } from '../../../utils/sd_activityLogger';
import { sd_useAuthStore } from '../../../stores/sd_useAuthStore';
import { sd_pb } from '../../../lib/sd_pocketbase';

export const Sd_ProfilePage = () => {
  const { sd_user, sd_checkAuth } = sd_useAuthStore();

  const [sd_isUpdatingInfo, setSd_IsUpdatingInfo] = useState(false);
  const [sd_isUpdatingPassword, setSd_IsUpdatingPassword] = useState(false);

  const [sd_name, setSd_Name] = useState(sd_user?.name || '');
  const [sd_oldPassword, setSd_OldPassword] = useState('');
  const [sd_newPassword, setSd_NewPassword] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const [sd_infoMessage, setSd_InfoMessage] = useState({ type: '', text: '' });
  const [sd_pwdMessage, setSd_PwdMessage] = useState({ type: '', text: '' });
  const [sd_isRedirecting, setSd_IsRedirecting] = useState(false);

  const sd_handleSelfTrack = async () => {
    if (!sd_user) return;
    setSd_IsRedirecting(true);
    try {
      // Find if self-athlete exists
      const records = await sd_pb.collection('athletes').getList<sd_Athlete>(1, 1, {
        filter: `coach_id = "${sd_user.id}" && name ~ "(Личный прогресс)"`
      });

      let selfAthlete: sd_Athlete;

      if (records.items.length > 0) {
        selfAthlete = records.items[0];
      } else {
        // Create one
        selfAthlete = await sd_pb.collection('athletes').create<sd_Athlete>({
          coach_id: sd_user.id,
          name: `${sd_user.name || 'Тренер'} (Личный прогресс)`,
          goal: 'maintenance',
          status: 'active',
          start_weight: 70,
          target_weight: 70,
        });

        await sd_logActivity({
          action_type: 'create',
          entity_type: 'athlete',
          title: 'Создан профиль "Личный прогресс"',
          entity_id: selfAthlete.id
        });
      }

      navigate(`/athletes/${selfAthlete.id}`);
    } catch (err: unknown) {
      console.error('[SelfTrack Error]', err);
      const message = err instanceof Error ? err.message : 'Ошибка доступа к данным';
      setSd_InfoMessage({
        type: 'error',
        text: `Ошибка: ${message}. Возможно, данные введены некорректно.`
      });

      // Fallback: Try to find by name "Мастер" and coach_id if boolean flag fails
      try {
        const records = await sd_pb.collection('athletes').getList<sd_Athlete>(1, 1, {
          filter: `coach_id = "${sd_user.id}" && name ~ "Мастер"`
        });
        if (records.items.length > 0) {
          navigate(`/athletes/${records.items[0].id}`);
        }
      } catch (innerErr) {
        console.error('[SelfTrack Fallback Error]', innerErr);
      }
    } finally {
      setSd_IsRedirecting(false);
    }
  };

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sd_user?.id) return;

    setSd_IsUpdatingInfo(true);
    setSd_InfoMessage({ type: '', text: '' });

    try {
      const record = await sd_pb.collection('users').update(sd_user.id, {
        name: sd_name
      });
      sd_pb.authStore.save(sd_pb.authStore.token, record);
      sd_checkAuth();
      setSd_InfoMessage({ type: 'success', text: 'Данные успешно обновлены' });
    } catch (err: unknown) {
      console.error(err);
      const sd_message = err instanceof Error ? err.message : 'Ошибка обновления';
      setSd_InfoMessage({ type: 'error', text: sd_message });
    } finally {
      setSd_IsUpdatingInfo(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !sd_user?.id) return;

    setSd_IsUpdatingInfo(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const record = await sd_pb.collection('users').update(sd_user.id, formData);
      sd_pb.authStore.save(sd_pb.authStore.token, record);
      sd_checkAuth();
      setSd_InfoMessage({ type: 'success', text: 'Аватар обновлен' });
    } catch (err: unknown) {
      console.error(err);
      const sd_message = err instanceof Error ? err.message : 'Ошибка обновления аватара';
      setSd_InfoMessage({ type: 'error', text: sd_message });
    } finally {
      setSd_IsUpdatingInfo(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sd_user?.id || !sd_oldPassword || !sd_newPassword) return;

    setSd_IsUpdatingPassword(true);
    setSd_PwdMessage({ type: '', text: '' });

    try {
      await sd_pb.collection('users').update(sd_user.id, {
        oldPassword: sd_oldPassword,
        password: sd_newPassword,
        passwordConfirm: sd_newPassword
      });
      setSd_PwdMessage({ type: 'success', text: 'Пароль успешно изменён' });
      setSd_OldPassword('');
      setSd_NewPassword('');
    } catch (err: unknown) {
      console.error(err);
      const sd_message = err instanceof Error ? err.message : 'Ошибка смены пароля. Проверьте старый пароль.';
      setSd_PwdMessage({ type: 'error', text: sd_message });
    } finally {
      setSd_IsUpdatingPassword(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-1"
      >
        <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">Ваш профиль</h1>
        <p className="text-[var(--text-secondary)]">Управление личными данными и аккаунтом</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Basic Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.1 }}
          className="sd_bento-card flex flex-col items-center text-center col-span-1"
        >
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-32 h-32 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-4xl shadow-inner mb-6 relative group cursor-pointer overflow-hidden border-4 border-white"
          >
            {sd_user?.avatar ? (
              <img
                src={`${sd_pb.baseUrl}/api/files/users/${sd_user.id}/${sd_user.avatar}?thumb=128x128`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              sd_user?.name?.charAt(0) || 'U'
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
              <Camera className="w-6 h-6 text-white" />
              <span className="text-white text-xs font-medium">Изменить</span>
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            className="hidden"
            accept="image/jpeg, image/png, image/webp"
          />
          <h2 className="text-xl font-bold text-[var(--text-primary)]">{sd_user?.name || 'Тренер'}</h2>
          <p className="text-[var(--text-secondary)] mt-1">{sd_user?.email}</p>

          <div className="mt-8 w-full pt-6 border-t border-[var(--border)]">
            <div className="flex justify-between items-center text-sm mb-3">
              <span className="text-gray-500">Роль</span>
              <span className="font-semibold text-gray-900 bg-orange-50 px-2 py-1 rounded text-[var(--accent)]">Тренер Pro</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Статус</span>
              <span className="font-semibold text-[var(--success)] flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-[var(--success)] rounded-full animate-pulse"></span>
                Активен
              </span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: 'var(--accent-light)' }}
            whileTap={{ scale: 0.98 }}
            onClick={sd_handleSelfTrack}
            disabled={sd_isRedirecting}
            className="w-full mt-8 p-6 bg-white rounded-[var(--radius-lg)] flex items-center justify-between group transition-all shadow-sm hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                {sd_isRedirecting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Activity className="w-6 h-6" />}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-orange-600 uppercase tracking-wider">Личный учет</p>
                <h3 className="text-base font-semibold text-gray-900 leading-tight">Мой прогресс</h3>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-orange-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
          </motion.button>
        </motion.div>

        {/* Right Column: Edit Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.2 }}
          className="sd_bento-card col-span-1 md:col-span-2 space-y-6"
        >
          <h3 className="text-lg font-bold text-[var(--text-primary)] border-b border-[var(--border)] pb-4">Личные данные</h3>

          <form onSubmit={handleUpdateInfo} className="space-y-4">
            {sd_infoMessage.text && (
              <div className={`p-3 text-sm rounded-xl font-medium border ${sd_infoMessage.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                {sd_infoMessage.text}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Имя и Фамилия</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" value={sd_name} onChange={(e) => setSd_Name(e.target.value)} required className="sd_input pl-12" placeholder="Иван Иванов" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="email" defaultValue={sd_user?.email} className="sd_input pl-12 bg-gray-50 text-gray-500 cursor-not-allowed" disabled />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={sd_isUpdatingInfo}
                className="px-8 h-12 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium rounded-xl shadow-md shadow-orange-500/20 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {sd_isUpdatingInfo ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Обновить профиль'}
              </motion.button>
            </div>
          </form>

          <form onSubmit={handleUpdatePassword} className="space-y-4 pt-6 mt-6 border-t border-[var(--border)]">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Безопасность</h3>

            {sd_pwdMessage.text && (
              <div className={`p-3 text-sm rounded-xl font-medium border ${sd_pwdMessage.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                {sd_pwdMessage.text}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Текущий пароль</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input minLength={8} type="password" required value={sd_oldPassword} onChange={(e) => setSd_OldPassword(e.target.value)} placeholder="••••••••" className="sd_input pl-12" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Новый пароль</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input minLength={8} type="password" required value={sd_newPassword} onChange={(e) => setSd_NewPassword(e.target.value)} placeholder="Новый пароль" className="sd_input pl-12" />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={sd_isUpdatingPassword}
                className="px-8 h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl shadow-md transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {sd_isUpdatingPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Изменить пароль'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};
