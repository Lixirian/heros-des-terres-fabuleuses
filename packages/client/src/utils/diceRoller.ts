export function rollDie(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export function roll2d6(): [number, number] {
  return [rollDie(), rollDie()];
}

export function rollTotal(): { dice: [number, number]; total: number } {
  const dice = roll2d6();
  return { dice, total: dice[0] + dice[1] };
}

export interface SkillTestResult {
  dice: [number, number];
  diceTotal: number;
  skillValue: number;
  bonus: number;
  total: number;
  difficulty: number;
  success: boolean;
}

export function skillTest(
  skillValue: number,
  difficulty: number,
  bonus: number = 0
): SkillTestResult {
  const dice = roll2d6();
  const diceTotal = dice[0] + dice[1];
  const total = diceTotal + skillValue + bonus;
  return {
    dice,
    diceTotal,
    skillValue,
    bonus,
    total,
    difficulty,
    success: total >= difficulty,
  };
}
