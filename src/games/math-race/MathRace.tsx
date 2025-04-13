import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './MathRace.css';

// Difficulty settings
const DIFFICULTY_SETTINGS = {
  easy: {
    operations: ['+', '-'],
    maxNumber: 10,
    timeLimit: 60, // seconds
    targetScore: 100,
    pointsPerQuestion: 10,
    penaltyPerError: 5
  },
  medium: {
    operations: ['+', '-', '*'],
    maxNumber: 20,
    timeLimit: 60, // seconds
    targetScore: 150,
    pointsPerQuestion: 15,
    penaltyPerError: 10
  },
  hard: {
    operations: ['+', '-', '*', '/'],
    maxNumber: 30,
    timeLimit: 60, // seconds
    targetScore: 200,
    pointsPerQuestion: 20,
    penaltyPerError: 15
  }
};

// Sound effects
const soundEffects = {
  buttonPress: () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.value = 440;
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      gainNode.gain.value = 0.1;
      oscillator.start();
      
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 150);
    } catch (e) {
      console.log('Audio not supported');
    }
  },
  success: () => {
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
        oscillator.frequency.value = 800;
        setTimeout(() => {
          oscillator.stop();
          audioContext.close();
        }, 200);
      }, 200);
    } catch (e) {
      console.log('Audio not supported');
    }
  },
  error: () => {
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
        }, 300);
      }, 200);
    } catch (e) {
      console.log('Audio not supported');
    }
  }
};

interface Question {
  id: number;
  expression: string;
  answer: number;
  userAnswer: string;
  isCorrect: boolean | null;
}

interface MathRaceProps {
  difficulty?: 'easy' | 'medium' | 'hard';
  onGameComplete?: (score: number, correctAnswers: number, totalTime: number) => void;
  onExit?: () => void;
}

