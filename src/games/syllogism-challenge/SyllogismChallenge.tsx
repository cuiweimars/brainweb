import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './SyllogismChallenge.css';

// Difficulty settings
const DIFFICULTY_SETTINGS = {
  easy: {
    totalProblems: 5,
    timeLimit: 60, // seconds
    pointsPerCorrect: 10,
    penaltyPerIncorrect: -2,
    timePerProblem: 30,
    hintsAvailable: 2
  },
  medium: {
    totalProblems: 8,
    timeLimit: 90,
    pointsPerCorrect: 15,
    penaltyPerIncorrect: -3,
    timePerProblem: 25,
    hintsAvailable: 1
  },
  hard: {
    totalProblems: 12,
    timeLimit: 120,
    pointsPerCorrect: 20,
    penaltyPerIncorrect: -5,
    timePerProblem: 20,
    hintsAvailable: 0
  }
};

// Types
type Difficulty = 'easy' | 'medium' | 'hard';
type GameStatus = 'idle' | 'playing' | 'paused' | 'gameover';

interface SyllogismOption {
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

interface SyllogismProblem {
  id: number;
  premises: string[];
  options: SyllogismOption[];
  difficulty: Difficulty;
  category?: string;
}

// Sample syllogism problems
const PROBLEMS: SyllogismProblem[] = [
  // Easy problems
  {
    id: 1,
    premises: [
      "All roses are flowers.",
      "All flowers need water."
    ],
    options: [
      { 
        text: "All roses need water.", 
        isCorrect: true,
        explanation: "Since all roses are flowers, and all flowers need water, it logically follows that all roses need water."
      },
      { 
        text: "Some roses don't need water.", 
        isCorrect: false,
        explanation: "This contradicts the premises because all roses are flowers, and all flowers need water." 
      },
      { 
        text: "All things that need water are roses.", 
        isCorrect: false,
        explanation: "This is a logical error called the 'fallacy of the converse'. Just because all roses need water, it doesn't mean that everything that needs water is a rose."
      }
    ],
    difficulty: 'easy'
  },
  {
    id: 2,
    premises: [
      "No cats are dogs.",
      "All poodles are dogs."
    ],
    options: [
      { 
        text: "No poodles are cats.", 
        isCorrect: true,
        explanation: "Since all poodles are dogs, and no cats are dogs, it follows that no poodles are cats."
      },
      { 
        text: "Some poodles are cats.", 
        isCorrect: false,
        explanation: "This contradicts the premises because all poodles are dogs, and no cats are dogs."
      },
      { 
        text: "All dogs are poodles.", 
        isCorrect: false,
        explanation: "This does not follow from the premises. We only know that all poodles are dogs, not that all dogs are poodles."
      }
    ],
    difficulty: 'easy'
  },
  // Medium problems
  {
    id: 3,
    premises: [
      "All scientists are logical thinkers.",
      "Some artists are scientists."
    ],
    options: [
      { 
        text: "Some artists are logical thinkers.", 
        isCorrect: true,
        explanation: "Since some artists are scientists, and all scientists are logical thinkers, it follows that some artists are logical thinkers."
      },
      { 
        text: "All artists are logical thinkers.", 
        isCorrect: false,
        explanation: "This doesn't follow from the premises. We only know that some artists are scientists, not all of them."
      },
      { 
        text: "No artists are logical thinkers.", 
        isCorrect: false,
        explanation: "This contradicts the premises because some artists are scientists, and all scientists are logical thinkers."
      }
    ],
    difficulty: 'medium'
  },
  {
    id: 4,
    premises: [
      "Some mammals can fly.",
      "All bats are mammals."
    ],
    options: [
      { 
        text: "All bats can fly.", 
        isCorrect: false,
        explanation: "This doesn't follow from the premises. We only know that some mammals can fly, but that doesn't tell us which specific mammals."
      },
      { 
        text: "Some bats might be able to fly.", 
        isCorrect: true,
        explanation: "This is logically consistent with the premises. Since some mammals can fly and all bats are mammals, it's possible that bats are among the mammals that can fly."
      },
      { 
        text: "No bats can fly.", 
        isCorrect: false,
        explanation: "This doesn't follow from the premises and might contradict them if bats are among the mammals that can fly."
      }
    ],
    difficulty: 'medium'
  },
  // Hard problems
  {
    id: 5,
    premises: [
      "All things that are studied by scientists are interesting.",
      "Some interesting things are difficult to understand.",
      "All difficult theories require mathematical knowledge."
    ],
    options: [
      { 
        text: "All things studied by scientists require mathematical knowledge.", 
        isCorrect: false,
        explanation: "This doesn't follow from the premises. Not all things studied by scientists are difficult theories."
      },
      { 
        text: "Some things studied by scientists might require mathematical knowledge.", 
        isCorrect: true,
        explanation: "This follows because some interesting things are difficult to understand, all things studied by scientists are interesting, and all difficult theories require mathematical knowledge."
      },
      { 
        text: "No interesting things require mathematical knowledge.", 
        isCorrect: false,
        explanation: "This contradicts the premises. Some interesting things are difficult to understand, and all difficult theories require mathematical knowledge."
      }
    ],
    difficulty: 'hard'
  },
  {
    id: 6,
    premises: [
      "No emotionally intelligent people are poor communicators.",
      "Some leaders are poor communicators.",
      "All effective managers are emotionally intelligent."
    ],
    options: [
      { 
        text: "Some leaders are not effective managers.", 
        isCorrect: true,
        explanation: "Since some leaders are poor communicators, and no emotionally intelligent people are poor communicators, it follows that some leaders are not emotionally intelligent. Since all effective managers are emotionally intelligent, these leaders cannot be effective managers."
      },
      { 
        text: "No leaders are effective managers.", 
        isCorrect: false,
        explanation: "This doesn't follow from the premises. We only know that some leaders are poor communicators, not all of them."
      },
      { 
        text: "All effective managers are leaders.", 
        isCorrect: false,
        explanation: "This is not supported by the premises. We have no information about whether effective managers are leaders."
      }
    ],
    difficulty: 'hard'
  },
  // More problems for each difficulty
  {
    id: 7,
    premises: [
      "All laptops are electronic devices.",
      "Some electronic devices are expensive."
    ],
    options: [
      { 
        text: "All laptops are expensive.", 
        isCorrect: false,
        explanation: "This doesn't follow from the premises. We only know that some electronic devices are expensive, not all of them."
      },
      { 
        text: "Some laptops might be expensive.", 
        isCorrect: true,
        explanation: "This is logically consistent with the premises. Since some electronic devices are expensive and all laptops are electronic devices, it's possible that laptops are among the expensive electronic devices."
      },
      { 
        text: "No laptops are expensive.", 
        isCorrect: false,
        explanation: "This doesn't follow from the premises and might contradict them if laptops are among the expensive electronic devices."
      }
    ],
    difficulty: 'easy'
  },
  {
    id: 8,
    premises: [
      "All novelists are creative.",
      "Some journalists are novelists."
    ],
    options: [
      { 
        text: "Some journalists are creative.", 
        isCorrect: true,
        explanation: "Since some journalists are novelists, and all novelists are creative, it follows that some journalists are creative."
      },
      { 
        text: "All journalists are creative.", 
        isCorrect: false,
        explanation: "This doesn't follow from the premises. We only know that some journalists are novelists, not all of them."
      },
      { 
        text: "No journalists are creative.", 
        isCorrect: false,
        explanation: "This contradicts the premises because some journalists are novelists, and all novelists are creative."
      }
    ],
    difficulty: 'easy'
  }
];

// Get problems by difficulty
const getProblemsByDifficulty = (difficulty: Difficulty): SyllogismProblem[] => {
  return PROBLEMS.filter(problem => problem.difficulty === difficulty);
};

// Props interface
interface SyllogismChallengeProps {
  difficulty?: Difficulty;
  onGameComplete?: (score: number, correctAnswers: number, totalProblems: number) => void;
  onExit?: () => void;
}

const SyllogismChallenge: React.FC<SyllogismChallengeProps> = ({
  difficulty = 'medium',
  onGameComplete,
  onExit
}) => {
  const { t } = useTranslation();
  
  // State
  const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>(difficulty);
  const [problems, setProblems] = useState<SyllogismProblem[]>([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintsAvailable, setHintsAvailable] = useState(0);
  const [settings, setSettings] = useState(DIFFICULTY_SETTINGS[difficulty]);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  
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
      .slice(0, newSettings.totalProblems);
    
    // Reset state
    setCurrentDifficulty(selectedDifficulty);
    setProblems(shuffledProblems);
    setCurrentProblemIndex(0);
    setSelectedOptionIndex(null);
    setShowExplanation(false);
    setScore(0);
    setTimeLeft(newSettings.timeLimit);
    setCorrectAnswers(0);
    setHintsUsed(0);
    setHintsAvailable(newSettings.hintsAvailable);
    setSettings(newSettings);
    setIsAnswerSubmitted(false);
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
  
  // Handle option selection
  const handleOptionSelect = useCallback((optionIndex: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOptionIndex(optionIndex);
  }, [isAnswerSubmitted]);
  
  // Submit answer
  const submitAnswer = useCallback(() => {
    if (selectedOptionIndex === null || isAnswerSubmitted) return;
    
    const currentProblem = problems[currentProblemIndex];
    const selectedOption = currentProblem.options[selectedOptionIndex];
    
    setIsAnswerSubmitted(true);
    setShowExplanation(true);
    
    // Update score
    if (selectedOption.isCorrect) {
      setScore(prevScore => prevScore + settings.pointsPerCorrect);
      setCorrectAnswers(prev => prev + 1);
    } else {
      setScore(prevScore => prevScore + settings.penaltyPerIncorrect);
    }
  }, [selectedOptionIndex, problems, currentProblemIndex, settings, isAnswerSubmitted]);
  
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
      setSelectedOptionIndex(null);
      setShowExplanation(false);
      setIsAnswerSubmitted(false);
    }
  }, [currentProblemIndex, problems.length, score, correctAnswers, onGameComplete]);
  
  // Use hint (remove one wrong answer)
  const useHint = useCallback(() => {
    if (hintsUsed >= hintsAvailable || isAnswerSubmitted) return;
    
    const currentProblem = problems[currentProblemIndex];
    const wrongOptionIndices = currentProblem.options
      .map((option, index) => ({ isCorrect: option.isCorrect, index }))
      .filter(item => !item.isCorrect)
      .map(item => item.index);
    
    // If there are wrong options, set one of them as disabled
    if (wrongOptionIndices.length > 0) {
      const randomWrongIndex = wrongOptionIndices[Math.floor(Math.random() * wrongOptionIndices.length)];
      // In a real implementation, we would disable this option in the UI
      
      setHintsUsed(prev => prev + 1);
    }
  }, [hintsAvailable, hintsUsed, problems, currentProblemIndex, isAnswerSubmitted]);
  
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
  
  // Effect to update difficulty when prop changes
  useEffect(() => {
    if (gameStatus === 'idle') {
      setCurrentDifficulty(difficulty);
    }
  }, [difficulty, gameStatus]);
  
  // Render intro screen
  const renderIntro = () => (
    <div className="syllogism-intro">
      <h1 className="syllogism-intro-title">{t('Syllogism Challenge')}</h1>
      <p className="syllogism-intro-text">
        {t('syllogism_intro_text', 'Test your logical reasoning skills by solving syllogism puzzles. Review the premises and choose the logically valid conclusion.')}
      </p>
      
      <div className="syllogism-difficulty-selector">
        <button 
          className={`syllogism-difficulty-button ${currentDifficulty === 'easy' ? 'selected' : ''}`}
          onClick={() => handleDifficultySelect('easy')}
        >
          {t('easy')}
        </button>
        <button 
          className={`syllogism-difficulty-button ${currentDifficulty === 'medium' ? 'selected' : ''}`}
          onClick={() => handleDifficultySelect('medium')}
        >
          {t('medium')}
        </button>
        <button 
          className={`syllogism-difficulty-button ${currentDifficulty === 'hard' ? 'selected' : ''}`}
          onClick={() => handleDifficultySelect('hard')}
        >
          {t('hard')}
        </button>
      </div>
      
      <div className="syllogism-buttons-row">
        <button 
          className="syllogism-button syllogism-button-primary"
          onClick={startGame}
        >
          {t('start_game')}
        </button>
        
        <button 
          className="syllogism-button syllogism-button-secondary"
          onClick={handleExit}
        >
          {t('exit')}
        </button>
      </div>
    </div>
  );
  
  // Render game over screen
  const renderGameOver = () => (
    <div className="syllogism-game-over">
      <h1 className="syllogism-game-over-title">{t('game_over')}</h1>
      
      <div className="syllogism-game-over-stats">
        <div className="syllogism-game-over-stat">
          <div className="syllogism-game-over-stat-label">{t('final_score')}</div>
          <div className="syllogism-game-over-stat-value">{score}</div>
        </div>
        <div className="syllogism-game-over-stat">
          <div className="syllogism-game-over-stat-label">{t('correct_answers')}</div>
          <div className="syllogism-game-over-stat-value">{correctAnswers} / {problems.length}</div>
        </div>
        <div className="syllogism-game-over-stat">
          <div className="syllogism-game-over-stat-label">{t('accuracy')}</div>
          <div className="syllogism-game-over-stat-value">
            {problems.length > 0 ? Math.round((correctAnswers / problems.length) * 100) : 0}%
          </div>
        </div>
      </div>
      
      <div className="syllogism-buttons-row">
        <button 
          className="syllogism-button syllogism-button-primary"
          onClick={() => setGameStatus('idle')}
        >
          {t('play_again')}
        </button>
        
        <button 
          className="syllogism-button syllogism-button-secondary"
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
      <div className="syllogism-content">
        <div className="syllogism-header">
          <div className="syllogism-title">{t('Syllogism Challenge')}</div>
          <div className="syllogism-info">
            <div className="syllogism-stat">
              <div className="syllogism-stat-label">{t('score')}</div>
              <div className="syllogism-stat-value">{score}</div>
            </div>
            <div className="syllogism-stat">
              <div className="syllogism-stat-label">{t('progress')}</div>
              <div className="syllogism-stat-value">{currentProblemIndex + 1} / {problems.length}</div>
            </div>
            <div className="syllogism-stat">
              <div className="syllogism-stat-label">{t('time')}</div>
              <div className="syllogism-stat-value">{timeLeft}s</div>
            </div>
            {hintsAvailable > 0 && (
              <div className="syllogism-stat">
                <div className="syllogism-stat-label">{t('hints')}</div>
                <div className="syllogism-stat-value">{hintsAvailable - hintsUsed}</div>
              </div>
            )}
          </div>
        </div>
        
        <div className="syllogism-problem">
          <h3>{t('premises')}:</h3>
          <div className="syllogism-premises">
            {currentProblem.premises.map((premise, index) => (
              <div key={index} className="syllogism-premise">
                {premise}
              </div>
            ))}
          </div>
          
          <h3>{t('which_conclusion_follows')}?</h3>
          <div className="syllogism-conclusion-options">
            {currentProblem.options.map((option, index) => (
              <button
                key={index}
                className={`syllogism-option ${selectedOptionIndex === index ? 'selected' : ''} ${
                  isAnswerSubmitted ? (option.isCorrect ? 'correct' : selectedOptionIndex === index ? 'incorrect' : '') : ''
                }`}
                onClick={() => handleOptionSelect(index)}
                disabled={isAnswerSubmitted}
              >
                {option.text}
              </button>
            ))}
          </div>
          
          {showExplanation && selectedOptionIndex !== null && (
            <div className="syllogism-explanation">
              <strong>{t('explanation')}:</strong> {currentProblem.options[selectedOptionIndex].explanation}
            </div>
          )}
        </div>
        
        <div className="syllogism-controls">
          {!isAnswerSubmitted ? (
            <>
              <button
                className="syllogism-button syllogism-button-secondary"
                onClick={handleExit}
              >
                {t('exit')}
              </button>
              
              <div>
                {hintsAvailable > hintsUsed && (
                  <button
                    className="syllogism-button syllogism-button-secondary"
                    onClick={useHint}
                  >
                    {t('use_hint')}
                  </button>
                )}
                
                <button
                  className="syllogism-button syllogism-button-primary"
                  onClick={submitAnswer}
                  disabled={selectedOptionIndex === null}
                >
                  {t('submit')}
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                className="syllogism-button syllogism-button-secondary"
                onClick={handleExit}
              >
                {t('exit')}
              </button>
              
              <button
                className="syllogism-button syllogism-button-primary"
                onClick={nextProblem}
              >
                {currentProblemIndex < problems.length - 1 ? t('next_problem') : t('finish')}
              </button>
            </>
          )}
        </div>
        
        <div className="syllogism-timer">
          <div 
            className="syllogism-timer-fill"
            style={{ width: `${(timeLeft / settings.timeLimit) * 100}%` }}
          />
        </div>
      </div>
    );
  };
  
  // Render based on game status
  switch (gameStatus) {
    case 'idle':
      return (
        <div className="syllogism-game" style={{ backgroundColor: '#121212' }}>
          {renderIntro()}
        </div>
      );
    case 'playing':
      return (
        <div className="syllogism-game" style={{ backgroundColor: '#121212' }}>
          {renderGameplay()}
        </div>
      );
    case 'gameover':
      return (
        <div className="syllogism-game" style={{ backgroundColor: '#121212' }}>
          {renderGameOver()}
        </div>
      );
    default:
      return (
        <div className="syllogism-game" style={{ backgroundColor: '#121212' }}>
          {renderIntro()}
        </div>
      );
  }
};

export default SyllogismChallenge; 