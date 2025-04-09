import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
// @ts-ignore
import confetti from 'canvas-confetti';
import './MemoryMatch.css';

// Card interface
interface Card {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

// Difficulty levels and their corresponding grid sizes
const difficultyLevels = {
  easy: { rows: 3, cols: 4 }, // 12 cards (6 pairs)
  medium: { rows: 4, cols: 4 }, // 16 cards (8 pairs)
  hard: { rows: 4, cols: 5 }  // 20 cards (10 pairs)
};

// Card image patterns (emojis for simplicity, could be replaced with actual images)
const cardPatterns = [
  '🍎', '🍌', '🍒', '🍊', '🍇', '🍉', '🍓', '🍑', '🥝', '🍍',
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🦁'
];

interface MemoryMatchProps {
  difficulty?: 'easy' | 'medium' | 'hard';
  onGameComplete?: (score: number, moves: number, time: number) => void;
  onExit?: () => void;
}

const MemoryMatch: React.FC<MemoryMatchProps> = ({
  difficulty = 'medium',
  onGameComplete,
  onExit
}) => {
  const { t } = useTranslation();
  const [cards, setCards] = useState<Card[]>([]);
  const [firstCard, setFirstCard] = useState<Card | null>(null);
  const [secondCard, setSecondCard] = useState<Card | null>(null);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [gameLevel, setGameLevel] = useState<'easy' | 'medium' | 'hard'>(difficulty);
  
  // Initialize the game with cards
  const initializeGame = useCallback(() => {
    // Reset game state
    setFirstCard(null);
    setSecondCard(null);
    setMoves(0);
    setScore(0);
    setIsLocked(false);
    setIsGameComplete(false);
    setTimer(0);
    setIsGameStarted(false);
    setMatchedPairs(0);
    
    // Configure the grid size based on difficulty
    const { rows, cols } = difficultyLevels[gameLevel];
    const totalCards = rows * cols;
    const pairs = totalCards / 2;
    
    // Generate card pairs
    const selectedPatterns = cardPatterns.slice(0, pairs);
    const cardPairs = [...selectedPatterns, ...selectedPatterns];
    
    // Shuffle cards
    const shuffledCards = cardPairs
      .sort(() => Math.random() - 0.5)
      .map((value, index) => ({
        id: index,
        value,
        isFlipped: false,
        isMatched: false
      }));
    
    setCards(shuffledCards);
  }, [gameLevel]);
  
  // Initialize the game when component mounts or difficulty changes
  useEffect(() => {
    initializeGame();
  }, [initializeGame, gameLevel]);
  
  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isGameStarted && !isGameComplete) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGameStarted, isGameComplete]);
  
  // Handle flipping a card
  const handleCardClick = (clickedCard: Card) => {
    // Start the game on first card click
    if (!isGameStarted) {
      setIsGameStarted(true);
    }
    
    // Ignore if the game is locked during card evaluation or the card is already flipped/matched
    if (isLocked || clickedCard.isFlipped || clickedCard.isMatched) {
      return;
    }
    
    // Flip the clicked card
    const updatedCards = cards.map((card) => 
      card.id === clickedCard.id ? { ...card, isFlipped: true } : card
    );
    
    setCards(updatedCards);
    
    // Handle first card selection
    if (!firstCard) {
      setFirstCard(clickedCard);
      return;
    }
    
    // Handle second card selection
    // Using secondCard in comparison to fix ESLint warning
    const currentSecondCard = clickedCard;
    setSecondCard(currentSecondCard);
    setMoves((prevMoves) => prevMoves + 1);
    setIsLocked(true);
    
    // Check for a match
    if (firstCard.value === currentSecondCard.value) {
      // Match found
      setTimeout(() => {
        const matchedCards = cards.map((card) => 
          (card.id === firstCard.id || card.id === currentSecondCard.id) 
            ? { ...card, isMatched: true } 
            : card
        );
        
        setCards(matchedCards);
        setScore((prevScore) => prevScore + 10);
        setMatchedPairs((prev) => prev + 1);
        resetCardSelection();
        
        // Check if all pairs are matched
        const totalPairs = matchedCards.length / 2;
        if (matchedPairs + 1 === totalPairs) {
          handleGameComplete(score + 10, moves + 1, timer);
        }
      }, 500);
    } else {
      // No match
      setTimeout(() => {
        const flippedBackCards = cards.map((card) => 
          (card.id === firstCard.id || card.id === currentSecondCard.id) 
            ? { ...card, isFlipped: false } 
            : card
        );
        
        setCards(flippedBackCards);
        resetCardSelection();
      }, 1000);
    }
  };
  
  // Reset card selection after evaluation
  const resetCardSelection = () => {
    setFirstCard(null);
    setSecondCard(null);
    setIsLocked(false);
  };
  
  // Handle game completion
  const handleGameComplete = (finalScore: number, finalMoves: number, finalTime: number) => {
    setIsGameComplete(true);
    
    // Trigger confetti effect
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    // Call the onGameComplete callback if provided
    if (onGameComplete) {
      onGameComplete(finalScore, finalMoves, finalTime);
    }
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Calculate grid layout based on difficulty
  const gridLayout = difficultyLevels[gameLevel];
  const gridTemplateColumns = `repeat(${gridLayout.cols}, 1fr)`;
  
  return (
    <div className="flex flex-col items-center w-full">
      {/* Game Controls */}
      <div className="w-full flex justify-between items-center mb-4 px-4">
        {/* 计分区 */}
        <div className="flex items-center space-x-4">
          <div className="bg-purple-100 dark:bg-purple-900 py-1 px-3 rounded-md">
            <span className="font-medium text-purple-800 dark:text-purple-200">{t('moves')}: {moves}</span>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900 py-1 px-3 rounded-md">
            <span className="font-medium text-blue-800 dark:text-blue-200">{t('time')}: {formatTime(timer)}</span>
          </div>
          <div className="bg-green-100 dark:bg-green-900 py-1 px-3 rounded-md">
            <span className="font-medium text-green-800 dark:text-green-200">{t('score')}: {score}</span>
          </div>
        </div>
        
        {/* 游戏控制按钮 */}
        <div className="flex space-x-2">
          <button
            onClick={initializeGame}
            className="bg-purple-600 hover:bg-purple-700 text-white py-1 px-3 rounded-md text-sm transition-colors"
          >
            {t('restart')}
          </button>
          {onExit && (
            <button
              onClick={onExit}
              className="bg-gray-600 hover:bg-gray-700 text-white py-1 px-3 rounded-md text-sm transition-colors"
            >
              {t('exit')}
            </button>
          )}
        </div>
      </div>
      
      {/* 难度选择器 - 居中显示 */}
      <div className="mb-4 flex justify-center space-x-2">
        <button
          onClick={() => setGameLevel('easy')}
          className={`px-3 py-1 rounded-md text-sm ${
            gameLevel === 'easy'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {t('easy')}
        </button>
        <button
          onClick={() => setGameLevel('medium')}
          className={`px-3 py-1 rounded-md text-sm ${
            gameLevel === 'medium'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {t('medium')}
        </button>
        <button
          onClick={() => setGameLevel('hard')}
          className={`px-3 py-1 rounded-md text-sm ${
            gameLevel === 'hard'
              ? 'bg-red-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {t('hard')}
        </button>
      </div>
      
      {/* Game Board */}
      <div 
        className="grid gap-2 w-full max-w-2xl mx-auto"
        style={{ gridTemplateColumns }}
      >
        {cards.map((card) => (
          <div 
            key={card.id}
            className={`aspect-square rounded-lg flex items-center justify-center cursor-pointer transform transition-all duration-300 ${
              card.isMatched ? 'opacity-70' : ''
            } game-card`}
            onClick={() => handleCardClick(card)}
          >
            <div className={`w-full h-full rounded-lg bg-white dark:bg-gray-700 shadow-md border-2 ${
              card.isMatched 
                ? 'border-green-500 card-match' 
                : 'border-purple-300 dark:border-purple-600'
            } flex items-center justify-center transform transition-all duration-300 ${
              card.isFlipped ? 'flip-card' : ''
            }`}>
              {card.isFlipped || card.isMatched ? (
                <span className="text-3xl">{card.value}</span>
              ) : (
                <span className="bg-purple-500 dark:bg-purple-700 rounded-lg w-full h-full flex items-center justify-center">
                  <svg 
                    className="w-8 h-8 text-white" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Game Complete Overlay */}
      {isGameComplete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full text-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {t('congratulations')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              {t('you_completed_the_game')}
            </p>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-purple-100 dark:bg-purple-900 py-2 px-3 rounded-md">
                <div className="text-xs text-purple-800 dark:text-purple-200">
                  {t('moves')}
                </div>
                <div className="font-bold text-purple-800 dark:text-purple-200">
                  {moves}
                </div>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 py-2 px-3 rounded-md">
                <div className="text-xs text-blue-800 dark:text-blue-200">
                  {t('time')}
                </div>
                <div className="font-bold text-blue-800 dark:text-blue-200">
                  {formatTime(timer)}
                </div>
              </div>
              <div className="bg-green-100 dark:bg-green-900 py-2 px-3 rounded-md">
                <div className="text-xs text-green-800 dark:text-green-200">
                  {t('score')}
                </div>
                <div className="font-bold text-green-800 dark:text-green-200">
                  {score}
                </div>
              </div>
            </div>
            <div className="flex space-x-2 justify-center">
              <button
                onClick={initializeGame}
                className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md transition-colors"
              >
                {t('play_again')}
              </button>
              {onExit && (
                <button
                  onClick={onExit}
                  className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md transition-colors"
                >
                  {t('exit')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Game Info */}
      {!isGameStarted && (
        <div className="mt-8 text-center p-4 bg-white dark:bg-gray-800 rounded-lg max-w-2xl mx-auto">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('how_to_play')}
          </h2>
          <ul className="text-sm text-gray-700 dark:text-gray-300 text-left space-y-1 mb-4">
            <li>• {t('memory_match_rule_1')}</li>
            <li>• {t('memory_match_rule_2')}</li>
            <li>• {t('memory_match_rule_3')}</li>
            <li>• {t('memory_match_rule_4')}</li>
          </ul>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('click_any_card_to_start')}
          </p>
        </div>
      )}
    </div>
  );
};

export default MemoryMatch; 