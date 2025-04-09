import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Game } from '../data/mockData';
import GameCard from './GameCard';

interface GameOfTheDayProps {
  game: Game;
  className?: string;
}

const GameOfTheDay: React.FC<GameOfTheDayProps> = ({ game, className = '' }) => {
  const { t } = useTranslation();

  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 p-1 ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-primary-500/20" />
      
      <div className="relative">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🎮</span>
            <h2 className="text-xl font-bold text-white">
              {t('gameOfTheDay')}
            </h2>
          </div>
          <Link
            to={`/game/${game.id}`}
            className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
          >
            {t('playNow')}
            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <GameCard game={game} variant="featured" />
      </div>
    </div>
  );
};

export default GameOfTheDay; 