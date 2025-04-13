import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
// @ts-ignore
import confetti from 'canvas-confetti';
import './GrammarGuardian.css';

// Grammar error types for the game
const ERROR_TYPES = {
  SPELLING: 'spelling',
  GRAMMAR: 'grammar',
  PUNCTUATION: 'punctuation',
  NONE: 'none'
};

// Sentences for the game with errors
const GAME_SENTENCES = [
  {
    id: 1,
    original: "The childrens were playing in the park.",
    errorWord: "childrens",
    correctWord: "children",
    errorType: ERROR_TYPES.GRAMMAR,
    errorExplanation: "The plural of 'child' is 'children', not 'childrens'."
  },
  {
    id: 2,
    original: "She don't like spicy food.",
    errorWord: "don't",
    correctWord: "doesn't",
    errorType: ERROR_TYPES.GRAMMAR,
    errorExplanation: "Third-person singular subjects require 'doesn't', not 'don't'."
  },
  {
    id: 3,
    original: "They're going to they're favorite restaurant tonight.",
    errorWord: "they're",
    correctWord: "their",
    errorType: ERROR_TYPES.GRAMMAR,
    errorExplanation: "The possessive form should be 'their', not the contraction 'they're' (they are)."
  },
  {
    id: 4,
    original: "The movie was relly good, I enjoyed it a lot.",
    errorWord: "relly",
    correctWord: "really",
    errorType: ERROR_TYPES.SPELLING,
    errorExplanation: "The correct spelling is 'really', not 'relly'."
  },
  {
    id: 5,
    original: "He asked me to borrow some money.",
    errorWord: "borrow",
    correctWord: "lend",
    errorType: ERROR_TYPES.GRAMMAR,
    errorExplanation: "When someone wants to receive money, they ask to be 'lent' money, not to 'borrow' it."
  },
  {
    id: 6,
    original: "We went to the store and we buyed some groceries.",
    errorWord: "buyed",
    correctWord: "bought",
    errorType: ERROR_TYPES.GRAMMAR,
    errorExplanation: "The past tense of 'buy' is 'bought', not 'buyed'."
  },
  {
    id: 7,
    original: "The cat was laying on the couch all day.",
    errorWord: "laying",
    correctWord: "lying",
    errorType: ERROR_TYPES.GRAMMAR,
    errorExplanation: "To recline or be in a horizontal position is to 'lie'. 'Lay' requires an object."
  },
  {
    id: 8,
    original: "He did good on his exam.",
    errorWord: "good",
    correctWord: "well",
    errorType: ERROR_TYPES.GRAMMAR,
    errorExplanation: "'Good' is an adjective, but what's needed here is the adverb 'well'."
  },
  {
    id: 9,
    original: "I should of gone to the party.",
    errorWord: "should of",
    correctWord: "should have",
    errorType: ERROR_TYPES.GRAMMAR,
    errorExplanation: "The correct phrase is 'should have', not 'should of'."
  },
  {
    id: 10,
    original: "Between you and I, I think she's lying.",
    errorWord: "I",
    correctWord: "me",
    errorType: ERROR_TYPES.GRAMMAR,
    errorExplanation: "After a preposition like 'between', you should use the objective pronoun 'me', not 'I'."
  },
  {
    id: 11,
    original: "This sentense contains a spelling error.",
    errorWord: "sentense",
    correctWord: "sentence",
    errorType: ERROR_TYPES.SPELLING,
    errorExplanation: "The correct spelling is 'sentence', not 'sentense'."
  },
  {
    id: 12,
    original: "Let's meet them their.",
    errorWord: "their",
    correctWord: "there",
    errorType: ERROR_TYPES.GRAMMAR,
    errorExplanation: "The correct word is 'there' (referring to a place), not 'their' (possessive)."
  },
  {
    id: 13,
    original: "Your the best friend anyone could have.",
    errorWord: "Your",
    correctWord: "You're",
    errorType: ERROR_TYPES.GRAMMAR,
    errorExplanation: "The contraction 'you're' (you are) is needed, not the possessive 'your'."
  },
  {
    id: 14,
    original: "The company is loosing money every quarter.",
    errorWord: "loosing",
    correctWord: "losing",
    errorType: ERROR_TYPES.SPELLING,
    errorExplanation: "The correct spelling is 'losing', not 'loosing'."
  },
  {
    id: 15,
    original: "She isn't interested in no fancy restaurants.",
    errorWord: "no",
    correctWord: "any",
    errorType: ERROR_TYPES.GRAMMAR,
    errorExplanation: "The double negative 'isn't' and 'no' is incorrect. Use 'any' instead of 'no'."
  }
];

