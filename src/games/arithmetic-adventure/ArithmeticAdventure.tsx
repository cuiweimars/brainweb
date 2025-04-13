import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
// @ts-ignore
import confetti from 'canvas-confetti';
import './ArithmeticAdventure.css';

// Use SVG components instead of react-icons to avoid TypeScript issues
// These are based on the same icons from Font Awesome but directly as SVG
const TimesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352 512" width="20" height="20" fill="currentColor">
    <path d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"/>
  </svg>
);

const PauseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="20" height="20" fill="currentColor">
    <path d="M144 479H48c-26.5 0-48-21.5-48-48V79c0-26.5 21.5-48 48-48h96c26.5 0 48 21.5 48 48v352c0 26.5-21.5 48-48 48zm304-48V79c0-26.5-21.5-48-48-48h-96c-26.5 0-48 21.5-48 48v352c0 26.5 21.5 48 48 48h96c26.5 0 48-21.5 48-48z"/>
  </svg>
);

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="20" height="20" fill="currentColor">
    <path d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"/>
  </svg>
);

const SoundOnIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const SoundOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
  </svg>
);

// Define sound effects system
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

type Operation = '+' | '-' | '*' | '/';
type ArithmeticProblem = {
  num1: number;
  num2: number;
  operation: Operation;
  correctAnswer: number;
  options: number[];
};

type DifficultySetting = {
  operations: Operation[];
  minNumber: number;
  maxNumber: number;
  timeLimit: number;
  problemsPerLevel: number;
};

const DIFFICULTY_SETTINGS: Record<string, DifficultySetting> = {
  easy: {
    operations: ['+', '-'],
    minNumber: 1,
    maxNumber: 10,
    timeLimit: 10,
    problemsPerLevel: 5,
  },
  medium: {
    operations: ['+', '-', '*'],
    minNumber: 1,
    maxNumber: 20,
    timeLimit: 8,
    problemsPerLevel: 8,
  },
  hard: {
    operations: ['+', '-', '*', '/'],
    minNumber: 2,
    maxNumber: 30,
    timeLimit: 6,
    problemsPerLevel: 10,
  },
};

interface ArithmeticAdventureProps {
  difficulty?: 'easy' | 'medium' | 'hard';
  onGameComplete?: (score: number, level: number) => void;
  onExit?: () => void;
}

