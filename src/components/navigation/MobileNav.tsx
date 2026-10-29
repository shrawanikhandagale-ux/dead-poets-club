import React from 'react';
import { NavLink } from 'react-router-dom';
import { Compass, BookOpen, Coffee, MessageSquareQuote, Feather, Bookmark } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { soundEngine } from '../../lib/audioEngine';

export const MobileNav: React.FC = () => {
  const { user } = useAuth();

  // SECTION 3 SPECIFICATION: Home | Library | Cafeteria | Reviews | The Margins | My Shelf
  const navItems = [
    { name: 'Home', path: '/', icon: Compass },
    { name: 'Library', path: '/library', icon: BookOpen },
    { name: 'Café', path: '/cafe', icon: Coffee },
    { name: 'Reviews', path: '/reviews', icon: MessageSquareQuote },
    { name: 'Margins', path: '/margins', icon: Feather },
    { name: 'Shelf', path: '/shelves', icon: Bookmark },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-[#1A1614] border-t border-[#382D24] z-40 px-1 py-2 flex items-center justify-around shadow-[0px_-2px_12px_rgba(0,0,0,0.4)]">
      {navItems.map(item => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => soundEngine.playClick()}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-1.5 py-1 rounded font-typewriter text-[9px] sm:text-[10px] font-bold transition-all text-decoration-none ${
                isActive
                  ? 'text-[#FAF4EB] scale-105'
                  : 'text-[#A08670] hover:text-[#FAF4EB]'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            <span>{item.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
