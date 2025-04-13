import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const TopNavigation: React.FC = () => {
  const { t } = useTranslation();

  const navItems = [
    { icon: '🏠', label: 'home', path: '/' },
    { icon: '🕒', label: 'recently_played', path: '/recent' },
    { icon: '🆕', label: 'new', path: '/new' },
    { icon: '🔥', label: 'trending', path: '/trending' }
  ];

  return (
    <nav className="sticky top-16 z-40 bg-white shadow-md dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <Link to="/" className="flex items-center">
            <div className="bg-purple-800 rounded-md p-2 flex items-center shadow-md mr-3">
              <span className="text-xl text-white">🧠</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">BrainWeb</span>
          </Link>

          <div className="flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center space-x-2 rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                <span>{item.icon}</span>
                <span className="hidden sm:inline">{t(item.label)}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNavigation; 