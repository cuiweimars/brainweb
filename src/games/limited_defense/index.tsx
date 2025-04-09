import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

// 塔类型
enum TowerType {
  BASIC = 'basic',
  SNIPER = 'sniper',
  CANNON = 'cannon',
}

// 敌人类型
enum EnemyType {
  NORMAL = 'normal',
  FAST = 'fast',
  STRONG = 'strong',
}

// 特殊效果类型
enum EffectType {
  SLOW = 'slow',       // 减速效果
  AREA_DAMAGE = 'area', // 范围伤害
  CRITICAL = 'critical', // 暴击效果
}

// 塔属性
interface Tower {
  id: number;
  type: TowerType;
  position: { x: number; y: number };
  level: number;
  damage: number;
  range: number;
  fireRate: number;
  lastFired: number;
  target?: Enemy; // 添加目标敌人
  specialEffect?: Effect; // 添加特殊能力
}

// 特殊效果定义
interface Effect {
  type: EffectType;
  value: number;      // 效果数值（减速比例、范围伤害比例、暴击几率）
  duration?: number;  // 持续时间（毫秒）
  radius?: number;    // 范围效果半径
  chance: number;     // 触发几率
}

// 敌人属性
interface Enemy {
  id: number;
  type: EnemyType;
  position: { x: number; y: number };
  health: number;
  maxHealth: number;
  speed: number;
  reward: number;
  pathIndex: number;
  effects: {           // 添加敌人效果
    [key in EffectType]?: {
      value: number;
      endTime: number;
    }
  };
}

// 游戏点击坐标
interface GridPosition {
  x: number;
  y: number;
}

// 游戏属性
interface LimitedDefenseProps {
  difficulty?: 'easy' | 'medium' | 'hard';
  onComplete?: (score: number) => void;
  onExit?: () => void;
}

// 塔防游戏定义
const towerDefinitions = {
  [TowerType.BASIC]: {
    cost: 20,
    damage: 10,
    range: 2,
    fireRate: 1000, // ms between shots
    name: 'basic_tower',
    color: '#4dabf7',
    // 添加特殊能力: 有几率减速敌人
    specialEffect: {
      type: EffectType.SLOW,
      value: 0.5,     // 减速50%
      duration: 1500, // 持续1.5秒
      chance: 0.3     // 30%几率触发
    }
  },
  [TowerType.SNIPER]: {
    cost: 40,
    damage: 25,
    range: 4,
    fireRate: 1500,
    name: 'sniper_tower',
    color: '#be4bdb',
    // 添加特殊能力: 有几率产生暴击
    specialEffect: {
      type: EffectType.CRITICAL,
      value: 2.0,     // 双倍伤害
      chance: 0.25    // 25%几率触发
    }
  },
  [TowerType.CANNON]: {
    cost: 60,
    damage: 20,
    range: 2,
    fireRate: 2000,
    name: 'cannon_tower',
    color: '#f03e3e',
    // 添加特殊能力: 范围伤害
    specialEffect: {
      type: EffectType.AREA_DAMAGE,
      value: 0.5,     // 范围内其他敌人受到50%伤害
      radius: 1.2,    // 爆炸半径
      chance: 1.0     // 100%几率触发
    }
  }
};

// 敌人定义
const enemyDefinitions = {
  [EnemyType.NORMAL]: {
    health: 50,
    speed: 0.02,
    reward: 10,
    color: '#74c0fc',
    name: 'normal_enemy'
  },
  [EnemyType.FAST]: {
    health: 30,
    speed: 0.04,
    reward: 15,
    color: '#51cf66',
    name: 'fast_enemy'
  },
  [EnemyType.STRONG]: {
    health: 100,
    speed: 0.01,
    reward: 20,
    color: '#ff6b6b',
    name: 'strong_enemy'
  }
};

// 根据难度调整敌人属性
const difficultyMultipliers = {
  easy: {
    enemyHealth: 0.8,
    enemySpeed: 0.8,
    reward: 1.2
  },
  medium: {
    enemyHealth: 1.0,
    enemySpeed: 1.0,
    reward: 1.0
  },
  hard: {
    enemyHealth: 1.3,
    enemySpeed: 1.2,
    reward: 0.8
  }
};

// 添加攻击效果类型
interface Projectile {
  id: number;
  towerId: number;
  sourcePosition: GridPosition;
  targetPosition: GridPosition;
  targetEnemyId: number;
  type: TowerType;
  createdAt: number;
  hasSpecialEffect?: boolean; // 是否触发了特殊效果
}

// 添加特效动画
interface EffectAnimation {
  id: number;
  type: EffectType;
  position: GridPosition;
  radius?: number;
  createdAt: number;
}

