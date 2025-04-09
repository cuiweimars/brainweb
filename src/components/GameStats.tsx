import React from 'react';
import { useTranslation } from 'react-i18next';

interface StatItem {
  icon: string;
  label: string;
  value: string | number;
}

const GameStats: React.FC = () => {
  const { t } = useTranslation();

  const stats: StatItem[] = [
    {
      icon: '🎮',
      label: t('totalGames'),
      value: '4,500+',
    },
    {
      icon: '👥',
      label: t('activePlayers'),
      value: '30M+',
    },
    {
      icon: '⭐',
      label: t('averageRating'),
      value: '4.5/5.0',
    },
    {
      icon: '🌍',
      label: t('languages'),
      value: '20+',
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 p-6 md:p-8 shadow-lg dark:from-gray-800 dark:to-purple-900">
      <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="flex flex-col items-center justify-center rounded-xl bg-white/90 p-5 md:p-6 text-center shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md dark:bg-gray-800/60"
          >
            <span className="mb-2 text-4xl md:text-5xl">{stat.icon}</span>
            <span className="mb-1 text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </span>
            <span className="text-sm md:text-base font-medium text-gray-600 dark:text-gray-300">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameStats; 