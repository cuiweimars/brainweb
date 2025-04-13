import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
// @ts-ignore
import confetti from 'canvas-confetti';
import './SynonymMatch.css';

// Word pairs for the game (target word and its synonyms)
const WORD_PAIRS = [
  { word: 'happy', synonyms: ['joyful', 'pleased', 'delighted', 'content'], distractors: ['sad', 'angry', 'upset', 'gloomy'] },
  { word: 'big', synonyms: ['large', 'huge', 'enormous', 'massive'], distractors: ['small', 'tiny', 'little', 'miniature'] },
  { word: 'fast', synonyms: ['quick', 'rapid', 'swift', 'speedy'], distractors: ['slow', 'sluggish', 'leisurely', 'unhurried'] },
  { word: 'smart', synonyms: ['intelligent', 'clever', 'bright', 'brilliant'], distractors: ['dumb', 'stupid', 'foolish', 'ignorant'] },
  { word: 'beautiful', synonyms: ['gorgeous', 'stunning', 'attractive', 'lovely'], distractors: ['ugly', 'hideous', 'unattractive', 'plain'] },
  { word: 'brave', synonyms: ['courageous', 'fearless', 'bold', 'daring'], distractors: ['scared', 'afraid', 'cowardly', 'timid'] },
  { word: 'angry', synonyms: ['furious', 'mad', 'enraged', 'irate'], distractors: ['calm', 'relaxed', 'peaceful', 'serene'] },
  { word: 'cold', synonyms: ['chilly', 'frigid', 'icy', 'frosty'], distractors: ['hot', 'warm', 'heated', 'boiling'] },
  { word: 'tired', synonyms: ['exhausted', 'weary', 'fatigued', 'sleepy'], distractors: ['energetic', 'lively', 'active', 'refreshed'] },
  { word: 'rich', synonyms: ['wealthy', 'affluent', 'prosperous', 'opulent'], distractors: ['poor', 'broke', 'destitute', 'impoverished'] },
  { word: 'easy', synonyms: ['simple', 'effortless', 'straightforward', 'uncomplicated'], distractors: ['difficult', 'hard', 'complex', 'challenging'] },
  { word: 'strong', synonyms: ['powerful', 'mighty', 'robust', 'sturdy'], distractors: ['weak', 'feeble', 'fragile', 'delicate'] },
  { word: 'loud', synonyms: ['noisy', 'deafening', 'thunderous', 'booming'], distractors: ['quiet', 'silent', 'soft', 'hushed'] },
  { word: 'thin', synonyms: ['slim', 'slender', 'lean', 'skinny'], distractors: ['fat', 'chubby', 'plump', 'stout'] },
  { word: 'dark', synonyms: ['dim', 'murky', 'gloomy', 'shadowy'], distractors: ['bright', 'light', 'sunny', 'illuminated'] },
  { word: 'clean', synonyms: ['spotless', 'pristine', 'immaculate', 'tidy'], distractors: ['dirty', 'filthy', 'messy', 'grimy'] },
  { word: 'sad', synonyms: ['unhappy', 'miserable', 'gloomy', 'depressed'], distractors: ['happy', 'joyful', 'cheerful', 'elated'] },
  { word: 'strange', synonyms: ['bizarre', 'weird', 'odd', 'unusual'], distractors: ['normal', 'common', 'ordinary', 'regular'] },
  { word: 'calm', synonyms: ['peaceful', 'tranquil', 'serene', 'relaxed'], distractors: ['upset', 'agitated', 'nervous', 'anxious'] },
  { word: 'old', synonyms: ['ancient', 'aged', 'elderly', 'antique'], distractors: ['new', 'young', 'fresh', 'recent'] },
  { word: 'funny', synonyms: ['hilarious', 'amusing', 'humorous', 'comical'], distractors: ['serious', 'solemn', 'grim', 'dull'] },
  { word: 'quick', synonyms: ['rapid', 'swift', 'fast', 'speedy'], distractors: ['slow', 'gradual', 'sluggish', 'unhurried'] },
  { word: 'lazy', synonyms: ['idle', 'indolent', 'slothful', 'sluggish'], distractors: ['active', 'energetic', 'industrious', 'hardworking'] },
  { word: 'correct', synonyms: ['accurate', 'right', 'precise', 'exact'], distractors: ['wrong', 'incorrect', 'inaccurate', 'false'] },
  { word: 'boring', synonyms: ['dull', 'tedious', 'monotonous', 'tiresome'], distractors: ['exciting', 'interesting', 'fascinating', 'thrilling'] },
  { word: 'important', synonyms: ['significant', 'crucial', 'essential', 'vital'], distractors: ['trivial', 'unimportant', 'minor', 'insignificant'] },
  { word: 'different', synonyms: ['diverse', 'distinct', 'various', 'dissimilar'], distractors: ['same', 'identical', 'similar', 'alike'] },
  { word: 'difficult', synonyms: ['challenging', 'hard', 'tough', 'arduous'], distractors: ['easy', 'simple', 'effortless', 'straightforward'] },
  { word: 'dangerous', synonyms: ['hazardous', 'risky', 'perilous', 'unsafe'], distractors: ['safe', 'secure', 'harmless', 'protected'] },
  { word: 'polite', synonyms: ['courteous', 'respectful', 'well-mannered', 'civil'], distractors: ['rude', 'impolite', 'disrespectful', 'discourteous'] },
];

