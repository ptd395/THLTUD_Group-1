import { Outlet } from 'react-router-dom';
import AppSidebar from './AppSidebar';
import { User } from 'lucide-react';

const AppLayout = () => {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        {/* Top bar with avatar */}
        <header className="flex items-center justify-end px-8 py-4">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <User size={20} className="text-muted-foreground" />
          </div>
        </header>
        <main className="flex-1 px-8 pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
