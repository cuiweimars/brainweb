import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
// @ts-ignore
import confetti from 'canvas-confetti';
import './PatternRecognition.css';

// Pattern types
const PATTERN_TYPES = ['shapes', 'colors', 'numbers', 'mixed'];

// Shapes for patterns
const SHAPES = ['circle', 'square', 'triangle', 'diamond', 'hexagon'];

// Colors for patterns
const COLORS = ['red', 'blue', 'green', 'yellow', 'purple'];

// Difficulty settings
const DIFFICULTY_SETTINGS = {
  easy: {
    timeLimit: 30, // seconds
    patternLength: 4,
    optionsCount: 3,
    pointsPerCorrect: 10,
    timeBonusMultiplier: 0.5
  },
  medium: {
    timeLimit: 25, // seconds
    patternLength: 5,
    optionsCount: 4,
    pointsPerCorrect: 15,
    timeBonusMultiplier: 1
  },
  hard: {
    timeLimit: 20, // seconds
    patternLength: 6,
    optionsCount: 5,
    pointsPerCorrect: 20,
    timeBonusMultiplier: 1.5
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

// Represents a pattern element
interface PatternElement {
  type: string;  // 'shape', 'color', 'number', or 'mixed'
  value: string | number;
  color?: string;
  shape?: string;
}

// Pattern generation functions
const generatePattern = (type: string, length: number): PatternElement[] => {
  switch (type) {
    case 'shapes':
      return generateShapePattern(length);
    case 'colors':
      return generateColorPattern(length);
    case 'numbers':
      return generateNumberPattern(length);
    case 'mixed':
      return generateMixedPattern(length);
    default:
      return generateShapePattern(length);
  }
};

const generateShapePattern = (length: number): PatternElement[] => {
  // Simple alternating pattern for shapes
  const pattern: PatternElement[] = [];
  const shapeCount = Math.min(3, SHAPES.length);
  const selectedShapes = SHAPES.slice(0, shapeCount);
  
  for (let i = 0; i < length; i++) {
    pattern.push({
      type: 'shape',
      value: selectedShapes[i % shapeCount],
      color: COLORS[0] // Use a consistent color
    });
  }
  
  return pattern;
};

const generateColorPattern = (length: number): PatternElement[] => {
  // Simple alternating pattern for colors
  const pattern: PatternElement[] = [];
  const colorCount = Math.min(3, COLORS.length);
  const selectedColors = COLORS.slice(0, colorCount);
  
  for (let i = 0; i < length; i++) {
    pattern.push({
      type: 'color',
      value: selectedColors[i % colorCount],
      shape: SHAPES[0] // Use a consistent shape
    });
  }
  
  return pattern;
};

const generateNumberPattern = (length: number): PatternElement[] => {
  // Number patterns could be arithmetic sequences
  const pattern: PatternElement[] = [];
  const startNum = Math.floor(Math.random() * 5) + 1;
  const increment = Math.floor(Math.random() * 3) + 1;
  
  for (let i = 0; i < length; i++) {
    pattern.push({
      type: 'number',
      value: startNum + (i * increment)
    });
  }
  
  return pattern;
};

const generateMixedPattern = (length: number): PatternElement[] => {
  // Combine shapes and colors
  const pattern: PatternElement[] = [];
  const shapeCount = Math.min(2, SHAPES.length);
  const colorCount = Math.min(2, COLORS.length);
  const selectedShapes = SHAPES.slice(0, shapeCount);
  const selectedColors = COLORS.slice(0, colorCount);
  
  for (let i = 0; i < length; i++) {
    pattern.push({
      type: 'mixed',
      value: `${selectedShapes[i % shapeCount]}_${selectedColors[i % colorCount]}`,
      shape: selectedShapes[i % shapeCount],
      color: selectedColors[i % colorCount]
    });
  }
  
  return pattern;
};

// Generate options for the answer, including the correct one
const generateOptions = (pattern: PatternElement[], optionsCount: number): PatternElement[] => {
  const correctAnswer = getNextPatternElement(pattern);
  const options: PatternElement[] = [correctAnswer];
  
  // Generate incorrect options that are different from the correct answer
  while (options.length < optionsCount) {
    let incorrectOption: PatternElement;
    
    switch (pattern[0].type) {
      case 'shape':
        incorrectOption = {
          type: 'shape',
          value: SHAPES[Math.floor(Math.random() * SHAPES.length)],
          color: pattern[0].color
        };
        break;
      case 'color':
        incorrectOption = {
          type: 'color',
          value: COLORS[Math.floor(Math.random() * COLORS.length)],
          shape: pattern[0].shape
        };
        break;
      case 'number':
        // Generate a random number that's not the correct answer
        let randomNum;
        do {
          randomNum = Math.floor(Math.random() * 20) + 1;
        } while (randomNum === correctAnswer.value);
        
        incorrectOption = {
          type: 'number',
          value: randomNum
        };
        break;
      case 'mixed':
        const randomShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
        const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        incorrectOption = {
          type: 'mixed',
          value: `${randomShape}_${randomColor}`,
          shape: randomShape,
          color: randomColor
        };
        break;
      default:
        incorrectOption = correctAnswer; // Fallback, should not happen
    }
    
    // Check if this option is already in the list
    const isDuplicate = options.some(option => {
      if (option.type === 'number' && incorrectOption.type === 'number') {
        return option.value === incorrectOption.value;
      }
      if (option.type === 'shape' && incorrectOption.type === 'shape') {
        return option.value === incorrectOption.value;
      }
      if (option.type === 'color' && incorrectOption.type === 'color') {
        return option.value === incorrectOption.value;
      }
      if (option.type === 'mixed' && incorrectOption.type === 'mixed') {
        return option.value === incorrectOption.value;
      }
      return false;
    });
    
    if (!isDuplicate) {
      options.push(incorrectOption);
    }
  }
  
  // Shuffle the options
  return options.sort(() => Math.random() - 0.5);
};

// Determine the next element in the pattern
const getNextPatternElement = (pattern: PatternElement[]): PatternElement => {
  const patternType = pattern[0].type;
  
  switch (patternType) {
    case 'shape':
      const shapeIndex = SHAPES.indexOf(pattern[pattern.length - 1].value as string);
      const nextShapeIndex = (shapeIndex + 1) % SHAPES.length;
      return {
        type: 'shape',
        value: SHAPES[nextShapeIndex],
        color: pattern[0].color
      };
    case 'color':
      const colorIndex = COLORS.indexOf(pattern[pattern.length - 1].value as string);
      const nextColorIndex = (colorIndex + 1) % COLORS.length;
      return {
        type: 'color',
        value: COLORS[nextColorIndex],
        shape: pattern[0].shape
      };
    case 'number':
      // For number patterns, continue the arithmetic sequence
      const lastNumber = pattern[pattern.length - 1].value as number;
      const secondLastNumber = pattern[pattern.length - 2].value as number;
      const difference = lastNumber - secondLastNumber;
      return {
        type: 'number',
        value: lastNumber + difference
      };
    case 'mixed':
      // For mixed patterns, continue both shape and color patterns
      const lastElement = pattern[pattern.length - 1];
      const lastShapeIndex = SHAPES.indexOf(lastElement.shape as string);
      const lastColorIndex = COLORS.indexOf(lastElement.color as string);
      const nextMixedShapeIndex = (lastShapeIndex + 1) % SHAPES.length;
      const nextMixedColorIndex = (lastColorIndex + 1) % COLORS.length;
      const nextShape = SHAPES[nextMixedShapeIndex];
      const nextColor = COLORS[nextMixedColorIndex];
      return {
        type: 'mixed',
        value: `${nextShape}_${nextColor}`,
        shape: nextShape,
        color: nextColor
      };
    default:
      return pattern[0]; // Fallback
  }
};

interface PatternRecognitionProps {
  difficulty?: 'easy' | 'medium' | 'hard';
  onGameComplete?: (score: number, level: number, correctPatterns: number) => void;
  onExit?: () => void;
}

const PatternRecognition: React.FC<PatternRecognitionProps> = ({
  difficulty = 'medium',
  onGameComplete,
  onExit
}) => {
  const { t } = useTranslation();
  
  // State
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'levelComplete' | 'gameover'>('idle');
  const [patternType, setPatternType] = useState<string>(PATTERN_TYPES[0]);
  const [currentPattern, setCurrentPattern] = useState<PatternElement[]>([]);
  const [options, setOptions] = useState<PatternElement[]>([]);
  const [selectedOption, setSelectedOption] = useState<PatternElement | null>(null);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [correctPatterns, setCorrectPatterns] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [settings, setSettings] = useState(DIFFICULTY_SETTINGS[difficulty]);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState<'correct' | 'incorrect' | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [currentDifficulty, setCurrentDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  
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
  const playSound = useCallback((soundType: 'correct' | 'incorrect' | 'levelUp') => {
    if (!soundEnabled) return;
    
    switch(soundType) {
      case 'correct':
        soundEffects.correct();
        break;
      case 'incorrect':
        soundEffects.incorrect();
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
    clearAllTimers();
    setGameStatus('idle');
    setCurrentPattern([]);
    setOptions([]);
    setSelectedOption(null);
    setLevel(1);
    setScore(0);
    setCorrectPatterns(0);
    setTimeLeft(0);
    setFeedbackMessage('');
    setFeedbackType(null);
    setCurrentStreak(0);
    setBestStreak(0);
    setSettings(DIFFICULTY_SETTINGS[difficulty]);
  }, [clearAllTimers, difficulty]);
  
  // Reset game when difficulty changes
  useEffect(() => {
    resetGame();
  }, [difficulty, resetGame]);
  
  // Start game
  const startGame = useCallback(() => {
    resetGame();
    startNewPattern();
  }, [resetGame]);
  
  // Start a new pattern
  const startNewPattern = useCallback(() => {
    clearAllTimers();
    
    // Select a pattern type
    const randomTypeIndex = Math.floor(Math.random() * PATTERN_TYPES.length);
    const newPatternType = PATTERN_TYPES[randomTypeIndex];
    setPatternType(newPatternType);
    
    // Generate new pattern based on difficulty
    const newPattern = generatePattern(newPatternType, settings.patternLength);
    setCurrentPattern(newPattern);
    
    // Generate options for the answer
    const newOptions = generateOptions(newPattern, settings.optionsCount);
    setOptions(newOptions);
    
    // Reset state for new pattern
    setSelectedOption(null);
    setFeedbackMessage('');
    setFeedbackType(null);
    setTimeLeft(settings.timeLimit);
    setGameStatus('playing');
    
    // Start countdown timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current!);
          handleGameOver();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  }, [clearAllTimers, settings]);
  
  // Handle option selection
  const handleOptionSelect = useCallback((option: PatternElement) => {
    if (gameStatus !== 'playing' || selectedOption) return;
    
    setSelectedOption(option);
    
    // Determine if selection is correct
    const correctAnswer = getNextPatternElement(currentPattern);
    let isCorrect = false;
    
    switch (option.type) {
      case 'shape':
        isCorrect = option.value === correctAnswer.value;
        break;
      case 'color':
        isCorrect = option.value === correctAnswer.value;
        break;
      case 'number':
        isCorrect = option.value === correctAnswer.value;
        break;
      case 'mixed':
        isCorrect = option.value === correctAnswer.value;
        break;
    }
    
    if (isCorrect) {
      // Play success sound
      playSound('correct');
      
      // Update streak
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      if (newStreak > bestStreak) {
        setBestStreak(newStreak);
      }
      
      // Calculate points
      const basePoints = settings.pointsPerCorrect;
      const timeBonus = Math.round(timeLeft * settings.timeBonusMultiplier);
      const streakBonus = Math.floor(newStreak / 3) * 5;
      const totalPoints = basePoints + timeBonus + streakBonus;
      
      // Update score and stats
      setScore(prev => prev + totalPoints);
      setCorrectPatterns(prev => prev + 1);
      
      // Show feedback
      setFeedbackType('correct');
      setFeedbackMessage(`+${totalPoints} points!`);
      
      // Wait a bit then show next pattern
      feedbackTimerRef.current = setTimeout(() => {
        // Level up after every 5 correct patterns
        if (correctPatterns > 0 && (correctPatterns + 1) % 5 === 0) {
          levelUp();
        } else {
          startNewPattern();
        }
      }, 1500);
    } else {
      // Play error sound
      playSound('incorrect');
      
      // Reset streak
      setCurrentStreak(0);
      
      // Show feedback
      setFeedbackType('incorrect');
      setFeedbackMessage('Incorrect!');
      
      // Wait a bit then game over
      feedbackTimerRef.current = setTimeout(() => {
        handleGameOver();
      }, 1500);
    }
  }, [gameStatus, selectedOption, currentPattern, settings, playSound, currentStreak, bestStreak, correctPatterns, timeLeft]);
  
  // Level up
  const levelUp = useCallback(() => {
    clearAllTimers();
    
    // Increase level
    setLevel(prev => prev + 1);
    setShowLevelUp(true);
    
    // Play level up sound
    playSound('levelUp');
    
    // Show celebration effect
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    // Wait a bit then start new pattern
    feedbackTimerRef.current = setTimeout(() => {
      setShowLevelUp(false);
      startNewPattern();
    }, 2000);
  }, [clearAllTimers, playSound, startNewPattern]);
  
  // Handle game over
  const handleGameOver = useCallback(() => {
    clearAllTimers();
    setGameStatus('gameover');
    
    // Update best streak
    if (currentStreak > bestStreak) {
      setBestStreak(currentStreak);
    }
    
    // Call game complete callback
    if (onGameComplete) {
      onGameComplete(score, level, correctPatterns);
    }
    
    // Show end animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, [clearAllTimers, score, level, correctPatterns, onGameComplete, currentStreak, bestStreak]);
  
  // Toggle sound
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };
  
  // Calculate timer progress percentage
  const timerPercentage = (timeLeft / settings.timeLimit) * 100;
  
  // Render the pattern element
  const renderPatternElement = (element: PatternElement, index: number) => {
    const key = `pattern-${index}`;

    if (element.type === 'shape') {
      return (
        <div 
          key={key} 
          className={`pattern-shape ${element.value}`}
          style={{ backgroundColor: element.color || undefined }}
        >
        </div>
      );
    } else if (element.type === 'color') {
      return (
        <div 
          key={key} 
          className={`pattern-color circle`}
          style={{ backgroundColor: element.value as string }}
        >
        </div>
      );
    } else if (element.type === 'number') {
      return (
        <div 
          key={key} 
          className="pattern-number"
        >
          {element.value}
        </div>
      );
    } else if (element.type === 'mixed') {
      return (
        <div 
          key={key} 
          className={`pattern-mixed ${element.shape || 'circle'}`}
          style={{ backgroundColor: element.color || undefined }}
        >
          {typeof element.value === 'number' ? element.value : ''}
        </div>
      );
    }
    return null;
  };
  
  // Render option element
  const renderOptionElement = (element: PatternElement, index: number) => {
    const isSelected = selectedOption === element;
    const correctAnswer = currentPattern.length > 0 ? getNextPatternElement(currentPattern) : null;
    const isCorrect = correctAnswer && (
      (element.type === 'shape' && element.value === correctAnswer.value) ||
      (element.type === 'color' && element.value === correctAnswer.value) ||
      (element.type === 'number' && element.value === correctAnswer.value) ||
      (element.type === 'mixed' && element.value === correctAnswer.value)
    );
    
    let className = 'option-item';
    if (isSelected) {
      className += isCorrect ? ' correct' : ' incorrect';
    }
    
    return (
      <div 
        key={index}
        className={className}
        onClick={() => handleOptionSelect(element)}
      >
        {renderPatternElement(element, index)}
      </div>
    );
  };
  
  // Fix setDifficulty references
  const handleDifficultyChange = (newDifficulty: 'easy' | 'medium' | 'hard') => {
    if (gameStatus === 'idle') {
      setCurrentDifficulty(newDifficulty);
    }
  };
  
  return (
    <div className="pattern-container">
      {/* Header: Stats */}
      <div className="stats-container">
        <div className="stat-item">
          <div className="stat-label">Level</div>
          <div className="stat-value">{level}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Score</div>
          <div className="stat-value">{score}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Patterns</div>
          <div className="stat-value">{correctPatterns}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Streak</div>
          <div className="stat-value">{currentStreak}</div>
        </div>
      </div>
      
      {/* Level Up Badge */}
      {showLevelUp && (
        <div className="level-badge">
          Level {level}
        </div>
      )}
      
      {gameStatus === 'idle' ? (
        <div className="start-screen">
          <h2 className="pattern-title">{t('pattern_recognition.title')}</h2>
          <p className="instructions">{t('pattern_recognition.instructions')}</p>
          
          <div className="difficulty-selector">
            <button
              className={`difficulty-button ${currentDifficulty === 'easy' ? 'active' : ''}`}
              onClick={() => handleDifficultyChange('easy')}
            >
              {t('common.easy')}
            </button>
            <button
              className={`difficulty-button ${currentDifficulty === 'medium' ? 'active' : ''}`}
              onClick={() => handleDifficultyChange('medium')}
            >
              {t('common.medium')}
            </button>
            <button
              className={`difficulty-button ${currentDifficulty === 'hard' ? 'active' : ''}`}
              onClick={() => handleDifficultyChange('hard')}
            >
              {t('common.hard')}
            </button>
          </div>
          
          <div className="buttons-container">
            <button className="start-button" onClick={startGame}>
              Start Game
            </button>
            {onExit && (
              <button
                onClick={onExit}
                className="exit-button"
              >
                Exit
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Game Play Area */}
          <div className="pattern-display">
            <h3 className="pattern-title">What comes next in this pattern?</h3>
            
            {/* Current Pattern */}
            <div className="pattern-sequence">
              {currentPattern.map((element, index) => renderPatternElement(element, index))}
              <div className="pattern-question-mark">?</div>
            </div>
            
            {/* Feedback Message */}
            {feedbackMessage && (
              <div className={`feedback-message ${feedbackType}`}>
                {feedbackMessage}
              </div>
            )}
            
            {/* Options */}
            <div className="options-grid">
              {options.map((option, index) => renderOptionElement(option, index))}
            </div>
            
            {/* Timer Bar */}
            {gameStatus === 'playing' && (
              <div className="timer-bar">
                <div 
                  className={`timer-progress ${timeLeft < settings.timeLimit * 0.2 ? 'timer-critical' : ''}`}
                  style={{ width: `${timerPercentage}%` }}
                />
              </div>
            )}
          </div>
        </>
      )}
      
      {/* Game Over Overlay */}
      {gameStatus === 'gameover' && (
        <div className="game-over-overlay">
          <div className="game-over-content">
            <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">
              Game Over
            </h2>
            <div className="space-y-3 mb-6 text-gray-700 dark:text-gray-300">
              <p>Final Score: <span className="font-bold text-xl">{score}</span></p>
              <p>Level Reached: {level}</p>
              <p>Patterns Solved: {correctPatterns}</p>
              <p>Highest Streak: {bestStreak}</p>
            </div>
            <div className="flex space-x-3 justify-center">
              <button
                onClick={startGame}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Play Again
              </button>
              {onExit && (
                <button
                  onClick={onExit}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Exit
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Sound toggle button */}
      <button 
        onClick={toggleSound}
        className="absolute top-4 right-4 p-2 rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
        aria-label={soundEnabled ? "Mute Sound" : "Enable Sound"}
      >
        {soundEnabled ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        )}
      </button>
      
      {/* Remove the Exit Button from the bottom right since we now have it in the start screen */}
      {onExit && gameStatus !== 'idle' && (
        <button
          onClick={onExit}
          className="absolute bottom-4 right-4 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
        >
          Exit
        </button>
      )}
    </div>
  );
};

export default PatternRecognition; 