import { Profession, CharacterStats } from './types';

export interface ProfessionData {
  name: Profession;
  nameFr: string;
  description: string;
  primaryStats: string[];
  startingEquipment: { name: string; type: 'arme' | 'armure' | 'objet'; bonus?: { stat: string; value: number } }[];
}

export const professions: ProfessionData[] = [
  {
    name: 'Guerrier',
    nameFr: 'Guerrier',
    description: 'Maître des armes et du combat, le guerrier excelle sur le champ de bataille.',
    primaryStats: ['combat', 'scouting'],
    startingEquipment: [
      { name: 'Épée', type: 'arme', bonus: { stat: 'combat', value: 1 } },
      { name: 'Bouclier en cuir', type: 'armure', bonus: { stat: 'defence', value: 1 } },
    ],
  },
  {
    name: 'Mage',
    nameFr: 'Mage',
    description: 'Spécialiste des arts arcanes, le mage manipule les forces magiques.',
    primaryStats: ['magic', 'charisma'],
    startingEquipment: [
      { name: 'Bâton runique', type: 'arme', bonus: { stat: 'magic', value: 1 } },
      { name: 'Amulette protectrice', type: 'objet' },
    ],
  },
  {
    name: 'Prêtre',
    nameFr: 'Prêtre',
    description: 'Serviteur des dieux, le prêtre canalise la puissance divine.',
    primaryStats: ['sanctity', 'charisma'],
    startingEquipment: [
      { name: 'Masse sacrée', type: 'arme' },
      { name: 'Symbole sacré', type: 'objet', bonus: { stat: 'sanctity', value: 1 } },
    ],
  },
  {
    name: 'Voleur',
    nameFr: 'Voleur',
    description: "Expert en infiltration et en larcins, le voleur vit dans l'ombre.",
    primaryStats: ['thievery', 'scouting'],
    startingEquipment: [
      { name: 'Dague', type: 'arme' },
      { name: "Outils de crochetage", type: 'objet', bonus: { stat: 'thievery', value: 1 } },
    ],
  },
  {
    name: 'Troubadour',
    nameFr: 'Troubadour',
    description: 'Artiste et conteur, le troubadour charme par ses mots et sa musique.',
    primaryStats: ['charisma', 'thievery'],
    startingEquipment: [
      { name: 'Rapière', type: 'arme' },
      { name: 'Luth enchanté', type: 'objet', bonus: { stat: 'charisma', value: 1 } },
    ],
  },
  {
    name: 'Voyageur',
    nameFr: 'Voyageur',
    description: 'Explorateur infatigable, le voyageur connaît les secrets des terres sauvages.',
    primaryStats: ['scouting', 'thievery'],
    startingEquipment: [
      { name: 'Arc court', type: 'arme' },
      { name: "Bottes d'éclaireur", type: 'objet', bonus: { stat: 'scouting', value: 1 } },
    ],
  },
];

// Official stats tables by profession and rank range
export type RankRange = '1-2' | '3-4' | '5-6' | '7-8' | '9-10';

