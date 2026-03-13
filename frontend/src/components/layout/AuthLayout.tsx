import { Outlet } from 'react-router-dom';

import Header from '@/components/Header';

function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Header />
      <div className="w-full max-w-sm px-4">
        <Outlet />
      </div>
    </div>
  );
}

export default AuthLayout;
