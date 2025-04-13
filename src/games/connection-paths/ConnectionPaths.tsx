import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
// @ts-ignore
import confetti from 'canvas-confetti';
import './ConnectionPaths.css';

// Difficulty settings
const DIFFICULTY_SETTINGS = {
  easy: {
    gridSize: 5,
    numPaths: 2,
    timeLimit: 180,
    restrictedCells: 2,
    maxLevels: 5,
    hintsAllowed: 2
  },
  medium: {
    gridSize: 6,
    numPaths: 3,
    timeLimit: 240,
    restrictedCells: 4,
    maxLevels: 7,
    hintsAllowed: 1
  },
  hard: {
    gridSize: 7,
    numPaths: 4,
    timeLimit: 300,
    restrictedCells: 6,
    maxLevels: 10,
    hintsAllowed: 0
  }
};

// Types
type Difficulty = 'easy' | 'medium' | 'hard';
type GameStatus = 'idle' | 'playing' | 'paused' | 'levelComplete' | 'gameover';
type Point = [number, number]; // [row, col]
type CellType = 'empty' | 'endpoint' | 'path' | 'restricted';
type Direction = 'up' | 'down' | 'left' | 'right';

interface Cell {
  row: number;
  col: number;
  type: CellType;
  pathId?: number;
  isConnected?: boolean;
}

interface PathConnection {
  id: number;
  start: Point;
  end: Point;
  currentPath: Point[];
  isComplete: boolean;
  color: string;
}

interface Level {
  endpoints: { start: Point; end: Point; id: number; color: string }[];
  restrictedCells: Point[];
  description: string;
}

// Generate a random level
const generateLevel = (
  gridSize: number,
  numPaths: number,
  numRestricted: number
): Level => {
  const endpoints: { start: Point; end: Point; id: number; color: string }[] = [];
  const restrictedCells: Point[] = [];
  const colors = [
    '#3498db', // Blue
    '#2ecc71', // Green
    '#e74c3c', // Red
    '#f39c12', // Orange
    '#9b59b6'  // Purple
  ];
  
  // Generate unique endpoints
  const usedPositions = new Set<string>();
  
  for (let i = 0; i < numPaths; i++) {
    let startRow, startCol, endRow, endCol;
    
    // Generate start point
    do {
      startRow = Math.floor(Math.random() * gridSize);
      startCol = Math.floor(Math.random() * gridSize);
    } while (usedPositions.has(`${startRow},${startCol}`));
    
    usedPositions.add(`${startRow},${startCol}`);
    
    // Generate end point (must be different from start and other endpoints)
    do {
      endRow = Math.floor(Math.random() * gridSize);
      endCol = Math.floor(Math.random() * gridSize);
    } while (usedPositions.has(`${endRow},${endCol}`));
    
    usedPositions.add(`${endRow},${endCol}`);
    
    endpoints.push({
      id: i,
      start: [startRow, startCol] as Point,
      end: [endRow, endCol] as Point,
      color: colors[i % colors.length]
    });
  }
  
  // Generate restricted cells (that can't be used in paths)
  for (let i = 0; i < numRestricted; i++) {
    let row, col;
    
    do {
      row = Math.floor(Math.random() * gridSize);
      col = Math.floor(Math.random() * gridSize);
    } while (usedPositions.has(`${row},${col}`));
    
    usedPositions.add(`${row},${col}`);
    restrictedCells.push([row, col] as Point);
  }
  
  return {
    endpoints,
    restrictedCells,
    description: `Connect ${numPaths} ${numPaths === 1 ? 'path' : 'paths'} without crossing`
  };
};

// Helper to check if two points are the same
const pointsEqual = (p1: Point, p2: Point): boolean => {
  return p1[0] === p2[0] && p1[1] === p2[1];
};

// Helper to check if a point is in an array of points
const pointInArray = (point: Point, array: Point[]): boolean => {
  return array.some(p => pointsEqual(p, point));
};

