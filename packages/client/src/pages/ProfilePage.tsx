import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [characters, setCharacters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCharacters()
      .then(setCharacters)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!user) return null;

  const customChars = characters.filter(c => !c.is_pregen);
  const pregenChars = characters.filter(c => c.is_pregen);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
      <h2 className="font-medieval text-3xl text-fantasy-gold">Profil</h2>

      {/* User Info */}
      <div className="parchment-card">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-fantasy-gold to-parchment-400 flex items-center justify-center text-parchment-900 font-medieval text-4xl shadow-lg">
            {user.username[0].toUpperCase()}
          </div>
          <div>
            <h3 className="font-medieval text-2xl text-fantasy-gold">{user.username}</h3>
            <p className="text-parchment-300">{user.email}</p>
            <p className="text-parchment-500 text-sm mt-1">{characters.length} personnage(s)</p>
          </div>
        </div>
      </div>

      {/* Character Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="parchment-card text-center">
          <p className="font-medieval text-3xl text-fantasy-gold">{characters.length}</p>
          <p className="text-parchment-300 text-sm">Personnages</p>
        </div>
        <div className="parchment-card text-center">
          <p className="font-medieval text-3xl text-fantasy-gold">{customChars.length}</p>
          <p className="text-parchment-300 text-sm">Personnalisés</p>
        </div>
        <div className="parchment-card text-center">
          <p className="font-medieval text-3xl text-fantasy-gold">{pregenChars.length}</p>
          <p className="text-parchment-300 text-sm">Prétirés</p>
        </div>
      </div>

      {/* Character List */}
      <div>
        <h3 className="section-title">Mes personnages</h3>
        {loading ? (
          <p className="text-parchment-400">Chargement...</p>
        ) : characters.length === 0 ? (
          <div className="parchment-card text-center py-8">
            <p className="text-parchment-300 mb-4">Aucun personnage encore.</p>
            <Link to="/create" className="fantasy-button inline-block">Créer un personnage</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {characters.map(char => (
              <Link
                key={char.id}
                to={`/character/${char.id}`}
                className="parchment-card flex items-center justify-between hover:shadow-xl transition-all group block"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-fantasy-gold to-parchment-400 flex items-center justify-center text-parchment-900 font-medieval text-lg shadow">
                    {char.name[0]}
                  </div>
                  <div>
                    <p className="font-medieval text-lg text-fantasy-gold group-hover:text-fantasy-gold transition-colors">
                      {char.name}
                    </p>
                    <p className="text-parchment-300 text-sm">
                      {char.profession} - Rang {char.rank}
                      {char.is_pregen ? ' (prétirés)' : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-parchment-300">END: {char.stamina}/{char.max_stamina}</p>
                  <p className="text-sm text-parchment-500">{char.money} chardes</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link to="/create" className="fantasy-button">Nouveau personnage</Link>
        <button onClick={logout} className="fantasy-button-danger">Se déconnecter</button>
      </div>
    </motion.div>
  );
}
