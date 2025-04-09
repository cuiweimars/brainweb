import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './styles.css';

// 游戏设置
const GRID_SIZE = 10; // 10x10的网格
const TILE_SIZE = 50; // 每个格子50px
const STARTING_MONEY = 100;
const STARTING_LIVES = 10;

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

// 塔属性
interface Tower {
  type: TowerType;
  position: { x: number; y: number };
  damage: number;
  range: number;
  cost: number;
  fireRate: number;
  lastFired: number;
  level: number;
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
  isDead: boolean;
}

// 游戏道具定义
const TOWERS: Record<TowerType, Omit<Tower, 'position' | 'lastFired' | 'level'>> = {
  [TowerType.BASIC]: {
    type: TowerType.BASIC,
    damage: 10,
    range: 2,
    cost: 20,
    fireRate: 1000, // 发射间隔(毫秒)
  },
  [TowerType.SNIPER]: {
    type: TowerType.SNIPER,
    damage: 25,
    range: 4,
    cost: 40,
    fireRate: 1500,
  },
  [TowerType.CANNON]: {
    type: TowerType.CANNON,
    damage: 15,
    range: 2,
    cost: 60,
    fireRate: 2000,
  },
};

// 敌人定义
const ENEMIES: Record<EnemyType, Omit<Enemy, 'id' | 'position' | 'pathIndex' | 'isDead'>> = {
  [EnemyType.NORMAL]: {
    type: EnemyType.NORMAL,
    health: 50,
    maxHealth: 50,
    speed: 0.5,
    reward: 10,
  },
  [EnemyType.FAST]: {
    type: EnemyType.FAST,
    health: 30,
    maxHealth: 30,
    speed: 1,
    reward: 15,
  },
  [EnemyType.STRONG]: {
    type: EnemyType.STRONG,
    health: 100,
    maxHealth: 100,
    speed: 0.3,
    reward: 20,
  },
};

// 组件属性
interface LimitedDefenseProps {
  difficulty?: 'easy' | 'medium' | 'hard';
  onComplete?: (score: number) => void;
  onExit?: () => void;
}

