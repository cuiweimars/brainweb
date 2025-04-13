import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
// @ts-ignore
import confetti from 'canvas-confetti';
import './PatternSolver.css';

// Difficulty settings
const DIFFICULTY_SETTINGS = {
  easy: {
    gridSize: 3,
    patternComplexity: 'low',
    timeLimit: 60,
    hintsAvailable: 3,
    pointsPerCorrect: 10,
    pointsPerIncorrect: -3,
    numOptionsPerQuestion: 3
  },
  medium: {
    gridSize: 4,
    patternComplexity: 'medium',
    timeLimit: 90,
    hintsAvailable: 2,
    pointsPerCorrect: 15,
    pointsPerIncorrect: -5,
    numOptionsPerQuestion: 4
  },
  hard: {
    gridSize: 5,
    patternComplexity: 'high',
    timeLimit: 120,
    hintsAvailable: 1,
    pointsPerCorrect: 20,
    pointsPerIncorrect: -8,
    numOptionsPerQuestion: 5
  }
};

// Pattern types
const PATTERN_TYPES = [
  'arithmetic',
  'geometric',
  'fibonacci',
  'alternating',
  'mirror',
  'prime',
  'square',
  'cube',
  'custom'
];

// Sound effects
const soundEffects = {
  correct: () => {
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
  incorrect: () => {
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
  },
};

interface PatternSolverProps {
  difficulty?: 'easy' | 'medium' | 'hard';
  onGameComplete?: (score: number, patternsCompleted: number, accuracy: number) => void;
  onExit?: () => void;
}

interface PatternQuestion {
  patternType: string;
  values: (number | string)[];
  answerIndex: number;
  correctAnswer: number | string;
  options: (number | string)[];
  hint: string;
}

const PatternSolver: React.FC<PatternSolverProps> = ({
  difficulty = 'medium',
  onGameComplete,
  onExit
}) => {
  const { t } = useTranslation();
  
  // Game state
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'paused' | 'gameover'>('idle');
  const [currentDifficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(difficulty);
  const [settings, setSettings] = useState(DIFFICULTY_SETTINGS[difficulty]);
  const [currentQuestion, setCurrentQuestion] = useState<PatternQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | string | null>(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(DIFFICULTY_SETTINGS[difficulty].timeLimit);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintsAvailable, setHintsAvailable] = useState(DIFFICULTY_SETTINGS[difficulty].hintsAvailable);
  const [showHint, setShowHint] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [patternsCompleted, setPatternsCompleted] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAnswers, setTotalAnswers] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  
  // Timers and refs
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
  
  // Play sound if enabled
  const playSound = useCallback((sound: () => void) => {
    if (soundEnabled) {
      sound();
    }
  }, [soundEnabled]);
  
  // Generate a random pattern based on the pattern type and difficulty
  const generatePattern = useCallback((patternType: string, complexity: string, size: number): [Array<number | string>, number | string, string] => {
    const values: Array<number | string> = [];
    let correctAnswer: number | string;
    let hint = '';
    
    switch (patternType) {
      case 'arithmetic': {
        // Generate arithmetic sequence with random start and step
        const start = Math.floor(Math.random() * 10) + 1;
        const step = complexity === 'low' ? Math.floor(Math.random() * 3) + 1 : 
                    complexity === 'medium' ? Math.floor(Math.random() * 5) + 2 : 
                    Math.floor(Math.random() * 10) + 5;
        
        for (let i = 0; i < size - 1; i++) {
          values.push(start + (step * i));
        }
        correctAnswer = start + (step * (size - 1));
        hint = `Look for a constant difference between consecutive numbers.`;
        break;
      }
      case 'geometric': {
        // Generate geometric sequence with random start and ratio
        const start = Math.floor(Math.random() * 5) + 1;
        const ratio = complexity === 'low' ? 2 : 
                     complexity === 'medium' ? 3 : 
                     Math.floor(Math.random() * 3) + 3;
        
        for (let i = 0; i < size - 1; i++) {
          values.push(start * Math.pow(ratio, i));
        }
        correctAnswer = start * Math.pow(ratio, size - 1);
        hint = `Each number is multiplied by a constant to get the next number.`;
        break;
      }
      case 'fibonacci': {
        // Generate Fibonacci-like sequence with random first two numbers
        const first = Math.floor(Math.random() * 5) + 1;
        const second = Math.floor(Math.random() * 10) + first;
        
        values.push(first, second);
        
        for (let i = 2; i < size - 1; i++) {
          const nextNum = (values[i - 1] as number) + (values[i - 2] as number);
          values.push(nextNum);
        }
        correctAnswer = (values[size - 2] as number) + (values[size - 3] as number);
        hint = `Each number is the sum of the two previous numbers.`;
        break;
      }
      case 'alternating': {
        // Generate alternating pattern with two or three different operations
        const start = Math.floor(Math.random() * 10) + 1;
        const operations = complexity === 'low' ? 2 : 3;
        const opValues = [];
        
        for (let i = 0; i < operations; i++) {
          opValues.push(Math.floor(Math.random() * 5) + 1);
        }
        
        values.push(start);
        let current = start;
        
        for (let i = 0; i < size - 2; i++) {
          const opIndex = i % operations;
          if (opIndex === 0) {
            current += opValues[0];
          } else if (opIndex === 1) {
            current -= opValues[1];
          } else {
            current *= opValues[2];
          }
          values.push(current);
        }
        
        const nextOpIndex = (size - 2) % operations;
        if (nextOpIndex === 0) {
          correctAnswer = current + opValues[0];
        } else if (nextOpIndex === 1) {
          correctAnswer = current - opValues[1];
        } else {
          correctAnswer = current * opValues[2];
        }
        
        hint = `Look for alternating operations like +, -, × in a repeating cycle.`;
        break;
      }
      case 'mirror': {
        // Generate a pattern that mirrors in the middle
        const start = Math.floor(Math.random() * 10) + 1;
        const step = Math.floor(Math.random() * 3) + 1;
        
        // First half increasing
        for (let i = 0; i < Math.floor(size / 2); i++) {
          values.push(start + (i * step));
        }
        
        // Second half decreasing
        for (let i = Math.floor(size / 2) - (size % 2 === 0 ? 1 : 2); i >= 0; i--) {
          if (values.length < size - 1) {
            values.push(start + (i * step));
          }
        }
        
        correctAnswer = start;
        hint = `The pattern increases then decreases in a mirror-like fashion.`;
        break;
      }
      case 'prime': {
        // Generate sequence of prime numbers
        const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71];
        const startIndex = Math.floor(Math.random() * (primes.length - size));
        
        for (let i = 0; i < size - 1; i++) {
          values.push(primes[startIndex + i]);
        }
        correctAnswer = primes[startIndex + size - 1];
        hint = `These are all prime numbers.`;
        break;
      }
      case 'square': {
        // Generate sequence of square numbers with a twist based on complexity
        const start = Math.floor(Math.random() * 5) + 1;
        const offset = complexity === 'low' ? 0 : 
                     complexity === 'medium' ? Math.floor(Math.random() * 5) + 1 : 
                     Math.floor(Math.random() * 10) + 5;
        
        for (let i = 0; i < size - 1; i++) {
          values.push((start + i) * (start + i) + offset);
        }
        correctAnswer = (start + size - 1) * (start + size - 1) + offset;
        hint = `Look for square numbers, possibly with a constant added.`;
        break;
      }
      case 'cube': {
        // Generate sequence based on cube numbers
        const start = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < size - 1; i++) {
          values.push(Math.pow(start + i, 3));
        }
        correctAnswer = Math.pow(start + size - 1, 3);
        hint = `These are cube numbers (n³).`;
        break;
      }
      case 'custom': {
        // Generate a custom complex pattern
        if (complexity === 'low') {
          // Sum of index and square of index
          for (let i = 1; i < size; i++) {
            values.push(i + (i * i));
          }
          correctAnswer = size + (size * size);
          hint = `Try combining the position number with its square.`;
        } else if (complexity === 'medium') {
          // Triangular numbers
          for (let i = 1; i < size; i++) {
            values.push((i * (i + 1)) / 2);
          }
          correctAnswer = (size * (size + 1)) / 2;
          hint = `These are triangular numbers: 1, 3, 6, 10, ...`;
        } else {
          // Complex pattern like n² - n + 41 (prime generator)
          for (let i = 1; i < size; i++) {
            values.push(i * i - i + 41);
          }
          correctAnswer = size * size - size + 41;
          hint = `This is a formula that generates mostly prime numbers.`;
        }
        break;
      }
      default: {
        // Default to arithmetic sequence
        const start = Math.floor(Math.random() * 10) + 1;
        const step = Math.floor(Math.random() * 5) + 1;
        
        for (let i = 0; i < size - 1; i++) {
          values.push(start + (step * i));
        }
        correctAnswer = start + (step * (size - 1));
        hint = `Look for a constant difference between consecutive numbers.`;
      }
    }
    
    return [values, correctAnswer, hint];
  }, []);
  
  // Generate options for multiple choice
  const generateOptions = useCallback((correctAnswer: number | string, numOptions: number): (number | string)[] => {
    const options: (number | string)[] = [correctAnswer];
    
    // Generate wrong options
    while (options.length < numOptions) {
      let wrongOption: number | string;
      
      if (typeof correctAnswer === 'number') {
        // Generate a number within ±30% of the correct answer, but not the same
        const min = Math.max(1, Math.round(correctAnswer * 0.7));
        const max = Math.round(correctAnswer * 1.3);
        wrongOption = Math.floor(Math.random() * (max - min + 1)) + min;
        
        // Ensure it's different from correctAnswer and not already in options
        if (wrongOption !== correctAnswer && !options.includes(wrongOption)) {
          options.push(wrongOption);
        }
      } else {
        // For string answers, generate random characters
        wrongOption = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        if (!options.includes(wrongOption)) {
          options.push(wrongOption);
        }
      }
    }
    
    // Shuffle options
    return shuffleArray(options);
  }, []);
  
  // Generate a new pattern question
  const generateQuestion = useCallback(() => {
    const patternType = PATTERN_TYPES[Math.floor(Math.random() * PATTERN_TYPES.length)];
    const complexity = settings.patternComplexity;
    const size = settings.gridSize;
    
    const [values, correctAnswer, hint] = generatePattern(patternType, complexity, size);
    const options = generateOptions(correctAnswer, settings.numOptionsPerQuestion);
    const answerIndex = values.length;
    
    // Find index of correct answer in options
    const correctOptionIndex = options.findIndex(option => option === correctAnswer);
    
    setCurrentQuestion({
      patternType,
      values,
      answerIndex,
      correctAnswer,
      options,
      hint
    });
    
    setSelectedOption(null);
    setSelectedOptionIndex(null);
    setShowHint(false);
  }, [settings, generatePattern, generateOptions]);
  
  // Initialize game
  const initializeGame = useCallback(() => {
    setScore(0);
    setLevel(1);
    setTimeLeft(settings.timeLimit);
    setHintsUsed(0);
    setHintsAvailable(settings.hintsAvailable);
    setPatternsCompleted(0);
    setCorrectAnswers(0);
    setTotalAnswers(0);
    setStreakCount(0);
    setBestStreak(0);
    setGameStatus('playing');
    
    generateQuestion();
    
    // Start timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [settings, generateQuestion]);
  
  // End the game
  const endGame = useCallback(() => {
    clearAllTimers();
    setGameStatus('gameover');
    
    const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
    
    if (onGameComplete) {
      onGameComplete(score, patternsCompleted, accuracy);
    }
  }, [clearAllTimers, score, patternsCompleted, correctAnswers, totalAnswers, onGameComplete]);
  
  // Handle option selection
  const handleOptionSelect = useCallback((option: number | string, index: number) => {
    setSelectedOption(option);
    setSelectedOptionIndex(index);
  }, []);
  
  // Handle answer submission
  const handleSubmit = useCallback(() => {
    if (currentQuestion && selectedOption !== null && selectedOptionIndex !== null) {
      setTotalAnswers(prev => prev + 1);
      
      // Check if answer is correct
      const isCorrect = selectedOption === currentQuestion.correctAnswer;
      
      if (isCorrect) {
        // Correct answer
        playSound(soundEffects.correct);
        setScore(prev => prev + settings.pointsPerCorrect);
        setCorrectAnswers(prev => prev + 1);
        setPatternsCompleted(prev => prev + 1);
        setStreakCount(prev => prev + 1);
        setBestStreak(prev => Math.max(prev, streakCount + 1));
        
        setFeedbackType('success');
        setFeedbackMessage('Correct! +' + settings.pointsPerCorrect + ' points');
        
        // Show confetti for correct answers
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {
          console.log('Confetti error:', e);
        }
        
        // Check for level up
        if (patternsCompleted + 1 >= level * 5) {
          setLevel(prev => prev + 1);
          setHintsAvailable(prev => prev + 1);
          setShowLevelUp(true);
          playSound(soundEffects.levelUp);
          
          setTimeout(() => {
            setShowLevelUp(false);
          }, 1500);
        }
      } else {
        // Incorrect answer
        playSound(soundEffects.incorrect);
        setScore(prev => prev + settings.pointsPerIncorrect); // Negative points
        setStreakCount(0);
        
        setFeedbackType('error');
        setFeedbackMessage('Incorrect! ' + settings.pointsPerIncorrect + ' points. The answer was ' + currentQuestion.correctAnswer);
      }
      
      // Clear feedback after delay
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
      
      feedbackTimerRef.current = setTimeout(() => {
        setFeedbackType(null);
        setFeedbackMessage('');
        generateQuestion();
      }, 2000);
    }
  }, [currentQuestion, selectedOption, selectedOptionIndex, settings, playSound, streakCount, patternsCompleted, level, generateQuestion]);
  
  // Handle skipping a question
  const handleSkip = useCallback(() => {
    setFeedbackType('error');
    setFeedbackMessage(`Skipped. The answer was ${currentQuestion?.correctAnswer}`);
    setStreakCount(0);
    
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
    }
    
    feedbackTimerRef.current = setTimeout(() => {
      setFeedbackType(null);
      setFeedbackMessage('');
      generateQuestion();
    }, 2000);
  }, [currentQuestion, generateQuestion]);
  
  // Handle using a hint
  const handleUseHint = useCallback(() => {
    if (hintsAvailable > 0 && !showHint) {
      setHintsAvailable(prev => prev - 1);
      setHintsUsed(prev => prev + 1);
      setShowHint(true);
    }
  }, [hintsAvailable, showHint]);
  
  // Handle pause/resume game
  const togglePause = useCallback(() => {
    if (gameStatus === 'playing') {
      setGameStatus('paused');
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    } else if (gameStatus === 'paused') {
      setGameStatus('playing');
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [gameStatus, endGame]);
  
  // Handle exit game
  const exitGame = useCallback(() => {
    clearAllTimers();
    if (onExit) {
      onExit();
    }
  }, [clearAllTimers, onExit]);
  
  // Toggle sound
  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, []);
  
  // Handle difficulty change
  const changeDifficulty = useCallback((newDifficulty: 'easy' | 'medium' | 'hard') => {
    setDifficulty(newDifficulty);
    setSettings(DIFFICULTY_SETTINGS[newDifficulty]);
  }, []);
  
  // Utility function to shuffle an array
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);
  
  // Update settings when difficulty changes
  useEffect(() => {
    setSettings(DIFFICULTY_SETTINGS[currentDifficulty]);
  }, [currentDifficulty]);
  
  // Render game play UI
  const renderGamePlay = () => (
    <>
      {/* Game Stats & Info */}
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
            <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('patterns', 'Patterns')}</div>
            <div className="text-xl font-bold">{patternsCompleted}</div>
          </div>
          <div className="border-l border-gray-300 dark:border-gray-600 h-8 self-center mx-2"></div>
          <div className="flex-1">
            <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('streak', 'Streak')}</div>
            <div className="text-xl font-bold">{streakCount}</div>
          </div>
        </div>
      </div>

      {/* Difficulty Selection */}
      <div className="absolute top-4 left-4 z-10">
        <div className="flex items-center space-x-2">
          <button 
            className={`difficulty-button ${currentDifficulty === 'easy' ? 'active' : ''}`}
            onClick={() => changeDifficulty('easy')}
          >
            {t('easy', 'Easy')}
          </button>
          <button 
            className={`difficulty-button ${currentDifficulty === 'medium' ? 'active' : ''}`}
            onClick={() => changeDifficulty('medium')}
          >
            {t('medium', 'Medium')}
          </button>
          <button 
            className={`difficulty-button ${currentDifficulty === 'hard' ? 'active' : ''}`}
            onClick={() => changeDifficulty('hard')}
          >
            {t('hard', 'Hard')}
          </button>
        </div>
      </div>

      {/* Sound Button */}
      <div className="absolute top-4 right-4 z-10">
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
      </div>

      {/* Main Game Content */}
      <div className="flex flex-col items-center justify-center flex-grow w-full pt-20">
        {/* Feedback Message */}
        <div className="feedback-message mb-6 h-8 text-center">
          {feedbackMessage}
        </div>
        
        {/* Level Up Animation */}
        {showLevelUp && (
          <div className="level-badge">
            {t('level', 'Level')} {level}
          </div>
        )}
        
        {/* Timer Bar */}
        <div className="timer-bar w-full max-w-sm mb-4">
          <div
            className={`timer-progress ${timeLeft < 10 ? 'timer-critical' : ''}`}
            style={{ width: `${(timeLeft / settings.timeLimit) * 100}%` }}
          />
        </div>

        {/* Pattern Display */}
        {currentQuestion && (
          <>
            <div className={`pattern-grid ${currentDifficulty}`}>
              {currentQuestion.values.map((value, index) => (
                <div 
                  key={index} 
                  className="pattern-cell"
                >
                  {value}
                </div>
              ))}
              <div className={`pattern-cell answer-cell ${selectedOption !== null ? 'selected' : ''}`}>
                {selectedOption !== null ? selectedOption : '?'}
              </div>
            </div>
            
            {/* Options */}
            <div className="options-container">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  className={`option-btn ${selectedOptionIndex === index ? 'selected' : ''}`}
                  onClick={() => handleOptionSelect(option, index)}
                >
                  {option}
                </button>
              ))}
            </div>
            
            {/* Hint */}
            {showHint && (
              <div className="hint-container">
                <div className="hint-title">{t('hint', 'Hint')}:</div>
                <div>{currentQuestion.hint}</div>
              </div>
            )}
            
            {/* Action buttons */}
            <div className="action-buttons">
              {hintsAvailable > 0 && !showHint && (
                <button className="hint-btn" onClick={handleUseHint}>
                  {t('use_hint', 'Use Hint')} ({hintsAvailable})
                </button>
              )}
              <button className="skip-btn" onClick={handleSkip}>
                {t('skip', 'Skip')}
              </button>
              <button 
                className="submit-btn" 
                onClick={handleSubmit}
                disabled={selectedOption === null}
              >
                {t('submit', 'Submit')}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );

  // Render intro screen
  const renderIntro = () => (
    <div className="flex flex-col items-center justify-center w-full p-8">
      <h2 className="text-3xl font-bold mb-6">{t('pattern_solver', 'Pattern Solver')}</h2>
      <div className="difficulty-selector mb-6">
        <button 
          className={`difficulty-button ${currentDifficulty === 'easy' ? 'active' : ''}`}
          onClick={() => changeDifficulty('easy')}
        >
          {t('easy', 'Easy')}
        </button>
        <button 
          className={`difficulty-button ${currentDifficulty === 'medium' ? 'active' : ''}`}
          onClick={() => changeDifficulty('medium')}
        >
          {t('medium', 'Medium')}
        </button>
        <button 
          className={`difficulty-button ${currentDifficulty === 'hard' ? 'active' : ''}`}
          onClick={() => changeDifficulty('hard')}
        >
          {t('hard', 'Hard')}
        </button>
      </div>
      <div className="text-center mb-8 text-gray-600 dark:text-gray-400">
        {currentDifficulty === 'easy' && t('easy_description', 'Simple patterns with 3x3 grids and more hints. 60 seconds.')}
        {currentDifficulty === 'medium' && t('medium_description', 'Moderately complex patterns with 4x4 grids. 90 seconds.')}
        {currentDifficulty === 'hard' && t('hard_description', 'Complex patterns with 5x5 grids and limited hints. 120 seconds.')}
      </div>
      <button className="start-button" onClick={initializeGame}>
        {t('start_game', 'Start Game')}
      </button>
    </div>
  );

  // Render game over screen
  const renderGameOver = () => (
    <div className="game-over-overlay">
      <div className="game-over-content dark:bg-gray-800">
        <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">{t('game_over', 'Game Over')}</h2>
        <div className="space-y-3 mb-6 text-gray-700 dark:text-gray-300">
          <p>{t('final_score', 'Final Score')}: <span className="font-bold text-xl">{score}</span></p>
          <p>{t('patterns_solved', 'Patterns Solved')}: {patternsCompleted}</p>
          <p>{t('accuracy', 'Accuracy')}: {totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0}%</p>
          <p>{t('best_streak', 'Best Streak')}: {bestStreak}</p>
        </div>
        <div className="flex space-x-3 justify-center">
          <button
            onClick={() => setGameStatus('idle')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            {t('play_again', 'Play Again')}
          </button>
          {onExit && (
            <button
              onClick={exitGame}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              {t('exit', 'Exit')}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] p-4 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg shadow-xl relative">
      {gameStatus === 'idle' && renderIntro()}
      
      {gameStatus === 'playing' && renderGamePlay()}
      
      {gameStatus === 'paused' && (
        <>
          {renderGamePlay()}
          <div className="pause-overlay">
            <div className="pause-content dark:bg-gray-800">
              <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">{t('game_paused', 'Game Paused')}</h2>
              <p className="mb-6 text-gray-700 dark:text-gray-300">{t('pause_message', 'Take a breath. Ready to continue?')}</p>
              <div className="flex space-x-3 justify-center">
                <button 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors"
                  onClick={togglePause}
                >
                  {t('resume', 'Resume')}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      
      {gameStatus === 'gameover' && renderGameOver()}
      
      {/* Exit Button - Bottom right */}
      {onExit && (
        <button
          onClick={onExit}
          className="absolute bottom-4 right-4 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
        >
          {t('exit', 'Exit')}
        </button>
      )}
    </div>
  );
};

export default PatternSolver; 