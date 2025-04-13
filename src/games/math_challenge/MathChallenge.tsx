import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import './MathChallenge.css';

// 定义难度级别配置
const difficultyLevels = {
  easy: {
    operations: ['+', '-'],
    maxNumber: 10,
    questionsCount: 10,
    timeLimit: 60 // 秒
  },
  medium: {
    operations: ['+', '-', '*'],
    maxNumber: 20,
    questionsCount: 15,
    timeLimit: 90 // 秒
  },
  hard: {
    operations: ['+', '-', '*', '/'],
    maxNumber: 30,
    questionsCount: 20,
    timeLimit: 120 // 秒
  }
};

// 问题接口
interface Question {
  id: number;
  text: string;
  answer: number;
  options: number[];
  userAnswer: number | null;
}

// 组件Props接口
interface MathChallengeProps {
  difficulty?: 'easy' | 'medium' | 'hard';
  onGameComplete?: (score: number, correctAnswers: number, time: number) => void;
  onExit?: () => void;
}

const MathChallenge: React.FC<MathChallengeProps> = ({ 
  difficulty = 'medium',
  onGameComplete,
  onExit 
}) => {
  const { t } = useTranslation();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'paused' | 'gameover'>('idle');
  const [gameLevel, setGameLevel] = useState<'easy' | 'medium' | 'hard'>(difficulty);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [buttonFeedback, setButtonFeedback] = useState<{index: number, type: 'success' | 'error'} | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // 创建算术问题
  const generateQuestion = useCallback((id: number): Question => {
    const level = difficultyLevels[gameLevel];
    // 随机选择运算符
    let operation = level.operations[Math.floor(Math.random() * level.operations.length)];
    
    let num1: number, num2: number, answer: number;
    
    // 根据运算类型生成数字
    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * level.maxNumber) + 1;
        num2 = Math.floor(Math.random() * level.maxNumber) + 1;
        answer = num1 + num2;
        break;
      case '-':
        num1 = Math.floor(Math.random() * level.maxNumber) + 1;
        num2 = Math.floor(Math.random() * num1) + 1; // 确保结果为正数
        answer = num1 - num2;
        break;
      case '*':
        num1 = Math.floor(Math.random() * Math.sqrt(level.maxNumber)) + 1;
        num2 = Math.floor(Math.random() * Math.sqrt(level.maxNumber)) + 1;
        answer = num1 * num2;
        break;
      case '/':
        num2 = Math.floor(Math.random() * Math.sqrt(level.maxNumber)) + 1;
        answer = Math.floor(Math.random() * Math.sqrt(level.maxNumber)) + 1;
        num1 = num2 * answer; // 确保结果为整数
        break;
      default:
        num1 = Math.floor(Math.random() * level.maxNumber) + 1;
        num2 = Math.floor(Math.random() * level.maxNumber) + 1;
        answer = num1 + num2;
        operation = '+';
    }
    
    // 生成问题文本
    const questionText = `${num1} ${operation} ${num2} = ?`;
    
    // 生成选项（包括正确答案和干扰选项）
    const options = [answer];
    
    // 添加3个干扰选项
    while (options.length < 4) {
      // 生成一个在答案附近的随机数
      let randomOffset = Math.floor(Math.random() * 10) - 5;
      let option = answer + randomOffset;
      
      // 确保选项是正数且不重复
      if (option > 0 && !options.includes(option)) {
        options.push(option);
      }
    }
    
    // 打乱选项顺序
    const shuffledOptions = options.sort(() => Math.random() - 0.5);
    
    return {
      id,
      text: questionText,
      answer,
      options: shuffledOptions,
      userAnswer: null
    };
  }, [gameLevel]);

  // 初始化游戏
  const initializeGame = useCallback(() => {
    const level = difficultyLevels[gameLevel];
    const newQuestions = Array.from({ length: level.questionsCount }, (_, i) => 
      generateQuestion(i + 1)
    );
    
    setQuestions(newQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setCorrectAnswers(0);
    setTimeRemaining(level.timeLimit);
    setGameStatus('idle');
    setFeedbackMessage('');
    setButtonFeedback(null);
  }, [gameLevel, generateQuestion]);

  // 游戏初始化
  useEffect(() => {
    initializeGame();
    // 不再自动开始游戏，让用户选择难度并点击开始按钮
  }, [initializeGame, gameLevel]);

  // 计时器
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    
    if (gameStatus === 'playing' && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            if (timer) clearInterval(timer);
            handleGameComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameStatus, timeRemaining]);

  // 答题处理
  const handleAnswer = (selectedAnswer: number, optionIndex: number) => {
    if (gameStatus !== 'playing') return;
    
    // 播放按钮音效
    playSound('button');
    
    // 更新当前问题的用户答案
    const updatedQuestions = [...questions];
    const currentQuestion = updatedQuestions[currentQuestionIndex];
    currentQuestion.userAnswer = selectedAnswer;
    setQuestions(updatedQuestions);
    
    // 检查答案
    const isCorrect = selectedAnswer === currentQuestion.answer;
    
    // 显示反馈
    setButtonFeedback({ 
      index: optionIndex, 
      type: isCorrect ? 'success' : 'error' 
    });
    
    if (isCorrect) {
      // 播放成功音效
      playSound('success');
      
      setScore(prev => prev + 10);
      setCorrectAnswers(prev => prev + 1);
      setFeedbackMessage(t('correct', 'Correct!'));
    } else {
      // 播放错误音效
      playSound('error');
      setFeedbackMessage(t('incorrect', 'Incorrect!'));
    }
    
    // 延迟移动到下一题
    setTimeout(() => {
      setButtonFeedback(null);
      
      // 移动到下一题或结束游戏
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        handleGameComplete();
      }
    }, 1000);
  };
  
  // 游戏完成处理
  const handleGameComplete = () => {
    setGameStatus('gameover');
    
    // 调用完成回调
    if (onGameComplete) {
      onGameComplete(score, correctAnswers, difficultyLevels[gameLevel].timeLimit - timeRemaining);
    }
  };
  
  // 开始游戏
  const startGame = () => {
    setGameStatus('playing');
    if (timeRemaining === 0) {
      initializeGame();
    }
  };
  
  // 暂停游戏
  const pauseGame = () => {
    if (gameStatus === 'playing') {
      setGameStatus('paused');
    } else if (gameStatus === 'paused') {
      setGameStatus('playing');
    }
  };
  
  // 格式化时间为MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // 计算时间进度百分比
  const timePercentage = (timeRemaining / difficultyLevels[gameLevel].timeLimit) * 100;

  // 简单的音效功能
  const playSound = (type: string) => {
    if (!soundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      gainNode.gain.value = 0.1;
      
      switch(type) {
        case 'button':
          oscillator.type = 'sine';
          oscillator.frequency.value = 440;
          oscillator.start();
          setTimeout(() => {
            oscillator.stop();
            audioContext.close();
          }, 150);
          break;
        case 'success':
          oscillator.type = 'sine';
          oscillator.frequency.value = 600;
          oscillator.start();
          setTimeout(() => {
            oscillator.frequency.value = 800;
            setTimeout(() => {
              oscillator.stop();
              audioContext.close();
            }, 200);
          }, 200);
          break;
        case 'error':
          oscillator.type = 'sine';
          oscillator.frequency.value = 250;
          oscillator.start();
          setTimeout(() => {
            oscillator.frequency.value = 200;
            setTimeout(() => {
              oscillator.stop();
              audioContext.close();
            }, 300);
          }, 200);
          break;
        default:
          break;
      }
    } catch (e) {
      console.log('Audio not supported');
    }
  };
  
  // 切换声音设置
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  // 当前问题
  const currentQuestion = questions[currentQuestionIndex];

  // 如果游戏刚加载且问题还没准备好
  if (questions.length === 0) {
    return (
      <div className="math-challenge-loading">
        <h3>{t('math_challenge')}</h3>
        <p>{t('loading')}</p>
        <div className="loading-spinner"></div>
        {onExit && (
          <button onClick={onExit} className="exit-button">
            {t('exit_game')}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="math-challenge-container">
      {/* 顶部状态栏 - 中间 */}
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
            <div className="stat-label">{t('question')}</div>
            <div className="stat-value">{currentQuestionIndex + 1}/{questions.length}</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-label">{t('correct')}</div>
            <div className="stat-value">{correctAnswers}</div>
          </div>
        </div>
      </div>
      
      {/* 难度选择 - 左上角 */}
      <div className="difficulty-container">
        <button
          onClick={() => setGameLevel('easy')}
          className={`difficulty-button ${gameLevel === 'easy' ? 'difficulty-active easy' : ''}`}
        >
          {t('easy')}
        </button>
        <button
          onClick={() => setGameLevel('medium')}
          className={`difficulty-button ${gameLevel === 'medium' ? 'difficulty-active medium' : ''}`}
        >
          {t('medium')}
        </button>
        <button
          onClick={() => setGameLevel('hard')}
          className={`difficulty-button ${gameLevel === 'hard' ? 'difficulty-active hard' : ''}`}
        >
          {t('hard')}
        </button>
      </div>
      
      {/* 声音控制 - 右上角 */}
      <div className="sound-control">
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="sound-button"
        >
          {soundEnabled ? (
            <span className="sound-icon">🔊</span>
          ) : (
            <span className="sound-icon">🔇</span>
          )}
        </button>
      </div>
      
      {/* 暂停按钮 - 右上角声音按钮旁边 */}
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
      
      {/* 游戏区域 - 中央 */}
      <div className="game-area">
        {feedbackMessage && (
          <div className="feedback-message">{feedbackMessage}</div>
        )}
        
        {/* 游戏开始状态 */}
        {gameStatus === 'idle' ? (
          null
        ) : gameStatus === 'playing' ? (
          <div className="question-panel">
            <div className="question-text">{currentQuestion.text}</div>
            <div className="options-grid">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option, index)}
                  className={`option-button ${buttonFeedback?.index === index ? buttonFeedback.type : ''}`}
                >
                  {option}
                </button>
              ))}
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
        
        {/* 时间进度条 */}
        {gameStatus === 'playing' && (
          <div className="timer-bar">
            <div 
              className={`timer-progress ${timeRemaining < 10 ? 'timer-critical' : ''}`}
              style={{ width: `${timePercentage}%` }}
            ></div>
          </div>
        )}
      </div>
      
      {/* 底部按钮 - 中央 */}
      <div className="control-buttons">
        <button onClick={() => {
          if (gameStatus === 'gameover') {
            initializeGame();
          }
          startGame();
        }} className="start-button">
          {t('start_game')}
        </button>
        {onExit && (
          <button onClick={onExit} className="exit-button">
            {t('exit')}
          </button>
        )}
      </div>
      
      {/* 游戏结束弹窗 */}
      {gameStatus === 'gameover' && (
        <div className="game-over-overlay">
          <div className="game-over-content">
            <h2>{t('game_complete')}!</h2>
            <p>{t('math_challenge_complete_message')}</p>
            <div className="results-grid">
              <div className="result-item">
                <div className="result-label">{t('score')}</div>
                <div className="result-value">{score}</div>
              </div>
              <div className="result-item">
                <div className="result-label">{t('correct_answers')}</div>
                <div className="result-value">{correctAnswers}/{questions.length}</div>
              </div>
              <div className="result-item">
                <div className="result-label">{t('time_used')}</div>
                <div className="result-value">{formatTime(difficultyLevels[gameLevel].timeLimit - timeRemaining)}</div>
              </div>
            </div>
            
            <div className="game-over-buttons">
              <button onClick={() => {
                initializeGame();
                startGame();
              }} className="play-again-button">
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

export default MathChallenge;