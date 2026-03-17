import { Search, Bell } from 'lucide-react';
import { sd_useAuthStore } from '../../../stores/sd_useAuthStore';
import { sd_useNotificationsStore } from '../../../stores/sd_useNotificationsStore';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Sd_NotificationsDropdown } from '../../../components/layout/Sd_NotificationsDropdown';
import { Sd_GlobalSearchModal } from '../../../components/layout/Sd_GlobalSearchModal';

export const Sd_Header = () => {
  const { sd_user } = sd_useAuthStore();
  const { sd_unreadCount } = sd_useNotificationsStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const sd_tabs = [
    { name: 'Обзор', path: '/dashboard' },
    { name: 'Активность', path: '/activity' },
    { name: 'Клиенты', path: '/athletes' },
    { name: 'Отчеты', path: '/reports' }
  ];

  return (
    <header className="w-full flex items-center justify-between shrink-0">
      {/* 1. Logo Area */}
      <div
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => {
          navigate('/dashboard');
          const mainEl = document.querySelector('main');
          if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      >
        <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white font-black shadow-md shadow-orange-500/20 relative overflow-hidden group-hover:shadow-lg group-hover:scale-105 transition-all">
          <span className="relative z-10 text-xl tracking-tighter">CV</span>
          <div className="absolute inset-0 bg-gradient-to-tr from-orange-600 to-transparent opacity-50"></div>
        </div>
        <span className="text-xl font-bold text-gray-900 tracking-tight group-hover:text-orange-500 transition-colors">Coach Vault</span>
      </div>

      {/* 2. Navigation Tabs (Pill) */}
      <div className="hidden lg:flex items-center bg-white rounded-full p-1.5 shadow-sm border border-gray-100">
        {sd_tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const isImplemented = ['/dashboard', '/athletes', '/activity', '/reports'].includes(tab.path);
          return (
            <motion.button
              key={tab.name}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (isImplemented) {
                  navigate(tab.path);
                } else {
                  alert('Этот раздел еще в разработке');
                }
              }}
              className={`px-6 py-2 rounded-full text-[13px] font-semibold transition-all duration-300 ${isActive
                ? 'bg-[#1C1C1E] text-white shadow-md font-bold'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              {tab.name}
            </motion.button>
          );
        })}
      </div>

      {/* 3. Actions & Profile */}
      <div className="flex items-center gap-4">
        {/* Icons Pill */}
        <div className="flex items-center gap-1 bg-white rounded-full p-1.5 shadow-sm border border-gray-100 relative">
          <button
            title="Поиск"
            onClick={() => setIsSearchOpen(true)}
            className="p-2.5 rounded-full text-gray-400 hover:text-black hover:bg-gray-50 transition-all hover:scale-110 active:scale-90"
          >
            <Search className="w-4 h-4" strokeWidth={2.5} />
          </button>

          <div className="relative">
            <button
              title="Уведомления"
              data-bell-toggle="true"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2.5 rounded-full text-gray-400 hover:text-black hover:bg-gray-50 transition-all hover:scale-110 active:scale-90 relative"
            >
              <Bell className="w-4 h-4" strokeWidth={2.5} />
              {sd_unreadCount > 0 && (
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-orange-500 rounded-full border border-white"></span>
              )}
            </button>
            <Sd_NotificationsDropdown
              isOpen={isNotificationsOpen}
              onClose={() => setIsNotificationsOpen(false)}
            />
          </div>

        </div>

        {/* Profile Dropdown Simulation */}
        <div
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 bg-white rounded-full p-1.5 pr-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="w-9 h-9 flex items-center justify-center rounded-full bg-orange-100 text-orange-600 font-bold text-sm">
            {sd_user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex flex-col hidden sm:flex">
            <span className="text-sm font-bold text-gray-900 leading-none">{sd_user?.name || 'Тренер'}</span>
            <span className="text-[11px] font-medium text-gray-400 mt-1">{sd_user?.email || 'admin@cv.ru'}</span>
          </div>
        </div>
      </div>

      <Sd_GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </header>
  );
};
