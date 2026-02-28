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
      { name: 'Hache de guerre', type: 'arme' },
      { name: 'Gilet en cuir', type: 'armure', bonus: { stat: 'defence', value: 1 } },
    ],
  },
  {
    name: 'Mage',
    nameFr: 'Mage',
    description: 'Spécialiste des arts arcanes, le mage manipule les forces magiques.',
    primaryStats: ['magic', 'scouting'],
    startingEquipment: [
      { name: 'Bâton', type: 'arme' },
      { name: 'Gilet en cuir', type: 'armure', bonus: { stat: 'defence', value: 1 } },
    ],
  },
  {
    name: 'Prêtre',
    nameFr: 'Prêtre',
    description: 'Serviteur des dieux, le prêtre canalise la puissance divine.',
    primaryStats: ['sanctity', 'charisma'],
    startingEquipment: [
      { name: 'Gourdin', type: 'arme' },
      { name: 'Gilet en cuir', type: 'armure', bonus: { stat: 'defence', value: 1 } },
    ],
  },
  {
    name: 'Voleur',
    nameFr: 'Voleur',
    description: "Expert en infiltration et en larcins, le voleur vit dans l'ombre.",
    primaryStats: ['thievery', 'charisma'],
    startingEquipment: [
      { name: 'Épée', type: 'arme' },
      { name: 'Gilet en cuir', type: 'armure', bonus: { stat: 'defence', value: 1 } },
    ],
  },
  {
    name: 'Troubadour',
    nameFr: 'Troubadour',
    description: 'Artiste et conteur, le troubadour charme par ses mots et sa musique.',
    primaryStats: ['charisma', 'thievery'],
    startingEquipment: [
      { name: 'Épée', type: 'arme' },
      { name: 'Gilet en cuir', type: 'armure', bonus: { stat: 'defence', value: 1 } },
    ],
  },
  {
    name: 'Voyageur',
    nameFr: 'Voyageur',
    description: 'Explorateur infatigable, le voyageur connaît les secrets des terres sauvages.',
    primaryStats: ['scouting', 'thievery'],
    startingEquipment: [
      { name: 'Lance', type: 'arme' },
      { name: 'Gilet en cuir', type: 'armure', bonus: { stat: 'defence', value: 1 } },
    ],
  },
];

// Tables officielles Alkonost — Défense = COMBAT + Rang (sans armure)
// Rangs 1-6 : données officielles. Rangs 7-10 : extrapolation.
export type RankRange = '1-2' | '3-4' | '5-6' | '7-8' | '9-10';

export const statsTable: Record<Profession, Record<RankRange, CharacterStats>> = {
  Guerrier: {
    '1-2':  { combat: 6, charisma: 3, magic: 2, sanctity: 4, scouting: 3, thievery: 2, defence: 7,  stamina: 9 },
    '3-4':  { combat: 7, charisma: 4, magic: 2, sanctity: 5, scouting: 4, thievery: 3, defence: 10, stamina: 16 },
    '5-6':  { combat: 8, charisma: 5, magic: 3, sanctity: 6, scouting: 5, thievery: 3, defence: 13, stamina: 23 },
    '7-8':  { combat: 9, charisma: 6, magic: 3, sanctity: 7, scouting: 6, thievery: 4, defence: 16, stamina: 30 },
    '9-10': { combat: 10, charisma: 7, magic: 4, sanctity: 8, scouting: 7, thievery: 4, defence: 19, stamina: 37 },
  },
  Mage: {
    '1-2':  { combat: 2, charisma: 2, magic: 6, sanctity: 1, scouting: 5, thievery: 3, defence: 3,  stamina: 9 },
    '3-4':  { combat: 3, charisma: 3, magic: 7, sanctity: 1, scouting: 6, thievery: 4, defence: 6,  stamina: 16 },
    '5-6':  { combat: 4, charisma: 4, magic: 8, sanctity: 1, scouting: 7, thievery: 5, defence: 9,  stamina: 23 },
    '7-8':  { combat: 5, charisma: 5, magic: 9, sanctity: 2, scouting: 8, thievery: 6, defence: 12, stamina: 30 },
    '9-10': { combat: 5, charisma: 6, magic: 10, sanctity: 2, scouting: 9, thievery: 6, defence: 14, stamina: 37 },
  },
  'Prêtre': {
    '1-2':  { combat: 2, charisma: 4, magic: 3, sanctity: 6, scouting: 4, thievery: 2, defence: 3,  stamina: 9 },
    '3-4':  { combat: 3, charisma: 5, magic: 4, sanctity: 7, scouting: 5, thievery: 2, defence: 6,  stamina: 16 },
    '5-6':  { combat: 4, charisma: 6, magic: 5, sanctity: 8, scouting: 6, thievery: 2, defence: 9,  stamina: 23 },
    '7-8':  { combat: 5, charisma: 7, magic: 6, sanctity: 9, scouting: 7, thievery: 3, defence: 12, stamina: 30 },
    '9-10': { combat: 6, charisma: 8, magic: 7, sanctity: 10, scouting: 8, thievery: 3, defence: 15, stamina: 37 },
  },
  Voleur: {
    '1-2':  { combat: 4, charisma: 5, magic: 4, sanctity: 1, scouting: 2, thievery: 6, defence: 5,  stamina: 9 },
    '3-4':  { combat: 5, charisma: 6, magic: 5, sanctity: 2, scouting: 3, thievery: 7, defence: 8,  stamina: 16 },
    '5-6':  { combat: 6, charisma: 7, magic: 6, sanctity: 2, scouting: 4, thievery: 8, defence: 11, stamina: 23 },
    '7-8':  { combat: 7, charisma: 8, magic: 7, sanctity: 3, scouting: 5, thievery: 9, defence: 14, stamina: 30 },
    '9-10': { combat: 8, charisma: 9, magic: 8, sanctity: 3, scouting: 6, thievery: 10, defence: 17, stamina: 37 },
  },
  Troubadour: {
    '1-2':  { combat: 3, charisma: 6, magic: 4, sanctity: 3, scouting: 2, thievery: 4, defence: 4,  stamina: 9 },
    '3-4':  { combat: 4, charisma: 7, magic: 5, sanctity: 4, scouting: 3, thievery: 5, defence: 7,  stamina: 16 },
    '5-6':  { combat: 5, charisma: 8, magic: 5, sanctity: 5, scouting: 4, thievery: 6, defence: 10, stamina: 23 },
    '7-8':  { combat: 6, charisma: 9, magic: 6, sanctity: 6, scouting: 5, thievery: 7, defence: 13, stamina: 30 },
    '9-10': { combat: 7, charisma: 10, magic: 6, sanctity: 7, scouting: 6, thievery: 8, defence: 16, stamina: 37 },
  },
  Voyageur: {
    '1-2':  { combat: 5, charisma: 2, magic: 2, sanctity: 3, scouting: 6, thievery: 4, defence: 6,  stamina: 9 },
    '3-4':  { combat: 6, charisma: 3, magic: 3, sanctity: 4, scouting: 7, thievery: 5, defence: 9,  stamina: 16 },
    '5-6':  { combat: 7, charisma: 4, magic: 4, sanctity: 4, scouting: 8, thievery: 6, defence: 12, stamina: 23 },
    '7-8':  { combat: 8, charisma: 5, magic: 5, sanctity: 5, scouting: 9, thievery: 7, defence: 15, stamina: 30 },
    '9-10': { combat: 9, charisma: 6, magic: 5, sanctity: 5, scouting: 10, thievery: 8, defence: 18, stamina: 37 },
  },
};
