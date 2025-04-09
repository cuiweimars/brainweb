import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import './ConcentrationMaster.css';

// 游戏元素和状态类型定义
interface Target {
  id: number;
  position: { x: number; y: number };
  size: number;
  color: string;
  shape: string;
  visible: boolean;
  createdAt: number;
  isPowerup?: boolean;
  powerupType?: 'timeBonus' | 'scoreMultiplier' | 'slowMotion';
}

interface GameStats {
  score: number;
  correctClicks: number;
  incorrectClicks: number;
  missedTargets: number;
  totalTargets: number;
  reactionTimes: number[];
  focusScore: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  scoreMultiplier: number;
}

type GameState = 'intro' | 'playing' | 'paused' | 'gameOver';

interface ConcentrationMasterProps {
  difficulty: 'easy' | 'medium' | 'hard';
  onGameComplete?: (score: number, accuracy: number, avgReactionTime: number) => void;
  onExit?: () => void;
}

// 游戏配置
const gameConfig = {
  easy: {
    targetDuration: 3000,
    targetGenerationRate: 2000,
    maxTargetsOnScreen: 3,
    timeLimit: 90000,
    targetSizeRange: [40, 60],
    pointsPerTarget: 10,
    powerupChance: 0.15
  },
  medium: {
    targetDuration: 2000,
    targetGenerationRate: 1500,
    maxTargetsOnScreen: 5,
    timeLimit: 90000,
    targetSizeRange: [30, 50],
    pointsPerTarget: 15,
    powerupChance: 0.1
  },
  hard: {
    targetDuration: 1500,
    targetGenerationRate: 1000,
    maxTargetsOnScreen: 7,
    timeLimit: 90000,
    targetSizeRange: [20, 40],
    pointsPerTarget: 20,
    powerupChance: 0.08
  }
};

// 可用形状
const availableShapes = ['circle', 'square', 'triangle', 'diamond', 'star'];

// 可用颜色
const availableColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

// 音效URLs
const soundEffects = {
  correct: '/sounds/correct-click.mp3',
  incorrect: '/sounds/incorrect-click.mp3',
  powerup: '/sounds/powerup.mp3',
  levelUp: '/sounds/level-up.mp3',
  gameStart: '/sounds/game-start.mp3',
  gameOver: '/sounds/game-over.mp3'
};

// 生成随机位置
const generateRandomPosition = (width: number, height: number, size: number) => {
  return {
    x: Math.floor(Math.random() * (width - size)),
    y: Math.floor(Math.random() * (height - size))
  };
};

