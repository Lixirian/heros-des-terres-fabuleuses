export type Profession = 'Guerrier' | 'Mage' | 'Prêtre' | 'Voleur' | 'Troubadour' | 'Voyageur';

export interface CharacterStats {
  combat: number;
  charisma: number;
  magic: number;
  sanctity: number;
  scouting: number;
  thievery: number;
  defence: number;
  stamina: number;
}

export interface Character {
  id?: number;
  user_id?: number;
  name: string;
  profession: Profession;
  rank: number;
  stamina: number;
  max_stamina: number;
  defence: number;
  money: number;
  combat: number;
  charisma: number;
  magic: number;
  sanctity: number;
  scouting: number;
  thievery: number;
  god?: string;
  blessings: string[];
  titles: string[];
  equipment: EquipmentItem[];
  codewords: string[];
  notes: string;
  is_pregen: boolean;
  pregen_id?: string;
  portrait?: string;
  backstory?: string;
}

export interface EquipmentItem {
  name: string;
  type: 'arme' | 'armure' | 'objet';
  bonus?: { stat: string; value: number };
  description?: string;
}

export interface BookData {
  id: number;
  title: string;
  titleFr: string;
  region: string;
  color: string;
  colorAccent: string;
  maxCode: number;
  description: string;
}

export interface PregenCharacter extends Omit<Character, 'id' | 'user_id'> {
  pregen_id: string;
  books: number[];
  description: string;
}

export interface CombatRound {
  round: number;
  playerRoll: number[];
  playerTotal: number;
  playerDamage: number;
  enemyRoll: number[];
  enemyTotal: number;
  enemyDamage: number;
  playerStamina: number;
  enemyStamina: number;
  isFlee?: boolean;
}
