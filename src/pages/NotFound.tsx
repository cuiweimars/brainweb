import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import notFoundImg from '../images/404-not-found.jpg';

const NotFound: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-6xl text-purple-600 mb-6">404</div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        {t('page_not_found')}
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-md">
        {t('page_not_found_description')}
      </p>
      <div className="flex space-x-4">
        <Link 
          to="/" 
          className="px-6 py-3 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 transition-colors"
        >
          {t('back_to_home')}
        </Link>
        <Link 
          to="/trending" 
          className="px-6 py-3 bg-transparent border border-purple-600 text-purple-600 dark:text-purple-400 font-medium rounded-md hover:bg-purple-50 dark:hover:bg-gray-800 transition-colors"
        >
          {t('explore_games')}
        </Link>
      </div>
      <div className="mt-16">
        <img 
          src={notFoundImg} 
          alt="404 Illustration" 
          className="max-w-lg w-full rounded-lg shadow-md"
        />
      </div>
    </div>
  );
};

export default NotFound; 