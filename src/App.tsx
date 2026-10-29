import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { LibraryPage } from './pages/LibraryPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { TheMarginsPage } from './pages/TheMarginsPage';
import { ShelvesPage } from './pages/ShelvesPage';
import { ProfilePage } from './pages/ProfilePage';
import { CafePage } from './pages/CafePage';
import { CrosswordPage } from './pages/CrosswordPage';
import { PoemJarPage } from './pages/PoemJarPage';
import { AuthorSpotlightPage } from './pages/AuthorSpotlightPage';
import { ClubhousePage } from './pages/ClubhousePage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { CharacterCreatorPage } from './pages/CharacterCreatorPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Core Layout Routes */}
            <Route element={<AppLayout />}>
              {/* Primary Navigation Destinations (Section 3) */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/cafe" element={<CafePage />} />
              <Route path="/reviews" element={<ReviewsPage />} />
              <Route path="/margins" element={<TheMarginsPage />} />
              <Route path="/shelves" element={<ShelvesPage />} />
              <Route path="/my-shelf" element={<ShelvesPage />} />

              {/* Secondary Club Quarters & Profiles */}
              <Route path="/authors" element={<AuthorSpotlightPage />} />
              <Route path="/crossword" element={<CrosswordPage />} />
              <Route path="/poems" element={<PoemJarPage />} />
              <Route path="/character-creator" element={<CharacterCreatorPage />} />
              <Route path="/avatar" element={<CharacterCreatorPage />} />
              <Route path="/clubhouse" element={<ClubhousePage />} />
              <Route path="/profile/:username" element={<ProfilePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/me" element={<ProfilePage />} />
            </Route>

            {/* Catch-all redirect to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
      <SpeedInsights />
    </BrowserRouter>
  );
};