// 主游戏组件
const ConcentrationMaster: React.FC<ConcentrationMasterProps> = ({ 
  difficulty = 'medium', 
  onGameComplete, 
  onExit 
}) => {
  const { t } = useTranslation();
  const [gameState, setGameState] = useState<GameState>('intro');
  const [targets, setTargets] = useState<Target[]>([]);
  const [targetToFocus, setTargetToFocus] = useState<{shape: string, color: string} | null>(null);
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    correctClicks: 0,
    incorrectClicks: 0,
    missedTargets: 0,
    totalTargets: 0,
    reactionTimes: [],
    focusScore: 100,
    currentStreak: 0,
    longestStreak: 0,
    level: 1,
    scoreMultiplier: 1
  });
  const [remainingTime, setRemainingTime] = useState(gameConfig[difficulty].timeLimit);
  const [effectActive, setEffectActive] = useState<{type: string, endTime: number} | null>(null);

  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const gameTimerRef = useRef<number | null>(null);
  const targetGeneratorRef = useRef<number | null>(null);
  const effectTimerRef = useRef<number | null>(null);
  const audioRefs = useRef<{[key: string]: HTMLAudioElement | null}>({
    correct: null,
    incorrect: null,
    powerup: null,
    levelUp: null,
    gameStart: null,
    gameOver: null
  });

  // 初始化音效
  useEffect(() => {
    Object.keys(soundEffects).forEach(key => {
      const audio = new Audio(soundEffects[key as keyof typeof soundEffects]);
      audio.preload = 'auto';
      audioRefs.current[key] = audio;
    });

    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        if (audio) {
          audio.pause();
          audio.src = '';
        }
      });
    };
  }, []);

  // 播放音效
  const playSound = useCallback((sound: keyof typeof soundEffects) => {
    const audio = audioRefs.current[sound];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(err => console.error('音效播放失败:', err));
    }
  }, []);

  // 结束游戏
  const endGame = useCallback(() => {
    setGameState('gameOver');
    playSound('gameOver');
    
    // 清除计时器
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
      gameTimerRef.current = null;
    }
    
    if (targetGeneratorRef.current) {
      clearInterval(targetGeneratorRef.current);
      targetGeneratorRef.current = null;
    }

    if (effectTimerRef.current) {
      clearTimeout(effectTimerRef.current);
      effectTimerRef.current = null;
    }
    
    // 清除目标
    setTargets([]);
    
    // 计算最终统计数据
    const finalStats = gameStats;
    const accuracy = finalStats.totalTargets > 0 
      ? (finalStats.correctClicks / finalStats.totalTargets) * 100 
      : 0;
    
    const avgReactionTime = finalStats.reactionTimes.length > 0
      ? finalStats.reactionTimes.reduce((a, b) => a + b, 0) / finalStats.reactionTimes.length
      : 0;
    
    // 调用游戏完成回调
    if (onGameComplete) {
      onGameComplete(finalStats.score, accuracy, avgReactionTime);
    }
  }, [gameStats, onGameComplete, playSound]);

  // 随机选择目标形状和颜色
  const selectRandomTarget = useCallback(() => {
    const shape = availableShapes[Math.floor(Math.random() * availableShapes.length)];
    const color = availableColors[Math.floor(Math.random() * availableColors.length)];
    
    console.log("设置新的目标:", { shape, color });
    setTargetToFocus({ shape, color });
    
    return { shape, color };
  }, []);

  // 处理难度级别提升
  const handleLevelProgression = useCallback(() => {
    const targetThresholds = [10, 25, 45, 70, 100];
    const currentCorrectClicks = gameStats.correctClicks;
    const currentLevel = gameStats.level;
    
    // 检查是否应该提升级别
    if (currentLevel < 5 && currentCorrectClicks >= targetThresholds[currentLevel - 1]) {
      // 提升级别
      const newLevel = currentLevel + 1;
      setGameStats(prev => ({
        ...prev,
        level: newLevel,
        scoreMultiplier: 1 + (newLevel * 0.1) // 每个级别增加10%分数倍率
      }));
      
      // 播放级别提升音效
      playSound('levelUp');
      
      // 显示级别提升通知
      const levelUpElement = document.createElement('div');
      levelUpElement.className = 'level-up-notification';
      levelUpElement.style.position = 'absolute';
      levelUpElement.style.top = '50%';
      levelUpElement.style.left = '50%';
      levelUpElement.style.transform = 'translate(-50%, -50%)';
      levelUpElement.style.color = '#fff';
      levelUpElement.style.fontSize = '2rem';
      levelUpElement.style.fontWeight = 'bold';
      levelUpElement.style.textShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
      levelUpElement.style.zIndex = '20';
      levelUpElement.style.animation = 'fadeInOut 2s forwards';
      levelUpElement.textContent = `LEVEL ${newLevel}!`;
      
      gameAreaRef.current?.appendChild(levelUpElement);
      
      // 2秒后移除通知
      setTimeout(() => {
        if (gameAreaRef.current?.contains(levelUpElement)) {
          gameAreaRef.current.removeChild(levelUpElement);
        }
      }, 2000);
    }
  }, [gameStats.correctClicks, gameStats.level, playSound]);

  // 生成目标
  const generateTarget = useCallback(() => {
    // 检查是否已达到最大目标数
    if (targets.length >= gameConfig[difficulty].maxTargetsOnScreen) {
      console.log('已达到最大目标数，不再生成新目标');
      return;
    }
    
    // 确保游戏区域已渲染
    if (gameState !== 'playing' || !gameAreaRef.current) {
      console.log('游戏未处于进行状态或游戏区域未渲染');
      return;
    }

    const area = gameAreaRef.current.getBoundingClientRect();
    console.log('游戏区域尺寸:', { width: area.width, height: area.height });
    
    // 随机大小
    const sizeRange = gameConfig[difficulty].targetSizeRange;
    const size = Math.floor(Math.random() * (sizeRange[1] - sizeRange[0])) + sizeRange[0];
    
    // 随机形状和颜色
    const shape = availableShapes[Math.floor(Math.random() * availableShapes.length)];
    const color = availableColors[Math.floor(Math.random() * availableColors.length)];
    
    // 随机位置
    const position = generateRandomPosition(area.width, area.height, size);
    
    // 决定是否是道具
    const isPowerup = Math.random() < gameConfig[difficulty].powerupChance;
    let powerupType = undefined;
    
    if (isPowerup) {
      const powerupTypes: ('timeBonus' | 'scoreMultiplier' | 'slowMotion')[] = ['timeBonus', 'scoreMultiplier', 'slowMotion'];
      powerupType = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
    }
    
    // 创建新目标
    const newTarget: Target = {
      id: Date.now(),
      position,
      size,
      color,
      shape,
      visible: true,
      createdAt: Date.now(),
      isPowerup,
      powerupType
    };
    
    console.log('生成新目标:', newTarget);
    
    // 更新目标列表
    setTargets(prev => [...prev, newTarget]);
    
    // 更新游戏统计
    setGameStats(prev => ({
      ...prev,
      totalTargets: prev.totalTargets + 1
    }));
    
    // 设置目标消失计时器
    const targetDuration = effectActive?.type === 'slowMotion' 
      ? gameConfig[difficulty].targetDuration * 1.5 
      : gameConfig[difficulty].targetDuration;
    
    setTimeout(() => {
      if (gameState !== 'playing') return;
      
      setTargets(prev => {
        const updatedTargets = prev.filter(t => t.id !== newTarget.id);
        
        // 检查是否错过了需要关注的目标
        if (targetToFocus && newTarget.shape === targetToFocus.shape && newTarget.color === targetToFocus.color) {
          setGameStats(prevStats => ({
            ...prevStats,
            missedTargets: prevStats.missedTargets + 1,
            focusScore: Math.max(0, prevStats.focusScore - 5),
            currentStreak: 0
          }));
        }
        
        return updatedTargets;
      });
    }, targetDuration);
    
  }, [difficulty, gameState, targetToFocus, targets, effectActive]);

  // 应用道具效果
  const applyPowerupEffect = useCallback((type: 'timeBonus' | 'scoreMultiplier' | 'slowMotion') => {
    // 播放道具获取音效
    playSound('powerup');
    
    // 移除任何现有效果
    if (effectTimerRef.current) {
      clearTimeout(effectTimerRef.current);
      effectTimerRef.current = null;
    }
    
    // 应用新效果
    switch (type) {
      case 'timeBonus':
        // 增加10秒时间
        setRemainingTime(prev => prev + 10000);
        
        // 显示时间奖励通知
        const timeElement = document.createElement('div');
        timeElement.className = 'powerup-notification';
        timeElement.style.position = 'absolute';
        timeElement.style.top = '20%';
        timeElement.style.left = '50%';
        timeElement.style.transform = 'translate(-50%, -50%)';
        timeElement.style.color = '#4ade80';
        timeElement.style.fontSize = '1.5rem';
        timeElement.style.fontWeight = 'bold';
        timeElement.style.textShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
        timeElement.style.zIndex = '20';
        timeElement.style.animation = 'fadeInOut 2s forwards';
        timeElement.textContent = '+10s';
        
        gameAreaRef.current?.appendChild(timeElement);
        
        // 2秒后移除通知
        setTimeout(() => {
          if (gameAreaRef.current?.contains(timeElement)) {
            gameAreaRef.current.removeChild(timeElement);
          }
        }, 2000);
        break;
        
      case 'scoreMultiplier':
        // 设置分数加倍效果，持续15秒
        setEffectActive({
          type: 'scoreMultiplier',
          endTime: Date.now() + 15000
        });
        
        // 显示分数加倍通知
        const scoreElement = document.createElement('div');
        scoreElement.className = 'powerup-notification';
        scoreElement.style.position = 'absolute';
        scoreElement.style.top = '20%';
        scoreElement.style.left = '50%';
        scoreElement.style.transform = 'translate(-50%, -50%)';
        scoreElement.style.color = '#f59e0b';
        scoreElement.style.fontSize = '1.5rem';
        scoreElement.style.fontWeight = 'bold';
        scoreElement.style.textShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
        scoreElement.style.zIndex = '20';
        scoreElement.style.animation = 'fadeInOut 2s forwards';
        scoreElement.textContent = '2x SCORE!';
        
        gameAreaRef.current?.appendChild(scoreElement);
        
        // 2秒后移除通知
        setTimeout(() => {
          if (gameAreaRef.current?.contains(scoreElement)) {
            gameAreaRef.current.removeChild(scoreElement);
          }
        }, 2000);
        
        // 设置效果结束计时器
        effectTimerRef.current = window.setTimeout(() => {
          setEffectActive(null);
          effectTimerRef.current = null;
        }, 15000) as unknown as number;
        break;
        
      case 'slowMotion':
        // 设置慢动作效果，持续10秒
        setEffectActive({
          type: 'slowMotion',
          endTime: Date.now() + 10000
        });
        
        // 显示慢动作通知
        const slowElement = document.createElement('div');
        slowElement.className = 'powerup-notification';
        slowElement.style.position = 'absolute';
        slowElement.style.top = '20%';
        slowElement.style.left = '50%';
        slowElement.style.transform = 'translate(-50%, -50%)';
        slowElement.style.color = '#8b5cf6';
        slowElement.style.fontSize = '1.5rem';
        slowElement.style.fontWeight = 'bold';
        slowElement.style.textShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
        slowElement.style.zIndex = '20';
        slowElement.style.animation = 'fadeInOut 2s forwards';
        slowElement.textContent = 'SLOW MOTION!';
        
        gameAreaRef.current?.appendChild(slowElement);
        
        // 2秒后移除通知
        setTimeout(() => {
          if (gameAreaRef.current?.contains(slowElement)) {
            gameAreaRef.current.removeChild(slowElement);
          }
        }, 2000);
        
        // 设置效果结束计时器
        effectTimerRef.current = window.setTimeout(() => {
          setEffectActive(null);
          effectTimerRef.current = null;
        }, 10000) as unknown as number;
        break;
    }
  }, [playSound]);

  // 开始游戏
  const startGame = useCallback(() => {
    console.log('开始游戏');
    setGameState('playing');
    playSound('gameStart');
    
    // 随机选择第一个目标
    selectRandomTarget();
    
    // 重置游戏统计
    setGameStats({
      score: 0,
      correctClicks: 0,
      incorrectClicks: 0,
      missedTargets: 0,
      totalTargets: 0,
      reactionTimes: [],
      focusScore: 100,
      currentStreak: 0,
      longestStreak: 0,
      level: 1,
      scoreMultiplier: 1
    });
    
    // 重置剩余时间
    setRemainingTime(gameConfig[difficulty].timeLimit);
    
    // 启动定时器
    gameTimerRef.current = window.setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 100) { // 小于100毫秒时结束游戏
          endGame();
          return 0;
        }
        return prev - 100;
      });
    }, 100) as unknown as number;
    
    // 清除之前的目标生成器
    if (targetGeneratorRef.current) {
      clearInterval(targetGeneratorRef.current);
    }
    
    // 启动目标生成器
    const targetGenerationRate = effectActive?.type === 'slowMotion' 
      ? gameConfig[difficulty].targetGenerationRate * 1.5 
      : gameConfig[difficulty].targetGenerationRate;
    
    targetGeneratorRef.current = window.setInterval(() => {
      generateTarget();
    }, targetGenerationRate) as unknown as number;
    
  }, [difficulty, endGame, generateTarget, selectRandomTarget, playSound, effectActive]);

  // 暂停游戏
  const pauseGame = useCallback(() => {
    if (gameState === 'playing') {
      setGameState('paused');
      
      // 暂停定时器
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
        gameTimerRef.current = null;
      }
      
      if (targetGeneratorRef.current) {
        clearInterval(targetGeneratorRef.current);
        targetGeneratorRef.current = null;
      }
    }
  }, [gameState]);

  // 恢复游戏
  const resumeGame = useCallback(() => {
    if (gameState === 'paused') {
      setGameState('playing');
      
      // 恢复定时器
      gameTimerRef.current = window.setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 100) {
            endGame();
            return 0;
          }
          return prev - 100;
        });
      }, 100) as unknown as number;
      
      // 恢复目标生成器
      const targetGenerationRate = effectActive?.type === 'slowMotion' 
        ? gameConfig[difficulty].targetGenerationRate * 1.5 
        : gameConfig[difficulty].targetGenerationRate;
      
      targetGeneratorRef.current = window.setInterval(() => {
        generateTarget();
      }, targetGenerationRate) as unknown as number;
    }
  }, [difficulty, endGame, gameState, generateTarget, effectActive]);

  // 处理点击事件
  const handleClick = useCallback((target: Target) => {
    // 计算反应时间
    const reactionTime = Date.now() - target.createdAt;
    
    // 如果是道具
    if (target.isPowerup && target.powerupType) {
      // 移除目标
      setTargets(prev => prev.filter(t => t.id !== target.id));
      
      // 应用道具效果
      applyPowerupEffect(target.powerupType);
      return;
    }
    
    // 检查是否匹配当前需要关注的目标
    if (targetToFocus && target.shape === targetToFocus.shape && target.color === targetToFocus.color) {
      // 播放正确点击音效
      playSound('correct');
      
      // 增加分数
      const basePoints = gameConfig[difficulty].pointsPerTarget;
      const streakBonus = Math.min(10, Math.floor(gameStats.currentStreak / 5)) * 2; // 每5连击增加2分，最多10分
      const multiplier = effectActive?.type === 'scoreMultiplier' ? 2 : 1;
      const levelMultiplier = gameStats.scoreMultiplier;
      
      const pointsEarned = Math.round((basePoints + streakBonus) * multiplier * levelMultiplier);
      
      // 更新统计
      setGameStats(prev => {
        const newStreak = prev.currentStreak + 1;
        return {
          ...prev,
          score: prev.score + pointsEarned,
          correctClicks: prev.correctClicks + 1,
          reactionTimes: [...prev.reactionTimes, reactionTime],
          focusScore: Math.min(100, prev.focusScore + 2),
          currentStreak: newStreak,
          longestStreak: Math.max(prev.longestStreak, newStreak)
        };
      });
      
      // 检查是否应该提升级别
      handleLevelProgression();
      
      // 显示得分动画
      const pointsElement = document.createElement('div');
      pointsElement.className = 'points-animation';
      pointsElement.style.position = 'absolute';
      pointsElement.style.top = `${target.position.y}px`;
      pointsElement.style.left = `${target.position.x}px`;
      pointsElement.style.color = effectActive?.type === 'scoreMultiplier' ? '#f59e0b' : '#ffffff';
      pointsElement.style.fontSize = '1.2rem';
      pointsElement.style.fontWeight = 'bold';
      pointsElement.style.textShadow = '0 0 5px rgba(0, 0, 0, 0.5)';
      pointsElement.style.zIndex = '10';
      pointsElement.style.animation = 'floatUp 1s forwards';
      pointsElement.textContent = `+${pointsEarned}`;
      
      gameAreaRef.current?.appendChild(pointsElement);
      
      // 1秒后移除动画
      setTimeout(() => {
        if (gameAreaRef.current?.contains(pointsElement)) {
          gameAreaRef.current.removeChild(pointsElement);
        }
      }, 1000);
      
      // 随机选择新的目标
      selectRandomTarget();
    } else {
      // 播放错误点击音效
      playSound('incorrect');
      
      // 更新统计
      setGameStats(prev => ({
        ...prev,
        incorrectClicks: prev.incorrectClicks + 1,
        focusScore: Math.max(0, prev.focusScore - 10),
        currentStreak: 0
      }));
    }
    
    // 移除目标
    setTargets(prev => prev.filter(t => t.id !== target.id));
  }, [targetToFocus, gameStats, difficulty, playSound, selectRandomTarget, effectActive, applyPowerupEffect, handleLevelProgression]);

  // 清理函数
  useEffect(() => {
    return () => {
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
      }
      
      if (targetGeneratorRef.current) {
        clearInterval(targetGeneratorRef.current);
      }
      
      if (effectTimerRef.current) {
        clearTimeout(effectTimerRef.current);
      }
    };
  }, []);

  // 渲染游戏介绍界面
  const renderIntro = () => (
    <div className="intro-container">
      <h2>{t('games.concentrationMaster.title')}</h2>
      <p>{t('games.concentrationMaster.instructions')}</p>
      <p>{t('games.concentrationMaster.objective')}</p>
      <div className="difficulty-info">
        <h3>{t('games.concentrationMaster.difficultyLevel')}: {difficulty}</h3>
        <ul>
          <li>{t('games.concentrationMaster.targetDuration')}: {gameConfig[difficulty].targetDuration / 1000}s</li>
          <li>{t('games.concentrationMaster.maxTargets')}: {gameConfig[difficulty].maxTargetsOnScreen}</li>
          <li>{t('games.concentrationMaster.timeLimit')}: {gameConfig[difficulty].timeLimit / 1000}s</li>
        </ul>
      </div>
      <div className="powerups-info">
        <h3>{t('games.concentrationMaster.powerups')}</h3>
        <ul>
          <li><span className="powerup timeBonus"></span> {t('games.concentrationMaster.timeBonus')}</li>
          <li><span className="powerup scoreMultiplier"></span> {t('games.concentrationMaster.scoreMultiplier')}</li>
          <li><span className="powerup slowMotion"></span> {t('games.concentrationMaster.slowMotion')}</li>
        </ul>
      </div>
      <button className="start-button" onClick={startGame}>{t('common.start')}</button>
      <button className="exit-button" onClick={onExit}>{t('common.exit')}</button>
    </div>
  );

  // 渲染暂停界面
  const renderPausedScreen = () => (
    <div className="paused-container">
      <h2>{t('common.paused')}</h2>
      <button className="resume-button" onClick={resumeGame}>{t('common.resume')}</button>
      <button className="exit-button" onClick={endGame}>{t('common.exit')}</button>
    </div>
  );

  // 渲染游戏数据
  const renderGameStats = () => (
    <div className="game-stats">
      <div className="stats-row">
        <div className="stat">
          <span className="stat-label">{t('common.score')}</span>
          <span className="stat-value">{gameStats.score}</span>
        </div>
        <div className="stat">
          <span className="stat-label">{t('common.time')}</span>
          <span className="stat-value">{Math.ceil(remainingTime / 1000)}s</span>
        </div>
      </div>
      <div className="stats-row">
        <div className="stat">
          <span className="stat-label">{t('games.concentrationMaster.currentStreak')}</span>
          <span className="stat-value">{gameStats.currentStreak}</span>
        </div>
        <div className="stat">
          <span className="stat-label">{t('games.concentrationMaster.focusScore')}</span>
          <span className="stat-value">{gameStats.focusScore}</span>
        </div>
      </div>
      <div className="stats-row">
        <div className="stat">
          <span className="stat-label">{t('games.concentrationMaster.level')}</span>
          <span className="stat-value">{gameStats.level}</span>
        </div>
        {effectActive && (
          <div className="stat effect-active">
            <span className="stat-label">
              {effectActive.type === 'scoreMultiplier' && '2x SCORE'}
              {effectActive.type === 'slowMotion' && 'SLOW MOTION'}
            </span>
            <span className="stat-value">
              {Math.ceil((effectActive.endTime - Date.now()) / 1000)}s
            </span>
          </div>
        )}
      </div>
      <button className="pause-button" onClick={pauseGame}>{t('common.pause')}</button>
    </div>
  );

  // 渲染游戏目标指示器
  const renderTargetIndicator = () => (
    <div className="target-indicator">
      <div className="target-to-focus">
        <span className="indicator-label">{t('games.concentrationMaster.findTarget')}</span>
        {targetToFocus && (
          <div 
            className={`shape-indicator ${targetToFocus.shape}`}
            style={{ backgroundColor: targetToFocus.color }}
          />
        )}
      </div>
    </div>
  );

  // 渲染游戏区域和目标
  const renderTargets = () => (
    <div className="game-area" ref={gameAreaRef}>
      {targets.map(target => (
        <div
          key={target.id}
          className={`target ${target.shape} ${target.isPowerup ? 'powerup' : ''}`}
          style={{
            left: `${target.position.x}px`,
            top: `${target.position.y}px`,
            width: `${target.size}px`,
            height: `${target.size}px`,
            backgroundColor: target.isPowerup ? 'transparent' : target.color,
          }}
          onClick={() => handleClick(target)}
        >
          {target.isPowerup && target.powerupType && (
            <div className={`powerup-icon ${target.powerupType}`} />
          )}
        </div>
      ))}
    </div>
  );

  // 渲染游戏结束界面
  const renderGameOver = () => {
    const accuracy = gameStats.totalTargets > 0 
      ? (gameStats.correctClicks / gameStats.totalTargets) * 100 
      : 0;
    
    const avgReactionTime = gameStats.reactionTimes.length > 0
      ? gameStats.reactionTimes.reduce((a, b) => a + b, 0) / gameStats.reactionTimes.length
      : 0;
    
    return (
      <div className="game-over-container">
        <h2>{t('common.gameOver')}</h2>
        <div className="final-stats">
          <div className="final-stat">
            <span className="final-stat-label">{t('common.score')}</span>
            <span className="final-stat-value">{gameStats.score}</span>
          </div>
          <div className="final-stat">
            <span className="final-stat-label">{t('common.accuracy')}</span>
            <span className="final-stat-value">{Math.round(accuracy)}%</span>
          </div>
          <div className="final-stat">
            <span className="final-stat-label">{t('games.concentrationMaster.avgReactionTime')}</span>
            <span className="final-stat-value">{Math.round(avgReactionTime)}ms</span>
          </div>
          <div className="final-stat">
            <span className="final-stat-label">{t('games.concentrationMaster.longestStreak')}</span>
            <span className="final-stat-value">{gameStats.longestStreak}</span>
          </div>
          <div className="final-stat">
            <span className="final-stat-label">{t('games.concentrationMaster.targetsClicked')}</span>
            <span className="final-stat-value">{gameStats.correctClicks}</span>
          </div>
          <div className="final-stat">
            <span className="final-stat-label">{t('games.concentrationMaster.levelReached')}</span>
            <span className="final-stat-value">{gameStats.level}</span>
          </div>
        </div>
        <div className="game-over-actions">
          <button className="play-again-button" onClick={startGame}>{t('common.playAgain')}</button>
          <button className="exit-button" onClick={onExit}>{t('common.exit')}</button>
        </div>
      </div>
    );
  };

  // 主渲染函数
  return (
    <div className="concentration-master-container" ref={gameContainerRef}>
      {gameState === 'intro' && renderIntro()}
      
      {gameState === 'paused' && renderPausedScreen()}
      
      {gameState === 'playing' && (
        <>
          {renderGameStats()}
          {renderTargetIndicator()}
          {renderTargets()}
        </>
      )}
      
      {gameState === 'gameOver' && renderGameOver()}
    </div>
  );
};

export default ConcentrationMaster; 