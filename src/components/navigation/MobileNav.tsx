import React from 'react';
import { NavLink } from 'react-router-dom';
import { Compass, BookOpen, Coffee, Users, User, Grid3X3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PixelAvatar } from '../avatar/PixelAvatar';
import { soundEngine } from '../../lib/audioEngine';

export const MobileNav: React.FC = () => {
  const { user, profile } = useAuth();

  const navItems = [
    { name: 'Home', path: '/', icon: Compass },
    { name: 'Cafeteria', path: '/cafe', icon: Coffee },
    { name: 'Library', path: '/library', icon: BookOpen },
    { name: 'Community', path: '/clubhouse', icon: Users },
    { name: 'Profile', path: user ? `/profile/${user.username}` : '/login', icon: User, isAvatar: Boolean(user) },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-[#1A1614] border-t border-[#382D24] z-40 px-2 py-2 flex items-center justify-around shadow-[0px_-2px_12px_rgba(0,0,0,0.4)]">
      {navItems.map(item => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => soundEngine.playClick()}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1 rounded font-typewriter text-[10px] font-bold transition-all text-decoration-none ${
                isActive
                  ? 'text-[#FAF4EB] scale-105'
                  : 'text-[#A08670] hover:text-[#FAF4EB]'
              }`
            }
          >
            {item.isAvatar ? (
              <div className="w-5 h-5 rounded border border-[#A08670] overflow-hidden flex items-center justify-center bg-[#231D19]">
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
