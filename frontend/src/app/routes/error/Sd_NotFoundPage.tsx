import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const Sd_NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-tr from-[#FFF7ED] via-white to-[#F8F8FA]">
      {/* Decorative blurred blobs for Neumorphism/Glassmorphism feel */}
      <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-orange-400/10 rounded-full mix-blend-multiply filter blur-[80px]" />
      <div className="absolute bottom-[-20%] left-[10%] w-[500px] h-[500px] bg-orange-200/30 rounded-full mix-blend-multiply filter blur-[100px] animate-pulse" />

      <div className="relative z-10 w-full flex flex-col items-center px-4 py-8 text-center max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          className="sd_glass-card w-full p-10 rounded-[32px] flex flex-col items-center"
        >
          <h1 className="text-[120px] font-black tracking-tighter text-gray-900 leading-none mb-4 bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-rose-500 drop-shadow-sm">
            404
          </h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Обрыв связи</h2>
          <p className="text-gray-500 text-center mb-8">
            Кажется, тренер задал слишком большую дистанцию. Эта страница пропала с радаров, но мы можем вернуться к тренировочному процессу.
          </p>

          <Link to="/" className="sd_btn-primary flex items-center justify-center">
            Вернуться на базу
          </Link>
        </motion.div>
      </div>
    </div>
  );
};