const LimitedDefense: React.FC<LimitedDefenseProps> = ({ 
  difficulty = 'medium', 
  onComplete, 
  onExit 
}) => {
  const { t } = useTranslation();
  const gameLoopRef = useRef<number | null>(null);
  const [gameState, setGameState] = useState<'loading' | 'playing' | 'paused' | 'gameOver' | 'victory'>('loading');
  const [money, setMoney] = useState(100);
  const [lives, setLives] = useState(10);
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(0);
  const [towers, setTowers] = useState<Tower[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [selectedTowerType, setSelectedTowerType] = useState<TowerType | null>(null);
  const [selectedTower, setSelectedTower] = useState<Tower | null>(null);
  const [nextTowerId, setNextTowerId] = useState(1);
  const [nextEnemyId, setNextEnemyId] = useState(1);
  const [isPlacingTower, setIsPlacingTower] = useState(false);
  const [waveInProgress, setWaveInProgress] = useState(false);
  const [enemiesRemaining, setEnemiesRemaining] = useState(0);
  const [nextWaveCountdown, setNextWaveCountdown] = useState<number | null>(null);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [nextProjectileId, setNextProjectileId] = useState(1);
  const [effectAnimations, setEffectAnimations] = useState<EffectAnimation[]>([]);
  const [nextEffectId, setNextEffectId] = useState(1);

  // 游戏路径 - 敌人将沿此路径移动
  const gamePath = [
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 3, y: 1 },
    { x: 3, y: 2 },
    { x: 3, y: 3 },
    { x: 3, y: 4 },
    { x: 4, y: 4 },
    { x: 5, y: 4 },
    { x: 6, y: 4 },
    { x: 6, y: 5 },
    { x: 6, y: 6 },
    { x: 7, y: 6 },
    { x: 8, y: 6 },
    { x: 9, y: 6 }
  ];

  // 游戏路径坐标集合 (用于快速检查位置是否在路径上)
  const pathSet = new Set(gamePath.map(pos => `${pos.x},${pos.y}`));
  
  // 检查位置是否在路径上
  const isOnPath = (x: number, y: number) => pathSet.has(`${x},${y}`);
  
  // 计算两个位置之间的距离
  const distance = (pos1: GridPosition, pos2: GridPosition) => {
    return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
  };
  
  // 初始化游戏
  useEffect(() => {
    setTimeout(() => {
      setGameState('playing');
    }, 1500);
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, []);

  // 生成新的一波敌人
  const startWave = () => {
    const newWave = wave + 1;
    setWave(newWave);
    setWaveInProgress(true);
    setNextWaveCountdown(null);
    
    // 基础敌人数量随波数增加
    const baseEnemyCount = 5 + Math.floor(newWave / 2);
    
    // 存储要生成的敌人类型和数量
    const waveEnemies: { type: EnemyType, count: number }[] = [];
    
    // 根据波数决定敌人类型配置
    if (newWave <= 2) {
      // 前两波全是普通敌人
      waveEnemies.push({ type: EnemyType.NORMAL, count: baseEnemyCount });
    } else if (newWave <= 5) {
      // 中等波次，主要是普通敌人，少量快速敌人
      waveEnemies.push({ type: EnemyType.NORMAL, count: Math.round(baseEnemyCount * 0.7) });
      waveEnemies.push({ type: EnemyType.FAST, count: Math.round(baseEnemyCount * 0.3) });
    } else {
      // 高级波次，三种敌人都有
      waveEnemies.push({ type: EnemyType.NORMAL, count: Math.round(baseEnemyCount * 0.5) });
      waveEnemies.push({ type: EnemyType.FAST, count: Math.round(baseEnemyCount * 0.3) });
      waveEnemies.push({ type: EnemyType.STRONG, count: Math.round(baseEnemyCount * 0.2) });
    }
    
    // 计算总敌人数量
    const totalEnemies = waveEnemies.reduce((total, e) => total + e.count, 0);
    setEnemiesRemaining(totalEnemies);
    
    // 逐个生成敌人，设置延迟以便它们不会同时出现
    let enemySpawnDelay = 0;
    
    waveEnemies.forEach(({ type, count }) => {
      for (let i = 0; i < count; i++) {
        // 使用setTimeout错开敌人生成时间
        setTimeout(() => {
          spawnEnemy(type);
        }, enemySpawnDelay);
        
        // 根据敌人类型调整生成间隔时间
        enemySpawnDelay += type === EnemyType.FAST ? 800 : 1200;
      }
    });
  };
  
  // 生成单个敌人
  const spawnEnemy = (type: EnemyType) => {
    // 获取敌人基础属性
    const baseEnemy = enemyDefinitions[type];
    
    // 根据难度调整敌人属性
    const multiplier = difficultyMultipliers[difficulty];
    
    // 创建敌人对象
    const enemy: Enemy = {
      id: nextEnemyId,
      type,
      position: { ...gamePath[0] }, // 从路径起点开始
      health: baseEnemy.health * multiplier.enemyHealth,
      maxHealth: baseEnemy.health * multiplier.enemyHealth,
      speed: baseEnemy.speed * multiplier.enemySpeed,
      reward: baseEnemy.reward * multiplier.reward,
      pathIndex: 0,
      effects: {}  // 初始没有效果
    };
    
    setNextEnemyId(prevId => prevId + 1);
    setEnemies(prevEnemies => [...prevEnemies, enemy]);
  };
  
  // 处理放置塔
  const placeTower = (x: number, y: number) => {
    if (!selectedTowerType || isOnPath(x, y)) return;
    
    // 检查是否已有塔防在该位置
    const towerExists = towers.some(tower => tower.position.x === x && tower.position.y === y);
    if (towerExists) return;
    
    // 获取所选塔防类型的基本属性
    const towerDef = towerDefinitions[selectedTowerType];
    
    // 检查金钱是否足够
    if (money < towerDef.cost) return;
    
    // 创建新塔防
    const newTower: Tower = {
      id: nextTowerId,
      type: selectedTowerType,
      position: { x, y },
      level: 1,
      damage: towerDef.damage,
      range: towerDef.range,
      fireRate: towerDef.fireRate,
      lastFired: 0
    };
    
    setNextTowerId(prevId => prevId + 1);
    setTowers(prevTowers => [...prevTowers, newTower]);
    setMoney(prevMoney => prevMoney - towerDef.cost);
    setIsPlacingTower(false);
    setSelectedTowerType(null);
  };
  
  // 升级塔
  const upgradeTower = (towerId: number) => {
    const towerIndex = towers.findIndex(t => t.id === towerId);
    if (towerIndex === -1) return;
    
    const tower = towers[towerIndex];
    
    // 最高3级
    if (tower.level >= 3) return;
    
    // 升级费用随级别增加
    const upgradeCost = Math.floor(towerDefinitions[tower.type].cost * tower.level * 0.8);
    
    // 检查金钱是否足够
    if (money < upgradeCost) return;
    
    // 升级塔防
    const updatedTowers = [...towers];
    updatedTowers[towerIndex] = {
      ...tower,
      level: tower.level + 1,
      damage: Math.floor(tower.damage * 1.5),
      range: tower.range + 0.5,
      fireRate: Math.max(tower.fireRate * 0.8, 200) // 最小发射间隔200ms
    };
    
    setTowers(updatedTowers);
    setMoney(prevMoney => prevMoney - upgradeCost);
  };
  
  // 出售塔
  const sellTower = (towerId: number) => {
    const towerIndex = towers.findIndex(t => t.id === towerId);
    if (towerIndex === -1) return;
    
    const tower = towers[towerIndex];
    
    // 返还一部分建造费用
    const refund = Math.floor(towerDefinitions[tower.type].cost * 0.6);
    
    // 移除塔防
    setTowers(prevTowers => prevTowers.filter(t => t.id !== towerId));
    setMoney(prevMoney => prevMoney + refund);
    setSelectedTower(null);
  };
  
  // 游戏循环 - 处理敌人移动和塔防攻击
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    let lastTime = 0;
    
    const gameLoop = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;
      
      // 更新敌人位置
      updateEnemies(deltaTime);
      
      // 塔防攻击
      updateTowers(deltaTime);
      
      // 检查波次是否结束
      checkWaveStatus();
      
      // 继续游戏循环
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, enemies, towers, waveInProgress]);
  
  // 更新敌人位置和状态
  const updateEnemies = (deltaTime: number) => {
    let newLives = lives;
    let newMoney = money;
    let newScore = score;
    
    // 当前时间
    const currentTime = Date.now();
    
    const updatedEnemies = enemies.filter(enemy => {
      // 更新敌人效果状态
      let currentEnemy = { ...enemy };
      
      // 处理效果
      Object.entries(currentEnemy.effects).forEach(([effectType, effect]) => {
        // 检查效果是否已过期
        if (effect.endTime < currentTime) {
          delete currentEnemy.effects[effectType as EffectType];
        }
      });
      
      // 跳过已死亡的敌人
      if (currentEnemy.health <= 0) {
        // 获得奖励
        newMoney += currentEnemy.reward;
        newScore += currentEnemy.reward;
        setEnemiesRemaining(prev => prev - 1);
        return false;
      }
      
      // 敌人到达终点
      if (currentEnemy.pathIndex >= gamePath.length - 1) {
        newLives--;
        setEnemiesRemaining(prev => prev - 1);
        return false;
      }
      
      // 计算敌人向下一个路径点移动的方向
      const currentPos = currentEnemy.position;
      const targetPos = gamePath[currentEnemy.pathIndex + 1];
      
      // 计算方向向量
      const dx = targetPos.x - currentPos.x;
      const dy = targetPos.y - currentPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // 应用减速效果
      let moveSpeed = currentEnemy.speed;
      if (currentEnemy.effects[EffectType.SLOW]) {
        moveSpeed *= (1 - currentEnemy.effects[EffectType.SLOW].value);
      }
      
      // 如果接近下一个路径点，更新路径索引
      if (dist < moveSpeed * deltaTime) {
        return {
          ...currentEnemy,
          position: { ...targetPos },
          pathIndex: currentEnemy.pathIndex + 1
        };
      }
      
      // 正常移动
      const moveX = (dx / dist) * moveSpeed * deltaTime;
      const moveY = (dy / dist) * moveSpeed * deltaTime;
      
      return {
        ...currentEnemy,
        position: {
          x: currentPos.x + moveX,
          y: currentPos.y + moveY
        }
      };
    });
    
    // 更新游戏状态
    setEnemies(updatedEnemies);
    setLives(newLives);
    setMoney(newMoney);
    setScore(newScore);
    
    // 检查游戏是否结束
    if (newLives <= 0) {
      setGameState('gameOver');
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    }
  };
  
  // 更新塔防攻击
  const updateTowers = (deltaTime: number) => {
    if (enemies.length === 0) return;
    
    const updatedTowers = [...towers];
    const updatedEnemies = [...enemies];
    const newProjectiles: Projectile[] = [];
    const newEffects: EffectAnimation[] = [];
    
    updatedTowers.forEach(tower => {
      // 检查是否可以攻击
      if (Date.now() - tower.lastFired < tower.fireRate) return;
      
      // 寻找目标范围内的敌人
      const targets = updatedEnemies
        .filter(enemy => distance(tower.position, enemy.position) <= tower.range)
        .sort((a, b) => a.pathIndex - b.pathIndex); // 优先攻击最前面的敌人
      
      if (targets.length === 0) return;
      
      // 找到目标
      const target = targets[0];
      
      // 塔的特殊效果
      const towerDef = towerDefinitions[tower.type];
      const specialEffect = towerDef.specialEffect;
      
      // 计算伤害值
      let damageAmount = tower.damage;
      let hasSpecialEffect = false;
      
      // 根据特殊效果类型处理不同效果
      if (specialEffect && Math.random() < specialEffect.chance) {
        hasSpecialEffect = true;
        
        switch (specialEffect.type) {
          case EffectType.CRITICAL:
            // 暴击效果 - 增加伤害
            damageAmount = tower.damage * specialEffect.value;
            
            // 添加暴击特效
            newEffects.push({
              id: nextEffectId,
              type: EffectType.CRITICAL,
              position: { ...target.position },
              createdAt: Date.now()
            });
            setNextEffectId(prev => prev + 1);
            break;
            
          case EffectType.SLOW:
            // 减速效果 - 添加到敌人身上
            const targetWithSlow = updatedEnemies.find(e => e.id === target.id);
            const slowEffect = specialEffect as { type: EffectType; value: number; duration: number; chance: number; };
            if (targetWithSlow && slowEffect.duration) {
              targetWithSlow.effects[EffectType.SLOW] = {
                value: specialEffect.value,
                endTime: Date.now() + slowEffect.duration
              };
              
              // 添加减速特效
              newEffects.push({
                id: nextEffectId,
                type: EffectType.SLOW,
                position: { ...target.position },
                createdAt: Date.now()
              });
              setNextEffectId(prev => prev + 1);
            }
            break;
            
          case EffectType.AREA_DAMAGE:
            // 范围伤害 - 对周围敌人也造成伤害
            const areaEffect = specialEffect as { type: EffectType; value: number; radius: number; chance: number; };
            if (areaEffect.radius) {
              updatedEnemies.forEach(enemy => {
                if (enemy.id !== target.id && 
                    distance(target.position, enemy.position) <= areaEffect.radius) {
                  enemy.health -= tower.damage * specialEffect.value;
                }
              });
              
              // 添加范围伤害特效
              newEffects.push({
                id: nextEffectId,
                type: EffectType.AREA_DAMAGE,
                position: { ...target.position },
                radius: areaEffect.radius,
                createdAt: Date.now()
              });
              setNextEffectId(prev => prev + 1);
            }
            break;
        }
      }
      
      // 创建新的投射物
      const projectile: Projectile = {
        id: nextProjectileId,
        towerId: tower.id,
        sourcePosition: tower.position,
        targetPosition: target.position,
        targetEnemyId: target.id,
        type: tower.type,
        createdAt: Date.now(),
        hasSpecialEffect // 记录是否有特殊效果
      };
      
      newProjectiles.push(projectile);
      setNextProjectileId(prevId => prevId + 1);
      
      // 对目标造成伤害
      const targetIndex = updatedEnemies.findIndex(e => e.id === target.id);
      updatedEnemies[targetIndex] = {
        ...target,
        health: target.health - damageAmount
      };
      
      // 更新塔防的攻击时间
      tower.lastFired = Date.now();
    });
    
    // 更新投射物
    setProjectiles(prevProjectiles => {
      // 移除已经到达目标的投射物（超过500毫秒的）
      const currentTime = Date.now();
      const activeProjectiles = prevProjectiles.filter(p => currentTime - p.createdAt < 500);
      return [...activeProjectiles, ...newProjectiles];
    });
    
    // 更新特效动画
    setEffectAnimations(prevEffects => {
      // 移除已经完成的特效（超过800毫秒的）
      const currentTime = Date.now();
      const activeEffects = prevEffects.filter(e => currentTime - e.createdAt < 800);
      return [...activeEffects, ...newEffects];
    });
    
    setEnemies(updatedEnemies);
  };
  
  // 检查波次状态
  const checkWaveStatus = () => {
    if (!waveInProgress) return;
    
    // 检查是否所有敌人都已被消灭
    if (enemies.length === 0 && enemiesRemaining === 0) {
      // 波次结束
      setWaveInProgress(false);
      
      // 在波与波之间设置倒计时
      setNextWaveCountdown(10);
      
      // 设置倒计时定时器
      const countdownTimer = setInterval(() => {
        setNextWaveCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(countdownTimer);
            // 当倒计时结束，自动开始下一波
            if (gameState === 'playing') {
              startWave();
            }
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      
      // 如果超过15波，游戏胜利
      if (wave >= 15) {
        setGameState('victory');
        if (gameLoopRef.current) {
          cancelAnimationFrame(gameLoopRef.current);
        }
        if (onComplete) {
          onComplete(score);
        }
      }
    }
  };
  
  // 处理点击事件
  const handleGridClick = (x: number, y: number) => {
    if (gameState !== 'playing') return;
    
    if (isPlacingTower) {
      placeTower(x, y);
    } else {
      // 检查是否点击了塔防
      const clickedTower = towers.find(t => t.position.x === x && t.position.y === y);
      setSelectedTower(clickedTower || null);
    }
  };
  
  // 重新开始游戏
  const restartGame = () => {
    setMoney(100);
    setLives(10);
    setScore(0);
    setWave(0);
    setTowers([]);
    setEnemies([]);
    setSelectedTower(null);
    setSelectedTowerType(null);
    setIsPlacingTower(false);
    setWaveInProgress(false);
    setEnemiesRemaining(0);
    setNextWaveCountdown(null);
    setGameState('playing');
  };
  
  // 自动开始游戏
  useEffect(() => {
    setTimeout(() => {
      setGameState('playing');
    }, 1500);
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, []);

  // 根据难度调整初始资金
  useEffect(() => {
    if (difficulty === 'easy') {
      setMoney(120);
    } else if (difficulty === 'hard') {
      setMoney(80);
    }
  }, [difficulty]);

  return (
    <div className="limited-defense-game" style={{
      width: '100%',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '1rem',
      textAlign: 'center'
    }}>
      {gameState === 'loading' && (
        <div className="game-loading" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px'
        }}>
          <h2 style={{ marginBottom: '1rem' }}>{t('loading')}</h2>
          <div className="spinner" style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(0, 0, 0, 0.1)',
            borderRadius: '50%',
            borderLeft: '4px solid #f87171',
            animation: 'spin 1s linear infinite'
          }}></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
      
      {gameState !== 'loading' && (
        <div className="game-container" style={{
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          padding: '1rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          minHeight: '500px'
        }}>
          <div className="game-header" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            padding: '0.5rem',
            borderBottom: '1px solid #e9ecef'
          }}>
            <div className="game-stats" style={{
              display: 'flex',
              gap: '1rem'
            }}>
              <div className="stat" style={{
                padding: '0.5rem',
                backgroundColor: '#e9ecef',
                borderRadius: '4px',
                textAlign: 'center'
              }}>
                <div className="label" style={{ fontSize: '0.8rem' }}>{t('money')}</div>
                <div className="value" style={{ fontWeight: 'bold' }}>{Math.floor(money)}</div>
              </div>
              <div className="stat" style={{
                padding: '0.5rem',
                backgroundColor: '#e9ecef',
                borderRadius: '4px',
                textAlign: 'center'
              }}>
                <div className="label" style={{ fontSize: '0.8rem' }}>{t('lives')}</div>
                <div className="value" style={{ fontWeight: 'bold' }}>{lives}</div>
              </div>
              <div className="stat" style={{
                padding: '0.5rem',
                backgroundColor: '#e9ecef',
                borderRadius: '4px',
                textAlign: 'center'
              }}>
                <div className="label" style={{ fontSize: '0.8rem' }}>{t('wave')}</div>
                <div className="value" style={{ fontWeight: 'bold' }}>{wave}</div>
              </div>
              <div className="stat" style={{
                padding: '0.5rem',
                backgroundColor: '#e9ecef',
                borderRadius: '4px',
                textAlign: 'center'
              }}>
                <div className="label" style={{ fontSize: '0.8rem' }}>{t('score')}</div>
                <div className="value" style={{ fontWeight: 'bold' }}>{score}</div>
              </div>
            </div>
            
            <div className="game-controls" style={{ 
              display: 'flex',
              gap: '0.5rem'
            }}>
              {gameState === 'paused' && (
                <button 
                  onClick={() => setGameState('playing')}
                  style={{
                    backgroundColor: '#4dabf7',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.5rem 1rem',
                    cursor: 'pointer'
                  }}
                >
                  {t('continue')}
                </button>
              )}
              {gameState === 'playing' && (
                <button 
                  onClick={() => setGameState('paused')}
                  style={{
                    backgroundColor: '#4dabf7',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.5rem 1rem',
                    cursor: 'pointer'
                  }}
                >
                  {t('pause')}
                </button>
              )}
              <button 
                onClick={onExit}
                style={{
                  backgroundColor: '#f87171',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer'
                }}
              >
                {t('exit')}
              </button>
            </div>
          </div>
          
          <div className="game-board" style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-start'
          }}>
            {/* 游戏网格 */}
            <div className="game-grid" style={{
              flex: '1',
              backgroundColor: '#dee2e6',
              border: '2px solid #6c757d',
              borderRadius: '4px',
              aspectRatio: '1',
              display: 'grid',
              gridTemplateColumns: 'repeat(10, 1fr)',
              gridTemplateRows: 'repeat(10, 1fr)',
              gap: '1px',
              padding: '2px',
              position: 'relative'
            }}>
              {/* 渲染10x10的网格 */}
              {Array.from({ length: 10 }, (_, y) => (
                Array.from({ length: 10 }, (_, x) => (
                  <div 
                    key={`${x}-${y}`}
                    onClick={() => handleGridClick(x, y)}
                    style={{
                      backgroundColor: isPlacingTower && !isOnPath(x, y) && !towers.some(t => t.position.x === x && t.position.y === y)
                        ? 'rgba(74, 222, 128, 0.3)' // 显示可放置位置
                        : isOnPath(x, y)
                          ? '#adb5bd' // 显示路径
                          : '#fff',
                      borderRadius: '2px',
                      cursor: isPlacingTower && !isOnPath(x, y) && !towers.some(t => t.position.x === x && t.position.y === y)
                        ? 'pointer'
                        : 'default',
                      position: 'relative'
                    }}
                  />
                ))
              )).flat()}
              
              {/* 渲染塔防 */}
              {towers.map((tower) => (
                <div
                  key={`tower-${tower.id}`}
                  style={{
                    position: 'absolute',
                    top: `${tower.position.y * 10 + 0.5}%`,
                    left: `${tower.position.x * 10 + 0.5}%`,
                    width: '9%',
                    height: '9%',
                    backgroundColor: towerDefinitions[tower.type].color,
                    borderRadius: '50%',
                    border: selectedTower?.id === tower.id ? '2px solid #ffd43b' : 'none',
                    zIndex: 5,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '0.7rem',
                    color: '#fff',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTower(tower);
                  }}
                >
                  {tower.level}
                </div>
              ))}
              
              {/* 渲染敌人 */}
              {enemies.map((enemy) => (
                <div
                  key={`enemy-${enemy.id}`}
                  style={{
                    position: 'absolute',
                    top: `${enemy.position.y * 10 + 1}%`,
                    left: `${enemy.position.x * 10 + 1}%`,
                    width: '8%',
                    height: '8%',
                    backgroundColor: enemyDefinitions[enemy.type].color,
                    borderRadius: '50%',
                    zIndex: 10,
                    overflow: 'hidden'
                  }}
                >
                  {/* 敌人血条 */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    height: '25%',
                    width: `${(enemy.health / enemy.maxHealth) * 100}%`,
                    backgroundColor: '#40c057',
                    transition: 'width 0.2s'
                  }} />
                </div>
              ))}
              
              {/* 渲染攻击投射物 */}
              {projectiles.map((projectile) => {
                // 计算投射物位置（使用线性插值）
                const timeSinceCreation = Date.now() - projectile.createdAt;
                const progress = Math.min(timeSinceCreation / 500, 1); // 500ms动画时间
                
                // 线性插值源点和目标点
                const currentX = projectile.sourcePosition.x + (projectile.targetPosition.x - projectile.sourcePosition.x) * progress;
                const currentY = projectile.sourcePosition.y + (projectile.targetPosition.y - projectile.sourcePosition.y) * progress;
                
                // 根据塔类型确定投射物样式
                let projectileStyle: React.CSSProperties = {
                  position: 'absolute',
                  top: `${currentY * 10 + 4}%`,
                  left: `${currentX * 10 + 4}%`,
                  width: '2%',
                  height: '2%',
                  borderRadius: '50%',
                  zIndex: 15,
                  transform: 'translate(-50%, -50%)'
                };
                
                switch (projectile.type) {
                  case TowerType.BASIC:
                    projectileStyle.backgroundColor = '#4dabf7';
                    break;
                  case TowerType.SNIPER:
                    projectileStyle.backgroundColor = '#be4bdb';
                    projectileStyle.width = '1%';
                    projectileStyle.height = '1%';
                    break;
                  case TowerType.CANNON:
                    projectileStyle.backgroundColor = '#f03e3e';
                    projectileStyle.width = '3%';
                    projectileStyle.height = '3%';
                    break;
                }
                
                return <div key={`projectile-${projectile.id}`} style={projectileStyle} />;
              })}
              
              {/* 渲染特效动画 */}
              {effectAnimations.map((effect) => {
                // 计算动画生命周期进度
                const timeSinceCreation = Date.now() - effect.createdAt;
                const progress = Math.min(timeSinceCreation / 800, 1); // 800ms动画时间
                
                // 根据特效类型确定样式
                let effectStyle: React.CSSProperties = {
                  position: 'absolute',
                  top: `${effect.position.y * 10 + 5}%`,
                  left: `${effect.position.x * 10 + 5}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 20,
                  pointerEvents: 'none'
                };
                
                switch (effect.type) {
                  case EffectType.CRITICAL: {
                    // 暴击效果 - 显示放大缩小的圆圈和数字
                    const size = 15 * (1 - progress); // 从大到小
                    const opacity = 1 - progress; // 淡出效果
                    
                    return (
                      <div 
                        key={`effect-${effect.id}`} 
                        style={{
                          ...effectStyle,
                          width: `${size}%`,
                          height: `${size}%`,
                          backgroundColor: 'rgba(255, 212, 59, 0.2)',
                          border: '2px solid rgba(255, 212, 59, 0.8)',
                          borderRadius: '50%',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          color: '#e67700',
                          fontWeight: 'bold',
                          fontSize: '0.8rem',
                          opacity
                        }}
                      >
                        !
                      </div>
                    );
                  }
                  
                  case EffectType.SLOW: {
                    // 减速效果 - 蓝色雪花图案
                    const size = 10 * (1 - progress * 0.5); // 从大到小但不完全消失
                    const opacity = 0.8 - progress * 0.5; // 淡出效果但不完全透明
                    
                    return (
                      <div 
                        key={`effect-${effect.id}`} 
                        style={{
                          ...effectStyle,
                          width: `${size}%`,
                          height: `${size}%`,
                          borderRadius: '50%',
                          opacity,
                          fontSize: '1rem',
                          color: '#4dabf7',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        ❄
                      </div>
                    );
                  }
                  
                  case EffectType.AREA_DAMAGE: {
                    // 范围伤害效果 - 爆炸效果
                    const radius = effect.radius || 1.5;
                    const size = radius * 20 * (progress < 0.5 ? progress * 2 : 2 - progress * 2); // 先扩大后缩小
                    const opacity = 1 - progress; // 淡出效果
                    
                    return (
                      <div 
                        key={`effect-${effect.id}`} 
                        style={{
                          ...effectStyle,
                          width: `${size}%`,
                          height: `${size}%`,
                          backgroundColor: `rgba(255, 107, 107, ${0.4 * (1 - progress)})`,
                          border: `2px solid rgba(255, 107, 107, ${0.8 * (1 - progress)})`,
                          borderRadius: '50%',
                          boxShadow: `0 0 10px rgba(255, 107, 107, ${0.6 * (1 - progress)})`,
                          opacity
                        }}
                      />
                    );
                  }
                  
                  default:
                    return null;
                }
              })}
              
              {/* 显示选中塔防的攻击范围 */}
              {selectedTower && (
                <div
                  style={{
                    position: 'absolute',
                    top: `${selectedTower.position.y * 10 + 5 - selectedTower.range * 10}%`,
                    left: `${selectedTower.position.x * 10 + 5 - selectedTower.range * 10}%`,
                    width: `${selectedTower.range * 20}%`,
                    height: `${selectedTower.range * 20}%`,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 212, 59, 0.2)',
                    border: '1px solid rgba(255, 212, 59, 0.5)',
                    zIndex: 2
                  }}
                />
              )}
            </div>
            
            {/* 右侧控制面板 */}
            <div className="game-controls" style={{
              width: '180px',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {/* 塔防选择面板 */}
              <div className="tower-controls" style={{
                backgroundColor: '#e9ecef',
                borderRadius: '4px',
                padding: '0.5rem'
              }}>
                <h3 style={{ 
                  textAlign: 'center',
                  marginBottom: '0.5rem',
                  padding: '0.5rem',
                  borderBottom: '1px solid #ced4da'
                }}>{t('towers')}</h3>
                
                <div className="tower-buttons" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  {Object.entries(towerDefinitions).map(([type, def]) => (
                    <button 
                      key={type}
                      onClick={() => {
                        setSelectedTowerType(type as TowerType);
                        setIsPlacingTower(true);
                        setSelectedTower(null);
                      }}
                      disabled={money < def.cost}
                      style={{
                        backgroundColor: selectedTowerType === type ? '#e9ecef' : '#fff',
                        border: selectedTowerType === type ? '2px solid #4dabf7' : '1px solid #ced4da',
                        borderRadius: '4px',
                        padding: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        cursor: money < def.cost ? 'not-allowed' : 'pointer',
                        opacity: money < def.cost ? 0.6 : 1
                      }}
                    >
                      <div style={{
                        width: '20px',
                        height: '20px',
                        backgroundColor: def.color,
                        borderRadius: '4px',
                        marginRight: '0.5rem'
                      }}></div>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>{t(def.name)}</div>
                        <div style={{ fontSize: '0.7rem' }}>${def.cost}</div>
                      </div>
                    </button>
                  ))}
                  
                  {isPlacingTower && (
                    <button 
                      onClick={() => {
                        setIsPlacingTower(false);
                        setSelectedTowerType(null);
                      }}
                      style={{
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #ced4da',
                        borderRadius: '4px',
                        padding: '0.5rem',
                        marginTop: '0.5rem',
                        cursor: 'pointer'
                      }}
                    >
                      {t('cancel')}
                    </button>
                  )}
                </div>
              </div>
              
              {/* 选中塔防信息面板 */}
              {selectedTower && (
                <div className="tower-info" style={{
                  backgroundColor: '#e9ecef',
                  borderRadius: '4px',
                  padding: '0.5rem'
                }}>
                  <h3 style={{ 
                    textAlign: 'center',
                    marginBottom: '0.5rem',
                    padding: '0.5rem',
                    borderBottom: '1px solid #ced4da'
                  }}>{t(towerDefinitions[selectedTower.type].name)}</h3>
                  
                  <div style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                    <div>{t('level')}: {selectedTower.level}</div>
                    <div>{t('damage')}: {selectedTower.damage}</div>
                    <div>{t('range')}: {selectedTower.range.toFixed(1)}</div>
                    <div>{t('fire_rate')}: {(1000 / selectedTower.fireRate).toFixed(1)}/s</div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                    {selectedTower.level < 3 && (
                      <button 
                        onClick={() => upgradeTower(selectedTower.id)}
                        disabled={money < Math.floor(towerDefinitions[selectedTower.type].cost * selectedTower.level * 0.8)}
                        style={{
                          flex: '1',
                          backgroundColor: '#4dabf7',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '0.5rem',
                          fontSize: '0.8rem',
                          cursor: money < Math.floor(towerDefinitions[selectedTower.type].cost * selectedTower.level * 0.8) ? 'not-allowed' : 'pointer',
                          opacity: money < Math.floor(towerDefinitions[selectedTower.type].cost * selectedTower.level * 0.8) ? 0.6 : 1
                        }}
                      >
                        {t('upgrade')} (${Math.floor(towerDefinitions[selectedTower.type].cost * selectedTower.level * 0.8)})
                      </button>
                    )}
                    <button 
                      onClick={() => sellTower(selectedTower.id)}
                      style={{
                        flex: '1',
                        backgroundColor: '#f87171',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '0.5rem',
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      {t('sell')} (${Math.floor(towerDefinitions[selectedTower.type].cost * 0.6)})
                    </button>
                  </div>
                </div>
              )}
              
              {/* 波次控制面板 */}
              <div className="wave-controls" style={{
                backgroundColor: '#e9ecef',
                borderRadius: '4px',
                padding: '0.5rem',
                textAlign: 'center'
              }}>
                {!waveInProgress && wave === 0 && (
                  <button 
                    onClick={() => startWave()}
                    style={{
                      width: '100%',
                      backgroundColor: '#40c057',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '0.5rem',
                      cursor: 'pointer'
                    }}
                  >
                    {t('start_wave')}
                  </button>
                )}
                
                {waveInProgress && (
                  <div>
                    <div style={{ marginBottom: '0.5rem' }}>
                      {t('enemies_remaining')}: {enemiesRemaining}
                    </div>
                  </div>
                )}
                
                {!waveInProgress && wave > 0 && nextWaveCountdown !== null && (
                  <div>
                    <div style={{ marginBottom: '0.5rem' }}>
                      {t('next_wave_in')}: {nextWaveCountdown} {t('seconds')}
                    </div>
                    <button 
                      onClick={() => startWave()}
                      style={{
                        width: '100%',
                        backgroundColor: '#40c057',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '0.5rem',
                        cursor: 'pointer'
                      }}
                    >
                      {t('start_wave')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 游戏结束弹窗 */}
      {gameState === 'gameOver' && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          zIndex: 100,
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#f03e3e', marginBottom: '1rem' }}>{t('game_over')}</h2>
          <p>{t('final_score')}: {score}</p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'center' }}>
            <button 
              onClick={restartGame}
              style={{
                backgroundColor: '#40c057',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '0.5rem 1rem',
                cursor: 'pointer'
              }}
            >
              {t('play_again')}
            </button>
            <button 
              onClick={onExit}
              style={{
                backgroundColor: '#f87171',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '0.5rem 1rem',
                cursor: 'pointer'
              }}
            >
              {t('exit')}
            </button>
          </div>
        </div>
      )}
      
      {/* 游戏胜利弹窗 */}
      {gameState === 'victory' && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          zIndex: 100,
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#40c057', marginBottom: '1rem' }}>{t('victory')}</h2>
          <p>{t('final_score')}: {score}</p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'center' }}>
            <button 
              onClick={restartGame}
              style={{
                backgroundColor: '#40c057',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '0.5rem 1rem',
                cursor: 'pointer'
              }}
            >
              {t('play_again')}
            </button>
            <button 
              onClick={onExit}
              style={{
                backgroundColor: '#f87171',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '0.5rem 1rem',
                cursor: 'pointer'
              }}
            >
              {t('exit')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LimitedDefense;