import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './SpatialMemory.css';

interface CellProps {
  index: number;
  highlighted: boolean;
  onClick: (index: number) => void;
  disabled: boolean;
  correct?: boolean;
  incorrect?: boolean;
}

const Cell: React.FC<CellProps> = ({ 
  index, 
  highlighted, 
  onClick, 
  disabled, 
  correct = false,
  incorrect = false
}) => {
  const classNames = [
    'spatial-memory-cell',
    highlighted ? 'highlight' : '',
    correct ? 'correct' : '',
    incorrect ? 'incorrect' : '',
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={classNames} 
      onClick={() => !disabled && onClick(index)}
      aria-label={`Cell ${index}`}
    />
  );
};

type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

interface DifficultyConfig {
  gridSize: number;
  initialCells: number;
  cellsIncreasePerLevel: number;
  timeToMemorize: number;
  timeToRespond: number;
}

const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    gridSize: 3,
    initialCells: 3,
    cellsIncreasePerLevel: 1,
    timeToMemorize: 2000,
    timeToRespond: 5000,
  },
  medium: {
    gridSize: 4,
    initialCells: 4,
    cellsIncreasePerLevel: 1,
    timeToMemorize: 1800,
    timeToRespond: 4500,
  },
  hard: {
    gridSize: 5,
    initialCells: 5, 
    cellsIncreasePerLevel: 2,
    timeToMemorize: 1500,
    timeToRespond: 4000,
  },
  expert: {
    gridSize: 6,
    initialCells: 6,
    cellsIncreasePerLevel: 2,
    timeToMemorize: 1200,
    timeToRespond: 3500,
  },
};

interface SpatialMemoryProps {
  difficulty?: Difficulty;
  onGameComplete?: (score: number, moves: number, time: number) => void;
  onExit?: () => void;
}

