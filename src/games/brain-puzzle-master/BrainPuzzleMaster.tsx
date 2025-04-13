import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './BrainPuzzleMaster.css';

// Difficulty settings
const DIFFICULTY_SETTINGS = {
  easy: {
    totalProblems: 8,
    timeLimit: 180, // seconds
    pointsPerCorrect: 10,
    penaltyPerIncorrect: -2,
    hintsAvailable: 3,
    problemTypes: ['pattern', 'math', 'verbal', 'visual']
  },
  medium: {
    totalProblems: 12,
    timeLimit: 240,
    pointsPerCorrect: 15,
    penaltyPerIncorrect: -3,
    hintsAvailable: 2,
    problemTypes: ['pattern', 'math', 'verbal', 'visual']
  },
  hard: {
    totalProblems: 16,
    timeLimit: 300,
    pointsPerCorrect: 20,
    penaltyPerIncorrect: -5,
    hintsAvailable: 1,
    problemTypes: ['pattern', 'math', 'verbal', 'visual']
  }
};

// Types
type Difficulty = 'easy' | 'medium' | 'hard';
type GameStatus = 'idle' | 'playing' | 'paused' | 'gameover';
type ProblemType = 'pattern' | 'math' | 'verbal' | 'visual';

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Problem {
  id: number;
  type: ProblemType;
  question: string;
  content?: any;
  options: Option[];
  explanation: string;
  difficulty: Difficulty;
}

