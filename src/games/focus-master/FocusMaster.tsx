import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
// @ts-ignore
import confetti from 'canvas-confetti';
import './FocusMaster.css';

// Difficulty settings
const DIFFICULTY_SETTINGS = {
  easy: {
    targetCount: 5,
    spawnRate: 1500,
    targetLifespan: 4000,
    roundDuration: 60,
    distractionRatio: 0.3,
    targetSize: { min: 60, max: 80 },
    targetSpeed: { min: 0.5, max: 1.5 }
  },
  medium: {
    targetCount: 10,
    spawnRate: 1200,
    targetLifespan: 3000,
    roundDuration: 45,
    distractionRatio: 0.5,
    targetSize: { min: 50, max: 70 },
    targetSpeed: { min: 1, max: 2 }
  },
  hard: {
    targetCount: 15,
    spawnRate: 1000,
    targetLifespan: 2500,
    roundDuration: 30,
    distractionRatio: 0.7,
    targetSize: { min: 40, max: 60 },
    targetSpeed: { min: 1.5, max: 3 }
  }
};

// Sound effects
const soundEffects = {
  targetHit: () => {
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
        oscillator.stop();
        audioContext.close();
      }, 200);
    } catch (e) {
      console.log('Audio not supported');
    }
  },
  targetMiss: () => {
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
        }, 200);
      }, 100);
    } catch (e) {
      console.log('Audio not supported');
    }
  },
  gameOver: () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      gainNode.gain.value = 0.1;
      
      oscillator.frequency.value = 300;
      oscillator.start();
      
      setTimeout(() => {
        oscillator.frequency.value = 250;
        setTimeout(() => {
          oscillator.frequency.value = 200;
          setTimeout(() => {
            oscillator.stop();
            audioContext.close();
          }, 200);
        }, 200);
      }, 200);
    } catch (e) {
      console.log('Audio not supported');
    }
  },
  comboSound: (combo: number) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      gainNode.gain.value = 0.1;
      
      // Higher pitch for higher combos
      oscillator.frequency.value = 400 + (combo * 50);
      oscillator.start();
      
      setTimeout(() => {
        oscillator.frequency.value = 450 + (combo * 50);
        setTimeout(() => {
          oscillator.stop();
          audioContext.close();
        }, 100);
      }, 100);
    } catch (e) {
      console.log('Audio not supported');
    }
  }
};

// Target interface
interface Target {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  isDistraction: boolean;
  createdAt: number;
  lifespan: number;
}

interface FocusMasterProps {
  difficulty?: 'easy' | 'medium' | 'hard';
  onGameComplete?: (score: number, accuracy: number, maxFocusTime: number) => void;
  onExit?: () => void;
}

