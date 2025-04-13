import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
// @ts-ignore
import confetti from 'canvas-confetti';
import './WordDuel.css';

// Word lists categorized by difficulty
const WORD_LISTS = {
  easy: [
    'cat', 'dog', 'hat', 'sun', 'run', 'fun', 'sad', 'bad', 'map', 'nap',
    'tap', 'cap', 'kid', 'big', 'pig', 'wig', 'jog', 'log', 'bug', 'hug',
    'mug', 'rug', 'pen', 'ten', 'men', 'hen', 'wet', 'pet', 'let', 'jet'
  ],
  medium: [
    'apple', 'bacon', 'cycle', 'dance', 'eagle', 'focus', 'giant', 'heart',
    'judge', 'lemon', 'magic', 'never', 'ocean', 'piano', 'quick', 'robot',
    'smile', 'tiger', 'uncle', 'voice', 'world', 'zebra', 'youth', 'power',
    'house', 'chair', 'plate', 'beach', 'cream', 'dream'
  ],
  hard: [
    'amazing', 'bicycle', 'calendar', 'diamond', 'elephant', 'festival',
    'gradient', 'healthy', 'journey', 'keyboard', 'landscape', 'mountain',
    'notebook', 'organize', 'paradise', 'question', 'resource', 'surprise',
    'triangle', 'umbrella', 'valuable', 'wonderful', 'yesterday', 'adventure',
    'beautiful', 'challenge', 'dazzling', 'exciting', 'fantastic', 'graceful'
  ]
};

// Difficulty settings
const DIFFICULTY_SETTINGS = {
  easy: {
    wordLength: 3,
    maxAttempts: 6,
    timePerWord: 60,  // seconds
    points: {
      base: 10,
      timeBonus: 1,
      streakMultiplier: 1.5
    }
  },
  medium: {
    wordLength: 5,
    maxAttempts: 5,
    timePerWord: 45,  // seconds
    points: {
      base: 20,
      timeBonus: 2,
      streakMultiplier: 2
    }
  },
  hard: {
    wordLength: 7,
    maxAttempts: 4,
    timePerWord: 30,  // seconds
    points: {
      base: 30,
      timeBonus: 3,
      streakMultiplier: 3
    }
  }
};

// Keyboard layout
const KEYBOARD_LAYOUT = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'backspace']
];

// Sound effects
const soundEffects = {
  keyPress: () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.value = 440; // A4 note
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
  success: () => {
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
  },
};

interface WordDuelProps {
  difficulty?: 'easy' | 'medium' | 'hard';
  onGameComplete?: (score: number, wordsGuessed: number, bestStreak: number) => void;
  onExit?: () => void;
}

