// Titres officiels Fabled Lands (livres 1-6)
// Les titres sont des marqueurs narratifs permanents qui débloquent des quêtes et lieux.

export interface TitleDef {
  name: string;
  description: string;
  book: number;
}

export const officialTitles: TitleDef[] = [
  // Livre 1 — La Guerre des Dieux
  { name: 'Protecteur de Sokara', description: 'Accordé pour avoir soutenu Marlock dans la guerre civile.', book: 1 },
  { name: 'Champion du Roi', description: 'Accordé pour avoir soutenu le Roi contre Marlock.', book: 1 },
  { name: 'L\'Ordre Nouveau', description: 'Accordé pour avoir achevé la quête de Marlock.', book: 1 },

  // Livre 2 — Les Richesses de Douvres
  { name: 'Doyen de la Guilde', description: 'Accordé pour avoir accompli la quête de la Guilde à Yellowport.', book: 2 },
  { name: 'Bien-aimé des Trois Fortunes', description: 'Accordé pour avoir obtenu un 6 aux jeux sacrés de Goldfall.', book: 2 },
  { name: 'Illuminé de Molhern', description: 'Accordé pour avoir complété la quête du Livre des Sept Sages.', book: 2 },
  { name: 'Paladin de Ravayne', description: 'Accordé pour avoir terrassé un dragon.', book: 2 },

  // Livre 3 — Par-delà le Ténébreux
  { name: 'Champion de l\'Arène', description: 'Remporté les combats de l\'arène sur l\'Île du Mystère.', book: 3 },

  // Livre 4 — Les Contrées de l\'Épouvante
  { name: 'Rôdeur Nocturne', description: 'Accompli la quête de la Confrérie de la Nuit à Yarimura.', book: 4 },
  { name: 'Élu de Nagil', description: 'Initié de Nagil porteur de l\'Épée Blanche.', book: 4 },
  { name: 'Béni de Tambu', description: 'Offrande d\'une hache de guerre au sanctuaire de Strange Gully.', book: 4 },
];
