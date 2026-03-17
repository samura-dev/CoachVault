import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { sd_useAuthStore } from '../../stores/sd_useAuthStore';

export const Sd_LoginForm = () => {
  const [sd_email, sd_setEmail] = useState('');
  const [sd_password, sd_setPassword] = useState('');
  const { sd_login, sd_isLoading, sd_error, sd_clearError } = sd_useAuthStore();
  const navigate = useNavigate();

  const sd_handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sd_clearError();
    try {
      await sd_login(sd_email, sd_password);
      navigate('/dashboard');
    } catch {
      // Error is handled by store
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="sd_glass-card w-full max-w-md p-8 rounded-[24px]"
    >
      <div className="mb-8 text-center">
        <div className="w-12 h-12 mx-auto bg-orange-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-orange-500/20">
          <span className="text-white font-bold text-2xl">G</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">С возвращением</h1>
        <p className="text-gray-500 mt-2">Войдите в аккаунт Тренера</p>
      </div>

      <form onSubmit={sd_handleSubmit} className="space-y-6">
        {sd_error && (
          <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg text-center font-medium">
            {sd_error}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="text-gray-600 text-sm font-medium">Email адрес</label>
          <input
            id="email"
            type="email"
            placeholder="coach@example.com"
            value={sd_email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => sd_setEmail(e.target.value)}
            required
            className="sd_input"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="password" className="text-gray-600 text-sm font-medium">Пароль</label>
            <a href="#" className="text-sm font-medium text-orange-500 hover:underline">Забыли?</a>
          </div>
          <input
            id="password"
            type="password"
            value={sd_password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => sd_setPassword(e.target.value)}
            required
            className="sd_input"
          />
        </div>

        <button
          type="submit"
          className="sd_btn-primary"
          disabled={sd_isLoading}
        >
          {sd_isLoading ? 'Вход...' : 'Войти'}
        </button>
      </form>
    </motion.div>
  );
};
