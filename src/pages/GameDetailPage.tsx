import React, { useMemo, useState, lazy, Suspense, useCallback } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { allGames } from '../data/mockData';
import GameReviews from '../components/GameReviews';

// --- Icon Definitions ---
// Generic Share Icon
const ShareIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className || 'w-5 h-5'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6.001l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
  </svg>
);

// Close Icon (X)
const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className || 'w-6 h-6'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Copy Icon
const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className || 'w-5 h-5'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

// Check Icon (for Copy Success)
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className || 'w-5 h-5'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

// --- Social Media Icons ---
const FacebookIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className || 'w-8 h-8'} fill="currentColor" viewBox="0 0 24 24">
    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
  </svg>
);

const TwitterXIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className || 'w-8 h-8'} fill="currentColor" viewBox="0 0 16 16">
    <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z"/>
  </svg>
);

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className || 'w-8 h-8'} fill="currentColor" viewBox="0 0 24 24">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.273-.099-.471-.148-.67.15-.197.297-.768.967-.941 1.164-.173.197-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.67-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);

const LinkedInIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className || 'w-8 h-8'} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const RedditIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className || 'w-8 h-8'} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1.347 18.149c-.384.384-1.013.384-1.397 0-.384-.383-.384-1.012 0-1.396.383-.384 1.013-.384 1.397 0 .384.383.384 1.012 0 1.396zm5.146-5.598c0 1.104-.896 2-2 2s-2-.896-2-2 .896-2 2-2 2 .896 2 2zm-3.999-3.551c-.91 0-1.648.739-1.648 1.649 0 .91.739 1.648 1.648 1.648.911 0 1.649-.739 1.649-1.648 0-.91-.738-1.649-1.649-1.649zm4.854 0c-.91 0-1.649.739-1.649 1.649 0 .91.739 1.648 1.649 1.648.91 0 1.648-.739 1.648-1.648 0-.91-.738-1.649-1.648-1.649zm-.915 5.551c0 .829-.672 1.5-1.5 1.5s-1.5-.671-1.5-1.5c0-.828.672-1.5 1.5-1.5s1.5.672 1.5 1.5zm-5.132 0c0 .829-.672 1.5-1.5 1.5s-1.5-.671-1.5-1.5c0-.828.672-1.5 1.5-1.5s1.5.672 1.5 1.5zm8.292-4.25c-.66 0-1.194.535-1.194 1.195s.535 1.194 1.194 1.194 1.194-.534 1.194-1.194-.534-1.195-1.194-1.195zm-9.982 0c-.66 0-1.194.535-1.194 1.195s.534 1.194 1.194 1.194 1.194-.534 1.194-1.194-.535-1.195-1.194-1.195zm5.539 1.799c-1.83 0-3.328 1.565-3.328 3.487 0 1.162.551 2.227 1.49 2.953.363.28.852.109.984-.315.133-.423-.03-.9-.435-.999-.47-.119-.818-.406-.97-.788-.18-.445-.269-.919-.269-1.421 0-1.233.951-2.238 2.13-2.238s2.129 1.005 2.129 2.238c0 .502-.089.976-.269 1.421-.152.382-.5.669-.97.788-.405.099-.568.576-.435.999.133.424.621.595.984.315.938-.726 1.49-1.791 1.49-2.953 0-1.922-1.499-3.487-3.329-3.487z" />
  </svg>
);
// --- End Icon Definitions ---

