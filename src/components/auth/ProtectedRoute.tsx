import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Feather } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#141210] flex flex-col items-center justify-center text-[#f0eae1]">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-2 border-[#d3a66d]/30 border-t-[#d3a66d] animate-spin" />
          <Feather className="w-6 h-6 text-[#d3a66d] absolute" />
        </div>
        <p className="mt-4 font-serif text-sm tracking-widest text-[#a39b8f] uppercase">
          Unfolding the Sanctuary...
        </p>
      </div>
    );
  }

  if (!user) {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?returnTo=${returnTo}`} replace />;
  }

  return <>{children}</>;
};
