﻿import { 
  memoryHtmlGames, 
  focusHtmlGames, 
  logicHtmlGames, 
  mathHtmlGames, 
  languageHtmlGames,
  allHtmlGames 
} from './htmlGames';

// 导入图片路径
import memoryMatchImg from '../images/memory-training/memory-match.jpg';
import focusMasterImg from '../images/focus-training/focus-master.jpg';

import brainPuzzleImg from '../images/logic-puzzles/brain-puzzle-master.jpg';
import mathChallengeImg from '../images/math-challenges/math-challenge.jpg';
import wordConnectionsImg from '../images/language-skills/word-connections.jpg';
import sequenceRecallImg from '../images/memory-training/sequence-recall.jpg';
import pictureMemoryImg from '../images/memory-training/picture-memory.jpg';
import memoryPathImg from '../images/memory-training/memory-path.jpg';
import defaultGameImg from '../images/default-game.jpg';
import wordScrambleImg from '../assets/images/word-scramble.jpg';
import attentionTestImg from '../assets/images/attention-test.jpg';
import patternRecognitionImg from '../assets/images/pattern-recognition.jpg';
import logicPuzzleImg from '../assets/images/logic-puzzle.jpg';
import spatialMemoryImg from '../images/memory-training/spatial-memory.jpg';

