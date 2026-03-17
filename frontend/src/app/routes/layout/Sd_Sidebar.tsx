import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, FileText, Settings, HelpCircle, LogOut, Sun, Calculator, Dumbbell } from 'lucide-react';
import { sd_useAuthStore } from '../../../stores/sd_useAuthStore';
import { cn } from '../../../lib/sd_utils';

export const Sd_Sidebar = () => {
  const { pathname } = useLocation();
  const { sd_logout } = sd_useAuthStore();

  const sd_navItems = [
    { id: 'dashboard', path: '/dashboard', icon: LayoutDashboard },
    { id: 'athletes', path: '/athletes', icon: Users },
    { id: 'programs', path: '/programs', icon: Dumbbell },
    { id: 'notes', path: '/notes', icon: FileText },
    { id: 'calculator', path: '/calculator', icon: Calculator },
  ];

  const sd_bottomItems = [
    { id: 'settings', path: '/settings', icon: Settings },
    { id: 'help', path: '/help', icon: HelpCircle },
  ];

  const NavItem = ({ item }: { item: { id: string; path: string; icon: React.ElementType } }) => {
    const isActive = pathname.startsWith(item.path);

    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-full flex justify-center"
      >
        <Link
          to={item.path}
          className={cn(
            'flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 relative group',
            isActive
              ? 'bg-[#1C1C1E] text-white shadow-md'
              : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'
          )}
        >
          <item.icon
            className={cn(
              'w-5 h-5 transition-transform duration-300',
              isActive ? 'scale-110' : 'group-hover:scale-110'
            )}
            strokeWidth={isActive ? 2.5 : 2}
          />
        </Link>
      </motion.div>
    );
  };

  return (
    <>
      {/* Desktop Floating Slim Sidebar */}
      <aside className="hidden lg:flex w-20 flex-shrink-0 bg-white rounded-[2rem] flex-col py-6 shadow-sm border border-gray-100 items-center justify-between">
        <div className="flex flex-col items-center gap-6 w-full">
          {/* Theme Toggle placeholder (Match reference top left icon) */}
          <button className="w-12 h-12 flex items-center justify-center rounded-2xl text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-colors">
            <Sun className="w-5 h-5" strokeWidth={2.5} />
          </button>

          <div className="w-8 h-[1px] bg-gray-100 rounded-full" />

          {/* Main Navigation */}
          <nav className="flex flex-col gap-3 w-full">
            {sd_navItems.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col items-center gap-3 w-full pt-6 border-t border-gray-100">
          {sd_bottomItems.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full flex justify-center mt-2">
            <button
              onClick={sd_logout}
              className="flex items-center justify-center w-12 h-12 rounded-2xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all duration-300 group"
            >
              <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" strokeWidth={2} />
            </button>
          </motion.div>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar (Kept mostly intact for mobile responsiveness but cleaned up) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/90 backdrop-blur-xl border-t border-gray-100 z-50 px-6 flex items-center justify-between pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        {[...sd_navItems, ...sd_bottomItems.slice(0, 1)].map((item) => {
          const isActive = pathname.startsWith(item.path);
          return (
            <Link key={item.path} to={item.path} className="flex flex-col items-center gap-1 group relative">
              <div className={cn(
                "p-3 rounded-2xl transition-all duration-300",
                isActive ? "bg-[#1C1C1E] text-white shadow-md" : "text-gray-400 group-hover:bg-gray-50 group-hover:text-gray-900"
              )}>
                <item.icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              </div>
            </Link>
          )
        })}
      </div>
    </>
  );
};
