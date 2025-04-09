import React from 'react';
import { useTranslation } from 'react-i18next';
import GameCard from '../components/GameCard';
import { allGames } from '../data/mockData';

const AllGamesPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('All Games')}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t('Explore all our brain training games')}
        </p>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {allGames.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
};

export default AllGamesPage; 