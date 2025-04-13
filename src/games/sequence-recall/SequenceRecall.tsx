import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
// @ts-ignore
import confetti from 'canvas-confetti';
import './SequenceRecall.css';

// Button colors
const BUTTON_COLORS = ['red', 'green', 'blue', 'yellow'];

// Difficulty settings
const DIFFICULTY_SETTINGS = {
  easy: {
    initialSequenceLength: 2,
    maxSequenceLength: 10,
    interval: 1000,
    playerTime: 5000
  },
  medium: {
    initialSequenceLength: 3,
    maxSequenceLength: 15,
    interval: 800,
    playerTime: 4000
  },
  hard: {
    initialSequenceLength: 4,
    maxSequenceLength: 20,
    interval: 600,
    playerTime: 3000
  }
};

// Sound effects - using empty functions as placeholders
// In a real project, you should use actual audio files
const soundEffects = {
  buttonPress: (color: string) => {
    // Different color button tones
    const tones: {[key: string]: number} = {
      'red': 262, // C4
      'green': 330, // E4
      'blue': 392, // G4
      'yellow': 494 // B4
    };
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.value = tones[color] || 440;
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      gainNode.gain.value = 0.1;
      oscillator.start();
      
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 300);
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
};

interface SequenceRecallProps {
  difficulty?: 'easy' | 'medium' | 'hard';
  onGameComplete?: (score: number, level: number, maxSequence: number) => void;
  onExit?: () => void;
}

