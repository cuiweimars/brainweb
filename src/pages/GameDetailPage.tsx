import React, { useMemo, useState, lazy, Suspense, useCallback, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { allGames } from '../data/mockData';
import GameReviews from '../components/GameReviews';
import { Helmet } from 'react-helmet-async';

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
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c0 1.104-.896 2-2 2s-2-.896-2-2 .896-2 2-2 2 .896 2 2zm-3.999-3.551c-.91 0-1.648.739-1.648 1.649 0 .91.739 1.648 1.648 1.648.911 0 1.649-.739 1.649-1.648 0-.91-.738-1.649-1.649-1.649zm4.854 0c-.91 0-1.649.739-1.649 1.649 0 .91.739 1.648 1.649 1.648.91 0 1.648-.739 1.648-1.648 0-.91-.738-1.649-1.648-1.649zm-.915 5.551c0 .829-.672 1.5-1.5 1.5s-1.5-.671-1.5-1.5c0-.828.672-1.5 1.5-1.5s1.5.672 1.5 1.5zm-5.132 0c0 .829-.672 1.5-1.5 1.5s-1.5-.671-1.5-1.5c0-.828.672-1.5 1.5-1.5s1.5.672 1.5 1.5zm8.292-4.25c-.66 0-1.194.535-1.194 1.195s.535 1.194 1.194 1.194 1.194-.534 1.194-1.194-.534-1.195-1.194-1.195zm-9.982 0c-.66 0-1.194.535-1.194 1.195s.534 1.194 1.194 1.194 1.194-.534 1.194-1.194-.535-1.195-1.194-1.195zm5.539 1.799c-1.83 0-3.328 1.565-3.328 3.487 0 1.162.551 2.227 1.49 2.953.363.28.852.109.984-.315.133-.423-.03-.9-.435-.999-.47-.119-.818-.406-.97-.788-.18-.445-.269-.919-.269-1.421 0-1.233.951-2.238 2.13-2.238s2.129 1.005 2.129 2.238c0 .502-.089.976-.269 1.421-.152.382-.5.669-.97.788-.405.099-.568.576-.435.999.133.424.621.595.984.315.938-.726 1.49-1.791 1.49-2.953 0-1.922-1.499-3.487-3.329-3.487z" />
  </svg>
);

const LinkedInIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className || 'w-8 h-8'} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const RedditIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className || 'w-8 h-8'} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1.347 18.149c-.384.384-1.013.384-1.397 0-.384-.384-1.396.383-.384 1.013-.384 1.397 0 .384.384 1.012 0 1.396zm5.146-5.598c0 1.104-.896 2-2 2s-2-.896-2-2 .896-2 2-2 2 .896 2 2zm-3.999-3.551c-.91 0-1.648.739-1.648 1.649 0 .91.739 1.648 1.648 1.648.911 0 1.649-.739 1.649-1.648 0-.91-.738-1.649-1.649-1.649zm4.854 0c-.91 0-1.649.739-1.649 1.649 0 .91.739 1.648 1.649 1.648.91 0 1.648-.739 1.648-1.648 0-.91-.738-1.649-1.648-1.649zm-.915 5.551c0 .829-.672 1.5-1.5 1.5s-1.5-.671-1.5-1.5c0-.828.672-1.5 1.5-1.5s1.5.672 1.5 1.5zm-5.132 0c0 .829-.672 1.5-1.5 1.5s-1.5-.671-1.5-1.5c0-.828.672-1.5 1.5-1.5s1.5.672 1.5 1.5zm8.292-4.25c-.66 0-1.194.535-1.194 1.195s.535 1.194 1.194 1.194 1.194-.534 1.194-1.194-.534-1.195-1.194-1.195zm-9.982 0c-.66 0-1.194.535-1.194 1.195s.534 1.194 1.194 1.194 1.194-.534 1.194-1.194-.535-1.195-1.194-1.195zm5.539 1.799c-1.83 0-3.328 1.565-3.328 3.487 0 1.162.551 2.227 1.49 2.953.363.28.852.109.984-.315.133-.423-.03-.9-.435-.999-.47-.119-.818-.406-.97-.788-.18-.445-.269-.919-.269-1.421 0-1.233.951-2.238 2.13-2.238s2.129 1.005 2.129 2.238c0 .502-.089.976-.269 1.421-.152.382-.5.669-.97.788-.405.099-.568.576-.435.999.133.424.621.595.984.315.938-.726 1.49-1.791 1.49-2.953 0-1.922-1.499-3.487-3.329-3.487z" />
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

