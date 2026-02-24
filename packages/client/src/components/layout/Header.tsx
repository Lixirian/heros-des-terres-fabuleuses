import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-gradient-to-r from-parchment-900 via-parchment-800 to-parchment-900 border-b-2 border-fantasy-gold shadow-lg">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="md:hidden text-parchment-200 hover:text-fantasy-gold transition-colors"
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fantasy-gold to-parchment-500 flex items-center justify-center text-parchment-900 font-medieval text-lg shadow-md">
              H
            </div>
            <h1 className="font-medieval text-xl md:text-2xl text-fantasy-gold hidden sm:block">
              Héros des Terres Fabuleuses
            </h1>
            <h1 className="font-medieval text-xl text-fantasy-gold sm:hidden">
              HTF
            </h1>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <>
              <Link to="/profile" className="text-parchment-200 hover:text-fantasy-gold transition-colors text-sm font-body">
                {user.username}
              </Link>
              <button
                onClick={logout}
                className="text-parchment-400 hover:text-fantasy-red transition-colors text-sm"
              >
                Déconnexion
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
