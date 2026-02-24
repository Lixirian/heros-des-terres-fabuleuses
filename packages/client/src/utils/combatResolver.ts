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
  winner: 'player' | 'enemy' | 'fled' | null;
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

/**
 * Calcule le bonus de bénédiction pour un combat.
 * Règles officielles Fabled Lands :
 * - Certaines bénédictions donnent +1 au combat ou à la défense
 * - Les bénédictions divines peuvent permettre une relance
 */
export function getBlessingBonus(character: Character): { combat: number; defence: number; canReroll: boolean } {
  let combatBonus = 0;
  let defenceBonus = 0;
  let canReroll = false;

  for (const blessing of character.blessings) {
    const lower = blessing.toLowerCase();
    // Bénédictions de combat (dieu de la guerre, force, etc.)
    if (lower.includes('combat') || lower.includes('guerre') || lower.includes('force') ||
        lower.includes('valor') || lower.includes('vaillance')) {
      combatBonus += 1;
    }
    // Bénédictions de protection
    if (lower.includes('protection') || lower.includes('défense') || lower.includes('bouclier') ||
        lower.includes('armure') || lower.includes('garde')) {
      defenceBonus += 1;
    }
    // Bénédictions de chance / relance
    if (lower.includes('chance') || lower.includes('fortune') || lower.includes('destin') ||
        lower.includes('relance') || lower.includes('faveur')) {
      canReroll = true;
    }
  }

  return { combat: combatBonus, defence: defenceBonus, canReroll };
}

export function resolveRound(
  character: Character,
  enemy: Enemy,
  state: CombatState
): CombatState {
  if (state.finished) return state;

  const blessingBonus = getBlessingBonus(character);

  // Attaque du joueur : 2d6 + COMBAT + bonus arme + bonus bénédiction
  const playerRoll = roll2d6();
  const combatBonus = getEquipmentBonus(character, 'combat');
  const playerAttack = playerRoll[0] + playerRoll[1] + character.combat + combatBonus + blessingBonus.combat;

  // Attaque de l'ennemi : 2d6 + COMBAT ennemi
  const enemyRoll = roll2d6();
  const enemyAttack = enemyRoll[0] + enemyRoll[1] + enemy.combat;

  // Dégâts : score d'attaque - DÉFENSE de la cible (minimum 0)
  const defenceBonus = getEquipmentBonus(character, 'defence');
  const totalPlayerDefence = character.defence + defenceBonus + blessingBonus.defence;
  const playerDamage = Math.max(0, enemyAttack - totalPlayerDefence);
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

/**
 * Résout une fuite : l'ennemi a une attaque gratuite (le joueur ne riposte pas).
 * Règle officielle : en fuyant, l'ennemi frappe une dernière fois sans riposte.
 */
export function resolveFlee(
  character: Character,
  enemy: Enemy,
  state: CombatState
): CombatState {
  if (state.finished) return state;

  const blessingBonus = getBlessingBonus(character);

  // L'ennemi attaque une dernière fois
  const enemyRoll = roll2d6();
  const enemyAttack = enemyRoll[0] + enemyRoll[1] + enemy.combat;

  // Le joueur subit les dégâts (pas de riposte)
  const defenceBonus = getEquipmentBonus(character, 'defence');
  const totalPlayerDefence = character.defence + defenceBonus + blessingBonus.defence;
  const playerDamage = Math.max(0, enemyAttack - totalPlayerDefence);
  const newPlayerStamina = Math.max(0, state.playerStamina - playerDamage);

  const round: CombatRound = {
    round: state.rounds.length + 1,
    playerRoll: [0, 0],  // Le joueur ne lance pas les dés (fuite)
    playerTotal: 0,
    playerDamage: 0,
    enemyRoll,
    enemyTotal: enemyAttack,
    enemyDamage: playerDamage,
    playerStamina: newPlayerStamina,
    enemyStamina: state.enemyStamina,
    isFlee: true,
  };

  return {
    playerStamina: newPlayerStamina,
    enemyStamina: state.enemyStamina,
    rounds: [...state.rounds, round],
    finished: true,
    winner: 'fled',
  };
}
