import React, { ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="flex flex-1 relative mt-16">
        <aside className="hidden md:block fixed left-0 top-16 bottom-0 w-40 flex-shrink-0 z-10">
          <Sidebar />
        </aside>
        <main className="flex-1 ml-0 md:ml-10 px-4 py-6 -mt-[50px]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout; 