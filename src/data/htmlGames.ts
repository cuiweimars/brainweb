import defaultGameImg from '../images/default-game.jpg';
import { Game } from './mockData';

// 导入图片
import sequenceRecallImg from '../images/memory-training/sequence-recall.jpg';
import pictureMemoryImg from '../images/memory-training/picture-memory.jpg';
import memoryPathImg from '../images/memory-training/memory-path.jpg';


// 获取游戏图片的辅助函数
function getDefaultImage(): string {
  return defaultGameImg;
}


// 记忆力游戏 (Memory Training)
export const memoryHtmlGames: Game[] = [];


// 专注力游戏 (Focus Training)
export const focusHtmlGames: Game[] = [
  {
    id: 'attention-zone',
    title: 'Attention Zone',
    description: 'Test your visual memory and attention. Remember highlighted squares and click on their positions after they disappear.',
    thumbnailUrl: getDefaultImage(),
    category: 'FocusTraining',
    difficulty: 'medium',
    rating: 4.7,
    duration: '2-3 min',
    isNew: true,
    createdAt: '2023-10-15T00:00:00.000Z',
    howToPlay: 'attention_zone_instructions'
  }
];


// 逻辑谜题 (Logic Puzzles)
export const logicHtmlGames: Game[] = [
  {
    id: 'syllogism-challenge',
    title: 'Syllogism Challenge',
    description: 'Test your logical reasoning with syllogism puzzles that require careful analysis and deduction.',
    thumbnailUrl: getDefaultImage(),
    category: 'LogicPuzzles',
    difficulty: 'medium',
    rating: 4.5,
    duration: '5-10 min',
    isNew: true,
    createdAt: '2023-12-01T00:00:00.000Z',
    howToPlay: 'syllogism_challenge_instructions'
  },
  {
    id: 'brain-puzzle-master',
    title: 'Brain Puzzle Master',
    description: 'Challenge your brain with a variety of puzzles including pattern recognition, mathematical reasoning, verbal problems, and visual puzzles.',
    thumbnailUrl: getDefaultImage(),
    category: 'LogicPuzzles',
    difficulty: 'medium',
    rating: 4.7,
    duration: '8-12 min',
    isNew: true,
    createdAt: '2024-01-15T00:00:00.000Z',
    howToPlay: 'brain_puzzle_master_instructions'
  },
  {
    id: 'connection-paths',
    title: 'Connection Paths',
    description: 'Draw paths to connect matching endpoints while avoiding crossings in this challenging spatial reasoning puzzle.',
    thumbnailUrl: getDefaultImage(),
    category: 'LogicPuzzles',
    difficulty: 'medium',
    rating: 4.8,
    duration: '5-8 min',
    isNew: true,
    createdAt: '2024-05-01T00:00:00.000Z',
    howToPlay: 'connection_paths_instructions'
  }
];


// 数学挑战 (Math Challenges)
export const mathHtmlGames: Game[] = [];


// 语言技能 (Language Skills)
export const languageHtmlGames: Game[] = [];


// 组合所有HTML游戏
export const allHtmlGames: Game[] = [
  ...memoryHtmlGames,
  ...focusHtmlGames,
  ...logicHtmlGames,
  ...mathHtmlGames,
  ...languageHtmlGames
];
