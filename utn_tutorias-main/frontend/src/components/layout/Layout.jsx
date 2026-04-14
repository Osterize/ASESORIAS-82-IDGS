import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap, LayoutDashboard, CalendarDays, Users, UserCheck,
  FileText, ClipboardList, LogOut, ChevronRight, Menu, X,
  Bell, Settings, BookOpen, TrendingUp, Shield, BarChart2, HardDrive
} from 'lucide-react';

const NAV_CONFIG = {
  administrador: [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/admin/dashboard' },
    { label: 'Sesiones', icon: CalendarDays, to: '/admin/sesiones' },
    { label: 'Asignaciones', icon: UserCheck, to: '/admin/asignaciones' },
    { label: 'Usuarios', icon: Users, to: '/admin/usuarios' },
    { label: 'Justificantes', icon: FileText, to: '/admin/justificantes' },
    { label: 'Reportes', icon: ClipboardList, to: '/admin/reportes' },
    { label: 'Auditoría', icon: Shield, to: '/admin/auditoria' },
    { label: 'Respaldos', icon: HardDrive, to: '/admin/backup' },
  ],
  docente: [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/docente/dashboard' },
    { label: 'Mis Asesorías', icon: CalendarDays, to: '/docente/sesiones' },
    { label: 'Mis Alumnos', icon: Users, to: '/docente/alumnos' },
    { label: 'Avances', icon: TrendingUp, to: '/docente/avances' },
    { label: 'Justificantes', icon: FileText, to: '/docente/justificantes' },
  ],
  alumno: [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/alumno/dashboard' },
    { label: 'Mis Asesorías', icon: CalendarDays, to: '/alumno/sesiones' },
    { label: 'Mi Avance', icon: BookOpen, to: '/alumno/avance' },
    { label: 'Justificantes', icon: FileText, to: '/alumno/justificantes' },
  ]
};

const ROL_LABELS = {
  administrador: { label: 'Administrador', color: 'var(--utn-gold)', bg: '#fef9e7' },
  docente: { label: 'Docente', color: 'var(--utn-blue-600)', bg: 'var(--utn-blue-100)' },
  alumno: { label: 'Alumno', color: 'var(--success)', bg: 'var(--success-light)' }
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navItems = NAV_CONFIG[user?.rol] || [];
  const rolInfo = ROL_LABELS[user?.rol] || {};

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div style={{
      width: 'var(--sidebar-w)',
      height: '100%',
      background: 'var(--utn-blue-900)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      overflow: 'hidden'
    }}>
      {/* Logo */}
      <div style={{
        padding: '24px 20px 20px',
        borderBottom: '1px solid rgba(255,255,255,.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'rgba(255,255,255,.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(255,255,255,.2)'
          }}>
            <GraduationCap size={22} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily: 'Poppins', fontWeight: 700, color: '#fff', fontSize: 15, lineHeight: 1.2 }}>
              UTN Asesorías
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginTop: 1 }}>
              Gestión Académica
            </div>
          </div>
        </div>
      </div>

      {/* User info */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--utn-blue-500), var(--utn-gold))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 10
        }}>
          {user?.nombre?.[0]}{user?.apellido_paterno?.[0]}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>
          {user?.nombre} {user?.apellido_paterno}
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>
          {user?.email}
        </div>
        <span style={{
          display: 'inline-block', marginTop: 8, padding: '2px 8px',
          borderRadius: 20, fontSize: 11, fontWeight: 600,
          background: rolInfo.bg, color: rolInfo.color
        }}>
          {rolInfo.label}
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 12px', overflowY: 'auto' }}>
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 14px', borderRadius: 8,
              marginBottom: 2, textDecoration: 'none',
              fontSize: 14, fontWeight: isActive ? 600 : 400,
              color: isActive ? '#fff' : 'rgba(255,255,255,.65)',
              background: isActive ? 'rgba(255,255,255,.12)' : 'transparent',
              transition: 'all .15s',
              borderLeft: isActive ? '3px solid var(--utn-gold)' : '3px solid transparent'
            })}
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,.08)' }}>
        <NavLink to={`/${user?.rol}/perfil`}
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
            borderRadius: 8, color: 'rgba(255,255,255,.65)', textDecoration: 'none',
            fontSize: 14, marginBottom: 2, transition: 'all .15s' }}
        >
          <Settings size={18} /> Perfil
        </NavLink>
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 14px', borderRadius: 8, width: '100%',
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'rgba(255,100,100,.8)', fontSize: 14, textAlign: 'left',
          transition: 'all .15s'
        }}>
          <LogOut size={18} /> Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar desktop */}
      <div style={{ display: 'flex' }} className="sidebar-desktop">
        <SidebarContent />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(2px)'
        }} onClick={() => setSidebarOpen(false)}>
          <div onClick={e => e.stopPropagation()}
            style={{ position: 'absolute', left: 0, top: 0, bottom: 0 }}>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{
          height: 'var(--header-h)',
          background: '#fff',
          borderBottom: '1px solid var(--gray-200)',
          display: 'flex', alignItems: 'center',
          padding: '0 24px', gap: 16,
          flexShrink: 0, zIndex: 10
        }}>
          <button className="btn btn-icon btn-secondary sidebar-mobile-btn"
            onClick={() => setSidebarOpen(p => !p)}>
            <Menu size={20} />
          </button>

          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--utn-blue-900)' }}>
              Universidad Tecnológica de Nayarit
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="btn btn-icon btn-secondary">
              <Bell size={18} />
            </button>
          </div>
        </header>

        {/* Content */}
        <main style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          background: 'var(--gray-50)'
        }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
        }
        @media (min-width: 769px) {
          .sidebar-mobile-btn { display: none !important; }
        }
      `}</style>
    </div>
  );
}
