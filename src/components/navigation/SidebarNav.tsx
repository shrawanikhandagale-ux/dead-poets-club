import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Coffee,
  Grid3X3,
  Bookmark,
  User,
  Sparkles,
  ScrollText,
  Feather,
  Compass,
  LogOut,
  Flame,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SEED_BOOKS } from '../../data/seedBooks';
import { PixelAvatar } from '../avatar/PixelAvatar';

export const SidebarNav: React.FC = () => {
  const { user, profile, shelves, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Home Shelf', path: '/', icon: Compass, badge: 'Main' },
    { name: 'Grand Library', path: '/library', icon: BookOpen, badge: 'Archive' },
    { name: 'Author Spotlight', path: '/authors', icon: Feather, badge: 'Murakami' },
    { name: 'The Poem Jar', path: '/poems', icon: ScrollText, badge: '50¢' },
    { name: 'Daily Crossword', path: '/crossword', icon: Grid3X3, badge: 'Streak' },
    { name: 'Virtual Café', path: '/cafe', icon: Coffee, badge: 'Lounge' },
    { name: 'My Shelves', path: '/shelves', icon: Bookmark, badge: `${shelves.length}` },
    {
      name: 'Character Atelier',
      path: '/character-creator',
      icon: Sparkles,
      badge: '8-Bit',
    },
    {
      name: 'Library Card',
      path: user ? `/profile/${user.username}` : '/login',
      icon: User,
      badge: 'Identity',
    },
  ];


  return (
    <aside className="hidden lg:flex flex-col w-72 h-screen fixed left-0 top-0 bg-[#FCF8F2] border-r-2 border-[#443223] z-40 text-[#443223] select-none p-5 justify-between shadow-[4px_0px_0px_rgba(68,50,35,0.06)]">
      {/* Header Club Seal */}
      <div>
        <NavLink
          to="/"
          className="group flex items-center gap-3 pb-5 border-b-2 border-[#443223] cursor-pointer text-decoration-none"
        >
          <div className="w-10 h-10 rounded bg-[#755151] border-2 border-[#443223] flex items-center justify-center shadow-[2px_2px_0px_#443223] group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-all">
            <Feather className="w-5 h-5 text-[#FFF9F3]" />
          </div>
          <div>
            <h1 className="font-editorial text-base tracking-wide font-bold text-[#443223] leading-tight">
              DEAD POETS CLUB
            </h1>
            <p className="text-[10px] font-typewriter text-[#72583E] tracking-widest uppercase">
              Living in the books
            </p>
          </div>
        </NavLink>

        {/* Primary Navigation Links */}
        <nav className="mt-5 flex flex-col gap-1.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3 py-2 rounded font-typewriter text-xs font-bold transition-all text-decoration-none border-2 ${
                  isActive
                    ? 'bg-[#755151] text-[#FFF9F3] border-[#443223] shadow-[3px_3px_0px_#443223]'
                    : 'text-[#443223] border-transparent hover:bg-[#DBC4A5]/40 hover:border-[#A08670]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-[#FFF9F3]' : 'text-[#755151]'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>

                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase ${
                    isActive
                      ? 'bg-white/20 text-[#FFF9F3]'
                      : 'bg-[#DBC4A5]/40 text-[#72583E]'
                  }`}
                >
                  {item.badge}
                </span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer: Mini Borrower Identity */}
      <div className="border-t-2 border-[#443223] pt-4">
        {user ? (
          <div className="p-3 bg-[#FFF9F3] border-2 border-[#443223] shadow-[2px_2px_0px_#443223] rounded flex items-center justify-between">
            <NavLink
              to={`/profile/${user.username}`}
              className="flex items-center gap-2.5 text-decoration-none group"
            >
              <div className="w-9 h-9 rounded border-2 border-[#1A1614] bg-[#FCF8F2] flex items-center justify-center shadow-[2px_2px_0px_#1A1614] overflow-hidden flex-shrink-0 relative group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-all">
                <PixelAvatar
                  config={profile?.avatar_config}
                  size="xs"
                  viewMode="bust"
                />
                <span className="w-2 h-2 rounded-full bg-green-600 border border-[#1A1614] absolute bottom-0 right-0" />
              </div>
              <div className="truncate max-w-[120px]">
                <span className="font-typewriter text-xs font-bold text-[#443223] block truncate group-hover:text-[#755151]">
                  {profile?.display_name || user.username}
                </span>
                <span className="text-[10px] font-mono text-[#755151]">
                  * {profile?.avatar_config?.mbti || 'INTJ'}
                </span>
              </div>
            </NavLink>

            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-1.5 hover:bg-[#DBC4A5]/40 rounded text-[#72583E] cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <NavLink
            to="/login"
            className="btn-primary w-full justify-center text-xs py-2 uppercase"
          >
            <span>Sign In / Join Club</span>
          </NavLink>
        )}
      </div>
    </aside>
  );
};
