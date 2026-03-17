import { Outlet } from 'react-router-dom';
import { Sd_Sidebar } from './Sd_Sidebar';
import { Sd_Header } from './Sd_Header';

export const Sd_AppLayout = () => {
  return (
    <div className="flex h-[100dvh] bg-[var(--bg-app)] overflow-hidden p-4 lg:p-6 lg:pb-6 gap-4">
      <Sd_Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden gap-4">
        <Sd_Header />
        <main className="flex-1 overflow-y-auto overflow-x-hidden sd_custom-scroll relative">
          <Outlet />
          <div className="h-[110px] lg:hidden w-full shrink-0" />
        </main>
      </div>
    </div>
  );
};