// --- Share Modal Component ---
interface ShareModalProps {
  gameTitle: string;
  gameUrl: string;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ gameTitle, gameUrl, onClose }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const socialPlatforms = [
    {
      name: 'Facebook',
      icon: FacebookIcon,
      color: 'bg-blue-600 hover:bg-blue-700',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(gameUrl)}&quote=${encodeURIComponent(t('share_message', { title: gameTitle }))}`
    },
    {
      name: 'Twitter',
      icon: TwitterXIcon,
      color: 'bg-black hover:bg-gray-800',
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(gameUrl)}&text=${encodeURIComponent(t('share_message', { title: gameTitle }))}`
    },
    {
      name: 'WhatsApp',
      icon: WhatsAppIcon,
      color: 'bg-green-500 hover:bg-green-600',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(t('share_message', { title: gameTitle }))}%20${encodeURIComponent(gameUrl)}`
    },
    {
      name: 'LinkedIn',
      icon: LinkedInIcon,
      color: 'bg-blue-700 hover:bg-blue-800',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(gameUrl)}`
    },
    {
      name: 'Reddit',
      icon: RedditIcon,
      color: 'bg-orange-600 hover:bg-orange-700',
      url: `https://www.reddit.com/submit?url=${encodeURIComponent(gameUrl)}&title=${encodeURIComponent(gameTitle)}`
    },
  ];

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(gameUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    }).catch(err => {
      console.error('Failed to copy: ', err);
      // Optionally show an error message to the user
    });
  }, [gameUrl]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose} // Close modal on backdrop click
    >
      <div 
        className="relative w-full max-w-md rounded-xl bg-gray-800 p-6 text-white shadow-lg"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
          aria-label={t('close')}
        >
          <CloseIcon />
        </button>
        
        <h2 className="mb-6 text-center text-xl font-semibold">{t('share_this_game')}</h2>

        <div className="mb-6 flex justify-center space-x-3">
          {socialPlatforms.map(platform => (
            <a
              key={platform.name}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              title={`${t('share_on')} ${platform.name}`}
              className={`flex h-12 w-12 items-center justify-center rounded-full text-white transition-colors ${platform.color}`}
            >
              <span className="sr-only">{platform.name}</span>
              <platform.icon className="h-6 w-6" />
            </a>
          ))}
        </div>

        <div className="relative flex items-center rounded-lg bg-gray-700 p-2">
          <input
            type="text"
            readOnly
            value={gameUrl}
            className="flex-grow bg-transparent px-2 text-sm text-gray-300 focus:outline-none"
          />
          <button
            onClick={handleCopy}
            className={`ml-2 flex-shrink-0 rounded-md px-4 py-2 text-sm font-medium transition-colors ${ 
              copied 
                ? 'bg-green-600 text-white' 
                : 'bg-purple-600 text-white hover:bg-purple-700' 
            }`}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
            <span className="ml-1">{copied ? t('copied') : t('copy')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
// --- End Share Modal Component ---

// Lazy load game components
const MemoryMatch = lazy(() => import('../games/memory-match'));
const MemoryMatchProPlus = lazy(() => import('../games/memory-match-pro-plus'));
const SequenceRecall = lazy(() => import('../games/sequence-recall'));
const SpatialMemory = lazy(() => import('../games/spatial-memory'));
// AttentionZone removed
const ConcentrationMaster = React.lazy(() => import('../games/concentration-master'));

// Component to show loader while game is loading
const GameLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="spinner-border text-primary" role="status">
      <span className="sr-only">Loading...</span>
      <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  </div>
);

