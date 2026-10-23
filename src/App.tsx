import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { LibraryPage } from './pages/LibraryPage';
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
      <AuthProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Core Layout Routes */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/authors" element={<AuthorSpotlightPage />} />
            <Route path="/poems" element={<PoemJarPage />} />
            <Route path="/crossword" element={<CrosswordPage />} />
            <Route path="/cafe" element={<CafePage />} />

            {/* Member Protected Routes */}
            <Route
              path="/clubhouse"
              element={
                <ProtectedRoute>
                  <ClubhousePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shelves"
              element={
                <ProtectedRoute>
                  <ShelvesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/character-creator"
              element={<CharacterCreatorPage />}
            />
            <Route
              path="/avatar"
              element={<CharacterCreatorPage />}
            />
            <Route path="/profile/:username" element={<ProfilePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/me" element={<ProfilePage />} />
          </Route>


          {/* Catch-all redirect to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};