// Sample problems data
const PROBLEMS: Problem[] = [
  // Pattern recognition problems
  {
    id: 1,
    type: 'pattern',
    question: 'What comes next in this pattern?',
    content: ['2', '4', '8', '16', '32', '?'],
    options: [
      { id: 'p1_a', text: '36', isCorrect: false },
      { id: 'p1_b', text: '64', isCorrect: true },
      { id: 'p1_c', text: '48', isCorrect: false },
      { id: 'p1_d', text: '40', isCorrect: false }
    ],
    explanation: 'Each number is doubled to get the next number in the sequence: 2 → 4 → 8 → 16 → 32 → 64',
    difficulty: 'easy'
  },
  {
    id: 2,
    type: 'pattern',
    question: 'Complete the sequence:',
    content: ['A', 'C', 'E', 'G', '?'],
    options: [
      { id: 'p2_a', text: 'H', isCorrect: false },
      { id: 'p2_b', text: 'J', isCorrect: false },
      { id: 'p2_c', text: 'I', isCorrect: true },
      { id: 'p2_d', text: 'K', isCorrect: false }
    ],
    explanation: 'The pattern is every other letter in the alphabet: A → C → E → G → I',
    difficulty: 'easy'
  },
  {
    id: 3,
    type: 'pattern',
    question: 'What is the next number?',
    content: ['1', '4', '9', '16', '25', '?'],
    options: [
      { id: 'p3_a', text: '30', isCorrect: false },
      { id: 'p3_b', text: '36', isCorrect: true },
      { id: 'p3_c', text: '35', isCorrect: false },
      { id: 'p3_d', text: '49', isCorrect: false }
    ],
    explanation: 'These are perfect squares: 1² = 1, 2² = 4, 3² = 9, 4² = 16, 5² = 25, 6² = 36',
    difficulty: 'medium'
  },

  // Math problems
  {
    id: 4,
    type: 'math',
    question: 'If 3x + 7 = 22, what is the value of x?',
    options: [
      { id: 'm1_a', text: '5', isCorrect: true },
      { id: 'm1_b', text: '7', isCorrect: false },
      { id: 'm1_c', text: '4', isCorrect: false },
      { id: 'm1_d', text: '6', isCorrect: false }
    ],
    explanation: 'Solving for x: 3x + 7 = 22, 3x = 15, x = 5',
    difficulty: 'easy'
  },
  {
    id: 5,
    type: 'math',
    question: 'If a shirt costs $25 and is discounted by 20%, what is the final price?',
    options: [
      { id: 'm2_a', text: '$20', isCorrect: true },
      { id: 'm2_b', text: '$18', isCorrect: false },
      { id: 'm2_c', text: '$22', isCorrect: false },
      { id: 'm2_d', text: '$21', isCorrect: false }
    ],
    explanation: 'A 20% discount on $25 means the discount amount is $25 × 0.20 = $5. The final price is $25 - $5 = $20.',
    difficulty: 'easy'
  },
  {
    id: 6,
    type: 'math',
    question: 'If a rectangle has a length of 12 cm and a width of 8 cm, what is its area?',
    options: [
      { id: 'm3_a', text: '20 cm²', isCorrect: false },
      { id: 'm3_b', text: '96 cm²', isCorrect: true },
      { id: 'm3_c', text: '40 cm²', isCorrect: false },
      { id: 'm3_d', text: '64 cm²', isCorrect: false }
    ],
    explanation: 'The area of a rectangle is length × width: 12 cm × 8 cm = 96 cm²',
    difficulty: 'medium'
  },

  // Verbal reasoning problems
  {
    id: 7,
    type: 'verbal',
    question: 'Choose the word that does not belong with the others:',
    content: ['Apple', 'Banana', 'Carrot', 'Orange'],
    options: [
      { id: 'v1_a', text: 'Apple', isCorrect: false },
      { id: 'v1_b', text: 'Banana', isCorrect: false },
      { id: 'v1_c', text: 'Carrot', isCorrect: true },
      { id: 'v1_d', text: 'Orange', isCorrect: false }
    ],
    explanation: 'Carrot is a vegetable, while all others are fruits.',
    difficulty: 'easy'
  },
  {
    id: 8,
    type: 'verbal',
    question: 'Rain is to Cloud as _____ is to Faucet',
    options: [
      { id: 'v2_a', text: 'Shower', isCorrect: false },
      { id: 'v2_b', text: 'Water', isCorrect: true },
      { id: 'v2_c', text: 'Bath', isCorrect: false },
      { id: 'v2_d', text: 'Sink', isCorrect: false }
    ],
    explanation: 'Rain comes from clouds, similarly, water comes from faucets.',
    difficulty: 'medium'
  },
  {
    id: 9,
    type: 'verbal',
    question: 'Find the synonym of "Benevolent":',
    options: [
      { id: 'v3_a', text: 'Hostile', isCorrect: false },
      { id: 'v3_b', text: 'Malicious', isCorrect: false },
      { id: 'v3_c', text: 'Kind', isCorrect: true },
      { id: 'v3_d', text: 'Selfish', isCorrect: false }
    ],
    explanation: '"Benevolent" means kind or charitable, so "Kind" is a synonym.',
    difficulty: 'hard'
  },

  // Visual puzzles
  {
    id: 10,
    type: 'visual',
    question: 'Which image completes the pattern?',
    content: {
      grid: [
        ['▲', '■', '●'],
        ['■', '●', '▲'],
        ['●', '?', '■']
      ]
    },
    options: [
      { id: 'vis1_a', text: '▲', isCorrect: true },
      { id: 'vis1_b', text: '■', isCorrect: false },
      { id: 'vis1_c', text: '●', isCorrect: false },
      { id: 'vis1_d', text: '✖', isCorrect: false }
    ],
    explanation: 'Each row and column contains each shape exactly once. The missing shape in the bottom middle should be a triangle (▲).',
    difficulty: 'medium'
  },
  {
    id: 11,
    type: 'visual',
    question: 'Find the next number in this visual pattern:',
    content: {
      sequence: ['2', '4', '6', '10', '?']
    },
    options: [
      { id: 'vis2_a', text: '12', isCorrect: false },
      { id: 'vis2_b', text: '14', isCorrect: false },
      { id: 'vis2_c', text: '16', isCorrect: true },
      { id: 'vis2_d', text: '18', isCorrect: false }
    ],
    explanation: 'The pattern follows n² + n: 1² + 1 = 2, 2² + 0 = 4, 2² + 2 = 6, 3² + 1 = 10, and 4² + 0 = 16',
    difficulty: 'hard'
  },
  {
    id: 12,
    type: 'visual',
    question: 'If the image is folded along the dotted line, which option shows the correct result?',
    content: {
      description: 'A square with a triangle on the left side and a circle on the right side'
    },
    options: [
      { id: 'vis3_a', text: 'A square with triangles on both sides', isCorrect: false },
      { id: 'vis3_b', text: 'A square with circles on both sides', isCorrect: false },
      { id: 'vis3_c', text: 'A triangle with a circle inside', isCorrect: false },
      { id: 'vis3_d', text: 'A square with a triangle and circle overlapping', isCorrect: true }
    ],
    explanation: 'When the square is folded along the middle, the triangle and circle would overlap.',
    difficulty: 'hard'
  },

  // Additional problems (mix of types)
  {
    id: 13,
    type: 'pattern',
    question: 'What comes next in this pattern?',
    content: ['3', '6', '12', '24', '?'],
    options: [
      { id: 'p4_a', text: '30', isCorrect: false },
      { id: 'p4_b', text: '36', isCorrect: false },
      { id: 'p4_c', text: '48', isCorrect: true },
      { id: 'p4_d', text: '42', isCorrect: false }
    ],
    explanation: 'Each number is multiplied by 2 to get the next number: 3 × 2 = 6, 6 × 2 = 12, 12 × 2 = 24, 24 × 2 = 48',
    difficulty: 'easy'
  },
  {
    id: 14,
    type: 'math',
    question: 'What is the value of x if 2x - 5 = 11?',
    options: [
      { id: 'm4_a', text: '8', isCorrect: true },
      { id: 'm4_b', text: '7', isCorrect: false },
      { id: 'm4_c', text: '9', isCorrect: false },
      { id: 'm4_d', text: '6', isCorrect: false }
    ],
    explanation: 'Solving for x: 2x - 5 = 11, 2x = 16, x = 8',
    difficulty: 'easy'
  },
  {
    id: 15,
    type: 'verbal',
    question: 'Complete the analogy: Hand is to Glove as Foot is to _____',
    options: [
      { id: 'v4_a', text: 'Leg', isCorrect: false },
      { id: 'v4_b', text: 'Toe', isCorrect: false },
      { id: 'v4_c', text: 'Sock', isCorrect: false },
      { id: 'v4_d', text: 'Shoe', isCorrect: true }
    ],
    explanation: 'A glove covers a hand, just as a shoe covers a foot.',
    difficulty: 'easy'
  },
  {
    id: 16,
    type: 'visual',
    question: 'Which shape would complete this pattern?',
    content: {
      description: 'A series of shapes increasing in size: small circle, medium square, large _____'
    },
    options: [
      { id: 'vis4_a', text: 'Triangle', isCorrect: true },
      { id: 'vis4_b', text: 'Circle', isCorrect: false },
      { id: 'vis4_c', text: 'Square', isCorrect: false },
      { id: 'vis4_d', text: 'Rectangle', isCorrect: false }
    ],
    explanation: 'The pattern alternates between circle and square, and increases in size each time. The next shape should be a triangle, continuing both the alternation and size increase.',
    difficulty: 'medium'
  }
];

