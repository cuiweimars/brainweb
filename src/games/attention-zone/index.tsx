import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import './AttentionZone.css';

// 游戏类型和接口定义
interface AttentionZoneProps {
  difficulty: 'easy' | 'medium' | 'hard';
  onGameComplete?: (score: number, accuracy: number, timeSpent: number) => void;
  onExit?: () => void;
}

interface Cell {
  id: number;
  highlighted: boolean;
  selected: boolean;
  showResult: boolean;
  isCorrect: boolean;
}

type GamePhase = 'memorize' | 'recall' | 'feedback' | 'waiting';
type GameState = 'intro' | 'playing' | 'paused' | 'gameOver';

// 游戏配置
const gameConfig = {
  easy: {
    gridSize: 3,
    highlightCount: 3,
    rounds: 5,
    timeLimit: 300000, // 5分钟
    memorizeTime: 3000, // 3秒钟记忆时间
    waitTime: 1000     // 等待1秒
  },
  medium: {
    gridSize: 4,
    highlightCount: 5,
    rounds: 8,
    timeLimit: 300000,
    memorizeTime: 2500, // 2.5秒钟记忆时间
    waitTime: 1000
  },
  hard: {
    gridSize: 5,
    highlightCount: 8,
    rounds: 10,
    timeLimit: 300000,
    memorizeTime: 2000, // 2秒钟记忆时间
    waitTime: 1000
  },
};

