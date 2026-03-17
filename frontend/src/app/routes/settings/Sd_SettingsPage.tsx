import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Moon, TabletSmartphone, CreditCard, Check, Mail, Smartphone, RefreshCw, LogOut, ShieldCheck } from 'lucide-react';
import { sd_useSettingsStore } from '../../../stores/sd_useSettingsStore';
import { sd_useAuthStore } from '../../../stores/sd_useAuthStore';
import { useNavigate } from 'react-router-dom';

export const Sd_SettingsPage = () => {
  const [sd_activeTab, setSd_ActiveTab] = useState<string>('notifications');
  const sd_settings = sd_useSettingsStore();
  const sd_userStore = sd_useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    sd_userStore.sd_logout();
    navigate('/login');
  };

  const sd_tabs = [
    { id: 'notifications', title: 'Уведомления', icon: Bell, disabled: false },
    { id: 'security', title: 'Устройства и Безопасность', icon: ShieldCheck, disabled: false },
    { id: 'appearance', title: 'Внешний вид', icon: Moon, disabled: true },
    { id: 'billing', title: 'Подписка (Биллинг)', icon: CreditCard, disabled: true }
  ];

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1 mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Настройки</h1>
        <p className="text-gray-500 font-medium tracking-wide">Управление платформой и персонализация</p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full lg:w-72 flex flex-col gap-2 shrink-0">
          {sd_tabs.map(tab => {
            const isActive = sd_activeTab === tab.id;
            return (
              <button
                key={tab.id}
                disabled={tab.disabled}
                onClick={() => setSd_ActiveTab(tab.id)}
                className={`w-full text-left px-5 py-4 rounded-2xl flex items-center gap-4 transition-all duration-300 relative ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold' 
                    : tab.disabled 
                      ? 'bg-gray-50 cursor-not-allowed opacity-60 text-gray-400' 
                      : 'bg-white hover:bg-indigo-50 text-gray-700 font-semibold shadow-sm'
                }`}
              >
                <tab.icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-indigo-400'}`} />
                <span className="flex-1">{tab.title}</span>
                {tab.disabled && (
                  <span className="text-[10px] font-black uppercase tracking-wider bg-gray-200 text-gray-500 px-2 py-0.5 rounded-lg">Скоро</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {sd_activeTab === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="sd_bento-card p-0 overflow-hidden divide-y divide-gray-100">
                  <div className="p-6 md:p-8 bg-gradient-to-br from-indigo-50 to-white">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3"><Bell className="w-6 h-6 text-indigo-500"/> Push & Email</h3>
                    <p className="text-gray-500 font-medium text-sm mt-2 max-w-lg">Выберите, о каких событиях вы хотите получать моментальные оповещения. Это помогает быстрее реагировать на активность клиентов.</p>
                  </div>
                  
                  {/* Toggles */}
                  <ToggleRow 
                    icon={Mail} title="Email уведомления (Ежедневный свод)" 
                    description="Получайте утреннюю сводку о тренировках и замерах" 
                    checked={sd_settings.notifications.email} 
                    onChange={v => sd_settings.updateNotifications({ email: v })} 
                  />
                  
                  <ToggleRow 
                    icon={Smartphone} title="Push уведомления в браузере" 
                    description="Мгновенные оповещения, даже когда вкладка закрыта" 
                    checked={sd_settings.notifications.push} 
                    onChange={v => sd_settings.updateNotifications({ push: v })} 
                  />
                  
                   <ToggleRow 
                    icon={RefreshCw} title="Рассылка маркетинг и апдейты" 
                    description="Новинки платформы и специальные предложения от Coach Vault" 
                    checked={sd_settings.notifications.marketing} 
                    onChange={v => sd_settings.updateNotifications({ marketing: v })} 
                  />
                </div>
              </motion.div>
            )}

            {sd_activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                 <div className="sd_bento-card p-6 md:p-8 space-y-6">
                   <div className="flex items-center gap-4 mb-8">
                     <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center">
                       <TabletSmartphone className="w-6 h-6 text-indigo-500" />
                     </div>
                     <div>
                       <h3 className="text-xl font-bold text-gray-900">Устройства и Аккаунт</h3>
                       <p className="text-sm text-gray-500 font-medium">Безопасность вашего профиля</p>
                     </div>
                   </div>

                   <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                     <div>
                       <p className="font-bold text-gray-900">Текущая сессия</p>
                       <p className="text-sm text-gray-500 mt-1">Windows, Chrome, IP: Auto</p>
                     </div>
                     <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg tracking-wide uppercase">Активно</span>
                   </div>

                   <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-2xl transition-colors"
                   >
                     <LogOut className="w-5 h-5" />
                     Завершить сеанс (Выйти)
                   </button>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const ToggleRow = ({ icon: Icon, title, description, checked, onChange }: { icon: React.ElementType, title: string, description: string, checked: boolean, onChange: (c: boolean) => void }) => {
  return (
    <div className="p-6 md:p-8 flex items-center justify-between gap-6 hover:bg-gray-50/50 transition-colors">
      <div className="flex gap-4">
        <div className="mt-1">
          <Icon className="w-5 h-5 text-gray-400" />
        </div>
        <div>
          <h4 className="font-bold text-gray-900 text-lg mb-1">{title}</h4>
          <p className="text-sm font-medium text-gray-500 max-w-md leading-relaxed">{description}</p>
        </div>
      </div>
      
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-14 h-8 shrink-0 rounded-full transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 ${checked ? 'bg-indigo-600' : 'bg-gray-200'}`}
      >
        <span className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-sm transition-transform duration-300 flex items-center justify-center ${checked ? 'translate-x-6' : 'translate-x-0'}`}>
          {checked && <Check className="w-3.5 h-3.5 text-indigo-600" />}
        </span>
      </button>
    </div>
  );
};