// Difficulty settings
const DIFFICULTY_SETTINGS = {
  easy: {
    timePerWord: 15, // seconds
    wordsPerLevel: 5,
    optionsCount: 4,
    maxLevels: 5,
    hintsAvailable: 3,
    pointsPerCorrect: 10,
    bonusTimePoints: 1, // points per second remaining
    streakBonus: 2, // bonus per word in streak
  },
  medium: {
    timePerWord: 10,
    wordsPerLevel: 8,
    optionsCount: 4,
    maxLevels: 5,
    hintsAvailable: 2,
    pointsPerCorrect: 15,
    bonusTimePoints: 2,
    streakBonus: 3,
  },
  hard: {
    timePerWord: 7,
    wordsPerLevel: 10,
    optionsCount: 6,
    maxLevels: 5,
    hintsAvailable: 1,
    pointsPerCorrect: 20,
    bonusTimePoints: 3,
    streakBonus: 4,
  }
};

// Sound effects
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
  },
};

interface SynonymMatchProps {
  difficulty?: 'easy' | 'medium' | 'hard';
  onGameComplete?: (score: number, level: number, correctAnswers: number) => void;
  onExit?: () => void;
}

interface WordPair {
  word: string;
  synonyms: string[];
  distractors: string[];
}

interface Option {
  text: string;
  isSynonym: boolean;
}

