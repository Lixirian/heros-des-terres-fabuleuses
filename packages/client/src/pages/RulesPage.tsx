import { motion } from 'framer-motion';

const sections = [
  {
    title: 'Les Compétences',
    content: `Chaque personnage possède 6 compétences qui définissent ses capacités :

**COMBAT** - Votre habileté au combat. Utilisée lors des affrontements physiques.
**CHARISME** - Votre art de la persuasion. Permet de négocier, charmer et influencer.
**MAGIE** - Votre maîtrise des sortilèges et des arts arcanes.
**PIÉTÉ** - Votre connexion avec le divin. Permet d'invoquer des bénédictions.
**EXPLORATION** - Votre capacité de pistage et de survie en milieu hostile.
**ADRESSE** - Votre discrétion et habileté manuelle (crochetage, pickpocket).`,
  },
  {
    title: 'Tests de Compétence',
    content: `Quand le livre vous demande un test de compétence, lancez 2d6 et ajoutez votre score dans la compétence concernée.

**Formule** : 2d6 + Compétence + Bonus éventuels

Si le total est supérieur ou égal à la difficulté indiquée, le test est réussi.

Exemple : Test de COMBAT difficulté 9 avec COMBAT de 5
→ Vous lancez 2d6 et obtenez 3+4 = 7
→ 7 + 5 = 12 ≥ 9 → Réussite !`,
  },
  {
    title: 'Le Combat',
    content: `Le combat se déroule en rounds successifs :

1. **Attaque du héros** : Lancez 2d6 + votre COMBAT + bonus d'arme
2. **Attaque de l'ennemi** : Lancez 2d6 + COMBAT de l'ennemi
3. **Calcul des dégâts** :
   - Si votre attaque > Défense de l'ennemi : l'ennemi perd (attaque - défense) en Endurance
   - Si l'attaque ennemie > votre Défense : vous perdez (attaque - défense) en Endurance
4. Répétez jusqu'à ce que l'Endurance d'un combattant tombe à 0

**Fuite** : Vous pouvez fuir à la fin d'un round (selon le livre).`,
  },
  {
    title: 'Endurance et Défense',
    content: `**Endurance** représente vos points de vie. Quand elle tombe à 0, vous êtes vaincu.
Elle peut être restaurée par des potions, du repos ou des bénédictions.

**Défense** représente votre protection (armure, bouclier, agilité).
Plus elle est élevée, moins vous subissez de dégâts en combat.`,
  },
  {
    title: 'Équipement',
    content: `Vous pouvez transporter jusqu'à **12 objets** dans votre inventaire.

Les objets peuvent accorder des bonus aux compétences :
- Une épée peut donner +1 en COMBAT
- Des outils de crochetage donnent +1 en ADRESSE
- Un symbole sacré donne +1 en PIÉTÉ

L'argent est compté en **chardes** (la monnaie des Terres Fabuleuses).`,
  },
  {
    title: 'Rang et Progression',
    content: `Votre **Rang** (de 1 à 10) représente votre niveau d'expérience.

En progressant en rang, vos compétences et stats augmentent selon les tables officielles de votre profession.

Le rang est gagné en accomplissant des quêtes et en atteignant certains codes.`,
  },
  {
    title: 'Les Divinités',
    content: `Vous pouvez choisir de vénérer une divinité. Les temples vous offrent des bénédictions en échange de dons.

**Elnir** - Protection et justice
**Sig** - Victoire et combat
**Alvir & Douren** - Tempêtes et mer
**Molhern** - Mort et au-delà
**Lacuna** - Rêves et illusions
**Tyrnai** - Commerce et voyage
**Nagil** - Ténèbres et secrets
**Maka** - Terre et nature
**Les Trois Fortunes** - Chance et destin`,
  },
  {
    title: 'Les Coche-mots',
    content: `Les **coche-mots** (codewords) sont des mots-clés que vous notez au cours de l'aventure.

Ils servent de marqueurs pour le jeu : certains codes vérifient si vous possédez un coche-mot particulier pour déclencher des événements, ouvrir des passages ou modifier l'histoire.

Notez-les soigneusement sur votre fiche de personnage !`,
  },
  {
    title: 'Navigation entre les Livres',
    content: `Les Terres Fabuleuses sont un monde ouvert réparti en 6 livres :

1. **Le Royaume Déchiré** (Sokara)
2. **Cités d'Or et de Gloire** (Golnir)
3. **Par-delà la Mer de Sang Noir**
4. **Les Grandes Steppes**
5. **La Cour des Visages Cachés** (Uttaku)
6. **Les Seigneurs du Soleil Levant** (Akatsurai)

Vous pouvez voyager entre les livres ! À certains codes, on vous indique de passer à un autre livre. Votre personnage conserve toutes ses stats, son équipement et ses coche-mots.`,
  },
];

export default function RulesPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
      <h2 className="font-medieval text-3xl text-fantasy-gold">Règles du jeu</h2>
      <p className="text-parchment-400">
        Guide de référence pour le jeu Héros des Terres Fabuleuses (Fabled Lands).
      </p>

      <div className="space-y-4">
        {sections.map((section, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="parchment-card"
          >
            <h3 className="section-title">{section.title}</h3>
            <div className="text-parchment-100 font-body whitespace-pre-line leading-relaxed">
              {section.content.split(/(\*\*[^*]+\*\*)/).map((part, j) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={j} className="text-fantasy-gold">{part.slice(2, -2)}</strong>;
                }
                return <span key={j}>{part}</span>;
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
