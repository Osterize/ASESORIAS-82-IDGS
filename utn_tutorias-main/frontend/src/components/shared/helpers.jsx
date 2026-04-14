import { format, parseISO, isToday, isTomorrow, isPast } from 'date-fns';
import { es } from 'date-fns/locale';

export const ESTADO_CONFIG = {
  programada:            { label: 'Programada',             class: 'badge-blue',   dot: '#0078e7' },
  pendiente_confirmacion:{ label: 'Pendiente confirmación', class: 'badge-yellow', dot: '#d97706' },
  confirmada:            { label: 'Confirmada',             class: 'badge-green',  dot: '#16a34a' },
  completada:            { label: 'Completada',             class: 'badge-gray',   dot: '#64748b' },
  cancelada:             { label: 'Cancelada',              class: 'badge-red',    dot: '#dc2626' },
  no_presentado:         { label: 'No presentado',          class: 'badge-red',    dot: '#dc2626' },
};

export const JUSTIFICANTE_ESTADO = {
  pendiente: { label: 'Pendiente',  class: 'badge-yellow' },
  aprobado:  { label: 'Aprobado',   class: 'badge-green' },
  rechazado: { label: 'Rechazado',  class: 'badge-red' },
};

export const NIVEL_CONFIG = {
  bajo:  { label: 'Bajo',  color: '#dc2626' },
  medio: { label: 'Medio', color: '#d97706' },
  alto:  { label: 'Alto',  color: '#16a34a' },
};

export function EstadoBadge({ estado }) {
  const cfg = ESTADO_CONFIG[estado] || { label: estado, class: 'badge-gray' };
  return <span className={`badge ${cfg.class}`}>{cfg.label}</span>;
}

export function formatFecha(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = typeof dateStr === 'string' ? parseISO(dateStr.split('T')[0]) : new Date(dateStr);
    if (isToday(d)) return 'Hoy';
    if (isTomorrow(d)) return 'Mañana';
    return format(d, "d 'de' MMMM yyyy", { locale: es });
  } catch { return dateStr; }
}

export function formatHora(hora) {
  if (!hora) return '—';
  const [h, m] = hora.split(':');
  const hNum = parseInt(h);
  const ampm = hNum >= 12 ? 'PM' : 'AM';
  const h12 = hNum % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

export function formatDateTime(str) {
  if (!str) return '—';
  try {
    return format(new Date(str), "d MMM yyyy, HH:mm", { locale: es });
  } catch { return str; }
}

export function NombreCompleto({ row }) {
  return (
    <div>
      <div style={{ fontWeight: 500 }}>{row.nombre} {row.apellido_paterno} {row.apellido_materno || ''}</div>
      <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{row.email}</div>
    </div>
  );
}

export function Avatar({ nombre, apellido, size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, var(--utn-blue-600), var(--utn-blue-400))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700, fontSize: size * 0.36, flexShrink: 0
    }}>
      {(nombre?.[0] || '?')}{(apellido?.[0] || '')}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
      <div>
        <h1 style={{ fontSize: 22, color: 'var(--utn-blue-900)', marginBottom: 4 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 14, color: 'var(--gray-500)' }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function LoadingSpinner({ text = 'Cargando...' }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{
        width: 36, height: 36, border: '3px solid var(--gray-200)',
        borderTopColor: 'var(--utn-blue-600)', borderRadius: '50%',
        margin: '0 auto 12px', animation: 'spin 1s linear infinite'
      }} />
      <p style={{ fontSize: 14, color: 'var(--gray-400)' }}>{text}</p>
    </div>
  );
}

export function ConfirmDialog({ title, message, onConfirm, onCancel, danger }) {
  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <h3>{title}</h3>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--gray-600)', fontSize: 14 }}>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
