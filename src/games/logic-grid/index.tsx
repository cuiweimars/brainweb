import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import './LogicGrid.css';

// 游戏类型和接口定义
interface LogicGridProps {
  difficulty: 'easy' | 'medium' | 'hard';
  onGameComplete?: (score: number, accuracy: number, timeSpent: number) => void;
  onExit?: () => void;
}

interface Clue {
  id: string;
  text: string;
  solved: boolean;
}

interface GridItem {
  id: string;
  name: string;
}

interface GridCell {
  value: 'empty' | 'true' | 'false' | 'maybe';
  correctValue?: 'true' | 'false';
  row: number;
  col: number;
}

interface PuzzleData {
  title: string;
  description?: string;
  categories: {
    [key: string]: GridItem[];
  };
  clues: Clue[];
  solution: {
    [key: string]: {
      [key: string]: boolean;
    };
  };
}

type GameState = 'intro' | 'playing' | 'paused' | 'gameOver';

// 游戏配置
const gameConfig = {
  easy: {
    categories: 3,
    itemsPerCategory: 3,
    cluesCount: 5,
    timeLimit: 600000, // 10 minutes
    hintsAvailable: 3,
    pointsPerCorrect: 10,
    pointsPerMistake: -5,
  },
  medium: {
    categories: 4,
    itemsPerCategory: 4,
    cluesCount: 8,
    timeLimit: 900000, // 15 minutes
    hintsAvailable: 2,
    pointsPerCorrect: 15,
    pointsPerMistake: -8,
  },
  hard: {
    categories: 5,
    itemsPerCategory: 5,
    cluesCount: 12,
    timeLimit: 1200000, // 20 minutes
    hintsAvailable: 1,
    pointsPerCorrect: 20,
    pointsPerMistake: -10,
  },
};

