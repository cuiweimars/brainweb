import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Game } from '../data/mockData';

interface GameCardProps {
  game: Game;
  featured?: boolean;
}

const GameCard: React.FC<GameCardProps> = ({ game, featured = false }) => {
  const { t } = useTranslation();
  
  return (
    <Link 
      to={`/game/${game.id}`} 
      className={`group block rounded-xl transition-all duration-300 ${
        featured 
        ? 'overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 shadow-md hover:shadow-xl border border-gray-700 hover:border-indigo-900/50' 
        : 'overflow-hidden bg-gray-800/90 shadow-md hover:shadow-xl shadow-black/30 hover:translate-y-[-5px] border border-gray-700 hover:border-indigo-800'
      }`}
    >
      <div className="relative">
        <div className={`aspect-video overflow-hidden ${featured ? 'rounded-t-xl' : 'rounded-t-xl'}`}>
          <img 
            src={game.thumbnailUrl}
            alt={t(game.title)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-20 group-hover:opacity-70 transition-opacity duration-300"></div>
        </div>
        {game.isNew && (
          <span className="absolute top-3 right-3 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative">{t('new')}</span>
          </span>
        )}
      </div>
      
      <div className="p-4">
        <div className="mb-2">
          <h3 className={`font-bold text-white transition-colors group-hover:text-indigo-400 ${
            featured ? 'text-xl' : 'text-lg'
          }`}>
            {t(game.title)}
          </h3>
          
          <p className="text-sm text-gray-400 mt-1 line-clamp-2 h-10">
            {t(game.description)}
          </p>
        </div>
        
        <div className="mt-3 flex flex-wrap items-center justify-between">
          <div className="flex-grow flex items-center gap-2 mb-2">
            <span className="inline-flex items-center rounded-full bg-indigo-900/70 px-2.5 py-0.5 text-xs font-medium text-indigo-200">
              {t(game.category)}
            </span>
            
            {game.difficulty && (
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                game.difficulty === 'easy' 
                ? 'bg-green-900/70 text-green-200' 
                : game.difficulty === 'medium'
                ? 'bg-amber-900/70 text-amber-200'
                : 'bg-red-900/70 text-red-200'
              }`}>
                {t(game.difficulty)}
              </span>
            )}
          </div>
          
          <div className="flex items-center">
            <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="ml-1 text-xs font-medium text-gray-300">{game.rating}</span>
          </div>
        </div>
        
        {game.playCount && featured && (
          <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between items-center">
            <div className="flex items-center text-sm text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              {game.playCount.toLocaleString()} {t('plays')}
            </div>
            
            {game.duration && (
              <div className="flex items-center text-sm text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                {game.duration}
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

export default GameCard; 