const SpatialMemory: React.FC<SpatialMemoryProps> = ({ 
  difficulty: propDifficulty,
  onGameComplete,
  onExit
}) => {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState<Difficulty>(propDifficulty || 'medium');
  const [gameState, setGameState] = useState<'idle' | 'memorizing' | 'recalling' | 'gameOver'>('idle');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [cells, setCells] = useState<boolean[]>([]);
  const [highlightedCells, setHighlightedCells] = useState<number[]>([]);
  const [userSelections, setUserSelections] = useState<number[]>([]);
  const [correctCells, setCorrectCells] = useState<number[]>([]);
  const [incorrectCells, setIncorrectCells] = useState<number[]>([]);
  const [message, setMessage] = useState<string>('');
  const [showLevelBadge, setShowLevelBadge] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(100);
  const [gameOverData, setGameOverData] = useState<{score: number, level: number} | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const soundEnabledRef = useRef<boolean>(true);
  
  const config = DIFFICULTY_CONFIGS[difficulty];
  const totalCells = config.gridSize * config.gridSize;
  const cellsToHighlight = config.initialCells + (level - 1) * config.cellsIncreasePerLevel;

  // Initialize the grid
  useEffect(() => {
    const initialCells = Array(totalCells).fill(false);
    setCells(initialCells);
  }, [difficulty, totalCells]);
  
  // Load high score from localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem(`spatialMemory_highScore_${difficulty}`);
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, [difficulty]);
  
  // Save high score to localStorage when it changes
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem(`spatialMemory_highScore_${difficulty}`, score.toString());
    }
  }, [score, highScore, difficulty]);
  
  // Sound effects
  const playSound = (type: 'correct' | 'incorrect' | 'levelUp' | 'gameOver') => {
    if (!soundEnabledRef.current) return;
    
    const frequencies: Record<string, number> = {
      correct: 523.25, // C5
      incorrect: 261.63, // C4
      levelUp: 783.99, // G5
      gameOver: 196.00, // G3
    };
    
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    
    oscillator.type = type === 'incorrect' ? 'sawtooth' : 'sine';
    oscillator.frequency.value = frequencies[type];
    
    gain.gain.value = 0.2;
    oscillator.start();
    
    const duration = type === 'levelUp' ? 600 : 300;
    
    if (type === 'levelUp' || type === 'gameOver') {
      oscillator.frequency.setValueAtTime(frequencies[type], ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        frequencies[type] * 1.5, 
        ctx.currentTime + duration / 1000
      );
    }
    
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
    
    setTimeout(() => {
      oscillator.stop();
    }, duration);
  };
  
  // Clear any existing timers
  const clearTimers = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
  
  // Generate random cells to highlight
  const generateRandomCells = () => {
    let availableCells = Array.from({ length: totalCells }, (_, i) => i);
    const randomCells: number[] = [];
    
    for (let i = 0; i < Math.min(cellsToHighlight, totalCells); i++) {
      const randomIndex = Math.floor(Math.random() * availableCells.length);
      const cellIndex = availableCells[randomIndex];
      randomCells.push(cellIndex);
      availableCells.splice(randomIndex, 1);
    }
    
    return randomCells;
  };
  
  // Start a new round
  const startRound = () => {
    clearTimers();
    
    setUserSelections([]);
    setCorrectCells([]);
    setIncorrectCells([]);
    setTimeRemaining(100);
    
    const randomCells = generateRandomCells();
    setHighlightedCells(randomCells);
    setGameState('memorizing');
    setMessage(t('memorize_pattern'));
    
    // After timeToMemorize, hide the cells and let the user recall
    setTimeout(() => {
      setGameState('recalling');
      setMessage(t('recall_pattern'));
      
      // Start the timer for recalling
      const timeToRespond = config.timeToRespond;
      const intervalTime = 100;
      const steps = timeToRespond / intervalTime;
      let remainingSteps = steps;
      
      timerRef.current = setInterval(() => {
        remainingSteps--;
        const percentRemaining = (remainingSteps / steps) * 100;
        setTimeRemaining(percentRemaining);
        
        if (remainingSteps <= 0) {
          clearTimers();
          handleGameOver();
        }
      }, intervalTime);
    }, config.timeToMemorize);
  };
  
  // Start a new game
  const startGame = () => {
    setLevel(1);
    setScore(0);
    setGameState('idle');
    setMessage('');
    setGameOverData(null);
    startRound();
  };
  
  // Handle cell click during recall phase
  const handleCellClick = (index: number) => {
    if (gameState !== 'recalling') return;
    
    // Ignore if cell was already selected
    if (userSelections.includes(index)) return;
    
    const newUserSelections = [...userSelections, index];
    setUserSelections(newUserSelections);
    
    const isCorrect = highlightedCells.includes(index);
    
    if (isCorrect) {
      // Mark cell as correct
      setCorrectCells([...correctCells, index]);
      playSound('correct');
      
      // Calculate points based on time remaining and level
      const timeBonus = Math.floor(timeRemaining / 10);
      const pointsEarned = 10 + timeBonus + (level * 2);
      setScore(prevScore => prevScore + pointsEarned);
      
      // Check if all cells have been correctly identified
      const allCorrectCellsFound = highlightedCells.every(cell => 
        newUserSelections.includes(cell) || cell === index
      );
      
      if (allCorrectCellsFound) {
        clearTimers();
        setGameState('idle');
        setMessage(t('level_complete'));
        
        // Show level up notification
        setLevel(prevLevel => prevLevel + 1);
        setShowLevelBadge(true);
        playSound('levelUp');
        
        setTimeout(() => {
          setShowLevelBadge(false);
          startRound();
        }, 1500);
      }
    } else {
      // Mark cell as incorrect
      setIncorrectCells([...incorrectCells, index]);
      playSound('incorrect');
      
      // Game over if wrong cell is clicked
      handleGameOver();
    }
  };
  
  // Handle game over
  const handleGameOver = () => {
    clearTimers();
    setGameState('gameOver');
    playSound('gameOver');
    setGameOverData({ score, level });
    
    // Call the onGameComplete prop if provided
    if (onGameComplete) {
      // Pass score, level as moves, and 0 as time since we don't track exact time
      onGameComplete(score, level, 0);
    }
  };
  
  // Exit game handler
  const handleExitGame = () => {
    if (onExit) {
      onExit();
    }
  };
  
  // Render grid cells
  const renderGrid = () => {
    return cells.map((_, index) => (
      <Cell
        key={index}
        index={index}
        highlighted={gameState === 'memorizing' && highlightedCells.includes(index)}
        correct={correctCells.includes(index)}
        incorrect={incorrectCells.includes(index)}
        onClick={handleCellClick}
        disabled={gameState !== 'recalling'}
      />
    ));
  };
  
  // Render difficulty buttons
  const renderDifficultyButtons = () => {
    const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];
    
    return (
      <div className="difficulty-selector">
        {difficulties.map(d => (
          <button
            key={d}
            className={`difficulty-button ${d === difficulty ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
            onClick={() => setDifficulty(d)}
            disabled={gameState !== 'idle'}
          >
            {t(d)}
          </button>
        ))}
      </div>
    );
  };
  
  return (
    <div className="spatial-memory-container">
      <div className="stats-container">
        <div className="stat-item">
          <span className="stat-label">{t('level')}</span>
          <span className="stat-value">{level}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">{t('score')}</span>
          <span className="stat-value">{score}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">{t('high_score')}</span>
          <span className="stat-value">{highScore}</span>
        </div>
      </div>
      
      <div className="message-display">{message}</div>
      
      <div className={`spatial-memory-grid grid-${config.gridSize}x${config.gridSize}`}>
        {renderGrid()}
        {showLevelBadge && (
          <div className="level-badge">
            {t('level')} {level}
          </div>
        )}
      </div>
      
      <div className="controls-container">
        {gameState === 'idle' && !gameOverData && renderDifficultyButtons()}
        
        {(gameState === 'idle' && !gameOverData) && (
          <button 
            className="start-button"
            onClick={startGame}
          >
            {t('start_game')}
          </button>
        )}
        
        {gameState === 'recalling' && (
          <div className="timer-bar">
            <div 
              className={`timer-progress ${timeRemaining < 30 ? 'timer-critical' : ''}`}
              style={{ width: `${timeRemaining}%` }}
            />
          </div>
        )}
      </div>
      
      {gameState === 'gameOver' && gameOverData && (
        <div className="game-over-overlay">
          <div className="game-over-content dark:text-white">
            <h2 className="text-2xl font-bold mb-4">{t('game_over')}</h2>
            <p className="mb-2">{t('final_score')}: <span className="font-bold">{gameOverData.score}</span></p>
            <p className="mb-4">{t('reached_level')}: <span className="font-bold">{gameOverData.level}</span></p>
            <div className="flex space-x-4 justify-center">
              <button 
                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                onClick={startGame}
              >
                {t('play_again')}
              </button>
              
              {onExit && (
                <button
                  className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
                  onClick={handleExitGame}
                >
                  {t('exit_game')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpatialMemory; 