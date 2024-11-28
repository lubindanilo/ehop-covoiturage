import { Link, useLocation } from 'react-router-dom';
import { Home, Search, MessageCircle, Euro, User } from 'lucide-react';
import { getValidUrl } from '../lib/firebase';

export const BottomNav = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === getValidUrl(path);

  const navItems = [
    { path: '/', icon: Home, label: 'Accueil' },
    { path: '/search', icon: Search, label: 'Recherche' },
    { path: '/messages', icon: MessageCircle, label: 'Messages' },
    { path: '/pricing', icon: Euro, label: 'Forfait' },
    { path: '/profile', icon: User, label: 'Profil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="max-w-lg mx-auto px-4">
        <div className="flex justify-between py-3">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={getValidUrl(path)}
              className={`flex flex-col items-center ${
                isActive(path) ? 'text-indigo-600' : 'text-gray-500'
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs mt-1">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};