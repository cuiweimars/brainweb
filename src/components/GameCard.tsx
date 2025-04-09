import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Game } from '../data/mockData';

interface GameCardProps {
  game: Game;
  variant?: 'default' | 'featured' | 'compact';
  className?: string;
}

const GameCard: React.FC<GameCardProps> = ({ game, variant = 'default', className = '' }) => {
  const { t } = useTranslation();
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'featured':
        return 'md:flex-row md:space-x-4';
      case 'compact':
        return 'flex-row space-x-3';
      default:
        return 'flex-col';
    }
  };

  return (
    <Link 
      to={`/game/${game.id}`}
      className={`group relative overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:shadow-lg dark:bg-gray-800 ${getVariantClasses()} ${className}`}
    >
      <div className={`relative ${variant === 'featured' ? 'md:w-1/2' : 'w-full'}`}>
        <img
          src={game.thumbnailUrl}
          alt={game.title}
          className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        {game.isNew && (
          <span className="absolute right-2 top-2 rounded-full bg-primary-500 px-2 py-1 text-xs font-medium text-white">
            {t('new')}
          </span>
        )}
      </div>
      
      <div className={`p-4 ${variant === 'featured' ? 'md:w-1/2' : 'w-full'}`}>
        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
          {game.title}
        </h3>
        <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">
          {game.description}
        </p>
        
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getDifficultyColor(game.difficulty)}`}>
            {t(game.difficulty)}
          </span>
          
          <div className="flex items-center text-yellow-400">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.363 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.363-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="ml-1 text-sm text-gray-600 dark:text-gray-300">
              {game.rating.toFixed(1)}
            </span>
          </div>

          {game.playCount && (
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              <span className="ml-1 text-sm">
                {game.playCount.toLocaleString()}
              </span>
            </div>
          )}

          {game.isOnline !== undefined && (
            <div className="flex items-center">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                game.isOnline 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
              }`}>
                {game.isOnline ? t('game.online') : t('game.local')}
              </span>
            </div>
          )}

          {game.duration && (
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className="ml-1 text-sm">
                {game.duration}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default GameCard; 