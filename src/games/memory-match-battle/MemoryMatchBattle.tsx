import React, { useState, useEffect, useRef } from 'react';
import './MemoryMatchBattle.css';

// 导入游戏缩略图
import memoryMatchImg from '../../images/memory-training/memory-match.jpg';
import memoryPathImg from '../../images/memory-training/memory-path.jpg';
import pictureMemoryImg from '../../images/memory-training/picture-memory.jpg';
import sequenceRecallImg from '../../images/memory-training/sequence-recall.jpg';
import focusMasterImg from '../../images/focus-training/focus-master.jpg';
import patternRecognitionImg from '../../images/focus-training/pattern-recognition.jpg';
import attentionZoneImg from '../../images/focus-training/attention-zone.jpg';
import brainPuzzleImg from '../../images/logic-puzzles/brain-puzzle-master.jpg';
import mathChallengeImg from '../../images/math-challenges/math-challenge.jpg';
import wordConnectionsImg from '../../images/language-skills/word-connections.jpg';
import defaultGameImg from '../../images/default-game.jpg';

interface MemoryMatchBattleProps {
  difficulty?: 'easy' | 'medium' | 'hard';
  onExit?: () => void;
  onComplete?: (score: number, time: number) => void;
}

interface Card {
  id: number;
  value: string;
  imageSrc: string;
  isFlipped: boolean;
  isMatched: boolean;
  matchedBy: 'player1' | 'player2' | null;
}

interface GameState {
  player1Score: number;
  player2Score: number;
  currentPlayer: 'player1' | 'player2';
  cards: Card[];
  selectedCards: Card[];
  gameStatus: 'intro' | 'playing' | 'paused' | 'gameover';
  winner: 'player1' | 'player2' | 'tie' | null;
  powerups: {
    player1: {
      freezeOpponent: number;
      extraTurn: number;
      revealCard: number;
    };
    player2: {
      freezeOpponent: number;
      extraTurn: number;
      revealCard: number;
    };
  };
  playerFrozen: 'player1' | 'player2' | null;
  turnTimeRemaining: number;
  roundsPlayed: number;
  totalMatches: number;
  matchesFound: number;
}

// Difficulty configurations
const DIFFICULTY_CONFIG = {
  easy: {
    gridSize: 4, // 4x4 grid (16 cards = 8 pairs)
    pairsCount: 8,
    turnTime: 15,
    initialPowerups: 1
  },
  medium: {
    gridSize: 6, // 6x6 grid (36 cards = 18 pairs)
    pairsCount: 18,
    turnTime: 10,
    initialPowerups: 2
  },
  hard: {
    gridSize: 6, // 6x6 grid (36 cards = 18 pairs)
    pairsCount: 18,
    turnTime: 8,
    initialPowerups: 3
  }
};

// 游戏图片集合，替代原来的emoji
const GAME_THUMBNAILS = [
  { value: 'memory-match', imageSrc: memoryMatchImg },
  { value: 'memory-path', imageSrc: memoryPathImg },
  { value: 'picture-memory', imageSrc: pictureMemoryImg },
  { value: 'sequence-recall', imageSrc: sequenceRecallImg },
  { value: 'focus-master', imageSrc: focusMasterImg },
  { value: 'pattern-recognition', imageSrc: patternRecognitionImg },
  { value: 'attention-zone', imageSrc: attentionZoneImg },
  { value: 'brain-puzzle-master', imageSrc: brainPuzzleImg },
  { value: 'math-challenge', imageSrc: mathChallengeImg },
  { value: 'word-connections', imageSrc: wordConnectionsImg },
  { value: 'default-game', imageSrc: defaultGameImg }
];