export interface Game {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  rating: number;
  playCount?: number;
  isOnline?: boolean;
  isNew?: boolean;
  duration?: string;
  createdAt?: string;
  howToPlay?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export const categories: Category[] = [ { id: 'MemoryTraining', name: 'Memory Training', icon: '', count: 12 + memoryHtmlGames.length }, { id: 'focus-training', name: 'Focus Training', icon: '', count: 8 + focusHtmlGames.length }, { id: 'logic-puzzles', name: 'Logic Puzzles', icon: '', count: 15 + logicHtmlGames.length }, { id: 'math-challenges', name: 'Math Challenges', icon: '', count: 10 + mathHtmlGames.length }, { id: 'language-skills', name: 'Language Skills', icon: '', count: 7 + languageHtmlGames.length } ];


export const featuredGames: Game[] = [
  {
    id: 'memory-match',
    title: 'Memory Match Pro',
    description: 'Enhance your memory skills with this engaging card-matching game. Perfect for improving concentration and pattern recognition.',
    thumbnailUrl: memoryMatchImg,
    category: 'MemoryTraining',
    difficulty: 'medium',
    rating: 4.7,
    howToPlay: 'memory_match_pro_instructions'
  },
  {
    id: 'math-challenge',
    title: 'Math Challenge Elite',
    description: 'Master numerical skills with dynamic math challenges. Features adaptive difficulty and real-time performance tracking.',
    thumbnailUrl: mathChallengeImg,
    category: 'math-challenges',
    difficulty: 'hard',
    rating: 4.5,
  },
  {
    id: 'word-connections',
    title: 'Word Connections Plus',
    description: 'Expand your vocabulary through engaging word association challenges. Perfect for language learners and word enthusiasts.',
    thumbnailUrl: wordConnectionsImg,
    category: 'language-skills',
    difficulty: 'easy',
    rating: 4.2,
  },
  {
    id: 'attention-test',
    title: 'Focus Master',
    description: 'Train your concentration with scientifically-designed attention exercises. Track your progress and improve focus.',
    thumbnailUrl: focusMasterImg,
    category: 'focus-training',
    difficulty: 'medium',
    rating: 4.8,
  },
];

export const gameOfTheDay: Game = {
  id: 'brain-puzzle-master',
  title: 'Brain Puzzle Master',
  description: 'Experience the ultimate brain training challenge. This comprehensive game combines memory, attention, logic, and math exercises in an engaging package. Features daily puzzles that adapt to your skill level.',
  thumbnailUrl: 'https://via.placeholder.com/800x400?text=Brain+Puzzle+Master',
  category: 'logic-puzzles',
  difficulty: 'medium',
  rating: 4.9,
  playCount: 12548,
};

export const newGames: Game[] = [
  {
    id: 'logic-puzzle',
    title: 'Logic Puzzle Pro',
    description: 'Challenge your critical thinking with sophisticated puzzle challenges. Features multiple difficulty levels and detailed solutions.',
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=Logic+Puzzle',
    category: 'logic-puzzles',
    difficulty: 'hard',
    rating: 4.3,
    isNew: true,
    duration: '5-10 min',
    createdAt: '2023-04-01T00:00:00.000Z'
  },
  {
    id: 'pattern-recognition',
    title: 'Pattern Recognition Plus',
    description: 'Train your brain to identify and complete complex visual patterns. Perfect for improving spatial awareness and pattern recognition skills.',
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=Pattern+Recognition',
    category: 'focus-training',
    difficulty: 'medium',
    rating: 4.6,
    isNew: true,
    duration: '3-7 min',
    createdAt: '2023-04-05T00:00:00.000Z'
  },
  {
    id: 'speed-calculation',
    title: 'Speed Calculation Elite',
    description: 'Boost your mental arithmetic skills with timed mathematical challenges. Features progressive difficulty and performance analytics.',
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=Speed+Calculation',
    category: 'math-challenges',
    difficulty: 'medium',
    rating: 4.4,
    isNew: true,
    duration: '2-5 min',
    createdAt: '2023-04-10T00:00:00.000Z'
  },
  {
    id: 'vocabulary-builder',
    title: 'Vocabulary Builder Pro',
    description: 'Enhance your language skills through engaging word association games. Features comprehensive word lists and learning progress tracking.',
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=Vocabulary+Builder',
    category: 'language-skills',
    difficulty: 'easy',
    rating: 4.1,
    isNew: true,
    duration: '4-8 min',
    createdAt: '2023-04-15T00:00:00.000Z'
  },
  {
    id: 'memory-matrix',
    title: 'Memory Matrix 3D',
    description: 'Challenge your spatial memory with this innovative 3D memory game. Remember patterns and sequences in three-dimensional space.',
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=Memory+Matrix',
    category: 'MemoryTraining',
    difficulty: 'hard',
    rating: 4.7,
    isNew: true,
    duration: '5-12 min',
    createdAt: '2023-04-20T00:00:00.000Z'
  },
  {
    id: 'focus-trainer',
    title: 'Advanced Focus Trainer',
    description: 'Train your concentration with increasing difficulty levels. Track progress and compete with friends to improve attention span.',
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=Focus+Trainer',
    category: 'focus-training',
    difficulty: 'medium',
    rating: 4.5,
    isNew: true,
    duration: '10-15 min',
    createdAt: '2023-04-25T00:00:00.000Z'
  },
  {
    id: 'logic-grid',
    title: 'Logic Grid Puzzles',
    description: 'Solve complex logic grid puzzles that require deductive reasoning. Perfect for improving logical thinking and problem-solving skills.',
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=Logic+Grid',
    category: 'logic-puzzles',
    difficulty: 'hard',
    rating: 4.8,
    isNew: true,
    duration: '15-20 min',
    createdAt: '2023-05-01T00:00:00.000Z'
  },
  {
    id: 'math-genius',
    title: 'Math Genius Trainer',
    description: 'Enhance your mathematical abilities with advanced arithmetic and algebraic challenges. Features customizable difficulty levels.',
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=Math+Genius',
    category: 'math-challenges',
    difficulty: 'hard',
    rating: 4.6,
    isNew: true,
    duration: '5-15 min',
    createdAt: '2023-05-05T00:00:00.000Z'
  },
  {
    id: 'word-chains',
    title: 'Word Chains Challenge',
    description: 'Build vocabulary with word association chains. Connect words based on relationships and expand your language skills.',
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=Word+Chains',
    category: 'language-skills',
    difficulty: 'medium',
    rating: 4.4,
    isNew: true,
    duration: '3-8 min',
    createdAt: '2023-05-10T00:00:00.000Z'
  },
  {
    id: 'neuro-booster',
    title: 'Neuro Booster',
    description: 'A comprehensive brain training suite that combines multiple cognitive exercises into one progressive program.',
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=Neuro+Booster',
    category: 'focus-training',
    difficulty: 'medium',
    rating: 4.9,
    isNew: true,
    duration: '10-20 min',
    createdAt: '2023-05-15T00:00:00.000Z'
  },
  {
    id: 'concentration-master',
    title: 'Concentration Master',
    description: '训练你的选择性注意力和反应速度。通过选择性地点击指定目标，同时忽略干扰项来提高专注力和反应能力',
    thumbnailUrl: focusMasterImg,
    category: 'focus-training',
    difficulty: 'medium',
    rating: 4.6,
    isNew: true,
    duration: '3-5 min',
    createdAt: new Date().toISOString()
  },
];

export const limitedGames: Game[] = [
  {
    id: 'limited_defense',
    title: 'Tower Defense Elite',
    description: 'Experience the ultimate tower defense challenge with unique gameplay mechanics and strategic depth.',
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=Tower+Defense',
    category: 'tower_defense',
    difficulty: 'medium',
    rating: 4.8,
  },
  {
    id: 'street-life',
    title: 'Urban Life Simulator',
    description: 'Immerse yourself in a realistic city simulation with dynamic events and character development.',
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=Urban+Life',
    category: 'simulation',
    difficulty: 'medium',
    rating: 4.6,
  },
  {
    id: 'heroes-of-wasteland',
    title: 'Wasteland Heroes',
    description: 'Embark on an epic post-apocalyptic adventure with unique characters and branching storylines.',
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=Wasteland+Heroes',
    category: 'adventure',
    difficulty: 'hard',
    rating: 4.9,
  },
  {
    id: 'teacher-simulator',
    title: 'Teacher Life Simulator',
    description: 'Experience the challenges and rewards of teaching in this engaging life simulation game.',
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=Teacher+Life',
    category: 'simulation',
    difficulty: 'easy',
    rating: 4.2,
  },
];

export const gameCategories: Category[] = [
  { id: 'two-player', name: 'Two-Player Games', icon: '👥', count: 24 },
  { id: 'action', name: 'Action Games', icon: '🎯', count: 36 },
  { id: 'adventure', name: 'Adventure Games', icon: '', count: 28 },
  { id: 'basketball', name: 'Basketball Games', icon: '🏀', count: 15 },
  { id: 'car', name: 'Racing Games', icon: '🚗', count: 32 },
  { id: 'card', name: 'Card Games', icon: '🃏', count: 20 },
  { id: 'puzzle', name: 'Puzzle Games', icon: '🧩', count: 40 },
  { id: 'shooting', name: 'Shooting Games', icon: '🎯', count: 26 },
  { id: 'sports', name: 'Sports Games', icon: '🏅', count: 30 },
  { id: 'tower-defense', name: 'Tower Defense', icon: '🏰', count: 18 }
];

export const originalGames: Game[] = [
  {
    id: 'space-waves',
    title: 'Space Waves',
    description: 'Navigate through cosmic waves in this unique space exploration game. Collect energy and unlock new abilities.',
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=Space+Waves',
    category: 'action',
    difficulty: 'medium',
    rating: 4.7,
  },
  {
    id: 'sky-riders',
    title: 'Sky Riders',
    description: 'Race through dynamic cloud formations in this innovative air racing game. Customize your vehicle and compete in thrilling events.',
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=Sky+Riders',
    category: 'racing',
    difficulty: 'medium',
    rating: 4.5,
  },
  {
    id: 'cubes-2048',
    title: 'Cubes 2048',
    description: 'Experience the classic 2048 game in 3D with multiplayer support. Challenge friends and climb the global leaderboard.',
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=Cubes+2048',
    category: 'puzzle',
    difficulty: 'easy',
    rating: 4.6,
  },
  {
    id: 'escape-prison',
    title: 'Prison Escape',
    description: 'Team up with friends in this cooperative escape game. Use strategy and teamwork to break free from a high-security facility.',
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=Prison+Escape',
    category: 'multiplayer',
    difficulty: 'hard',
    rating: 4.8,
  },
];

export const multiplayerGames: Game[] = [
  {
    id: 'word-duel',
    title: 'Word Duel',
    description: 'Challenge friends to intense vocabulary battles. Features multiple game modes and real-time competition.',
    thumbnailUrl: wordConnectionsImg,
    category: 'language-skills',
    difficulty: 'medium',
    rating: 4.6,
    isOnline: true,
  },
  {
    id: 'math-race',
    title: 'Math Race',
    description: 'Compete in fast-paced mathematical challenges. Solve equations quickly and climb the global rankings.',
    thumbnailUrl: mathChallengeImg,
    category: 'math-challenges',
    difficulty: 'medium',
    rating: 4.5,
    isOnline: true,
  },
  {
    id: 'memory-match-battle',
    title: 'Memory Match Battle',
    description: 'Test your memory against friends in this exciting multiplayer card game. Perfect for local multiplayer fun.',
    thumbnailUrl: memoryMatchImg,
    category: 'MemoryTraining',
    difficulty: 'easy',
    rating: 4.3,
    isOnline: false,
  },
  {
    id: 'puzzle-challenge',
    title: 'Puzzle Challenge Network',
    description: 'Connect with puzzle enthusiasts worldwide and compete in various logic challenges. Features daily tournaments and custom puzzles.',
    thumbnailUrl: brainPuzzleImg,
    category: 'logic-puzzles',
    difficulty: 'hard',
    rating: 4.7,
    isOnline: true,
  },
];

export const recentlyPlayedGames: Game[] = [
  {
    id: 'memory-match',
    title: 'Memory Match Pro',
    description: 'Enhance your memory skills with this engaging card-matching game. Perfect for improving concentration and pattern recognition.',
    thumbnailUrl: memoryMatchImg,
    category: 'MemoryTraining',
    difficulty: 'medium',
    rating: 4.7,
    playCount: 12,
  },
  {
    id: 'brain-puzzle-master',
    title: 'Brain Puzzle Master',
    description: 'Experience the ultimate brain training challenge. This comprehensive game combines memory, attention, logic, and math exercises in an engaging package.',
    thumbnailUrl: brainPuzzleImg,
    category: 'logic-puzzles',
    difficulty: 'medium',
    rating: 4.9,
    playCount: 8,
  },
  {
    id: 'focus-master',
    title: 'Focus Master',
    description: 'Train your concentration with scientifically-designed attention exercises. Track your progress and improve focus.',
    thumbnailUrl: focusMasterImg,
    category: 'focus-training',
    difficulty: 'medium',
    rating: 4.8,
    playCount: 15,
  },
  {
    id: 'math-challenge',
    title: 'Math Challenge Elite',
    description: 'Master numerical skills with dynamic math challenges. Features adaptive difficulty and real-time performance tracking.',
    thumbnailUrl: mathChallengeImg,
    category: 'math-challenges',
    difficulty: 'hard',
    rating: 4.5,
    playCount: 7,
  },
  {
    id: 'word-connections',
    title: 'Word Connections Plus',
    description: 'Expand your vocabulary through engaging word association challenges. Perfect for language learners and word enthusiasts.',
    thumbnailUrl: wordConnectionsImg,
    category: 'language-skills',
    difficulty: 'easy',
    rating: 4.2,
    playCount: 10,
  },
  {
    id: 'pattern-recognition',
    title: 'Pattern Recognition Plus',
    description: 'Train your brain to identify and complete complex visual patterns. Perfect for improving spatial awareness and pattern recognition skills.',
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=Pattern+Recognition',
    category: 'focus-training',
    difficulty: 'medium',
    rating: 4.6,
    playCount: 5,
  },
  {
    id: 'memory-match-battle',
    title: 'Memory Match Battle',
    description: 'Test your memory against friends in this exciting multiplayer card game. Perfect for local multiplayer fun.',
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=Memory+Match+Battle',
    category: 'MemoryTraining',
    difficulty: 'easy',
    rating: 4.3,
    playCount: 3,
  },
  {
    id: 'logic-puzzle',
    title: 'Logic Puzzle Pro',
    description: 'Challenge your critical thinking with sophisticated puzzle challenges. Features multiple difficulty levels and detailed solutions.',
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=Logic+Puzzle',
    category: 'logic-puzzles',
    difficulty: 'hard',
    rating: 4.3,
    playCount: 6,
  },
  {
    id: 'vocabulary-builder',
    title: 'Vocabulary Builder Pro',
    description: 'Enhance your language skills through engaging word association games. Features comprehensive word lists and learning progress tracking.',
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=Vocabulary+Builder',
    category: 'language-skills',
    difficulty: 'easy',
    rating: 4.1,
    playCount: 9,
  },
  {
    id: 'speed-calculation',
    title: 'Speed Calculation Elite',
    description: 'Boost your mental arithmetic skills with timed mathematical challenges. Features progressive difficulty and performance analytics.',
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=Speed+Calculation',
    category: 'math-challenges',
    difficulty: 'medium',
    rating: 4.4,
    playCount: 4,
  }
];

export const trendingGames: Game[] = [
  {
    id: 'focus-master',
    title: 'Focus Master',
    description: 'Train your concentration with scientifically-designed attention exercises. Track your progress and improve focus.',
    thumbnailUrl: focusMasterImg,
    category: 'focus-training',
    difficulty: 'medium',
    rating: 4.8,
    playCount: 15784,
  },
  {
    id: 'brain-puzzle-master',
    title: 'Brain Puzzle Master',
    description: 'Experience the ultimate brain training challenge. This comprehensive game combines memory, attention, logic, and math exercises in an engaging package.',
    thumbnailUrl: brainPuzzleImg,
    category: 'logic-puzzles',
    difficulty: 'medium',
    rating: 4.9,
    playCount: 12548,
  },
  {
    id: 'memory-match',
    title: 'Memory Match Pro',
    description: 'Enhance your memory skills with this engaging card-matching game. Perfect for improving concentration and pattern recognition.',
    thumbnailUrl: memoryMatchImg,
    category: 'MemoryTraining',
    difficulty: 'medium',
    rating: 4.7,
    playCount: 10932,
  },
  {
    id: 'word-connections',
    title: 'Word Connections Plus',
    description: 'Expand your vocabulary through engaging word association challenges. Perfect for language learners and word enthusiasts.',
    thumbnailUrl: wordConnectionsImg,
    category: 'language-skills',
    difficulty: 'easy',
    rating: 4.2,
    playCount: 9721,
  },
  {
    id: 'math-challenge',
    title: 'Math Challenge Elite',
    description: 'Master numerical skills with dynamic math challenges. Features adaptive difficulty and real-time performance tracking.',
    thumbnailUrl: mathChallengeImg,
    category: 'math-challenges',
    difficulty: 'hard',
    rating: 4.5,
    playCount: 8654,
  },
  {
    id: 'word-duel',
    title: 'Word Duel',
    description: 'Challenge friends to intense vocabulary battles. Features multiple game modes and real-time competition.',
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=Word+Duel',
    category: 'language-skills',
    difficulty: 'medium',
    rating: 4.6,
    playCount: 7842,
  },
  {
    id: 'logic-puzzle',
    title: 'Logic Puzzle Pro',
    description: 'Challenge your critical thinking with sophisticated puzzle challenges. Features multiple difficulty levels and detailed solutions.',
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=Logic+Puzzle',
    category: 'logic-puzzles',
    difficulty: 'hard',
    rating: 4.3,
    playCount: 7215,
  },
  {
    id: 'pattern-recognition',
    title: 'Pattern Recognition Plus',
    description: 'Train your brain to identify and complete complex visual patterns. Perfect for improving spatial awareness and pattern recognition skills.',
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=Pattern+Recognition',
    category: 'focus-training',
    difficulty: 'medium',
    rating: 4.6,
    playCount: 6543,
  },
  {
    id: 'vocabulary-builder',
    title: 'Vocabulary Builder Pro',
    description: 'Enhance your language skills through engaging word association games. Features comprehensive word lists and learning progress tracking.',
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=Vocabulary+Builder',
    category: 'language-skills',
    difficulty: 'easy',
    rating: 4.1,
    playCount: 5879,
  },
  {
    id: 'speed-calculation',
    title: 'Speed Calculation Elite',
    description: 'Boost your mental arithmetic skills with timed mathematical challenges. Features progressive difficulty and performance analytics.',
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=Speed+Calculation',
    category: 'math-challenges',
    difficulty: 'medium',
    rating: 4.4,
    playCount: 5421,
  }
];

// Add additional games for each category
export const categoryGames: Game[] = [
  // Memory Training Games
  {
    id: 'memory-match-pro-plus',
    title: 'Memory Match Pro Plus',
    description: 'An advanced version of Memory Match with more cards, levels, themes, and special features like hints and time bonuses.',
    thumbnailUrl: memoryMatchImg,
    category: 'MemoryTraining',
    difficulty: 'medium',
    rating: 4.6,
    playCount: 8500,
    howToPlay: 'memory_match_pro_plus_instructions'
  },
  {
    id: 'sequence-recall',
    title: 'Sequence Recall',
    description: 'Test and improve your memory by recalling increasingly complex sequences of colors, numbers, and patterns.',
    thumbnailUrl: sequenceRecallImg,
    category: 'MemoryTraining',
    difficulty: 'medium',
    rating: 4.4,
    playCount: 6200,
  },
  {
    id: 'spatial-memory',
    title: 'Spatial Memory Challenge',
    description: 'Train your spatial memory by remembering the position of objects in increasingly complex arrangements.',
    thumbnailUrl: pictureMemoryImg,
    category: 'MemoryTraining',
    difficulty: 'hard',
    rating: 4.7,
    playCount: 5100,
  },
  
  // Focus Training Games
  {
    id: 'attention-zone',
    title: 'Attention Zone',
    description: 'Sharpen your focus by identifying specific targets while ignoring distractions in rapidly changing scenes.',
    thumbnailUrl: focusMasterImg,
    category: 'focus-training',
    difficulty: 'hard',
    rating: 4.5,
    playCount: 5800,
  },
  {
    id: 'concentration-master',
    title: 'Concentration Master',
    description: 'Maintain focus on multiple tasks simultaneously with increasing difficulty levels and time constraints.',
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=Concentration+Master',
    category: 'focus-training',
    difficulty: 'medium',
    rating: 4.3,
    playCount: 4900,
  },
  {
    id: 'focus-reflex',
    title: 'Focus Reflex',
    description: 'Improve your reaction time and attention with rapid stimulus-response exercises and challenges.',
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=Focus+Reflex',
    category: 'focus-training',
    difficulty: 'easy',
    rating: 4.4,
    playCount: 6700,
  },
  
  // Logic Puzzles Games
  {
    id: 'logic-grid',
    title: 'Logic Grid Master',
    description: 'Solve complex logic grid puzzles that challenge your deductive reasoning and critical thinking skills.',
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=Logic+Grid',
    category: 'logic-puzzles',
    difficulty: 'hard',
    rating: 4.7,
    playCount: 5300,
  },
  {
    id: 'pattern-solver',
    title: 'Pattern Solver',
    description: 'Identify and complete complex patterns using logical reasoning and analytical thinking.',
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=Pattern+Solver',
    category: 'logic-puzzles',
    difficulty: 'medium',
    rating: 4.5,
    playCount: 4800,
  },
  {
    id: 'syllogism-challenge',
    title: 'Syllogism Challenge',
    description: 'Test your logical reasoning with syllogism puzzles that require careful analysis and deduction.',
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=Syllogism+Challenge',
    category: 'logic-puzzles',
    difficulty: 'hard',
    rating: 4.6,
    playCount: 3900,
  },
  
  // Math Challenges Games
  {
    id: 'arithmetic-adventure',
    title: 'Arithmetic Adventure',
    description: 'Journey through a world where math puzzles unlock new areas and challenges with progressive difficulty.',
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=Arithmetic+Adventure',
    category: 'math-challenges',
    difficulty: 'medium',
    rating: 4.5,
    playCount: 6100,
  },
  {
    id: 'number-ninja',
    title: 'Number Ninja',
    description: 'Slice through number puzzles with lightning speed in this fast-paced mathematical challenge game.',
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=Number+Ninja',
    category: 'math-challenges',
    difficulty: 'easy',
    rating: 4.7,
    playCount: 7200,
  },
  {
    id: 'algebra-quest',
    title: 'Algebra Quest',
    description: 'Master algebraic concepts through engaging puzzles and challenges designed for all skill levels.',
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=Algebra+Quest',
    category: 'math-challenges',
    difficulty: 'hard',
    rating: 4.4,
    playCount: 4300,
  },
  
  // Language Skills Games
  {
    id: 'word-wizard',
    title: 'Word Wizard',
    description: 'Expand your vocabulary and spelling skills with magical word-building challenges and puzzles.',
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=Word+Wizard',
    category: 'language-skills',
    difficulty: 'medium',
    rating: 4.6,
    playCount: 6400,
  },
  {
    id: 'synonym-match',
    title: 'Synonym Match',
    description: 'Test and improve your knowledge of word relationships by matching synonyms in timed challenges.',
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=Synonym+Match',
    category: 'language-skills',
    difficulty: 'medium',
    rating: 4.3,
    playCount: 5500,
  },
  {
    id: 'grammar-guardian',
    title: 'Grammar Guardian',
    description: 'Defend against grammar mistakes and improve your language skills with fun, interactive challenges.',
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=Grammar+Guardian',
    category: 'language-skills',
    difficulty: 'hard',
    rating: 4.5,
    playCount: 4700,
  }
];

// 获取游戏图片的辅助函数
export function getGameImage(game: Game): string {
  // 如果是占位图片URL，则替换为默认图片
  if (typeof game.thumbnailUrl === 'string' && game.thumbnailUrl.includes('via.placeholder.com')) {
    return defaultGameImg;
  }
  return game.thumbnailUrl;
}

// 使用本地图片替换所有占位图片
const processGameImages = (games: Game[]): Game[] => {
  return games.map(game => ({
    ...game,
    thumbnailUrl: getGameImage(game)
  }));
};


// 合并所有游戏并去除重复�?
const mergeGames = (): Game[] => {
  const allGameArrays = [...categoryGames, ...limitedGames, ...featuredGames, ...trendingGames, ...recentlyPlayedGames, ...multiplayerGames, ...allHtmlGames];
  const uniqueGames: { [key: string]: Game } = {};
  
  allGameArrays.forEach(game => {
    // 如果游戏已存在，选择评分最高的版本或最新添加的版本
    if (!uniqueGames[game.id] || uniqueGames[game.id].rating < game.rating) {
      uniqueGames[game.id] = game;
    }
  });
  
  return Object.values(uniqueGames);
};

// 所有游戏导出时先合并去重，再处理图�?
export const allGames = processGameImages(mergeGames());

// 汇总所有游戏（包括HTML小游戏）
export const totalGames = allGames.length;

// 导出处理过图片的游戏数组
export const featuredGamesWithImages = processGameImages(featuredGames);
export const trendingGamesWithImages = processGameImages(trendingGames);
export const recentlyPlayedGamesWithImages = processGameImages(recentlyPlayedGames);
export const multiplayerGamesWithImages = processGameImages(multiplayerGames);
export const categoryGamesWithImages = processGameImages(categoryGames);
export const limitedGamesWithImages = processGameImages(limitedGames);
export const originalGamesWithImages = processGameImages(originalGames);
export const newGamesWithImages = processGameImages(newGames);
export const gameOfTheDayWithImages = processGameImages([gameOfTheDay]); 
