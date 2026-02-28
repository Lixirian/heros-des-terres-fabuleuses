import { EquipmentItem } from './types';

// Catalogue d'équipements Fabled Lands (livres 1-6)
// Sources : gamebooks originaux, pré-tirés Alkonost, marchés en jeu
export const allEquipment: EquipmentItem[] = [
  // ── ARMES BASIQUES (pas de bonus, ~50 chardes en marché) ──
  { name: 'Épée', type: 'arme', description: 'Épée en acier, fiable et polyvalente.' },
  { name: 'Hache', type: 'arme', description: 'Hache de combat tranchante.' },
  { name: 'Hache de guerre', type: 'arme', description: 'Grande hache de guerre.' },
  { name: 'Dague', type: 'arme', description: 'Lame courte et rapide.' },
  { name: 'Masse', type: 'arme', description: 'Arme contondante redoutable.' },
  { name: 'Gourdin', type: 'arme', description: 'Bâton court et lourd.' },
  { name: 'Bâton', type: 'arme', description: 'Bâton en bois, simple mais efficace.' },
  { name: 'Bâton de combat', type: 'arme', description: 'Bâton solide en bois dur.' },
  { name: 'Lance', type: 'arme', description: "Arme d'hast à longue portée." },
  { name: 'Cimeterre', type: 'arme', description: 'Lame courbe orientale.' },
  { name: 'Trident', type: 'arme', description: 'Arme à trois pointes.' },
  { name: 'Arc', type: 'arme', description: 'Arc simple pour le tir à distance.' },
  { name: 'Arbalète', type: 'arme', description: 'Arme de tir mécanique.' },
  { name: 'Fronde', type: 'arme', description: 'Lance des projectiles à distance.' },

  // ── ARMES SUPÉRIEURES (COMBAT +1, ~200 chardes en marché) ──
  { name: 'Épée (COMBAT +1)', type: 'arme', bonus: { stat: 'combat', value: 1 }, description: 'Épée de qualité supérieure.' },
  { name: 'Hache (COMBAT +1)', type: 'arme', bonus: { stat: 'combat', value: 1 }, description: 'Hache de qualité supérieure.' },
  { name: 'Dague (COMBAT +1)', type: 'arme', bonus: { stat: 'combat', value: 1 }, description: 'Dague finement ouvragée.' },
  { name: 'Arc (COMBAT +1)', type: 'arme', bonus: { stat: 'combat', value: 1 }, description: 'Arc puissant à longue portée.' },
  { name: 'Arbalète (COMBAT +1)', type: 'arme', bonus: { stat: 'combat', value: 1 }, description: 'Arbalète de précision.' },

  // ── ARMES SPÉCIALES / MAGIQUES (trouvées en quête) ──
  { name: 'Épée sainte', type: 'arme', bonus: { stat: 'combat', value: 2 }, description: 'Épée bénie par les dieux.' },
  { name: 'Épée blanche', type: 'arme', bonus: { stat: 'combat', value: 2 }, description: 'Lame immaculée de grande puissance.' },
  { name: 'Épée mythique', type: 'arme', bonus: { stat: 'combat', value: 3 }, description: 'Arme légendaire d\'une puissance rare.' },

  // ── ARMURES ──
  { name: 'Gilet en cuir', type: 'armure', bonus: { stat: 'defence', value: 1 }, description: 'Protection légère en cuir (Défense +1).' },
  { name: 'Mailles annelées', type: 'armure', bonus: { stat: 'defence', value: 2 }, description: 'Armure de mailles légères (Défense +2).' },
  { name: 'Cotte de mailles', type: 'armure', bonus: { stat: 'defence', value: 3 }, description: 'Bonne protection en mailles d\'acier (Défense +3).' },
  { name: 'Armure à écailles', type: 'armure', bonus: { stat: 'defence', value: 4 }, description: 'Armure de plaques superposées (Défense +4).' },
  { name: 'Armure de plates', type: 'armure', bonus: { stat: 'defence', value: 5 }, description: 'Protection lourde de chevalier (Défense +5).' },

  // ── BOUCLIERS ──
  { name: 'Bouclier en bois', type: 'armure', bonus: { stat: 'defence', value: 1 }, description: 'Bouclier simple mais solide.' },
  { name: 'Bouclier en acier', type: 'armure', bonus: { stat: 'defence', value: 2 }, description: 'Bouclier résistant et fiable.' },

  // ── BAGUETTES MAGIQUES ──
  { name: "Baguette d'ébène", type: 'objet', bonus: { stat: 'magic', value: 2 }, description: 'Baguette noire canalisant la magie (MAGIE +2).' },
  { name: 'Baguette de cobalt', type: 'objet', bonus: { stat: 'magic', value: 3 }, description: 'Baguette bleue de grande puissance (MAGIE +3).' },
  { name: 'Baguette de sélénium', type: 'objet', bonus: { stat: 'magic', value: 4 }, description: 'Baguette rare et puissante (MAGIE +4).' },
  { name: 'Baguette de célestium', type: 'objet', bonus: { stat: 'magic', value: 5 }, description: 'Baguette légendaire (MAGIE +5).' },

  // ── SYMBOLES SACRÉS ──
  { name: 'Symbole sacré en argent', type: 'objet', bonus: { stat: 'sanctity', value: 2 }, description: 'Focaliseur de foi en argent (PIÉTÉ +2).' },
  { name: 'Symbole sacré en or', type: 'objet', bonus: { stat: 'sanctity', value: 3 }, description: 'Focaliseur de foi en or (PIÉTÉ +3).' },

  // ── INSTRUMENTS DE MUSIQUE ──
  { name: 'Flûte en argent', type: 'objet', bonus: { stat: 'charisma', value: 2 }, description: 'Flûte mélodieuse en argent (CHARISME +2).' },
  { name: 'Mandoline magique', type: 'objet', bonus: { stat: 'charisma', value: 2 }, description: 'Mandoline enchantée (CHARISME +2).' },
  { name: 'Flûte enchantée', type: 'objet', bonus: { stat: 'charisma', value: 3 }, description: 'Flûte aux pouvoirs magiques (CHARISME +3).' },

  // ── OBJETS D'EXPLORATION ──
  { name: 'Boussole', type: 'objet', bonus: { stat: 'scouting', value: 1 }, description: 'Indique le nord (EXPLORATION +1).' },
  { name: 'Boussole en or', type: 'objet', bonus: { stat: 'scouting', value: 2 }, description: 'Boussole précise et enchantée (EXPLORATION +2).' },
  { name: "Bâton d'arpenteur", type: 'objet', bonus: { stat: 'scouting', value: 2 }, description: 'Instrument de navigation (EXPLORATION +2).' },
  { name: 'Longue-vue', type: 'objet', bonus: { stat: 'scouting', value: 1 }, description: 'Pour observer de loin (EXPLORATION +1).' },

  // ── OBJETS UTILITAIRES ──
  { name: 'Corde (10m)', type: 'objet', description: 'Toujours utile pour un aventurier.' },
  { name: 'Torche', type: 'objet', description: 'Éclaire les ténèbres.' },
  { name: 'Rations (7 jours)', type: 'objet', description: 'Nourriture de voyage.' },
  { name: 'Gourde', type: 'objet', description: 'Contient de l\'eau potable.' },
  { name: 'Sac à dos', type: 'objet', description: 'Pour transporter son équipement.' },
  { name: 'Carte ancienne', type: 'objet', description: 'Carte partiellement illisible.' },
  { name: 'Lanterne', type: 'objet', description: 'Lanterne à huile.' },
  { name: 'Outils de crochetage', type: 'objet', bonus: { stat: 'thievery', value: 1 }, description: 'Indispensables au voleur (ADRESSE +1).' },
  { name: 'Pied-de-biche', type: 'objet', description: 'Utile pour forcer des portes.' },
  { name: 'Grappin', type: 'objet', description: 'Pour escalader les murs.' },

  // ── POTIONS (usage unique) ──
  { name: 'Potion de soin', type: 'objet', description: 'Restaure 5 points d\'endurance.' },
  { name: 'Potion de force', type: 'objet', description: 'COMBAT +1 pour un jet (usage unique).' },
  { name: 'Potion d\'intellect', type: 'objet', description: 'MAGIE +1 pour un jet (usage unique).' },
  { name: 'Potion de charme', type: 'objet', description: 'CHARISME +1 pour un jet (usage unique).' },
  { name: 'Potion de nature', type: 'objet', description: 'EXPLORATION +1 pour un jet (usage unique).' },
  { name: 'Potion de piété', type: 'objet', description: 'PIÉTÉ +1 pour un jet (usage unique).' },

  // ── OBJETS SPÉCIAUX (trouvés en quête) ──
  { name: 'Clé de verdigris', type: 'objet', description: 'Permet la téléportation via les trappes de verdigris.' },
  { name: 'Pierre de lune', type: 'objet', description: 'Téléportation unique.' },
  { name: 'Vade Mecum', type: 'objet', description: 'Téléporte entre 4 villes (détruit après usage sauf jet de MAGIE réussi).' },
];

