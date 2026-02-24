import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';
import { books } from '../data/books';
import { pregenCharacters } from '../data/pregenCharacters';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const { user } = useAuth();
  const [characters, setCharacters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCharacters()
      .then(setCharacters)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <motion.div variants={itemVariants} className="parchment-card text-center">
        <h2 className="font-medieval text-4xl text-fantasy-gold mb-3">
          Bienvenue, {user?.username} !
        </h2>
        <p className="text-parchment-200 font-body text-lg max-w-2xl mx-auto">
          Explorez les Terres Fabuleuses, créez vos héros et vivez des aventures épiques
          dans ce monde de fantasy inspiré des livres-jeux de Dave Morris et Jamie Thomson.
        </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/create" className="parchment-card hover:shadow-xl transition-shadow group">
          <div className="text-center">
            <div className="text-4xl mb-3">⚔️</div>
            <h3 className="font-medieval text-xl text-fantasy-gold group-hover:text-fantasy-gold transition-colors">
              Créer un personnage
            </h3>
            <p className="text-parchment-300 text-sm mt-2">Personnalisé ou prétirés</p>
          </div>
        </Link>
        <Link to="/combat" className="parchment-card hover:shadow-xl transition-shadow group">
          <div className="text-center">
            <div className="text-4xl mb-3">🎲</div>
            <h3 className="font-medieval text-xl text-fantasy-gold group-hover:text-fantasy-gold transition-colors">
              Assistant de combat
            </h3>
            <p className="text-parchment-300 text-sm mt-2">Lancez les dés et combattez</p>
          </div>
        </Link>
        <Link to="/books" className="parchment-card hover:shadow-xl transition-shadow group">
          <div className="text-center">
            <div className="text-4xl mb-3">📖</div>
            <h3 className="font-medieval text-xl text-fantasy-gold group-hover:text-fantasy-gold transition-colors">
              Livres & Codes
            </h3>
            <p className="text-parchment-300 text-sm mt-2">Naviguez par livre</p>
          </div>
        </Link>
      </motion.div>

      {/* My Characters */}
      <motion.div variants={itemVariants}>
        <h3 className="section-title">Mes personnages</h3>
        {loading ? (
          <p className="text-parchment-400">Chargement...</p>
        ) : characters.length === 0 ? (
          <div className="parchment-card text-center py-8">
            <p className="text-parchment-300 mb-4">Vous n'avez pas encore de personnage.</p>
            <Link to="/create" className="fantasy-button inline-block">
              Créer mon premier héros
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {characters.map(char => (
              <Link key={char.id} to={`/character/${char.id}`} className="parchment-card hover:shadow-xl transition-all group">
                <div className="flex items-center gap-4">
                  {char.portrait ? (
                    <img src={char.portrait} alt={char.name}
                      className="w-14 h-14 rounded-full object-cover shadow-md border-2 border-fantasy-gold/50 animate-breathe" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-fantasy-gold to-parchment-400 flex items-center justify-center text-parchment-900 font-medieval text-xl shadow-md animate-breathe">
                      {char.name[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medieval text-lg text-fantasy-gold group-hover:text-fantasy-gold transition-colors truncate">
                      {char.name}
                    </h4>
                    <p className="text-parchment-300 text-sm">{char.profession} - Rang {char.rank}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs text-parchment-500">END: {char.stamina}/{char.max_stamina}</span>
                      <span className="text-xs text-parchment-500">DEF: {char.defence}</span>
                      <span className="text-xs text-parchment-500">{char.money} chardes</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>

      {/* Pregen Characters Preview */}
      <motion.div variants={itemVariants}>
        <h3 className="section-title">Personnages prétirés disponibles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pregenCharacters.slice(0, 6).map(char => (
            <div key={char.pregen_id} className="parchment-card">
              <div className="flex items-center gap-3 mb-2">
                {char.portrait ? (
                  <img src={char.portrait} alt={char.name}
                    className="w-10 h-10 rounded-full object-cover shadow border-2 border-fantasy-gold/50" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-parchment-400 to-parchment-600 flex items-center justify-center text-parchment-100 font-medieval shadow">
                    {char.name[0]}
                  </div>
                )}
                <div>
                  <h4 className="font-medieval text-lg text-fantasy-gold">{char.name}</h4>
                  <p className="text-parchment-300 text-xs">{char.profession}</p>
                </div>
              </div>
              <p className="text-parchment-200 text-sm">{char.description}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Books Overview */}
      <motion.div variants={itemVariants}>
        <h3 className="section-title">Les Livres</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.map(book => (
            <Link
              key={book.id}
              to={`/books/${book.id}`}
              className="parchment-card hover:shadow-xl transition-all group relative overflow-hidden"
            >
              <div
                className="absolute inset-0 opacity-10"
                style={{ background: `linear-gradient(135deg, ${book.color}, ${book.colorAccent})` }}
              />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: book.color }}
                  >
                    {book.id}
                  </span>
                  <h4 className="font-medieval text-lg text-fantasy-gold group-hover:text-fantasy-gold transition-colors">
                    {book.titleFr}
                  </h4>
                </div>
                <p className="text-parchment-300 text-xs italic">{book.title}</p>
                <p className="text-parchment-200 text-sm mt-2">{book.region} - {book.maxCode} chapitres</p>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