// Difficulty settings
const DIFFICULTY_SETTINGS = {
  easy: {
    timePerSentence: 20,
    sentencesPerLevel: 5,
    maxLevels: 3,
    hintsAvailable: 3,
    pointsPerCorrect: 10,
    bonusTimePoints: 1,
    streakBonus: 2
  },
  medium: {
    timePerSentence: 15,
    sentencesPerLevel: 7,
    maxLevels: 4,
    hintsAvailable: 2,
    pointsPerCorrect: 15,
    bonusTimePoints: 2,
    streakBonus: 3
  },
  hard: {
    timePerSentence: 10,
    sentencesPerLevel: 10,
    maxLevels: 5,
    hintsAvailable: 1,
    pointsPerCorrect: 20,
    bonusTimePoints: 3,
    streakBonus: 4
  }
};

// Simple sound effects - using Web Audio API
const soundEffects = {
  correct: () => {
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
        oscillator.frequency.value = 550;
        setTimeout(() => {
          oscillator.frequency.value = 660;
          setTimeout(() => {
            oscillator.stop();
            audioContext.close();
          }, 150);
        }, 150);
      }, 150);
    } catch (e) {
      console.log('Audio not supported');
    }
  },
  incorrect: () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.value = 330;
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      gainNode.gain.value = 0.1;
      oscillator.start();
      
      setTimeout(() => {
        oscillator.frequency.value = 220;
        setTimeout(() => {
          oscillator.stop();
          audioContext.close();
        }, 200);
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

interface GrammarGuardianProps {
  difficulty?: 'easy' | 'medium' | 'hard';
  onGameComplete?: (score: number, level: number, correctAnswers: number) => void;
  onExit?: () => void;
}

interface Sentence {
  id: number;
  original: string;
  errorWord: string;
  correctWord: string;
  errorType: string;
  errorExplanation: string;
}

const GrammarGuardian: React.FC<GrammarGuardianProps> = ({
  difficulty = 'medium',
  onGameComplete,
  onExit
}) => {
  const { t } = useTranslation();
  
  // State
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'levelComplete' | 'gameOver'>('idle');
  const [settings, setSettings] = useState(DIFFICULTY_SETTINGS[difficulty]);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintsAvailable, setHintsAvailable] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  
  // Timer references
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Clear all timers
  const clearAllTimers = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
  }, []);
  
  // Play sound
  const playSound = useCallback((type: 'correct' | 'incorrect' | 'levelUp') => {
    if (!soundEnabled) return;
    
    switch (type) {
      case 'correct':
        soundEffects.correct();
        break;
      case 'incorrect':
        soundEffects.incorrect();
        break;
      case 'levelUp':
        soundEffects.levelUp();
        break;
    }
  }, [soundEnabled]);
  
  // Get random sentences for the game
  const getRandomSentences = useCallback((count: number) => {
    // Make a copy of the sentences and shuffle them
    const shuffledSentences = [...GAME_SENTENCES].sort(() => Math.random() - 0.5);
    // Take the required number of sentences
    return shuffledSentences.slice(0, count);
  }, []);
  
  // Initialize level
  const initializeLevel = useCallback(() => {
    setCurrentSentenceIndex(0);
    setSelectedWord(null);
    setIsCorrect(null);
    setShowHint(false);
    setShowExplanation(false);
    
    const newSentences = getRandomSentences(settings.sentencesPerLevel);
    setSentences(newSentences);
    
    // Set timer
    setTimeLeft(settings.timePerSentence);
    
    // Start timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          handleWordSelect(null); // Time's up
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    setGameStatus('playing');
    setFeedbackMessage(t('find_error', 'Find the grammar error in this sentence'));
  }, [settings, getRandomSentences, t]);
  
  // Handle game complete
  const handleGameComplete = useCallback(() => {
    clearAllTimers();
    setGameStatus('gameOver');
    setFeedbackMessage(t('game_complete', 'Game Complete!'));
    
    // Update best streak
    if (streak > bestStreak) {
      setBestStreak(streak);
    }
    
    // Call onGameComplete callback
    if (onGameComplete) {
      onGameComplete(score, level, correctAnswers);
    }
    
    // Celebration
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.6 }
    });
  }, [clearAllTimers, streak, bestStreak, score, level, correctAnswers, onGameComplete, t]);
  
  // Handle level complete
  const handleLevelComplete = useCallback(() => {
    clearAllTimers();
    
    if (level >= settings.maxLevels) {
      // Game complete
      handleGameComplete();
    } else {
      // Level up
      setLevel(prevLevel => prevLevel + 1);
      setGameStatus('levelComplete');
      setShowLevelUp(true);
      playSound('levelUp');
      
      setFeedbackMessage(t('level_complete', 'Level Complete!'));
      
      // Celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      // Move to next level after delay
      feedbackTimerRef.current = setTimeout(() => {
        setShowLevelUp(false);
        initializeLevel();
      }, 2000);
    }
  }, [level, settings.maxLevels, handleGameComplete, clearAllTimers, playSound, initializeLevel, t]);
  
  // Move to next sentence
  const moveToNextSentence = useCallback(() => {
    const nextIndex = currentSentenceIndex + 1;
    
    // Clear state
    setSelectedWord(null);
    setIsCorrect(null);
    setShowHint(false);
    setShowExplanation(false);
    
    if (nextIndex >= sentences.length) {
      // Level complete
      handleLevelComplete();
    } else {
      // Move to next sentence
      setCurrentSentenceIndex(nextIndex);
      
      // Reset timer
      setTimeLeft(settings.timePerSentence);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            handleWordSelect(null); // Time's up
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      
      setFeedbackMessage(t('find_error', 'Find the grammar error in this sentence'));
    }
  }, [currentSentenceIndex, sentences, handleLevelComplete, settings.timePerSentence, t]);
  
  // Handle word selection
  const handleWordSelect = useCallback((word: string | null) => {
    clearAllTimers();
    
    // Current sentence
    const currentSentence = sentences[currentSentenceIndex];
    
    // If time ran out or no selection
    if (word === null) {
      setIsCorrect(false);
      setFeedbackMessage(t('time_up', 'Time\'s up!'));
      playSound('incorrect');
      setStreak(0);
      
      feedbackTimerRef.current = setTimeout(() => {
        moveToNextSentence();
      }, 2000);
      
      return;
    }
    
    // Check if selected word is the error
    const wordIsError = word === currentSentence.errorWord;
    setIsCorrect(wordIsError);
    
    if (wordIsError) {
      // Correct answer
      const timeBonus = timeLeft * settings.bonusTimePoints;
      const newStreak = streak + 1;
      const streakBonus = newStreak * settings.streakBonus;
      const roundScore = settings.pointsPerCorrect + timeBonus + streakBonus;
      
      setScore(prevScore => prevScore + roundScore);
      setStreak(newStreak);
      setCorrectAnswers(prev => prev + 1);
      
      if (newStreak > bestStreak) {
        setBestStreak(newStreak);
      }
      
      setFeedbackMessage(
        `${t('correct', 'Correct!')} +${settings.pointsPerCorrect} ${t('points', 'points')} +${timeBonus} ${t('time_bonus', 'time bonus')} +${streakBonus} ${t('streak_bonus', 'streak bonus')}`
      );
      
      playSound('correct');
      setShowExplanation(true);
      
      // Small celebration
      confetti({
        particleCount: 30,
        spread: 40,
        origin: { y: 0.7 }
      });
    } else {
      // Incorrect answer
      setFeedbackMessage(t('incorrect', 'Incorrect! Try again.'));
      setStreak(0);
      playSound('incorrect');
    }
    
    // Move to next sentence after delay
    feedbackTimerRef.current = setTimeout(() => {
      moveToNextSentence();
    }, 3000);
  }, [clearAllTimers, sentences, currentSentenceIndex, streak, bestStreak, timeLeft, settings, moveToNextSentence, playSound, t]);
  
  // Reset game
  const resetGame = useCallback(() => {
    clearAllTimers();
    setGameStatus('idle');
    setLevel(1);
    setScore(0);
    setCurrentSentenceIndex(0);
    setSentences([]);
    setSelectedWord(null);
    setIsCorrect(null);
    setFeedbackMessage('');
    setTimeLeft(0);
    setShowLevelUp(false);
    setStreak(0);
    setBestStreak(0);
    setCorrectAnswers(0);
    setHintsUsed(0);
    setHintsAvailable(settings.hintsAvailable);
    setShowHint(false);
    setShowExplanation(false);
    setSettings(DIFFICULTY_SETTINGS[difficulty]);
  }, [clearAllTimers, difficulty, settings.hintsAvailable]);
  
  // Start game
  const startGame = useCallback(() => {
    resetGame();
    setHintsAvailable(DIFFICULTY_SETTINGS[difficulty].hintsAvailable);
    initializeLevel();
  }, [resetGame, initializeLevel, difficulty]);
  
  // Use hint
  const useHint = useCallback(() => {
    if (gameStatus !== 'playing' || hintsAvailable <= 0 || showHint) return;
    
    setHintsUsed(prev => prev + 1);
    setHintsAvailable(prev => prev - 1);
    setShowHint(true);
  }, [gameStatus, hintsAvailable, showHint]);
  
  // Toggle sound
  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, []);
  
  // Effect to reset game when difficulty changes
  useEffect(() => {
    resetGame();
  }, [difficulty, resetGame]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);
  
  // Calculate timer percentage
  const timerPercentage = (timeLeft / settings.timePerSentence) * 100;
  
  // Get the current sentence
  const currentSentence = sentences[currentSentenceIndex];
  
  // Render sentence with clickable words
  const renderSentence = () => {
    if (!currentSentence) return null;
    
    // Split sentence into words
    const words = currentSentence.original.split(' ');
    
    return (
      <div className="target-sentence">
        {words.map((word, index) => {
          // Remove punctuation for comparison
          const cleanWord = word.replace(/[.,?!;:]$/, '');
          const isErrorWord = cleanWord === currentSentence.errorWord;
          const isSelected = cleanWord === selectedWord;
          
          // If showing hint, highlight the error word
          const showErrorHighlight = showHint && isErrorWord;
          
          // Classes for the word
          let className = '';
          if (showErrorHighlight) className += 'highlighted ';
          if (isSelected) className += 'selected ';
          if (isCorrect !== null && isSelected) {
            className += isCorrect ? 'correct ' : 'incorrect ';
          }
          if (isCorrect && isErrorWord) className += 'error-word ';
          
          return (
            <span 
              key={index}
              className={className}
              onClick={() => {
                if (gameStatus === 'playing' && isCorrect === null) {
                  setSelectedWord(cleanWord);
                  handleWordSelect(cleanWord);
                }
              }}
              style={{ cursor: 'pointer', padding: '0 2px', display: 'inline-block' }}
            >
              {word}{' '}
            </span>
          );
        })}
      </div>
    );
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] p-4 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg shadow-xl relative grammar-guardian-game">
      
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
            <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('correct', 'Correct')}</div>
            <div className="text-xl font-bold">{correctAnswers}</div>
          </div>
          <div className="border-l border-gray-300 dark:border-gray-600 h-8 self-center mx-2"></div>
          <div className="flex-1">
            <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('streak', 'Streak')}</div>
            <div className="text-xl font-bold">{streak}</div>
          </div>
        </div>
      </div>
      
      {/* Difficulty Selection - Top left */}
      <div className="difficulty-selector">
        <div className="bg-gray-200 dark:bg-gray-800 rounded-lg shadow p-2">
          <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
            {t('difficulty', 'Difficulty')}
          </div>
          <div className="flex space-x-1">
            <button
              className={`px-2 py-1 rounded text-xs font-medium ${
                difficulty === 'easy'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-600'
              }`}
              onClick={() => gameStatus === 'idle' && setSettings(DIFFICULTY_SETTINGS.easy)}
              disabled={gameStatus !== 'idle'}
            >
              {t('easy', 'Easy')}
            </button>
            <button
              className={`px-2 py-1 rounded text-xs font-medium ${
                difficulty === 'medium'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-600'
              }`}
              onClick={() => gameStatus === 'idle' && setSettings(DIFFICULTY_SETTINGS.medium)}
              disabled={gameStatus !== 'idle'}
            >
              {t('medium', 'Medium')}
            </button>
            <button
              className={`px-2 py-1 rounded text-xs font-medium ${
                difficulty === 'hard'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-600'
              }`}
              onClick={() => gameStatus === 'idle' && setSettings(DIFFICULTY_SETTINGS.hard)}
              disabled={gameStatus !== 'idle'}
            >
              {t('hard', 'Hard')}
            </button>
          </div>
        </div>
      </div>
      
      {/* Sound Toggle - Top right */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={toggleSound}
          className="bg-gray-200 dark:bg-gray-800 rounded-full p-2 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
          aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
        >
          {soundEnabled ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>
      
      {/* Streak Counter */}
      {gameStatus === 'playing' && streak > 0 && (
        <div className="streak-counter">
          <span className="streak-flame">🔥</span>
          <span>{streak}</span>
        </div>
      )}
      
      {/* Hint Button */}
      {gameStatus === 'playing' && hintsAvailable > 0 && (
        <button onClick={useHint} className="hint-button">
          <span>💡</span>
          <span>{t('hint', 'Hint')}: {hintsAvailable}</span>
        </button>
      )}
      
      {/* Game Content */}
      <div className="flex flex-col items-center justify-center flex-grow w-full pt-20">
        {gameStatus === 'idle' ? (
          // Start Screen
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">{t('grammar_guardian', 'Grammar Guardian')}</h1>
            <p className="mb-8 max-w-md">
              {t('grammar_guardian_description', 'Defend against grammar errors! Find the mistake in each sentence by clicking on the incorrect word. Improve your language skills with fun challenges.')}
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={startGame}
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg animate-pulse hover:animate-none border-2 border-primary-400 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {t('start_game', 'Start Game')}
              </button>
              {onExit && (
                <button
                  onClick={onExit}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg"
                >
                  {t('exit', 'Exit')}
                </button>
              )}
            </div>
          </div>
        ) : gameStatus === 'gameOver' ? (
          // Game Over Screen
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">{t('game_over', 'Game Over')}</h1>
            <p className="mb-2">{t('final_score', 'Final Score')}: {score}</p>
            <p className="mb-2">{t('levels_completed', 'Levels Completed')}: {level}</p>
            <p className="mb-2">{t('correct_answers', 'Correct Answers')}: {correctAnswers}</p>
            <p className="mb-8">{t('best_streak', 'Best Streak')}: {bestStreak}</p>
            <div className="flex space-x-4">
              <button
                onClick={startGame}
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-lg"
              >
                {t('play_again', 'Play Again')}
              </button>
              {onExit && (
                <button
                  onClick={onExit}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-lg"
                >
                  {t('exit', 'Exit')}
                </button>
              )}
            </div>
          </div>
        ) : (
          // Game Play Screen
          <>
            {showLevelUp && (
              <div className="level-badge">
                {t('level', 'Level')} {level}
              </div>
            )}
            
            <div className="feedback-message">
              {feedbackMessage}
            </div>
            
            <div className="sentence-container">
              {renderSentence()}
              
              {showExplanation && currentSentence && (
                <div className="explanation mt-4">
                  <p><strong>{t('correction', 'Correction')}:</strong> {currentSentence.correctWord}</p>
                  <p className="mt-2">{currentSentence.errorExplanation}</p>
                </div>
              )}
            </div>
            
            {gameStatus === 'playing' && (
              <div className="timer-bar mt-6">
                <div 
                  className={`timer-progress ${timeLeft < 3 ? 'timer-critical' : ''}`} 
                  style={{ width: `${timerPercentage}%` }}
                />
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Action Buttons - Bottom centered */}
      <div className="action-buttons">
        {gameStatus !== 'idle' && onExit && (
          <button
            onClick={onExit}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            {t('exit', 'Exit')}
          </button>
        )}
        
        {gameStatus === 'gameOver' && (
          <button
            onClick={startGame}
            className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            {t('play_again', 'Play Again')}
          </button>
        )}
      </div>
    </div>
  );
};

export default GrammarGuardian; 