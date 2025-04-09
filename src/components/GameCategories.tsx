import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Category } from '../data/mockData';

interface GameCategoriesProps {
  categories: Category[];
  className?: string;
}

const GameCategories: React.FC<GameCategoriesProps> = ({ categories, className = '' }) => {
  const { t } = useTranslation();
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  return (
    <div className={`grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 ${className}`}>
      {categories.map((category) => (
        <Link
          key={category.id}
          to={`/category/${category.id}`}
          className="group relative overflow-hidden rounded-lg bg-white p-4 shadow-md transition-all duration-300 hover:shadow-lg dark:bg-gray-800"
          onMouseEnter={() => setHoveredCategory(category.id)}
          onMouseLeave={() => setHoveredCategory(null)}
        >
          <div className="flex flex-col items-center space-y-2">
            <div className="relative">
              <span className="text-3xl transition-transform duration-300 group-hover:scale-110">
                {category.icon}
              </span>
              {hoveredCategory === category.id && (
                <div className="absolute inset-0 animate-pulse rounded-full bg-primary-100 dark:bg-primary-900" />
              )}
            </div>
            <h3 className="text-center text-sm font-medium text-gray-900 dark:text-white">
              {category.name}
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {category.count} {t('games')}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default GameCategories; 