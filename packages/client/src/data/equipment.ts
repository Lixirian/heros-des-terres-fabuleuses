import { EquipmentItem } from './types';

// Catalogue complet d'équipements Fabled Lands (livres 1-6)
export const allEquipment: EquipmentItem[] = [
  // ── ARMES ──
  { name: 'Épée', type: 'arme', bonus: { stat: 'combat', value: 1 }, description: 'Épée en acier, fiable et polyvalente.' },
  { name: 'Épée large', type: 'arme', bonus: { stat: 'combat', value: 2 }, description: 'Grande épée à deux mains.' },
  { name: 'Marteau de guerre', type: 'arme', bonus: { stat: 'combat', value: 1 }, description: 'Lourd et dévastateur.' },
  { name: 'Hache de bataille', type: 'arme', bonus: { stat: 'combat', value: 2 }, description: 'Hache à double tranchant.' },
  { name: 'Hache', type: 'arme', bonus: { stat: 'combat', value: 1 }, description: 'Hache de combat tranchante.' },
  { name: 'Masse', type: 'arme', bonus: { stat: 'combat', value: 1 }, description: 'Arme contondante redoutable.' },
  { name: 'Masse sacrée', type: 'arme', bonus: { stat: 'sanctity', value: 1 }, description: 'Arme bénie par les dieux.' },
  { name: 'Dague', type: 'arme', description: 'Lame courte et rapide.' },
  { name: 'Rapière', type: 'arme', bonus: { stat: 'combat', value: 1 }, description: 'Fine lame de duel.' },
  { name: 'Arc court', type: 'arme', description: 'Pour le tir à distance.' },
  { name: 'Arc long', type: 'arme', bonus: { stat: 'combat', value: 1 }, description: 'Arc puissant à longue portée.' },
  { name: 'Arbalète', type: 'arme', bonus: { stat: 'combat', value: 1 }, description: 'Arme de tir mécanique précise.' },
  { name: 'Bâton runique', type: 'arme', bonus: { stat: 'magic', value: 1 }, description: 'Bâton gravé de runes arcanes.' },
  { name: 'Bâton de combat', type: 'arme', description: 'Bâton solide en bois dur.' },
  { name: 'Lance', type: 'arme', bonus: { stat: 'combat', value: 1 }, description: 'Arme d\'hast à longue portée.' },
  { name: 'Hallebarde', type: 'arme', bonus: { stat: 'combat', value: 2 }, description: 'Arme d\'hast polyvalente et mortelle.' },
  { name: 'Fléau d\'armes', type: 'arme', bonus: { stat: 'combat', value: 1 }, description: 'Boule hérissée au bout d\'une chaîne.' },
  { name: 'Trident', type: 'arme', bonus: { stat: 'combat', value: 1 }, description: 'Arme à trois pointes.' },
  { name: 'Cimeterre', type: 'arme', bonus: { stat: 'combat', value: 1 }, description: 'Lame courbe orientale.' },
  { name: 'Épée givrante', type: 'arme', bonus: { stat: 'combat', value: 3 }, description: 'Lame enchantée de givre éternel.' },
  { name: 'Épée de feu', type: 'arme', bonus: { stat: 'combat', value: 3 }, description: 'Lame enflammée par magie ancienne.' },
  { name: 'Lame fantôme', type: 'arme', bonus: { stat: 'combat', value: 2 }, description: 'Lame spectrale qui ignore les armures.' },
  { name: 'Épée du croisé', type: 'arme', bonus: { stat: 'combat', value: 2 }, description: 'Épée sainte des chevaliers de la foi.' },
  { name: 'Arc elfique', type: 'arme', bonus: { stat: 'combat', value: 2 }, description: 'Arc finement ouvragé par les elfes.' },
  { name: 'Sceptre de puissance', type: 'arme', bonus: { stat: 'magic', value: 2 }, description: 'Sceptre canalisant la magie brute.' },

  // ── ARMURES ──
  { name: 'Armure de cuir', type: 'armure', bonus: { stat: 'defence', value: 1 }, description: 'Protection légère mais efficace.' },
  { name: 'Cotte de mailles', type: 'armure', bonus: { stat: 'defence', value: 2 }, description: 'Bonne protection, un peu lourde.' },
  { name: 'Armure de plates', type: 'armure', bonus: { stat: 'defence', value: 3 }, description: 'Protection lourde de chevalier.' },
  { name: 'Bouclier en bois', type: 'armure', bonus: { stat: 'defence', value: 1 }, description: 'Bouclier simple mais solide.' },
  { name: 'Bouclier en acier', type: 'armure', bonus: { stat: 'defence', value: 2 }, description: 'Bouclier résistant et fiable.' },
  { name: 'Plastron enchanté', type: 'armure', bonus: { stat: 'defence', value: 3 }, description: 'Armure magique légère et résistante.' },
  { name: 'Casque de fer', type: 'armure', bonus: { stat: 'defence', value: 1 }, description: 'Protège la tête des coups.' },
  { name: 'Brassards de force', type: 'armure', bonus: { stat: 'combat', value: 1 }, description: 'Brassards renforçant la puissance.' },
  { name: 'Cape elfique', type: 'armure', bonus: { stat: 'scouting', value: 1 }, description: 'Cape rendant presque invisible.' },
  { name: 'Robe enchantée', type: 'armure', bonus: { stat: 'magic', value: 1 }, description: 'Robe tissée de fils magiques.' },
  { name: 'Armure de mithril', type: 'armure', bonus: { stat: 'defence', value: 4 }, description: 'Armure légendaire, légère et indestructible.' },
  { name: 'Bouclier du gardien', type: 'armure', bonus: { stat: 'defence', value: 3 }, description: 'Bouclier ancien aux runes protectrices.' },
  { name: 'Gambison', type: 'armure', bonus: { stat: 'defence', value: 1 }, description: 'Veste rembourrée de protection basique.' },
  { name: 'Armure écaillée', type: 'armure', bonus: { stat: 'defence', value: 2 }, description: 'Armure de plaques superposées.' },

  // ── OBJETS ──
  // Utilitaires
  { name: 'Corde (10m)', type: 'objet', description: 'Toujours utile pour un aventurier.' },
  { name: 'Torche', type: 'objet', description: 'Éclaire les ténèbres.' },
  { name: 'Rations (7 jours)', type: 'objet', description: 'Nourriture de voyage.' },
  { name: 'Gourde', type: 'objet', description: 'Contient de l\'eau potable.' },
  { name: 'Sac à dos', type: 'objet', description: 'Pour transporter son équipement.' },
  { name: 'Carte ancienne', type: 'objet', description: 'Carte partiellement illisible.' },
  { name: 'Outils de crochetage', type: 'objet', bonus: { stat: 'thievery', value: 1 }, description: 'Indispensables au voleur.' },
  { name: 'Symbole sacré', type: 'objet', bonus: { stat: 'sanctity', value: 1 }, description: 'Focaliseur de foi divine.' },
  { name: 'Luth', type: 'objet', bonus: { stat: 'charisma', value: 1 }, description: 'Instrument de musique enchanteur.' },
  { name: 'Longue-vue', type: 'objet', bonus: { stat: 'scouting', value: 1 }, description: 'Pour observer de loin.' },
  { name: 'Grimoire', type: 'objet', bonus: { stat: 'magic', value: 1 }, description: 'Livre de sorts et d\'incantations.' },
  { name: 'Herbes médicinales', type: 'objet', description: 'Restaure 1 point d\'endurance.' },
  { name: 'Pied-de-biche', type: 'objet', description: 'Utile pour forcer des portes.' },
  { name: 'Grappin', type: 'objet', description: 'Pour escalader les murs.' },
  { name: 'Sifflet en argent', type: 'objet', description: 'Appelle à l\'aide ou effraie les animaux.' },
  // Objets magiques
  { name: 'Amulette protectrice', type: 'objet', bonus: { stat: 'defence', value: 1 }, description: 'Amulette imprégnée de magie défensive.' },
  { name: 'Pierre de lune', type: 'objet', bonus: { stat: 'magic', value: 1 }, description: 'Gemme lunaire amplifiant la magie.' },
  { name: 'Anneau de feu', type: 'objet', bonus: { stat: 'combat', value: 1 }, description: 'Anneau qui enflamme les coups portés.' },
  { name: 'Talisman des mers', type: 'objet', bonus: { stat: 'scouting', value: 1 }, description: 'Protège en mer et guide le voyageur.' },
  { name: 'Bottes de sept lieues', type: 'objet', bonus: { stat: 'scouting', value: 2 }, description: 'Bottes magiques de grande vitesse.' },
  { name: 'Lanterne éternelle', type: 'objet', description: 'Lanterne magique qui ne s\'éteint jamais.' },
  { name: 'Potion de soin', type: 'objet', description: 'Restaure 2d6 points d\'endurance.' },
  { name: 'Potion de force', type: 'objet', bonus: { stat: 'combat', value: 2 }, description: 'Augmente temporairement la force.' },
  { name: 'Potion d\'invisibilité', type: 'objet', description: 'Rend invisible pendant un court instant.' },
  { name: 'Anneau de protection', type: 'objet', bonus: { stat: 'defence', value: 2 }, description: 'Anneau déviant les coups ennemis.' },
  { name: 'Médaillon de charme', type: 'objet', bonus: { stat: 'charisma', value: 2 }, description: 'Rend plus persuasif et charismatique.' },
  { name: 'Amulette de piété', type: 'objet', bonus: { stat: 'sanctity', value: 2 }, description: 'Renforce la connexion divine.' },
  { name: 'Gants de voleur', type: 'objet', bonus: { stat: 'thievery', value: 2 }, description: 'Gants enchantés pour les doigts agiles.' },
  { name: 'Corne de brume', type: 'objet', description: 'Corne magique créant un épais brouillard.' },
  { name: 'Miroir des âmes', type: 'objet', description: 'Révèle la vraie nature des créatures.' },
  { name: 'Clé squelette', type: 'objet', bonus: { stat: 'thievery', value: 1 }, description: 'Ouvre la plupart des serrures simples.' },
  { name: 'Parchemin de téléportation', type: 'objet', description: 'Permet un voyage instantané, usage unique.' },
  { name: 'Encens sacré', type: 'objet', bonus: { stat: 'sanctity', value: 1 }, description: 'Purifie les lieux et repousse le mal.' },
  { name: 'Poudre de diamant', type: 'objet', description: 'Composant magique rare et précieux.' },
  { name: 'Orbe de vision', type: 'objet', bonus: { stat: 'magic', value: 2 }, description: 'Orbe permettant de voir à distance.' },
];

// Exports de compatibilité — dérivés du catalogue
const starterWeaponNames = ['Épée', 'Marteau de guerre', 'Dague', 'Rapière', 'Arc court', 'Bâton runique', 'Masse sacrée', 'Hache'];
const starterArmorNames = ['Armure de cuir', 'Cotte de mailles', 'Bouclier en bois'];
const commonItemNames = [
  'Corde (10m)', 'Torche', 'Rations (7 jours)', 'Gourde', 'Sac à dos',
  'Outils de crochetage', 'Symbole sacré', 'Luth', 'Longue-vue',
  'Amulette protectrice', 'Potion de soin', 'Carte ancienne',
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