// Sound effects
const playSoundEffect = (type: 'click' | 'connect' | 'error' | 'levelComplete' | 'gameOver') => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Different sound configurations based on type
    switch (type) {
      case 'click':
        oscillator.type = 'sine';
        oscillator.frequency.value = 440;
        gainNode.gain.value = 0.1;
        oscillator.start();
        setTimeout(() => {
          oscillator.stop();
          audioContext.close();
        }, 100);
        break;
      case 'connect':
        oscillator.type = 'sine';
        oscillator.frequency.value = 660;
        gainNode.gain.value = 0.1;
        oscillator.start();
        setTimeout(() => {
          oscillator.frequency.value = 880;
          setTimeout(() => {
            oscillator.stop();
            audioContext.close();
          }, 150);
        }, 150);
        break;
      case 'error':
        oscillator.type = 'sine';
        oscillator.frequency.value = 220;
        gainNode.gain.value = 0.1;
        oscillator.start();
        setTimeout(() => {
          oscillator.frequency.value = 110;
          setTimeout(() => {
            oscillator.stop();
            audioContext.close();
          }, 200);
        }, 100);
        break;
      case 'levelComplete':
        oscillator.type = 'sine';
        gainNode.gain.value = 0.1;
        oscillator.frequency.value = 440;
        oscillator.start();
        
        setTimeout(() => {
          oscillator.frequency.value = 554;
          setTimeout(() => {
            oscillator.frequency.value = 659;
            setTimeout(() => {
              oscillator.frequency.value = 880;
              setTimeout(() => {
                oscillator.stop();
                audioContext.close();
              }, 200);
            }, 100);
          }, 100);
        }, 100);
        break;
      case 'gameOver':
        oscillator.type = 'sine';
        gainNode.gain.value = 0.1;
        oscillator.frequency.value = 440;
        oscillator.start();
        
        setTimeout(() => {
          oscillator.frequency.value = 523;
          setTimeout(() => {
            oscillator.frequency.value = 659;
            setTimeout(() => {
              oscillator.frequency.value = 880;
              setTimeout(() => {
                oscillator.stop();
                audioContext.close();
              }, 300);
            }, 100);
          }, 100);
        }, 100);
        break;
    }
  } catch (e) {
    console.log('Audio not supported');
  }
};

interface ConnectionPathsProps {
  difficulty?: Difficulty;
  onGameComplete?: (score: number, level: number, timeTaken: number) => void;
  onExit?: () => void;
}

