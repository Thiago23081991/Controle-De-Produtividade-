import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginScreen } from './pages/Login';
import { AdminPanel } from './components/AdminPanel';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { CasoPerfeito } from './pages/CasoPerfeito';
import { Erros } from './pages/Erros';
import { ErrosBko } from './pages/ErrosBko';
import { useAuth } from './contexts/AuthContext';
import { useProductivity } from './contexts/ProductivityContext';
import { CasoPerfeitoProvider } from './contexts/CasoPerfeitoContext';
import { Backlog } from './pages/Backlog';
import { BacklogProvider } from './contexts/BacklogContext';
import { CasosBR01 } from './pages/CasosBR01';
import { VozCampo } from './pages/VozCampo';
import { ErrosN1 } from './pages/ErrosN1';
import { ReclameAqui } from './pages/ReclameAqui';

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

        <Route path="/erros" element={
          isLoggedIn ? (
            <Erros />
          ) : <Navigate to="/login" replace />
        } />

        <Route path="/erros-bko" element={
          isLoggedIn && (isAdmin || currentUser?.is_bko_expert) ? (
            <ErrosBko />
          ) : <Navigate to="/" replace />
        } />

        <Route path="/backlog" element={
          isLoggedIn ? (
            <BacklogProvider>
              <Backlog />
            </BacklogProvider>
          ) : <Navigate to="/login" replace />
        } />

        <Route path="/casos-br01" element={
          isLoggedIn ? (
            <CasosBR01 />
          ) : <Navigate to="/login" replace />
        } />

        <Route path="/voz-campo" element={
          isLoggedIn ? (
            <VozCampo />
          ) : <Navigate to="/login" replace />
        } />

        <Route path="/erros-n1" element={
          isLoggedIn && (isAdmin || currentUser?.is_n1_expert) ? (
            <ErrosN1 />
          ) : <Navigate to="/" replace />
        } />

        <Route path="/reclame-aqui" element={
          isLoggedIn ? (
            <ReclameAqui />
          ) : <Navigate to="/login" replace />
        } />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
