// Bénédictions officielles Fabled Lands (livres 1-6)
// Les bénédictions sont des relances à usage unique obtenues dans les temples.
// On ne peut avoir qu'une bénédiction de chaque type à la fois.

export interface BlessingDef {
  name: string;
  description: string;
  /** Stat liée pour la relance (null = spécial) */
  rerollStat: string | null;
}

export const officialBlessings: BlessingDef[] = [
  // Bénédictions de compétence (relance un jet raté)
  { name: 'Combat', description: 'Relance un jet de COMBAT raté (usage unique).', rerollStat: 'combat' },
  { name: 'Charisme', description: 'Relance un jet de CHARISME raté (usage unique).', rerollStat: 'charisma' },
  { name: 'Magie', description: 'Relance un jet de MAGIE raté (usage unique).', rerollStat: 'magic' },
  { name: 'Piété', description: 'Relance un jet de PIÉTÉ raté (usage unique).', rerollStat: 'sanctity' },
  { name: 'Exploration', description: 'Relance un jet d\'EXPLORATION raté (usage unique).', rerollStat: 'scouting' },
  { name: 'Adresse', description: 'Relance un jet d\'ADRESSE raté (usage unique).', rerollStat: 'thievery' },

  // Bénédictions spéciales
  { name: 'Chance', description: 'Relance n\'importe quel jet raté (usage unique). Cumulable avec une bénédiction de compétence.', rerollStat: null },
  { name: 'Protection contre les tempêtes', description: 'Immunité aux dégâts de tempête en mer.', rerollStat: null },
  { name: 'Immunité aux maladies et poisons', description: 'Immunité aux effets de maladie et de poison.', rerollStat: null },
  { name: 'Immunité aux blessures', description: 'Protection contre certains effets de blessure.', rerollStat: null },
  { name: 'Défense par la foi', description: 'Améliore la valeur de Défense.', rerollStat: null },
];
