/**
 * MonitoreoRS Sucre — App.jsx
 * Router principal con rutas protegidas por JWT
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.js';

// Layout
import MainLayout from './components/layout/MainLayout.jsx';

// Pages
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import VisualizacionRutas from './pages/VisualizacionRutas.jsx';
import PuntosCriticos from './pages/PuntosCriticos.jsx';
import ControlRecorridos from './pages/ControlRecorridos.jsx';
import Reportes from './pages/Reportes.jsx';
import HorariosEstablecidos from './pages/HorariosEstablecidos.jsx';
import Administracion from './pages/Administracion.jsx';

// Loader mientras se restaura la sesión
import Loader from './components/shared/Loader.jsx';

/**
 * Componente que protege rutas: redirige a /login si no hay token válido.
 */
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader fullscreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/**
 * Ruta exclusiva para administradores.
 */
function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <Loader fullscreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.rol !== 'admin') return <Navigate to="/dashboard" replace />;

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={<Login />} />

        {/* Ruta raíz → redirige al dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Rutas protegidas bajo MainLayout */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="rutas" element={<VisualizacionRutas />} />
          <Route path="puntos-criticos" element={<PuntosCriticos />} />
          <Route path="recorridos" element={<ControlRecorridos />} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="horarios" element={<HorariosEstablecidos />} />
          <Route
            path="administracion"
            element={
              <AdminRoute>
                <Administracion />
              </AdminRoute>
            }
          />
        </Route>

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
