import React from 'react';
import { NavLink } from 'react-router-dom';
import { Compass, BookOpen, Coffee, Grid3X3, ScrollText, Sparkles, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PixelAvatar } from '../avatar/PixelAvatar';

export const MobileNav: React.FC = () => {
  const { user, profile } = useAuth();

  const navItems = [
    { name: 'Shelf', path: '/', icon: Compass },
    { name: 'Library', path: '/library', icon: BookOpen },
    { name: 'Café', path: '/cafe', icon: Coffee },
    { name: 'Atelier', path: '/character-creator', icon: Sparkles },
    { name: 'Card', path: user ? `/profile/${user.username}` : '/login', icon: User, isAvatar: Boolean(user) },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-[#FCF8F2] border-t-2 border-[#443223] z-40 px-2 py-2 flex items-center justify-around shadow-[0px_-2px_10px_rgba(68,50,35,0.1)]">
      {navItems.map(item => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1 rounded font-typewriter text-[10px] font-bold transition-all text-decoration-none ${
                isActive
                  ? 'text-[#755151] scale-105'
                  : 'text-[#72583E] hover:text-[#443223]'
              }`
            }
          >
            {item.isAvatar ? (
              <div className="w-5 h-5 rounded border border-[#1A1614] overflow-hidden flex items-center justify-center bg-[#FFF9F3]">
                <PixelAvatar config={profile?.avatar_config} size="xs" viewMode="bust" />
              </div>
            ) : (
              <Icon className="w-4 h-4" />
            )}
            <span>{item.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

