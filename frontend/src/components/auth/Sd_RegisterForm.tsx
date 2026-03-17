import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { sd_useAuthStore } from '../../stores/sd_useAuthStore';

export const Sd_RegisterForm = () => {
  const [sd_name, setName] = useState('');
  const [sd_email, setEmail] = useState('');
  const [sd_password, setPassword] = useState('');
  const { sd_register, sd_isLoading, sd_error, sd_clearError } = sd_useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sd_clearError();
    try {
      await sd_register(sd_email, sd_password, sd_name);
      navigate('/dashboard');
    } catch {
      // Error handled by store
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
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Создать аккаунт</h1>
        <p className="text-gray-500 mt-2">Начните управлять вашими клиентами сегодня</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {sd_error && (
          <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg text-center font-medium">
            {sd_error}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="name" className="text-gray-600 text-sm font-medium">Ваше Имя</label>
          <input
            id="name"
            placeholder="Иван Иванов"
            value={sd_name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            required
            className="sd_input"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-gray-600 text-sm font-medium">Email адрес</label>
          <input
            id="email"
            type="email"
            placeholder="coach@example.com"
            value={sd_email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
            className="sd_input"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-gray-600 text-sm font-medium">Пароль (мин. 8 символов)</label>
          <input
            id="password"
            type="password"
            value={sd_password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
            minLength={8}
            className="sd_input"
          />
        </div>

        <button
          type="submit"
          className="sd_btn-secondary mt-2"
          disabled={sd_isLoading}
        >
          {sd_isLoading ? 'Создание...' : 'Зарегистрироваться'}
        </button>
      </form>
    </motion.div>
  );
};
