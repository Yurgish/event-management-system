import { Outlet } from 'react-router-dom';

import Header from '@/components/Header';

function AppLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Header />

      <main className="layout-container pt-20">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