const SynonymMatch: React.FC<SynonymMatchProps> = ({
  difficulty = 'medium',
  onGameComplete,
  onExit
}) => {
  const { t } = useTranslation();
  
  // Game state
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'levelComplete' | 'gameOver'>('idle');
  const [settings, setSettings] = useState(DIFFICULTY_SETTINGS[difficulty]);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [wordPairs, setWordPairs] = useState<WordPair[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
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
  
  // Timer reference
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
  
  // Get random word pairs for the level
  const getRandomWordPairs = useCallback((count: number) => {
    // Shuffle the word pairs
    const shuffledPairs = [...WORD_PAIRS].sort(() => Math.random() - 0.5);
    // Take the required number of pairs
    return shuffledPairs.slice(0, count);
  }, []);
  
  // Generate options for the current word
  const generateOptions = useCallback((wordPair: WordPair, count: number) => {
    // Shuffle synonyms and distractors
    const shuffledSynonyms = [...wordPair.synonyms].sort(() => Math.random() - 0.5);
    const shuffledDistractors = [...wordPair.distractors].sort(() => Math.random() - 0.5);
    
    // Determine how many synonyms and distractors to include
    const synonymCount = Math.min(Math.ceil(count / 2), shuffledSynonyms.length);
    const distractorCount = Math.min(count - synonymCount, shuffledDistractors.length);
    
    // Create options
    const synonymOptions = shuffledSynonyms.slice(0, synonymCount).map(text => ({ text, isSynonym: true }));
    const distractorOptions = shuffledDistractors.slice(0, distractorCount).map(text => ({ text, isSynonym: false }));
    
    // Combine and shuffle options
    return [...synonymOptions, ...distractorOptions].sort(() => Math.random() - 0.5);
  }, []);
  
  // Function declarations to resolve circular dependency
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
    
    // Final celebration
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.6 }
    });
  }, [clearAllTimers, streak, bestStreak, onGameComplete, score, level, correctAnswers, t]);
  
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
      
      // Confetti celebration
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
  }, [level, settings.maxLevels, clearAllTimers, handleGameComplete, playSound, t]);
  
  // Move to next word - declared early to resolve circular dependency
  const moveToNextWord = useCallback(() => {
    const nextIndex = currentWordIndex + 1;
    
    // Clear feedback
    setSelectedOptionIndex(null);
    setIsCorrect(null);
    setShowHint(false);
    
    if (nextIndex >= wordPairs.length) {
      // Level complete
      handleLevelComplete();
    } else {
      // Move to next word
      setCurrentWordIndex(nextIndex);
      
      // Generate options for the next word
      const options = generateOptions(wordPairs[nextIndex], settings.optionsCount);
      setOptions(options);
      
      // Reset timer
      setTimeLeft(settings.timePerWord);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            handleAnswer(null);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      
      setFeedbackMessage(t('select_synonym', 'Select the synonym for the word above'));
    }
  }, [currentWordIndex, wordPairs, handleLevelComplete, generateOptions, settings, t]);
  
  // Handle answer submission
  const handleAnswer = useCallback((selectedIndex: number | null) => {
    clearAllTimers();
    
    // If time ran out or no selection
    if (selectedIndex === null) {
      setIsCorrect(false);
      setFeedbackMessage(t('time_up', 'Time\'s up!'));
      playSound('incorrect');
      setStreak(0);
      
      feedbackTimerRef.current = setTimeout(() => {
        moveToNextWord();
      }, 1500);
      
      return;
    }
    
    const selectedOption = options[selectedIndex];
    const isAnswerCorrect = selectedOption.isSynonym;
    
    setIsCorrect(isAnswerCorrect);
    
    if (isAnswerCorrect) {
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
      
      // Small celebration
      confetti({
        particleCount: 30,
        spread: 40,
        origin: { y: 0.7 }
      });
    } else {
      // Incorrect answer
      setFeedbackMessage(t('incorrect', 'Incorrect!'));
      setStreak(0);
      playSound('incorrect');
    }
    
    feedbackTimerRef.current = setTimeout(() => {
      moveToNextWord();
    }, 1500);
  }, [clearAllTimers, options, streak, bestStreak, settings, timeLeft, moveToNextWord, playSound, t]);
  
  // Initialize the level
  const initializeLevel = useCallback(() => {
    setCurrentWordIndex(0);
    setSelectedOptionIndex(null);
    setIsCorrect(null);
    setShowHint(false);
    
    const newWordPairs = getRandomWordPairs(settings.wordsPerLevel);
    setWordPairs(newWordPairs);
    
    if (newWordPairs.length > 0) {
      const options = generateOptions(newWordPairs[0], settings.optionsCount);
      setOptions(options);
      setTimeLeft(settings.timePerWord);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            handleAnswer(null);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    setGameStatus('playing');
    setFeedbackMessage(t('select_synonym', 'Select the synonym for the word above'));
  }, [settings, getRandomWordPairs, generateOptions, handleAnswer, t]);
  
  // Reset game
  const resetGame = useCallback(() => {
    clearAllTimers();
    setGameStatus('idle');
    setLevel(1);
    setScore(0);
    setCurrentWordIndex(0);
    setWordPairs([]);
    setOptions([]);
    setSelectedOptionIndex(null);
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
    setSettings(DIFFICULTY_SETTINGS[difficulty]);
  }, [clearAllTimers, difficulty, settings.hintsAvailable]);
  
  // Start game
  const startGame = useCallback(() => {
    resetGame();
    setHintsAvailable(DIFFICULTY_SETTINGS[difficulty].hintsAvailable);
    initializeLevel();
  }, [resetGame, initializeLevel, difficulty]);
  
  // Handle option selection
  const handleOptionSelect = useCallback((index: number) => {
    if (gameStatus !== 'playing' || isCorrect !== null) return;
    
    setSelectedOptionIndex(index);
  }, [gameStatus, isCorrect]);
  
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
  const timerPercentage = (timeLeft / settings.timePerWord) * 100;
  
  // Get the current word
  const currentWord = wordPairs[currentWordIndex]?.word || '';
  
  // Get the first synonym for hint
  const hintSynonym = wordPairs[currentWordIndex]?.synonyms[0] || '';
  
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
            <h1 className="text-3xl font-bold mb-4">{t('synonym_match', 'Synonym Match')}</h1>
            <p className="mb-8 max-w-md">
              {t('synonym_match_description', 'Test your vocabulary by selecting words that have similar meanings. Choose the synonyms for each target word and earn points!')}
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
            
            <div className="word-container">
              <div className="target-word">{currentWord}</div>
              {showHint && (
                <div className="text-sm text-primary-600 mb-2">
                  {t('hint_text', 'Hint')}: {hintSynonym}
                </div>
              )}
            </div>
            
            <div className="options-grid" style={{ gridTemplateColumns: `repeat(${Math.min(2, options.length)}, 1fr)` }}>
              {options.map((option, index) => (
                <button
                  key={index}
                  className={`option-button ${
                    selectedOptionIndex === index ? 'selected' : ''
                  } ${
                    isCorrect !== null && selectedOptionIndex === index
                      ? isCorrect
                        ? 'correct'
                        : 'incorrect'
                      : ''
                  } ${
                    isCorrect !== null && option.isSynonym ? 'correct' : ''
                  }`}
                  onClick={() => {
                    if (isCorrect === null) {
                      handleOptionSelect(index);
                      handleAnswer(index);
                    }
                  }}
                  disabled={isCorrect !== null}
                >
                  {option.text}
                </button>
              ))}
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

export default SynonymMatch; 