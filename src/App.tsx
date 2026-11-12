import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import { NotFoundPage } from './pages/NotFoundPage';

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
              <Route path="/atrium" element={<LandingPage />} />
              <Route path="/clubhouse" element={<LandingPage />} />
              <Route path="/profile/:username" element={<ProfilePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/me" element={<ProfilePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};
