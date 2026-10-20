import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { SidebarNav } from '../navigation/SidebarNav';
import { MobileNav } from '../navigation/MobileNav';
import { Feather, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { triggerInkSplatter } from '../../lib/animeAnimations';

export const AppLayout: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#141210] text-[#f0eae1] flex flex-col">
      {/* Photocopied texture overlay */}
      <div className="texture-overlay" />

      {/* Desktop Persistent Sidebar */}
      <SidebarNav />

      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 z-30 bg-[#14110f]/95 border-b border-[#d3a66d]/20 backdrop-blur-md px-4 py-3 flex items-center justify-between">
        <NavLink
          to="/"
          onClick={(e) => triggerInkSplatter(e.clientX, e.clientY)}
          className="flex items-center gap-2.5 text-decoration-none"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#784743] to-[#401f1c] border border-[#d3a66d]/50 flex items-center justify-center shadow">
            <Feather className="w-4 h-4 text-[#e8c18e]" />
          </div>
          <span className="font-serif text-sm font-bold tracking-wider text-[#f0eae1]">
            DEAD POETS CLUB
          </span>
        </NavLink>

        {user ? (
          <NavLink
            to={`/profile/${user.username}`}
            className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full bg-[#1e1916] border border-[#39322c] text-xs font-mono text-[#e8c18e]"
          >
            <span className="w-2 h-2 rounded-full bg-[#8e9c82] animate-pulse" />
            <span>@{user.username}</span>
          </NavLink>
        ) : (
          <NavLink
            to="/login"
            className="text-xs font-serif text-[#e8c18e] bg-[#784743] px-3 py-1.5 rounded border border-[#d3a66d]/30"
          >
            Sign In
          </NavLink>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-72 pb-20 lg:pb-8">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
};
