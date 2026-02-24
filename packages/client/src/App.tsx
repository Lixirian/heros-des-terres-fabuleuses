import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './hooks/useAuth';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import CharacterSheet from './pages/CharacterSheet';
import CreateCharacter from './pages/CreateCharacter';
import CombatHelper from './pages/CombatHelper';
import BookCodes from './pages/BookCodes';
import MapView from './pages/MapView';
import RulesPage from './pages/RulesPage';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-fantasy-gold font-medieval text-2xl">Chargement...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<HomePage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="character/:id" element={<CharacterSheet />} />
          <Route path="create" element={<CreateCharacter />} />
          <Route path="combat" element={<CombatHelper />} />
          <Route path="combat/:characterId" element={<CombatHelper />} />
          <Route path="books" element={<BookCodes />} />
          <Route path="books/:bookId" element={<BookCodes />} />
          <Route path="map" element={<MapView />} />
          <Route path="rules" element={<RulesPage />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}
