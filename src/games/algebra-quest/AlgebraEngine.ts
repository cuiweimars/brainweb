export interface AlgebraProblem {
  question: string;
  answer: number | string;
  type: 'linear' | 'quadratic' | 'system' | 'inequality';
  difficulty: 'easy' | 'medium' | 'hard';
  hints?: string[];
}

export function generateProblem(difficulty: 'easy' | 'medium' | 'hard'): AlgebraProblem {
  switch (difficulty) {
    case 'easy':
      return generateLinearProblem('easy');
    case 'medium':
      // Mix of linear and easier quadratic problems
      return Math.random() > 0.5 ? generateLinearProblem('medium') : generateQuadraticProblem('medium');
    case 'hard':
      // Mix of harder problems
      const type = Math.random();
      if (type < 0.3) return generateLinearProblem('hard');
      if (type < 0.6) return generateQuadraticProblem('hard');
      if (type < 0.8) return generateSystemProblem();
      return generateInequalityProblem();
    default:
      return generateLinearProblem('medium');
  }
}

export function checkAnswer(problem: AlgebraProblem, userAnswer: string | number): boolean {
  // Convert both to strings and trim for comparison
  const correctAnswer = problem.answer.toString().trim();
  const userAnswerStr = userAnswer.toString().trim();
  
  // Basic string comparison (could be enhanced for mathematical equivalence)
  return correctAnswer === userAnswerStr;
}

// Helper functions to generate different problem types
function generateLinearProblem(difficulty: 'easy' | 'medium' | 'hard'): AlgebraProblem {
  let a: number, b: number, answer: number;
  let hints: string[] = [];

  switch (difficulty) {
    case 'easy':
      a = Math.floor(Math.random() * 10) + 1;
      b = Math.floor(Math.random() * 20);
      answer = Math.floor(b / a);
      hints = [
        "Divide both sides by the coefficient of x",
        "Isolate the variable on one side"
      ];
      return {
        question: `${a}x = ${a * answer}`,
        answer,
        type: 'linear',
        difficulty,
        hints
      };
    case 'medium':
      a = Math.floor(Math.random() * 10) + 1;
      b = Math.floor(Math.random() * 50);
      const c = Math.floor(Math.random() * 10) + 1;
      answer = (b - c) / a;
      hints = [
        "Move all constants to the right side",
        "Combine like terms first",
        "Divide both sides by the coefficient of x"
      ];
      return {
        question: `${a}x + ${c} = ${b}`,
        answer,
        type: 'linear',
        difficulty,
        hints
      };
    case 'hard':
      a = Math.floor(Math.random() * 10) + 1;
      b = Math.floor(Math.random() * 20) + 1;
      const d = Math.floor(Math.random() * 30);
      const e = Math.floor(Math.random() * 20);
      answer = (d - e) / (a - b);
      hints = [
        "Group the variables on one side",
        "Combine like terms",
        "Factor out the variable",
        "Divide both sides by the coefficient"
      ];
      return {
        question: `${a}x - ${e} = ${b}x + ${d - e - b * answer}`,
        answer,
        type: 'linear',
        difficulty,
        hints
      };
  }
}

function generateQuadraticProblem(difficulty: 'easy' | 'medium' | 'hard'): AlgebraProblem {
  // For simplicity, we'll generate problems with integer solutions
  let a: number, b: number, c: number, r1: number, r2: number;
  let hints: string[] = [];

  switch (difficulty) {
    case 'medium':
      r1 = Math.floor(Math.random() * 5);
      r2 = Math.floor(Math.random() * 5);
      a = 1;
      b = -(r1 + r2);
      c = r1 * r2;
      hints = [
        "This is a quadratic equation that can be factored",
        "Find two numbers that multiply to give c and add to give b",
        "Set each factor equal to zero to find x"
      ];
      return {
        question: `x² ${b >= 0 ? '+' : ''}${b}x ${c >= 0 ? '+' : ''}${c} = 0`,
        answer: `x = ${r1}, x = ${r2}`,
        type: 'quadratic',
        difficulty,
        hints
      };
    case 'hard':
      r1 = Math.floor(Math.random() * 10) - 5;
      r2 = Math.floor(Math.random() * 10) - 5;
      a = Math.floor(Math.random() * 3) + 1;
      b = -a * (r1 + r2);
      c = a * r1 * r2;
      hints = [
        "First divide all terms by the coefficient of x²",
        "Try to factor the quadratic",
        "If not easily factored, use the quadratic formula",
        "x = (-b ± √(b² - 4ac)) / 2a"
      ];
      return {
        question: `${a}x² ${b >= 0 ? '+' : ''}${b}x ${c >= 0 ? '+' : ''}${c} = 0`,
        answer: `x = ${r1}, x = ${r2}`,
        type: 'quadratic',
        difficulty,
        hints
      };
    default:
      return generateLinearProblem('medium');
  }
}

function generateSystemProblem(): AlgebraProblem {
  // Generate a simple 2x2 system with integer solutions
  const x = Math.floor(Math.random() * 10) - 5;
  const y = Math.floor(Math.random() * 10) - 5;
  
  // Generate coefficients
  const a1 = Math.floor(Math.random() * 5) + 1;
  const b1 = Math.floor(Math.random() * 5) + 1;
  const c1 = a1 * x + b1 * y;
  
  const a2 = Math.floor(Math.random() * 5) + 1;
  const b2 = Math.floor(Math.random() * 5) + 1;
  const c2 = a2 * x + b2 * y;
  
  return {
    question: `Solve the system:\n${a1}x + ${b1}y = ${c1}\n${a2}x + ${b2}y = ${c2}`,
    answer: `x = ${x}, y = ${y}`,
    type: 'system',
    difficulty: 'hard',
    hints: [
      "You can use substitution or elimination",
      "Try to isolate one variable in one equation",
      "Substitute that expression into the other equation",
      "Solve for the remaining variable, then back-substitute"
    ]
  };
}

function generateInequalityProblem(): AlgebraProblem {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 20);
  const answer = b / a;
  
  const inequalityType = Math.random() > 0.5 ? '>' : '<';
  
  return {
    question: `${a}x ${inequalityType} ${b}`,
    answer: `x ${inequalityType} ${answer}`,
    type: 'inequality',
    difficulty: 'hard',
    hints: [
      "Divide both sides by the coefficient of x",
      "Remember that when dividing by a negative number, the inequality sign flips direction",
      "Express your answer in the form 'x < number' or 'x > number'"
    ]
  };
}