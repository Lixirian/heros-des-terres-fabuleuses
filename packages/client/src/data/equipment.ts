import { EquipmentItem } from './types';

export const starterWeapons: EquipmentItem[] = [
  { name: 'Épée', type: 'arme', bonus: { stat: 'combat', value: 1 }, description: 'Épée en acier, fiable et polyvalente.' },
  { name: 'Marteau de guerre', type: 'arme', bonus: { stat: 'combat', value: 1 }, description: 'Lourd et dévastateur.' },
  { name: 'Dague', type: 'arme', description: 'Lame courte et rapide.' },
  { name: 'Rapière', type: 'arme', description: 'Fine lame de duel.' },
  { name: 'Arc court', type: 'arme', description: 'Pour le tir à distance.' },
  { name: 'Bâton runique', type: 'arme', bonus: { stat: 'magic', value: 1 }, description: 'Bâton gravé de runes arcanes.' },
  { name: 'Masse sacrée', type: 'arme', description: 'Arme bénie par les dieux.' },
  { name: 'Hache', type: 'arme', bonus: { stat: 'combat', value: 1 }, description: 'Hache de combat tranchante.' },
];

export const starterArmor: EquipmentItem[] = [
  { name: 'Armure de cuir', type: 'armure', bonus: { stat: 'defence', value: 1 }, description: 'Protection légère mais efficace.' },
  { name: 'Cotte de mailles', type: 'armure', bonus: { stat: 'defence', value: 2 }, description: 'Bonne protection, un peu lourde.' },
  { name: 'Bouclier en bois', type: 'armure', bonus: { stat: 'defence', value: 1 }, description: 'Bouclier simple mais solide.' },
];

export const commonItems: EquipmentItem[] = [
  { name: 'Corde (10m)', type: 'objet', description: 'Toujours utile pour un aventurier.' },
  { name: 'Torche', type: 'objet', description: 'Éclaire les ténèbres.' },
  { name: 'Rations (7 jours)', type: 'objet', description: 'Nourriture de voyage.' },
  { name: 'Gourde', type: 'objet', description: "Contient de l'eau potable." },
  { name: 'Sac à dos', type: 'objet', description: 'Pour transporter son équipement.' },
  { name: 'Outils de crochetage', type: 'objet', bonus: { stat: 'thievery', value: 1 }, description: 'Indispensables au voleur.' },
  { name: 'Symbole sacré', type: 'objet', bonus: { stat: 'sanctity', value: 1 }, description: 'Focaliseur de foi divine.' },
  { name: 'Luth', type: 'objet', bonus: { stat: 'charisma', value: 1 }, description: 'Instrument de musique enchanteur.' },
  { name: 'Longue-vue', type: 'objet', bonus: { stat: 'scouting', value: 1 }, description: 'Pour observer de loin.' },
  { name: 'Amulette protectrice', type: 'objet', description: 'Porte-bonheur ancien.' },
  { name: 'Potion de soin', type: 'objet', description: 'Restaure 2d6 points d\'endurance.' },
  { name: 'Carte ancienne', type: 'objet', description: 'Carte partiellement illisible.' },
];

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