// Base64编码的音频数据
const AUDIO_DATA = {
  cardFlip: "data:audio/wav;base64,UklGRmQDAABXQVZFZm10IBAAAAABAAEARKwAAESsAAABAAgAZGF0YUADAAB/gIJ+enp8f4SIh4J8dXBydHl/g4WDfnlzcnR4fYOGhYB6dG9xdnyChIWBfHVwcHV7gYaGgnt0cHBzeoKHiIV/eHJwcnd9g4iHgnx1cHJ1e4GFhoJ9d3FwdHyChYeEgHp0cHF2fIGFhYJ8dXBxdnyBhIWCfXZxcXR6f4OGhH96dHFydn2ChYWCfXZxcXV7gIOFgn12cXJ2fIGFhoN+eHJxdHp/hIaEf3l0cXN3fYKGhoF9dnFydXuAhIWDfXZxcXR7gISGg316c3F0eX+Eh4WAfHVxcnZ8gYWGgn12cXJ1e4CEhYN+d3JydXt/g4aFgHp0cXN3fYKGhoF8dXFydXuBhIaDfndycnV7gISFg356c3J1e4CEhoR/eXRxc3d9goWFgXx1cXJ2fIGEhYJ9dnFydXuAhIWDfnhzcnV7gISGg316c3J1en+Eh4WAfHVxcnZ8gYWFgn12cXJ1e4CEhYN+d3JydXuAg4aEf3p0cXN3fYKGhoF8dXFydnyBhIWCfXZxcnV7gISFg356c3J1e3+Eh4WAfHVxcnZ8gYWGgn12cXF1e4CEhYN+d3JydXt/g4aEf3p0cXN3fYKGhoF8dXFydnyBhIWCfXZxcXV7gISFg357c3J1e3+Eh4WAfHVxcnZ8gYWGgn12cXF1e4CEhYN+d3JydXt/g4aEf3p0cXN3fYKGhoF8dXFydXuBhIWCfXZxcnV7gISFg357c3J1e3+Eh4WAfHVxcnZ8gYWGgn12cXF1e4CEhYN+d3JydXt/g4aEf3p0cXN3fYKGhoF8dXFydXuBhIWCfnZxcnV7gISFg357c3F1e3+Eh4aAfHVxcnZ8gYWGgn12cXF1e4CEhYN+d3JydHp/g4aEf3p0cXN3fYKGhoF8dXFydXuBhIWCfXZxcXV7gISFg357c3J1e3+Eh4WAfHVxcnZ8gYWGgn12cA==",
  match: "data:audio/wav;base64,UklGRpQHAABXQVZFZm10IBAAAAABAAEARKwAAESsAAABAAgAZGF0YXAHAACAf31xeHN0cnJ0dXh7foOIi46PlJOSko+OjIqJiIeGhoWEg4KAfn17eHZ0cnBvbm1tbGxrbGxsbG1tb3BxcnR1d3h6e3x+f4CAgICAf39+fXx7enl4d3Z1dHNycXBvbm1sa2ppZ2ZlZGNiYmFhYWFhYWFiYmNjZGVmZ2hpamtsbW5vcHFyc3R1dXZ3d3h4eHl5eXl5eXl5eHh4d3d2dnV1dHRzc3JycXFwcG9vb25ubm5ubm5ubm9vb3BwcXFycnNzdHR1dXZ2dnd3eHh4eXl5eXl6enp6enp6enp6enp6enp5eXl5eXh4eHh4d3d3d3d2dnZ2dnV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV2dnZ2dnd3d3d3eHh4eHh5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eA==",
  noMatch: "data:audio/wav;base64,UklGRrQEAABXQVZFZm10IBAAAAABAAEARKwAAESsAAABAAgAZGF0YZAEAACAakI4MykoJB0bGhkaHB0gIywwOkBGTFJYXWJmaGlqaWhlYl5ZU01GPzgwKiQeGBMPCwkHBQQFBggLDhMYHiQqMTg/RkxSV1xiZmlsbW5ubGpnZGBcV1NNSEMrIAgAAIBqQjgzKSgkHRsaGRocHSAjLDA6QEZMUlhdYmZoaWppZmJeWVNNRj84MCoiHQ4IAACAakI4MykoJB0bGhkaHB0gIywwOkBGTFJYXWJmaGlqaWZiXllTTUY/ODAqIh0OCACAgGpCODMpKCQdGxoZGhwdICMsMDpARkxSWF1iZmhpamJdWlNNRj84MC==",
  gameOver: "data:audio/wav;base64,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",
  powerup: "data:audio/wav;base64,UklGRlQFAABXQVZFZm10IBAAAAABAAEARKwAAESsAAABAAgAZGF0YTAFAACAf3ZvZWZdVE9IRUJAQ0VJT1hic4SOmaSvuMHJ0NTa3uDe29bPx72xpJmMfm9hUkU5LSIZEQoGAwIEBwwTHCgzP0xZZ3aBkJ2qs73IztTY3N7e29fRycG4raOYjX5vYFJFOC0hGA8IBAEBBAkQGCQvO0dTYG13hpOeqrW/yc/V2dze3tzX0Mi/tqqfk4R0ZVdKPTEkGA0GAQAABQwWITA9SVZjcX6Lmaawu8XP1Nnc3t7c2NLKwbmuopeLfG1fUUQ3KyAVDQYCAAIGDhckMT5KV2RyfomXpq+5w83T1trd3dzY0szDu7CmlohzbF5QQzYqHxQMBQEAAQYOFyQxPkpXZHJ+iZemr7nDzdPW2t3d3NjSzMO7sKaWiHNsXlBDNiofFA0GAgABBg4XJDE+SldkcX6JlqWvucPM0tXZ3N3c2NLMw7uwppWHc2xeUEM2Kh8UDQYCAAEGDhckMT5KV2RxfomWpa65wsvR1Nnc3dzY0szDu7CmlYdzbF5QQzYqHxQNBgIAAQYOFyQxPkpXZHF+iZalrrnCy9HU2dzd3NjSzMO7sKaVh3NsXlBDNiofFA0GAgABBg4XJDE+SldkcX6JlqWuucLL0dTZ3N3c2NLMw7uwppWHc2xeUEM2Kh8UDQYCAAEGDhckMT5KV2RxfomWpa65wsvR1Nnc3dzY0szDu7CmlYdzbF5QQzYqHxQNBgIAAQYOFyQxPkpXZHF+iZalrrnCy9HU2dzd3NjSzMO7sKaVh3NsXlBDNiofFA0GAgABBg4XJDE+Sldkc"
};

