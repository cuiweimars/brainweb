import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import GameCard from '../components/GameCard';
import { recentlyPlayedGames } from '../data/mockData';

const RecentGamesPage: React.FC = () => {
  const { t } = useTranslation();
  const [games] = useState(recentlyPlayedGames);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <section className="mb-8">
        <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
          {t('recently_played')}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          {t('recently_played_description', 'Games you have played recently. Continue your brain training journey.')}
        </p>
      </section>

      {/* Recently Played Games Grid */}
      <section className="mb-12">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>

      {/* Empty State */}
      {games.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <span className="text-6xl mb-4">🎮</span>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            {t('no_recent_games')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-center max-w-md mb-6">
            {t('no_recent_games_description', 'You haven\'t played any games recently. Start playing to see your history here.')}
          </p>
          <a
            href="/"
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors duration-300"
          >
            {t('explore_games')}
          </a>
        </div>
      )}
    </div>
  );
};

export default RecentGamesPage; 