const FocusMaster: React.FC<FocusMasterProps> = ({
  difficulty = 'medium',
  onGameComplete,
  onExit
}) => {
  const { t } = useTranslation();
  
  // State
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [targets, setTargets] = useState<Target[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [settings, setSettings] = useState(DIFFICULTY_SETTINGS[difficulty]);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [focusTime, setFocusTime] = useState(0);
  const [maxFocusTime, setMaxFocusTime] = useState(0);
  const [showCombo, setShowCombo] = useState<{value: number, x: number, y: number} | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastTargetId, setLastTargetId] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  
  // Refs
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const spawnTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const comboTimerRef = useRef<NodeJS.Timeout | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const lastHitTimeRef = useRef<number>(0);
  const focusTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Clear all timers
  const clearAllTimers = useCallback(() => {
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
      gameTimerRef.current = null;
    }
    if (spawnTimerRef.current) {
      clearTimeout(spawnTimerRef.current);
      spawnTimerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (comboTimerRef.current) {
      clearTimeout(comboTimerRef.current);
      comboTimerRef.current = null;
    }
    if (focusTimerRef.current) {
      clearInterval(focusTimerRef.current);
      focusTimerRef.current = null;
    }
  }, []);
  
  // Play sound
  const playSound = useCallback((soundType: string, comboValue?: number) => {
    if (!soundEnabled) return;
    
    switch(soundType) {
      case 'hit':
        soundEffects.targetHit();
        break;
      case 'miss':
        soundEffects.targetMiss();
        break;
      case 'gameover':
        soundEffects.gameOver();
        break;
      case 'combo':
        soundEffects.comboSound(comboValue || 1);
        break;
      default:
        break;
    }
  }, [soundEnabled]);
  
  // Reset game
  const resetGame = useCallback(() => {
    clearAllTimers();
    setGameStatus('idle');
    setTargets([]);
    setScore(0);
    setTimeLeft(0);
    setSettings(DIFFICULTY_SETTINGS[difficulty]);
    setHits(0);
    setMisses(0);
    setCombo(0);
    setMaxCombo(0);
    setFocusTime(0);
    setMaxFocusTime(0);
    setShowCombo(null);
    setLastTargetId(0);
    setFeedbackMessage(t('ready_to_start', 'Ready to focus?'));
    lastHitTimeRef.current = 0;
  }, [clearAllTimers, difficulty, t]);
  
  // Reset game when difficulty changes
  useEffect(() => {
    resetGame();
  }, [difficulty, resetGame]);
  
  // Generate random target position
  const getRandomPosition = useCallback(() => {
    if (!gameAreaRef.current) return { x: 50, y: 50 };
    
    const areaWidth = gameAreaRef.current.clientWidth;
    const areaHeight = gameAreaRef.current.clientHeight;
    
    // Keep targets away from edges
    const padding = 50;
    const x = Math.random() * (areaWidth - 2 * padding) + padding;
    const y = Math.random() * (areaHeight - 2 * padding) + padding;
    
    return { x, y };
  }, []);
  
  // Generate random target size
  const getRandomSize = useCallback(() => {
    const { min, max } = settings.targetSize;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }, [settings.targetSize]);
  
  // Generate random target speed
  const getRandomSpeed = useCallback(() => {
    const { min, max } = settings.targetSpeed;
    const speed = Math.random() * (max - min) + min;
    const angle = Math.random() * Math.PI * 2;
    
    return {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed
    };
  }, [settings.targetSpeed]);
  
  // Spawn a new target
  const spawnTarget = useCallback((forceSpawn = false) => {
    console.log('Attempting to spawn target, game status:', gameStatus, 'force?', forceSpawn);
    
    if (!forceSpawn && gameStatus !== 'playing') {
      console.log('Not spawning target because game status is not playing:', gameStatus);
      return;
    }
    
    // 清除现有的生成定时器
    if (spawnTimerRef.current) {
      clearTimeout(spawnTimerRef.current);
      spawnTimerRef.current = null;
    }
    
    const { x, y } = getRandomPosition();
    const size = getRandomSize();
    const { x: speedX, y: speedY } = getRandomSpeed();
    const isDistraction = Math.random() < settings.distractionRatio;
    
    const newTarget: Target = {
      id: lastTargetId + 1,
      x,
      y,
      size,
      speedX,
      speedY,
      isDistraction,
      createdAt: Date.now(),
      lifespan: settings.targetLifespan
    };
    
    console.log('Spawning new target:', newTarget);
    
    setLastTargetId(prev => prev + 1);
    setTargets(prev => {
      const updatedTargets = [...prev, newTarget];
      console.log('Current targets count:', updatedTargets.length);
      return updatedTargets;
    });
    
    // Schedule next target spawn - 使用forceSpawn确保递归调用也生成目标
    console.log('Scheduling next target spawn in', settings.spawnRate, 'ms');
    spawnTimerRef.current = setTimeout(() => {
      console.log('Timer triggered for next target');
      spawnTarget(forceSpawn);
    }, settings.spawnRate);
  }, [gameStatus, getRandomPosition, getRandomSize, getRandomSpeed, lastTargetId, settings]);
  
  // Update targets positions
  const updateTargets = useCallback(() => {
    if (gameStatus !== 'playing') {
      console.log('Not updating targets because game is not playing');
      return;
    }
    
    setTargets(prevTargets => {
      // 记录当前目标数量
      if (prevTargets.length > 0) {
        console.log('Updating positions for', prevTargets.length, 'targets');
      }
      
      return prevTargets.map(target => {
        // Check if target is expired
        const elapsed = Date.now() - target.createdAt;
        if (elapsed > target.lifespan) {
          // Count a miss if a focus target expired
          if (!target.isDistraction) {
            setMisses(prev => prev + 1);
            setCombo(0); // Reset combo
            playSound('miss');
          }
          return target; // Will be filtered out below
        }
        
        // Update position based on speed
        let newX = target.x + target.speedX;
        let newY = target.y + target.speedY;
        let newSpeedX = target.speedX;
        let newSpeedY = target.speedY;
        
        // Bounce off walls if necessary
        if (!gameAreaRef.current) return target;
        
        const areaWidth = gameAreaRef.current.clientWidth;
        const areaHeight = gameAreaRef.current.clientHeight;
        
        // Log area dimensions for debugging
        if (target.id === prevTargets[0]?.id) {
          console.log('Game area dimensions:', areaWidth, 'x', areaHeight);
        }
        
        if (newX < target.size / 2 || newX > areaWidth - target.size / 2) {
          newSpeedX = -target.speedX;
          newX = newX < target.size / 2 ? target.size / 2 : areaWidth - target.size / 2;
        }
        
        if (newY < target.size / 2 || newY > areaHeight - target.size / 2) {
          newSpeedY = -target.speedY;
          newY = newY < target.size / 2 ? target.size / 2 : areaHeight - target.size / 2;
        }
        
        return {
          ...target,
          x: newX,
          y: newY,
          speedX: newSpeedX,
          speedY: newSpeedY
        };
      }).filter(target => {
        const elapsed = Date.now() - target.createdAt;
        return elapsed <= target.lifespan;
      });
    });
    
    // Continue animation
    animationFrameRef.current = requestAnimationFrame(updateTargets);
  }, [gameStatus, playSound]);
  
  // Handle game over
  const handleGameOver = useCallback(() => {
    clearAllTimers();
    setGameStatus('gameover');
    
    // Play game over sound
    playSound('gameover');
    
    // Calculate final accuracy
    const totalAttempts = hits + misses;
    const accuracy = totalAttempts > 0 ? Math.round((hits / totalAttempts) * 100) : 0;
    
    setFeedbackMessage(t('game_over', 'Game Over'));
    
    if (onGameComplete) {
      onGameComplete(score, accuracy, maxFocusTime);
    }
    
    // Show end animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, [clearAllTimers, hits, maxFocusTime, misses, onGameComplete, playSound, score, t]);
  
  // Start game
  const startGame = useCallback(() => {
    console.log('Starting game with settings:', settings);
    resetGame();
    
    // Force immediate selection of target
    setTimeout(() => {
      console.log('Setting game status to playing');
      // 使用一个局部变量保存游戏状态，避免状态更新延迟
      const newGameStatus = 'playing';
      setGameStatus(newGameStatus);
      setTimeLeft(settings.roundDuration);
      setFeedbackMessage(t('focus_on_purple', 'Focus on the purple targets!'));
      
      // Start game timer
      gameTimerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          console.log('Time left:', prev);
          if (prev <= 1) {
            handleGameOver();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Start animation loop
      console.log('Starting animation loop');
      animationFrameRef.current = requestAnimationFrame(updateTargets);
      
      // Start focus time tracking
      lastHitTimeRef.current = Date.now();
      focusTimerRef.current = setInterval(() => {
        const currentTime = Date.now();
        const sinceLastHit = currentTime - lastHitTimeRef.current;
        
        // If player is consistently hitting targets (within 2 seconds),
        // consider them "in focus"
        if (sinceLastHit < 2000) {
          setFocusTime(prev => {
            const newFocusTime = prev + 0.1; // 100ms increment
            if (newFocusTime > maxFocusTime) {
              setMaxFocusTime(newFocusTime);
            }
            return newFocusTime;
          });
        }
      }, 100);
      
      // Force immediate target spawn, with a force flag to bypass game state check
      setTimeout(() => {
        console.log('Forcing initial target spawn');
        
        // 使用true作为强制参数，并且立即生成多个目标
        spawnTarget(true); // Pass true to force spawn regardless of game status
        
        // 确保生成足够数量的初始目标
        const initialTargets = Math.min(5, settings.targetCount);
        console.log('Creating', initialTargets, 'initial targets');
        for(let i = 1; i < initialTargets; i++) {
          setTimeout(() => spawnTarget(true), i * 300);
        }
      }, 200);
    }, 100);
  }, [handleGameOver, resetGame, settings, spawnTarget, t, updateTargets]);
  
  // Handle target click
  const handleTargetClick = useCallback((target: Target, e: React.MouseEvent) => {
    // Update targets by removing the clicked one
    setTargets(prev => prev.filter(t => t.id !== target.id));
    
    // Update last hit time for focus tracking
    lastHitTimeRef.current = Date.now();
    
    if (!target.isDistraction) {
      // Hit a focus target
      playSound('hit');
      
      // Increase combo
      const newCombo = combo + 1;
      setCombo(newCombo);
      
      // Update max combo
      if (newCombo > maxCombo) {
        setMaxCombo(newCombo);
      }
      
      // Calculate score - base points + combo bonus + size bonus (smaller = more points)
      const basePoints = 10;
      const comboBonus = Math.floor(newCombo / 3) * 5;
      const sizeBonus = Math.max(0, Math.floor((100 - target.size) / 5));
      const pointsEarned = basePoints + comboBonus + sizeBonus;
      
      setScore(prev => prev + pointsEarned);
      setHits(prev => prev + 1);
      
      // Show combo indicator if combo >= 3
      if (newCombo >= 3) {
        setShowCombo({
          value: newCombo,
          x: e.clientX - gameAreaRef.current!.getBoundingClientRect().left,
          y: e.clientY - gameAreaRef.current!.getBoundingClientRect().top
        });
        
        playSound('combo', newCombo);
        
        // Clear previous combo timer if exists
        if (comboTimerRef.current) {
          clearTimeout(comboTimerRef.current);
        }
        
        // Hide combo indicator after animation
        comboTimerRef.current = setTimeout(() => {
          setShowCombo(null);
        }, 1000);
      }
    } else {
      // Hit a distraction
      playSound('miss');
      setCombo(0); // Reset combo
      setMisses(prev => prev + 1);
    }
  }, [combo, maxCombo, playSound]);
  
  // Toggle sound setting
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };
  
  // Clean up on component unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);
  
  // Calculate accuracy percentage
  const totalAttempts = hits + misses;
  const accuracy = totalAttempts > 0 ? Math.round((hits / totalAttempts) * 100) : 0;
  
  // Calculate timer percentage
  const timerPercentage = (timeLeft / settings.roundDuration) * 100;
  
  // Format focus time for display
  const formattedFocusTime = maxFocusTime.toFixed(1);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] p-4 pb-24 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg shadow-xl relative">
      
      {/* Header: Stats - Top center */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-gray-200 dark:bg-gray-800 rounded-lg shadow px-4 py-2 z-10">
        <div className="flex justify-around text-center">
          <div className="flex-1">
            <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('score', 'Score')}</div>
            <div className="text-xl font-bold">{score}</div>
          </div>
          <div className="border-l border-gray-300 dark:border-gray-600 h-8 self-center mx-2"></div>
          <div className="flex-1">
            <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('accuracy', 'Accuracy')}</div>
            <div className="text-xl font-bold">{accuracy}%</div>
          </div>
          <div className="border-l border-gray-300 dark:border-gray-600 h-8 self-center mx-2"></div>
          <div className="flex-1">
            <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('combo', 'Combo')}</div>
            <div className="text-xl font-bold">{combo}</div>
          </div>
          <div className="border-l border-gray-300 dark:border-gray-600 h-8 self-center mx-2"></div>
          <div className="flex-1">
            <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('time', 'Time')}</div>
            <div className="text-xl font-bold">{timeLeft}s</div>
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
      <div className="flex flex-col items-center justify-center flex-grow w-full pt-20 pb-16"> {/* Added padding-top and padding-bottom */}
        <div className="mb-6 h-8 text-center">
          {feedbackMessage}
        </div>
        
        {/* Target Area */}
        <div 
          ref={gameAreaRef} 
          className="game-area"
          style={{
            border: '3px solid rgba(99, 102, 241, 0.8)',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {targets.map(target => (
            <div
              key={target.id}
              className={`target ${target.isDistraction ? 'distraction' : 'focus-target'}`}
              style={{
                left: `${target.x}px`,
                top: `${target.y}px`,
                width: `${target.size}px`,
                height: `${target.size}px`,
                position: 'absolute',
                transform: 'translate(-50%, -50%)',
                borderRadius: '50%',
                cursor: 'pointer',
                backgroundColor: target.isDistraction ? 'rgba(255, 0, 0, 0.8)' : '#4C1D95',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                zIndex: 5
              }}
              onClick={(e) => handleTargetClick(target, e)}
            ></div>
          ))}
          
          {/* Combo indicator */}
          {showCombo && (
            <div 
              className="combo-indicator"
              style={{
                left: `${showCombo.x}px`,
                top: `${showCombo.y}px`
              }}
            >
              x{showCombo.value}
            </div>
          )}
          
          {/* Target counter - helpful for debugging */}
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
            {targets.length} targets
          </div>
        </div>
        
        {/* Timer Bar */}
        {gameStatus === 'playing' && (
          <div className="timer-bar">
            <div 
              className={`timer-progress ${timeLeft <= 10 ? 'timer-critical' : ''}`} 
              style={{ width: `${timerPercentage}%` }}
            />
          </div>
        )}
      </div>

      {/* Action Buttons - Bottom centered */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-4">
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
              <p>{t('accuracy', 'Accuracy')}: {accuracy}%</p>
              <p>{t('targets_hit', 'Targets Hit')}: {hits}</p>
              <p>{t('max_combo', 'Max Combo')}: {maxCombo}</p>
              <p>{t('max_focus_time', 'Max Focus Time')}: {formattedFocusTime}s</p>
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

export default FocusMaster; 