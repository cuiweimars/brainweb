import { Game } from "./mockData";

// 导入图片
import memoryCardsImg from '../images/memory-training/memory-cards.jpg';
import sequenceRecallImg from '../images/memory-training/sequence-recall.jpg';
import pictureMemoryImg from '../images/memory-training/picture-memory.jpg';
import memoryPathImg from '../images/memory-training/memory-path.jpg';
import defaultGameImg from '../images/default-game.jpg';


// 获取游戏图片的辅助函数
function getDefaultImage(): string {
  return defaultGameImg;
}


// 记忆力游戏 (Memory Training)
export const memoryHtmlGames: Game[] = [
  {
    id: 'memory-cards',
    title: 'Memory Cards',
    description: 'Classic memory matching game. Flip cards and match identical patterns. Exercises visual memory and attention.',
    thumbnailUrl: memoryCardsImg,
    category: 'MemoryTraining',
    difficulty: 'easy',
    rating: 4.6,
    duration: '3-5 min',
    isNew: true,
    createdAt: '2023-09-01T00:00:00.000Z',
    howToPlay: 'memory_cards_instructions'
  }
];


// 专注力游戏 (Focus Training)
export const focusHtmlGames: Game[] = [];


// 逻辑谜题 (Logic Puzzles)
export const logicHtmlGames: Game[] = [];


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
