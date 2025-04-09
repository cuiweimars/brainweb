import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { allGames, Game } from '../data/mockData';
import GameCard from '../components/GameCard';

const SearchResultsPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  
  const query = useMemo(() => searchParams.get('q') || '', [searchParams]);

  useEffect(() => {
    if (query) {
      const lowerCaseQuery = query.toLowerCase();
      const results = allGames.filter(game => 
        game.title.toLowerCase().includes(lowerCaseQuery) || 
        game.description.toLowerCase().includes(lowerCaseQuery) ||
        game.category.toLowerCase().includes(lowerCaseQuery)
      );
      setFilteredGames(results);
    } else {
      setFilteredGames([]); // Clear results if query is empty
    }
  }, [query]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        {t('search_results_for', 'Search Results for')}: "<span className='text-purple-600 dark:text-purple-400'>{query}</span>"
      </h1>

      {filteredGames.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            {t('no_search_results', 'No games found matching your search.')}
          </p>
          <Link 
            to="/"
            className="inline-flex items-center rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800"
          >
            {t('back_to_home')}
          </Link>
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage; 