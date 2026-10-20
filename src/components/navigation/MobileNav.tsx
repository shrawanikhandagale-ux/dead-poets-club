import React from 'react';
import { NavLink } from 'react-router-dom';
import { Compass, BookOpen, Coffee, Grid3X3, Bookmark, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { triggerInkSplatter } from '../../lib/animeAnimations';

export const MobileNav: React.FC = () => {
  const { user } = useAuth();

  const links = [
    { name: 'Clubhouse', path: '/clubhouse', icon: Compass },
    { name: 'Library', path: '/library', icon: BookOpen },
    { name: 'Café', path: '/cafe', icon: Coffee },
    { name: 'Crossword', path: '/crossword', icon: Grid3X3 },
    { name: 'Shelves', path: '/shelves', icon: Bookmark },
    { name: 'Profile', path: user ? `/profile/${user.username}` : '/login', icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#14110f]/95 border-t border-[#d3a66d]/25 backdrop-blur-md z-50 px-2 py-2 flex items-center justify-around shadow-2xl">
      {links.map(link => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.path}
            to={link.path}
            onClick={(e) => triggerInkSplatter(e.clientX, e.clientY)}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-2.5 rounded-md transition-colors text-decoration-none ${
                isActive ? 'text-[#e8c18e]' : 'text-[#8e8578] hover:text-[#f0eae1]'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-sans font-medium">{link.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
