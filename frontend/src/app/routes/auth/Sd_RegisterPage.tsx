import { Sd_RegisterForm } from '../../../components/auth/Sd_RegisterForm';
import { Link } from 'react-router-dom';

export const Sd_RegisterPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-tr from-[#FFF7ED] via-white to-[#F8F8FA]">

      {/* Decorative blurred blobs for Neumorphism/Glassmorphism feel */}
      <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-orange-400/10 rounded-full mix-blend-multiply filter blur-[80px]" />
      <div className="absolute bottom-[-20%] left-[10%] w-[500px] h-[500px] bg-orange-200/30 rounded-full mix-blend-multiply filter blur-[100px] animate-pulse" />

      <div className="relative z-10 w-full flex flex-col items-center px-4 py-8">
        <Sd_RegisterForm />
        <p className="mt-8 text-[var(--text-secondary)] text-sm">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="text-[var(--accent)] font-semibold hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
};