const ArithmeticAdventure: React.FC<ArithmeticAdventureProps> = ({ 
  difficulty = 'medium',
  onGameComplete,
  onExit
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // Game state
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [currentProblem, setCurrentProblem] = useState<ArithmeticProblem | null>(null);
  const [problems, setProblems] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DIFFICULTY_SETTINGS[difficulty].timeLimit);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused' | 'gameOver'>('idle');
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerStatus, setAnswerStatus] = useState<'waiting' | 'correct' | 'incorrect'>('waiting');
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [settings, setSettings] = useState(DIFFICULTY_SETTINGS[difficulty]);
  
  const timerRef = useRef<number | null>(null);
  const feedbackTimeoutRef = useRef<number | null>(null);

  // Play sound function
  const playSound = (type: 'correct' | 'incorrect' | 'levelUp') => {
    if (!soundEnabled) return;
    
    switch(type) {
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
  };

  // Toggle sound
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  // Generate a random problem based on current difficulty and level
  const generateProblem = (): ArithmeticProblem => {
    // Adjust difficulty based on level
    const levelFactor = 1 + (level - 1) * 0.2;
    const minNumber = Math.max(1, Math.floor(settings.minNumber * levelFactor));
    const maxNumber = Math.floor(settings.maxNumber * levelFactor);
    
    // Select random operation from available operations
    const operationIndex = Math.floor(Math.random() * settings.operations.length);
    const operation = settings.operations[operationIndex];
    
    let num1 = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
    let num2 = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
    let correctAnswer = 0;
    
    // Ensure division has clean results
    if (operation === '/') {
      // Make sure num2 is not zero
      num2 = Math.max(1, num2);
      // Ensure clean division by calculating num1 as a multiple of num2
      num1 = num2 * (Math.floor(Math.random() * 10) + 1);
    }
    
    // Calculate correct answer
    switch (operation) {
      case '+':
        correctAnswer = num1 + num2;
        break;
      case '-':
        // Ensure result is positive for easier problems
        if (num1 < num2) {
          [num1, num2] = [num2, num1];
        }
        correctAnswer = num1 - num2;
        break;
      case '*':
        correctAnswer = num1 * num2;
        break;
      case '/':
        correctAnswer = num1 / num2;
        break;
    }
    
    // Generate answer options (including correct answer)
    const options = [correctAnswer];
    
    // Generate 3 incorrect options
    while (options.length < 4) {
      let wrongAnswer;
      const randomOffset = Math.floor(Math.random() * 10) + 1;
      
      // Create plausible wrong answers
      if (Math.random() < 0.5) {
        wrongAnswer = correctAnswer + randomOffset;
      } else {
        wrongAnswer = Math.max(0, correctAnswer - randomOffset);
      }
      
      // Add wrong answer if not already in options
      if (!options.includes(wrongAnswer)) {
        options.push(wrongAnswer);
      }
    }
    
    // Shuffle options
    const shuffledOptions = options.sort(() => Math.random() - 0.5);
    
    return {
      num1,
      num2,
      operation,
      correctAnswer,
      options: shuffledOptions,
    };
  };

  // Clear all timers
  const clearAllTimers = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (feedbackTimeoutRef.current) {
      window.clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = null;
    }
  };

  // Start game
  const startGame = () => {
    clearAllTimers();
    setScore(0);
    setLevel(1);
    setProblems(0);
    setTimeLeft(settings.timeLimit);
    setGameState('playing');
    setCurrentProblem(generateProblem());
    setFeedbackMessage(t('arithmeticAdventure.solve_problem', 'Solve the problem!'));
    startTimer();
  };

  // Start timer
  const startTimer = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    
    timerRef.current = window.setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          handleTimeUp();
          return 0;
        }
        return prevTime - 0.1;
      });
    }, 100);
  };

  // Handle time up
  const handleTimeUp = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    if (currentProblem) {
      playSound('incorrect');
      setAnswerStatus('incorrect');
      setSelectedAnswer(null);
      setFeedbackMessage(t('arithmeticAdventure.time_up', 'Time\'s up!'));
      
      // Move to next problem after feedback
      if (feedbackTimeoutRef.current) window.clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = window.setTimeout(() => {
        setAnswerStatus('waiting');
        setProblems(prev => prev + 1);
        
        // Check if game is over
        if (problems + 1 >= settings.problemsPerLevel * level) {
          setGameState('gameOver');
        } else {
          setCurrentProblem(generateProblem());
          setTimeLeft(settings.timeLimit);
          setFeedbackMessage(t('arithmeticAdventure.solve_problem', 'Solve the problem!'));
          startTimer();
        }
      }, 1500);
    }
  };

  // Handle answer selection
  const handleAnswerSelect = (answer: number) => {
    if (answerStatus !== 'waiting' || !currentProblem) return;
    
    setSelectedAnswer(answer);
    
    if (answer === currentProblem.correctAnswer) {
      // Correct answer
      playSound('correct');
      setAnswerStatus('correct');
      setFeedbackMessage(t('arithmeticAdventure.correct', 'Correct!'));
      setScore(prev => prev + Math.ceil(timeLeft * level * 10));
      
      // Move to next problem after feedback
      if (feedbackTimeoutRef.current) window.clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = window.setTimeout(() => {
        setAnswerStatus('waiting');
        setSelectedAnswer(null);
        
        const newProblemCount = problems + 1;
        setProblems(newProblemCount);
        
        // Check if level is complete
        if (newProblemCount >= settings.problemsPerLevel * level) {
          // Level up
          playSound('levelUp');
          setShowLevelUp(true);
          const newLevel = level + 1;
          setLevel(newLevel);
          setProblems(0);
          setFeedbackMessage(`${t('level_complete', 'Level Complete')}!`);
          
          // Show confetti for level up
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
          
          // Hide level up badge after some time
          setTimeout(() => {
            setShowLevelUp(false);
            setCurrentProblem(generateProblem());
            setTimeLeft(settings.timeLimit);
            setFeedbackMessage(t('arithmeticAdventure.solve_problem', 'Solve the problem!'));
            startTimer();
          }, 2000);
        } else {
          setCurrentProblem(generateProblem());
          setTimeLeft(settings.timeLimit);
          setFeedbackMessage(t('arithmeticAdventure.solve_problem', 'Solve the problem!'));
          startTimer();
        }
      }, 1000);
    } else {
      // Incorrect answer
      playSound('incorrect');
      setAnswerStatus('incorrect');
      setFeedbackMessage(t('arithmeticAdventure.incorrect', 'Incorrect!'));
      
      // Move to next problem after feedback
      if (feedbackTimeoutRef.current) window.clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = window.setTimeout(() => {
        setAnswerStatus('waiting');
        setSelectedAnswer(null);
        setProblems(prev => prev + 1);
        
        // Check if game is over
        if (problems + 1 >= settings.problemsPerLevel * level) {
          setGameState('gameOver');
        } else {
          setCurrentProblem(generateProblem());
          setTimeLeft(settings.timeLimit);
          setFeedbackMessage(t('arithmeticAdventure.solve_problem', 'Solve the problem!'));
          startTimer();
        }
      }, 1500);
    }
  };

  // Pause or resume game
  const togglePause = () => {
    if (gameState === 'playing') {
      setGameState('paused');
      setFeedbackMessage(t('paused', 'Paused'));
      if (timerRef.current) window.clearInterval(timerRef.current);
    } else if (gameState === 'paused') {
      setGameState('playing');
      setFeedbackMessage(t('arithmeticAdventure.solve_problem', 'Solve the problem!'));
      startTimer();
    }
  };

  // Exit game
  const exitGame = () => {
    clearAllTimers();
    if (onExit) {
      onExit();
    } else {
      navigate('/games');
    }
  };

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, []);

  // Effect to handle difficulty changes
  useEffect(() => {
    if (gameState === 'idle') {
      setSettings(DIFFICULTY_SETTINGS[difficulty]);
    }
  }, [difficulty, gameState]);

  // Calculate timer percentage
  const timerPercentage = (timeLeft / settings.timeLimit) * 100;

  // Render operation symbol
  const renderOperation = (op: Operation) => {
    switch (op) {
      case '+': return '+';
      case '-': return '−';
      case '*': return '×';
      case '/': return '÷';
    }
  };

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
            <div className="text-xl font-bold">{Math.ceil(timeLeft)}</div>
          </div>
          <div className="border-l border-gray-300 dark:border-gray-600 h-8 self-center mx-2"></div>
          <div className="flex-1">
            <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('problem', 'Problem')}</div>
            <div className="text-xl font-bold">{problems + 1}/{settings.problemsPerLevel * level}</div>
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
          disabled={gameState !== 'idle'}
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
          disabled={gameState !== 'idle'}
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
          disabled={gameState !== 'idle'}
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
          {soundEnabled ? <SoundOnIcon /> : <SoundOffIcon />}
        </button>
      </div>

      {/* Game Area - Centered */}
      <div className="flex flex-col items-center justify-center flex-grow w-full pt-20">
        {/* Feedback Message */}
        <div className="feedback-message mb-6 h-8 text-xl font-bold">
          {feedbackMessage}
        </div>
        
        {/* Level Up Badge */}
        {showLevelUp && (
          <div className="level-badge">
            {t('level', 'Level')} {level}
          </div>
        )}
        
        {/* Game Content */}
        {gameState === 'idle' && (
          <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4 text-indigo-600 dark:text-indigo-400">
              {t('arithmeticAdventure.title', 'Arithmetic Adventure')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6 text-center">
              {t('arithmeticAdventure.instructions', 'Solve math problems as quickly as possible. The faster you solve, the more points you earn!')}
            </p>
            <div className="flex flex-col gap-4 w-full max-w-xs">
              <div className="flex justify-between items-center">
                <span className="font-medium">{t('difficulty', 'Difficulty')}:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {settings === DIFFICULTY_SETTINGS.easy 
                    ? t('easy', 'Easy') 
                    : settings === DIFFICULTY_SETTINGS.medium 
                      ? t('medium', 'Medium') 
                      : t('hard', 'Hard')}
                </span>
              </div>
            </div>
          </div>
        )}
        
        {(gameState === 'playing' || gameState === 'paused') && currentProblem && (
          <div className="problem-container">
            {/* Problem display */}
            <div className="arithmetic-problem mb-8 text-3xl font-bold">
              <span className="number">{currentProblem.num1}</span>
              <span className="operation mx-2">{renderOperation(currentProblem.operation)}</span>
              <span className="number">{currentProblem.num2}</span>
              <span className="mx-2">=</span>
              <span className="question-mark">?</span>
            </div>
            
            {/* Answer options */}
            <div className="answers-grid grid grid-cols-2 gap-4 w-full max-w-md mb-8">
              {currentProblem.options.map((option, index) => (
                <button
                  key={index}
                  className={`answer-button p-4 rounded-lg text-xl font-bold transition-all
                    ${selectedAnswer === option && answerStatus === 'correct' ? 'bg-green-500 text-white' : ''}
                    ${selectedAnswer === option && answerStatus === 'incorrect' ? 'bg-red-500 text-white' : ''}
                    ${selectedAnswer === null ? 'bg-white dark:bg-gray-700 hover:bg-indigo-100 dark:hover:bg-gray-600' : ''}
                    ${selectedAnswer !== null && selectedAnswer !== option ? 'opacity-50' : ''}
                    ${option === currentProblem.correctAnswer && answerStatus === 'incorrect' ? 'bg-green-200 dark:bg-green-900' : ''}
                  `}
                  onClick={() => gameState === 'playing' && handleAnswerSelect(option)}
                  disabled={gameState === 'paused' || answerStatus !== 'waiting'}
                >
                  {option}
                </button>
              ))}
            </div>
            
            {/* Timer */}
            <div className="timer-bar w-full max-w-md">
              <div 
                className={`timer-progress h-2 rounded-full ${timeLeft < settings.timeLimit * 0.25 ? 'bg-red-500' : 'bg-indigo-500'}`}
                style={{ width: `${timerPercentage}%` }}
              ></div>
            </div>
            
            {/* Pause overlay */}
            {gameState === 'paused' && (
              <div className="game-over-overlay absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
                <div className="game-over-content bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full">
                  <h2 className="text-2xl font-bold mb-4 text-indigo-600 dark:text-indigo-400">
                    {t('paused', 'Game Paused')}
                  </h2>
                  <div className="flex flex-col gap-4 mt-6">
                    <button 
                      className="bg-indigo-600 text-white py-2 px-6 rounded-lg font-bold hover:bg-indigo-700 transition"
                      onClick={togglePause}
                    >
                      {t('resume', 'Resume')}
                    </button>
                    <button 
                      className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white py-2 px-6 rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                      onClick={exitGame}
                    >
                      {t('exit', 'Exit')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons - Bottom centered */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4">
        <button
          onClick={startGame}
          disabled={gameState !== 'idle' && gameState !== 'gameOver'}
          className="px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {gameState === 'gameOver' || gameState === 'idle' ? t('start_game', 'Start Game') : t('game_in_progress', 'Game in Progress')}
        </button>
        
        <button
          onClick={exitGame}
          className="px-6 py-3 rounded-lg bg-gray-500 text-white font-semibold hover:bg-gray-600 transition-colors"
        >
          {t('exit', 'Exit')}
        </button>
      </div>
      
      {/* Game Over Modal */}
      {gameState === 'gameOver' && (
        <div className="game-over-overlay absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="game-over-content bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">{t('game_over', 'Game Over')}</h2>
            <div className="space-y-3 mb-6 text-gray-700 dark:text-gray-300">
              <p>{t('final_score', 'Final Score')}: <span className="font-bold text-xl">{score}</span></p>
              <p>{t('level_reached', 'Level Reached')}: {level}</p>
              <p>{t('problems_solved', 'Problems Solved')}: {problems}</p>
            </div>
            <div className="flex space-x-3 justify-center">
              <button
                onClick={startGame}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                {t('play_again', 'Play Again')}
              </button>
              <button
                onClick={exitGame}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                {t('exit', 'Exit')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArithmeticAdventure;