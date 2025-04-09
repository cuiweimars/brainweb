import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import GameCard from '../components/GameCard';
import { allGames, categories } from '../data/mockData';

const CategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { t } = useTranslation();

  const currentCategory = useMemo(() => {
    return categories.find(cat => cat.id === categoryId);
  }, [categoryId]);

  const categoryGames = useMemo(() => {
    return allGames.filter(game => game.category === categoryId);
  }, [categoryId]);

  if (!currentCategory) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {t('Category Not Found')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('The category you are looking for does not exist.')}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <span className="mr-3 text-4xl">{currentCategory.icon}</span>
          {t(currentCategory.name)}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t('category_description', { category: t(currentCategory.name.toLowerCase()) })}
        </p>
      </div>
      
      {categoryGames.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categoryGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {t('no_games_found')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('no_games_found_description')}
          </p>
        </div>
      )}
    </div>
  );
};

export default CategoryPage; 