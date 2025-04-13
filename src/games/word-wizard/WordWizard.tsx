import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
// @ts-ignore
import confetti from 'canvas-confetti';
import './WordWizard.css';

// 难度设置
const DIFFICULTY_SETTINGS = {
  easy: {
    timeLimit: 60, // 秒
    wordLength: { min: 3, max: 5 },
    hintsAllowed: 3,
    roundsToWin: 5,
    timePerRound: 60,
    pointsPerWord: 10,
    timeBonusPerSecond: 0.5
  },
  medium: {
    timeLimit: 60,
    wordLength: { min: 4, max: 7 },
    hintsAllowed: 2,
    roundsToWin: 7,
    timePerRound: 45,
    pointsPerWord: 15,
    timeBonusPerSecond: 0.7
  },
  hard: {
    timeLimit: 60,
    wordLength: { min: 5, max: 9 },
    hintsAllowed: 1,
    roundsToWin: 10,
    timePerRound: 30,
    pointsPerWord: 20,
    timeBonusPerSecond: 1.0
  }
};

// 游戏单词库（真实游戏中应有更多单词）
const WORD_DATABASE = {
  easy: [
    { word: "CAT", definition: "A small domesticated carnivorous mammal" },
    { word: "DOG", definition: "A domesticated carnivorous mammal" },
    { word: "SUN", definition: "The star around which the earth orbits" },
    { word: "MOON", definition: "The natural satellite of the earth" },
    { word: "STAR", definition: "A luminous ball of gas in space" },
    { word: "BOOK", definition: "A written or printed work consisting of pages" },
    { word: "HOME", definition: "The place where one lives" },
    { word: "FISH", definition: "A limbless cold-blooded vertebrate animal" },
    { word: "BIRD", definition: "A warm-blooded egg-laying vertebrate animal" },
    { word: "CAKE", definition: "A sweet baked food made from flour and sugar" }
  ],
  medium: [
    { word: "PLANET", definition: "A celestial body moving in an elliptical orbit around a star" },
    { word: "GARDEN", definition: "A piece of ground used to grow plants" },
    { word: "AIRPORT", definition: "A complex of runways and buildings for aircraft" },
    { word: "BICYCLE", definition: "A vehicle with two wheels" },
    { word: "LIBRARY", definition: "A building containing books for reading or borrowing" },
    { word: "COMPUTER", definition: "An electronic device for storing and processing data" },
    { word: "MOUNTAIN", definition: "A large natural elevation of the earth's surface" },
    { word: "KITCHEN", definition: "A room where food is prepared and cooked" },
    { word: "BASEBALL", definition: "A ball game played with a bat and ball" },
    { word: "STUDENT", definition: "A person who is studying at a school or college" }
  ],
  hard: [
    { word: "ALGORITHM", definition: "A process or set of rules to be followed in calculations" },
    { word: "DEMOCRACY", definition: "A system of government by the whole population" },
    { word: "PHILOSOPHY", definition: "The study of the fundamental nature of knowledge" },
    { word: "TELESCOPE", definition: "An optical instrument for making distant objects appear nearer" },
    { word: "VOCABULARY", definition: "The body of words used in a particular language" },
    { word: "MYSTERIOUS", definition: "Difficult or impossible to understand, explain, or identify" },
    { word: "CHEMISTRY", definition: "The scientific study of the properties of substances" },
    { word: "EQUATION", definition: "A statement that the values of two mathematical expressions are equal" },
    { word: "TECHNOLOGY", definition: "The application of scientific knowledge for practical purposes" },
    { word: "PSYCHOLOGY", definition: "The scientific study of the human mind and behavior" }
  ]
};

// 音效
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
  },
  levelUp: () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      gainNode.gain.value = 0.1;
      
      oscillator.frequency.value = 400;
      oscillator.start();
      
      setTimeout(() => {
        oscillator.frequency.value = 500;
        setTimeout(() => {
          oscillator.frequency.value = 600;
          setTimeout(() => {
            oscillator.frequency.value = 800;
            setTimeout(() => {
              oscillator.stop();
              audioContext.close();
            }, 150);
          }, 150);
        }, 150);
      }, 150);
    } catch (e) {
      console.log('Audio not supported');
    }
  },
  hint: () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.value = 350;
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      gainNode.gain.value = 0.1;
      oscillator.start();
      
      setTimeout(() => {
        oscillator.frequency.value = 450;
        setTimeout(() => {
          oscillator.stop();
          audioContext.close();
        }, 150);
      }, 150);
    } catch (e) {
      console.log('Audio not supported');
    }
  }
};

