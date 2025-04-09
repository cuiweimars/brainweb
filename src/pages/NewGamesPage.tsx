import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import GameCard from '../components/GameCard';
import { newGames as allNewGames } from '../data/mockData';

const NewGamesPage: React.FC = () => {
  const { t } = useTranslation();
  const [games, setGames] = useState(allNewGames);

  useEffect(() => {
    // Sort games by creation date (newest first)
    const sortedGames = [...allNewGames].sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    setGames(sortedGames);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <section className="mb-8">
        <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
          {t('new')}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          {t('new_games_description', 'Our latest brain training games. Try something new to challenge your mind.')}
        </p>
      </section>

      {/* New Games Grid */}
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
            {t('no_new_games')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-center max-w-md mb-6">
            {t('no_new_games_description', 'There are no new games available at the moment. Check back soon for updates.')}
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

export default NewGamesPage; 