// Get problems by difficulty
const getProblemsByDifficulty = (difficulty: Difficulty): Problem[] => {
  return PROBLEMS.filter(problem => problem.difficulty === difficulty || problem.difficulty === 'easy');
};

// Props interface
interface BrainPuzzleMasterProps {
  difficulty?: Difficulty;
  onGameComplete?: (score: number, correctAnswers: number, totalProblems: number) => void;
  onExit?: () => void;
}

const BrainPuzzleMaster: React.FC<BrainPuzzleMasterProps> = ({
  difficulty = 'medium',
  onGameComplete,
  onExit
}) => {
  const { t } = useTranslation();
  
  // State
  const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>(difficulty);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintsAvailable, setHintsAvailable] = useState(0);
  const [settings, setSettings] = useState(DIFFICULTY_SETTINGS[difficulty]);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [hintShown, setHintShown] = useState(false);
  
  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  // Initialize game with selected difficulty
  const initializeGame = useCallback((selectedDifficulty: Difficulty) => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    const newSettings = DIFFICULTY_SETTINGS[selectedDifficulty];
    
    // Get problems for the selected difficulty
    const availableProblems = getProblemsByDifficulty(selectedDifficulty);
    
    // Shuffle and take the required number of problems
    const shuffledProblems = [...availableProblems]
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(newSettings.totalProblems, availableProblems.length));
    
    // Reset state
    setCurrentDifficulty(selectedDifficulty);
    setProblems(shuffledProblems);
    setCurrentProblemIndex(0);
    setSelectedOptionId(null);
    setShowExplanation(false);
    setScore(0);
    setTimeLeft(newSettings.timeLimit);
    setCorrectAnswers(0);
    setHintsUsed(0);
    setHintsAvailable(newSettings.hintsAvailable);
    setSettings(newSettings);
    setIsAnswerSubmitted(false);
    setHintShown(false);
    setGameStatus('playing');
    
    // Start timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          // Time's up, end the game
          clearInterval(timerRef.current!);
          setGameStatus('gameover');
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  }, []);
  
  // Start game with current difficulty
  const startGame = useCallback(() => {
    initializeGame(currentDifficulty);
  }, [currentDifficulty, initializeGame]);
  
  // Handle difficulty selection
  const handleDifficultySelect = useCallback((selectedDifficulty: Difficulty) => {
    setCurrentDifficulty(selectedDifficulty);
  }, []);
  
  // Pause game
  const pauseGame = useCallback(() => {
    if (gameStatus === 'playing') {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setGameStatus('paused');
    }
  }, [gameStatus]);
  
  // Resume game
  const resumeGame = useCallback(() => {
    if (gameStatus === 'paused') {
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
      setGameStatus('playing');
    }
  }, [gameStatus]);
  
  // Handle option selection
  const handleOptionSelect = useCallback((optionId: string) => {
    if (isAnswerSubmitted) return;
    setSelectedOptionId(optionId);
  }, [isAnswerSubmitted]);
  
  // Submit answer
  const submitAnswer = useCallback(() => {
    if (selectedOptionId === null || isAnswerSubmitted) return;
    
    const currentProblem = problems[currentProblemIndex];
    const selectedOption = currentProblem.options.find(option => option.id === selectedOptionId);
    
    if (!selectedOption) return;
    
    setIsAnswerSubmitted(true);
    setShowExplanation(true);
    
    // Update score
    if (selectedOption.isCorrect) {
      setScore(prevScore => prevScore + settings.pointsPerCorrect);
      setCorrectAnswers(prev => prev + 1);
    } else {
      setScore(prevScore => prevScore + settings.penaltyPerIncorrect);
    }
  }, [selectedOptionId, problems, currentProblemIndex, settings, isAnswerSubmitted]);
  
  // Move to next problem
  const nextProblem = useCallback(() => {
    const nextIndex = currentProblemIndex + 1;
    
    if (nextIndex >= problems.length) {
      // End game if no more problems
      setGameStatus('gameover');
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Call onGameComplete callback
      if (onGameComplete) {
        onGameComplete(score, correctAnswers, problems.length);
      }
    } else {
      // Move to next problem
      setCurrentProblemIndex(nextIndex);
      setSelectedOptionId(null);
      setShowExplanation(false);
      setIsAnswerSubmitted(false);
      setHintShown(false);
    }
  }, [currentProblemIndex, problems.length, score, correctAnswers, onGameComplete]);
  
  // Use hint
  const useHint = useCallback(() => {
    if (hintsUsed >= hintsAvailable || isAnswerSubmitted || hintShown) return;
    
    setHintShown(true);
    setHintsUsed(prev => prev + 1);
  }, [hintsAvailable, hintsUsed, isAnswerSubmitted, hintShown]);
  
  // Exit game
  const handleExit = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (onExit) {
      onExit();
    }
  }, [onExit]);
  
  // Get current problem
  const currentProblem = problems[currentProblemIndex];
  
  // Format time remaining
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Get hint for current problem
  const getHint = (problem: Problem): string => {
    switch (problem.type) {
      case 'pattern':
        return 'Look for a mathematical or logical relationship between successive elements.';
      case 'math':
        return 'Break down the problem step by step and solve each component.';
      case 'verbal':
        return 'Think about relationships, categories, or defining characteristics.';
      case 'visual':
        return 'Pay attention to shapes, positions, and patterns within the visual elements.';
      default:
        return 'Carefully analyze the problem and consider all possible angles.';
    }
  };
  
  // Effect to update difficulty when prop changes
  useEffect(() => {
    if (gameStatus === 'idle') {
      setCurrentDifficulty(difficulty);
    }
  }, [difficulty, gameStatus]);
  
  // Render problem content based on type
  const renderProblemContent = (problem: Problem) => {
    switch (problem.type) {
      case 'pattern':
        return (
          <div className="brain-puzzle-pattern">
            {problem.content && Array.isArray(problem.content) && problem.content.map((item: string, index: number) => (
              <div 
                key={index} 
                className={`brain-puzzle-pattern-item ${item === '?' ? 'brain-puzzle-pattern-question' : ''}`}
              >
                {item}
              </div>
            ))}
          </div>
        );
      
      case 'math':
        return (
          <div className="brain-puzzle-math-equation">
            {problem.content || problem.question}
          </div>
        );
      
      case 'verbal':
        return (
          <div className="brain-puzzle-verbal-question">
            {problem.content && Array.isArray(problem.content) ? problem.content.join(', ') : problem.question}
          </div>
        );
      
      case 'visual':
        if (problem.content && typeof problem.content === 'object') {
          if ('grid' in problem.content && Array.isArray(problem.content.grid)) {
            return (
              <div className="brain-puzzle-visual-grid">
                {problem.content.grid.flat().map((item: string, index: number) => (
                  <div 
                    key={index} 
                    className={`brain-puzzle-visual-item ${item === '?' ? 'question' : ''}`}
                  >
                    {item}
                  </div>
                ))}
              </div>
            );
          } else if ('sequence' in problem.content && Array.isArray(problem.content.sequence)) {
            return (
              <div className="brain-puzzle-pattern">
                {problem.content.sequence.map((item: string, index: number) => (
                  <div 
                    key={index} 
                    className={`brain-puzzle-pattern-item ${item === '?' ? 'brain-puzzle-pattern-question' : ''}`}
                  >
                    {item}
                  </div>
                ))}
              </div>
            );
          } else if ('description' in problem.content) {
            return (
              <div className="brain-puzzle-verbal-question">
                {problem.content.description}
              </div>
            );
          }
        }
        return null;
      
      default:
        return null;
    }
  };
  
  // Render progress indicator
  const renderProgressIndicator = () => {
    return (
      <div className="brain-puzzle-progress">
        {problems.map((_, index) => (
          <div 
            key={index} 
            className={`brain-puzzle-progress-step ${
              index < currentProblemIndex ? 'completed' : 
              index === currentProblemIndex ? 'active' : ''
            }`}
          />
        ))}
      </div>
    );
  };
  
  // Render intro screen
  const renderIntro = () => (
    <div className="brain-puzzle-intro">
      <h1 className="brain-puzzle-intro-title">{t('Brain Puzzle Master')}</h1>
      <p className="brain-puzzle-intro-text">
        {t('brain_puzzle_intro_text', 'Challenge your brain with a variety of puzzles including pattern recognition, mathematical reasoning, verbal problems, and visual puzzles.')}
      </p>
      
      <div className="brain-puzzle-difficulty-selector">
        <button 
          className={`brain-puzzle-difficulty-button ${currentDifficulty === 'easy' ? 'selected' : ''}`}
          onClick={() => handleDifficultySelect('easy')}
        >
          {t('easy')}
        </button>
        <button 
          className={`brain-puzzle-difficulty-button ${currentDifficulty === 'medium' ? 'selected' : ''}`}
          onClick={() => handleDifficultySelect('medium')}
        >
          {t('medium')}
        </button>
        <button 
          className={`brain-puzzle-difficulty-button ${currentDifficulty === 'hard' ? 'selected' : ''}`}
          onClick={() => handleDifficultySelect('hard')}
        >
          {t('hard')}
        </button>
      </div>
      
      <div className="brain-puzzle-buttons-row">
        <button 
          className="brain-puzzle-button brain-puzzle-button-primary"
          onClick={startGame}
        >
          {t('start_game')}
        </button>
        
        <button 
          className="brain-puzzle-button brain-puzzle-button-secondary"
          onClick={handleExit}
        >
          {t('exit')}
        </button>
      </div>
    </div>
  );
  
  // Render game over screen
  const renderGameOver = () => (
    <div className="brain-puzzle-game-over">
      <h1 className="brain-puzzle-game-over-title">{t('game_over')}</h1>
      
      <div className="brain-puzzle-game-over-stats">
        <div className="brain-puzzle-game-over-stat">
          <div className="brain-puzzle-game-over-stat-label">{t('final_score')}</div>
          <div className="brain-puzzle-game-over-stat-value">{score}</div>
        </div>
        <div className="brain-puzzle-game-over-stat">
          <div className="brain-puzzle-game-over-stat-label">{t('correct_answers')}</div>
          <div className="brain-puzzle-game-over-stat-value">{correctAnswers} / {problems.length}</div>
        </div>
        <div className="brain-puzzle-game-over-stat">
          <div className="brain-puzzle-game-over-stat-label">{t('accuracy')}</div>
          <div className="brain-puzzle-game-over-stat-value">
            {problems.length > 0 ? Math.round((correctAnswers / problems.length) * 100) : 0}%
          </div>
        </div>
      </div>
      
      <div className="brain-puzzle-buttons-row">
        <button 
          className="brain-puzzle-button brain-puzzle-button-primary"
          onClick={() => setGameStatus('idle')}
        >
          {t('play_again')}
        </button>
        
        <button 
          className="brain-puzzle-button brain-puzzle-button-secondary"
          onClick={handleExit}
        >
          {t('exit')}
        </button>
      </div>
    </div>
  );

  // Render paused screen
  const renderPaused = () => (
    <div className="brain-puzzle-paused">
      <h1 className="brain-puzzle-paused-title">{t('game_paused')}</h1>
      <p className="brain-puzzle-paused-text">
        {t('paused_text', 'The game is currently paused. Resume to continue or exit to quit.')}
      </p>
      
      <div className="brain-puzzle-buttons-row">
        <button 
          className="brain-puzzle-button brain-puzzle-button-primary"
          onClick={resumeGame}
        >
          {t('resume')}
        </button>
        
        <button 
          className="brain-puzzle-button brain-puzzle-button-secondary"
          onClick={handleExit}
        >
          {t('exit')}
        </button>
      </div>
    </div>
  );
  
  // Render gameplay
  const renderGameplay = () => {
    if (!currentProblem) return null;
    
    return (
      <div className="brain-puzzle-content">
        <div className="brain-puzzle-header">
          <div className="brain-puzzle-title">{t('Brain Puzzle Master')}</div>
          <div className="brain-puzzle-info">
            <div className="brain-puzzle-stat">
              <div className="brain-puzzle-stat-label">{t('score')}</div>
              <div className="brain-puzzle-stat-value">{score}</div>
            </div>
            <div className="brain-puzzle-stat">
              <div className="brain-puzzle-stat-label">{t('progress')}</div>
              <div className="brain-puzzle-stat-value">{currentProblemIndex + 1} / {problems.length}</div>
            </div>
            <div className="brain-puzzle-stat">
              <div className="brain-puzzle-stat-label">{t('time')}</div>
              <div className="brain-puzzle-stat-value">{formatTime(timeLeft)}</div>
            </div>
            {hintsAvailable > 0 && (
              <div className="brain-puzzle-stat">
                <div className="brain-puzzle-stat-label">{t('hints')}</div>
                <div className="brain-puzzle-stat-value">{hintsAvailable - hintsUsed}</div>
              </div>
            )}
          </div>
        </div>
        
        {renderProgressIndicator()}
        
        <div className="brain-puzzle-problem">
          <span className="brain-puzzle-problem-type">
            {t(currentProblem.type)}
          </span>
          <h3 className="brain-puzzle-problem-title">{currentProblem.question}</h3>
          
          <div className="brain-puzzle-problem-content">
            {renderProblemContent(currentProblem)}
          </div>
          
          <div className="brain-puzzle-options">
            {currentProblem.options.map((option) => (
              <button
                key={option.id}
                className={`brain-puzzle-option ${selectedOptionId === option.id ? 'selected' : ''} ${
                  isAnswerSubmitted ? (option.isCorrect ? 'correct' : selectedOptionId === option.id ? 'incorrect' : '') : ''
                }`}
                onClick={() => handleOptionSelect(option.id)}
                disabled={isAnswerSubmitted}
              >
                {option.text}
              </button>
            ))}
          </div>
          
          {hintShown && (
            <div className="brain-puzzle-hint">
              <strong>{t('hint')}:</strong> {getHint(currentProblem)}
            </div>
          )}
          
          {showExplanation && selectedOptionId !== null && (
            <div className="brain-puzzle-explanation">
              <strong>{t('explanation')}:</strong> {currentProblem.explanation}
            </div>
          )}
        </div>
        
        <div className="brain-puzzle-controls">
          {!isAnswerSubmitted ? (
            <>
              <div>
                <button
                  className="brain-puzzle-button brain-puzzle-button-secondary"
                  onClick={pauseGame}
                >
                  {t('pause')}
                </button>
                <button
                  className="brain-puzzle-button brain-puzzle-button-secondary"
                  onClick={handleExit}
                >
                  {t('exit')}
                </button>
              </div>
              
              <div>
                {hintsAvailable > hintsUsed && !hintShown && (
                  <button
                    className="brain-puzzle-button brain-puzzle-button-secondary"
                    onClick={useHint}
                  >
                    {t('use_hint')}
                  </button>
                )}
                
                <button
                  className="brain-puzzle-button brain-puzzle-button-primary"
                  onClick={submitAnswer}
                  disabled={selectedOptionId === null}
                >
                  {t('submit')}
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                className="brain-puzzle-button brain-puzzle-button-secondary"
                onClick={handleExit}
              >
                {t('exit')}
              </button>
              
              <button
                className="brain-puzzle-button brain-puzzle-button-primary"
                onClick={nextProblem}
              >
                {currentProblemIndex < problems.length - 1 ? t('next_problem') : t('finish')}
              </button>
            </>
          )}
        </div>
        
        <div className="brain-puzzle-timer">
          <div 
            className="brain-puzzle-timer-fill"
            style={{ width: `${(timeLeft / settings.timeLimit) * 100}%` }}
          />
        </div>
      </div>
    );
  };
  
  // Render based on game status
  switch (gameStatus) {
    case 'idle':
      return renderIntro();
    case 'playing':
      return renderGameplay();
    case 'paused':
      return renderPaused();
    case 'gameover':
      return renderGameOver();
    default:
      return renderIntro();
  }
};

export default BrainPuzzleMaster; 