import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { ClubhousePage } from './pages/ClubhousePage';
import { LibraryPage } from './pages/LibraryPage';
import { ShelvesPage } from './pages/ShelvesPage';
import { ProfilePage } from './pages/ProfilePage';
import { PlaceholderRoomPage } from './pages/PlaceholderRoomPage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

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
              path="/cafe"
              element={
                <ProtectedRoute>
                  <PlaceholderRoomPage type="cafe" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/crossword"
              element={
                <ProtectedRoute>
                  <PlaceholderRoomPage type="crossword" />
                </ProtectedRoute>
              }
            />
            <Route path="/profile/:username" element={<ProfilePage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};
