
import React from 'react';
import { Sidebar, BottomTabBar } from './Navigation';
import { Outlet, useLocation } from 'react-router-dom';
import { ScrollToTop } from './ui/LayoutComponents';

const Layout: React.FC = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth' || location.pathname === '/onboarding';

  if (isAuthPage) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-lyloo-bg flex">
      <ScrollToTop />
      <Sidebar />
      <main className="flex-1 w-full max-w-[100vw] overflow-x-hidden">
        <Outlet />
      </main>
      <BottomTabBar />
    </div>
  );
};

export default Layout;
