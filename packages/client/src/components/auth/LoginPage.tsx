import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

export default function LoginPage() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login: doLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await doLogin(login, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="parchment-card w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-fantasy-gold to-parchment-500 flex items-center justify-center text-parchment-900 font-medieval text-3xl shadow-lg mb-4">
            H
          </div>
          <h1 className="font-medieval text-3xl text-fantasy-gold mb-2">
            Héros des Terres Fabuleuses
          </h1>
          <p className="text-parchment-300 font-body">Connectez-vous pour continuer l'aventure</p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-600 text-red-300 px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-body text-parchment-200 mb-1">Pseudo ou email</label>
            <input
              type="text"
              value={login}
              onChange={e => setLogin(e.target.value)}
              className="fantasy-input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-body text-parchment-200 mb-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="fantasy-input"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="fantasy-button w-full text-center">
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center mt-6 text-parchment-300 text-sm">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-fantasy-gold hover:underline font-semibold">
            S'inscrire
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
