import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

const ROUTE_LABELS = {
  '/dashboard': 'Dashboard',
  '/rutas': 'Visualización de Rutas',
  '/puntos-criticos': 'Puntos Críticos',
  '/recorridos': 'Control de Recorridos',
  '/reportes': 'Reportes',
  '/administracion': 'Administración',
};

function getInitials(name = '') {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getPageLabel(pathname) {
  // exact match first
  if (ROUTE_LABELS[pathname]) return ROUTE_LABELS[pathname];
  // prefix match
  const key = Object.keys(ROUTE_LABELS).find((k) => pathname.startsWith(k + '/'));
  return key ? ROUTE_LABELS[key] : 'MonitoreoRS Sucre';
}

function formatTimeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora mismo';
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  return `hace ${days} d`;
}

export default function Navbar({ onToggleSidebar }) {
  const { user } = useAuth();
  const location = useLocation();

  const [notifCount, setNotifCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const dropdownRef = useRef(null);
  const bellRef = useRef(null);

  const fetchNotifCount = useCallback(async () => {
    try {
      const res = await api.get('/notificaciones', { params: { leida: 0 } });
      const data = res.data;
      // Support both { count, results } and plain array responses
      if (Array.isArray(data)) {
        setNotifCount(data.length);
      } else if (typeof data?.count === 'number') {
        setNotifCount(data.count);
      } else if (Array.isArray(data?.results)) {
        setNotifCount(data.results.length);
      }
    } catch {
      // silently ignore
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoadingNotifs(true);
    try {
      const res = await api.get('/notificaciones', { params: { limit: 5 } });
      const data = res.data;
      if (Array.isArray(data)) {
        setNotifications(data.slice(0, 5));
      } else if (Array.isArray(data?.results)) {
        setNotifications(data.results.slice(0, 5));
      }
    } catch {
      setNotifications([]);
    } finally {
      setLoadingNotifs(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifCount();
    const interval = setInterval(fetchNotifCount, 60000); // poll every minute
    return () => clearInterval(interval);
  }, [fetchNotifCount]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        bellRef.current &&
        !bellRef.current.contains(e.target)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBellClick = () => {
    const next = !dropdownOpen;
    setDropdownOpen(next);
    if (next) {
      fetchNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notificaciones/marcar-leidas');
      setNotifCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, leida: true })));
    } catch {
      // ignore
    }
  };

  // ── Styles ──────────────────────────────────────────────────────────────────

  const navbarStyle = {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    width: '100%',
    height: '56px',
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #EEEEEE',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    boxSizing: 'border-box',
    fontFamily: 'Arial, Helvetica, sans-serif',
  };

  const leftGroupStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  };

  const hamburgerStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '6px',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const hamburgerLineStyle = {
    width: '20px',
    height: '2px',
    backgroundColor: '#212121',
    borderRadius: '2px',
    display: 'block',
  };

  const breadcrumbStyle = {
    fontSize: '15px',
    fontWeight: 600,
    color: '#212121',
    fontFamily: 'Arial, Helvetica, sans-serif',
  };

  const rightGroupStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const bellBtnStyle = {
    position: 'relative',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    lineHeight: 1,
  };

  const badgeStyle = {
    position: 'absolute',
    top: '2px',
    right: '2px',
    minWidth: '16px',
    height: '16px',
    backgroundColor: '#C62828',
    borderRadius: '8px',
    fontSize: '10px',
    fontWeight: 700,
    color: '#FFFFFF',
    fontFamily: 'Arial, Helvetica, sans-serif',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 3px',
    boxSizing: 'border-box',
    lineHeight: 1,
  };

  const dropdownStyle = {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    width: '320px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #EEEEEE',
    borderRadius: '8px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.14)',
    zIndex: 300,
    overflow: 'hidden',
    fontFamily: 'Arial, Helvetica, sans-serif',
  };

  const dropdownHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderBottom: '1px solid #EEEEEE',
  };

  const dropdownTitleStyle = {
    fontSize: '14px',
    fontWeight: 700,
    color: '#212121',
    fontFamily: 'Arial, Helvetica, sans-serif',
    margin: 0,
  };

  const markReadBtnStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '12px',
    color: '#1B5E20',
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontWeight: 600,
    padding: '2px 4px',
  };

  const notifItemStyle = (leida) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    padding: '10px 16px',
    borderBottom: '1px solid #F5F5F5',
    backgroundColor: leida ? '#FFFFFF' : '#F5F5F5',
    cursor: 'default',
  });

  const notifMsgStyle = {
    fontSize: '13px',
    color: '#212121',
    fontFamily: 'Arial, Helvetica, sans-serif',
    lineHeight: 1.4,
  };

  const notifTimeStyle = {
    fontSize: '11px',
    color: '#9E9E9E',
    fontFamily: 'Arial, Helvetica, sans-serif',
  };

  const emptyNotifStyle = {
    padding: '20px 16px',
    textAlign: 'center',
    fontSize: '13px',
    color: '#9E9E9E',
    fontFamily: 'Arial, Helvetica, sans-serif',
  };

  const userAvatarStyle = {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    backgroundColor: '#1B5E20',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: 700,
    color: '#FFFFFF',
    fontFamily: 'Arial, Helvetica, sans-serif',
    flexShrink: 0,
    marginLeft: '4px',
    cursor: 'default',
    userSelect: 'none',
  };

  const pageLabel = getPageLabel(location.pathname);

  return (
    <header style={navbarStyle} role="banner">
      {/* Left: hamburger + breadcrumb */}
      <div style={leftGroupStyle}>
        <button
          style={hamburgerStyle}
          onClick={onToggleSidebar}
          aria-label="Abrir/cerrar menú lateral"
        >
          <span style={hamburgerLineStyle} />
          <span style={hamburgerLineStyle} />
          <span style={hamburgerLineStyle} />
        </button>
        <span style={breadcrumbStyle}>{pageLabel}</span>
      </div>

      {/* Right: bell + avatar */}
      <div style={rightGroupStyle}>
        {/* Notification bell */}
        <div style={{ position: 'relative' }}>
          <button
            ref={bellRef}
            style={bellBtnStyle}
            onClick={handleBellClick}
            aria-label={`Notificaciones${notifCount > 0 ? `, ${notifCount} sin leer` : ''}`}
            aria-expanded={dropdownOpen}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: 'block' }}>
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            {notifCount > 0 && (
              <span style={badgeStyle} aria-hidden="true">
                {notifCount > 99 ? '99+' : notifCount}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div ref={dropdownRef} style={dropdownStyle} role="region" aria-label="Notificaciones">
              <div style={dropdownHeaderStyle}>
                <p style={dropdownTitleStyle}>Notificaciones</p>
                <button
                  style={markReadBtnStyle}
                  onClick={handleMarkAllRead}
                  aria-label="Marcar todas como leídas"
                >
                  Marcar todas leídas
                </button>
              </div>

              {loadingNotifs ? (
                <div style={emptyNotifStyle}>Cargando…</div>
              ) : notifications.length === 0 ? (
                <div style={emptyNotifStyle}>Sin notificaciones recientes</div>
              ) : (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {notifications.map((n, idx) => (
                    <li key={n.id ?? idx} style={notifItemStyle(n.leida)}>
                      <span style={notifMsgStyle}>{n.mensaje || n.message || 'Notificación'}</span>
                      <span style={notifTimeStyle}>
                        {formatTimeAgo(n.fecha_creacion || n.created_at)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* User avatar */}
        <div
          style={userAvatarStyle}
          title={user?.nombre || user?.username || 'Usuario'}
          aria-label={`Usuario: ${user?.nombre || user?.username || 'Usuario'}`}
        >
          {getInitials(user?.nombre || user?.username || 'U')}
        </div>
      </div>
    </header>
  );
}
