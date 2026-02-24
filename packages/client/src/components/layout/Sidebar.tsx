import { NavLink } from 'react-router-dom';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { to: '/', label: 'Accueil', icon: '🏰' },
  { to: '/create', label: 'Créer un personnage', icon: '⚔️' },
  { to: '/combat', label: 'Combat', icon: '🎲' },
  { to: '/books', label: 'Livres & Codes', icon: '📖' },
  { to: '/map', label: 'Carte', icon: '🗺️' },
  { to: '/rules', label: 'Règles', icon: '📜' },
  { to: '/profile', label: 'Profil', icon: '👤' },
];

export default function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Backdrop mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <nav
        className={`
          fixed md:static z-50 top-0 left-0 h-full md:h-auto
          w-64 bg-gradient-to-b from-parchment-900 to-parchment-800
          border-r-2 border-fantasy-gold/30
          transform transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          md:min-h-[calc(100vh-60px)]
        `}
      >
        <div className="p-4 md:pt-6 flex flex-col gap-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-body
                ${isActive
                  ? 'bg-fantasy-gold/20 text-fantasy-gold border-l-4 border-fantasy-gold'
                  : 'text-parchment-300 hover:bg-parchment-700/50 hover:text-parchment-100 border-l-4 border-transparent'
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
