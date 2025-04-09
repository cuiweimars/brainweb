import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
// @ts-ignore
import confetti from 'canvas-confetti';
import './MemoryMatchProPlus.css';

// Card interface
interface Card {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

// Difficulty levels and their corresponding grid sizes
const difficultyLevels = {
  easy: { rows: 3, cols: 4, timeLimit: 90 }, // 12 cards (6 pairs)
  medium: { rows: 4, cols: 4, timeLimit: 120 }, // 16 cards (8 pairs)
  hard: { rows: 4, cols: 5, timeLimit: 150 },  // 20 cards (10 pairs)
  expert: { rows: 5, cols: 6, timeLimit: 180 }  // 30 cards (15 pairs)
};

// Theme options with their respective card patterns
const themes = {
  animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🦁', '🐮', '🐷', '🐸', '🐵', '🦄'],
  fruits: ['🍎', '🍌', '🍒', '🍊', '🍇', '🍉', '🍓', '🍑', '🥝', '🍍', '🥭', '🍐', '🍋', '🍈', '🍏'],
  space: ['🚀', '🛸', '🌙', '⭐', '☄️', '🪐', '🌠', '🌌', '🌚', '🌞', '🌎', '👾', '👨‍🚀', '🔭', '🛰️'],
  sports: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🥊', '🏊', '🚴', '⛷️', '🏄']
};

interface MemoryMatchProPlusProps {
  difficulty?: 'easy' | 'medium' | 'hard' | 'expert';
  onGameComplete?: (score: number, moves: number, time: number, level: number) => void;
  onExit?: () => void;
}

const MemoryMatchProPlus: React.FC<MemoryMatchProPlusProps> = ({
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
  const [timeLimit, setTimeLimit] = useState(120);
  const [timeRemaining, setTimeRemaining] = useState(120);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [gameLevel, setGameLevel] = useState<'easy' | 'medium' | 'hard' | 'expert'>(difficulty);
  const [theme, setTheme] = useState<keyof typeof themes>('animals');
  const [gameLevel2, setGameLevel2] = useState(1);
  const [streak, setStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [timeAddedAnimation, setTimeAddedAnimation] = useState(false);
  const [scoreAnimation, setScoreAnimation] = useState(false);
  
  // Refs for animations
  const scoreRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<HTMLDivElement>(null);
  
  // Initialize the game with cards
  const initializeGame = useCallback((level: number = 1, newTheme?: keyof typeof themes) => {
    // Reset game state
    setFirstCard(null);
    setSecondCard(null);
    setMoves(0);
    setScore(prevScore => level > 1 ? prevScore : 0); // Keep score when advancing levels
    setIsLocked(false);
    setIsGameComplete(false);
    setTimer(0);
    setIsGameStarted(false);
    setMatchedPairs(0);
    setHintUsed(false);
    
    // Set time limit based on difficulty
    const newTimeLimit = difficultyLevels[gameLevel].timeLimit;
    setTimeLimit(newTimeLimit);
    setTimeRemaining(newTimeLimit);
    
    // Select theme
    const currentTheme = newTheme || theme;
    setTheme(currentTheme);
    
    // Configure the grid size based on difficulty
    const { rows, cols } = difficultyLevels[gameLevel];
    const totalCards = rows * cols;
    const pairs = totalCards / 2;
    
    // Generate card pairs
    const selectedPatterns = themes[currentTheme].slice(0, pairs);
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
  }, [gameLevel, theme]);
  
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
        setTimeRemaining((prevTime) => {
          const newTime = prevTime - 1;
          // Game over when time runs out
          if (newTime <= 0) {
            setIsGameComplete(true);
            clearInterval(interval);
            // Call the onGameComplete callback if provided
            if (onGameComplete) {
              onGameComplete(score, moves, timer, gameLevel2);
            }
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGameStarted, isGameComplete, onGameComplete, score, moves, timer, gameLevel2]);
  
  // Handle flipping a card
  const handleCardClick = (clickedCard: Card) => {
    // Start the game on first card click
    if (!isGameStarted) {
      setIsGameStarted(true);
    }
    
    // Ignore if the game is locked during card evaluation or the card is already flipped/matched
    if (isLocked || clickedCard.isFlipped || clickedCard.isMatched || isGameComplete) {
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
            ? { ...card, isMatched: true, isFlipped: true } 
            : card
        );
        
        // Update streak
        const newStreak = streak + 1;
        setStreak(newStreak);
        
        // Update highest streak
        if (newStreak > highestStreak) {
          setHighestStreak(newStreak);
        }
        
        // Calculate bonus points based on streak and speed
        const streakBonus = Math.min(newStreak * 5, 25); // Max 25 pts bonus
        const timeBonus = Math.max(5 - Math.floor(timer / 10), 0); // Faster matches get bonus
        const pointsEarned = 10 + streakBonus + timeBonus;
        
        // Animate score increase
        setScoreAnimation(true);
        setTimeout(() => setScoreAnimation(false), 500);
        
        // Update score
        setScore((prevScore) => prevScore + pointsEarned);
        
        // Add bonus time for quick matches
        if (newStreak >= 3) {
          const bonusTime = Math.min(newStreak, 5) * 2; // Max 10 sec bonus
          setTimeRemaining((prev) => Math.min(prev + bonusTime, timeLimit));
          setTimeAddedAnimation(true);
          setTimeout(() => setTimeAddedAnimation(false), 1000);
        }
        
        setCards(matchedCards);
        setMatchedPairs((prev) => prev + 1);
        resetCardSelection();
        
        // Check if all pairs are matched
        const totalPairs = matchedCards.length / 2;
        if (matchedPairs + 1 === totalPairs) {
          // Level complete
          setShowLevelComplete(true);
          
          // Trigger confetti effect
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
          });
          
          // Move to next level after delay
          setTimeout(() => {
            setShowLevelComplete(false);
            // If it's the final level (expert) or we're on level 3, end the game
            if (gameLevel === 'expert' || gameLevel2 >= 3) {
              handleGameComplete(score + pointsEarned, moves + 1, timer, gameLevel2);
            } else {
              // Advance to next level
              setGameLevel2((prev) => prev + 1);
              
              // Increase difficulty if needed
              if (gameLevel2 === 2 && gameLevel !== 'hard') {
                const nextLevel = gameLevel === 'easy' ? 'medium' : 'hard';
                setGameLevel(nextLevel);
              }
              
              // Reset for next level with a new theme
              const themes = ['animals', 'fruits', 'space', 'sports'] as const;
              const nextTheme = themes[Math.floor(Math.random() * themes.length)];
              
              // Reset hint count for new level
              setHintsRemaining(3);
              
              // Initialize next level
              initializeGame(gameLevel2 + 1, nextTheme);
            }
          }, 3000);
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
        
        // Reset streak on miss
        setStreak(0);
        
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
  const handleGameComplete = (finalScore: number, finalMoves: number, finalTime: number, finalLevel: number) => {
    setIsGameComplete(true);
    
    // Trigger confetti effect
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.6 }
    });
    
    // Call the onGameComplete callback if provided
    if (onGameComplete) {
      onGameComplete(finalScore, finalMoves, finalTime, finalLevel);
    }
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Define cardPair type
  type CardPair = [Card, Card];

  // Use a hint (reveal 2 cards briefly)
  const useHint = () => {
    if (hintsRemaining <= 0 || isLocked || isGameComplete || !isGameStarted) return;
    
    setHintsRemaining(prev => prev - 1);
    setHintUsed(true);
    
    // Find unmatched cards
    const unmatchedCards = cards.filter(card => !card.isMatched && !card.isFlipped);
    if (unmatchedCards.length < 2) return;
    
    // Get 2 cards that match
    let matchingPair: CardPair | null = null;
    for (let i = 0; i < unmatchedCards.length; i++) {
      for (let j = i + 1; j < unmatchedCards.length; j++) {
        if (unmatchedCards[i].value === unmatchedCards[j].value) {
          matchingPair = [unmatchedCards[i], unmatchedCards[j]];
          break;
        }
      }
      if (matchingPair) break;
    }
    
    // If no matching pair found, just show any two cards
    if (!matchingPair) {
      matchingPair = [unmatchedCards[0], unmatchedCards[1]];
    }
    
    // Capture the final matching pair value to use in the timeout
    const finalMatchingPair: CardPair = matchingPair;
    
    // Flip the cards temporarily
    const hintCards = cards.map(card => 
      (card.id === finalMatchingPair[0].id || card.id === finalMatchingPair[1].id) 
        ? { ...card, isFlipped: true } 
        : card
    );
    
    setCards(hintCards);
    setIsLocked(true);
    
    // Flip them back after 1.5 seconds
    setTimeout(() => {
      const resetCards = cards.map(card => 
        (card.id === finalMatchingPair[0].id || card.id === finalMatchingPair[1].id) 
          ? { ...card, isFlipped: false } 
          : card
      );
      setCards(resetCards);
      setIsLocked(false);
      setHintUsed(false);
    }, 1500);
  };
  
  // Calculate grid layout based on difficulty
  const gridLayout = difficultyLevels[gameLevel];
  const gridTemplateColumns = `repeat(${gridLayout.cols}, 1fr)`;
  
  // Calculate timer progress percentage
  const timerProgress = (timeRemaining / timeLimit) * 100;
  
  return (
    <div className="flex flex-col items-center w-full">
      {/* Game Controls */}
      <div className="w-full flex justify-between items-center mb-4 px-4">
        {/* 计分区 */}
        <div className="flex items-center space-x-4">
          <div className="bg-purple-100 dark:bg-purple-900 py-1 px-3 rounded-md">
            <span className="font-medium text-purple-800 dark:text-purple-200">{t('moves')}: {moves}</span>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900 py-1 px-3 rounded-md relative">
            <span className="font-medium text-blue-800 dark:text-blue-200">{t('time')}: {formatTime(timeRemaining)}</span>
            {timeAddedAnimation && (
              <span className="absolute -top-4 right-0 text-green-500 font-bold animate-bounce">+{Math.min(streak, 5) * 2}s</span>
            )}
          </div>
          <div ref={scoreRef} className={`bg-green-100 dark:bg-green-900 py-1 px-3 rounded-md ${scoreAnimation ? 'score-increase' : ''}`}>
            <span className="font-medium text-green-800 dark:text-green-200">{t('score')}: {score}</span>
          </div>
          <div className="bg-indigo-100 dark:bg-indigo-900 py-1 px-3 rounded-md">
            <span className="font-medium text-indigo-800 dark:text-indigo-200">{t('level')}: {gameLevel2}</span>
          </div>
        </div>
        
        {/* 游戏控制按钮 */}
        <div className="flex space-x-2">
          <button
            onClick={useHint}
            disabled={hintsRemaining <= 0 || isLocked || !isGameStarted}
            className={`${
              hintsRemaining > 0 && !isLocked && isGameStarted
                ? 'bg-yellow-500 hover:bg-yellow-600'
                : 'bg-gray-400'
            } text-white py-1 px-3 rounded-md text-sm transition-colors flex items-center space-x-1`}
          >
            <span>💡</span>
            <span>{t('hint')}: {hintsRemaining}</span>
          </button>
          <button
            onClick={() => initializeGame(1)}
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
      
      {/* Timer Bar */}
      <div className="w-full px-4 mb-4">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div 
            className="timer-bar"
            style={{ 
              width: `${timerProgress}%`,
              backgroundColor: timerProgress > 60 
                ? '#4CAF50' 
                : timerProgress > 30 
                  ? '#FFC107' 
                  : '#F44336'
            }}
          ></div>
        </div>
      </div>
      
      {/* 难度选择器 - 居中显示 */}
      <div className="mb-4 flex justify-center space-x-2">
        <button
          onClick={() => setGameLevel('easy')}
          className={`px-3 py-1 rounded-md text-sm ${
            gameLevel === 'easy'
              ? 'bg-indigo-600 text-white'
              : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
          }`}
        >
          {t('easy')}
        </button>
        <button
          onClick={() => setGameLevel('medium')}
          className={`px-3 py-1 rounded-md text-sm ${
            gameLevel === 'medium'
              ? 'bg-indigo-600 text-white'
              : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
          }`}
        >
          {t('medium')}
        </button>
        <button
          onClick={() => setGameLevel('hard')}
          className={`px-3 py-1 rounded-md text-sm ${
            gameLevel === 'hard'
              ? 'bg-indigo-600 text-white'
              : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
          }`}
        >
          {t('hard')}
        </button>
        <button
          onClick={() => setGameLevel('expert')}
          className={`px-3 py-1 rounded-md text-sm ${
            gameLevel === 'expert'
              ? 'bg-indigo-600 text-white'
              : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
          }`}
        >
          {t('expert')}
        </button>
      </div>
      
      {/* Theme selector */}
      <div className="mb-6 flex justify-center space-x-2">
        <button
          onClick={() => setTheme('animals')}
          className={`px-3 py-1 rounded-md text-sm ${
            theme === 'animals'
              ? 'bg-green-600 text-white'
              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          }`}
        >
          🐶 {t('animals')}
        </button>
        <button
          onClick={() => setTheme('fruits')}
          className={`px-3 py-1 rounded-md text-sm ${
            theme === 'fruits'
              ? 'bg-red-600 text-white'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}
        >
          🍎 {t('fruits')}
        </button>
        <button
          onClick={() => setTheme('space')}
          className={`px-3 py-1 rounded-md text-sm ${
            theme === 'space'
              ? 'bg-purple-600 text-white'
              : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
          }`}
        >
          🚀 {t('space')}
        </button>
        <button
          onClick={() => setTheme('sports')}
          className={`px-3 py-1 rounded-md text-sm ${
            theme === 'sports'
              ? 'bg-blue-600 text-white'
              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
          }`}
        >
          ⚽ {t('sports')}
        </button>
      </div>
      
      {/* Game Complete Overlay */}
      {isGameComplete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">{t('game_over')}</h2>
            <div className="space-y-3 mb-6">
              <p className="text-gray-700 dark:text-gray-300">{t('final_score')}: <span className="font-bold text-xl">{score}</span></p>
              <p className="text-gray-700 dark:text-gray-300">{t('moves')}: {moves}</p>
              <p className="text-gray-700 dark:text-gray-300">{t('time')}: {formatTime(timer)}</p>
              <p className="text-gray-700 dark:text-gray-300">{t('level_reached')}: {gameLevel2}</p>
              <p className="text-gray-700 dark:text-gray-300">{t('highest_streak')}: {highestStreak}</p>
            </div>
            <div className="flex space-x-3 justify-center">
              <button
                onClick={() => {
                  setGameLevel2(1);
                  initializeGame(1);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                {t('play_again')}
              </button>
              {onExit && (
                <button
                  onClick={onExit}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  {t('exit')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Level Complete Overlay */}
      {showLevelComplete && !isGameComplete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full text-center level-complete">
            <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">{t('level_complete')}</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{t('level')} {gameLevel2} {t('completed')}</p>
            <div className="animate-pulse">
              <p className="text-gray-700 dark:text-gray-300">{t('next_level_loading')}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Memory Game Cards Grid */}
      <div 
        className="grid gap-3 sm:gap-4 mx-auto memory-cards-grid"
        style={{ gridTemplateColumns }}
      >
        {cards.map((card) => (
          <div
            key={card.id}
            className={`relative w-16 h-16 sm:w-20 sm:h-20 cursor-pointer game-card ${card.isMatched ? 'matched' : ''} ${card.isFlipped ? 'flipped' : ''}`}
            onClick={() => handleCardClick(card)}
          >
            {/* Card Container (with 3D flip effect) */}
            <div className={`w-full h-full transition-transform duration-500 transform-gpu 
              ${card.isFlipped ? 'flip-card' : ''} relative`}
            >
              {/* Card Back */}
              <div 
                className={`absolute inset-0 flex items-center justify-center rounded-lg shadow-md border-2 border-white bg-gradient-to-br from-indigo-500 to-purple-600 card-back theme-${theme}`}
                style={{ backfaceVisibility: 'hidden' }}
              ></div>
              
              {/* Card Front */}
              <div 
                className={`absolute inset-0 flex items-center justify-center 
                  bg-white dark:bg-gray-700 rounded-lg border-2 
                  ${card.isMatched ? 'border-green-500 card-match bg-green-50 dark:bg-green-900' : 'border-gray-200 dark:border-gray-600'} 
                  ${card.isFlipped ? 'rotate-y-180' : ''}`}
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <span className="text-3xl sm:text-4xl">{card.value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Streak and hint counters */}
      <div className="flex justify-between w-full px-4 mt-6">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700 dark:text-gray-300">{t('streak')}: </span>
          <div className="flex">
            {[...Array(Math.min(streak, 5))].map((_, i) => (
              <span key={i} className="text-yellow-500">🔥</span>
            ))}
            {[...Array(5 - Math.min(streak, 5))].map((_, i) => (
              <span key={i} className="text-gray-300">🔥</span>
            ))}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700 dark:text-gray-300">{t('hints')}: </span>
          <div className="flex">
            {[...Array(hintsRemaining)].map((_, i) => (
              <span key={i} className="text-yellow-500">💡</span>
            ))}
            {[...Array(3 - hintsRemaining)].map((_, i) => (
              <span key={i} className="text-gray-300">💡</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryMatchProPlus; 