import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginScreen } from './pages/Login';
import { AdminPanel } from './components/AdminPanel';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { CasoPerfeito } from './pages/CasoPerfeito';
import { useAuth } from './contexts/AuthContext';
import { useProductivity } from './contexts/ProductivityContext';
import { CasoPerfeitoProvider } from './contexts/CasoPerfeitoContext';

function App() {
  const { currentUser, isAdmin } = useAuth();
  const { supervisors } = useProductivity(); // AdminPanel still needs supervisors

  const isLoggedIn = !!currentUser || isAdmin;

  return (
    <Routes>
      <Route path="/login" element={
        !isLoggedIn ? (
          <LoginScreen />
        ) : <Navigate to="/" replace />
      } />

      <Route element={
        <MainLayout />
      }>
        <Route path="/" element={
          isLoggedIn ? (
            <Dashboard />
          ) : <Navigate to="/login" replace />
        } />

        <Route path="/admin" element={
          isLoggedIn && isAdmin ? (
            <AdminPanel supervisors={supervisors} />
          ) : <Navigate to="/" replace />
        } />

        <Route path="/caso-perfeito" element={
          isLoggedIn ? (
            <CasoPerfeitoProvider>
              <CasoPerfeito />
            </CasoPerfeitoProvider>
          ) : <Navigate to="/login" replace />
        } />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
