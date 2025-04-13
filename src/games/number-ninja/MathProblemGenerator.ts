export interface MathProblem {
    question: string;
    answer: number;
    options: number[];
  }
  
  export type Difficulty = 'easy' | 'medium' | 'hard';
  
  export default class MathProblemGenerator {
    generateProblem(difficulty: Difficulty): MathProblem {
      switch (difficulty) {
        case 'easy':
          return this.generateEasyProblem();
        case 'medium':
          return this.generateMediumProblem();
        case 'hard':
          return this.generateHardProblem();
        default:
          return this.generateMediumProblem();
      }
    }
  
    private generateEasyProblem(): MathProblem {
      const operation = Math.random() < 0.7 ? '+' : '-';
      let num1, num2, answer;
  
      if (operation === '+') {
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        answer = num1 + num2;
      } else {
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * num1) + 1;
        answer = num1 - num2;
      }
  
      return {
        question: `${num1} ${operation} ${num2}`,
        answer,
        options: this.generateOptions(answer, 10)
      };
    }
  
    private generateMediumProblem(): MathProblem {
      const operations = ['+', '-', '×'];
      const operation = operations[Math.floor(Math.random() * operations.length)];
      let num1, num2, answer;
  
      if (operation === '+') {
        num1 = Math.floor(Math.random() * 20) + 10;
        num2 = Math.floor(Math.random() * 20) + 10;
        answer = num1 + num2;
      } else if (operation === '-') {
        num1 = Math.floor(Math.random() * 30) + 20;
        num2 = Math.floor(Math.random() * 20) + 1;
        answer = num1 - num2;
      } else {
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 5) + 1;
        answer = num1 * num2;
      }
  
      return {
        question: `${num1} ${operation} ${num2}`,
        answer,
        options: this.generateOptions(answer, 20)
      };
    }
  
    private generateHardProblem(): MathProblem {
      const operations = ['+', '-', '×', '÷'];
      const operation = operations[Math.floor(Math.random() * operations.length)];
      let num1, num2, answer;
  
      if (operation === '+') {
        num1 = Math.floor(Math.random() * 50) + 30;
        num2 = Math.floor(Math.random() * 50) + 30;
        answer = num1 + num2;
      } else if (operation === '-') {
        num1 = Math.floor(Math.random() * 100) + 50;
        num2 = Math.floor(Math.random() * 50) + 1;
        answer = num1 - num2;
      } else if (operation === '×') {
        num1 = Math.floor(Math.random() * 12) + 1;
        num2 = Math.floor(Math.random() * 12) + 1;
        answer = num1 * num2;
      } else {
        // Division: ensure that the division results in an integer
        num2 = Math.floor(Math.random() * 10) + 1;
        const multiplier = Math.floor(Math.random() * 10) + 1;
        num1 = num2 * multiplier;
        answer = multiplier;
      }
  
      return {
        question: `${num1} ${operation} ${num2}`,
        answer,
        options: this.generateOptions(answer, 50)
      };
    }
  
    private generateOptions(answer: number, range: number): number[] {
      const options = [answer];
      
      while (options.length < 4) {
        let option: number;
        const randomFactor = Math.random();
        
        if (randomFactor < 0.3) {
          // Close to answer
          option = answer + (Math.floor(Math.random() * 5) + 1) * (Math.random() < 0.5 ? 1 : -1);
        } else if (randomFactor < 0.6) {
          // Transposed digits or common mistake
          option = this.generateCommonMistake(answer);
        } else {
          // Random number within range
          option = Math.floor(Math.random() * range * 2) - range + answer;
        }
        
        // Ensure option is not duplicate and not negative
        if (!options.includes(option) && option >= 0) {
          options.push(option);
        }
      }
      
      // Shuffle options
      return options.sort(() => Math.random() - 0.5);
    }
  
    private generateCommonMistake(answer: number): number {
      // Examples of common mistakes:
      // 1. Transposing digits (e.g., 12 -> 21)
      // 2. Off by 1 or 10 errors
      // 3. Missing a digit
      
      if (answer >= 10) {
        const answerStr = answer.toString();
        if (answerStr.length >= 2) {
          // Transpose two digits
          const transposed = answerStr.split('').reverse().join('');
          return parseInt(transposed);
        }
      }
      
      // Off by 10
      return answer + 10;
    }
  }