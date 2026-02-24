import { roll2d6 } from './diceRoller';
import { Character, CombatRound } from '../data/types';

export interface Enemy {
  name: string;
  combat: number;
  defence: number;
  stamina: number;
}

export interface CombatState {
  playerStamina: number;
  enemyStamina: number;
  rounds: CombatRound[];
  finished: boolean;
  winner: 'player' | 'enemy' | null;
}

export function initCombat(character: Character, enemy: Enemy): CombatState {
  return {
    playerStamina: character.stamina,
    enemyStamina: enemy.stamina,
    rounds: [],
    finished: false,
    winner: null,
  };
}

export function getEquipmentBonus(character: Character, stat: string): number {
  return character.equipment.reduce((sum, item) => {
    if (item.bonus && item.bonus.stat === stat) return sum + item.bonus.value;
    return sum;
  }, 0);
}

export function resolveRound(
  character: Character,
  enemy: Enemy,
  state: CombatState
): CombatState {
  if (state.finished) return state;

  const playerRoll = roll2d6();
  const combatBonus = getEquipmentBonus(character, 'combat');
  const playerAttack = playerRoll[0] + playerRoll[1] + character.combat + combatBonus;

  const enemyRoll = roll2d6();
  const enemyAttack = enemyRoll[0] + enemyRoll[1] + enemy.combat;

  // Damage: attack score - target defence, minimum 0
  const defenceBonus = getEquipmentBonus(character, 'defence');
  const playerDamage = Math.max(0, enemyAttack - (character.defence + defenceBonus));
  const enemyDamage = Math.max(0, playerAttack - enemy.defence);

  const newPlayerStamina = Math.max(0, state.playerStamina - playerDamage);
  const newEnemyStamina = Math.max(0, state.enemyStamina - enemyDamage);

  const round: CombatRound = {
    round: state.rounds.length + 1,
    playerRoll,
    playerTotal: playerAttack,
    playerDamage: enemyDamage,
    enemyRoll,
    enemyTotal: enemyAttack,
    enemyDamage: playerDamage,
    playerStamina: newPlayerStamina,
    enemyStamina: newEnemyStamina,
  };

  const finished = newPlayerStamina <= 0 || newEnemyStamina <= 0;
  const winner = finished
    ? newEnemyStamina <= 0
      ? 'player'
      : 'enemy'
    : null;

  return {
    playerStamina: newPlayerStamina,
    enemyStamina: newEnemyStamina,
    rounds: [...state.rounds, round],
    finished,
    winner,
  };
}
