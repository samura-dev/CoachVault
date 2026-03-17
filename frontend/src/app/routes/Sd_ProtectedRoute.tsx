import { Navigate, Outlet } from 'react-router-dom';
import { sd_useAuthStore } from '../../stores/sd_useAuthStore';

export const Sd_ProtectedRoute = () => {
  const { sd_isAuthenticated } = sd_useAuthStore();

  if (!sd_isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