interface WordWizardProps {
  difficulty?: 'easy' | 'medium' | 'hard';
  onGameComplete?: (score: number, wordsCompleted: number, totalTime: number) => void;
  onExit?: () => void;
}

const WordWizard: React.FC<WordWizardProps> = ({
  difficulty = 'medium',
  onGameComplete,
  onExit
}) => {
  const { t } = useTranslation();
  
  // 游戏状态
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'paused' | 'gameover'>('idle');
  const [settings, setSettings] = useState(DIFFICULTY_SETTINGS[difficulty]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [hintsRemaining, setHintsRemaining] = useState(settings.hintsAllowed);
  const [timeRemaining, setTimeRemaining] = useState(settings.timePerRound);
  const [currentWord, setCurrentWord] = useState<{ word: string; definition: string } | null>(null);
  const [scrambledLetters, setScrambledLetters] = useState<string[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<{ index: number; letter: string }[]>([]);
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set<string>());
  const [hintUsed, setHintUsed] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [gameStartTime, setGameStartTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [wordsCompleted, setWordsCompleted] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // 清除所有计时器
  const clearAllTimers = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
  }, []);
  
  // 播放音效
  const playSound = useCallback((sound: 'buttonPress' | 'success' | 'error' | 'levelUp' | 'hint') => {
    if (soundEnabled) {
      soundEffects[sound]();
    }
  }, [soundEnabled]);
  
  // 洗牌算法
  const shuffle = useCallback((array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);
  
  // 获取一个随机单词
  const getRandomWord = useCallback(() => {
    const difficultyWords = WORD_DATABASE[difficulty as keyof typeof WORD_DATABASE];
    const availableWords = difficultyWords.filter(word => !usedWords.has(word.word));
    
    if (availableWords.length === 0) {
      // 重置已使用单词列表，如果所有单词都已使用
      setUsedWords(new Set<string>());
      return difficultyWords[Math.floor(Math.random() * difficultyWords.length)];
    }
    
    return availableWords[Math.floor(Math.random() * availableWords.length)];
  }, [difficulty, usedWords]);
  
  // 打乱字母顺序
  const scrambleWord = useCallback((word: string) => {
    const letters = word.split('');
    let scrambled = shuffle(letters);
    
    // 确保打乱后的顺序与原单词不同
    while (scrambled.join('') === word) {
      scrambled = shuffle(letters);
    }
    
    return scrambled;
  }, [shuffle]);
  
  // 初始化游戏
  const initializeGame = useCallback(() => {
    setScore(0);
    setRound(1);
    setHintsRemaining(settings.hintsAllowed);
    setTimeRemaining(settings.timePerRound);
    setCurrentWord(null);
    setScrambledLetters([]);
    setSelectedLetters([]);
    setUsedWords(new Set<string>());
    setHintUsed(false);
    setFeedbackMessage('');
    setIsCorrect(null);
    setShowLevelUp(false);
    setGameStartTime(0);
    setTotalTime(0);
    setWordsCompleted(0);
    setGameStatus('idle');
    
    clearAllTimers();
  }, [settings, clearAllTimers]);
  
  // 开始新回合
  const startNewRound = useCallback(() => {
    const word = getRandomWord();
    const letters = scrambleWord(word.word);
    
    setCurrentWord(word);
    setScrambledLetters(letters);
    setSelectedLetters([]);
    setHintUsed(false);
    setTimeRemaining(settings.timePerRound);
    setFeedbackMessage('');
    setIsCorrect(null);
    
    // 添加到已使用单词集合
    setUsedWords(prev => {
      const newSet = new Set<string>(prev);
      newSet.add(word.word);
      return newSet;
    });
    
    // 重启定时器
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // 时间用尽
          handleTimesUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
  }, [getRandomWord, scrambleWord, settings.timePerRound, clearAllTimers]);
  
  // 当时间用尽时
  const handleTimesUp = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    playSound('error');
    setFeedbackMessage(t('time_up'));
    setIsCorrect(false);
    
    // 2秒后结束游戏
    feedbackTimerRef.current = setTimeout(() => {
      handleGameOver();
    }, 2000);
  }, [playSound, t]);
  
  // 处理游戏结束
  const handleGameOver = useCallback(() => {
    clearAllTimers();
    setGameStatus('gameover');
    
    // 计算游戏总时间
    const endTime = Date.now();
    const totalGameTime = Math.round((endTime - gameStartTime) / 1000);
    setTotalTime(totalGameTime);
    
    // 调用回调
    if (onGameComplete) {
      onGameComplete(score, wordsCompleted, totalGameTime);
    }
  }, [clearAllTimers, gameStartTime, onGameComplete, score, wordsCompleted]);
  
  // 处理字母选择
  const handleLetterSelect = useCallback((letter: string, index: number) => {
    playSound('buttonPress');
    
    // 检查该字母是否已被选择
    const alreadySelected = selectedLetters.some(item => item.index === index);
    
    if (alreadySelected) {
      // 取消选择
      setSelectedLetters(prev => prev.filter(item => item.index !== index));
    } else {
      // 选择字母
      setSelectedLetters(prev => [...prev, { index, letter }]);
    }
  }, [selectedLetters, playSound]);
  
  // 提交答案
  const handleSubmit = useCallback(() => {
    if (!currentWord) return;
    
    const userWord = selectedLetters.map(item => item.letter).join('');
    const isCorrect = userWord === currentWord.word;
    
    if (isCorrect) {
      playSound('success');
      
      // 计算得分
      const basePoints = settings.pointsPerWord;
      const timeBonus = Math.round(timeRemaining * settings.timeBonusPerSecond);
      const roundScore = basePoints + timeBonus;
      
      // 更新得分和完成单词数
      setScore(prev => prev + roundScore);
      setWordsCompleted(prev => prev + 1);
      
      // 显示反馈
      setFeedbackMessage(`+${roundScore} ${t('points')}!`);
      setIsCorrect(true);
      
      // 进入下一回合或结束游戏
      if (round >= settings.roundsToWin) {
        // 完成所有回合，游戏胜利
        feedbackTimerRef.current = setTimeout(() => {
          // 发射彩带效果
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
          
          // 结束游戏
          handleGameOver();
        }, 1500);
      } else {
        // 显示等级提升
        setShowLevelUp(true);
        setRound(prev => prev + 1);
        
        // 3秒后开始新回合
        feedbackTimerRef.current = setTimeout(() => {
          setShowLevelUp(false);
          startNewRound();
        }, 2000);
      }
    } else {
      // 答案错误
      playSound('error');
      setFeedbackMessage(t('incorrect_try_again'));
      setIsCorrect(false);
      
      // 清除反馈和选择
      feedbackTimerRef.current = setTimeout(() => {
        setSelectedLetters([]);
        setFeedbackMessage('');
        setIsCorrect(null);
      }, 1500);
    }
  }, [currentWord, selectedLetters, settings, round, playSound, t, startNewRound, handleGameOver, timeRemaining]);
  
  // 使用提示
  const useHint = useCallback(() => {
    if (hintsRemaining <= 0 || !currentWord || hintUsed) return;
    
    playSound('hint');
    
    // 减少提示次数
    setHintsRemaining(prev => prev - 1);
    setHintUsed(true);
    
    // 找出正确单词中的随机一个字母位置，该字母还未被正确放置
    const correctWord = currentWord.word;
    const correctPositions = new Set<number>();
    
    // 检查哪些位置已经正确放置
    selectedLetters.forEach((selected, idx) => {
      if (selected.letter === correctWord[idx]) {
        correctPositions.add(idx);
      }
    });
    
    // 从未正确放置的位置中随机选择一个
    const incorrectPositions: number[] = [];
    for (let i = 0; i < correctWord.length; i++) {
      if (!correctPositions.has(i)) {
        incorrectPositions.push(i);
      }
    }
    
    if (incorrectPositions.length === 0) return; // 所有字母已正确放置
    
    const hintPosition = incorrectPositions[Math.floor(Math.random() * incorrectPositions.length)];
    const correctLetter = correctWord[hintPosition];
    
    // 找到未选中的包含正确字母的字母块
    const unselectedLetterIndices: number[] = [];
    scrambledLetters.forEach((letter, index) => {
      const isSelected = selectedLetters.some(sel => sel.index === index);
      if (!isSelected && letter === correctLetter) {
        unselectedLetterIndices.push(index);
      }
    });
    
    if (unselectedLetterIndices.length === 0) return; // 没有找到可用的提示字母
    
    const hintLetterIndex = unselectedLetterIndices[0];
    
    // 创建新的已选择字母数组，添加提示字母
    let newSelectedLetters = [...selectedLetters];
    
    // 如果提示位置已有字母，先移除
    newSelectedLetters = newSelectedLetters.filter((_, idx) => idx !== hintPosition);
    
    // 插入提示字母
    newSelectedLetters.splice(hintPosition, 0, {
      index: hintLetterIndex,
      letter: correctLetter
    });
    
    setSelectedLetters(newSelectedLetters);
    
  }, [hintsRemaining, currentWord, hintUsed, selectedLetters, scrambledLetters, playSound]);
  
  // 开始游戏
  const startGame = useCallback(() => {
    setGameStatus('playing');
    setGameStartTime(Date.now());
    startNewRound();
  }, [startNewRound]);
  
  // 切换声音
  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
  };
  
  // 重置游戏
  useEffect(() => {
    initializeGame();
  }, [settings, initializeGame]);
  
  // 清理定时器
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);
  
  // 计算时间百分比
  const timePercentage = (timeRemaining / settings.timePerRound) * 100;
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] p-4 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg shadow-xl relative">
      {/* 顶部信息栏 */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-gray-200 dark:bg-gray-800 rounded-lg shadow px-4 py-2 z-10">
        <div className="flex justify-around text-center">
          <div className="flex-1">
            <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('round')}</div>
            <div className="text-xl font-bold">{round}</div>
          </div>
          <div className="border-l border-gray-300 dark:border-gray-600 h-8 self-center mx-2"></div>
          <div className="flex-1">
            <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('score')}</div>
            <div className="text-xl font-bold">{score}</div>
          </div>
          <div className="border-l border-gray-300 dark:border-gray-600 h-8 self-center mx-2"></div>
          <div className="flex-1">
            <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('time')}</div>
            <div className="text-xl font-bold">{timeRemaining}s</div>
          </div>
          <div className="border-l border-gray-300 dark:border-gray-600 h-8 self-center mx-2"></div>
          <div className="flex-1">
            <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('hints')}</div>
            <div className="text-xl font-bold">{hintsRemaining}</div>
          </div>
        </div>
      </div>
      
      {/* 难度选择 - 左上角 */}
      <div className="absolute top-4 left-4 flex space-x-2 z-10">
        <button
          onClick={() => setSettings(DIFFICULTY_SETTINGS.easy)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${ 
            difficulty === 'easy' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600' 
          }`}
          disabled={gameStatus !== 'idle'}
        >
          {t('easy')}
        </button>
        <button
          onClick={() => setSettings(DIFFICULTY_SETTINGS.medium)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${ 
            difficulty === 'medium' 
              ? 'bg-yellow-600 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600' 
          }`}
          disabled={gameStatus !== 'idle'}
        >
          {t('medium')}
        </button>
        <button
          onClick={() => setSettings(DIFFICULTY_SETTINGS.hard)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${ 
            difficulty === 'hard' 
              ? 'bg-red-600 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600' 
          }`}
          disabled={gameStatus !== 'idle'}
        >
          {t('hard')}
        </button>
      </div>
      
      {/* 声音切换 - 右上角 */}
      <div className="absolute top-4 right-4 flex items-center z-10">
        <button 
          onClick={toggleSound}
          className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors mr-2"
          aria-label={soundEnabled ? t('mute_sound') : t('enable_sound')}
        >
          {soundEnabled ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
          )}
        </button>
        
        {/* Exit按钮 - 移到右上角 */}
        <button 
          onClick={onExit}
          className="p-2 rounded-md bg-gray-500 hover:bg-gray-600 text-white transition-colors"
          aria-label={t('exit')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* 游戏区域 */}
      <div className="flex flex-col items-center justify-center flex-grow w-full pt-20">
        {/* 关卡提示 */}
        {showLevelUp && (
          <div className="level-badge">
            {t('round')} {round}
          </div>
        )}
        
        {gameStatus === 'idle' ? (
          /* 开始界面 */
          <div className="flex flex-col items-center justify-center">
            <h2 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">{t('word_wizard')}</h2>
            <p className="mb-8 text-center max-w-md text-gray-600 dark:text-gray-300">
              {t('word_wizard_description')}
            </p>
          </div>
        ) : gameStatus === 'playing' ? (
          /* 游戏界面 */
          <div className="flex flex-col items-center w-full">
            {/* 反馈信息 */}
            <div className="word-display mb-2 h-10">
              {feedbackMessage ? (
                <span className={isCorrect === true ? 'text-green-500' : isCorrect === false ? 'text-red-500' : ''}>
                  {feedbackMessage}
                </span>
              ) : null}
            </div>
            
            {/* 定义提示 */}
            {currentWord && (
              <div className="definition-display">
                <p>{currentWord.definition}</p>
              </div>
            )}
            
            {/* 时间条 */}
            <div className="timer-bar">
              <div 
                className={`timer-progress ${timeRemaining < 10 ? 'timer-critical' : ''}`} 
                style={{ width: `${timePercentage}%` }}
              />
            </div>
            
            {/* 用户输入区域 */}
            <div className="word-input-display">
              {selectedLetters.map((item, index) => (
                <div 
                  key={`selected-${index}`}
                  className="letter-button selected"
                  onClick={() => handleLetterSelect(item.letter, item.index)}
                >
                  {item.letter}
                </div>
              ))}
            </div>
            
            {/* 可用字母区域 */}
            <div className="letter-container">
              {scrambledLetters.map((letter, index) => {
                const isSelected = selectedLetters.some(item => item.index === index);
                return (
                  <div 
                    key={`letter-${index}`}
                    className={`letter-button ${isSelected ? 'disabled' : ''}`}
                    onClick={() => !isSelected && handleLetterSelect(letter, index)}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
            
            {/* 操作按钮区域 */}
            <div className="fixed bottom-64 left-0 right-0 flex justify-center space-x-4 w-full">
              <button
                onClick={useHint}
                className="hint-button"
                disabled={hintsRemaining <= 0 || hintUsed}
              >
                {t('use_hint')} ({hintsRemaining})
              </button>
              
              <button
                onClick={handleSubmit}
                className="submit-button"
                disabled={selectedLetters.length === 0}
              >
                {t('submit')}
              </button>
            </div>
          </div>
        ) : null}
      </div>
      
      {/* 底部按钮 - 只在idle和gameover状态显示，移除Exit按钮 */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        {gameStatus === 'idle' || gameStatus === 'gameover' ? (
          <button
            onClick={startGame}
            className="px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
          >
            {gameStatus === 'gameover' ? t('play_again') : t('start_game')}
          </button>
        ) : null}
      </div>
      
      {/* 游戏结束弹窗 */}
      {gameStatus === 'gameover' && (
        <div className="game-over-overlay">
          <div className="game-over-content dark:bg-gray-800">
            <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">{t('game_complete')}</h2>
            <div className="space-y-3 mb-6 text-gray-700 dark:text-gray-300">
              <p>{t('final_score')}: <span className="font-bold text-xl">{score}</span></p>
              <p>{t('words_completed')}: {wordsCompleted}</p>
              <p>{t('rounds_completed')}: {round - 1}</p>
              <p>{t('total_time')}: {totalTime}s</p>
            </div>
            <div className="flex space-x-3 justify-center">
              <button
                onClick={startGame}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                {t('play_again')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordWizard; 