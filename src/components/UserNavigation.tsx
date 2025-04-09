import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const UserNavigation: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className='flex items-center space-x-2'>
      <Link 
        to='/login' 
        className='text-sm font-medium text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400'
      >
        {t('login')}
      </Link>
      <Link 
        to='/register' 
        className='px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-300'
      >
        {t('register')}
      </Link>
    </div>
  );
};

export default UserNavigation;