// 预定义的游戏数据
const puzzles: { [key: string]: PuzzleData[] } = {
  easy: [
    {
      title: "Pets, Colors, and Owners",
      description: "Find out which pet and color belongs to each owner",
      categories: {
        owner: [
          { id: "owner1", name: "John" },
          { id: "owner2", name: "Mike" },
          { id: "owner3", name: "Tom" },
        ],
        pet: [
          { id: "pet1", name: "Cat" },
          { id: "pet2", name: "Dog" },
          { id: "pet3", name: "Bird" },
        ],
        color: [
          { id: "color1", name: "White" },
          { id: "color2", name: "Black" },
          { id: "color3", name: "Brown" },
        ],
      },
      clues: [
        { id: "clue1", text: "John doesn't have a white pet", solved: false },
        { id: "clue2", text: "The cat's owner is not Tom", solved: false },
        { id: "clue3", text: "Mike's pet is black", solved: false },
        { id: "clue4", text: "Tom doesn't have a bird", solved: false },
        { id: "clue5", text: "The brown pet is a bird", solved: false },
      ],
      solution: {
        "owner1": { "pet2": true, "color3": false, "color2": false, "color1": false, "pet1": false, "pet3": false },
        "owner2": { "pet1": true, "color2": true, "color1": false, "color3": false, "pet2": false, "pet3": false },
        "owner3": { "pet3": true, "color3": true, "color1": false, "color2": false, "pet1": false, "pet2": false },
      },
    }
  ],
  medium: [
    {
      title: "Jobs, Cities, Hobbies, and Ages",
      description: "Find out each person's job, city, hobby, and age",
      categories: {
        person: [
          { id: "person1", name: "Alex" },
          { id: "person2", name: "Emma" },
          { id: "person3", name: "Jack" },
          { id: "person4", name: "Lisa" },
        ],
        job: [
          { id: "job1", name: "Doctor" },
          { id: "job2", name: "Engineer" },
          { id: "job3", name: "Teacher" },
          { id: "job4", name: "Artist" },
        ],
        city: [
          { id: "city1", name: "New York" },
          { id: "city2", name: "Boston" },
          { id: "city3", name: "Chicago" },
          { id: "city4", name: "Seattle" },
        ],
        hobby: [
          { id: "hobby1", name: "Painting" },
          { id: "hobby2", name: "Piano" },
          { id: "hobby3", name: "Swimming" },
          { id: "hobby4", name: "Running" },
        ],
      },
      clues: [
        { id: "clue1", text: "The doctor lives in Boston", solved: false },
        { id: "clue2", text: "Emma enjoys swimming", solved: false },
        { id: "clue3", text: "Lisa is a teacher", solved: false },
        { id: "clue4", text: "The person in Chicago enjoys painting", solved: false },
        { id: "clue5", text: "The engineer plays piano", solved: false },
        { id: "clue6", text: "Alex doesn't live in New York", solved: false },
        { id: "clue7", text: "The artist lives in Seattle", solved: false },
        { id: "clue8", text: "The person in New York enjoys running", solved: false },
      ],
      solution: {
        "person1": { "job2": true, "city3": true, "hobby1": true },
        "person2": { "job1": true, "city2": true, "hobby3": true },
        "person3": { "job4": true, "city4": true, "hobby2": true },
        "person4": { "job3": true, "city1": true, "hobby4": true },
      },
    }
  ],
  hard: [
    {
      title: "Drinks, Food, Locations, Time, and Mood",
      description: "Find out what drink and food each person had, at what location, what time, and in what mood",
      categories: {
        person: [
          { id: "person1", name: "Person A" },
          { id: "person2", name: "Person B" },
          { id: "person3", name: "Person C" },
          { id: "person4", name: "Person D" },
          { id: "person5", name: "Person E" },
        ],
        drink: [
          { id: "drink1", name: "Coffee" },
          { id: "drink2", name: "Tea" },
          { id: "drink3", name: "Juice" },
          { id: "drink4", name: "Soda" },
          { id: "drink5", name: "Water" },
        ],
        food: [
          { id: "food1", name: "Sandwich" },
          { id: "food2", name: "Salad" },
          { id: "food3", name: "Burger" },
          { id: "food4", name: "Cake" },
          { id: "food5", name: "Fruit" },
        ],
        location: [
          { id: "location1", name: "Park" },
          { id: "location2", name: "Office" },
          { id: "location3", name: "Cafe" },
          { id: "location4", name: "Home" },
          { id: "location5", name: "School" },
        ],
        time: [
          { id: "time1", name: "Morning" },
          { id: "time2", name: "Noon" },
          { id: "time3", name: "Afternoon" },
          { id: "time4", name: "Evening" },
          { id: "time5", name: "Night" },
        ],
      },
      clues: [
        { id: "clue1", text: "Person A had coffee in the afternoon", solved: false },
        { id: "clue2", text: "The person in the park ate fruit", solved: false },
        { id: "clue3", text: "Person C was at school", solved: false },
        { id: "clue4", text: "The person at night drank water", solved: false },
        { id: "clue5", text: "The person at the cafe ate cake", solved: false },
        { id: "clue6", text: "Person B was there in the morning", solved: false },
        { id: "clue7", text: "The person drinking tea was at the office", solved: false },
        { id: "clue8", text: "Person D drank juice", solved: false },
        { id: "clue9", text: "The person at home was there in the evening", solved: false },
        { id: "clue10", text: "Person E ate a burger", solved: false },
        { id: "clue11", text: "The person at noon ate salad", solved: false },
        { id: "clue12", text: "The person drinking soda ate a sandwich", solved: false },
      ],
      solution: {
        "person1": { "drink1": true, "food4": true, "location3": true, "time3": true },
        "person2": { "drink2": true, "food2": true, "location2": true, "time1": true },
        "person3": { "drink5": true, "food5": true, "location5": true, "time5": true },
        "person4": { "drink3": true, "food1": true, "location1": true, "time2": true },
        "person5": { "drink4": true, "food3": true, "location4": true, "time4": true },
      },
    }
  ],
};

