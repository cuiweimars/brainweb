import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
// @ts-ignore
import confetti from 'canvas-confetti';
import './VocabularyBuilder.css';

// Vocabulary data organized by difficulty
const VOCABULARY_DATA = {
  easy: [
    {
      word: 'happy',
      definition: 'feeling or showing pleasure or contentment',
      synonyms: ['joyful', 'pleased', 'content', 'delighted'],
      incorrectOptions: ['sad', 'angry', 'upset', 'gloomy']
    },
    {
      word: 'big',
      definition: 'of considerable size, extent, or intensity',
      synonyms: ['large', 'huge', 'enormous', 'massive'],
      incorrectOptions: ['small', 'tiny', 'little', 'miniature']
    },
    {
      word: 'fast',
      definition: 'moving or capable of moving at high speed',
      synonyms: ['quick', 'rapid', 'swift', 'speedy'],
      incorrectOptions: ['slow', 'sluggish', 'leisurely', 'unhurried']
    },
    {
      word: 'good',
      definition: 'of high quality or an acceptable standard',
      synonyms: ['excellent', 'fine', 'great', 'wonderful'],
      incorrectOptions: ['bad', 'poor', 'terrible', 'awful']
    },
    {
      word: 'cold',
      definition: 'of or at a low temperature',
      synonyms: ['chilly', 'cool', 'frosty', 'icy'],
      incorrectOptions: ['hot', 'warm', 'heated', 'scorching']
    }
  ],
  
  medium: [
    {
      word: 'eloquent',
      definition: 'fluent or persuasive in speaking or writing',
      synonyms: ['articulate', 'expressive', 'fluent', 'well-spoken'],
      incorrectOptions: ['incoherent', 'inarticulate', 'mumbling', 'tongue-tied']
    },
    {
      word: 'diligent',
      definition: 'having or showing care and conscientiousness in one\'s work or duties',
      synonyms: ['industrious', 'hardworking', 'conscientious', 'assiduous'],
      incorrectOptions: ['lazy', 'idle', 'negligent', 'careless']
    },
    {
      word: 'resilient',
      definition: 'able to withstand or recover quickly from difficult conditions',
      synonyms: ['strong', 'adaptable', 'buoyant', 'hardy'],
      incorrectOptions: ['fragile', 'weak', 'vulnerable', 'delicate']
    },
    {
      word: 'ambiguous',
      definition: 'open to more than one interpretation; not having one obvious meaning',
      synonyms: ['unclear', 'vague', 'equivocal', 'cryptic'],
      incorrectOptions: ['clear', 'explicit', 'obvious', 'straightforward']
    },
    {
      word: 'pragmatic',
      definition: 'dealing with things sensibly and realistically',
      synonyms: ['practical', 'realistic', 'sensible', 'reasonable'],
      incorrectOptions: ['idealistic', 'unrealistic', 'impractical', 'visionary']
    }
  ],
  
  hard: [
    {
      word: 'ephemeral',
      definition: 'lasting for a very short time',
      synonyms: ['transient', 'fleeting', 'momentary', 'short-lived'],
      incorrectOptions: ['permanent', 'eternal', 'enduring', 'everlasting']
    },
    {
      word: 'erudite',
      definition: 'having or showing great knowledge or learning',
      synonyms: ['scholarly', 'learned', 'intellectual', 'academic'],
      incorrectOptions: ['ignorant', 'uneducated', 'uninformed', 'illiterate']
    },
    {
      word: 'insidious',
      definition: 'proceeding in a gradual, subtle way, but with harmful effects',
      synonyms: ['treacherous', 'stealthy', 'surreptitious', 'sneaky'],
      incorrectOptions: ['obvious', 'apparent', 'overt', 'evident']
    },
    {
      word: 'sycophant',
      definition: 'a person who acts obsequiously toward someone important in order to gain advantage',
      synonyms: ['flatterer', 'bootlicker', 'toady', 'fawner'],
      incorrectOptions: ['critic', 'dissenter', 'detractor', 'adversary']
    },
    {
      word: 'ubiquitous',
      definition: 'present, appearing, or found everywhere',
      synonyms: ['omnipresent', 'pervasive', 'universal', 'widespread'],
      incorrectOptions: ['rare', 'scarce', 'uncommon', 'infrequent']
    }
  ]
};