// Exports de compatibilité — dérivés du catalogue
const starterWeaponNames = ['Épée', 'Hache', 'Hache de guerre', 'Dague', 'Masse', 'Gourdin', 'Bâton', 'Bâton de combat', 'Lance', 'Cimeterre', 'Arc', 'Arbalète'];
const starterArmorNames = ['Gilet en cuir', 'Mailles annelées', 'Cotte de mailles'];
const commonItemNames = [
  'Corde (10m)', 'Torche', 'Rations (7 jours)', 'Gourde', 'Sac à dos',
  'Outils de crochetage', 'Boussole', 'Longue-vue',
  'Potion de soin', 'Carte ancienne', 'Lanterne',
];

export const starterWeapons: EquipmentItem[] = allEquipment.filter(e => starterWeaponNames.includes(e.name));
export const starterArmor: EquipmentItem[] = allEquipment.filter(e => starterArmorNames.includes(e.name));
export const commonItems: EquipmentItem[] = allEquipment.filter(e => commonItemNames.includes(e.name));

export const gods = [
  { name: 'Elnir', domain: 'Protection et justice' },
  { name: 'Sig', domain: 'Victoire et combat' },
  { name: 'Alvir & Douren', domain: 'Tempêtes et mer' },
  { name: 'Molhern', domain: 'Mort et au-delà' },
  { name: 'Lacuna', domain: 'Rêves et illusions' },
  { name: 'Tyrnai', domain: 'Commerce et voyage' },
  { name: 'Nagil', domain: 'Ténèbres et secrets' },
  { name: 'Maka', domain: 'Terre et nature' },
  { name: 'Les Trois Fortunes', domain: 'Chance et destin' },
  { name: 'Aucun', domain: 'Sans divinité' },
];
