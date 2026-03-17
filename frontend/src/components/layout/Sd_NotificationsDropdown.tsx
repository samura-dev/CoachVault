import { useEffect, useRef } from 'react';
import { Bell, Check, Trash2, Info, CheckCircle, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';
import { sd_useNotificationsStore } from '../../stores/sd_useNotificationsStore';
import { useNavigate } from 'react-router-dom';

interface Sd_NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const sd_getIconForType = (type: string) => {
  switch (type) {
    case 'success': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    case 'warning': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
    case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
    case 'info':
    default: return <Info className="w-5 h-5 text-blue-500" />;
  }
};

const sd_getBgForType = (type: string) => {
  switch (type) {
    case 'success': return 'bg-emerald-50';
    case 'warning': return 'bg-orange-50';
    case 'error': return 'bg-red-50';
    case 'info':
    default: return 'bg-blue-50';
  }
};

export const Sd_NotificationsDropdown = ({ isOpen, onClose }: Sd_NotificationsDropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const {
    sd_notifications,
    sd_unreadCount,
    sd_fetchNotifications,
    sd_markAsRead,
    sd_markAllAsRead,
    sd_deleteNotification,
    sd_subscribe,
    sd_unsubscribe
  } = sd_useNotificationsStore();

  useEffect(() => {
    sd_fetchNotifications();
    sd_subscribe();
    return () => {
      sd_unsubscribe();
    };
  }, [sd_fetchNotifications, sd_subscribe, sd_unsubscribe]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Find closest bell button to prevent immediate close if clicking toggle
      const toggleBtn = (event.target as Element).closest('[data-bell-toggle="true"]');
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && !toggleBtn) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <>
      {isOpen && (
        <div
          ref={dropdownRef}
          className="fixed inset-x-4 top-[72px] sm:absolute sm:inset-x-auto sm:top-14 sm:right-0 w-auto sm:w-96 bg-white/95 sm:bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1),0_20px_25px_-5px_rgba(0,0,0,0.05)] border border-white/50 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* Header */}
          <div className="p-5 border-b border-gray-100/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-gray-900">Уведомления</h3>
              {sd_unreadCount > 0 && (
                <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  {sd_unreadCount}
                </span>
              )}
            </div>
            {sd_unreadCount > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); sd_markAllAsRead(); }}
                className="text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors"
              >
                Прочитать все
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[60vh] overflow-y-auto no-scrollbar pb-2">
            {sd_notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 mb-4">
                  <Bell className="w-8 h-8" />
                </div>
                <p className="text-sm font-bold text-gray-900">Нет уведомлений</p>
                <p className="text-xs text-gray-400 mt-1">Здесь будут появляться важные события</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {sd_notifications.map((notification, i) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-50 last:border-0 relative group hover:bg-gray-50/50 transition-colors animate-in fade-in slide-in-from-right-2 duration-300 ${!notification.is_read ? 'bg-orange-50/30' : ''}`}
                    style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
                    onClick={() => {
                      if (!notification.is_read) sd_markAsRead(notification.id);
                      if (notification.link) {
                        navigate(notification.link);
                        onClose();
                      }
                    }}
                  >
                    {!notification.is_read && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 rounded-r-full" />
                    )}
                    <div className="flex gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${sd_getBgForType(notification.type)}`}>
                        {sd_getIconForType(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-sm font-bold text-gray-900 truncate pr-2">{notification.title}</h4>
                          <span className="text-[10px] font-bold text-gray-400 shrink-0">
                            {notification.created ? new Date(notification.created).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                        {notification.message && (
                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{notification.message}</p>
                        )}
                        {notification.link && (
                          <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-orange-500 hover:text-orange-600 cursor-pointer">
                            Смотреть
                            <ArrowRight className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="absolute right-4 top-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.is_read && (
                        <button
                          onClick={(e) => { e.stopPropagation(); sd_markAsRead(notification.id); }}
                          className="w-7 h-7 bg-white rounded-lg shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-emerald-500 hover:border-emerald-200 transition-all"
                          title="Отметить прочитанным"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); sd_deleteNotification(notification.id); }}
                        className="w-7 h-7 bg-white rounded-lg shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition-all"
                        title="Удалить"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
