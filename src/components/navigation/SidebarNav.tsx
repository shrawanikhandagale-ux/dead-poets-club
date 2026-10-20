import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Compass,
  BookOpen,
  Coffee,
  Grid3X3,
  Bookmark,
  User,
  LogOut,
  Sparkles,
  ChevronRight,
  BookMarked,
  Feather,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { SEED_BOOKS } from '../../data/seedBooks';
import { triggerInkSplatter } from '../../lib/animeAnimations';

export const SidebarNav: React.FC = () => {
  const { user, profile, shelves, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Find currently reading book
  const currentlyReadingShelf = shelves.find(s => s.status === 'currently_reading');
  const currentBook = currentlyReadingShelf
    ? SEED_BOOKS.find(b => b.id === currentlyReadingShelf.book_id) || SEED_BOOKS[0]
    : SEED_BOOKS[0];

  const progressPercent = currentBook && currentlyReadingShelf?.progress_pages
    ? Math.min(100, Math.round((currentlyReadingShelf.progress_pages / currentBook.pages) * 100))
    : 56;

  const navItems = [
    { name: 'Clubhouse', path: '/clubhouse', icon: Compass, badge: 'Home' },
    { name: 'Library', path: '/library', icon: BookOpen, badge: '30+ Books' },
    { name: 'The Café', path: '/cafe', icon: Coffee, badge: 'Cozy Room' },
    { name: 'Daily Crossword', path: '/crossword', icon: Grid3X3, badge: 'Streak' },
    { name: 'My Shelves', path: '/shelves', icon: Bookmark, badge: `${shelves.length} Saved` },
    {
      name: 'Poet Profile',
      path: user ? `/profile/${user.username}` : '/login',
      icon: User,
      badge: 'You',
    },
  ];

  const handleLinkClick = (e: React.MouseEvent) => {
    triggerInkSplatter(e.clientX, e.clientY);
  };

  return (
    <aside className="hidden lg:flex flex-col w-72 h-screen fixed left-0 top-0 bg-[#14110f]/95 border-r border-[#d3a66d]/20 backdrop-blur-md z-40 text-[#f0eae1] select-none p-5 justify-between">
      {/* Club Brand Seal Header */}
      <div>
        <NavLink
          to="/"
          onClick={handleLinkClick}
          className="group flex items-center gap-3.5 pb-6 border-b border-[#d3a66d]/15 cursor-pointer text-decoration-none"
        >
          <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-[#784743] to-[#401f1c] border border-[#d3a66d]/50 flex items-center justify-center shadow-lg group-hover:border-[#d3a66d] transition-all duration-300">
            <Feather className="w-6 h-6 text-[#e8c18e] group-hover:rotate-12 transition-transform duration-300" />
          </div>
          <div>
            <h1 className="font-serif text-lg tracking-wider font-semibold text-[#f0eae1] group-hover:text-[#e8c18e] transition-colors leading-tight">
              DEAD POETS CLUB
            </h1>
            <p className="text-[11px] font-sans text-[#a39b8f] tracking-widest uppercase">
              Literary Sanctuary
            </p>
          </div>
        </NavLink>

        {/* Primary Navigation Links */}
        <nav className="mt-6 flex flex-col gap-1.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group text-decoration-none ${
                    isActive
                      ? 'bg-gradient-to-r from-[#784743]/40 to-[#784743]/15 text-[#e8c18e] border-l-4 border-[#d3a66d] shadow-sm pl-4'
                      : 'text-[#a39b8f] hover:text-[#f0eae1] hover:bg-[#201b17]'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-[#d3a66d]' : 'text-[#8e8578]'
                    }`}
                  />
                  <span className="font-sans tracking-wide">{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-mono ${
                      isActive
                        ? 'bg-[#d3a66d]/20 text-[#e8c18e] border border-[#d3a66d]/40'
                        : 'bg-[#1f1b18] text-[#7a7266] border border-[#2e2722]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Currently Reading Card & User Badge */}
      <div className="flex flex-col gap-4">
        {/* Mini "Currently Reading" Drawer Card */}
        {currentBook && (
          <div className="p-3.5 rounded-lg bg-[#1a1614] border border-[#d3a66d]/25 shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#d3a66d] flex items-center gap-1.5">
                <BookMarked className="w-3 h-3 text-[#d3a66d]" /> CURRENTLY READING
              </span>
              <span className="text-[11px] font-mono text-[#a39b8f]">{progressPercent}%</span>
            </div>

            <div className="flex gap-3 items-center">
              <img
                src={currentBook.cover_url}
                alt={currentBook.title}
                className="w-10 h-14 object-cover rounded shadow border border-[#39332d]"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-serif font-medium text-[#f0eae1] truncate">
                  {currentBook.title}
                </h4>
                <p className="text-[11px] text-[#8e8578] truncate">{currentBook.author}</p>
                {/* Progress bar */}
                <div className="w-full bg-[#2a241f] h-1.5 rounded-full mt-2 overflow-hidden border border-[#3e342b]">
                  <div
                    className="bg-gradient-to-r from-[#784743] to-[#d3a66d] h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Profile Card / Login Button */}
        {user ? (
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#181412] border border-[#2e2722]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#784743] border border-[#d3a66d]/50 flex items-center justify-center font-serif text-xs font-bold text-[#e8c18e]">
                {user.displayName.substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#f0eae1] truncate">{user.displayName}</p>
                <p className="text-[10px] text-[#8e8578] truncate">@{user.username}</p>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="p-1.5 text-[#8e8578] hover:text-[#d3a66d] hover:bg-[#25201b] rounded transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <NavLink
            to="/login"
            className="w-full py-2.5 px-4 bg-[#784743] hover:bg-[#91544f] text-[#f0eae1] font-serif text-sm text-center rounded-lg border border-[#d3a66d]/30 shadow-md transition-all text-decoration-none block"
          >
            Enter Sanctuary (Sign In)
          </NavLink>
        )}
      </div>
    </aside>
  );
};