// Difficulty settings
const DIFFICULTY_SETTINGS = {
  easy: {
    wordsPerLevel: 5,
    timePerWord: 30, // seconds
    points: {
      base: 10,
      timeBonus: 0.5,
      streakMultiplier: 1.5
    },
    maxHints: 3
  },
  medium: {
    wordsPerLevel: 7,
    timePerWord: 25, // seconds
    points: {
      base: 20,
      timeBonus: 1,
      streakMultiplier: 2
    },
    maxHints: 2
  },
  hard: {
    wordsPerLevel: 10,
    timePerWord: 20, // seconds
    points: {
      base: 30,
      timeBonus: 2,
      streakMultiplier: 3
    },
    maxHints: 1
  }
};

// Game modes
type GameMode = 'synonyms' | 'definitions';
const GAME_MODES: GameMode[] = ['synonyms', 'definitions'];

// Sound effects
const soundEffects = {
  correct: () => {
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
  incorrect: () => {
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
};

type WordItem = {
  word: string;
  definition: string;
  synonyms: string[];
  incorrectOptions: string[];
};

interface VocabularyBuilderProps {
  difficulty?: 'easy' | 'medium' | 'hard';
  onGameComplete?: (score: number, wordsLearned: number, bestStreak: number) => void;
  onExit?: () => void;
}

const VocabularyBuilder: React.FC<VocabularyBuilderProps> = ({
  difficulty: propDifficulty = 'medium',
  onGameComplete,
  onExit
}) => {
  const { t } = useTranslation();
  
  // State
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'levelComplete' | 'gameover'>('idle');
  const [gameMode, setGameMode] = useState<GameMode>('synonyms');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState<WordItem | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [wordsLearned, setWordsLearned] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(propDifficulty);
  const [settings, setSettings] = useState(DIFFICULTY_SETTINGS[difficulty]);
  const [hintsRemaining, setHintsRemaining] = useState(settings.maxHints);
  const [showHint, setShowHint] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState<'correct' | 'incorrect' | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [usedWords, setUsedWords] = useState<string[]>([]);
  
  // Timer references
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Clear all timers
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
  
  // Play sound
  const playSound = useCallback((type: 'correct' | 'incorrect' | 'levelUp') => {
    if (!soundEnabled) return;
    
    switch(type) {
      case 'correct':
        soundEffects.correct();
        break;
      case 'incorrect':
        soundEffects.incorrect();
        break;
      case 'levelUp':
        soundEffects.levelUp();
        break;
      default:
        break;
    }
  }, [soundEnabled]);
  
  // Generate a set of words for the current level
  const getWordsForLevel = useCallback(() => {
    const availableWords = VOCABULARY_DATA[difficulty].filter(
      item => !usedWords.includes(item.word)
    );
    
    if (availableWords.length < settings.wordsPerLevel) {
      // Reset used words if we don't have enough left
      setUsedWords([]);
      return VOCABULARY_DATA[difficulty].slice(0, settings.wordsPerLevel);
    }
    
    // Shuffle and take only the words we need
    return availableWords
      .sort(() => Math.random() - 0.5)
      .slice(0, settings.wordsPerLevel);
  }, [difficulty, settings.wordsPerLevel, usedWords]);
  
  // Generate options for the current word
  const generateOptions = useCallback((word: WordItem, mode: GameMode) => {
    // For synonyms mode, we select synonyms
    // For definitions mode, we select the actual word
    
    let correctOption: string;
    let allIncorrectOptions: string[];
    
    if (mode === 'synonyms') {
      // Randomly select one of the synonyms as the correct answer
      correctOption = word.synonyms[Math.floor(Math.random() * word.synonyms.length)];
      
      // Collect all incorrect options
      allIncorrectOptions = [...word.incorrectOptions];
      
      // Ensure we have 3 incorrect options
      if (allIncorrectOptions.length < 3) {
        // If we don't have enough, we can add some from other words
        const otherWords = VOCABULARY_DATA[difficulty].filter(w => w.word !== word.word);
        for (const otherWord of otherWords) {
          allIncorrectOptions = [...allIncorrectOptions, ...otherWord.incorrectOptions];
          if (allIncorrectOptions.length >= 10) break;
        }
      }
    } else { // definitions mode
      correctOption = word.word;
      
      // Get words from other items as incorrect options
      allIncorrectOptions = VOCABULARY_DATA[difficulty]
        .filter(w => w.word !== word.word)
        .map(w => w.word);
    }
    
    // Shuffle and take 3 incorrect options
    const incorrectOptions = allIncorrectOptions
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    // Combine options and shuffle
    return [...incorrectOptions, correctOption].sort(() => Math.random() - 0.5);
  }, [difficulty]);
  
  // Start a new level
  const startNewLevel = useCallback(() => {
    clearAllTimers();
    
    const levelWords = getWordsForLevel();
    setCurrentWordIndex(0);
    setCurrentWord(levelWords[0]);
    setUsedWords(prev => [...prev, ...levelWords.map(w => w.word)]);
    setOptions(generateOptions(levelWords[0], gameMode));
    setSelectedOption(null);
    setShowHint(false);
    setFeedbackMessage('');
    setFeedbackType(null);
    setTimeLeft(settings.timePerWord);
    setHintsRemaining(settings.maxHints);
    setGameStatus('playing');
    
    // Start the timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up
          handleAnswer(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearAllTimers, gameMode, generateOptions, getWordsForLevel, handleAnswer, settings.maxHints, settings.timePerWord]);
  
  // Start game
  const startGame = useCallback(() => {
    setScore(0);
    setLevel(1);
    setWordsLearned(0);
    setCurrentStreak(0);
    setBestStreak(0);
    setUsedWords([]);
    setGameStatus('playing');
    setFeedbackMessage('');
    setFeedbackType(null);
    setShowLevelUp(false);
    
    // Start first level
    startNewLevel();
  }, [startNewLevel]);
  
  // Handle answer
  function handleAnswer(selectedAnswer: string | null) {
    clearAllTimers();
    
    if (!currentWord) return;
    
    let isCorrect = false;
    
    if (selectedAnswer !== null) {
      if (gameMode === 'synonyms') {
        isCorrect = currentWord.synonyms.includes(selectedAnswer);
      } else { // definitions mode
        isCorrect = currentWord.word === selectedAnswer;
      }
    }
    
    if (isCorrect) {
      // Play correct sound
      playSound('correct');
      
      // Update streak
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      if (newStreak > bestStreak) {
        setBestStreak(newStreak);
      }
      
      // Calculate score
      const basePoints = settings.points.base;
      const timeBonus = Math.round(timeLeft * settings.points.timeBonus);
      const streakMultiplier = Math.floor(newStreak / 3) * settings.points.streakMultiplier;
      
      const pointsEarned = Math.round(
        (basePoints + timeBonus) * (1 + streakMultiplier / 10)
      );
      
      setScore(prev => prev + pointsEarned);
      setWordsLearned(prev => prev + 1);
      
      // Set feedback
      setFeedbackType('correct');
      setFeedbackMessage(
        `${t('correct')}! +${pointsEarned} ${t('points')}`
      );
    } else {
      // Play incorrect sound
      playSound('incorrect');
      
      // Reset streak
      setCurrentStreak(0);
      
      // Set feedback
      setFeedbackType('incorrect');
      
      if (selectedAnswer === null) {
        setFeedbackMessage(t('time_up'));
      } else {
        setFeedbackMessage(t('incorrect'));
      }
    }
    
    // Show feedback for a bit before moving on
    setSelectedOption(selectedAnswer);
    
    feedbackTimerRef.current = setTimeout(() => {
      moveToNextWord();
    }, 1500);
  }
  
  // Move to next word or level
  const moveToNextWord = useCallback(() => {
    // Clear timers
    clearAllTimers();
    
    const levelWords = getWordsForLevel();
    const nextIndex = currentWordIndex + 1;
    
    // Check if we've completed all words for this level
    if (nextIndex >= settings.wordsPerLevel) {
      // Level complete
      setGameStatus('levelComplete');
      setShowLevelUp(true);
      playSound('levelUp');
      
      // Celebrate with confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      // Move to next level after a brief pause
      feedbackTimerRef.current = setTimeout(() => {
        setLevel(prev => prev + 1);
        setShowLevelUp(false);
        startNewLevel();
      }, 2000);
    } else {
      // Move to next word
      const nextWord = levelWords[nextIndex];
      setCurrentWordIndex(nextIndex);
      setCurrentWord(nextWord);
      setOptions(generateOptions(nextWord, gameMode));
      setSelectedOption(null);
      setFeedbackMessage('');
      setFeedbackType(null);
      setShowHint(false);
      setTimeLeft(settings.timePerWord);
      
      // Start the timer
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Time's up
            handleAnswer(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [clearAllTimers, currentWordIndex, gameMode, generateOptions, getWordsForLevel, handleAnswer, playSound, settings.timePerWord, settings.wordsPerLevel, startNewLevel]);
  
  // Use hint
  const useHint = useCallback(() => {
    if (hintsRemaining <= 0 || !currentWord) return;
    
    setHintsRemaining(prev => prev - 1);
    setShowHint(true);
  }, [currentWord, hintsRemaining]);
  
  // Toggle sound
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };
  
  // Toggle game mode - add a more direct handler
  const handleSetGameMode = (mode: GameMode) => {
    console.log('Setting game mode to:', mode);
    setGameMode(mode);
  };
  
  // Handle game over
  const handleGameOver = useCallback(() => {
    clearAllTimers();
    setGameStatus('gameover');
    
    if (onGameComplete) {
      onGameComplete(score, wordsLearned, bestStreak);
    }
    
    // Show end animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, [bestStreak, clearAllTimers, onGameComplete, score, wordsLearned]);
  
  // Update settings when difficulty changes
  useEffect(() => {
    setSettings(DIFFICULTY_SETTINGS[difficulty]);
  }, [difficulty]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);
  
  // Calculate timer progress percentage
  const timerPercentage = (timeLeft / settings.timePerWord) * 100;
  
  return (
    <div className="vocabulary-container">
      {/* Header: Stats */}
      <div className="stats-container">
        <div className="stat-item">
          <div className="stat-label">Level</div>
          <div className="stat-value">{level}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Score</div>
          <div className="stat-value">{score}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Words</div>
          <div className="stat-value">{wordsLearned}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Streak</div>
          <div className="stat-value">{currentStreak}</div>
        </div>
      </div>
      
      {/* Level Up Badge */}
      {showLevelUp && (
        <div className="level-badge">
          Level {level}
        </div>
      )}
      
      {gameStatus === 'idle' ? (
        <div className="flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold mb-4">Vocabulary Builder</h2>
          
          {/* Game Mode Selector */}
          <div className="mb-6">
            <p className="mb-2 text-center">Select Mode:</p>
            <div className="flex gap-4 justify-center">
              <button
                type="button"
                className={`difficulty-button ${gameMode === 'synonyms' ? 'active' : ''}`}
                onClick={() => handleSetGameMode('synonyms')}
                style={{ 
                  position: 'relative', 
                  zIndex: 10,
                  cursor: 'pointer',
                  padding: '10px 20px',
                  fontWeight: 'bold',
                  textTransform: 'capitalize',
                  letterSpacing: '0.5px'
                }}
              >
                Synonyms Mode
              </button>
              <button
                type="button"
                className={`difficulty-button ${gameMode === 'definitions' ? 'active' : ''}`}
                onClick={() => handleSetGameMode('definitions')}
                style={{ 
                  position: 'relative', 
                  zIndex: 10,
                  cursor: 'pointer',
                  padding: '10px 20px',
                  fontWeight: 'bold',
                  textTransform: 'capitalize',
                  letterSpacing: '0.5px'
                }}
              >
                Definitions Mode
              </button>
            </div>
          </div>
          
          {/* Difficulty Selector */}
          <div className="difficulty-selector">
            <button
              type="button"
              className={`difficulty-button ${difficulty === 'easy' ? 'active' : ''}`}
              onClick={() => setDifficulty('easy')}
              style={{ 
                position: 'relative', 
                zIndex: 10,
                cursor: 'pointer',
                padding: '10px 20px',
                fontWeight: 'bold',
                textTransform: 'capitalize',
                letterSpacing: '0.5px'
              }}
            >
              Easy
            </button>
            <button
              type="button"
              className={`difficulty-button ${difficulty === 'medium' ? 'active' : ''}`}
              onClick={() => setDifficulty('medium')}
              style={{ 
                position: 'relative', 
                zIndex: 10,
                cursor: 'pointer',
                padding: '10px 20px',
                fontWeight: 'bold',
                textTransform: 'capitalize',
                letterSpacing: '0.5px'
              }}
            >
              Medium
            </button>
            <button
              type="button"
              className={`difficulty-button ${difficulty === 'hard' ? 'active' : ''}`}
              onClick={() => setDifficulty('hard')}
              style={{ 
                position: 'relative', 
                zIndex: 10,
                cursor: 'pointer',
                padding: '10px 20px',
                fontWeight: 'bold',
                textTransform: 'capitalize',
                letterSpacing: '0.5px'
              }}
            >
              Hard
            </button>
          </div>
          
          <button className="start-button" onClick={startGame}>
            Start Game
          </button>
        </div>
      ) : (
        <>
          {/* Game Play Area */}
          {currentWord && (
            <>
              {/* Word Display */}
              <div className="word-display">
                {gameMode === 'synonyms' 
                  ? currentWord.word
                  : currentWord.definition
                }
              </div>
              
              {/* Feedback Message */}
              {feedbackMessage && (
                <div className={`feedback-message ${feedbackType}`}>
                  {feedbackType === 'correct' ? `Correct! +${feedbackMessage.split('+')[1]}` : 'Incorrect'}
                </div>
              )}
              
              {/* Hint Button and Display */}
              {gameStatus === 'playing' && (
                <>
                  <button 
                    className="hint-button"
                    onClick={useHint}
                    disabled={hintsRemaining <= 0 || showHint}
                  >
                    Use Hint ({hintsRemaining})
                  </button>
                  
                  {showHint && (
                    <div className="hint-display">
                      {gameMode === 'synonyms' 
                        ? `Hint: ${currentWord.definition}`
                        : `Hint: ${currentWord.synonyms[0]}`
                      }
                    </div>
                  )}
                </>
              )}
              
              {/* Options Grid */}
              <div className="options-grid">
                {options.map((option, index) => (
                  <button
                    key={index}
                    className={`option-button ${
                      selectedOption === option
                        ? gameMode === 'synonyms'
                          ? currentWord.synonyms.includes(option)
                            ? 'correct'
                            : 'incorrect'
                          : option === currentWord.word
                            ? 'correct'
                            : 'incorrect'
                        : ''
                    }`}
                    onClick={() => gameStatus === 'playing' && handleAnswer(option)}
                    disabled={gameStatus !== 'playing' || selectedOption !== null}
                  >
                    {option}
                  </button>
                ))}
              </div>
              
              {/* Timer Bar */}
              {gameStatus === 'playing' && (
                <div className="timer-bar">
                  <div 
                    className={`timer-progress ${timeLeft < settings.timePerWord * 0.2 ? 'timer-critical' : ''}`}
                    style={{ width: `${timerPercentage}%` }}
                  />
                </div>
              )}
            </>
          )}
        </>
      )}
      
      {/* Game Over Overlay */}
      {gameStatus === 'gameover' && (
        <div className="game-over-overlay">
          <div className="game-over-content">
            <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">
              Game Over
            </h2>
            <div className="space-y-3 mb-6 text-gray-700 dark:text-gray-300">
              <p>Final Score: <span className="font-bold text-xl">{score}</span></p>
              <p>Level Reached: {level}</p>
              <p>Words Learned: {wordsLearned}</p>
              <p>Highest Streak: {bestStreak}</p>
            </div>
            <div className="flex space-x-3 justify-center">
              <button
                onClick={startGame}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Play Again
              </button>
              {onExit && (
                <button
                  onClick={onExit}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Exit
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Sound toggle button */}
      <button 
        onClick={toggleSound}
        className="absolute top-4 right-4 p-2 rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
        aria-label={soundEnabled ? "Mute Sound" : "Enable Sound"}
      >
        {soundEnabled ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        )}
      </button>
      
      {/* Exit Button */}
      {onExit && (
        <button
          onClick={onExit}
          className="absolute bottom-4 right-4 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
        >
          Exit
        </button>
      )}
    </div>
  );
};

export default VocabularyBuilder; 