const MemoryMatchBattle: React.FC<MemoryMatchBattleProps> = ({ difficulty: initialDifficulty, onExit, onComplete }) => {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(initialDifficulty || 'medium');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameState, setGameState] = useState<GameState>({
    player1Score: 0,
    player2Score: 0,
    currentPlayer: 'player1',
    cards: [],
    selectedCards: [],
    gameStatus: 'intro',
    winner: null,
    powerups: {
      player1: {
        freezeOpponent: 0,
        extraTurn: 0,
        revealCard: 0
      },
      player2: {
        freezeOpponent: 0,
        extraTurn: 0,
        revealCard: 0
      }
    },
    playerFrozen: null,
    turnTimeRemaining: 0,
    roundsPlayed: 0,
    totalMatches: 0,
    matchesFound: 0
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [confetti, setConfetti] = useState<{ x: number, y: number, color: string }[]>([]);

  // Audio effects
  const flipSound = useRef<HTMLAudioElement | null>(null);
  const matchSound = useRef<HTMLAudioElement | null>(null);
  const noMatchSound = useRef<HTMLAudioElement | null>(null);
  const gameOverSound = useRef<HTMLAudioElement | null>(null);
  const powerupSound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio with Base64 data instead of external files
    flipSound.current = new Audio(AUDIO_DATA.cardFlip);
    matchSound.current = new Audio(AUDIO_DATA.match);
    noMatchSound.current = new Audio(AUDIO_DATA.noMatch);
    gameOverSound.current = new Audio(AUDIO_DATA.gameOver);
    powerupSound.current = new Audio(AUDIO_DATA.powerup);

    // Set initial difficulty if provided as prop
    if (initialDifficulty) {
      setDifficulty(initialDifficulty);
    }

    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [initialDifficulty]);

  const playSound = (sound: HTMLAudioElement | null) => {
    if (sound && soundEnabled) {
      sound.currentTime = 0;
      sound.play().catch(e => console.error("Error playing sound:", e));
    }
  };

  const initializeGame = () => {
    const config = DIFFICULTY_CONFIG[difficulty];
    
    // 随机选择游戏缩略图作为卡片内容
    const shuffledThumbnails = shuffleArray([...GAME_THUMBNAILS]);
    let gameThumbnails = shuffledThumbnails.slice(0, config.pairsCount);
    
    // 创建卡片对
    let cardPairs: { value: string, imageSrc: string }[] = [];
    for (let i = 0; i < config.pairsCount; i++) {
      cardPairs.push(gameThumbnails[i]);
    }
    
    // 复制每张卡片创建配对并洗牌
    const allCards = [...cardPairs, ...cardPairs];
    const shuffledCards = shuffleArray(allCards);
    
    // 创建卡片对象
    const newCards: Card[] = shuffledCards.map((card, index) => ({
      id: index,
      value: card.value,
      imageSrc: card.imageSrc,
      isFlipped: false,
      isMatched: false,
      matchedBy: null
    }));
    
    // 初始化游戏状态
    setGameState({
      player1Score: 0,
      player2Score: 0,
      currentPlayer: 'player1',
      cards: newCards,
      selectedCards: [],
      gameStatus: 'playing',
      winner: null,
      powerups: {
        player1: {
          freezeOpponent: config.initialPowerups,
          extraTurn: config.initialPowerups,
          revealCard: config.initialPowerups
        },
        player2: {
          freezeOpponent: config.initialPowerups,
          extraTurn: config.initialPowerups,
          revealCard: config.initialPowerups
        }
      },
      playerFrozen: null,
      turnTimeRemaining: config.turnTime,
      roundsPlayed: 0,
      totalMatches: config.pairsCount,
      matchesFound: 0
    });
    
    // 启动计时器
    startTimer();
  };

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setGameState(prevState => {
        if (prevState.gameStatus !== 'playing') {
          return prevState;
        }
        
        const newTimeRemaining = prevState.turnTimeRemaining - 1;
        
        if (newTimeRemaining <= 0) {
          // Time's up - switch to next player
          const nextPlayer = prevState.currentPlayer === 'player1' ? 'player2' : 'player1';
          
          // Check if the next player is frozen
          const isNextPlayerFrozen = prevState.playerFrozen === nextPlayer;
          const actualNextPlayer = isNextPlayerFrozen ? prevState.currentPlayer : nextPlayer;
          
          // If the player was frozen, unfrozen them after this turn
          const newPlayerFrozen = isNextPlayerFrozen ? null : prevState.playerFrozen;
          
          return {
            ...prevState,
            selectedCards: [],
            currentPlayer: actualNextPlayer,
            playerFrozen: newPlayerFrozen,
            turnTimeRemaining: DIFFICULTY_CONFIG[difficulty].turnTime,
            roundsPlayed: prevState.roundsPlayed + 1
          };
        }
        
        return {
          ...prevState,
          turnTimeRemaining: newTimeRemaining
        };
      });
    }, 1000);
  };

  const handleCardClick = (card: Card) => {
    // 不允许点击游戏不在进行状态
    if (gameState.gameStatus !== 'playing') return;
    
    // 不允许点击已匹配或已翻开的卡片
    if (card.isMatched || card.isFlipped) return;
    
    // 不允许选择超过2张卡片
    if (gameState.selectedCards.length >= 2) return;
    
    playSound(flipSound.current);
    
    // 更新卡片为翻开状态
    const updatedCards = gameState.cards.map(c => 
      c.id === card.id ? { ...c, isFlipped: true } : c
    );
    
    // 添加卡片到已选卡片
    const updatedSelectedCards = [...gameState.selectedCards, card];
    
    // 检查是否已选择2张卡片
    if (updatedSelectedCards.length === 2) {
      const [first, second] = updatedSelectedCards;
      
      // 检查卡片是否匹配 - 现在比较value而不是直接比较值
      if (first.value === second.value) {
        // 创建匹配动画
        createConfetti();
        playSound(matchSound.current);
        
        // 更新匹配卡片
        const matchedCards = updatedCards.map(c => 
          (c.id === first.id || c.id === second.id) 
            ? { ...c, isMatched: true, matchedBy: gameState.currentPlayer } 
            : c
        );
        
        // 更新当前玩家分数
        const scoreUpdate = gameState.currentPlayer === 'player1' 
          ? { player1Score: gameState.player1Score + 1 } 
          : { player2Score: gameState.player2Score + 1 };
        
        // 检查是否所有匹配都已找到
        const newMatchesFound = gameState.matchesFound + 1;
        const isGameOver = newMatchesFound >= gameState.totalMatches;
        
        if (isGameOver) {
          playSound(gameOverSound.current);
          
          // 确定胜者
          let winner: 'player1' | 'player2' | 'tie' = 'tie';
          if (scoreUpdate.player1Score !== undefined && gameState.player2Score < scoreUpdate.player1Score) {
            winner = 'player1';
          } else if (gameState.player1Score < gameState.player2Score + 1) {
            winner = 'player2';
          }
          
          setGameState({
            ...gameState,
            ...scoreUpdate,
            cards: matchedCards,
            selectedCards: [],
            gameStatus: 'gameover',
            winner,
            matchesFound: newMatchesFound
          });
          
          // 停止计时器
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          
          // 游戏完成回调
          if (onComplete) {
            onComplete(Math.max(
              scoreUpdate.player1Score !== undefined ? scoreUpdate.player1Score : gameState.player1Score, 
              gameState.player2Score
            ), gameState.turnTimeRemaining);
          }
        } else {
          // 游戏继续，玩家因匹配成功获得额外回合
          setGameState({
            ...gameState,
            ...scoreUpdate,
            cards: matchedCards,
            selectedCards: [],
            turnTimeRemaining: DIFFICULTY_CONFIG[difficulty].turnTime,
            matchesFound: newMatchesFound
          });
        }
      } else {
        // 卡片不匹配
        playSound(noMatchSound.current);
        
        // 设置定时器翻回卡片并切换玩家
        setTimeout(() => {
          const resetCards = updatedCards.map(c => 
            (c.id === first.id || c.id === second.id) ? { ...c, isFlipped: false } : c
          );
          
          // 切换到另一名玩家
          const nextPlayer = gameState.currentPlayer === 'player1' ? 'player2' : 'player1';
          
          // 检查下一名玩家是否被冻结
          const isNextPlayerFrozen = gameState.playerFrozen === nextPlayer;
          const actualNextPlayer = isNextPlayerFrozen ? gameState.currentPlayer : nextPlayer;
          
          // 如果玩家被冻结，在此回合后解冻
          const newPlayerFrozen = isNextPlayerFrozen ? null : gameState.playerFrozen;
          
          // 处理额外回合道具
          const extraTurnPowerups = gameState.powerups[gameState.currentPlayer].extraTurn;
          const hasExtraTurn = extraTurnPowerups > 0;
          
          if (hasExtraTurn && !isNextPlayerFrozen) {
            // 使用额外回合道具
            const updatedPowerups = {
              ...gameState.powerups,
              [gameState.currentPlayer]: {
                ...gameState.powerups[gameState.currentPlayer],
                extraTurn: gameState.powerups[gameState.currentPlayer].extraTurn - 1
              }
            };
            
            setGameState({
              ...gameState,
              cards: resetCards,
              selectedCards: [],
              powerups: updatedPowerups,
              turnTimeRemaining: DIFFICULTY_CONFIG[difficulty].turnTime,
              roundsPlayed: gameState.roundsPlayed + 1
            });
            
            playSound(powerupSound.current);
          } else {
            setGameState({
              ...gameState,
              cards: resetCards,
              selectedCards: [],
              currentPlayer: actualNextPlayer,
              playerFrozen: newPlayerFrozen,
              turnTimeRemaining: DIFFICULTY_CONFIG[difficulty].turnTime,
              roundsPlayed: gameState.roundsPlayed + 1
            });
          }
        }, 1000);
        
        // 暂时保持卡片翻开
        setGameState({
          ...gameState,
          cards: updatedCards,
          selectedCards: updatedSelectedCards
        });
      }
    } else {
      // 只有一张卡片已翻开
      setGameState({
        ...gameState,
        cards: updatedCards,
        selectedCards: updatedSelectedCards
      });
    }
  };

  const applyPowerup = (powerupType: 'freezeOpponent' | 'extraTurn' | 'revealCard') => {
    const currentPlayer = gameState.currentPlayer;
    
    // Check if player has this powerup available
    if (gameState.powerups[currentPlayer][powerupType] <= 0) return;
    
    playSound(powerupSound.current);
    
    // Handle each powerup type
    if (powerupType === 'freezeOpponent') {
      const opponent = currentPlayer === 'player1' ? 'player2' : 'player1';
      
      setGameState({
        ...gameState,
        playerFrozen: opponent,
        powerups: {
          ...gameState.powerups,
          [currentPlayer]: {
            ...gameState.powerups[currentPlayer],
            freezeOpponent: gameState.powerups[currentPlayer].freezeOpponent - 1
          }
        }
      });
    } 
    else if (powerupType === 'revealCard') {
      // Reveal a random unmatched card temporarily
      const unmatchedCards = gameState.cards.filter(card => !card.isMatched && !card.isFlipped);
      
      if (unmatchedCards.length > 0) {
        const randomCard = unmatchedCards[Math.floor(Math.random() * unmatchedCards.length)];
        
        const updatedCards = gameState.cards.map(card => 
          card.id === randomCard.id ? { ...card, isFlipped: true } : card
        );
        
        setGameState({
          ...gameState,
          cards: updatedCards,
          powerups: {
            ...gameState.powerups,
            [currentPlayer]: {
              ...gameState.powerups[currentPlayer],
              revealCard: gameState.powerups[currentPlayer].revealCard - 1
            }
          }
        });
        
        // Hide the card after 1.5 seconds
        setTimeout(() => {
          setGameState(prevState => ({
            ...prevState,
            cards: prevState.cards.map(card => 
              card.id === randomCard.id && !card.isMatched ? { ...card, isFlipped: false } : card
            )
          }));
        }, 1500);
      }
    }
    else if (powerupType === 'extraTurn') {
      // Extra turn is handled when player fails to match
      setGameState({
        ...gameState,
        powerups: {
          ...gameState.powerups,
          [currentPlayer]: {
            ...gameState.powerups[currentPlayer],
            extraTurn: gameState.powerups[currentPlayer].extraTurn - 1
          }
        }
      });
    }
  };

  const createConfetti = () => {
    const newConfetti = [];
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    
    for (let i = 0; i < 50; i++) {
      newConfetti.push({
        x: Math.random() * 100,
        y: Math.random() * 20,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    
    setConfetti(newConfetti);
    
    // Remove confetti after animation
    setTimeout(() => setConfetti([]), 3000);
  };

  const pauseGame = () => {
    setGameState({
      ...gameState,
      gameStatus: 'paused'
    });
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const resumeGame = () => {
    setGameState({
      ...gameState,
      gameStatus: 'playing'
    });
    
    startTimer();
  };

  const exitGame = () => {
    if (onExit) onExit();
  };

  const playAgain = () => {
    setGameState({
      ...gameState,
      gameStatus: 'intro'
    });
  };

  const changeDifficulty = (newDifficulty: 'easy' | 'medium' | 'hard') => {
    setDifficulty(newDifficulty);
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };
  
  // Render the game based on current state
  const renderIntro = () => (
    <div className="intro-screen">
      <h2>Memory Match Battle</h2>
      <div className="difficulty-buttons">
        <button 
          className={`difficulty-btn ${difficulty === 'easy' ? 'selected' : ''}`}
          onClick={() => changeDifficulty('easy')}
        >
          Easy
        </button>
        <button 
          className={`difficulty-btn ${difficulty === 'medium' ? 'selected' : ''}`}
          onClick={() => changeDifficulty('medium')}
        >
          Medium
        </button>
        <button 
          className={`difficulty-btn ${difficulty === 'hard' ? 'selected' : ''}`}
          onClick={() => changeDifficulty('hard')}
        >
          Hard
        </button>
      </div>
      <div className="difficulty-description">
        {difficulty === 'easy' && 'Find 8 pairs of cards in a 4x4 grid. 15 seconds per turn.'}
        {difficulty === 'medium' && 'Find 18 pairs of cards in a 6x6 grid. 10 seconds per turn.'}
        {difficulty === 'hard' && 'Find 18 pairs of cards in a 6x6 grid. Only 8 seconds per turn.'}
      </div>
      <button className="start-btn" onClick={initializeGame}>Start Game</button>
    </div>
  );

  const renderPaused = () => (
    <div className="paused-overlay">
      <div className="paused-content">
        <h2>Game Paused</h2>
        <button className="resume-button" onClick={resumeGame}>Resume Game</button>
      </div>
    </div>
  );

  const renderGameOver = () => (
    <div className="game-over-overlay">
      <div className="game-over-content">
        <h2>Game Over</h2>
        <div className="final-scores">
          <div className="final-player-score">
            <h3>Player 1</h3>
            <p>{gameState.player1Score}</p>
          </div>
          <div className="final-player-score">
            <h3>Player 2</h3>
            <p>{gameState.player2Score}</p>
          </div>
        </div>
        <div className="winner">
          {gameState.winner === 'player1' && 'Player 1 Wins!'}
          {gameState.winner === 'player2' && 'Player 2 Wins!'}
          {gameState.winner === 'tie' && "It's a Tie!"}
        </div>
        <div>
          <button className="play-again-btn" onClick={playAgain}>Play Again</button>
          <button className="exit-btn" onClick={exitGame}>Exit</button>
        </div>
      </div>
    </div>
  );

  const renderGameplay = () => (
    <>
      <div className="stats-panel">
        {/* Player scores */}
        <div className="player-scores">
          <div className={`player-score ${gameState.currentPlayer === 'player1' ? 'current-player-indicator' : ''}`}>
            <h3>Player 1</h3>
            <p className="score">{gameState.player1Score}</p>
            {gameState.playerFrozen === 'player1' && <span className="frozen-indicator">Frozen</span>}
          </div>
          <div className={`player-score ${gameState.currentPlayer === 'player2' ? 'current-player-indicator' : ''}`}>
            <h3>Player 2</h3>
            <p className="score">{gameState.player2Score}</p>
            {gameState.playerFrozen === 'player2' && <span className="frozen-indicator">Frozen</span>}
          </div>
        </div>
        
        {/* Game stats */}
        <div className="game-stats">
          <div className="stat-item">
            <h4>Matches Found</h4>
            <p>{gameState.matchesFound} / {gameState.totalMatches}</p>
          </div>
          <div className="stat-item">
            <h4>Rounds Played</h4>
            <p>{gameState.roundsPlayed}</p>
          </div>
        </div>
        
        {/* Powerups */}
        <div className="powerups-container">
          <h4>Powerups</h4>
          <div className="powerups-list">
            {gameState.powerups[gameState.currentPlayer].freezeOpponent > 0 && (
              <button 
                className="powerup-btn" 
                onClick={() => applyPowerup('freezeOpponent')}
              >
                Freeze Opponent ({gameState.powerups[gameState.currentPlayer].freezeOpponent})
              </button>
            )}
            {gameState.powerups[gameState.currentPlayer].extraTurn > 0 && (
              <button 
                className="powerup-btn" 
                onClick={() => applyPowerup('extraTurn')}
              >
                Extra Turn ({gameState.powerups[gameState.currentPlayer].extraTurn})
              </button>
            )}
            {gameState.powerups[gameState.currentPlayer].revealCard > 0 && (
              <button 
                className="powerup-btn" 
                onClick={() => applyPowerup('revealCard')}
              >
                Reveal Card ({gameState.powerups[gameState.currentPlayer].revealCard})
              </button>
            )}
            {Object.values(gameState.powerups[gameState.currentPlayer]).every(count => count === 0) && (
              <div className="no-powerups">No powerups available</div>
            )}
          </div>
        </div>
      </div>
      
      <div className="main-content">
        <div className="control-buttons">
          <button className="control-btn" onClick={toggleSound}>
            {soundEnabled ? '🔊' : '🔇'}
          </button>
          <button className="control-btn" onClick={exitGame}>
            ❌
          </button>
        </div>
        
        <div className="pause-button" onClick={pauseGame}>
          ⏸️
        </div>
        
        <div className="current-player">
          <h3>{gameState.currentPlayer === 'player1' ? 'Player 1' : 'Player 2'}'s Turn</h3>
          <div className="turn-timer">
            <div className="timer-label">
              <span>Time remaining</span>
              <span>{gameState.turnTimeRemaining}s</span>
            </div>
            <div className="timer-bar">
              <div 
                className="timer-progress" 
                style={{ 
                  width: `${(gameState.turnTimeRemaining / DIFFICULTY_CONFIG[difficulty].turnTime) * 100}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className={`battle-grid difficulty-${difficulty}`}>
          {gameState.cards.map(card => (
            <div 
              key={card.id}
              className={`battle-card ${card.isFlipped ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''} ${card.matchedBy ? `${card.matchedBy}-matched` : ''}`}
              onClick={() => handleCardClick(card)}
            >
              <div className="battle-card-inner">
                <div className="battle-card-front">?</div>
                <div className="battle-card-back">
                  <img src={card.imageSrc} alt={card.value} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div className="memory-match-battle">
      {gameState.gameStatus === 'intro' && renderIntro()}
      
      {gameState.gameStatus === 'playing' && renderGameplay()}
      
      {gameState.gameStatus === 'paused' && (
        <>
          {renderGameplay()}
          {renderPaused()}
        </>
      )}
      
      {gameState.gameStatus === 'gameover' && (
        <>
          {renderGameplay()}
          {renderGameOver()}
        </>
      )}
      
      {/* Confetti effect */}
      {confetti.length > 0 && (
        <div className="confetti-container">
          {confetti.map((conf, index) => (
            <div
              key={index}
              className="confetti"
              style={{
                left: `${conf.x}%`,
                top: `${conf.y}%`,
                backgroundColor: conf.color
              }}
            ></div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MemoryMatchBattle; 