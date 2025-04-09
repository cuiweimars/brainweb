import React from 'react';
import { useTranslation } from 'react-i18next';
import GameCard from '../components/GameCard';
import BenefitsSection from '../components/BenefitsSection';
import GameStats from '../components/GameStats';
import { allGames } from '../data/mockData';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  
  // 只取前12个游戏（桌面版显示三行）
  const displayGames = React.useMemo(() => {
    return allGames.slice(0, 12);
  }, []);

  return (
    <div className="container mx-auto px-4 py-0">
      {/* Game Stats - Adjusted margin for new header layout */}
      <section className="mt-[35px] mb-16">
        <div className="mt-[1px]">
          <GameStats />
        </div>
      </section>

      {/* All Games */}
      <section className="mb-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('All Games')}
          </h2>
          <a href="/games" className="text-primary-600 hover:text-primary-700 dark:text-white dark:hover:text-gray-300">
            {t('View All')} →
          </a>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {displayGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="my-20">
        <BenefitsSection />
      </section>
    </div>
  );
};

export default HomePage; 