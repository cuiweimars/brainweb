import React, { useState, useEffect, useRef, useCallback } from "react";
import "./NumberNinja.css";
import MathProblemGenerator from "./MathProblemGenerator";
import SoundManager from "./SoundManager";

interface NumberNinjaProps {
  difficulty?: "easy" | "medium" | "hard";
  onGameComplete?: (score: number, level: number, totalSolved: number) => void;
  onExit?: () => void;
}

const NumberNinja: React.FC<NumberNinjaProps> = ({
  difficulty = "medium",
  onGameComplete,
  onExit
}) => {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [totalSolved, setTotalSolved] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds per level
  const [isGameActive, setIsGameActive] = useState(true);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [problemGenerator] = useState(new MathProblemGenerator());
  const [currentProblem, setCurrentProblem] = useState(problemGenerator.generateProblem(difficulty));
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const timerRef = useRef<number | null>(null);
  
  // Generate a new problem
  const generateNewProblem = useCallback(() => {
    setCurrentProblem(problemGenerator.generateProblem(difficulty));
    setSelectedAnswer(null);
    setIsAnswerCorrect(null);
  }, [problemGenerator, difficulty]);
  
  // Initialize or reset the game
  const initGame = useCallback(() => {
    setScore(0);
    setLevel(1);
    setTotalSolved(0);
    setStreak(0);
    setTimeLeft(60);
    setIsGameActive(true);
    generateNewProblem();
  }, [generateNewProblem]);
  
  // Start timer
  useEffect(() => {
    if (isGameActive) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Time's up!
            clearInterval(timerRef.current!);
            setIsGameActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, [isGameActive, level]);
  
  // Handle level up animation
  useEffect(() => {
    if (showLevelUp) {
      const timer = setTimeout(() => {
        setShowLevelUp(false);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [showLevelUp]);
  
  // Handle game over
  useEffect(() => {
    if (!isGameActive && onGameComplete) {
      onGameComplete(score, level, totalSolved);
    }
  }, [isGameActive, onGameComplete, score, level, totalSolved]);
  
  // Handle answer selection
  const handleAnswer = (selectedOption: number) => {
    if (!isGameActive || selectedAnswer !== null) return;
    
    setSelectedAnswer(selectedOption);
    const correct = selectedOption === currentProblem.answer;
    setIsAnswerCorrect(correct);
    
    if (correct) {
      // Correct answer
      SoundManager.playSound("correct");
      
      // Calculate points based on time left and streak
      const timeBonus = Math.floor(timeLeft / 3);
      const streakBonus = Math.floor(streak * 2);
      const pointsEarned = 10 + timeBonus + streakBonus;
      
      setScore(prevScore => prevScore + pointsEarned);
      setTotalSolved(prev => prev + 1);
      setStreak(prev => prev + 1);
      
      // Level up after every 5 correct answers based on the current level
      if ((totalSolved + 1) % (5 * level) === 0) {
        setLevel(prev => {
          const newLevel = prev + 1;
          
          // Reset timer with bonus time for the new level
          setTimeLeft(60 + (newLevel * 5));
          
          // Show level up animation
          setShowLevelUp(true);
          SoundManager.playSound("success");
          
          return newLevel;
        });
      }
      
      // Schedule new problem after a short delay
      setTimeout(() => {
        generateNewProblem();
      }, 1000);
    } else {
      // Wrong answer
      SoundManager.playSound("wrong");
      setStreak(0);
      
      // Schedule new problem after a short delay
      setTimeout(() => {
        generateNewProblem();
      }, 1000);
    }
  };
  
  // Calculate timer bar percentage
  const timerPercentage = (timeLeft / (60 + (level * 5))) * 100;
  
  // Handle restart game
  const handleRestartGame = () => {
    initGame();
  };
  
  // Handle complete game
  const handleCompleteGame = () => {
    if (onGameComplete) {
      onGameComplete(score, level, totalSolved);
    }
    setIsGameActive(false);
  };
  
  return (
    <div className="number-ninja-container">
      <div className="number-ninja-header">
        <h1>Number Ninja</h1>
        <button 
          onClick={onExit} 
          style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
        >
          ×
        </button>
      </div>
      
      <div className="timer-bar">
        <div 
          className={`timer-progress ${timerPercentage < 30 ? 'danger' : timerPercentage < 60 ? 'warning' : ''}`}
          style={{ width: `${timerPercentage}%` }}
        ></div>
      </div>
      
      <div className="game-info">
        <div className="game-info-item">
          <span className="game-info-label">Score</span>
          <span className="game-info-value">{score}</span>
        </div>
        <div className="game-info-item">
          <span className="game-info-label">Level</span>
          <span className="game-info-value">{level}</span>
        </div>
        <div className="game-info-item">
          <span className="game-info-label">Solved</span>
          <span className="game-info-value">{totalSolved}</span>
        </div>
        <div className="game-info-item">
          <span className="game-info-label">Time</span>
          <span className="game-info-value">{timeLeft}s</span>
        </div>
      </div>
      
      <div className="streak-indicator">
        {[...Array(5)].map((_, index) => (
          <div 
            key={index} 
            className={`streak-dot ${index < streak ? 'active' : ''}`}
          ></div>
        ))}
      </div>
      
      <div className="game-area">
        <div className="problem">
          <h2>{currentProblem.question}</h2>
        </div>
        <div className="options">
          {currentProblem.options.map((option, index) => (
            <button 
              key={index} 
              onClick={() => handleAnswer(option)}
              className={
                selectedAnswer === option 
                  ? isAnswerCorrect 
                    ? 'correct' 
                    : 'wrong' 
                  : ''
              }
              disabled={selectedAnswer !== null}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      
      {!isGameActive && (
        <div className="game-controls">
          <button onClick={handleRestartGame}>Play Again</button>
          <button onClick={onExit}>Exit</button>
        </div>
      )}
      
      {showLevelUp && (
        <div className="level-up-animation">
          <div className="level-up-text">Level Up!</div>
        </div>
      )}
    </div>
  );
};

export default NumberNinja;