// 主游戏组件
const LogicGrid: React.FC<LogicGridProps> = ({
  difficulty: propDifficulty = 'medium',
  onGameComplete,
  onExit
}) => {
  const { t } = useTranslation();
  // Use state to track the current difficulty, initialized with the prop value
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(propDifficulty);
  // Always start in playing mode unless explicitly showing intro screen
  const [gameState, setGameState] = useState<GameState>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const showIntro = urlParams.get('showIntro') === 'true';
    return showIntro ? 'intro' : 'playing';
  });
  
  // Update difficulty if prop changes
  useEffect(() => {
    setDifficulty(propDifficulty);
  }, [propDifficulty]);
  
  // The rest of the component state
  const [currentPuzzle, setCurrentPuzzle] = useState<PuzzleData | null>(null);
  const [gridState, setGridState] = useState<GridCell[][]>([]);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintsAvailable, setHintsAvailable] = useState(gameConfig[difficulty].hintsAvailable);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isShowingHint, setIsShowingHint] = useState(false);
  const [currentHint, setCurrentHint] = useState('');
  const [isGameCompleted, setIsGameCompleted] = useState(false);

  // 生成一个随机谜题
  const generatePuzzle = useCallback(() => {
    const availablePuzzles = puzzles[difficulty];
    const randomIndex = Math.floor(Math.random() * availablePuzzles.length);
    return availablePuzzles[randomIndex];
  }, [difficulty]);

  // 初始化格子状态
  const initializeGridState = useCallback((puzzle: PuzzleData) => {
    const categories = Object.keys(puzzle.categories);
    const rows = puzzle.categories[categories[0]].length;
    const cols = puzzle.categories[categories[1]].length;
    
    const newGrid: GridCell[][] = [];
    for (let i = 0; i < rows; i++) {
      const row: GridCell[] = [];
      for (let j = 0; j < cols; j++) {
        const cat1Item = puzzle.categories[categories[0]][i];
        const cat2Item = puzzle.categories[categories[1]][j];
        
        const correctValue = puzzle.solution[cat1Item.id]?.[cat2Item.id] ? 'true' : 'false';
        
        row.push({
          value: 'empty',
          correctValue,
          row: i,
          col: j,
        });
      }
      newGrid.push(row);
    }
    
    return newGrid;
  }, []);

  // 自动初始化游戏
  useEffect(() => {
    if (gameState === 'playing' && !currentPuzzle) {
      const puzzle = generatePuzzle();
      setCurrentPuzzle(puzzle);
      setGridState(initializeGridState(puzzle));
      setScore(0);
      setMistakes(0);
      setHintsUsed(0);
      setHintsAvailable(gameConfig[difficulty].hintsAvailable);
      setElapsedTime(0);
      setStartTime(Date.now());
      setIsGameCompleted(false);
    }
  }, [gameState, currentPuzzle, difficulty, generatePuzzle, initializeGridState]);

  // 开始新游戏
  const startGame = useCallback(() => {
    const puzzle = generatePuzzle();
    setCurrentPuzzle(puzzle);
    setGridState(initializeGridState(puzzle));
    setScore(0);
    setMistakes(0);
    setHintsUsed(0);
    setHintsAvailable(gameConfig[difficulty].hintsAvailable);
    setElapsedTime(0);
    setStartTime(Date.now());
    setGameState('playing');
    setIsGameCompleted(false);
  }, [difficulty, generatePuzzle, initializeGridState]);

  // 选择难度并立即开始游戏
  const startGameWithDifficulty = useCallback((newDifficulty: 'easy' | 'medium' | 'hard') => {
    // 如果选择的难度与当前难度相同，只需要开始游戏而不更改URL参数
    if (newDifficulty === difficulty) {
      startGame();
      return;
    }
    
    // 更新本地难度状态并重置游戏
    setDifficulty(newDifficulty);
    
    // 使用新的难度开始游戏
    const puzzle = generatePuzzle();
    setCurrentPuzzle(puzzle);
    setGridState(initializeGridState(puzzle));
    setScore(0);
    setMistakes(0);
    setHintsUsed(0);
    setHintsAvailable(gameConfig[newDifficulty].hintsAvailable);
    setElapsedTime(0);
    setStartTime(Date.now());
    setGameState('playing');
    setIsGameCompleted(false);
  }, [difficulty, startGame, generatePuzzle, initializeGridState]);

  // 暂停游戏
  const pauseGame = useCallback(() => {
    if (gameState === 'playing') {
      setGameState('paused');
    } else if (gameState === 'paused') {
      setGameState('playing');
      setStartTime(Date.now() - elapsedTime);
    }
  }, [gameState, elapsedTime]);

  // 结束游戏
  const endGame = useCallback((completed = false) => {
    setGameState('gameOver');
    setIsGameCompleted(completed);
    
    if (onGameComplete && completed) {
      const accuracy = gridState.flat().length > 0
        ? (gridState.flat().filter(cell => 
            (cell.value === 'true' && cell.correctValue === 'true') || 
            (cell.value === 'false' && cell.correctValue === 'false')
          ).length / gridState.flat().length) * 100
        : 0;
      
      onGameComplete(score, accuracy, elapsedTime);
    }
  }, [gridState, onGameComplete, score, elapsedTime]);

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

  // 单元格点击处理
  const handleCellClick = useCallback((rowIndex: number, colIndex: number) => {
    if (gameState !== 'playing') return;
    
    setGridState(prev => {
      const newGrid = [...prev];
      const cell = newGrid[rowIndex][colIndex];
      
      // 循环值: empty -> true -> false -> maybe -> empty
      let newValue: 'empty' | 'true' | 'false' | 'maybe';
      
      switch (cell.value) {
        case 'empty':
          newValue = 'true';
          break;
        case 'true':
          newValue = 'false';
          break;
        case 'false':
          newValue = 'maybe';
          break;
        case 'maybe':
          newValue = 'empty';
          break;
        default:
          newValue = 'empty';
      }
      
      // 更新分数
      if (newValue === 'true' || newValue === 'false') {
        if (newValue === cell.correctValue) {
          setScore(s => s + gameConfig[difficulty].pointsPerCorrect);
        } else {
          setScore(s => s + gameConfig[difficulty].pointsPerMistake);
          setMistakes(m => m + 1);
        }
      }
      
      newGrid[rowIndex][colIndex] = {
        ...cell,
        value: newValue,
      };
      
      // 检查游戏是否完成
      const allCellsCorrect = newGrid.flat().every(c => 
        (c.value === 'true' && c.correctValue === 'true') || 
        (c.value === 'false' && c.correctValue === 'false')
      );
      
      if (allCellsCorrect) {
        endGame(true);
      }
      
      return newGrid;
    });
  }, [gameState, difficulty, endGame]);

  // 增加辅助功能：一键将一行或一列的其余单元格标记为false
  const markRowOrColumnFalse = useCallback((rowIndex: number, colIndex: number, isRow: boolean) => {
    setGridState(prev => {
      const newGrid = [...prev.map(row => [...row])];
      
      if (isRow) {
        // 标记同一行的其他单元格为false
        for (let j = 0; j < newGrid[rowIndex].length; j++) {
          if (j !== colIndex && newGrid[rowIndex][j].value !== 'true') {
            newGrid[rowIndex][j] = {
              ...newGrid[rowIndex][j],
              value: 'false',
            };
          }
        }
      } else {
        // 标记同一列的其他单元格为false
        for (let i = 0; i < newGrid.length; i++) {
          if (i !== rowIndex && newGrid[i][colIndex].value !== 'true') {
            newGrid[i][colIndex] = {
              ...newGrid[i][colIndex],
              value: 'false',
            };
          }
        }
      }
      
      return newGrid;
    });
  }, []);

  // 使用提示
  const useHint = useCallback(() => {
    if (hintsAvailable <= 0 || !currentPuzzle) return;
    
    // 找到一个未解决的线索
    const unsolvedClues = currentPuzzle.clues.filter(clue => !clue.solved);
    if (unsolvedClues.length === 0) return;
    
    const randomClue = unsolvedClues[Math.floor(Math.random() * unsolvedClues.length)];
    setCurrentHint(randomClue.text);
    setIsShowingHint(true);
    setHintsAvailable(prev => prev - 1);
    setHintsUsed(prev => prev + 1);
    
    // 标记该线索为已解决
    setCurrentPuzzle(prev => {
      if (!prev) return null;
      return {
        ...prev,
        clues: prev.clues.map(clue => 
          clue.id === randomClue.id ? { ...clue, solved: true } : clue
        )
      };
    });
  }, [hintsAvailable, currentPuzzle]);

  // 关闭提示
  const closeHint = useCallback(() => {
    setIsShowingHint(false);
  }, []);

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

  // CSS样式
  const styles = {
    logicGridGameplayInstructions: {
      backgroundColor: '#f8f9fa',
      padding: '15px 20px',
      borderRadius: '8px',
      marginBottom: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    },
    logicGridGameplayInstructionsTitle: {
      color: '#4f46e5',
      marginBottom: '10px',
      fontSize: '1.2rem'
    },
    logicGridGameplayInstructionsList: {
      paddingLeft: '25px',
      margin: '0'
    },
    logicGridGameplayInstructionsItem: {
      margin: '8px 0',
      lineHeight: '1.5'
    },
    logicGridGameplayInstructionsHighlight: {
      backgroundColor: '#eef2ff',
      padding: '2px 5px',
      borderRadius: '3px',
      fontWeight: 'bold',
      color: '#4f46e5'
    }
  };

  // 渲染介绍画面
  const renderIntro = () => (
    <div className="logic-grid-intro fade-in">
      <h1 className="logic-grid-intro-title">{t('logic_grid_title', 'Logic Grid Puzzle')}</h1>
      <div className="logic-grid-intro-image">
        <svg viewBox="0 0 100 100" width="200" height="200">
          <rect x="10" y="10" width="80" height="80" fill="#4f46e5" opacity="0.2" rx="4" />
          <line x1="10" y1="30" x2="90" y2="30" stroke="#4f46e5" strokeWidth="1" />
          <line x1="10" y1="50" x2="90" y2="50" stroke="#4f46e5" strokeWidth="1" />
          <line x1="10" y1="70" x2="90" y2="70" stroke="#4f46e5" strokeWidth="1" />
          <line x1="30" y1="10" x2="30" y2="90" stroke="#4f46e5" strokeWidth="1" />
          <line x1="50" y1="10" x2="50" y2="90" stroke="#4f46e5" strokeWidth="1" />
          <line x1="70" y1="10" x2="70" y2="90" stroke="#4f46e5" strokeWidth="1" />
          <circle cx="30" cy="30" r="6" fill="#10b981" />
          <rect x="65" y="25" width="10" height="10" fill="#ef4444" />
          <circle cx="70" cy="70" r="6" fill="#10b981" />
        </svg>
      </div>
      <p className="logic-grid-intro-text">
        {t('logic_grid_intro_text', 'Logic Grid Puzzles challenge your deductive reasoning skills. Use the given clues to fill in the grid and determine the correct relationships between different categories.')}
      </p>
      <div style={styles.logicGridGameplayInstructions}>
        <h3 style={styles.logicGridGameplayInstructionsTitle}>{t('how_to_play', 'How to Play:')}</h3>
        <ol style={styles.logicGridGameplayInstructionsList}>
          <li style={styles.logicGridGameplayInstructionsItem}>
            <strong>{t('gameplay_step1_title', 'Understand the Goal:')}</strong> {t('gameplay_step1', 'Each puzzle presents a set of categories (like people, colors, pets) and your goal is to determine which items from each category are related to each other.')}
          </li>
          <li style={styles.logicGridGameplayInstructionsItem}>
            <strong>{t('gameplay_step2_title', 'Study the Clues:')}</strong> {t('gameplay_step2', 'Each puzzle comes with a set of clues that provide information about the relationships. Read them carefully and think about what each clue tells you.')}
          </li>
          <li style={styles.logicGridGameplayInstructionsItem}>
            <strong>{t('gameplay_step3_title', 'Fill the Grid:')}</strong> {t('gameplay_step3', 'Click on grid cells to mark them as:')}
            <ul style={{marginTop: '5px'}}>
              <li><span style={styles.logicGridGameplayInstructionsHighlight}>✓</span> - {t('gameplay_mark_true', 'TRUE (marks a positive relationship)')}</li>
              <li><span style={styles.logicGridGameplayInstructionsHighlight}>✗</span> - {t('gameplay_mark_false', 'FALSE (marks an impossible relationship)')}</li>
              <li><span style={styles.logicGridGameplayInstructionsHighlight}>?</span> - {t('gameplay_mark_maybe', 'MAYBE (marks a possible but uncertain relationship)')}</li>
            </ul>
          </li>
          <li style={styles.logicGridGameplayInstructionsItem}>
            <strong>{t('gameplay_step4_title', 'Use Logic:')}</strong> {t('gameplay_step4', 'Each row and column should have exactly one TRUE mark. When you mark a cell as TRUE, you can mark all other cells in that row and column as FALSE.')}
          </li>
          <li style={styles.logicGridGameplayInstructionsItem}>
            <strong>{t('gameplay_step5_title', 'Process of Elimination:')}</strong> {t('gameplay_step5', 'If all cells in a row except one are marked FALSE, the remaining cell must be TRUE. The same applies to columns.')}
          </li>
        </ol>
      </div>
      <div className="logic-grid-difficulty-selector">
        <button
          className={`logic-grid-difficulty-button ${difficulty === 'easy' ? 'selected' : ''}`}
          onClick={() => startGameWithDifficulty('easy')}
        >
          {t('play_easy', 'Play Easy')}
        </button>
        <button
          className={`logic-grid-difficulty-button ${difficulty === 'medium' ? 'selected' : ''}`}
          onClick={() => startGameWithDifficulty('medium')}
        >
          {t('play_medium', 'Play Medium')}
        </button>
        <button
          className={`logic-grid-difficulty-button ${difficulty === 'hard' ? 'selected' : ''}`}
          onClick={() => startGameWithDifficulty('hard')}
        >
          {t('play_hard', 'Play Hard')}
        </button>
      </div>
      <button
        className="logic-grid-button logic-grid-button-primary"
        onClick={startGame}
      >
        {t('start_game', 'Play Now')}
      </button>
    </div>
  );

  // 渲染暂停画面
  const renderPausedScreen = () => (
    <div className="logic-grid-modal">
      <div className="logic-grid-modal-content">
        <h2 className="logic-grid-modal-title">{t('game_paused', 'Game Paused')}</h2>
        <p className="logic-grid-modal-text">{t('game_paused_text', 'Take a breath. Ready to continue?')}</p>
        <div className="logic-grid-modal-buttons">
          <button
            className="logic-grid-button logic-grid-button-secondary"
            onClick={() => onExit && onExit()}
          >
            {t('exit_game', 'Exit Game')}
          </button>
          <button
            className="logic-grid-button logic-grid-button-primary"
            onClick={pauseGame}
          >
            {t('resume_game', 'Resume Game')}
          </button>
        </div>
      </div>
    </div>
  );

  // 渲染提示
  const renderHint = () => (
    <div className="logic-grid-modal">
      <div className="logic-grid-modal-content">
        <h2 className="logic-grid-modal-title">{t('hint', 'Hint')}</h2>
        <p className="logic-grid-modal-text">{currentHint}</p>
        <div className="logic-grid-modal-buttons">
          <button
            className="logic-grid-button logic-grid-button-primary"
            onClick={closeHint}
          >
            {t('got_it', 'Got It')}
          </button>
        </div>
      </div>
    </div>
  );

  // 渲染线索
  const renderClues = () => {
    if (!currentPuzzle) return null;
    
    return (
      <div className="logic-grid-clues">
        <h3 className="logic-grid-title">{t('clues', 'Clues')}</h3>
        {currentPuzzle.clues.map(clue => (
          <div
            key={clue.id}
            className={`logic-grid-clue ${clue.solved ? 'solved' : ''}`}
          >
            {clue.text}
          </div>
        ))}
      </div>
    );
  };

  // 渲染网格
  const renderGrid = () => {
    if (!currentPuzzle) return null;
    
    const categories = Object.keys(currentPuzzle.categories);
    const category1 = categories[0];
    const category2 = categories[1];
    const items1 = currentPuzzle.categories[category1];
    const items2 = currentPuzzle.categories[category2];
    
    return (
      <div className="logic-grid-grid-container">
        <table className="logic-grid-grid">
          <thead>
            <tr>
              <th className="logic-grid-grid-corner"></th>
              {items2.map(item => (
                <th key={item.id} className="logic-grid-grid-header">
                  <div>{item.name}</div>
                  <button 
                    className="logic-grid-mark-column-button" 
                    onClick={() => {
                      const colIndex = items2.findIndex(i => i.id === item.id);
                      if (colIndex >= 0) {
                        markRowOrColumnFalse(0, colIndex, false);
                      }
                    }}
                    title={t('mark_column_false', 'Mark all cells in this column as FALSE except TRUE ones')}
                  >
                    ✗
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items1.map((item, rowIndex) => (
              <tr key={item.id}>
                <th className="logic-grid-grid-label">
                  <div>{item.name}</div>
                  <button 
                    className="logic-grid-mark-row-button" 
                    onClick={() => {
                      markRowOrColumnFalse(rowIndex, 0, true);
                    }}
                    title={t('mark_row_false', 'Mark all cells in this row as FALSE except TRUE ones')}
                  >
                    ✗
                  </button>
                </th>
                {gridState[rowIndex]?.map((cell, colIndex) => (
                  <td
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    className={`logic-grid-cell-container ${cell.value !== 'empty' ? `cell-${cell.value}` : ''}`}
                  >
                    <div className={`logic-grid-cell ${cell.value !== 'empty' ? cell.value : ''}`}>
                      {cell.value === 'true' && '✓'}
                      {cell.value === 'false' && '✗'}
                      {cell.value === 'maybe' && '?'}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // 渲染游戏结束画面
  const renderGameOver = () => (
    <div className="logic-grid-game-over fade-in">
      <h1 className="logic-grid-game-over-title">
        {isGameCompleted ? t('game_completed', 'Puzzle Solved!') : t('game_over', 'Game Over')}
      </h1>
      <div className="logic-grid-game-over-image">
        {/* 可以添加一个游戏结束图片 */}
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
      <p className="logic-grid-game-over-text">
        {isGameCompleted
          ? t('game_completed_message', 'Congratulations! You solved the puzzle.')
          : t('game_over_message', 'Time\'s up! Better luck next time.')}
      </p>
      <div className="logic-grid-game-over-stats">
        <div className="logic-grid-game-over-stat">
          <span className="logic-grid-game-over-stat-label">{t('score', 'Score')}</span>
          <span className="logic-grid-game-over-stat-value">{score}</span>
        </div>
        <div className="logic-grid-game-over-stat">
          <span className="logic-grid-game-over-stat-label">{t('time_spent', 'Time Spent')}</span>
          <span className="logic-grid-game-over-stat-value">{formatTime(elapsedTime)}</span>
        </div>
        <div className="logic-grid-game-over-stat">
          <span className="logic-grid-game-over-stat-label">{t('mistakes', 'Mistakes')}</span>
          <span className="logic-grid-game-over-stat-value">{mistakes}</span>
        </div>
        <div className="logic-grid-game-over-stat">
          <span className="logic-grid-game-over-stat-label">{t('hints_used', 'Hints Used')}</span>
          <span className="logic-grid-game-over-stat-value">{hintsUsed}</span>
        </div>
      </div>
      <div className="logic-grid-modal-buttons">
        <button
          className="logic-grid-button logic-grid-button-secondary"
          onClick={() => onExit && onExit()}
        >
          {t('exit_game', 'Exit Game')}
        </button>
        <button
          className="logic-grid-button logic-grid-button-primary"
          onClick={startGame}
        >
          {t('play_again', 'Play Again')}
        </button>
      </div>
    </div>
  );

  // 渲染游戏界面
  const renderGameplay = () => {
    if (!currentPuzzle) return null;
    
    return (
      <div className="logic-grid-gameplay fade-in">
        <div className="logic-grid-header">
          <div className="logic-grid-title">{currentPuzzle.title}</div>
          <div className="logic-grid-info">
            <div className="logic-grid-stat">
              <span className="logic-grid-stat-label">{t('score', 'Score')}</span>
              <span className="logic-grid-stat-value">{score}</span>
            </div>
            <div className="logic-grid-stat">
              <span className="logic-grid-stat-label">{t('time', 'Time')}</span>
              <span className="logic-grid-stat-value">{formatTime(remainingTime)}</span>
            </div>
            <div className="logic-grid-stat">
              <span className="logic-grid-stat-label">{t('hints', 'Hints')}</span>
              <span className="logic-grid-stat-value">{hintsAvailable}</span>
            </div>
          </div>
        </div>
        
        <div className="logic-grid-content">
          <div className="logic-grid-controls">
            <div className="logic-grid-left-controls">
              <button
                className="logic-grid-button logic-grid-button-secondary"
                onClick={() => setGameState('paused')}
              >
                {t('pause', 'Pause')}
              </button>
              <div className="logic-grid-help-info">
                <span className="logic-grid-help-text">
                  {t('gameplay_tip', 'Tip: Click cells to mark ✓ (true), ✗ (false), or ? (maybe). Each row and column should have one ✓.')}
                </span>
              </div>
            </div>
            <button
              className="logic-grid-button logic-grid-button-primary"
              onClick={useHint}
              disabled={hintsAvailable <= 0}
            >
              {t('use_hint', 'Use Hint')} {hintsAvailable > 0 ? `(${hintsAvailable})` : ''}
            </button>
          </div>
          
          <div className="logic-grid-puzzle-area">
            {renderClues()}
            {renderGrid()}
          </div>
        </div>
        
        {isShowingHint && renderHint()}
      </div>
    );
  };

  return (
    <div className="logic-grid-game">
      {gameState === 'intro' && renderIntro()}
      {gameState === 'playing' && renderGameplay()}
      {gameState === 'paused' && renderPausedScreen()}
      {gameState === 'gameOver' && renderGameOver()}
    </div>
  );
};

export default LogicGrid; 