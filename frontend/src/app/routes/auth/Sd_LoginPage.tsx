import { Sd_LoginForm } from '../../../components/auth/Sd_LoginForm';
import { Link } from 'react-router-dom';

export const Sd_LoginPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#FFF7ED] via-white to-[#F8F8FA]">

      {/* Decorative blurred blobs for Neumorphism/Glassmorphism feel */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-400/20 rounded-full mix-blend-multiply filter blur-[100px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-orange-200/40 rounded-full mix-blend-multiply filter blur-[120px]" />

      <div className="relative z-10 w-full flex flex-col items-center px-4">
        <Sd_LoginForm />
        <p className="mt-8 text-[var(--text-secondary)] text-sm">
          Нет аккаунта?{' '}
          <Link to="/register" className="text-[var(--accent)] font-semibold hover:underline">
            Создать
          </Link>
        </p>
      </div>
    </div>
  );
};