const LimitedDefense: React.FC<LimitedDefenseProps> = ({ 
  difficulty = 'medium', 
  onComplete, 
  onExit 
}) => {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'loading' | 'playing' | 'paused' | 'gameOver' | 'victory'>('loading');
  const [money, setMoney] = useState(STARTING_MONEY);
  const [lives, setLives] = useState(STARTING_LIVES);
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [towers, setTowers] = useState<Tower[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [selectedTile, setSelectedTile] = useState<{x: number, y: number} | null>(null);
  const [selectedTower, setSelectedTower] = useState<TowerType | null>(null);
  const [isPlacingTower, setIsPlacingTower] = useState(false);

  // 游戏路径 - 敌人将沿此路径移动
  const path = [
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
    { x: 9, y: 6 },
  ];
  
  // 初始化游戏
  useEffect(() => {
    setTimeout(() => {
      setGameState('playing');
    }, 1000);
    
    return () => {
      // 清除所有游戏定时器
    };
  }, []);

  // 生成新的敌人波次
  const spawnWave = () => {
    const waveSize = 5 + Math.floor(wave / 2); // 随波次增加敌人数量
    const newEnemies: Enemy[] = [];
    
    for (let i = 0; i < waveSize; i++) {
      let enemyType: EnemyType;
      const chance = Math.random();
      
      if (wave > 5 && chance > 0.7) {
        enemyType = EnemyType.STRONG;
      } else if (wave > 3 && chance > 0.5) {
        enemyType = EnemyType.FAST;
      } else {
        enemyType = EnemyType.NORMAL;
      }
      
      const enemy = {
        ...ENEMIES[enemyType],
        id: Date.now() + i,
        position: { ...path[0] }, // 从路径起点开始
        pathIndex: 0,
        isDead: false,
      };
      
      // 根据难度调整敌人属性
      if (difficulty === 'hard') {
        enemy.health *= 1.5;
        enemy.maxHealth *= 1.5;
      } else if (difficulty === 'easy') {
        enemy.health *= 0.8;
        enemy.maxHealth *= 0.8;
      }
      
      newEnemies.push(enemy as Enemy);
    }
    
    setEnemies(prev => [...prev, ...newEnemies]);
  };

  // 处理放置塔
  const handlePlaceTower = (x: number, y: number) => {
    if (!selectedTower) return;
    
    // 检查是否有足够的金钱
    const towerCost = TOWERS[selectedTower].cost;
    if (money < towerCost) return;
    
    // 检查位置是否已有塔或在路径上
    const isOnPath = path.some(point => point.x === x && point.y === y);
    const towerExists = towers.some(tower => tower.position.x === x && tower.position.y === y);
    
    if (isOnPath || towerExists) return;
    
    // 创建新塔
    const newTower: Tower = {
      ...TOWERS[selectedTower],
      position: { x, y },
      lastFired: 0,
      level: 1,
    };
    
    setTowers([...towers, newTower]);
    setMoney(money - towerCost);
    setIsPlacingTower(false);
    setSelectedTower(null);
  };

  // 升级塔
  const upgradeTower = (towerIndex: number) => {
    const tower = towers[towerIndex];
    const upgradeCost = Math.floor(tower.cost * 0.5 * tower.level);
    
    if (money >= upgradeCost && tower.level < 3) {
      const updatedTowers = [...towers];
      updatedTowers[towerIndex] = {
        ...tower,
        damage: Math.floor(tower.damage * 1.3),
        range: tower.range + 0.2,
        fireRate: Math.max(tower.fireRate * 0.85, 200), // 最小发射间隔200ms
        level: tower.level + 1,
      };
      
      setTowers(updatedTowers);
      setMoney(money - upgradeCost);
    }
  };

  // 出售塔
  const sellTower = (towerIndex: number) => {
    const tower = towers[towerIndex];
    const sellValue = Math.floor(tower.cost * 0.7);
    
    const updatedTowers = [...towers];
    updatedTowers.splice(towerIndex, 1);
    
    setTowers(updatedTowers);
    setMoney(money + sellValue);
  };

  // 处理用户点击
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState !== 'playing') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / TILE_SIZE);
    const y = Math.floor((e.clientY - rect.top) / TILE_SIZE);
    
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return;
    
    if (isPlacingTower) {
      handlePlaceTower(x, y);
    } else {
      // 检查是否点击了塔
      const towerIndex = towers.findIndex(tower => 
        tower.position.x === x && tower.position.y === y
      );
      
      if (towerIndex !== -1) {
        setSelectedTile({ x, y });
      } else {
        setSelectedTile(null);
      }
    }
  };

  // 开始游戏
  const startGame = () => {
    setGameState('playing');
    spawnWave();
  };
  
  // 重新开始游戏
  const restartGame = () => {
    setMoney(STARTING_MONEY);
    setLives(STARTING_LIVES);
    setScore(0);
    setWave(1);
    setTowers([]);
    setEnemies([]);
    setSelectedTile(null);
    setSelectedTower(null);
    setIsPlacingTower(false);
    setGameState('playing');
    spawnWave();
  };

  // 处理退出游戏
  const handleExit = () => {
    if (onExit) onExit();
  };

  return (
    <div className="limited-defense-game">
      {gameState === 'loading' && (
        <div className="game-loading">
          <h2>{t('loading')}</h2>
          <div className="spinner"></div>
        </div>
      )}
      
      {gameState !== 'loading' && (
        <div className="game-container">
          <div className="game-header">
            <div className="stats">
              <div className="stat">
                <span>{t('money')}:</span> 
                <span className="value">{money}</span>
              </div>
              <div className="stat">
                <span>{t('lives')}:</span> 
                <span className="value">{lives}</span>
              </div>
              <div className="stat">
                <span>{t('wave')}:</span> 
                <span className="value">{wave}</span>
              </div>
              <div className="stat">
                <span>{t('score')}:</span> 
                <span className="value">{score}</span>
              </div>
            </div>
            
            <div className="game-controls">
              {gameState === 'paused' && (
                <button className="btn play-btn" onClick={() => setGameState('playing')}>
                  {t('continue')}
                </button>
              )}
              {gameState === 'playing' && (
                <button className="btn pause-btn" onClick={() => setGameState('paused')}>
                  {t('pause')}
                </button>
              )}
              <button className="btn exit-btn" onClick={handleExit}>
                {t('exit')}
              </button>
            </div>
          </div>
          
          <div className="game-board">
            <canvas 
              ref={canvasRef}
              width={GRID_SIZE * TILE_SIZE}
              height={GRID_SIZE * TILE_SIZE}
              onClick={handleClick}
              className="game-canvas"
            />
            
            <div className="tower-controls">
              <h3>{t('towers')}</h3>
              <div className="tower-buttons">
                <button 
                  className={`tower-btn ${selectedTower === TowerType.BASIC ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedTower(TowerType.BASIC);
                    setIsPlacingTower(true);
                  }}
                  disabled={money < TOWERS[TowerType.BASIC].cost}
                >
                  <div className="tower-icon basic"></div>
                  <div className="tower-info">
                    <div className="tower-name">{t('basic_tower')}</div>
                    <div className="tower-cost">{TOWERS[TowerType.BASIC].cost}</div>
                  </div>
                </button>
                
                <button 
                  className={`tower-btn ${selectedTower === TowerType.SNIPER ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedTower(TowerType.SNIPER);
                    setIsPlacingTower(true);
                  }}
                  disabled={money < TOWERS[TowerType.SNIPER].cost}
                >
                  <div className="tower-icon sniper"></div>
                  <div className="tower-info">
                    <div className="tower-name">{t('sniper_tower')}</div>
                    <div className="tower-cost">{TOWERS[TowerType.SNIPER].cost}</div>
                  </div>
                </button>
                
                <button 
                  className={`tower-btn ${selectedTower === TowerType.CANNON ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedTower(TowerType.CANNON);
                    setIsPlacingTower(true);
                  }}
                  disabled={money < TOWERS[TowerType.CANNON].cost}
                >
                  <div className="tower-icon cannon"></div>
                  <div className="tower-info">
                    <div className="tower-name">{t('cannon_tower')}</div>
                    <div className="tower-cost">{TOWERS[TowerType.CANNON].cost}</div>
                  </div>
                </button>
              </div>
              
              {isPlacingTower && (
                <button 
                  className="cancel-btn"
                  onClick={() => {
                    setIsPlacingTower(false);
                    setSelectedTower(null);
                  }}
                >
                  {t('cancel')}
                </button>
              )}
            </div>
          </div>
          
          {gameState === 'gameOver' && (
            <div className="game-over-modal">
              <h2>{t('game_over')}</h2>
              <p>{t('final_score')}: {score}</p>
              <div className="modal-buttons">
                <button className="btn restart-btn" onClick={restartGame}>{t('play_again')}</button>
                <button className="btn exit-btn" onClick={handleExit}>{t('exit')}</button>
              </div>
            </div>
          )}
          
          {gameState === 'victory' && (
            <div className="victory-modal">
              <h2>{t('victory')}</h2>
              <p>{t('final_score')}: {score}</p>
              <div className="modal-buttons">
                <button className="btn restart-btn" onClick={restartGame}>{t('play_again')}</button>
                <button className="btn exit-btn" onClick={handleExit}>{t('exit')}</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LimitedDefense;