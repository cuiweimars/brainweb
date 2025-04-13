import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import "./AlgebraQuest.css";
import { generateProblem, checkAnswer, AlgebraProblem } from "./AlgebraEngine";
import { playCorrectSound, playIncorrectSound, playHintSound } from "./SoundManager";

interface AlgebraQuestProps {
  difficulty?: "easy" | "medium" | "hard";
  onGameComplete?: (score: number) => void;
  onExit?: () => void;
}

const AlgebraQuest: React.FC<AlgebraQuestProps> = ({ 
  difficulty = "medium", 
  onGameComplete, 
  onExit 
}) => {
  const { t } = useTranslation();
  
  // Game states
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'feedback' | 'complete'>('intro');
  const [problem, setProblem] = useState<AlgebraProblem | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [problemCount, setProblemCount] = useState(0);
  const [maxProblems] = useState(10); // 10 problems per game
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds per problem
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [hintIndex, setHintIndex] = useState(-1);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate a new problem
  const generateNewProblem = () => {
    const newProblem = generateProblem(difficulty);
    setProblem(newProblem);
    setUserAnswer("");
    setIsCorrect(null);
    setHintIndex(-1);
    
    // Reset timer based on difficulty
    let timeForProblem = 60;
    if (difficulty === "easy") timeForProblem = 90;
    if (difficulty === "hard") timeForProblem = 45;
    setTimeLeft(timeForProblem);
    
    // Focus input field
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 100);
  };

  // Start the game
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setProblemCount(0);
    generateNewProblem();
  };

  // Handle answer submission
  const submitAnswer = () => {
    if (!problem) return;
    
    const correct = checkAnswer(problem, userAnswer);
    setIsCorrect(correct);
    
    if (correct) {
      if (soundEnabled) playCorrectSound();
      
      // Calculate score based on time left and difficulty
      let pointsBase = 10;
      if (difficulty === "medium") pointsBase = 15;
      if (difficulty === "hard") pointsBase = 20;
      
      // Add bonus for quick answers
      const timeBonus = Math.floor(timeLeft / 5);
      // Penalty for using hints
      const hintPenalty = hintIndex >= 0 ? (hintIndex + 1) * 2 : 0;
      
      const pointsEarned = Math.max(pointsBase + timeBonus - hintPenalty, 5);
      setScore(prevScore => prevScore + pointsEarned);
    } else {
      if (soundEnabled) playIncorrectSound();
    }
    
    // Stop the timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setGameState('feedback');
  };

  // Handle showing hints
  const showHint = () => {
    if (!problem || !problem.hints || hintIndex >= problem.hints.length - 1) return;
    
    setHintIndex(prevIndex => prevIndex + 1);
    if (soundEnabled) playHintSound();
  };

  // Continue to next problem
  const nextProblem = () => {
    const newProblemCount = problemCount + 1;
    setProblemCount(newProblemCount);
    
    if (newProblemCount >= maxProblems) {
      // Game complete
      setGameState('complete');
      if (onGameComplete) onGameComplete(score);
    } else {
      // Next problem
      setGameState('playing');
      generateNewProblem();
    }
  };

  // Timer effect
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            // Time's up
            if (timerRef.current) clearInterval(timerRef.current);
            setIsCorrect(false);
            setGameState('feedback');
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, timeLeft]);

  // Render different game states
  const renderIntro = () => (
    <div className="game-intro">
      <div className="game-instructions">
        <h2>{t("Welcome to Algebra Quest!")}</h2>
        <p>{t("Solve algebra problems and earn points. You'll face 10 problems of increasing difficulty.")}</p>
        <p>{t("You can use hints, but they'll reduce your score. Answer quickly for bonus points!")}</p>
        <p><strong>{t("Difficulty:")}</strong> {t(difficulty)}</p>
      </div>
      <div className="button-container">
        <button className="start-button" onClick={startGame}>
          {t("Start Game")}
        </button>
        <button className="exit-button" onClick={onExit}>
          {t("Exit")}
        </button>
      </div>
    </div>
  );

  const renderPlaying = () => (
    <div className="game-playing">
      <div className="game-header">
        <div className="score-display">{t("Score")}: {score}</div>
        <div className="problem-counter">
          {t("Problem")}: {problemCount + 1}/{maxProblems}
        </div>
        <div className="timer-display">{t("Time")}: {timeLeft}s</div>
      </div>
      <div className="problem-display">
        <h3>{t("Solve the problem:")}</h3>
        <div className="problem-text">{problem?.question}</div>
        <form 
          className="answer-form" 
          onSubmit={(e) => {
            e.preventDefault();
            submitAnswer();
          }}
        >
          <div className="input-group">
            <label htmlFor="answer">{t("Your Answer:")}</label>
            <input
              ref={inputRef}
              id="answer"
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder={t("Enter your answer...")}
              autoComplete="off"
            />
          </div>
          <div className="button-group">
            <button 
              type="button" 
              className="hint-button" 
              onClick={showHint}
              disabled={!problem?.hints || hintIndex >= (problem?.hints?.length - 1)}
            >
              {t("Use Hint")} {hintIndex >= 0 ? `(${hintIndex + 1}/${problem?.hints?.length})` : ""}
            </button>
            <button type="submit" className="submit-button">
              {t("Submit Answer")}
            </button>
          </div>
        </form>
        {hintIndex >= 0 && problem?.hints && (
          <div className="hint-display">
            <strong>{t("Hint")}:</strong> {problem?.hints[hintIndex]}
          </div>
        )}
      </div>
      <div className="sound-toggle">
        <label>
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={() => setSoundEnabled(!soundEnabled)}
          />
          {t("Sound")}
        </label>
      </div>
    </div>
  );

  const renderFeedback = () => (
    <div className="game-feedback">
      <h2>
        {isCorrect 
          ? t("Correct!") 
          : t("Incorrect!")}
      </h2>
      <div className="correct-answer">
        <p>{t("The correct answer is:")}</p>
        <p className="answer-text">{problem?.answer}</p>
      </div>
      <button className="next-button" onClick={nextProblem}>
        {problemCount >= maxProblems - 1 
          ? t("See Final Score") 
          : t("Next Problem")}
      </button>
    </div>
  );

  const renderComplete = () => (
    <div className="game-complete">
      <h2>{t("Game Complete!")}</h2>
      <div className="final-score">
        <p>{t("Your Final Score:")}</p>
        <p className="score-value">{score}</p>
      </div>
      <p>{t("You completed")} {maxProblems} {t("algebra problems.")}</p>
      <div className="button-container">
        <button className="start-button" onClick={startGame}>
          {t("Play Again")}
        </button>
        <button className="exit-button" onClick={onExit}>
          {t("Exit")}
        </button>
      </div>
    </div>
  );

  return (
    <div className="algebra-quest">
      <h1>{t("Algebra Quest")}</h1>
      {gameState === 'intro' && renderIntro()}
      {gameState === 'playing' && renderPlaying()}
      {gameState === 'feedback' && renderFeedback()}
      {gameState === 'complete' && renderComplete()}
    </div>
  );
};

export default AlgebraQuest;
