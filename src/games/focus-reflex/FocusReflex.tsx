import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
// @ts-ignore
import confetti from 'canvas-confetti';
import './FocusReflex.css';

// Target shapes
const TARGET_SHAPES = ['circle', 'square', 'triangle'];

// Target colors
const TARGET_COLORS = ['red', 'green', 'blue', 'yellow', 'purple'];

// Difficulty settings
const DIFFICULTY_SETTINGS = {
  easy: {
    targetCount: 5,
    spawnRate: 2000,
    targetLifespan: 3000,
    roundDuration: 60,
    minSpeed: 0.5,
    maxSpeed: 1.5,
    distractionRatio: 0.3
  },
  medium: {
    targetCount: 8,
    spawnRate: 1500,
    targetLifespan: 2500,
    roundDuration: 45,
    minSpeed: 0.8,
    maxSpeed: 2,
    distractionRatio: 0.5
  },
  hard: {
    targetCount: 12,
    spawnRate: 1000,
    targetLifespan: 2000,
    roundDuration: 30,
    minSpeed: 1,
    maxSpeed: 2.5,
    distractionRatio: 0.7
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
  color: string;
  shape: string;
  isCorrectTarget: boolean;
  createdAt: number;
  lifespan: number;
}

interface FocusReflexProps {
  difficulty?: 'easy' | 'medium' | 'hard';
  onGameComplete?: (score: number, accuracy: number, maxCombo: number) => void;
  onExit?: () => void;
}

const FocusReflex: React.FC<FocusReflexProps> = ({
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
  const [targetShape, setTargetShape] = useState<string>('');
  const [targetColor, setTargetColor] = useState<string>('');
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [showCombo, setShowCombo] = useState<{value: number, x: number, y: number} | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastTargetId, setLastTargetId] = useState(0);
  
  // Refs
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const spawnTimerRef = useRef<NodeJS.Timeout | null>(null);
  const comboTimerRef = useRef<NodeJS.Timeout | null>(null);
  const targetAreaRef = useRef<HTMLDivElement>(null);
  
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
    if (comboTimerRef.current) {
      clearTimeout(comboTimerRef.current);
      comboTimerRef.current = null;
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
    console.log('Resetting game');
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
    setShowCombo(null);
    setLastTargetId(0);
    
    // Force selection of a new target
    console.log('Selecting new target on reset');
    const shape = TARGET_SHAPES[Math.floor(Math.random() * TARGET_SHAPES.length)];
    const color = TARGET_COLORS[Math.floor(Math.random() * TARGET_COLORS.length)];
    console.log('Selected new target:', shape, color);
    setTargetShape(shape);
    setTargetColor(color);
  }, [clearAllTimers, difficulty]);
  
  // Reset game when difficulty changes
  useEffect(() => {
    resetGame();
  }, [difficulty, resetGame]);
  
  // Monitor target area ref and window resize
  useEffect(() => {
    const handleResize = () => {
      console.log('Window resized - target area dimensions may have changed');
      if (targetAreaRef.current) {
        console.log('Target area dimensions after resize:', 
          targetAreaRef.current.clientWidth, 
          targetAreaRef.current.clientHeight);
      }
    };
    
    // 初始化时记录目标区域尺寸
    if (targetAreaRef.current) {
      console.log('Initial target area dimensions:', 
        targetAreaRef.current.clientWidth, 
        targetAreaRef.current.clientHeight);
    } else {
      console.log('Target area ref not available on initial render');
    }
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Select a new target shape and color
  const selectNewTarget = useCallback(() => {
    const shape = TARGET_SHAPES[Math.floor(Math.random() * TARGET_SHAPES.length)];
    const color = TARGET_COLORS[Math.floor(Math.random() * TARGET_COLORS.length)];
    console.log('Selecting new target:', shape, color);
    setTargetShape(shape);
    setTargetColor(color);
  }, []);
  
  // Generate random target position
  const getRandomPosition = useCallback(() => {
    if (!targetAreaRef.current) {
      console.log('Target area ref is null, using default position');
      return { x: 50, y: 50 };
    }
    
    const areaWidth = targetAreaRef.current.clientWidth;
    const areaHeight = targetAreaRef.current.clientHeight;
    
    console.log('Target area dimensions:', areaWidth, areaHeight);
    
    // Keep targets away from edges
    const padding = 40;
    const x = Math.random() * (areaWidth - 2 * padding) + padding;
    const y = Math.random() * (areaHeight - 2 * padding) + padding;
    
    console.log('Generated position:', x, y);
    return { x, y };
  }, []);
  
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
    const isDistraction = Math.random() < settings.distractionRatio;
    
    let color, shape;
    if (isDistraction) {
      // Create a distraction that differs in either shape or color
      if (Math.random() < 0.5) {
        // Different color, same shape
        do {
          color = TARGET_COLORS[Math.floor(Math.random() * TARGET_COLORS.length)];
        } while (color === targetColor);
        shape = targetShape;
      } else {
        // Different shape, same color
        do {
          shape = TARGET_SHAPES[Math.floor(Math.random() * TARGET_SHAPES.length)];
        } while (shape === targetShape);
        color = targetColor;
      }
    } else {
      // Create a correct target
      color = targetColor;
      shape = targetShape;
    }
    
    const newTarget: Target = {
      id: lastTargetId + 1,
      x,
      y,
      color,
      shape,
      isCorrectTarget: !isDistraction,
      createdAt: Date.now(),
      lifespan: settings.targetLifespan
    };
    
    console.log('Spawning new target:', newTarget);
    
    setLastTargetId(prev => prev + 1);
    setTargets(prev => {
      const updatedTargets = [...prev, newTarget];
      console.log('Updated targets:', updatedTargets.length, 'targets');
      return updatedTargets;
    });
    
    // 确保只有在游戏进行中才设置下一个生成定时器
    if (gameStatus === 'playing' || forceSpawn) {
      console.log('Scheduling next target spawn in', settings.spawnRate, 'ms');
      // Schedule next target spawn - 使用forceScan确保递归调用也能生成目标
      spawnTimerRef.current = setTimeout(() => {
        console.log('Timer triggered for next target');
        spawnTarget(forceSpawn);
      }, settings.spawnRate);
    }
  }, [gameStatus, getRandomPosition, lastTargetId, settings, targetColor, targetShape]);
  
  // Handle game over
  const handleGameOver = useCallback(() => {
    clearAllTimers();
    setGameStatus('gameover');
    
    // Play game over sound
    playSound('gameover');
    
    // Calculate final accuracy
    const totalAttempts = hits + misses;
    const accuracy = totalAttempts > 0 ? Math.round((hits / totalAttempts) * 100) : 0;
    
    if (onGameComplete) {
      onGameComplete(score, accuracy, maxCombo);
    }
    
    // Show end animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, [clearAllTimers, hits, maxCombo, misses, onGameComplete, playSound, score]);
  
  // Start game
  const startGame = useCallback(() => {
    console.log('Starting game with settings:', settings);
    resetGame();
    
    // Force immediate selection of target
    setTimeout(() => {
      selectNewTarget();
      
      // 使用一个局部变量保存游戏状态，避免状态更新延迟
      const newGameStatus = 'playing';
      setGameStatus(newGameStatus);
      setTimeLeft(settings.roundDuration);
      
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
        
        // Clean up expired targets
        setTargets(prev => 
          prev.filter(target => {
            const elapsed = Date.now() - target.createdAt;
            if (elapsed > target.lifespan) {
              // If the target is correct and it expired, count as a miss
              if (target.isCorrectTarget) {
                setMisses(prevMisses => prevMisses + 1);
                setCombo(0); // Reset combo on miss
                playSound('miss');
                console.log('Target expired:', target);
              }
              return false;
            }
            return true;
          })
        );
      }, 1000);
      
      // Force immediate target spawn, with a force flag to bypass game state check
      setTimeout(() => {
        console.log('Forcing initial target spawn');
        console.log('Current target:', targetShape, targetColor);
        
        // 使用true作为强制参数，并且立即生成多个目标
        spawnTarget(true); // Pass true to force spawn regardless of game status
        
        // 确保生成足够数量的初始目标
        const initialTargets = Math.min(3, settings.targetCount);
        for(let i = 1; i < initialTargets; i++) {
          setTimeout(() => spawnTarget(true), i * 300);
        }
      }, 200);
    }, 100);
  }, [handleGameOver, playSound, resetGame, selectNewTarget, settings, spawnTarget]);
  
  // Handle target click
  const handleTargetClick = useCallback((target: Target, e: React.MouseEvent) => {
    // Update targets by removing the clicked one
    setTargets(prev => prev.filter(t => t.id !== target.id));
    
    if (target.isCorrectTarget) {
      // Hit a correct target
      playSound('hit');
      
      // Increase combo
      const newCombo = combo + 1;
      setCombo(newCombo);
      
      // Update max combo
      if (newCombo > maxCombo) {
        setMaxCombo(newCombo);
      }
      
      // Calculate score - base points + combo bonus
      const basePoints = 10;
      const comboBonus = Math.floor(newCombo / 3) * 5;
      const pointsEarned = basePoints + comboBonus;
      
      setScore(prev => prev + pointsEarned);
      setHits(prev => prev + 1);
      
      // Show combo indicator if combo >= 3
      if (newCombo >= 3) {
        setShowCombo({
          value: newCombo,
          x: e.clientX - targetAreaRef.current!.getBoundingClientRect().left,
          y: e.clientY - targetAreaRef.current!.getBoundingClientRect().top
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
  
  // 添加对生成目标数量的监控
  useEffect(() => {
    console.log('Current targets count:', targets.length);
    // 如果在游戏中但没有任何目标，尝试生成新目标
    if (gameStatus === 'playing' && targets.length === 0 && !spawnTimerRef.current) {
      console.log('No targets during gameplay, forcing spawn');
      spawnTarget(true);
    }
  }, [gameStatus, spawnTarget, targets.length]);
  
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
      <div className="flex flex-col items-center justify-center flex-grow w-full pt-20 pb-16"> {/* Added padding-bottom */}
        {/* Current target indicator */}
        {gameStatus === 'playing' && (
          <div className="target-indicator mb-4">
            <div 
              className={`target-indicator-icon target-${targetColor}`}
              style={{
                borderRadius: targetShape === 'circle' ? '50%' : targetShape === 'square' ? '4px' : '0',
                ...(targetShape === 'triangle' ? {
                  width: 0,
                  height: 0,
                  backgroundColor: 'transparent',
                  borderLeft: '12px solid transparent',
                  borderRight: '12px solid transparent',
                  borderBottom: '20px solid'
                } : {})
              }}
            ></div>
            {t('click_targets', 'Click all targets that match this')}
          </div>
        )}
        
        {/* Target Area */}
        <div 
          ref={targetAreaRef} 
          className="target-area"
          style={{
            border: '2px solid rgba(99, 102, 241, 0.6)',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            minHeight: '370px', // 减小高度，留出更多底部空间
            maxHeight: 'calc(100vh - 280px)', // 设置最大高度，适应不同屏幕
            width: '100%',
            position: 'relative',
            overflow: 'hidden',
            zIndex: 1,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px'
          }}
        >
          {targets.map(target => (
            <div
              key={target.id}
              className={`target target-${target.color} target-shape-${target.shape}`}
              style={{
                left: `${target.x}px`,
                top: `${target.y}px`,
                zIndex: 5,
                position: 'absolute',
                width: target.shape === 'triangle' ? '0' : '70px',
                height: target.shape === 'triangle' ? '0' : '70px',
                transform: 'translate(-50%, -50%)',
                backgroundColor: target.shape === 'triangle' ? 'transparent' : 
                                 target.color === 'red' ? '#EF4444' : 
                                 target.color === 'green' ? '#10B981' :
                                 target.color === 'blue' ? '#3B82F6' :
                                 target.color === 'yellow' ? '#F59E0B' : '#8B5CF6',
                borderRadius: target.shape === 'circle' ? '50%' : 
                             target.shape === 'square' ? '10px' : '0',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                cursor: 'pointer',
                transition: 'transform 0.05s ease-out',
                ...(target.shape === 'triangle' ? {
                  borderLeft: '35px solid transparent',
                  borderRight: '35px solid transparent',
                  borderBottom: target.color === 'red' ? '60px solid #EF4444' : 
                                target.color === 'green' ? '60px solid #10B981' :
                                target.color === 'blue' ? '60px solid #3B82F6' :
                                target.color === 'yellow' ? '60px solid #F59E0B' : 
                                '60px solid #8B5CF6',
                } : {})
              }}
              onClick={(e) => handleTargetClick(target, e)}
            ></div>
          ))}
          
          {/* 添加调试指示器 */}
          <div style={{ 
            position: 'absolute', 
            bottom: '10px', 
            right: '10px', 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            color: 'white', 
            padding: '4px 8px', 
            borderRadius: '4px',
            fontSize: '12px',
            zIndex: 10
          }}>
            目标: {targets.length}
          </div>
          
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

export default FocusReflex; 