const ConnectionPaths: React.FC<ConnectionPathsProps> = ({
  difficulty = 'medium',
  onGameComplete,
  onExit
}) => {
  const { t } = useTranslation();
  
  // Game state
  const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
  const [settings, setSettings] = useState(DIFFICULTY_SETTINGS[difficulty]);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DIFFICULTY_SETTINGS[difficulty].timeLimit);
  const [hintsLeft, setHintsLeft] = useState(DIFFICULTY_SETTINGS[difficulty].hintsAllowed);
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [connections, setConnections] = useState<PathConnection[]>([]);
  const [activePathId, setActivePathId] = useState<number | null>(null);
  const [lastSelected, setLastSelected] = useState<Point | null>(null);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Refs for timers
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const levelCompleteTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Clear all timers
  const clearAllTimers = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (levelCompleteTimerRef.current) {
      clearTimeout(levelCompleteTimerRef.current);
      levelCompleteTimerRef.current = null;
    }
  }, []);
  
  // Initialize grid
  const initializeGrid = useCallback((levelData: Level) => {
    const { gridSize } = settings;
    const newGrid: Cell[][] = [];
    
    // Create empty grid
    for (let row = 0; row < gridSize; row++) {
      const newRow: Cell[] = [];
      for (let col = 0; col < gridSize; col++) {
        newRow.push({
          row,
          col,
          type: 'empty'
        });
      }
      newGrid.push(newRow);
    }
    
    // Add endpoints
    levelData.endpoints.forEach(({ id, start, end }) => {
      const [startRow, startCol] = start;
      const [endRow, endCol] = end;
      
      newGrid[startRow][startCol] = {
        row: startRow,
        col: startCol,
        type: 'endpoint',
        pathId: id,
        isConnected: false
      };
      
      newGrid[endRow][endCol] = {
        row: endRow,
        col: endCol,
        type: 'endpoint',
        pathId: id,
        isConnected: false
      };
    });
    
    // Add restricted cells
    levelData.restrictedCells.forEach(([row, col]) => {
      newGrid[row][col] = {
        row,
        col,
        type: 'restricted'
      };
    });
    
    setGrid(newGrid);
  }, [settings]);
  
  // Initialize connections
  const initializeConnections = useCallback((levelData: Level) => {
    const newConnections: PathConnection[] = levelData.endpoints.map(({ id, start, end, color }) => ({
      id,
      start,
      end,
      currentPath: [] as Point[],
      isComplete: false,
      color
    }));
    
    setConnections(newConnections);
  }, []);
  
  // Initialize level
  const initializeLevel = useCallback(() => {
    const newLevel = generateLevel(
      settings.gridSize,
      settings.numPaths,
      settings.restrictedCells
    );
    
    setCurrentLevel(newLevel);
    initializeGrid(newLevel);
    initializeConnections(newLevel);
    setActivePathId(null);
    setLastSelected(null);
  }, [settings, initializeGrid, initializeConnections]);
  
  // Start game
  const startGame = useCallback((selectedDifficulty: Difficulty) => {
    setSettings(DIFFICULTY_SETTINGS[selectedDifficulty]);
    setGameStatus('playing');
    setLevel(1);
    setScore(0);
    setTimeLeft(DIFFICULTY_SETTINGS[selectedDifficulty].timeLimit);
    setHintsLeft(DIFFICULTY_SETTINGS[selectedDifficulty].hintsAllowed);
    
    // Start timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          // Game over when time runs out
          clearInterval(timerRef.current!);
          setGameStatus('gameover');
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    initializeLevel();
  }, [initializeLevel]);
  
  // Reset for new level
  useEffect(() => {
    if (gameStatus === 'playing' && currentLevel) {
      initializeGrid(currentLevel);
      initializeConnections(currentLevel);
    }
  }, [gameStatus, currentLevel, initializeGrid, initializeConnections]);
  
  // Check if level is complete
  useEffect(() => {
    if (gameStatus === 'playing') {
      const allPathsComplete = connections.every(conn => conn.isComplete);
      
      if (allPathsComplete && connections.length > 0) {
        // Level complete!
        if (soundEnabled) {
          playSoundEffect('levelComplete');
        }
        
        setShowLevelComplete(true);
        setGameStatus('levelComplete');
        
        // Update score based on difficulty and time left
        const levelScore = Math.floor(1000 * (level / settings.maxLevels) * (timeLeft / settings.timeLimit));
        setScore(prevScore => prevScore + levelScore);
        
        // Show level complete message then move to next level
        levelCompleteTimerRef.current = setTimeout(() => {
          setShowLevelComplete(false);
          
          if (level >= settings.maxLevels) {
            // Game complete!
            setGameStatus('gameover');
            if (onGameComplete) {
              onGameComplete(score + levelScore, level, settings.timeLimit - timeLeft);
            }
          } else {
            // Next level
            setLevel(prevLevel => prevLevel + 1);
            const nextLevel = generateLevel(
              settings.gridSize,
              settings.numPaths + Math.floor((level - 1) / 2), // Increase paths every 2 levels
              settings.restrictedCells + Math.floor((level - 1) / 3) // Increase restricted cells every 3 levels
            );
            setCurrentLevel(nextLevel);
          }
        }, 2000);
      }
    }
  }, [connections, gameStatus, level, onGameComplete, score, settings, soundEnabled, timeLeft]);
  
  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);
  
  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    if (gameStatus !== 'playing') return;
    
    if (soundEnabled) {
      playSoundEffect('click');
    }
    
    const cell = grid[row][col];
    
    // Handle endpoint click
    if (cell.type === 'endpoint') {
      const pathId = cell.pathId!;
      const connection = connections.find(c => c.id === pathId);
      
      if (!connection) return;
      
      // If this path is already complete, do nothing
      if (connection.isComplete) return;
      
      // If we're starting a new path
      if (activePathId === null || activePathId !== pathId) {
        // Reset any existing path for this connection
        const newConnections = connections.map(conn => {
          if (conn.id === pathId) {
            return { ...conn, currentPath: [] as Point[] };
          }
          return conn;
        });
        
        setConnections(newConnections);
        setActivePathId(pathId);
        
        // Set this as the last selected
        setLastSelected([row, col] as Point);
        return;
      }
      
      // If we've clicked the other endpoint of the active path
      const isStart = pointsEqual([row, col] as Point, connection.start);
      const isEnd = pointsEqual([row, col] as Point, connection.end);
      const otherEndpoint = isStart ? connection.end : connection.start;
      
      // Check if the last selected is adjacent to this endpoint
      if (lastSelected && isAdjacent([row, col] as Point, lastSelected)) {
        // Check if the current path forms a valid connection between endpoints
        const updatedConnections = connections.map(conn => {
          if (conn.id === pathId) {
            const newPath = [...conn.currentPath, [row, col] as Point];
            const isValid = validatePath(newPath, otherEndpoint);
            
            if (isValid) {
              // Valid complete path!
              if (soundEnabled) {
                playSoundEffect('connect');
              }
              
              // Mark the endpoints as connected
              const newGrid = [...grid];
              const [startRow, startCol] = conn.start;
              const [endRow, endCol] = conn.end;
              
              newGrid[startRow][startCol] = {
                ...newGrid[startRow][startCol],
                isConnected: true
              };
              
              newGrid[endRow][endCol] = {
                ...newGrid[endRow][endCol],
                isConnected: true
              };
              
              setGrid(newGrid);
              
              return {
                ...conn,
                currentPath: newPath,
                isComplete: true
              };
            } else {
              // Invalid path
              if (soundEnabled) {
                playSoundEffect('error');
              }
              return conn; // Keep the existing path
            }
          }
          return conn;
        });
        
        setConnections(updatedConnections);
        setActivePathId(null);
        setLastSelected(null);
      }
      return;
    }
    
    // Handle empty cell click
    if (cell.type === 'empty' && activePathId !== null) {
      // Get the active connection
      const activeConnection = connections.find(c => c.id === activePathId);
      if (!activeConnection) return;
      
      // Check if this cell is adjacent to the last selected
      if (lastSelected && isAdjacent([row, col] as Point, lastSelected)) {
        // Check if the cell is not already in the path
        if (!pointInArray([row, col] as Point, activeConnection.currentPath)) {
          // Add to path
          const updatedConnections = connections.map(conn => {
            if (conn.id === activePathId) {
              const newPath = [...conn.currentPath, [row, col] as Point];
              return {
                ...conn,
                currentPath: newPath
              };
            }
            return conn;
          });
          
          // Update the grid to show the path
          const newGrid = [...grid];
          newGrid[row][col] = {
            ...cell,
            type: 'path',
            pathId: activePathId
          };
          
          setGrid(newGrid);
          setConnections(updatedConnections);
          setLastSelected([row, col] as Point);
        } else {
          // Cell already in path - if it's the previous cell, allow backtracking
          const pathIndex = activeConnection.currentPath.findIndex(p => 
            pointsEqual(p, [row, col] as Point)
          );
          
          if (pathIndex === activeConnection.currentPath.length - 2) {
            // It's the previous cell, allow backtracking
            const updatedConnections = connections.map(conn => {
              if (conn.id === activePathId) {
                const newPath = conn.currentPath.slice(0, -1); // Remove the last cell
                return {
                  ...conn,
                  currentPath: newPath
                };
              }
              return conn;
            });
            
            // Update the grid to clear the last cell
            const newGrid = [...grid];
            const [lastRow, lastCol] = lastSelected;
            newGrid[lastRow][lastCol] = {
              row: lastRow,
              col: lastCol,
              type: 'empty'
            };
            
            setGrid(newGrid);
            setConnections(updatedConnections);
            setLastSelected([row, col] as Point);
          }
        }
      }
    }
  };
  
  // Check if two points are adjacent
  const isAdjacent = (p1: Point, p2: Point): boolean => {
    const [row1, col1] = p1;
    const [row2, col2] = p2;
    
    return (
      (Math.abs(row1 - row2) === 1 && col1 === col2) || // Up/down
      (Math.abs(col1 - col2) === 1 && row1 === row2)    // Left/right
    );
  };
  
  // Validate if a path can connect to an endpoint
  const validatePath = (path: Point[], endpoint: Point): boolean => {
    // Path must not be empty
    if (path.length === 0) return false;
    
    // Last point in path must be adjacent to endpoint
    const lastPoint = path[path.length - 1];
    return isAdjacent(lastPoint, endpoint);
  };
  
  // Use a hint (reveal a correct segment of a path)
  const useHint = () => {
    if (hintsLeft <= 0 || gameStatus !== 'playing') return;
    
    // For simplicity, just reveal the first segment of a random incomplete path
    const incompletePaths = connections.filter(conn => !conn.isComplete);
    if (incompletePaths.length === 0) return;
    
    const randomPath = incompletePaths[Math.floor(Math.random() * incompletePaths.length)];
    const startPoint = randomPath.start;
    
    // Find a valid first move from the start point
    const [startRow, startCol] = startPoint;
    const possibleMoves: Point[] = [
      [startRow - 1, startCol] as Point, // Up
      [startRow + 1, startCol] as Point, // Down
      [startRow, startCol - 1] as Point, // Left
      [startRow, startCol + 1] as Point  // Right
    ];
    
    // Filter valid moves
    const validMoves = possibleMoves.filter(([row, col]) => {
      // Check if within grid
      if (row < 0 || row >= settings.gridSize || col < 0 || col >= settings.gridSize) {
        return false;
      }
      
      // Check if cell is empty or the end point of this path
      const cell = grid[row][col];
      if (cell.type === 'restricted' || cell.type === 'path') {
        return false;
      }
      
      if (cell.type === 'endpoint' && cell.pathId !== randomPath.id) {
        return false;
      }
      
      return true;
    });
    
    if (validMoves.length > 0) {
      // Use the first valid move
      const [moveRow, moveCol] = validMoves[0];
      
      // Update the connection's path
      const updatedConnections = connections.map(conn => {
        if (conn.id === randomPath.id) {
          return {
            ...conn,
            currentPath: [[moveRow, moveCol] as Point]
          };
        }
        return conn;
      });
      
      // Update the grid
      const newGrid = [...grid];
      newGrid[moveRow][moveCol] = {
        row: moveRow,
        col: moveCol,
        type: 'path',
        pathId: randomPath.id
      };
      
      setGrid(newGrid);
      setConnections(updatedConnections);
      setHintsLeft(prevHints => prevHints - 1);
      
      // Set this path as active
      setActivePathId(randomPath.id);
      setLastSelected([moveRow, moveCol] as Point);
    }
  };
  
  // Pause game
  const pauseGame = () => {
    if (gameStatus === 'playing') {
      setGameStatus('paused');
      clearAllTimers();
    }
  };
  
  // Resume game
  const resumeGame = () => {
    if (gameStatus === 'paused') {
      setGameStatus('playing');
      
      // Restart timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      timerRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current!);
            setGameStatus('gameover');
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Reset game
  const resetGame = () => {
    clearAllTimers();
    setGameStatus('idle');
  };
  
  // Render grid
  const renderGrid = () => {
    const cellSize = 50; // px
    const { gridSize } = settings;
    
    return (
      <div 
        className="connection-grid"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`
        }}
      >
        {grid.flat().map((cell, idx) => {
          // Find connection for this cell
          let connection;
          if (cell.pathId !== undefined) {
            connection = connections.find(c => c.id === cell.pathId);
          }
          
          // Determine cell color
          let backgroundColor = 'transparent';
          if (cell.type === 'endpoint' && connection) {
            backgroundColor = connection.color;
          } else if (cell.type === 'path' && connection) {
            backgroundColor = connection.color;
          } else if (cell.type === 'restricted') {
            backgroundColor = '#e74c3c';
          }
          
          return (
            <div
              key={idx}
              className={`grid-cell ${cell.type} ${cell.isConnected ? 'connected' : ''}`}
              style={{
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                backgroundColor
              }}
              onClick={() => handleCellClick(cell.row, cell.col)}
            />
          );
        })}
        
        {/* Render path lines */}
        {connections.map(connection => {
          if (connection.currentPath.length === 0) return null;
          
          // Start with the connection's start point
          const pathWithEndpoints = [connection.start, ...connection.currentPath];
          
          return pathWithEndpoints.slice(0, -1).map((point, idx) => {
            const nextPoint = pathWithEndpoints[idx + 1];
            const [row1, col1] = point;
            const [row2, col2] = nextPoint;
            
            // Determine line position and orientation
            const isHorizontal = row1 === row2;
            const start = isHorizontal ? col1 : row1;
            const end = isHorizontal ? col2 : row2;
            
            // Position line between cells
            const min = Math.min(start, end);
            const length = Math.abs(end - start) * cellSize;
            
            const style = {
              backgroundColor: connection.color,
              [isHorizontal ? 'width' : 'height']: `${length}px`,
              [isHorizontal ? 'left' : 'top']: `${min * cellSize + cellSize / 2}px`,
              [isHorizontal ? 'top' : 'left']: `${(isHorizontal ? row1 : col1) * cellSize + cellSize / 2}px`
            };
            
            return (
              <div
                key={`line-${connection.id}-${idx}`}
                className={`path-line ${isHorizontal ? 'horizontal' : 'vertical'}`}
                style={style}
              />
            );
          });
        })}
      </div>
    );
  };
  
  // Render intro screen
  const renderIntro = () => (
    <div className="connection-intro">
      <h2>{t('connection_paths')}</h2>
      <p>{t('connection_paths_intro', 'Connect each pair of endpoints with a continuous path. Paths cannot cross each other or go through restricted cells.')}</p>
      
      <div className="difficulty-selector">
        <button 
          className={`difficulty-btn ${difficulty === 'easy' ? 'selected' : ''}`}
          onClick={() => startGame('easy')}
        >
          {t('easy')}
        </button>
        <button 
          className={`difficulty-btn ${difficulty === 'medium' ? 'selected' : ''}`}
          onClick={() => startGame('medium')}
        >
          {t('medium')}
        </button>
        <button 
          className={`difficulty-btn ${difficulty === 'hard' ? 'selected' : ''}`}
          onClick={() => startGame('hard')}
        >
          {t('hard')}
        </button>
      </div>
      
      <button 
        className="connection-btn btn-secondary"
        onClick={onExit}
      >
        {t('back')}
      </button>
    </div>
  );
  
  // Render game over screen
  const renderGameOver = () => (
    <div className="connection-gameover">
      <h2>{t('game_over')}</h2>
      
      <div className="game-stats">
        <p>{t('final_score')}: {score}</p>
        <p>{t('levels_completed')}: {level - 1}</p>
        <p>{t('time_taken')}: {formatTime(settings.timeLimit - timeLeft)}</p>
      </div>
      
      <div className="game-over-buttons">
        <button 
          className="connection-btn btn-primary"
          onClick={() => {
            if (onGameComplete) {
              onGameComplete(score, level - 1, settings.timeLimit - timeLeft);
            }
            resetGame();
          }}
        >
          {t('play_again')}
        </button>
        <button 
          className="connection-btn btn-secondary"
          onClick={onExit}
        >
          {t('exit')}
        </button>
      </div>
      
      {/* Confetti effect */}
      {score > 0 && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          })}
        </div>
      )}
    </div>
  );
  
  // Render paused screen
  const renderPaused = () => (
    <div className="connection-paused">
      <h2>{t('game_paused')}</h2>
      <button 
        className="connection-btn btn-primary"
        onClick={resumeGame}
      >
        {t('resume')}
      </button>
      <button 
        className="connection-btn btn-secondary"
        onClick={resetGame}
      >
        {t('quit')}
      </button>
    </div>
  );
  
  return (
    <div className="connection-paths-container">
      <div className="connection-game">
        {gameStatus === 'idle' && renderIntro()}
        
        {(gameStatus === 'playing' || gameStatus === 'paused' || gameStatus === 'levelComplete') && (
          <>
            <div className="connection-header">
              <div className="game-info">
                <div className="info-item">
                  <span>{t('level')}: {level}</span>
                </div>
                <div className="info-item">
                  <span>{t('score')}: {score}</span>
                </div>
                <div className="info-item">
                  <span>{t('time')}: {formatTime(timeLeft)}</span>
                </div>
                {hintsLeft > 0 && (
                  <div className="info-item">
                    <span>{t('hints')}: {hintsLeft}</span>
                  </div>
                )}
              </div>
              
              <div className="game-controls">
                {hintsLeft > 0 && (
                  <button 
                    className="connection-btn btn-tertiary"
                    onClick={useHint}
                    disabled={gameStatus !== 'playing'}
                  >
                    {t('use_hint')}
                  </button>
                )}
                
                <button 
                  className="connection-btn btn-neutral"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                >
                  {soundEnabled ? t('sound_on') : t('sound_off')}
                </button>
                
                {gameStatus === 'playing' ? (
                  <button 
                    className="connection-btn btn-primary"
                    onClick={pauseGame}
                  >
                    {t('pause')}
                  </button>
                ) : (
                  <button 
                    className="connection-btn btn-primary"
                    onClick={resumeGame}
                  >
                    {t('resume')}
                  </button>
                )}
                
                <button 
                  className="connection-btn btn-secondary"
                  onClick={resetGame}
                >
                  {t('quit')}
                </button>
              </div>
            </div>
            
            {currentLevel && (
              <div className="level-info">
                <div className="level-title">{t('level')} {level}</div>
                <div className="level-description">{currentLevel.description}</div>
              </div>
            )}
            
            {renderGrid()}
            
            {gameStatus === 'paused' && renderPaused()}
            
            {showLevelComplete && (
              <div className="level-complete-banner">
                {t('level_complete')}!
              </div>
            )}
          </>
        )}
        
        {gameStatus === 'gameover' && renderGameOver()}
      </div>
    </div>
  );
};

export default ConnectionPaths; 