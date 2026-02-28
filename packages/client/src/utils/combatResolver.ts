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
 * Règles officielles Fabled Lands :
 * Les bénédictions sont des RELANCES à usage unique, PAS des bonus permanents.
 * - "Combat" → relance un jet de combat raté
 * - "Chance" → relance n'importe quel jet raté
 * - "Défense par la foi" → seule bénédiction qui améliore la Défense (+1)
 */

/** Mapping bénédiction → stat pour la relance */
const blessingRerollMap: Record<string, string> = {
  'Combat': 'combat',
  'Charisme': 'charisma',
  'Magie': 'magic',
  'Piété': 'sanctity',
  'Exploration': 'scouting',
  'Adresse': 'thievery',
};

/** Vérifie si le personnage peut relancer un jet pour une compétence donnée */
export function getAvailableReroll(character: Character, stat: string): string | null {
  // Bénédiction spécifique à la compétence
  for (const [blessing, bStat] of Object.entries(blessingRerollMap)) {
    if (bStat === stat && character.blessings.includes(blessing)) {
      return blessing;
    }
  }
  // Bénédiction de Chance (relance universelle)
  if (character.blessings.includes('Chance')) {
    return 'Chance';
  }
  return null;
}

/** Bonus de défense passif des bénédictions (seule "Défense par la foi" s'applique) */
export function getBlessingDefenceBonus(character: Character): number {
  return character.blessings.includes('Défense par la foi') ? 1 : 0;
}

export function resolveRound(
  character: Character,
  enemy: Enemy,
  state: CombatState
): CombatState {
  if (state.finished) return state;

  const defFaithBonus = getBlessingDefenceBonus(character);

  // Attaque du joueur : 2d6 + COMBAT + bonus arme
  const playerRoll = roll2d6();
  const combatBonus = getEquipmentBonus(character, 'combat');
  const playerAttack = playerRoll[0] + playerRoll[1] + character.combat + combatBonus;

  // Attaque de l'ennemi : 2d6 + COMBAT ennemi
  const enemyRoll = roll2d6();
  const enemyAttack = enemyRoll[0] + enemyRoll[1] + enemy.combat;

  // Dégâts : score d'attaque - DÉFENSE de la cible (minimum 0)
  const defenceBonus = getEquipmentBonus(character, 'defence');
  const totalPlayerDefence = character.defence + defenceBonus + defFaithBonus;
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

  const defFaithBonus = getBlessingDefenceBonus(character);

  // L'ennemi attaque une dernière fois
  const enemyRoll = roll2d6();
  const enemyAttack = enemyRoll[0] + enemyRoll[1] + enemy.combat;

  // Le joueur subit les dégâts (pas de riposte)
  const defenceBonus = getEquipmentBonus(character, 'defence');
  const totalPlayerDefence = character.defence + defenceBonus + defFaithBonus;
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
