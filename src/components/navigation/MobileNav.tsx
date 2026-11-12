import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Sparkles, BookOpen, Coffee, Feather } from 'lucide-react';
import { soundEngine } from '../../lib/audioEngine';

export const MobileNav: React.FC = () => {
  const location = useLocation();

  // Primary Destinations (Strictly 4)
  const navItems = [
    { name: 'The Atrium', path: '/', icon: Sparkles },
    { name: 'Library', path: '/library', icon: BookOpen },
    { name: 'Cafeteria', path: '/cafe', icon: Coffee },
    { name: 'Community', path: '/margins', icon: Feather },
  ];

  const isItemActive = (path: string) => {
    if (path === '/') {
      return (
        location.pathname === '/' ||
        location.pathname === '/atrium' ||
        location.pathname === '/clubhouse'
      );
    }
    if (path === '/margins') {
      return location.pathname === '/margins' && !location.search.includes('section=marginalia');
    }
    return location.pathname === path;
  };

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-[#1A1614] border-t border-[#382D24] z-40 px-2 py-2 flex items-center justify-around shadow-[0px_-2px_12px_rgba(0,0,0,0.4)]">
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = isItemActive(item.path);
        return (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => soundEngine.playClick()}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded font-sans text-[11px] font-medium transition-all text-decoration-none ${
              isActive
                ? 'text-[#FAF4EB] scale-105 font-semibold'
                : 'text-[#A08670] hover:text-[#FAF4EB]'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-[#FAF4EB]' : 'text-[#A08670]'}`} />
            <span>{item.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