export const statsTable: Record<Profession, Record<RankRange, CharacterStats>> = {
  Guerrier: {
    '1-2': { combat: 5, charisma: 2, magic: 1, sanctity: 1, scouting: 4, thievery: 1, defence: 4, stamina: 9 },
    '3-4': { combat: 6, charisma: 3, magic: 1, sanctity: 2, scouting: 5, thievery: 2, defence: 6, stamina: 14 },
    '5-6': { combat: 7, charisma: 4, magic: 2, sanctity: 2, scouting: 6, thievery: 3, defence: 8, stamina: 19 },
    '7-8': { combat: 8, charisma: 5, magic: 3, sanctity: 3, scouting: 7, thievery: 4, defence: 10, stamina: 24 },
    '9-10': { combat: 9, charisma: 6, magic: 3, sanctity: 3, scouting: 8, thievery: 5, defence: 12, stamina: 29 },
  },
  Mage: {
    '1-2': { combat: 2, charisma: 3, magic: 5, sanctity: 1, scouting: 2, thievery: 1, defence: 3, stamina: 8 },
    '3-4': { combat: 3, charisma: 4, magic: 6, sanctity: 2, scouting: 3, thievery: 2, defence: 5, stamina: 12 },
    '5-6': { combat: 4, charisma: 5, magic: 7, sanctity: 2, scouting: 4, thievery: 3, defence: 7, stamina: 16 },
    '7-8': { combat: 5, charisma: 6, magic: 8, sanctity: 3, scouting: 5, thievery: 3, defence: 9, stamina: 20 },
    '9-10': { combat: 5, charisma: 7, magic: 9, sanctity: 3, scouting: 6, thievery: 4, defence: 11, stamina: 24 },
  },
  'Prêtre': {
    '1-2': { combat: 3, charisma: 2, magic: 1, sanctity: 5, scouting: 1, thievery: 1, defence: 4, stamina: 9 },
    '3-4': { combat: 4, charisma: 3, magic: 2, sanctity: 6, scouting: 2, thievery: 1, defence: 6, stamina: 13 },
    '5-6': { combat: 5, charisma: 4, magic: 2, sanctity: 7, scouting: 3, thievery: 2, defence: 8, stamina: 17 },
    '7-8': { combat: 5, charisma: 5, magic: 3, sanctity: 8, scouting: 4, thievery: 2, defence: 10, stamina: 22 },
    '9-10': { combat: 6, charisma: 6, magic: 3, sanctity: 9, scouting: 5, thievery: 3, defence: 12, stamina: 27 },
  },
  Voleur: {
    '1-2': { combat: 3, charisma: 2, magic: 1, sanctity: 1, scouting: 4, thievery: 5, defence: 3, stamina: 8 },
    '3-4': { combat: 4, charisma: 3, magic: 1, sanctity: 1, scouting: 5, thievery: 6, defence: 5, stamina: 12 },
    '5-6': { combat: 5, charisma: 4, magic: 2, sanctity: 2, scouting: 6, thievery: 7, defence: 7, stamina: 16 },
    '7-8': { combat: 6, charisma: 4, magic: 2, sanctity: 2, scouting: 7, thievery: 8, defence: 9, stamina: 20 },
    '9-10': { combat: 7, charisma: 5, magic: 3, sanctity: 3, scouting: 8, thievery: 9, defence: 11, stamina: 24 },
  },
  Troubadour: {
    '1-2': { combat: 2, charisma: 5, magic: 2, sanctity: 1, scouting: 1, thievery: 4, defence: 3, stamina: 8 },
    '3-4': { combat: 3, charisma: 6, magic: 3, sanctity: 2, scouting: 2, thievery: 5, defence: 5, stamina: 12 },
    '5-6': { combat: 4, charisma: 7, magic: 3, sanctity: 2, scouting: 3, thievery: 6, defence: 7, stamina: 16 },
    '7-8': { combat: 5, charisma: 8, magic: 4, sanctity: 3, scouting: 4, thievery: 7, defence: 9, stamina: 20 },
    '9-10': { combat: 5, charisma: 9, magic: 4, sanctity: 3, scouting: 5, thievery: 8, defence: 11, stamina: 24 },
  },
  Voyageur: {
    '1-2': { combat: 4, charisma: 1, magic: 1, sanctity: 1, scouting: 5, thievery: 3, defence: 4, stamina: 9 },
    '3-4': { combat: 5, charisma: 2, magic: 1, sanctity: 2, scouting: 6, thievery: 4, defence: 6, stamina: 13 },
    '5-6': { combat: 6, charisma: 3, magic: 2, sanctity: 2, scouting: 7, thievery: 5, defence: 8, stamina: 17 },
    '7-8': { combat: 7, charisma: 4, magic: 2, sanctity: 3, scouting: 8, thievery: 6, defence: 10, stamina: 22 },
    '9-10': { combat: 8, charisma: 5, magic: 3, sanctity: 3, scouting: 9, thievery: 6, defence: 12, stamina: 27 },
  },
};