const MathRace: React.FC<MathRaceProps> = ({
  difficulty = 'medium',
  onGameComplete,
  onExit
}) => {
  const { t } = useTranslation();
  
  // Game state
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'paused' | 'gameover'>('idle');
  const [gameSettings, setGameSettings] = useState(DIFFICULTY_SETTINGS[difficulty]);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(DIFFICULTY_SETTINGS[difficulty].timeLimit);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [userInput, setUserInput] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [gameStartTime, setGameStartTime] = useState(0);
  const [totalQuestionsAnswered, setTotalQuestionsAnswered] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [progress, setProgress] = useState(0);
  
  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Generate a random calculation question
  const generateQuestion = useCallback((): Question => {
    const operations = gameSettings.operations;
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1: number, num2: number, answer: number;
    
    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * gameSettings.maxNumber) + 1;
        num2 = Math.floor(Math.random() * gameSettings.maxNumber) + 1;
        answer = num1 + num2;
        break;
      case '-':
        num1 = Math.floor(Math.random() * gameSettings.maxNumber) + 1;
        num2 = Math.floor(Math.random() * num1) + 1; // Ensure positive result
        answer = num1 - num2;
        break;
      case '*':
        num1 = Math.floor(Math.random() * Math.sqrt(gameSettings.maxNumber)) + 1;
        num2 = Math.floor(Math.random() * Math.sqrt(gameSettings.maxNumber)) + 1;
        answer = num1 * num2;
        break;
      case '/':
        num2 = Math.floor(Math.random() * Math.sqrt(gameSettings.maxNumber)) + 1;
        answer = Math.floor(Math.random() * Math.sqrt(gameSettings.maxNumber)) + 1;
        num1 = num2 * answer; // Ensure integer result
        break;
      default:
        num1 = Math.floor(Math.random() * gameSettings.maxNumber) + 1;
        num2 = Math.floor(Math.random() * gameSettings.maxNumber) + 1;
        answer = num1 + num2;
    }
    
    // Generate expression
    const expression = `${num1} ${operation} ${num2}`;
    
    return {
      id: Date.now(),
      expression,
      answer,
      userAnswer: '',
      isCorrect: null
    };
  }, [gameSettings]);
  
  // Initialize game
  const initializeGame = useCallback(() => {
    setScore(0);
    setCorrectAnswers(0);
    setIncorrectAnswers(0);
    setTimeRemaining(gameSettings.timeLimit);
    setCurrentQuestion(null);
    setUserInput('');
    setFeedbackMessage('');
    setGameStartTime(0);
    setTotalQuestionsAnswered(0);
    setProgress(0);
    setGameStatus('idle');
    
    // Clear any existing timers
    if (timerRef.current) clearInterval(timerRef.current);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
  }, [gameSettings]);
  
  // Update settings when difficulty changes
  useEffect(() => {
    setGameSettings(DIFFICULTY_SETTINGS[difficulty]);
  }, [difficulty]);
  
  // Initialize game on mount or when settings change
  useEffect(() => {
    initializeGame();
  }, [gameSettings, initializeGame]);
  
  // Start the game
  const startGame = () => {
    setGameStatus('playing');
    setGameStartTime(Date.now());
    setCurrentQuestion(generateQuestion());
    
    // Focus on input field
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    // Start timer
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleGameOver();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  // Handle game over
  const handleGameOver = () => {
    setGameStatus('gameover');
    
    // Clear timer
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Calculate total time played
    const totalTimePlayed = gameSettings.timeLimit - timeRemaining;
    
    // Call onGameComplete callback
    if (onGameComplete) {
      onGameComplete(score, correctAnswers, totalTimePlayed);
    }
  };
  
  // Handle user input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentQuestion || gameStatus !== 'playing') return;
    
    // Play button sound
    if (soundEnabled) soundEffects.buttonPress();
    
    const userAnswer = parseInt(userInput.trim());
    
    // Check if the input is a valid number
    if (isNaN(userAnswer)) {
      setFeedbackMessage(t('enter_valid_number'));
      return;
    }
    
    // Check if the answer is correct
    const isCorrect = userAnswer === currentQuestion.answer;
    
    // Update the current question
    const updatedQuestion = {
      ...currentQuestion,
      userAnswer: userInput,
      isCorrect
    };
    setCurrentQuestion(updatedQuestion);
    
    // Update game state based on answer
    if (isCorrect) {
      // Play success sound
      if (soundEnabled) soundEffects.success();
      
      // Update score and stats
      const newScore = score + gameSettings.pointsPerQuestion;
      setScore(newScore);
      setCorrectAnswers(prev => prev + 1);
      setFeedbackMessage(`+${gameSettings.pointsPerQuestion} ${t('points')}!`);
      
      // Update progress towards target score
      const newProgress = (newScore / gameSettings.targetScore) * 100;
      setProgress(Math.min(newProgress, 100));
      
      // Check if target score reached
      if (newScore >= gameSettings.targetScore) {
        handleGameOver();
        return;
      }
    } else {
      // Play error sound
      if (soundEnabled) soundEffects.error();
      
      // Apply penalty if score is above zero
      if (score > 0) {
        setScore(prev => Math.max(0, prev - gameSettings.penaltyPerError));
      }
      
      setIncorrectAnswers(prev => prev + 1);
      setFeedbackMessage(`${t('incorrect')} (-${gameSettings.penaltyPerError})`);
    }
    
    // Update total questions answered
    setTotalQuestionsAnswered(prev => prev + 1);
    
    // Clear input and generate new question after short delay
    feedbackTimerRef.current = setTimeout(() => {
      setUserInput('');
      setCurrentQuestion(generateQuestion());
      setFeedbackMessage('');
      
      // Focus on input field again
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 1000);
  };
  
  // Pause the game
  const pauseGame = () => {
    if (gameStatus === 'playing') {
      setGameStatus('paused');
      if (timerRef.current) clearInterval(timerRef.current);
    } else if (gameStatus === 'paused') {
      setGameStatus('playing');
      
      // Restart timer
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleGameOver();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Focus on input field again
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };
  
  // Toggle sound
  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate game stats
  const accuracy = totalQuestionsAnswered > 0 
    ? Math.round((correctAnswers / totalQuestionsAnswered) * 100) 
    : 0;
  
  // Calculate time percentages for progress bars
  const timePercentage = (timeRemaining / gameSettings.timeLimit) * 100;
  
  return (
    <div className="math-race-container">
      {/* Stats Bar */}
      <div className="stats-container">
        <div className="stats-content">
          <div className="stat-item">
            <div className="stat-label">{t('score')}</div>
            <div className="stat-value">{score}</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-label">{t('time')}</div>
            <div className="stat-value">{formatTime(timeRemaining)}</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-label">{t('target')}</div>
            <div className="stat-value">{gameSettings.targetScore}</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-label">{t('accuracy')}</div>
            <div className="stat-value">{accuracy}%</div>
          </div>
        </div>
      </div>
      
      {/* Difficulty Buttons */}
      <div className="difficulty-container">
        <button
          onClick={() => gameStatus === 'idle' && setGameSettings(DIFFICULTY_SETTINGS.easy)}
          className={`difficulty-button ${difficulty === 'easy' ? 'difficulty-active easy' : ''}`}
          disabled={gameStatus !== 'idle'}
        >
          {t('easy')}
        </button>
        <button
          onClick={() => gameStatus === 'idle' && setGameSettings(DIFFICULTY_SETTINGS.medium)}
          className={`difficulty-button ${difficulty === 'medium' ? 'difficulty-active medium' : ''}`}
          disabled={gameStatus !== 'idle'}
        >
          {t('medium')}
        </button>
        <button
          onClick={() => gameStatus === 'idle' && setGameSettings(DIFFICULTY_SETTINGS.hard)}
          className={`difficulty-button ${difficulty === 'hard' ? 'difficulty-active hard' : ''}`}
          disabled={gameStatus !== 'idle'}
        >
          {t('hard')}
        </button>
      </div>
      
      {/* Sound Control */}
      <div className="sound-control">
        <button onClick={toggleSound} className="sound-button">
          {soundEnabled ? (
            <span className="sound-icon">🔊</span>
          ) : (
            <span className="sound-icon">🔇</span>
          )}
        </button>
      </div>
      
      {/* Pause Button */}
      <div className="pause-control">
        <button 
          onClick={pauseGame}
          className="pause-button"
          disabled={gameStatus !== 'playing' && gameStatus !== 'paused'}
        >
          {gameStatus === 'paused' ? (
            <span className="pause-icon">▶</span>
          ) : (
            <span className="pause-icon">⏸</span>
          )}
        </button>
      </div>
      
      {/* Game Area */}
      <div className="game-area">
        {feedbackMessage && (
          <div className={`feedback-message ${currentQuestion?.isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`}>
            {feedbackMessage}
          </div>
        )}
        
        {gameStatus === 'idle' ? (
          <div className="race-panel">
            <div className="question-panel">
              <div className="question-text">{t('math_race')}</div>
              <button onClick={startGame} className="start-button">
                {t('start_game')}
              </button>
            </div>
            
            <div className="race-track">
              <div className="race-progress" style={{ width: `${progress}%` }}></div>
              <div className="race-car" style={{ left: `${progress}%` }}>🏎️</div>
              <div className="race-finish-line"></div>
            </div>
          </div>
        ) : gameStatus === 'playing' ? (
          <div className="race-panel">
            <div className="question-panel">
              <div className="question-text">{currentQuestion?.expression} = ?</div>
              <form onSubmit={handleSubmit} className="answer-form">
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={handleInputChange}
                  placeholder={t('enter_answer')}
                  className="answer-input"
                  autoComplete="off"
                  disabled={gameStatus !== 'playing'}
                />
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={gameStatus !== 'playing'}
                >
                  {t('submit')}
                </button>
              </form>
            </div>
            
            <div className="race-track">
              <div className="race-progress" style={{ width: `${progress}%` }}></div>
              <div className="race-car" style={{ left: `${progress}%` }}>🏎️</div>
              <div className="race-finish-line"></div>
            </div>
          </div>
        ) : gameStatus === 'paused' ? (
          <div className="pause-panel">
            <h2>{t('game_paused')}</h2>
            <p>{t('resume_to_continue')}</p>
            <button onClick={pauseGame} className="resume-button">
              {t('resume')}
            </button>
          </div>
        ) : null}
        
        {/* Game Timer */}
        {gameStatus === 'playing' && (
          <div className="timer-bar">
            <div 
              className={`timer-progress ${timeRemaining < 10 ? 'timer-critical' : ''}`}
              style={{ width: `${timePercentage}%` }}
            ></div>
          </div>
        )}
      </div>
      
      {/* Control Buttons */}
      <div className="control-buttons">
        {onExit && (
          <button onClick={onExit} className="exit-button">
            {t('exit')}
          </button>
        )}
      </div>
      
      {/* Game Over Overlay */}
      {gameStatus === 'gameover' && (
        <div className="game-over-overlay">
          <div className="game-over-content">
            <h2>{t('game_complete')}!</h2>
            <p>{t('math_race_complete_message')}</p>
            <div className="results-grid">
              <div className="result-item">
                <div className="result-label">{t('score')}</div>
                <div className="result-value">{score}</div>
              </div>
              <div className="result-item">
                <div className="result-label">{t('correct_answers')}</div>
                <div className="result-value">{correctAnswers}</div>
              </div>
              <div className="result-item">
                <div className="result-label">{t('accuracy')}</div>
                <div className="result-value">{accuracy}%</div>
              </div>
            </div>
            
            <div className="game-over-buttons">
              <button onClick={initializeGame} className="play-again-button">
                {t('play_again')}
              </button>
              {onExit && (
                <button onClick={onExit} className="exit-button">
                  {t('exit')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MathRace; 