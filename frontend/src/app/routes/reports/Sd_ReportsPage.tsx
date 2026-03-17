import { motion } from 'framer-motion';
import { BarChart3, LineChart, PieChart, Construction, Sparkles } from 'lucide-react';

export const Sd_ReportsPage = () => {
  return (
    <div className="w-full h-full min-h-[80vh] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Мягкие свечения на фоне */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-zinc-400/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 200, damping: 20 }}
        className="relative z-10 max-w-2xl w-full"
      >
        <div className="bg-white/60 backdrop-blur-2xl border border-zinc-200/50 rounded-[2.5rem] p-10 lg:p-14 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.05)] ring-1 ring-white/60 text-center relative overflow-hidden group">
          
          {/* Плавающие иконки на фоне */}
          <motion.div 
            animate={{ y: [0, -10, 0], rotate: [0, -5, 0] }} 
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-10 left-10 text-zinc-300/40"
          >
            <BarChart3 className="w-16 h-16" strokeWidth={1} />
          </motion.div>
          <motion.div 
            animate={{ y: [0, 15, 0], rotate: [0, 10, 0] }} 
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-12 right-12 text-rose-300/30"
          >
            <PieChart className="w-20 h-20" strokeWidth={1} />
          </motion.div>
          <motion.div 
            animate={{ y: [0, -12, 0], x: [0, 10, 0] }} 
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-20 right-20 text-indigo-300/20"
          >
            <LineChart className="w-12 h-12" strokeWidth={1} />
          </motion.div>

          <div className="relative z-20 flex flex-col items-center">
            <div className="w-24 h-24 bg-gradient-to-tr from-zinc-900 to-zinc-700 rounded-3xl flex items-center justify-center text-white mb-8 shadow-xl shadow-zinc-900/20 relative">
              <Construction className="w-10 h-10" />
              <div className="absolute -top-2 -right-2 bg-rose-500 rounded-full p-1.5 shadow-lg shadow-rose-500/40 border-2 border-white">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight mb-4">
              Аналитика в разработке
            </h1>
            
            <p className="text-lg text-zinc-500 max-w-md mx-auto font-medium leading-relaxed mb-10">
              Совсем скоро здесь появится мощная аналитика. Вы сможете отслеживать прогресс клиентов, объемы тренировок и финансовые отчеты в реальном времени.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <div className="px-6 py-3 bg-zinc-100/80 rounded-2xl border border-zinc-200/50 flex items-center gap-3 text-sm font-semibold text-zinc-600">
                <BarChart3 className="w-4 h-4 text-zinc-400" /> Сводки
              </div>
              <div className="px-6 py-3 bg-rose-50/80 rounded-2xl border border-rose-100/50 flex items-center gap-3 text-sm font-semibold text-rose-600">
                <LineChart className="w-4 h-4 text-rose-400" /> Прогресс
              </div>
              <div className="px-6 py-3 bg-indigo-50/80 rounded-2xl border border-indigo-100/50 flex items-center gap-3 text-sm font-semibold text-indigo-600">
                <PieChart className="w-4 h-4 text-indigo-400" /> Финансы
              </div>
            </div>
            
          </div>
        </div>
      </motion.div>
    </div>
  );
};
