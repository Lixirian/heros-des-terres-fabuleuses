import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    setLoading(true);
    try {
      await register(username, email, password);
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
          <h1 className="font-medieval text-3xl text-fantasy-brown mb-2">Créer un compte</h1>
          <p className="text-parchment-600 font-body">Rejoignez l'aventure des Terres Fabuleuses</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-body text-parchment-700 mb-1">Pseudo</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="fantasy-input"
              required
              minLength={3}
            />
          </div>
          <div>
            <label className="block text-sm font-body text-parchment-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="fantasy-input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-body text-parchment-700 mb-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="fantasy-input"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-body text-parchment-700 mb-1">Confirmer le mot de passe</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="fantasy-input"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="fantasy-button w-full text-center">
            {loading ? 'Inscription...' : "S'inscrire"}
          </button>
        </form>

        <p className="text-center mt-6 text-parchment-600 text-sm">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-fantasy-gold hover:underline font-semibold">
            Se connecter
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
