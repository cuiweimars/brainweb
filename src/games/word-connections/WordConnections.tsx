import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
// @ts-ignore
import confetti from 'canvas-confetti';
import './WordConnections.css';

// Sample word categories and connections for the game
const WORD_CATEGORIES = [
  {
    name: 'animals',
    words: ['dog', 'cat', 'elephant', 'lion', 'tiger', 'zebra', 'giraffe', 'monkey']
  },
  {
    name: 'colors',
    words: ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'black', 'white']
  },
  {
    name: 'fruits',
    words: ['apple', 'banana', 'orange', 'grape', 'strawberry', 'watermelon', 'kiwi', 'mango']
  },
  {
    name: 'vegetables',
    words: ['carrot', 'potato', 'tomato', 'onion', 'lettuce', 'cucumber', 'broccoli', 'pepper']
  },
  {
    name: 'countries',
    words: ['USA', 'China', 'India', 'Brazil', 'Russia', 'France', 'Germany', 'Japan']
  },
  {
    name: 'jobs',
    words: ['doctor', 'teacher', 'engineer', 'nurse', 'chef', 'driver', 'artist', 'pilot']
  },
  {
    name: 'vehicles',
    words: ['car', 'bus', 'train', 'airplane', 'boat', 'bicycle', 'motorcycle', 'helicopter']
  },
  {
    name: 'sports',
    words: ['soccer', 'basketball', 'tennis', 'swimming', 'baseball', 'volleyball', 'golf', 'hockey']
  },
  {
    name: 'furniture',
    words: ['chair', 'table', 'bed', 'sofa', 'desk', 'cabinet', 'shelf', 'drawer']
  },
  {
    name: 'weather',
    words: ['sunny', 'rainy', 'cloudy', 'snowy', 'windy', 'foggy', 'stormy', 'humid']
  }
];

// Difficulty settings
const DIFFICULTY_SETTINGS = {
  easy: {
    wordsPerCategory: 4,
    categoryCount: 2,
    timeLimit: 60,
    hintsAllowed: 3,
    pointsPerMatch: 10,
    timeBonus: 1
  },
  medium: {
    wordsPerCategory: 4,
    categoryCount: 3,
    timeLimit: 90,
    hintsAllowed: 2,
    pointsPerMatch: 15,
    timeBonus: 2
  },
  hard: {
    wordsPerCategory: 4,
    categoryCount: 4,
    timeLimit: 120,
    hintsAllowed: 1,
    pointsPerMatch: 20,
    timeBonus: 3
  }
};

// Sound effects
const soundEffects = {
  select: () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.value = 440;
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      gainNode.gain.value = 0.1;
      oscillator.start();
      
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 100);
    } catch (e) {
      console.log('Audio not supported');
    }
  },
  match: () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.value = 600;
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      gainNode.gain.value = 0.1;
      oscillator.start();
      
      setTimeout(() => {
        oscillator.frequency.value = 800;
        setTimeout(() => {
          oscillator.stop();
          audioContext.close();
        }, 200);
      }, 200);
    } catch (e) {
      console.log('Audio not supported');
    }
  },
  error: () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.value = 250;
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      gainNode.gain.value = 0.1;
      oscillator.start();
      
      setTimeout(() => {
        oscillator.frequency.value = 200;
        setTimeout(() => {
          oscillator.stop();
          audioContext.close();
        }, 300);
      }, 200);
    } catch (e) {
      console.log('Audio not supported');
    }
  },
  levelUp: () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      gainNode.gain.value = 0.1;
      
      oscillator.frequency.value = 400;
      oscillator.start();
      
      setTimeout(() => {
        oscillator.frequency.value = 500;
        setTimeout(() => {
          oscillator.frequency.value = 600;
          setTimeout(() => {
            oscillator.frequency.value = 800;
            setTimeout(() => {
              oscillator.stop();
              audioContext.close();
            }, 150);
          }, 150);
        }, 150);
      }, 150);
    } catch (e) {
      console.log('Audio not supported');
    }
  }
};

interface WordCard {
  id: number;
  word: string;
  category: string;
  isSelected: boolean;
  isMatched: boolean;
}

