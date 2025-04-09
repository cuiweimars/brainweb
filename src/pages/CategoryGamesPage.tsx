import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import GameCard from '../components/GameCard';
import { Game, trendingGames, recentlyPlayedGames, multiplayerGames, newGames, categoryGames } from '../data/mockData';

const CategoryGamesPage: React.FC = () => {
  const { t } = useTranslation();
  const { categoryId } = useParams<{ categoryId: string }>();
  const [games, setGames] = useState<Game[]>([]);
  const [category, setCategory] = useState<string>('');

  // Setup category name mapping
  const categoryNames: Record<string, string> = {
    'MemoryTraining': 'Memory Training',
    'focus-training': 'Focus Training',
    'logic-puzzles': 'Logic Puzzles',
    'math-challenges': 'Math Challenges',
    'language-skills': 'Language Skills'
  };

  useEffect(() => {
    // Combine all games from different lists
    const allGames = [
      ...trendingGames,
      ...recentlyPlayedGames,
      ...multiplayerGames,
      ...newGames,
      ...categoryGames
    ];

    // Filter games by category
    const filteredGames = allGames.filter(game => game.category === categoryId);
    
    // Remove duplicates by ID
    const uniqueGames = filteredGames.reduce((acc: Game[], current) => {
      const x = acc.find(item => item.id === current.id);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []);

    setGames(uniqueGames);
    setCategory(categoryId || '');
  }, [categoryId]);

  // Get the display name for the category
  const getCategoryDisplayName = () => {
    return t(categoryNames[category] || '');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <section className="mb-8">
        <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
          {getCategoryDisplayName()}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          {t(`${category}_description`, t('category_description', 'Explore our collection of {{category}} games designed to enhance your cognitive skills.', { category: getCategoryDisplayName().toLowerCase() }))}
        </p>
      </section>

      {/* Games Grid */}
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
            {t('no_games_found')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-center max-w-md mb-6">
            {t('no_games_found_description', 'There are no games available in this category at the moment. Check back soon for updates.')}
          </p>
          <a
            href="/"
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-300"
          >
            {t('explore_games')}
          </a>
        </div>
      )}
    </div>
  );
};

export default CategoryGamesPage; 