const SequenceRecall: React.FC<SequenceRecallProps> = ({
  difficulty = 'medium',
  onGameComplete,
  onExit
}) => {
  const { t } = useTranslation();
  
  // State
  const [gameStatus, setGameStatus] = useState<'idle' | 'showingSequence' | 'playerTurn' | 'gameover'>('idle');
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [highestSequence, setHighestSequence] = useState(0);
  const [activeButton, setActiveButton] = useState<number | null>(null);
  const [playerTimeLeft, setPlayerTimeLeft] = useState(0);
  const [settings, setSettings] = useState(DIFFICULTY_SETTINGS[difficulty]);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [buttonFeedback, setButtonFeedback] = useState<{index: number, type: 'success' | 'error'} | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  
  // Timer references
  const sequenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const playerTimerRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Clear all timers
  const clearAllTimers = useCallback(() => {
    if (sequenceTimerRef.current) {
      clearTimeout(sequenceTimerRef.current);
      sequenceTimerRef.current = null;
    }
    if (playerTimerRef.current) {
      clearInterval(playerTimerRef.current);
      playerTimerRef.current = null;
    }
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
  }, []);
  
  // Play sound
  const playSound = useCallback((soundType: string, color?: string) => {
    if (!soundEnabled) return;
    
    switch(soundType) {
      case 'button':
        soundEffects.buttonPress(color || 'red');
        break;
      case 'success':
        soundEffects.success();
        break;
      case 'error':
        soundEffects.error();
        break;
      case 'levelUp':
        soundEffects.levelUp();
        break;
      default:
        break;
    }
  }, [soundEnabled]);
  
  // Reset game
  const resetGame = useCallback(() => {
    clearAllTimers();
    setGameStatus('idle');
    setSequence([]);
    setPlayerSequence([]);
    setLevel(1);
    setScore(0);
    setHighestSequence(0);
    setActiveButton(null);
    setFeedbackMessage('');
    setButtonFeedback(null);
    setSettings(DIFFICULTY_SETTINGS[difficulty]);
    setCurrentStreak(0);
  }, [clearAllTimers, difficulty]);
  
  // Reset game when difficulty changes
  useEffect(() => {
    resetGame();
  }, [difficulty, resetGame]);
  
  // Generate random sequence
  const generateSequence = useCallback((length: number) => {
    const newSequence = [];
    for (let i = 0; i < length; i++) {
      newSequence.push(Math.floor(Math.random() * BUTTON_COLORS.length));
    }
    return newSequence;
  }, []);
  
  // Start new round
  const startNewRound = useCallback(() => {
    clearAllTimers();
    setButtonFeedback(null);
    setGameStatus('showingSequence');
    
    const sequenceLength = Math.min(
      settings.initialSequenceLength + level - 1,
      settings.maxSequenceLength
    );
    
    if (sequenceLength > highestSequence) {
      setHighestSequence(sequenceLength);
    }
    
    const newSequence = generateSequence(sequenceLength);
    setSequence(newSequence);
    setPlayerSequence([]);
    setFeedbackMessage(t('watch_sequence', 'Watch the sequence carefully'));
    
    // Show sequence to player
    let currentIndex = 0;
    
    const showNextButton = () => {
      if (currentIndex < newSequence.length) {
        setActiveButton(newSequence[currentIndex]);
        // Play button sound
        playSound('button', BUTTON_COLORS[newSequence[currentIndex]]);
        
        sequenceTimerRef.current = setTimeout(() => {
          setActiveButton(null);
          
          sequenceTimerRef.current = setTimeout(() => {
            currentIndex++;
            showNextButton();
          }, settings.interval / 2);
        }, settings.interval);
      } else {
        // Sequence display completed, player's turn
        setActiveButton(null);
        setGameStatus('playerTurn');
        setFeedbackMessage(t('your_turn', 'Your turn! Repeat the sequence'));
        
        // Set player timer
        setPlayerTimeLeft(settings.playerTime * newSequence.length / 1000);
        const startTime = Date.now();
        const totalTime = settings.playerTime * newSequence.length;
        
        playerTimerRef.current = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(0, totalTime - elapsed);
          const secondsLeft = Math.ceil(remaining / 1000);
          
          setPlayerTimeLeft(secondsLeft);
          
          if (remaining <= 0) {
            clearInterval(playerTimerRef.current!);
            handleGameOver();
          }
        }, 100);
      }
    };
    
    // Start displaying sequence
    showNextButton();
  }, [generateSequence, level, settings, highestSequence, t, playSound]);
  
  // Handle game over
  const handleGameOver = useCallback(() => {
    clearAllTimers();
    setGameStatus('gameover');
    setFeedbackMessage(t('game_over', 'Game Over'));
    
    // Update best streak
    if (currentStreak > bestStreak) {
      setBestStreak(currentStreak);
    }
    
    if (onGameComplete) {
      onGameComplete(score, level, highestSequence);
    }
    
    // Show end animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    // Play end sound
    playSound('error');
  }, [clearAllTimers, score, level, highestSequence, onGameComplete, t, currentStreak, bestStreak, playSound]);
  
  // Handle player button click
  const handleButtonClick = useCallback((index: number) => {
    if (gameStatus !== 'playerTurn') return;
    
    // Play button sound
    playSound('button', BUTTON_COLORS[index]);
    
    const updatedPlayerSequence = [...playerSequence, index];
    setPlayerSequence(updatedPlayerSequence);
    
    // Check if player input is correct
    const isCorrect = updatedPlayerSequence.every(
      (buttonIndex, i) => buttonIndex === sequence[i]
    );
    
    if (!isCorrect) {
      // Player input error
      setButtonFeedback({ index, type: 'error' });
      // Play error sound
      playSound('error');
      feedbackTimerRef.current = setTimeout(() => {
        handleGameOver();
      }, 500);
      return;
    }
    
    // Show success feedback
    setButtonFeedback({ index, type: 'success' });
    
    // Update streak
    setCurrentStreak(prev => prev + 1);
    
    if (updatedPlayerSequence.length === sequence.length) {
      // Player completed the entire sequence
      clearAllTimers();
      
      // Play success sound
      playSound('success');
      
      // Calculate score - based on sequence length, remaining time, and current streak
      const basePoints = sequence.length * 10;
      const timeBonus = Math.round(playerTimeLeft * 5);
      const streakBonus = Math.round(currentStreak * 2);
      const roundScore = basePoints + timeBonus + streakBonus;
      
      setScore(prevScore => prevScore + roundScore);
      
      // Level up
      setLevel(prevLevel => prevLevel + 1);
      setShowLevelUp(true);
      
      // Play level up sound
      playSound('levelUp');
      
      // Small celebration
      confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.7 }
      });
      
      // Show success message, including score details
      setFeedbackMessage(`${t('level_complete', 'Level Complete')}! +${basePoints} +${timeBonus} +${streakBonus} = +${roundScore} ${t('points', 'points')}`);
      
      // 3 seconds after starting new round
      feedbackTimerRef.current = setTimeout(() => {
        setShowLevelUp(false);
        startNewRound();
      }, 2000);
    }
  }, [gameStatus, playerSequence, sequence, playerTimeLeft, handleGameOver, clearAllTimers, startNewRound, t, currentStreak, playSound]);
  
  // Start game
  const startGame = useCallback(() => {
    resetGame();
    setCurrentStreak(0);
    startNewRound();
  }, [resetGame, startNewRound]);
  
  // Clean up on component unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);
  
  // Calculate player timer progress percentage
  const playerTimePercentage = playerTimeLeft / (settings.playerTime * sequence.length / 1000) * 100;
  
  // Toggle sound setting
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] p-4 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg shadow-xl relative">
      
      {/* Header: Stats - Top center */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-gray-200 dark:bg-gray-800 rounded-lg shadow px-4 py-2 z-10">
        <div className="flex justify-around text-center">
          <div className="flex-1">
            <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('level', 'Level')}</div>
            <div className="text-xl font-bold">{level}</div>
          </div>
          <div className="border-l border-gray-300 dark:border-gray-600 h-8 self-center mx-2"></div>
          <div className="flex-1">
            <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('score', 'Score')}</div>
            <div className="text-xl font-bold">{score}</div>
          </div>
          <div className="border-l border-gray-300 dark:border-gray-600 h-8 self-center mx-2"></div>
          <div className="flex-1">
            <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('sequence', 'Sequence')}</div>
            <div className="text-xl font-bold">{sequence.length}</div>
          </div>
          <div className="border-l border-gray-300 dark:border-gray-600 h-8 self-center mx-2"></div>
          <div className="flex-1">
            <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('streak', 'Streak')}</div>
            <div className="text-xl font-bold">{currentStreak}</div>
          </div>
        </div>
      </div>
      
      {/* Difficulty Selection - Top left */}
      <div className="absolute top-4 left-4 flex space-x-2 z-10">
        <button
          onClick={() => setSettings(DIFFICULTY_SETTINGS.easy)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${ 
            settings === DIFFICULTY_SETTINGS.easy 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600' 
          }`}
          disabled={gameStatus !== 'idle'}
        >
          {t('easy', 'Easy')}
        </button>
        <button
          onClick={() => setSettings(DIFFICULTY_SETTINGS.medium)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${ 
            settings === DIFFICULTY_SETTINGS.medium 
              ? 'bg-yellow-600 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600' 
          }`}
          disabled={gameStatus !== 'idle'}
        >
          {t('medium', 'Medium')}
        </button>
        <button
          onClick={() => setSettings(DIFFICULTY_SETTINGS.hard)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${ 
            settings === DIFFICULTY_SETTINGS.hard 
              ? 'bg-red-600 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600' 
          }`}
          disabled={gameStatus !== 'idle'}
        >
          {t('hard', 'Hard')}
        </button>
      </div>
      
      {/* Sound Toggle - Top right */}
      <div className="absolute top-4 right-4 flex items-center z-10">
        <button 
          onClick={toggleSound}
          className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
          aria-label={soundEnabled ? t('mute_sound', 'Mute Sound') : t('enable_sound', 'Enable Sound')}
        >
          {/* Sound Icons */}
          {soundEnabled ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
          )}
        </button>
      </div>

      {/* Game Area - Centered */}
      <div className="flex flex-col items-center justify-center flex-grow w-full pt-20"> { /* Added padding-top */}
        <div className="sequence-display mb-6 h-8">
          {feedbackMessage}
        </div>
        
        {/* Level Up Information */}
        {showLevelUp && (
          <div className="level-badge">
            {t('level', 'Level')} {level}
          </div>
        )}
        
        {/* Color Buttons */}
        <div 
          className="sequence-grid mb-6"
          style={{ 
            gridTemplateColumns: `repeat(${Math.min(BUTTON_COLORS.length, 4)}, 1fr)` 
          }}
        >
          {BUTTON_COLORS.map((color, index) => (
            <div
              key={index}
              className={`sequence-button button-${color} ${
                activeButton === index ? 'active' : ''
              } ${
                buttonFeedback?.index === index ? `${buttonFeedback.type}` : ''
              }`}
              onClick={() => handleButtonClick(index)}
            />
          ))}
        </div>
        
        {/* Player Timer Bar */}
        {gameStatus === 'playerTurn' && (
          <div className="timer-bar w-full max-w-sm">
            <div 
              className={`timer-progress ${playerTimeLeft < 3 ? 'timer-critical' : ''}`} 
              style={{ width: `${playerTimePercentage}%` }}
            />
          </div>
        )}
      </div>

      {/* Action Buttons - Bottom centered */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4">
        <button
          onClick={startGame}
          disabled={gameStatus !== 'idle' && gameStatus !== 'gameover'}
          className="px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {gameStatus === 'gameover' || gameStatus === 'idle' ? t('start_game', 'Start Game') : t('game_in_progress', 'Game in Progress')}
        </button>
        
        <button
          onClick={onExit}
          className="px-6 py-3 rounded-lg bg-gray-500 text-white font-semibold hover:bg-gray-600 transition-colors"
        >
          {t('exit', 'Exit')}
        </button>
      </div>
      
      {/* Game Over Modal */}
      {gameStatus === 'gameover' && (
        <div className="game-over-overlay">
          <div className="game-over-content dark:bg-gray-800">
            <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">{t('game_over', 'Game Over')}</h2>
            <div className="space-y-3 mb-6 text-gray-700 dark:text-gray-300">
              <p>{t('final_score', 'Final Score')}: <span className="font-bold text-xl">{score}</span></p>
              <p>{t('level_reached', 'Level Reached')}: {level}</p>
              <p>{t('longest_sequence', 'Longest Sequence')}: {highestSequence}</p>
              <p>{t('highest_streak', 'Highest Streak')}: {Math.max(bestStreak, currentStreak)}</p>
            </div>
            <div className="flex space-x-3 justify-center">
              <button
                onClick={startGame}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                {t('play_again', 'Play Again')}
              </button>
              {onExit && (
                <button
                  onClick={onExit}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  {t('exit', 'Exit')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SequenceRecall; 