// 主游戏组件
const AttentionZone: React.FC<AttentionZoneProps> = ({
  difficulty = 'medium',
  onGameComplete,
  onExit
}) => {
  const { t } = useTranslation();
  // 游戏状态，默认直接开始游戏
  const [gameState, setGameState] = useState<GameState>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const showIntro = urlParams.get('showIntro') === 'true';
    return showIntro ? 'intro' : 'playing';
  });
  
  const [grid, setGrid] = useState<Cell[]>([]);
  const [phase, setPhase] = useState<GamePhase>('waiting');
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [correctSelections, setCorrectSelections] = useState(0);
  const [totalSelections, setTotalSelections] = useState(0);
  const [highlightedCells, setHighlightedCells] = useState<number[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isGameCompleted, setIsGameCompleted] = useState(false);
  const [phaseEndTime, setPhaseEndTime] = useState<number | null>(null);

  // 初始化网格
  const initializeGrid = useCallback(() => {
    const size = gameConfig[difficulty].gridSize;
    const totalCells = size * size;
    const newGrid: Cell[] = [];
    
    for (let i = 0; i < totalCells; i++) {
      newGrid.push({
        id: i,
        highlighted: false,
        selected: false,
        showResult: false,
        isCorrect: false,
      });
    }
    
    return newGrid;
  }, [difficulty]);

  // 自动初始化游戏
  useEffect(() => {
    if (gameState === 'playing' && grid.length === 0) {
      const newGrid = initializeGrid();
      setGrid(newGrid);
      setScore(0);
      setCorrectSelections(0);
      setTotalSelections(0);
      setCurrentRound(0);
      setElapsedTime(0);
      setStartTime(Date.now());
      setIsGameCompleted(false);
      
      // 开始第一轮
      startNewRound(newGrid);
    }
  }, [gameState, grid.length, initializeGrid]);

  // 开始新游戏
  const startGame = useCallback(() => {
    const newGrid = initializeGrid();
    setGrid(newGrid);
    setScore(0);
    setCorrectSelections(0);
    setTotalSelections(0);
    setCurrentRound(0);
    setElapsedTime(0);
    setStartTime(Date.now());
    setGameState('playing');
    setIsGameCompleted(false);
    
    // 开始第一轮
    startNewRound(newGrid);
  }, [initializeGrid]);

  // 选择难度并立即开始游戏
  const startGameWithDifficulty = useCallback((newDifficulty: 'easy' | 'medium' | 'hard') => {
    window.location.href = `/game/attention-zone?difficulty=${newDifficulty}`;
  }, []);

  // 暂停游戏
  const pauseGame = useCallback(() => {
    if (gameState === 'playing') {
      setGameState('paused');
      // 保存当前时间以便恢复
      if (phaseEndTime !== null) {
        const remaining = phaseEndTime - Date.now();
        setPhaseEndTime(remaining > 0 ? remaining : 0);
      }
    } else if (gameState === 'paused') {
      setGameState('playing');
      // 恢复计时
      if (phaseEndTime !== null) {
        setPhaseEndTime(Date.now() + phaseEndTime);
      }
      setStartTime(Date.now() - elapsedTime);
    }
  }, [gameState, elapsedTime, phaseEndTime]);

  // 结束游戏
  const endGame = useCallback((completed = false) => {
    setGameState('gameOver');
    setIsGameCompleted(completed);
    
    if (onGameComplete && completed) {
      const accuracy = totalSelections > 0 ? (correctSelections / totalSelections) * 100 : 0;
      onGameComplete(score, accuracy, elapsedTime);
    }
  }, [onGameComplete, score, correctSelections, totalSelections, elapsedTime]);

  // 随机选择要高亮的单元格
  const getRandomCells = useCallback((count: number, gridSize: number) => {
    const totalCells = gridSize * gridSize;
    const cells: number[] = [];
    
    while (cells.length < count) {
      const randomCell = Math.floor(Math.random() * totalCells);
      if (!cells.includes(randomCell)) {
        cells.push(randomCell);
      }
    }
    
    return cells;
  }, []);

  // 开始新一轮
  const startNewRound = useCallback((prevGrid: Cell[] = []) => {
    // 如果已到达最大回合数，结束游戏
    if (currentRound >= gameConfig[difficulty].rounds) {
      endGame(true);
      return;
    }

    // 创建网格的单元格数量
    const totalCells = gameConfig[difficulty].gridSize * gameConfig[difficulty].gridSize;

    // 重置网格
    const resetGrid = Array.from({ length: totalCells }).map((_, index) => ({
      id: index,
      highlighted: false,
      selected: false,
      showResult: false,
      isCorrect: false
    }));

    // 如果之前的网格为空，设置初始网格
    if (prevGrid.length === 0) {
      setGrid(resetGrid);
    }

    // 随机选择要高亮的单元格
    const randomCells = getRandomCells(
      gameConfig[difficulty].highlightCount,
      gameConfig[difficulty].gridSize
    );
    
    setHighlightedCells(randomCells);
    
    // 先确保grid是重置状态
    setGrid(resetGrid);
    
    // 短暂延迟后显示高亮单元格，确保界面已刷新
    setTimeout(() => {
      // 设置高亮状态
      const highlightedGrid = resetGrid.map((cell, index) => ({
        ...cell,
        highlighted: randomCells.includes(index),
      }));
      
      setGrid(highlightedGrid);
      setPhase('memorize');
      
      // 设置记忆阶段结束时间
      const memorizeEndTime = Date.now() + gameConfig[difficulty].memorizeTime;
      setPhaseEndTime(memorizeEndTime);
      
      // 记忆阶段结束后进入回忆阶段
      const timerId = setTimeout(() => {
        const recallGrid = highlightedGrid.map(cell => ({
          ...cell,
          highlighted: false,
        }));
        
        setGrid(recallGrid);
        setPhase('recall');
        setPhaseEndTime(null);
      }, gameConfig[difficulty].memorizeTime);
    }, 500);  // 500ms延迟确保界面刷新
  }, [currentRound, difficulty, endGame, getRandomCells]);

  // 处理单元格点击
  const handleCellClick = useCallback((id: number) => {
    if (phase !== 'recall' || gameState !== 'playing') return;
    
    setGrid(prev => {
      // 如果单元格已经被选中，则不做任何事
      if (prev[id].selected) return prev;
      
      // 标记为选中
      const updatedGrid = prev.map((cell, index) => (
        index === id ? { ...cell, selected: true } : cell
      ));
      
      // 更新选择计数
      setTotalSelections(count => count + 1);
      
      // 检查是否正确
      const isCorrect = highlightedCells.includes(id);
      if (isCorrect) {
        setCorrectSelections(count => count + 1);
        setScore(s => s + 10);
      } else {
        setScore(s => Math.max(0, s - 5));
      }
      
      // 检查是否已经选择了所有高亮单元格
      const selectedHighlightedCount = highlightedCells.filter(cellId => 
        cellId === id || prev[cellId].selected
      ).length;
      
      // 如果选择了所有高亮单元格或者选择了错误的单元格
      if (selectedHighlightedCount === highlightedCells.length || !isCorrect) {
        // 显示结果
        const resultGrid = updatedGrid.map((cell, index) => ({
          ...cell,
          showResult: true,
          isCorrect: highlightedCells.includes(index) 
            ? cell.selected 
            : !cell.selected,
        }));
        
        setGrid(resultGrid);
        setPhase('feedback');
        
        // 显示结果一段时间后进入下一轮
        const feedbackEndTime = Date.now() + gameConfig[difficulty].waitTime;
        setPhaseEndTime(feedbackEndTime);
        
        setTimeout(() => {
          setCurrentRound(round => round + 1);
          setPhase('waiting');
          
          // 短暂等待后开始下一轮
          setTimeout(() => {
            startNewRound(resultGrid);
          }, gameConfig[difficulty].waitTime);
        }, gameConfig[difficulty].waitTime);
      }
      
      return updatedGrid;
    });
  }, [phase, gameState, highlightedCells, difficulty, startNewRound]);

  // 计时器
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (gameState === 'playing' && startTime !== null) {
      timer = setInterval(() => {
        const now = Date.now();
        const newElapsedTime = now - startTime;
        setElapsedTime(newElapsedTime);
        
        if (newElapsedTime >= gameConfig[difficulty].timeLimit) {
          endGame(false);
        }
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameState, startTime, difficulty, endGame]);

  // 格式化时间显示
  const formatTime = useCallback((ms: number) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // 计算剩余时间
  const remainingTime = useMemo(() => {
    return Math.max(0, gameConfig[difficulty].timeLimit - elapsedTime);
  }, [difficulty, elapsedTime]);

  // 计算网格列数
  const gridColumns = useMemo(() => {
    return gameConfig[difficulty].gridSize;
  }, [difficulty]);

  // 渲染介绍画面
  const renderIntro = () => (
    <div className="attention-zone-intro fade-in">
      <h1 className="attention-zone-intro-title">{t('attention_zone_title', 'Attention Zone')}</h1>
      <div className="attention-zone-intro-image">
        <svg viewBox="0 0 100 100" width="200" height="200">
          <rect x="10" y="10" width="80" height="80" fill="#4f46e5" opacity="0.15" rx="4" />
          <rect x="25" y="25" width="15" height="15" fill="#4f46e5" rx="2" />
          <rect x="45" y="25" width="15" height="15" fill="#4f46e5" rx="2" />
          <rect x="65" y="25" width="15" height="15" fill="#4f46e5" rx="2" opacity="0.3" />
          <rect x="25" y="45" width="15" height="15" fill="#4f46e5" rx="2" opacity="0.3" />
          <rect x="45" y="45" width="15" height="15" fill="#4f46e5" rx="2" opacity="0.3" />
          <rect x="65" y="45" width="15" height="15" fill="#4f46e5" rx="2" />
          <rect x="25" y="65" width="15" height="15" fill="#4f46e5" rx="2" />
          <rect x="45" y="65" width="15" height="15" fill="#4f46e5" rx="2" opacity="0.3" />
          <rect x="65" y="65" width="15" height="15" fill="#4f46e5" rx="2" opacity="0.3" />
        </svg>
      </div>
      <p className="attention-zone-intro-text">
        {t('attention_zone_intro_text', 'Attention Zone tests your visual memory and attention. Remember the positions of highlighted squares, then click on those positions after they disappear.')}
      </p>
      <div className="attention-zone-instructions">
        <h3 className="attention-zone-instruction-title">{t('how_to_play', 'How to Play:')}</h3>
        <ol className="attention-zone-instruction-list">
          <li className="attention-zone-instruction-item">
            <strong>{t('gameplay_step1_title', 'Memorize Phase:')}</strong> {t('gameplay_step1', 'Squares will be highlighted briefly on the screen. Observe and remember their positions.')}
          </li>
          <li className="attention-zone-instruction-item">
            <strong>{t('gameplay_step2_title', 'Recall Phase:')}</strong> {t('gameplay_step2', 'After the highlights disappear, click on the positions where you saw them.')}
          </li>
          <li className="attention-zone-instruction-item">
            <strong>{t('gameplay_step3_title', 'Scoring Rules:')}</strong> {t('gameplay_step3', 'Earn 10 points for each correct click, lose 5 points for incorrect clicks.')}
          </li>
          <li className="attention-zone-instruction-item">
            <strong>{t('gameplay_step4_title', 'Game Goal:')}</strong> {t('gameplay_step4', 'Complete all rounds and achieve the highest score!')}
          </li>
        </ol>
      </div>
      <div className="attention-zone-difficulty-selector">
        <button
          className={`attention-zone-difficulty-button ${difficulty === 'easy' ? 'selected' : ''}`}
          onClick={() => startGameWithDifficulty('easy')}
        >
          {t('play_easy', 'Play Easy')}
        </button>
        <button
          className={`attention-zone-difficulty-button ${difficulty === 'medium' ? 'selected' : ''}`}
          onClick={() => startGameWithDifficulty('medium')}
        >
          {t('play_medium', 'Play Medium')}
        </button>
        <button
          className={`attention-zone-difficulty-button ${difficulty === 'hard' ? 'selected' : ''}`}
          onClick={() => startGameWithDifficulty('hard')}
        >
          {t('play_hard', 'Play Hard')}
        </button>
      </div>
      <button
        className="attention-zone-button attention-zone-button-primary"
        onClick={startGame}
      >
        {t('start_game', 'Start Game')}
      </button>
    </div>
  );

  // 渲染暂停画面
  const renderPausedScreen = () => (
    <div className="attention-zone-modal">
      <div className="attention-zone-modal-content">
        <h2 className="attention-zone-modal-title">{t('game_paused', 'Game Paused')}</h2>
        <p className="attention-zone-modal-text">{t('game_paused_text', 'Take a break. Ready to continue?')}</p>
        <div className="attention-zone-modal-buttons">
          <button
            className="attention-zone-button attention-zone-button-secondary"
            onClick={() => onExit && onExit()}
          >
            {t('exit_game', 'Exit Game')}
          </button>
          <button
            className="attention-zone-button attention-zone-button-primary"
            onClick={pauseGame}
          >
            {t('resume_game', 'Resume Game')}
          </button>
        </div>
      </div>
    </div>
  );

  // 渲染游戏结束画面
  const renderGameOver = () => (
    <div className="attention-zone-game-over fade-in">
      <h1 className="attention-zone-game-over-title">
        {isGameCompleted ? t('game_completed', 'Game Completed!') : t('game_over', 'Game Over')}
      </h1>
      <div className="attention-zone-game-over-image">
        <svg viewBox="0 0 100 100" width="200" height="200">
          {isGameCompleted ? (
            // 成功完成的图案
            <>
              <circle cx="50" cy="50" r="40" fill="#10b981" opacity="0.2" />
              <path
                d="M30 50 L45 65 L70 35"
                stroke="#10b981"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          ) : (
            // 游戏结束的图案
            <>
              <circle cx="50" cy="50" r="40" fill="#ef4444" opacity="0.2" />
              <path
                d="M35 35 L65 65 M65 35 L35 65"
                stroke="#ef4444"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}
        </svg>
      </div>
      <p className="attention-zone-game-over-text">
        {isGameCompleted
          ? t('game_completed_message', 'Congratulations! You completed all rounds.')
          : t('game_over_message', 'Time\'s up! Better luck next time.')}
      </p>
      <div className="attention-zone-game-over-stats">
        <div className="attention-zone-game-over-stat">
          <span className="attention-zone-game-over-stat-label">{t('score', 'Score')}</span>
          <span className="attention-zone-game-over-stat-value">{score}</span>
        </div>
        <div className="attention-zone-game-over-stat">
          <span className="attention-zone-game-over-stat-label">{t('time_spent', 'Time Spent')}</span>
          <span className="attention-zone-game-over-stat-value">{formatTime(elapsedTime)}</span>
        </div>
        <div className="attention-zone-game-over-stat">
          <span className="attention-zone-game-over-stat-label">{t('accuracy', 'Accuracy')}</span>
          <span className="attention-zone-game-over-stat-value">
            {totalSelections > 0 ? Math.round((correctSelections / totalSelections) * 100) : 0}%
          </span>
        </div>
        <div className="attention-zone-game-over-stat">
          <span className="attention-zone-game-over-stat-label">{t('rounds_completed', 'Rounds Completed')}</span>
          <span className="attention-zone-game-over-stat-value">
            {Math.min(currentRound, gameConfig[difficulty].rounds)}
          </span>
        </div>
      </div>
      <div className="attention-zone-modal-buttons">
        <button
          className="attention-zone-button attention-zone-button-secondary"
          onClick={() => onExit && onExit()}
        >
          {t('exit_game', 'Exit Game')}
        </button>
        <button
          className="attention-zone-button attention-zone-button-primary"
          onClick={startGame}
        >
          {t('play_again', 'Play Again')}
        </button>
      </div>
    </div>
  );

  // 获取当前阶段的状态文本
  const getPhaseText = useCallback(() => {
    switch (phase) {
      case 'memorize':
        return t('memorize_phase', 'Memorize Square Positions');
      case 'recall':
        return t('recall_phase', 'Click Highlighted Positions');
      case 'feedback':
        return t('feedback_phase', 'View Results');
      case 'waiting':
        return t('waiting_phase', 'Preparing Next Round...');
      default:
        return '';
    }
  }, [phase, t]);

  // 渲染游戏界面
  const renderGameplay = () => {
    if (grid.length === 0) return null;
    
    return (
      <div className="attention-zone-gameplay">
        <div className="attention-zone-header">
          <div className="attention-zone-title">{t('attention_zone_title', 'Attention Zone')}</div>
          <div className="attention-zone-info">
            <div className="attention-zone-stat">
              <span className="attention-zone-stat-label">{t('score', 'Score')}</span>
              <span className="attention-zone-stat-value">{score}</span>
            </div>
            <div className="attention-zone-stat">
              <span className="attention-zone-stat-label">{t('time', 'Time')}</span>
              <span className="attention-zone-stat-value">{formatTime(remainingTime)}</span>
            </div>
            <div className="attention-zone-stat">
              <span className="attention-zone-stat-label">{t('round', 'Round')}</span>
              <span className="attention-zone-stat-value">{currentRound + 1}/{gameConfig[difficulty].rounds}</span>
            </div>
          </div>
        </div>
        
        <div className="attention-zone-content">
          <div className="attention-zone-controls">
            <div className="attention-zone-left-controls">
              <button
                className="attention-zone-button attention-zone-button-secondary"
                onClick={() => setGameState('paused')}
              >
                {t('pause', 'Pause')}
              </button>
              <div className="attention-zone-difficulty-info">
                {t('difficulty', 'Difficulty')}: <span className="attention-zone-difficulty-value">
                  {difficulty === 'easy' ? t('easy', 'Easy') : 
                   difficulty === 'medium' ? t('medium', 'Medium') : 
                   t('hard', 'Hard')}
                </span>
              </div>
            </div>
          </div>
          
          <div className={`attention-zone-grid attention-zone-grid-${gridColumns}`}
            style={{ gridTemplateColumns: `repeat(${gridColumns}, 1fr)` }}>
            {grid.map((cell) => (
              <div
                key={cell.id}
                className={`attention-zone-cell
                  ${cell.highlighted ? 'highlighted' : ''}
                  ${cell.selected ? 'selected' : ''}
                  ${cell.showResult ? (cell.isCorrect ? 'correct' : 'incorrect') : ''}
                  ${phase === 'recall' ? 'clickable' : ''}
                `}
                onClick={() => handleCellClick(cell.id)}
              >
                {cell.showResult && (
                  <div className="attention-zone-cell-result">
                    {cell.isCorrect ? '✓' : '✗'}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="attention-zone-phase-indicator">
            <div className="attention-zone-phase-text">{getPhaseText()}</div>
            {phase === 'memorize' && phaseEndTime && (
              <div className="attention-zone-phase-timer">
                {Math.ceil((phaseEndTime - Date.now()) / 1000)}s
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Main component render
  return (
    <div className="attention-zone-container">
      {gameState === 'intro' && renderIntro()}
      {gameState === 'playing' && renderGameplay()}
      {gameState === 'paused' && renderPausedScreen()}
      {gameState === 'gameOver' && renderGameOver()}
    </div>
  );
};

export default AttentionZone;