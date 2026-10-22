import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { SidebarNav } from '../navigation/SidebarNav';
import { MobileNav } from '../navigation/MobileNav';
import { Feather, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AppLayout: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#FFF9F3] text-[#443223] flex flex-col antialiased">
      {/* Subtle halftone grunge paper texture overlay */}
      <div className="grunge-overlay" />

      {/* Desktop Persistent Sidebar */}
      <SidebarNav />

      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 z-30 bg-[#FCF8F2]/95 border-b-2 border-[#443223] backdrop-blur-md px-4 py-3 flex items-center justify-between shadow-sm">
        <NavLink
          to="/"
          className="flex items-center gap-2 text-decoration-none"
        >
          <div className="w-8 h-8 rounded bg-[#755151] border-2 border-[#443223] flex items-center justify-center shadow-[1.5px_1.5px_0px_#443223]">
            <Feather className="w-4 h-4 text-[#FFF9F3]" />
          </div>
          <span className="font-editorial text-sm font-bold tracking-wider text-[#443223]">
            DEAD POETS CLUB
          </span>
        </NavLink>

        {user ? (
          <NavLink
            to={`/profile/${user.username}`}
            className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#FFF9F3] border border-[#443223] text-xs font-mono text-[#755151]"
          >
            <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
            <span>@{user.username}</span>
          </NavLink>
        ) : (
          <NavLink
            to="/login"
            className="text-xs font-typewriter font-bold text-[#FFF9F3] bg-[#755151] px-3 py-1 rounded border border-[#443223] shadow-[1px_1px_0px_#443223]"
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