// 相关游戏组件
interface RelatedGameCardProps {
  game: typeof allGames[0];
}

const RelatedGameCard: React.FC<RelatedGameCardProps> = ({ game }) => {
  const { t } = useTranslation();
  
  return (
    <Link to={`/game/${game.id}`} className="block group">
      <div className="overflow-hidden rounded-xl bg-gray-800/80 shadow-md shadow-black/30 transition-all duration-300 hover:shadow-xl border border-gray-700 hover:border-indigo-800">
        <div className="relative aspect-video overflow-hidden rounded-t-xl">
          <img 
            src={game.thumbnailUrl} 
            alt={t(game.title)} 
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-30 group-hover:opacity-70 transition-opacity duration-300"></div>
        </div>
        <div className="p-4">
          <h3 className="mb-2 text-lg font-semibold text-white transition-colors group-hover:text-indigo-400">
            {t(game.title)}
          </h3>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center rounded-full bg-indigo-900/70 px-2.5 py-0.5 text-xs font-medium text-indigo-200">
              {t(game.category)}
            </span>
            <div className="flex items-center">
              <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="ml-1 text-xs text-gray-400 font-medium">{game.rating}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

// Lazy load game components
const MemoryMatch = lazy(() => import('../games/memory-match'));
const MemoryMatchProPlus = lazy(() => import('../games/memory-match-pro-plus'));
const MemoryMatchBattle = lazy(() => import('../games/memory-match-battle'));
const SequenceRecall = lazy(() => import('../games/sequence-recall'));
const SpatialMemory = lazy(() => import('../games/spatial-memory'));
const LogicGrid = React.lazy(() => import('../games/logic-grid'));
const AttentionZone = React.lazy(() => import('../games/attention-zone'));
const FocusReflex = React.lazy(() => import('../games/focus-reflex'));
const FocusMaster = React.lazy(() => import('../games/focus-master'));
const PatternSolver = React.lazy(() => import('../games/pattern-solver'));
const SyllogismChallenge = React.lazy(() => import('../games/syllogism-challenge'));
const BrainPuzzleMaster = React.lazy(() => import('../games/brain-puzzle-master'));
const ConnectionPaths = React.lazy(() => import('../games/connection-paths'));
const ArithmeticAdventure = React.lazy(() => import('../games/arithmetic-adventure'));
const NumberNinja = React.lazy(() => import('../games/number-ninja/NumberNinja'));
const AlgebraQuest = React.lazy(() => import('../games/algebra-quest'));
const MathChallenge = React.lazy(() => import('../games/math_challenge'));
const MathRace = React.lazy(() => import('../games/math-race'));
const WordWizard = React.lazy(() => import('../games/word-wizard'));
const SynonymMatch = React.lazy(() => import('../games/synonym-match'));
const GrammarGuardian = React.lazy(() => import('../games/grammar-guardian'));
const WordConnections = React.lazy(() => import('../games/word-connections'));
const WordDuel = React.lazy(() => import('../games/word-duel'));
const VocabularyBuilder = React.lazy(() => import('../games/vocabulary-builder'));
const PatternRecognition = React.lazy(() => import('../games/pattern-recognition'));

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
  const navigate = useNavigate();

  const game = useMemo(() => {
    return allGames.find(g => g.id === gameId);
  }, [gameId]);

  // 获取相关游戏
  const relatedGames = useMemo(() => {
    if (!game) return [];
    
    // 根据相同类别或相同难度级别获取相关游戏
    const sameCategory = allGames.filter(g => 
      g.id !== gameId && (g.category === game.category || g.difficulty === game.difficulty)
    );
    
    // 随机洗牌
    const shuffled = [...sameCategory].sort(() => 0.5 - Math.random());
    
    // 返回最多4个游戏
    return shuffled.slice(0, 4);
  }, [game, gameId]);

  const handleGameComplete = (score: number, moves: number, time: number) => {
    console.log('Game completed:', {score, moves, time});
  };

  // Adapter function for MemoryMatchBattle
  const handleBattleGameComplete = (score: number, time: number) => {
    // Pass 0 for moves or another default value
    handleGameComplete(score, 0, time);
  };
// Adapter function for ArithmeticAdventure
  const handleArithmeticGameComplete = (score: number, level: number) => {
    // Pass level as moves, 0 for time (or another appropriate default)
    handleGameComplete(score, level, 0);
  };
     // Adapter function for NumberNinja
     const handleNumberNinjaComplete = (score: number, level: number, totalSolved: number) => {
      // Pass level as moves and totalSolved as time
      handleGameComplete(score, level, totalSolved);
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
    if (!game) return null;

    const commonProps = {
      difficulty: "medium" as const,
      onGameComplete: handleGameComplete,
      onExit: handleExitGame,
    };

    switch (game.id) {
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
      case 'arithmetic-adventure':
          return (
            <Suspense fallback={<GameLoader />}>
            <ArithmeticAdventure
              difficulty={game.difficulty}
              onGameComplete={handleArithmeticGameComplete}
              onExit={handleExitGame}
            />
            </Suspense>
          );  
        case 'number-ninja':
          return (
            <Suspense fallback={<GameLoader />}>
              <NumberNinja
                difficulty={game.difficulty}
                onGameComplete={handleNumberNinjaComplete}
                onExit={handleExitGame}
              />
            </Suspense>
          );
        case 'algebra-quest':
          return (
            <Suspense fallback={<GameLoader />}>
              <AlgebraQuest
                difficulty={game.difficulty}
                onGameComplete={(score) => handleGameComplete(score, 0, 0)}
                onExit={handleExitGame}
              />
            </Suspense>
          );
      case 'memory-match-battle':
        return (
          <Suspense fallback={<GameLoader />}>
            <MemoryMatchBattle 
              difficulty={game.difficulty}
              onComplete={handleBattleGameComplete}
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
      case 'logic-grid':
        return (
          <Suspense fallback={<GameLoader />}>
            <LogicGrid 
              difficulty={game.difficulty}
              onGameComplete={handleGameComplete}
              onExit={handleExitGame}
            />
          </Suspense>
        );
      case 'attention-zone':
        return (
          <Suspense fallback={<GameLoader />}>
            <AttentionZone 
              difficulty={game.difficulty}
              onGameComplete={handleGameComplete}
              onExit={handleExitGame}
            />
          </Suspense>
        );
      case 'focus-reflex':
        return (
          <Suspense fallback={<GameLoader />}>
            <FocusReflex 
              difficulty={game.difficulty}
              onGameComplete={(score, accuracy, maxCombo) => handleGameComplete(score, accuracy, maxCombo)}
              onExit={handleExitGame}
            />
          </Suspense>
        );
      case 'focus-master':
        return (
          <Suspense fallback={<GameLoader />}>
            <FocusMaster 
              difficulty={game.difficulty}
              onGameComplete={(score, accuracy, focusTime) => handleGameComplete(score, accuracy, focusTime)}
              onExit={handleExitGame}
            />
          </Suspense>
        );
      case 'pattern-solver':
        return (
          <Suspense fallback={<GameLoader />}>
            <PatternSolver 
              difficulty={game.difficulty}
              onGameComplete={handleGameComplete}
              onExit={handleExitGame}
            />
          </Suspense>
        );
      case 'syllogism-challenge':
        return (
          <Suspense fallback={<GameLoader />}>
            <SyllogismChallenge 
              difficulty={game.difficulty}
              onGameComplete={handleGameComplete}
              onExit={handleExitGame}
            />
          </Suspense>
        );
      case 'brain-puzzle-master':
        return (
          <Suspense fallback={<GameLoader />}>
            <BrainPuzzleMaster
              difficulty={game.difficulty}
              onGameComplete={handleGameComplete}
              onExit={handleExitGame}
            />
          </Suspense>
        );
      case 'connection-paths':
        return (
          <Suspense fallback={<GameLoader />}>
            <ConnectionPaths
              difficulty={game.difficulty}
              onGameComplete={handleGameComplete}
              onExit={handleExitGame}
            />
          </Suspense>
        );
      case 'math-race':
        return (
          <MathRace
            {...commonProps}
          />
        );
      case 'word-wizard':
        return (
          <Suspense fallback={<GameLoader />}>
            <WordWizard
              difficulty={game.difficulty}
              onGameComplete={handleGameComplete}
              onExit={handleExitGame}
            />
          </Suspense>
        );
      case 'synonym-match':
        return (
          <Suspense fallback={<GameLoader />}>
            <SynonymMatch
              difficulty={game.difficulty}
              onGameComplete={handleGameComplete}
              onExit={handleExitGame}
            />
          </Suspense>
        );
      case 'word-connections':
        return (
          <Suspense fallback={<GameLoader />}>
            <WordConnections
              difficulty={game.difficulty}
              onGameComplete={(score, level, categoriesCompleted) => handleGameComplete(score, level, categoriesCompleted)}
              onExit={handleExitGame}
            />
          </Suspense>
        );
      case 'grammar-guardian':
        return (
          <Suspense fallback={<GameLoader />}>
            <GrammarGuardian
              difficulty={game.difficulty}
              onGameComplete={(score, level, correctAnswers) => handleGameComplete(score, level, correctAnswers)}
              onExit={handleExitGame}
            />
          </Suspense>
        );
      case 'word-duel':
        return (
          <Suspense fallback={<GameLoader />}>
            <WordDuel
              difficulty={game.difficulty}
              onGameComplete={(score, wordsGuessed, bestStreak) => handleGameComplete(score, wordsGuessed, bestStreak)}
              onExit={handleExitGame}
            />
          </Suspense>
        );
      case 'pattern-recognition':
        return (
          <Suspense fallback={<GameLoader />}>
            <PatternRecognition
              difficulty={game.difficulty}
              onGameComplete={(score, level, patternsCompleted) => handleGameComplete(score, level, patternsCompleted)}
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
    } else if (gameId === 'memory-match-pro-plus') {
      return (
        <div className="game-description">
          <h3>{t('rules')}:</h3>
          <ul>
            <li>{t('memory_match_pro_plus.rule_1', '翻开卡片找到匹配的对子')}</li>
            <li>{t('memory_match_pro_plus.rule_2', '每次只能翻开两张卡片')}</li>
            <li>{t('memory_match_pro_plus.rule_3', '如果卡片匹配，则保持正面朝上')}</li>
            <li>{t('memory_match_pro_plus.rule_4', '记住卡片位置以减少翻牌次数')}</li>
            <li>{t('memory_match_pro_plus.rule_5', '完成所有匹配对以通过每个关卡')}</li>
            <li>{t('memory_match_pro_plus.rule_6', '挑战增强版包含更多卡片类型和特殊效果')}</li>
          </ul>
          <p className="mt-3 text-gray-700 dark:text-gray-300">
            {t('memory_match_pro_plus.tips', '提示：尝试创建心理图像或使用位置模式来记住卡片位置。专注力是成功的关键！')}
          </p>
        </div>
      );
    } else if (gameId === 'algebra-quest') {
      return (
        <div className="game-description">
          <h3>{t('rules')}:</h3>
          <ul>
            <li>Solve algebraic equations of increasing difficulty</li>
            <li>Each correct answer earns points based on difficulty level</li>
            <li>Use hints wisely as they are limited</li>
            <li>Complete as many problems as possible before the timer ends</li>
            <li>Advance your mathematical skills with interactive feedback</li>
          </ul>
        </div>
      );
    } else if (gameId === 'number-ninja') {
      return (
        <div className="game-description">
          <h3>{t('rules')}:</h3>
          <ul>
            <li>{t('number_ninja.rule_1', 'Solve math problems quickly to earn points')}</li>
            <li>{t('number_ninja.rule_2', 'Choose the correct answer from four options')}</li>
            <li>{t('number_ninja.rule_3', 'The faster you answer, the more points you earn')}</li>
            <li>{t('number_ninja.rule_4', 'Build up a streak of correct answers for bonus points')}</li>
            <li>{t('number_ninja.rule_5', 'Complete all problems in each level before time runs out')}</li>
            <li>{t('number_ninja.rule_6', 'Difficulty increases with each level')}</li>
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
            <li>{t('attention_zone_rule_1', 'During the memorize phase, several squares will be highlighted for a short time.')}</li>
            <li>{t('attention_zone_rule_2', 'Remember the position of these highlighted squares carefully.')}</li>
            <li>{t('attention_zone_rule_3', 'After the highlighted squares disappear, click on all the positions where you saw them.')}</li>
            <li>{t('attention_zone_rule_4', 'Earn 10 points for each correct selection and lose 5 points for incorrect selections.')}</li>
            <li>{t('attention_zone_rule_5', 'The game becomes progressively more challenging with more squares to remember.')}</li>
            <li>{t('attention_zone_rule_6', 'Complete all rounds to earn the highest score possible!')}</li>
          </ul>
          <p className="mt-3 text-gray-700 dark:text-gray-300">
            {t('attention_zone_tips', 'Tips: Try to create mental patterns or groups to remember more squares. Focus on the center first, then the edges.')}
          </p>
        </div>
      );
    } else if (gameId === 'focus-reflex') {
      return (
        <div className="game-description">
          <h3>{t('rules')}:</h3>
          <ul>
            <li>{t('focus_reflex.rule_1', 'Watch for the target shape and color shown at the top of the game area.')}</li>
            <li>{t('focus_reflex.rule_2', 'Click ONLY on targets that match both the shape and color of the target indicator.')}</li>
            <li>{t('focus_reflex.rule_3', 'Avoid clicking on distractions (targets that match only in shape or only in color).')}</li>
            <li>{t('focus_reflex.rule_4', 'Build a combo by clicking on consecutive correct targets to earn bonus points.')}</li>
            <li>{t('focus_reflex.rule_5', 'Targets will automatically disappear after a short time - be quick!')}</li>
            <li>{t('focus_reflex.rule_6', 'Try to maintain high accuracy while building your score before time runs out.')}</li>
          </ul>
          <p className="mt-3 text-gray-700 dark:text-gray-300">
            {t('focus_reflex.tips', 'Tips: Focus on the center of the game area and scan outward. Pay close attention to both shape AND color to avoid distractions.')}
          </p>
        </div>
      );
    } else if (gameId === 'logic-grid') {
      return (
        <div className="game-description">
          <h3>{t('rules')}:</h3>
          <ul>
            <li>{t('logic_grid.rule_1', 'Solve logic puzzles by deducing the correct relationships between different elements')}</li>
            <li>{t('logic_grid.rule_2', 'Use the clues provided to fill in the grid with X marks (not possible) and checkmarks (correct match)')}</li>
            <li>{t('logic_grid.rule_3', 'Each element from one category can only match with one element from each other category')}</li>
            <li>{t('logic_grid.rule_4', 'Use process of elimination and logical deduction to find all correct relationships')}</li>
            <li>{t('logic_grid.rule_5', 'Complete the grid within the time limit to earn maximum points')}</li>
            <li>{t('logic_grid.rule_6', 'Earn bonus points for completing without using hints and finishing quickly')}</li>
          </ul>
          <p className="mt-3 text-gray-700 dark:text-gray-300">
            {t('logic_grid.tips', 'Tips: Always start with the most restrictive clues. When you mark a relationship as impossible or confirmed, check if this creates new deductions elsewhere in the grid.')}
          </p>
        </div>
      );
    } else if (gameId === 'pattern-solver') {
      return (
        <div className="game-description">
          <h3>{t('rules')}:</h3>
          <ul>
            <li>Identify the pattern in each sequence and select the correct next value</li>
            <li>Patterns can be arithmetic, geometric, or based on other mathematical relations</li>
            <li>Earn points for correct answers and advance through increasingly difficult levels</li>
            <li>Use hints wisely as they are limited based on difficulty</li>
            <li>Complete as many patterns as possible before time runs out</li>
          </ul>
        </div>
      );
    } else if (gameId === 'syllogism-challenge') {
      return (
        <div className="game-description">
          <h3>{t('rules')}:</h3>
          <ul>
            <li>Each problem presents logical premises that you must analyze carefully</li>
            <li>Select the conclusion that logically follows from the given premises</li>
            <li>Earn points for correct answers and lose points for incorrect ones</li>
            <li>Use hints wisely as they are limited based on difficulty level</li>
            <li>Complete all problems before the time runs out to maximize your score</li>
          </ul>
        </div>
      );
    } else if (gameId === 'brain-puzzle-master') {
      return (
        <div className="game-description">
          <h3>{t('rules')}:</h3>
          <ul>
            <li>Challenge yourself with a variety of puzzle types: pattern recognition, mathematical, verbal, and visual</li>
            <li>Select the correct answer from multiple options for each puzzle</li>
            <li>Earn points for correct answers and lose points for incorrect ones</li>
            <li>Use hints when you're stuck (limited based on difficulty level)</li>
            <li>Complete all puzzles before the time runs out to maximize your score</li>
            <li>Pause the game at any time if you need a break</li>
          </ul>
        </div>
      );
    } else if (gameId === 'connection-paths') {
      return (
        <div className="game-description">
          <h3>{t('rules')}:</h3>
          <ul>
            <li>{t('connection_paths_rule_1', 'Connect each pair of colored endpoints with a continuous path.')}</li>
            <li>{t('connection_paths_rule_2', 'Paths cannot cross each other or go through restricted cells (red blocks).')}</li>
            <li>{t('connection_paths_rule_3', 'Each path must follow a straight line horizontally or vertically between grid cells.')}</li>
            <li>{t('connection_paths_rule_4', 'Click on a colored endpoint to start drawing a path, then click on adjacent cells to continue the path.')}</li>
            <li>{t('connection_paths_rule_5', 'Complete all levels before time runs out to maximize your score.')}</li>
            <li>{t('connection_paths_rule_6', 'Use hints wisely - they reveal one correct step of a random path.')}</li>
          </ul>
        </div>
      );
    } else if (gameId === 'synonym-match') {
      return (
        <div className="game-description">
          <h3>{t('rules')}:</h3>
          <ul>
            <li>{t('synonym_match.rule_1', 'Select words that are synonyms (have similar meanings) to the displayed word')}</li>
            <li>{t('synonym_match.rule_2', 'Each correct answer earns points based on your current streak and time remaining')}</li>
            <li>{t('synonym_match.rule_3', 'Maintain a streak of correct answers for bonus points')}</li>
            <li>{t('synonym_match.rule_4', 'Use hints wisely as they are limited based on difficulty level')}</li>
            <li>{t('synonym_match.rule_5', 'Complete all words in each level before time runs out')}</li>
            <li>{t('synonym_match.rule_6', 'Progress through multiple levels of increasing difficulty')}</li>
          </ul>
        </div>
      );
    } else if (gameId === 'word-connections') {
      return (
        <div className="game-description">
          <h3>{t('rules')}:</h3>
          <ul>
            <li>{t('word_connections.rule_1', 'Find and connect words that belong to the same category')}</li>
            <li>{t('word_connections.rule_2', 'Select two words from the same category to create a match')}</li>
            <li>{t('word_connections.rule_3', 'Complete all categories in each level to advance')}</li>
            <li>{t('word_connections.rule_4', 'Earn points for each matched category and bonus points for remaining time')}</li>
            <li>{t('word_connections.rule_5', 'Use hints when you\'re stuck to help find matching words')}</li>
            <li>{t('word_connections.rule_6', 'Complete as many levels as possible before time runs out')}</li>
          </ul>
        </div>
      );
    } else if (gameId === 'grammar-guardian') {
      return (
        <div className="game-description">
          <h3>{t('rules')}:</h3>
          <ul>
            <li>{t('grammar_guardian.rule_1', 'Find grammar errors in sentences by clicking on the incorrect word')}</li>
            <li>{t('grammar_guardian.rule_2', 'Understand the explanation provided for each grammar error')}</li>
            <li>{t('grammar_guardian.rule_3', 'Earn points based on your speed, accuracy, and streak of correct answers')}</li>
            <li>{t('grammar_guardian.rule_4', 'Use hints when needed to highlight the incorrect word in a sentence')}</li>
            <li>{t('grammar_guardian.rule_5', 'Complete all sentences in each level before time runs out')}</li>
            <li>{t('grammar_guardian.rule_6', 'Progress through multiple levels with increasingly challenging grammar errors')}</li>
          </ul>
        </div>
      );
    } else if (gameId === 'word-duel') {
      return (
        <div className="game-description">
          <h3>{t('rules')}:</h3>
          <ul>
            <li>{t('word_duel.rule_1', 'Guess the hidden word in a limited number of attempts')}</li>
            <li>{t('word_duel.rule_2', 'Each guess provides feedback - green for correct letters in the right position, yellow for correct letters in the wrong position')}</li>
            <li>{t('word_duel.rule_3', 'Solve as many words as you can to increase your level and score')}</li>
            <li>{t('word_duel.rule_4', 'Build a streak of correct answers for bonus points')}</li>
            <li>{t('word_duel.rule_5', 'Track your progress with the on-screen keyboard that shows used letters')}</li>
            <li>{t('word_duel.rule_6', 'Complete each word before the timer runs out')}</li>
          </ul>
        </div>
      );
    } else if (gameId === 'pattern-recognition') {
      return (
        <div className="game-description">
          <h3>{t('rules')}:</h3>
          <ul>
            <li>{t('pattern_recognition.rule_1', 'Identify what comes next in a sequence of patterns')}</li>
            <li>{t('pattern_recognition.rule_2', 'Choose from multiple options to complete each pattern')}</li>
            <li>{t('pattern_recognition.rule_3', 'Patterns include shapes, colors, numbers, or combinations')}</li>
            <li>{t('pattern_recognition.rule_4', 'Earn points based on your speed, accuracy, and streak')}</li>
            <li>{t('pattern_recognition.rule_5', 'Complete patterns to advance through levels of increasing difficulty')}</li>
            <li>{t('pattern_recognition.rule_6', 'Answer quickly to maximize your time bonus points')}</li>
          </ul>
        </div>
      );
    } else if (gameId === 'focus-master') {
      return (
        <div className="game-description">
          <h3>{t('rules')}:</h3>
          <ul>
            <li>{t('focus_master.rule_1', 'Click on purple targets while avoiding red distractors')}</li>
            <li>{t('focus_master.rule_2', 'React quickly - targets will disappear after a short time')}</li>
            <li>{t('focus_master.rule_3', 'Build combos by hitting consecutive targets for bonus points')}</li>
            <li>{t('focus_master.rule_4', 'Hitting red distractors will reset your combo')}</li>
            <li>{t('focus_master.rule_5', 'Smaller targets are worth more points')}</li>
            <li>{t('focus_master.rule_6', 'Maintain consistent accuracy to maximize your focus time score')}</li>
          </ul>
          <p className="mt-3 text-gray-700 dark:text-gray-300">
            {t('focus_master.tips', 'Tips: Keep your eyes on the center of the game area and scan outward. Stay calm and maintain a rhythm to build your focus streak.')}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      {game && (
        <Helmet>
          <title>{game.title} | BrainWeb - Brain Training Games</title>
          <meta name="description" content={`Play ${game.title} - ${game.description}`} />
          <meta name="keywords" content={`brain games, ${game.title.toLowerCase()}, cognitive training, ${game.category.toLowerCase()}`} />
          <meta property="og:title" content={`${game.title} | BrainWeb`} />
          <meta property="og:description" content={game.description} />
          <meta property="og:image" content={game.thumbnailUrl} />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={`${game.title} | BrainWeb`} />
          <meta name="twitter:description" content={game.description} />
          <meta name="twitter:image" content={game.thumbnailUrl} />
          <link rel="canonical" href={`https://brainweb.example.com/games/${gameId}`} />
        </Helmet>
      )}
      <div className="relative min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-4">
          {!isPlaying ? (
            <>
              <div className="mb-6 flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3">
                  <img 
                    src={game.thumbnailUrl} 
                    alt={game.title} 
                    className="w-full h-auto rounded-xl shadow-lg shadow-black/50 transition-transform hover:scale-[1.02] duration-300"
                  />
                  <div className="mt-4 flex justify-between">
                    <span className="inline-flex items-center rounded-full bg-indigo-900/70 px-3 py-1 text-sm font-medium text-indigo-200 shadow-sm">
                      {t(game.category)}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-amber-900/70 px-3 py-1 text-sm font-medium text-amber-200 shadow-sm">
                      {t(game.difficulty)}
                    </span>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => setIsPlaying(true)}
                      className="w-full rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-700 py-3 text-center text-lg font-bold text-white shadow-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 transform hover:scale-[1.03] hover:shadow-xl border border-indigo-500/30 focus:outline-none focus:ring-4 focus:ring-indigo-500/30"
                    >
                      {t('play_now')} <span className="ml-2">▶</span>
                    </button>
                    <p className="text-center text-sm text-indigo-400 mt-2 font-medium">
                      {t('click_to_start')}
                    </p>
                  </div>
                </div>

                <div className="w-full md:w-2/3 space-y-5">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">
                      {t(game.title)}
                    </h1>
                    <div className="flex items-center mb-3 flex-wrap gap-x-5 gap-y-2">
                      <div className="flex items-center bg-yellow-900/20 px-3 py-1 rounded-md">
                        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="ml-1 text-gray-300 font-medium">{game.rating}/5.0</span>
                      </div>
                      {game.playCount && (
                        <div className="flex items-center bg-blue-900/20 px-3 py-1 rounded-md">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          <span className="ml-1 text-gray-300 font-medium">{game.playCount.toLocaleString()} {t('plays')}</span>
                        </div>
                      )}
                      <button 
                        onClick={openShareModal}
                        className="flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors bg-blue-900/20 px-3 py-1 rounded-md hover:bg-blue-800/30"
                      >
                        <ShareIcon className="w-4 h-4 mr-1" />
                        {t('share')}
                      </button>
                    </div>
                    <p className="text-gray-300 text-lg leading-relaxed">
                      {t(game.description)}
                    </p>
                  </div>

                  <div className="bg-gray-800/50 p-5 rounded-xl shadow-sm shadow-black/30 border border-gray-700">
                    <h2 className="text-2xl font-semibold text-white mb-3">{t('how_to_play')}</h2>
                    <div className="prose prose-sm prose-invert max-w-none text-gray-300">
                      {game.howToPlay ? (
                        <p>{t(game.howToPlay)}</p>
                      ) : renderGameDescription() ? (
                         renderGameDescription()
                      ) : (
                        <p>{t('game_instructions_placeholder', { title: t(game.title) })}</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-800/50 p-5 rounded-xl shadow-sm shadow-black/30 border border-gray-700">
                    <GameReviews gameId={game.id} />
                  </div>
                </div>
              </div>
              
              {/* 相关游戏部分 */}
              {relatedGames.length > 0 && (
                <div className="mt-10 mb-8">
                  <h2 className="mb-4 text-2xl font-bold text-white flex items-center">
                    <span className="mr-2 bg-indigo-700 w-1 h-6 rounded-full inline-block"></span>
                    {t('related_games')}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {relatedGames.map(relatedGame => (
                      <RelatedGameCard key={relatedGame.id} game={relatedGame} />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className={`game-container relative ${gameId === 'syllogism-challenge' ? 'bg-black' : ''}`}>
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
      </div>
    </>
  );
};

export default GameDetailPage;