const WordDuel: React.FC<WordDuelProps> = ({
  difficulty = 'medium',
  onGameComplete,
  onExit
}) => {
  const { t } = useTranslation();
  
  // State
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [currentWord, setCurrentWord] = useState('');
  const [attempts, setAttempts] = useState<string[]>([]);
  const [currentAttempt, setCurrentAttempt] = useState('');
  const [feedback, setFeedback] = useState<Array<Array<'correct' | 'wrong-position' | 'incorrect' | null>>>([]);
  const [keyboardFeedback, setKeyboardFeedback] = useState<{[key: string]: 'correct' | 'wrong-position' | 'incorrect' | null}>({});
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [wordsGuessed, setWordsGuessed] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [settings, setSettings] = useState(DIFFICULTY_SETTINGS[difficulty]);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const [inputError, setInputError] = useState(false);
  
  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Clear timers
  const clearTimers = useCallback(() => {
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
  const playSound = useCallback((soundType: string) => {
    if (!soundEnabled) return;
    
    switch(soundType) {
      case 'key':
        soundEffects.keyPress();
        break;
      case 'success':
        soundEffects.success();
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
  
  // Reset game
  const resetGame = useCallback(() => {
    clearTimers();
    setGameStatus('idle');
    setCurrentWord('');
    setAttempts([]);
    setCurrentAttempt('');
    setFeedback([]);
    setKeyboardFeedback({});
    setLevel(1);
    setScore(0);
    setTimeLeft(0);
    setWordsGuessed(0);
    setCurrentStreak(0);
    setFeedbackMessage('');
    setSettings(DIFFICULTY_SETTINGS[difficulty]);
    setUsedWords([]);
    setInputError(false);
  }, [clearTimers, difficulty]);
  
  // Reset game when difficulty changes
  useEffect(() => {
    resetGame();
  }, [difficulty, resetGame]);
  
  // Get a random word for the current difficulty
  const getRandomWord = useCallback(() => {
    const filteredWords = WORD_LISTS[difficulty].filter(word => 
      word.length === settings.wordLength && !usedWords.includes(word)
    );
    
    if (filteredWords.length === 0) {
      // If we've used all words, reset the used words list but keep the current word out
      setUsedWords([currentWord]);
      return WORD_LISTS[difficulty].filter(word => 
        word.length === settings.wordLength && word !== currentWord
      )[Math.floor(Math.random() * (WORD_LISTS[difficulty].length - 1))];
    }
    
    return filteredWords[Math.floor(Math.random() * filteredWords.length)];
  }, [difficulty, settings.wordLength, usedWords, currentWord]);
  
  // Generate feedback for a guess
  const generateFeedback = useCallback((guess: string, targetWord: string) => {
    const result: Array<'correct' | 'wrong-position' | 'incorrect'> = Array(guess.length).fill('incorrect');
    const targetChars = targetWord.split('');
    
    // First pass: find correct positions
    for (let i = 0; i < guess.length; i++) {
      if (guess[i] === targetChars[i]) {
        result[i] = 'correct';
        targetChars[i] = '#'; // Mark as used
      }
    }
    
    // Second pass: find wrong positions
    for (let i = 0; i < guess.length; i++) {
      if (result[i] !== 'correct') {
        const charIndex = targetChars.indexOf(guess[i]);
        if (charIndex !== -1) {
          result[i] = 'wrong-position';
          targetChars[charIndex] = '#'; // Mark as used
        }
      }
    }
    
    return result;
  }, []);
  
  // Update keyboard feedback
  const updateKeyboardFeedback = useCallback((guess: string, newFeedback: Array<'correct' | 'wrong-position' | 'incorrect'>) => {
    setKeyboardFeedback(prevFeedback => {
      const newState = { ...prevFeedback };
      
      for (let i = 0; i < guess.length; i++) {
        const char = guess[i];
        const currentFeedback = newFeedback[i];
        
        // Update only if the new feedback is better
        if (
          !newState[char] || 
          (newState[char] === 'incorrect' && currentFeedback !== 'incorrect') ||
          (newState[char] === 'wrong-position' && currentFeedback === 'correct')
        ) {
          newState[char] = currentFeedback;
        }
      }
      
      return newState;
    });
  }, []);
  
  // Start new word round
  const startNewRound = useCallback(() => {
    clearTimers();
    
    // Get a new word
    const newWord = getRandomWord();
    setCurrentWord(newWord);
    setUsedWords(prev => [...prev, newWord]);
    
    // Reset round state
    setAttempts([]);
    setCurrentAttempt('');
    setFeedback([]);
    setKeyboardFeedback({});
    setTimeLeft(settings.timePerWord);
    setFeedbackMessage(t('guess_the_word', 'Guess the word!'));
    setGameStatus('playing');
    
    // Start the timer
    const startTime = Date.now();
    const totalTime = settings.timePerWord * 1000;
    
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, totalTime - elapsed);
      const secondsLeft = Math.ceil(remaining / 1000);
      
      setTimeLeft(secondsLeft);
      
      if (remaining <= 0) {
        clearInterval(timerRef.current!);
        handleGameOver();
      }
    }, 100);
    
    // Focus the input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [clearTimers, getRandomWord, settings, t]);
  
  // Handle game over
  const handleGameOver = useCallback(() => {
    clearTimers();
    setGameStatus('gameover');
    setFeedbackMessage(t('game_over', 'Game Over! The word was: ') + currentWord);
    
    // Update best streak
    if (currentStreak > bestStreak) {
      setBestStreak(currentStreak);
    }
    
    if (onGameComplete) {
      onGameComplete(score, wordsGuessed, Math.max(currentStreak, bestStreak));
    }
    
    // Show end animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    // Play end sound
    playSound('error');
  }, [clearTimers, currentWord, currentStreak, bestStreak, onGameComplete, score, wordsGuessed, t, playSound]);
  
  // Submit a guess
  const submitGuess = useCallback(() => {
    // Validate attempt length
    if (currentAttempt.length !== settings.wordLength) {
      // Show error
      setInputError(true);
      playSound('error');
      
      // Clear error after a short delay
      feedbackTimerRef.current = setTimeout(() => {
        setInputError(false);
      }, 1000);
      
      return;
    }
    
    // Add attempt to list and generate feedback
    const guess = currentAttempt.toLowerCase();
    setAttempts(prev => [...prev, guess]);
    setCurrentAttempt('');
    
    const attemptFeedback = generateFeedback(guess, currentWord);
    setFeedback(prev => [...prev, attemptFeedback]);
    
    // Update keyboard feedback
    updateKeyboardFeedback(guess, attemptFeedback);
    
    // Check if guess is correct
    const isCorrect = guess === currentWord;
    
    if (isCorrect) {
      // Play success sound
      playSound('success');
      
      // Calculate score - based on word length, attempts, time left, and streak
      const basePoints = settings.points.base * currentWord.length;
      const attemptBonus = (settings.maxAttempts - attempts.length) * 5;
      const timeBonus = Math.round(timeLeft * settings.points.timeBonus);
      
      // Update streak
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      
      // Apply streak multiplier if applicable
      const streakMultiplier = Math.floor(newStreak / 3) * settings.points.streakMultiplier;
      
      const roundScore = Math.round((basePoints + attemptBonus + timeBonus) * (1 + streakMultiplier / 10));
      
      setScore(prevScore => prevScore + roundScore);
      setWordsGuessed(prev => prev + 1);
      
      // Level up
      setLevel(prevLevel => prevLevel + 1);
      setShowLevelUp(true);
      
      // Play level up sound
      playSound('levelUp');
      
      // Show success message with score details
      setFeedbackMessage(
        `${t('correct', 'Correct')}! +${basePoints} +${attemptBonus} +${timeBonus} ${
          streakMultiplier > 0 ? `(x${1 + streakMultiplier / 10})` : ''
        } = +${roundScore} ${t('points', 'points')}`
      );
      
      // Small celebration
      confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.7 }
      });
      
      // Start new round after delay
      feedbackTimerRef.current = setTimeout(() => {
        setShowLevelUp(false);
        startNewRound();
      }, 2500);
    } else if (attempts.length >= settings.maxAttempts - 1) {
      // No more attempts, game over
      handleGameOver();
    } else {
      // Wrong guess, but can continue
      playSound('key');
      setFeedbackMessage(t('wrong_guess', 'Try again!'));
    }
  }, [
    currentAttempt, 
    currentWord, 
    attempts, 
    settings, 
    timeLeft, 
    generateFeedback, 
    updateKeyboardFeedback, 
    currentStreak, 
    playSound, 
    startNewRound,
    handleGameOver,
    t
  ]);
  
  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow letters and limit to word length
    const value = e.target.value.replace(/[^a-zA-Z]/g, '').toLowerCase();
    if (value.length <= settings.wordLength) {
      setCurrentAttempt(value);
      playSound('key');
    }
  }, [settings.wordLength, playSound]);
  
  // Handle keyboard input
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && gameStatus === 'playing') {
      e.preventDefault();
      submitGuess();
    }
  }, [gameStatus, submitGuess]);
  
  // Handle on-screen keyboard
  const handleKeyboardClick = useCallback((key: string) => {
    if (gameStatus !== 'playing') return;
    
    playSound('key');
    
    if (key === 'enter') {
      submitGuess();
    } else if (key === 'backspace') {
      setCurrentAttempt(prev => prev.slice(0, -1));
    } else if (currentAttempt.length < settings.wordLength) {
      setCurrentAttempt(prev => prev + key);
    }
    
    // Focus the input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameStatus, currentAttempt, settings.wordLength, submitGuess, playSound]);
  
  // Start game
  const startGame = useCallback(() => {
    resetGame();
    setCurrentStreak(0);
    startNewRound();
  }, [resetGame, startNewRound]);
  
  // Clean up on component unmount
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);
  
  // Toggle sound setting
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };
  
  // Calculate timer progress percentage
  const timerPercentage = (timeLeft / settings.timePerWord) * 100;

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
            <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('words', 'Words')}</div>
            <div className="text-xl font-bold">{wordsGuessed}</div>
          </div>
          <div className="border-l border-gray-300 dark:border-gray-600 h-8 self-center mx-2"></div>
          <div className="flex-1">
            <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('streak', 'Streak')}</div>
            <div className="text-xl font-bold">{currentStreak}</div>
          </div>
        </div>
      </div>
      
      {/* Difficulty Selection - Top left */}
      <div className="absolute top-4 left-4 flex space-x-2 z-10">
        <button
          onClick={() => setSettings(DIFFICULTY_SETTINGS.easy)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${ 
            settings === DIFFICULTY_SETTINGS.easy 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600' 
          }`}
          disabled={gameStatus !== 'idle'}
        >
          {t('easy', 'Easy')}
        </button>
        <button
          onClick={() => setSettings(DIFFICULTY_SETTINGS.medium)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${ 
            settings === DIFFICULTY_SETTINGS.medium 
              ? 'bg-yellow-600 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600' 
          }`}
          disabled={gameStatus !== 'idle'}
        >
          {t('medium', 'Medium')}
        </button>
        <button
          onClick={() => setSettings(DIFFICULTY_SETTINGS.hard)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${ 
            settings === DIFFICULTY_SETTINGS.hard 
              ? 'bg-red-600 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600' 
          }`}
          disabled={gameStatus !== 'idle'}
        >
          {t('hard', 'Hard')}
        </button>
      </div>
      
      {/* Sound Toggle - Top right */}
      <div className="absolute top-4 right-4 flex items-center z-10">
        <button 
          onClick={toggleSound}
          className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
          aria-label={soundEnabled ? t('mute_sound', 'Mute Sound') : t('enable_sound', 'Enable Sound')}
        >
          {/* Sound Icons */}
          {soundEnabled ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
          )}
        </button>
      </div>

      {/* Game Area - Centered */}
      <div className="flex flex-col items-center justify-center flex-grow w-full pt-20">
        <div className="word-display mb-6 h-8">
          {feedbackMessage}
        </div>
        
        {/* Level Up Information */}
        {showLevelUp && (
          <div className="level-badge">
            {t('level', 'Level')} {level}
          </div>
        )}
        
        {/* Previous Attempts */}
        <div className="attempts-container">
          {attempts.map((attempt, attemptIndex) => (
            <div key={attemptIndex} className="attempt-row">
              {attempt.split('').map((letter, letterIndex) => (
                <div 
                  key={`${attemptIndex}-${letterIndex}`} 
                  className={`letter ${feedback[attemptIndex]?.[letterIndex] || ''}`}
                >
                  {letter}
                </div>
              ))}
            </div>
          ))}
        </div>
        
        {/* Current Input */}
        {gameStatus === 'playing' && (
          <>
            <input
              ref={inputRef}
              type="text"
              value={currentAttempt}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              maxLength={settings.wordLength}
              placeholder={`${t('enter_word', 'Enter')} ${settings.wordLength} ${t('letter_word', 'letter word')}`}
              className={`word-input ${inputError ? 'error' : ''}`}
              autoFocus
              disabled={gameStatus !== 'playing'}
            />
            
            <div className="hint-text mb-4">
              {t('attempts_left', 'Attempts left')}: {settings.maxAttempts - attempts.length}
            </div>
            
            {/* On-screen Keyboard */}
            <div className="w-full max-w-3xl">
              {KEYBOARD_LAYOUT.map((row, rowIndex) => (
                <div key={rowIndex} className="keyboard-row">
                  {row.map(key => (
                    <button
                      key={key}
                      className={`key ${key === 'enter' || key === 'backspace' ? 'wide' : ''} ${keyboardFeedback[key] || ''}`}
                      onClick={() => handleKeyboardClick(key)}
                    >
                      {key === 'backspace' ? '⌫' : key === 'enter' ? '↵' : key}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
        
        {/* Timer Bar */}
        {gameStatus === 'playing' && (
          <div className="timer-bar w-full max-w-sm mt-4 mb-20">
            <div 
              className={`timer-progress ${timeLeft < settings.timePerWord * 0.2 ? 'timer-critical' : ''}`} 
              style={{ width: `${timerPercentage}%` }}
            />
          </div>
        )}
      </div>

      {/* Action Buttons - Bottom centered */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
        <button
          onClick={startGame}
          disabled={gameStatus === 'playing'}
          className="px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {gameStatus === 'gameover' || gameStatus === 'idle' ? t('start_game', 'Start Game') : t('game_in_progress', 'Game in Progress')}
        </button>
        
        <button
          onClick={onExit}
          className="px-6 py-3 rounded-lg bg-gray-500 text-white font-semibold hover:bg-gray-600 transition-colors"
        >
          {t('exit', 'Exit')}
        </button>
      </div>
      
      {/* Game Over Modal */}
      {gameStatus === 'gameover' && (
        <div className="game-over-overlay">
          <div className="game-over-content dark:bg-gray-800">
            <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">{t('game_over', 'Game Over')}</h2>
            <div className="space-y-3 mb-6 text-gray-700 dark:text-gray-300">
              <p>{t('final_score', 'Final Score')}: <span className="font-bold text-xl">{score}</span></p>
              <p>{t('level_reached', 'Level Reached')}: {level}</p>
              <p>{t('words_guessed', 'Words Guessed')}: {wordsGuessed}</p>
              <p>{t('highest_streak', 'Highest Streak')}: {Math.max(bestStreak, currentStreak)}</p>
            </div>
            <div className="flex space-x-3 justify-center">
              <button
                onClick={startGame}
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
  );
};

export default WordDuel; 