interface WordConnectionsProps {
  difficulty?: 'easy' | 'medium' | 'hard';
  onGameComplete?: (score: number, level: number, categoriesCompleted: number) => void;
  onExit?: () => void;
}

const WordConnections: React.FC<WordConnectionsProps> = ({
  difficulty = 'medium',
  onGameComplete,
  onExit
}) => {
  const { t } = useTranslation();
  
  // Game state
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'paused' | 'gameover'>('idle');
  const [settings, setSettings] = useState(DIFFICULTY_SETTINGS[difficulty]);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DIFFICULTY_SETTINGS[difficulty].timeLimit);
  const [hintsLeft, setHintsLeft] = useState(DIFFICULTY_SETTINGS[difficulty].hintsAllowed);
  const [cards, setCards] = useState<WordCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<WordCard | null>(null);
  const [matchedCategories, setMatchedCategories] = useState<string[]>([]);
  const [totalCategories, setTotalCategories] = useState(0);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Refs for timers
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const levelCompleteTimerRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Clear all timers
  const clearAllTimers = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (levelCompleteTimerRef.current) {
      clearTimeout(levelCompleteTimerRef.current);
      levelCompleteTimerRef.current = null;
    }
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
  }, []);
  
  // Play sound
  const playSound = useCallback((soundType: string) => {
    if (!soundEnabled) return;
    
    switch(soundType) {
      case 'select':
        soundEffects.select();
        break;
      case 'match':
        soundEffects.match();
        break;
      case 'error':
        soundEffects.error();
        break;
      case 'levelUp':
        soundEffects.levelUp();
        break;
      default:
        break;
    }
  }, [soundEnabled]);
  
  // Generate a level with words from random categories
  const generateLevel = useCallback(() => {
    const shuffledCategories = [...WORD_CATEGORIES].sort(() => 0.5 - Math.random());
    const selectedCategories = shuffledCategories.slice(0, settings.categoryCount);
    setTotalCategories(selectedCategories.length);
    
    let cardId = 0;
    const levelCards: WordCard[] = [];
    
    selectedCategories.forEach(category => {
      // Select random words from the category
      const shuffledWords = [...category.words].sort(() => 0.5 - Math.random());
      const selectedWords = shuffledWords.slice(0, settings.wordsPerCategory);
      
      selectedWords.forEach(word => {
        levelCards.push({
          id: cardId++,
          word,
          category: category.name,
          isSelected: false,
          isMatched: false
        });
      });
    });
    
    // Shuffle the cards
    return levelCards.sort(() => 0.5 - Math.random());
  }, [settings]);
  
  // Initialize a new level
  const initializeLevel = useCallback(() => {
    const newCards = generateLevel();
    setCards(newCards);
    setSelectedCard(null);
    setMatchedCategories([]);
  }, [generateLevel]);
  
  // Start game
  const startGame = useCallback((selectedDifficulty: 'easy' | 'medium' | 'hard') => {
    setSettings(DIFFICULTY_SETTINGS[selectedDifficulty]);
    setGameStatus('playing');
    setLevel(1);
    setScore(0);
    setTimeLeft(DIFFICULTY_SETTINGS[selectedDifficulty].timeLimit);
    setHintsLeft(DIFFICULTY_SETTINGS[selectedDifficulty].hintsAllowed);
    setInfoMessage(t('find_connections', 'Find words that belong to the same category!'));
    
    // Start timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          // Game over when time runs out
          clearInterval(timerRef.current!);
          setGameStatus('gameover');
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    initializeLevel();
  }, [initializeLevel, t]);
  
  // Handle level completion
  const handleLevelComplete = useCallback(() => {
    clearAllTimers();
    setShowLevelComplete(true);
    
    // Play level up sound
    playSound('levelUp');
    
    // Calculate bonus points based on time left
    const timeBonus = timeLeft * settings.timeBonus;
    const levelScore = matchedCategories.length * settings.pointsPerMatch + timeBonus;
    
    // Update score
    setScore(prevScore => prevScore + levelScore);
    
    // Display message
    setInfoMessage(`${t('level_complete', 'Level Complete')}! +${matchedCategories.length * settings.pointsPerMatch} +${timeBonus} = +${levelScore} ${t('points', 'points')}`);
    
    // Small celebration
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    // Move to next level after delay
    levelCompleteTimerRef.current = setTimeout(() => {
      setLevel(prevLevel => prevLevel + 1);
      setTimeLeft(settings.timeLimit);
      setShowLevelComplete(false);
      setGameStatus('playing');
      initializeLevel();
      
      // Start timer again
      timerRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current!);
            setGameStatus('gameover');
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }, 3000);
  }, [clearAllTimers, initializeLevel, matchedCategories.length, playSound, settings, t, timeLeft]);
  
  // Handle game over
  const handleGameOver = useCallback(() => {
    clearAllTimers();
    setGameStatus('gameover');
    setInfoMessage(t('game_over', 'Game Over'));
    
    if (onGameComplete) {
      onGameComplete(score, level, matchedCategories.length);
    }
    
    // Game over animation
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ef4444', '#f87171', '#fca5a5']
    });
    
    // Play end sound
    playSound('error');
  }, [clearAllTimers, level, matchedCategories.length, onGameComplete, playSound, score, t]);
  
  // Handle card click
  const handleCardClick = useCallback((card: WordCard) => {
    if (gameStatus !== 'playing' || card.isMatched) return;
    
    // Play select sound
    playSound('select');
    
    // If no card is selected, select this one
    if (!selectedCard) {
      setSelectedCard(card);
      setCards(prevCards => 
        prevCards.map(c => 
          c.id === card.id ? { ...c, isSelected: true } : c
        )
      );
      return;
    }
    
    // If the same card is clicked again, deselect it
    if (selectedCard.id === card.id) {
      setSelectedCard(null);
      setCards(prevCards => 
        prevCards.map(c => 
          c.id === card.id ? { ...c, isSelected: false } : c
        )
      );
      return;
    }
    
    // Check if cards are from the same category
    if (selectedCard.category === card.category) {
      // Match found!
      playSound('match');
      
      // Update cards
      setCards(prevCards => 
        prevCards.map(c => 
          (c.id === card.id || c.id === selectedCard.id) 
            ? { ...c, isSelected: false, isMatched: true } 
            : c
        )
      );
      
      // Check if this completes a category
      if (!matchedCategories.includes(card.category)) {
        setMatchedCategories(prev => [...prev, card.category]);
      }
      
      setSelectedCard(null);
      
      // Check if all categories are matched
      if (matchedCategories.length + 1 >= totalCategories) {
        handleLevelComplete();
      }
    } else {
      // No match
      playSound('error');
      
      // Show both cards as selected briefly, then deselect them
      setCards(prevCards => 
        prevCards.map(c => 
          c.id === card.id ? { ...c, isSelected: true } : c
        )
      );
      
      feedbackTimerRef.current = setTimeout(() => {
        setCards(prevCards => 
          prevCards.map(c => 
            (c.id === card.id || c.id === selectedCard.id) 
              ? { ...c, isSelected: false } 
              : c
          )
        );
        setSelectedCard(null);
      }, 1000);
    }
  }, [gameStatus, handleLevelComplete, matchedCategories, playSound, selectedCard, totalCategories]);
  
  // Use hint
  const useHint = useCallback(() => {
    if (hintsLeft <= 0 || gameStatus !== 'playing') return;
    
    // If a card is selected, find a matching one
    if (selectedCard) {
      const matchingCard = cards.find(c => 
        c.category === selectedCard.category && 
        c.id !== selectedCard.id && 
        !c.isMatched
      );
      
      if (matchingCard) {
        // Highlight the matching card briefly
        setCards(prevCards => 
          prevCards.map(c => 
            c.id === matchingCard.id ? { ...c, isSelected: true } : c
          )
        );
        
        // Deselect after a delay
        feedbackTimerRef.current = setTimeout(() => {
          setCards(prevCards => 
            prevCards.map(c => 
              c.id === matchingCard.id ? { ...c, isSelected: false } : c
            )
          );
        }, 1500);
        
        setHintsLeft(prev => prev - 1);
      }
    } else {
      // If no card is selected, highlight a pair from a random category
      const uncompletedCategories = cards
        .filter(c => !c.isMatched)
        .map(c => c.category)
        .filter((value, index, self) => self.indexOf(value) === index);
      
      if (uncompletedCategories.length > 0) {
        const randomCategory = uncompletedCategories[Math.floor(Math.random() * uncompletedCategories.length)];
        const categoryCards = cards.filter(c => c.category === randomCategory && !c.isMatched);
        
        if (categoryCards.length >= 2) {
          const [card1, card2] = [categoryCards[0], categoryCards[1]];
          
          // Highlight both cards briefly
          setCards(prevCards => 
            prevCards.map(c => 
              (c.id === card1.id || c.id === card2.id) ? { ...c, isSelected: true } : c
            )
          );
          
          // Deselect after a delay
          feedbackTimerRef.current = setTimeout(() => {
            setCards(prevCards => 
              prevCards.map(c => 
                (c.id === card1.id || c.id === card2.id) ? { ...c, isSelected: false } : c
              )
            );
          }, 1500);
          
          setHintsLeft(prev => prev - 1);
        }
      }
    }
  }, [cards, gameStatus, hintsLeft, selectedCard]);
  
  // Pause game
  const pauseGame = useCallback(() => {
    if (gameStatus === 'playing') {
      setGameStatus('paused');
      clearAllTimers();
    }
  }, [clearAllTimers, gameStatus]);
  
  // Resume game
  const resumeGame = useCallback(() => {
    if (gameStatus === 'paused') {
      setGameStatus('playing');
      
      // Restart timer
      timerRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current!);
            setGameStatus('gameover');
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
  }, [gameStatus]);
  
  // Reset game
  const resetGame = useCallback(() => {
    clearAllTimers();
    setGameStatus('idle');
    setSelectedCard(null);
  }, [clearAllTimers]);
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Toggle sound
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };
  
  // Calculate timer progress percentage
  const timerPercentage = (timeLeft / settings.timeLimit) * 100;
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);
  
  // Reset game when difficulty changes
  useEffect(() => {
    resetGame();
    setSettings(DIFFICULTY_SETTINGS[difficulty]);
  }, [difficulty, resetGame]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] p-4 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg shadow-xl relative">
      
      {/* Header: Stats - Top center */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-gray-200 dark:bg-gray-800 rounded-lg shadow px-4 py-2 z-10">
        <div className="flex justify-around text-center">
          <div className="flex-1">
            <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('level', 'Level')}</div>
            <div className="text-xl font-bold">{level}</div>
          </div>
          <div className="border-l border-gray-300 dark:border-gray-600 h-8 self-center mx-2"></div>
          <div className="flex-1">
            <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('score', 'Score')}</div>
            <div className="text-xl font-bold">{score}</div>
          </div>
          <div className="border-l border-gray-300 dark:border-gray-600 h-8 self-center mx-2"></div>
          <div className="flex-1">
            <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('time', 'Time')}</div>
            <div className="text-xl font-bold">{formatTime(timeLeft)}</div>
          </div>
          <div className="border-l border-gray-300 dark:border-gray-600 h-8 self-center mx-2"></div>
          <div className="flex-1">
            <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('matched', 'Matched')}</div>
            <div className="text-xl font-bold">{matchedCategories.length}/{totalCategories}</div>
          </div>
        </div>
      </div>
      
      {/* Difficulty Selection - Top left */}
      <div className="absolute top-4 left-4 flex space-x-2 z-10">
        <button
          onClick={() => startGame('easy')}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${ 
            difficulty === 'easy' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600' 
          }`}
          disabled={gameStatus !== 'idle' && gameStatus !== 'gameover'}
        >
          {t('easy', 'Easy')}
        </button>
        <button
          onClick={() => startGame('medium')}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${ 
            difficulty === 'medium' 
              ? 'bg-yellow-600 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600' 
          }`}
          disabled={gameStatus !== 'idle' && gameStatus !== 'gameover'}
        >
          {t('medium', 'Medium')}
        </button>
        <button
          onClick={() => startGame('hard')}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${ 
            difficulty === 'hard' 
              ? 'bg-red-600 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600' 
          }`}
          disabled={gameStatus !== 'idle' && gameStatus !== 'gameover'}
        >
          {t('hard', 'Hard')}
        </button>
      </div>
      
      {/* Action Buttons - Top right */}
      <div className="absolute top-4 right-4 flex space-x-2 z-10">
        {/* Sound Toggle */}
        <button
          onClick={toggleSound}
          className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
          aria-label={soundEnabled ? t('mute_sound', 'Mute Sound') : t('enable_sound', 'Enable Sound')}
        >
          {soundEnabled ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
          )}
        </button>
        
        {/* Hint Button */}
        {gameStatus === 'playing' && hintsLeft > 0 && (
          <button
            onClick={useHint}
            className="p-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
            title={t('use_hint', 'Use Hint')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="text-xs absolute -top-1 -right-1 bg-white text-indigo-600 rounded-full w-4 h-4 flex items-center justify-center">{hintsLeft}</span>
          </button>
        )}
        
        {/* Pause/Resume Button */}
        {(gameStatus === 'playing' || gameStatus === 'paused') && (
          <button
            onClick={gameStatus === 'playing' ? pauseGame : resumeGame}
            className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
          >
            {gameStatus === 'playing' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </button>
        )}
      </div>
      
      {/* Game content */}
      <div className="flex flex-col items-center justify-center flex-grow w-full pt-20">
        {/* Info Message */}
        <div className="info-display mb-6">
          {infoMessage}
        </div>
        
        {/* Level Badge */}
        {showLevelComplete && (
          <div className="level-badge mb-6">
            {t('level', 'Level')} {level} {t('complete', 'Complete')}!
          </div>
        )}
        
        {/* Game Introduction - Idle state */}
        {gameStatus === 'idle' && (
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold mb-4">{t('word_connections', 'Word Connections Plus')}</h2>
            <p className="mb-6">{t('word_connections_intro', 'Connect words that belong to the same category. Find all connections to complete each level!')}</p>
            <div className="flex justify-center space-x-4 mb-6">
              <button
                onClick={() => startGame(difficulty)}
                className="px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors shadow-md"
              >
                {t('start_game', 'Start Game')}
              </button>
              {onExit && (
                <button
                  onClick={onExit}
                  className="px-6 py-3 rounded-lg bg-gray-600 text-white font-semibold hover:bg-gray-700 transition-colors shadow-md"
                >
                  {t('exit', 'Exit')}
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Word Board - Playing state */}
        {(gameStatus === 'playing' || gameStatus === 'paused') && (
          <>
            <div 
              className="word-board relative"
              style={{ opacity: gameStatus === 'paused' ? 0.5 : 1 }}
            >
              {cards.map(card => (
                <div
                  key={card.id}
                  className={`word-card ${card.isSelected ? 'selected' : ''} ${card.isMatched ? 'correct completed' : ''}`}
                  onClick={() => handleCardClick(card)}
                >
                  {card.word}
                </div>
              ))}
            </div>
            
            {/* Timer Bar */}
            <div className="timer-bar mt-6">
              <div 
                className={`timer-progress ${timeLeft < 10 ? 'timer-critical' : ''}`} 
                style={{ width: `${timerPercentage}%` }}
              ></div>
            </div>
            
            {/* Pause Overlay */}
            {gameStatus === 'paused' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center">
                  <h3 className="text-xl font-bold mb-4">{t('game_paused', 'Game Paused')}</h3>
                  <p className="mb-4">{t('resume_to_continue', 'Click Resume to continue playing')}</p>
                  <button
                    onClick={resumeGame}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {t('resume', 'Resume')}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Game Over State */}
        {gameStatus === 'gameover' && (
          <div className="game-over-overlay">
            <div className="game-over-content">
              <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">{t('game_over', 'Game Over')}</h2>
              <div className="space-y-3 mb-6 text-gray-700 dark:text-gray-300">
                <p>{t('final_score', 'Final Score')}: <span className="font-bold text-xl">{score}</span></p>
                <p>{t('level_reached', 'Level Reached')}: {level}</p>
                <p>{t('categories_completed', 'Categories Completed')}: {matchedCategories.length}</p>
              </div>
              <div className="flex space-x-3 justify-center">
                <button
                  onClick={() => startGame(difficulty)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  {t('play_again', 'Play Again')}
                </button>
                {onExit && (
                  <button
                    onClick={onExit}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    {t('exit', 'Exit')}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Bottom Exit button */}
      {gameStatus !== 'idle' && onExit && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <button
            onClick={onExit}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            {t('exit', 'Exit')}
          </button>
        </div>
      )}
    </div>
  );
};

export default WordConnections; 