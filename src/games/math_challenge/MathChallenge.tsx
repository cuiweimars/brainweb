import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

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
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [gameLevel, setGameLevel] = useState<'easy' | 'medium' | 'hard'>(difficulty);

  // 创建算术问题
  const generateQuestion = useCallback((id: number): Question => {
    const level = difficultyLevels[gameLevel];
    // 随机选择运算符
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
    setIsGameComplete(false);
    setIsGameStarted(false);
  }, [gameLevel, generateQuestion]);

  // 游戏初始化
  useEffect(() => {
    initializeGame();
  }, [initializeGame, gameLevel]);

  // 计时器
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    
    if (isGameStarted && !isGameComplete && timeRemaining > 0) {
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
  }, [isGameStarted, isGameComplete, timeRemaining]);

  // 答题处理
  const handleAnswer = (selectedAnswer: number) => {
    if (!isGameStarted) {
      setIsGameStarted(true);
    }
    
    // 更新当前问题的用户答案
    const updatedQuestions = [...questions];
    const currentQuestion = updatedQuestions[currentQuestionIndex];
    currentQuestion.userAnswer = selectedAnswer;
    setQuestions(updatedQuestions);
    
    // 检查答案
    const isCorrect = selectedAnswer === currentQuestion.answer;
    
    if (isCorrect) {
      setScore(prev => prev + 10);
      setCorrectAnswers(prev => prev + 1);
    }
    
    // 移动到下一题或结束游戏
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleGameComplete();
    }
  };
  
  // 游戏完成处理
  const handleGameComplete = () => {
    setIsGameComplete(true);
    
    // 调用完成回调
    if (onGameComplete) {
      onGameComplete(score, correctAnswers, difficultyLevels[gameLevel].timeLimit - timeRemaining);
    }
  };
  
  // 格式化时间为MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 当前问题
  const currentQuestion = questions[currentQuestionIndex];

  // 如果游戏刚加载且问题还没准备好
  if (questions.length === 0) {
    return (
      <div className="text-center p-4">
        <h3 className="text-white text-lg font-bold mb-2">{t('math_challenge')}</h3>
        <p className="text-gray-300 mb-4">{t('loading')}</p>
        <div className="mb-6 flex justify-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent" />
        </div>
        {onExit && (
          <button 
            onClick={onExit}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            {t('exit_game')}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto p-4">
      {/* 游戏控制栏 */}
      <div className="w-full flex justify-between items-center mb-4">
        <div className="flex space-x-4">
          <div className="bg-blue-100 dark:bg-blue-900 py-1 px-3 rounded-md">
            <span className="font-medium text-blue-800 dark:text-blue-200">
              {t('time')}: {formatTime(timeRemaining)}
            </span>
          </div>
          <div className="bg-green-100 dark:bg-green-900 py-1 px-3 rounded-md">
            <span className="font-medium text-green-800 dark:text-green-200">
              {t('score')}: {score}
            </span>
          </div>
          <div className="bg-purple-100 dark:bg-purple-900 py-1 px-3 rounded-md">
            <span className="font-medium text-purple-800 dark:text-purple-200">
              {t('question')}: {currentQuestionIndex + 1}/{questions.length}
            </span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={initializeGame}
            className="bg-purple-600 hover:bg-purple-700 text-white py-1 px-3 rounded-md text-sm transition-colors"
          >
            {t('restart')}
          </button>
          {onExit && (
            <button
              onClick={onExit}
              className="bg-gray-600 hover:bg-gray-700 text-white py-1 px-3 rounded-md text-sm transition-colors"
            >
              {t('exit_game')}
            </button>
          )}
        </div>
      </div>
      
      {/* 难度选择器 */}
      <div className="mb-4 flex space-x-2">
        <button
          onClick={() => setGameLevel('easy')}
          className={`px-3 py-1 rounded-md text-sm ${
            gameLevel === 'easy'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {t('easy')}
        </button>
        <button
          onClick={() => setGameLevel('medium')}
          className={`px-3 py-1 rounded-md text-sm ${
            gameLevel === 'medium'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {t('medium')}
        </button>
        <button
          onClick={() => setGameLevel('hard')}
          className={`px-3 py-1 rounded-md text-sm ${
            gameLevel === 'hard'
              ? 'bg-red-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {t('hard')}
        </button>
      </div>
      
      {/* 游戏开始状态 */}
      {!isGameStarted ? (
        <div className="mt-8 text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md w-full">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {t('math_challenge')}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            {t('math_challenge_description')}
          </p>
          <div className="mb-4 text-sm text-gray-700 dark:text-gray-300">
            <p className="font-semibold mb-2">{t('difficulty')}: {t(gameLevel)}</p>
            <ul className="list-disc list-inside space-y-1">
              <li>{t('questions')}: {difficultyLevels[gameLevel].questionsCount}</li>
              <li>{t('time_limit')}: {formatTime(difficultyLevels[gameLevel].timeLimit)}</li>
              <li>{t('operations')}: {difficultyLevels[gameLevel].operations.join(', ')}</li>
              <li>{t('max_number')}: {difficultyLevels[gameLevel].maxNumber}</li>
            </ul>
          </div>
          <button
            onClick={() => setIsGameStarted(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg shadow transition-colors"
          >
            {t('start_game')}
          </button>
        </div>
      ) : (
        /* 问题区域 */
        <div className="w-full">
          {!isGameComplete && currentQuestion && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 w-full">
              <div className="mb-6 text-center">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentQuestion.text}
                </h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    className="py-3 px-4 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900 dark:hover:bg-purple-800 rounded-lg text-xl font-semibold text-purple-800 dark:text-purple-200 transition-colors"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* 游戏完成覆盖 */}
      {isGameComplete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full text-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {t('game_complete')}!
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('math_challenge_complete_message')}
            </p>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-green-100 dark:bg-green-900 py-2 px-3 rounded-md">
                <div className="text-xs text-green-800 dark:text-green-200">
                  {t('score')}
                </div>
                <div className="font-bold text-green-800 dark:text-green-200">
                  {score}
                </div>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 py-2 px-3 rounded-md">
                <div className="text-xs text-blue-800 dark:text-blue-200">
                  {t('correct_answers')}
                </div>
                <div className="font-bold text-blue-800 dark:text-blue-200">
                  {correctAnswers}/{questions.length}
                </div>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900 py-2 px-3 rounded-md">
                <div className="text-xs text-purple-800 dark:text-purple-200">
                  {t('time_used')}
                </div>
                <div className="font-bold text-purple-800 dark:text-purple-200">
                  {formatTime(difficultyLevels[gameLevel].timeLimit - timeRemaining)}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2 justify-center">
              <button
                onClick={initializeGame}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
              >
                {t('play_again')}
              </button>
              {onExit && (
                <button
                  onClick={onExit}
                  className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md transition-colors"
                >
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