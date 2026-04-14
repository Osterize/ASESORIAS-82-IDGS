import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Auth
import Login from './pages/auth/Login';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import AdminSesiones from './pages/admin/Sesiones';
import AdminUsuarios from './pages/admin/Usuarios';
import AdminAsignaciones from './pages/admin/Asignaciones';
import { AdminJustificantes, AdminAuditoria } from './pages/admin/Justificantes';
import AdminReportes from './pages/admin/Reportes';
import AdminBackup from './pages/admin/Backup';

// Docente
import {
  DocenteDashboard, DocenteSesiones, DocenteAlumnos,
  DocenteAvances, DocenteJustificantes
} from './pages/docente';

// Alumno
import {
  AlumnoDashboard, AlumnoSesiones, AlumnoAvance, AlumnoJustificantes
} from './pages/alumno';

// Shared
import Perfil from './pages/Perfil';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,.12)'
            },
            success: { iconTheme: { primary: 'var(--success)', secondary: '#fff' } },
            error: { iconTheme: { primary: 'var(--danger)', secondary: '#fff' } }
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* ── ADMIN ── */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute roles={['administrador']}><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/sesiones" element={
            <ProtectedRoute roles={['administrador']}><AdminSesiones /></ProtectedRoute>
          } />
          <Route path="/admin/usuarios" element={
            <ProtectedRoute roles={['administrador']}><AdminUsuarios /></ProtectedRoute>
          } />
          <Route path="/admin/asignaciones" element={
            <ProtectedRoute roles={['administrador']}><AdminAsignaciones /></ProtectedRoute>
          } />
          <Route path="/admin/justificantes" element={
            <ProtectedRoute roles={['administrador']}><AdminJustificantes /></ProtectedRoute>
          } />
          <Route path="/admin/reportes" element={
            <ProtectedRoute roles={['administrador']}><AdminReportes /></ProtectedRoute>
          } />
          <Route path="/admin/auditoria" element={
            <ProtectedRoute roles={['administrador']}><AdminAuditoria /></ProtectedRoute>
          } />
          <Route path="/admin/backup" element={
            <ProtectedRoute roles={['administrador']}><AdminBackup /></ProtectedRoute>
          } />
          <Route path="/admin/perfil" element={
            <ProtectedRoute roles={['administrador']}><Perfil /></ProtectedRoute>
          } />

          {/* ── DOCENTE ── */}
          <Route path="/docente/dashboard" element={
            <ProtectedRoute roles={['docente']}><DocenteDashboard /></ProtectedRoute>
          } />
          <Route path="/docente/sesiones" element={
            <ProtectedRoute roles={['docente']}><DocenteSesiones /></ProtectedRoute>
          } />
          <Route path="/docente/alumnos" element={
            <ProtectedRoute roles={['docente']}><DocenteAlumnos /></ProtectedRoute>
          } />
          <Route path="/docente/avances" element={
            <ProtectedRoute roles={['docente']}><DocenteAvances /></ProtectedRoute>
          } />
          <Route path="/docente/justificantes" element={
            <ProtectedRoute roles={['docente']}><DocenteJustificantes /></ProtectedRoute>
          } />
          <Route path="/docente/perfil" element={
            <ProtectedRoute roles={['docente']}><Perfil /></ProtectedRoute>
          } />

          {/* ── ALUMNO ── */}
          <Route path="/alumno/dashboard" element={
            <ProtectedRoute roles={['alumno']}><AlumnoDashboard /></ProtectedRoute>
          } />
          <Route path="/alumno/sesiones" element={
            <ProtectedRoute roles={['alumno']}><AlumnoSesiones /></ProtectedRoute>
          } />
          <Route path="/alumno/avance" element={
            <ProtectedRoute roles={['alumno']}><AlumnoAvance /></ProtectedRoute>
          } />
          <Route path="/alumno/justificantes" element={
            <ProtectedRoute roles={['alumno']}><AlumnoJustificantes /></ProtectedRoute>
          } />
          <Route path="/alumno/perfil" element={
            <ProtectedRoute roles={['alumno']}><Perfil /></ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