const GameDetailPage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const location = useLocation();

  const game = useMemo(() => {
    return allGames.find(g => g.id === gameId);
  }, [gameId]);

  const handleGameComplete = (score: number, moves: number, time: number) => {
    console.log('Game completed:', {score, moves, time});
  };

  const handleExitGame = () => {
    setIsPlaying(false);
  };

  const openShareModal = () => setIsShareModalOpen(true);
  const closeShareModal = () => setIsShareModalOpen(false);

  const gameUrl = useMemo(() => window.location.origin + location.pathname, [location.pathname]);

  if (!game) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {t('game_not_found')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {t('game_not_found_description')}
        </p>
        <Link 
          to="/"
          className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
        >
          {t('back_to_home')}
        </Link>
      </div>
    );
  }

  const renderGame = () => {
    switch(gameId) {
      case 'memory-match':
        return (
          <Suspense fallback={<GameLoader />}>
            <MemoryMatch 
              difficulty={game.difficulty}
              onGameComplete={handleGameComplete}
              onExit={handleExitGame}
            />
          </Suspense>
        );
      case 'memory-match-pro-plus':
        return (
          <Suspense fallback={<GameLoader />}>
            <MemoryMatchProPlus 
              difficulty={game.difficulty}
              onGameComplete={handleGameComplete}
              onExit={handleExitGame}
            />
          </Suspense>
        );
      case 'sequence-recall':
        return (
          <Suspense fallback={<GameLoader />}>
            <SequenceRecall 
              difficulty={game.difficulty}
              onGameComplete={handleGameComplete}
              onExit={handleExitGame}
            />
          </Suspense>
        );
      case 'spatial-memory':
        return (
          <Suspense fallback={<GameLoader />}>
            <SpatialMemory 
              difficulty={game.difficulty}
              onGameComplete={handleGameComplete}
              onExit={handleExitGame}
            />
          </Suspense>
        );
      case 'concentration-master':
        return (
          <Suspense fallback={<GameLoader />}>
            <ConcentrationMaster 
              difficulty={game.difficulty}
              onGameComplete={handleGameComplete}
              onExit={handleExitGame}
            />
          </Suspense>
        );
      default:
        return (
          <div className="text-center p-8">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('game_not_implemented')}
            </p>
            <button
              onClick={() => setIsPlaying(false)}
              className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              {t('exit_game')}
            </button>
          </div>
        );
    }
  };

  const renderGameDescription = () => {
    if (gameId === 'sequence-recall') {
      return (
        <div className="game-description">
          <h3>{t('rules')}:</h3>
          <ul>
            <li>{t('sequence_recall_rule_1')}</li>
            <li>{t('sequence_recall_rule_2')}</li>
            <li>{t('sequence_recall_rule_3')}</li>
            <li>{t('sequence_recall_rule_4')}</li>
          </ul>
        </div>
      );
    } else if (gameId === 'spatial-memory') {
      return (
        <div className="game-description">
          <h3>{t('rules')}:</h3>
          <ul>
            <li>{t('spatial_memory_rule_1')}</li>
            <li>{t('spatial_memory_rule_2')}</li>
            <li>{t('spatial_memory_rule_3')}</li>
            <li>{t('spatial_memory_rule_4')}</li>
          </ul>
        </div>
      );
    } else if (gameId === 'attention-zone') {
      return (
        <div className="game-description">
          <h3>{t('rules')}:</h3>
          <ul>
            <li>{t('Follow the instructions at the top of the screen')}</li>
            <li>{t('Click on the target items that match the instructions')}</li>
            <li>{t('Avoid clicking on distractions or incorrect items')}</li>
            <li>{t('Earn points for each correct click')}</li>
            <li>{t('Lose points for missed targets or incorrect clicks')}</li>
          </ul>
        </div>
      );
    } else if (gameId === 'concentration-master') {
      return (
        <div className="game-description">
          <h3>{t('rules')}:</h3>
          <ul>
            <li>屏幕上会出现不同形状和颜色的目标</li>
            <li>关注顶部指示的目标类型（形状和颜色）</li>
            <li>只点击与指示匹配的目标，避免点击其他目标</li>
            <li>连续点击正确目标可获得连击奖</li>
            <li>点击错误目标或错过正确目标将扣分并重置连</li>
            <li>在时间结束前获取尽可能高的分</li>
          </ul>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        {!isPlaying ? (
          <>
            <div className="mb-8 flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/3">
                <img 
                  src={game.thumbnailUrl} 
                  alt={game.title} 
                  className="w-full h-auto rounded-xl shadow-lg"
                />
                <div className="mt-4 flex justify-between">
                  <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                    {t(game.category)}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                    {t(game.difficulty)}
                  </span>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="w-full rounded-lg bg-green-600 py-4 text-center text-lg font-bold text-white shadow-lg hover:bg-green-700 transition-colors transform hover:scale-105 animate-pulse hover:animate-none border-2 border-green-400 focus:outline-none focus:ring-4 focus:ring-green-300 dark:bg-green-700 dark:hover:bg-green-800 dark:border-green-600 dark:focus:ring-green-800 dark:text-gray-100"
                  >
                    {t('play_now')} <span className="ml-2"></span>
                  </button>
                  <p className="text-center text-sm text-green-600 mt-2 font-medium dark:text-green-400">
                    {t('click_to_start')}
                  </p>
                </div>
              </div>

              <div className="w-full md:w-2/3 space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {t(game.title)}
                  </h1>
                  <div className="flex items-center mb-4 flex-wrap gap-x-4 gap-y-2">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="ml-1 text-gray-700 dark:text-gray-300">{game.rating}/5.0</span>
                    </div>
                    {game.playCount && (
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        <span className="ml-1 text-gray-700 dark:text-gray-300">{game.playCount.toLocaleString()} {t('plays')}</span>
                      </div>
                    )}
                    <button 
                      onClick={openShareModal}
                      className="flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    >
                      <ShareIcon className="w-4 h-4 mr-1" />
                      {t('share')}
                    </button>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t(game.description)}
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-3">{t('how_to_play')}</h2>
                  <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-400">
                    {game.howToPlay ? (
                      <p>{t(game.howToPlay)}</p>
                    ) : renderGameDescription() ? (
                       renderGameDescription()
                    ) : (
                      <p>{t('game_instructions_placeholder', { title: t(game.title) })}</p>
                    )}
                  </div>
                </div>

                <div>
                  <GameReviews gameId={game.id} />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="game-container relative">
            {renderGame()}
          </div>
        )}
      </div>

      {isShareModalOpen && game && (
        <ShareModal 
          gameTitle={t(game.title)} 
          gameUrl={gameUrl} 
          onClose={closeShareModal} 
        />
      )}
    </>
  );
};

export default GameDetailPage;
