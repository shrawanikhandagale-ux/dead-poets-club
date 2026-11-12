import React from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowLeft, BookOpen, Coffee } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-5 py-16">
      <div className="catalog-card max-w-lg w-full p-8 sm:p-10 text-center space-y-5 bg-[#FCF7EE]">
        <span className="font-mono text-xs font-medium uppercase tracking-widest text-[#6E3E44]">
          Page 404 · Uncatalogued
        </span>

        <h1 className="type-page-title text-[#2E2118] leading-tight">
          You&apos;ve reached a page that doesn&apos;t exist. Very postmodern.
        </h1>

        <p className="font-sans text-sm text-[#684F38] max-w-md mx-auto leading-relaxed">
          Either the archivist misfiled this corridor, or you wandered past the edge of the map. Both are respectable pastimes.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <NavLink to="/" className="btn-primary text-xs py-2.5 px-5">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Entrance</span>
          </NavLink>
          <NavLink to="/library" className="btn-secondary text-xs py-2.5 px-4">
            <BookOpen className="w-4 h-4" />
            <span>Library</span>
          </NavLink>
          <NavLink to="/cafe" className="btn-secondary text-xs py-2.5 px-4">
            <Coffee className="w-4 h-4" />
            <span>Cafeteria</span>
          </NavLink>
        </div>
      </div>
    </div>
  );
};

