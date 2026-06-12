import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const NAV_ITEMS = [
  { 
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
      </svg>
    ), 
    label: 'Dashboard', 
    path: '/dashboard' 
  },
  { 
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
      </svg>
    ), 
    label: 'Visualización de Rutas', 
    path: '/rutas' 
  },
  { 
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    ), 
    label: 'Puntos Críticos', 
    path: '/puntos-criticos' 
  },
  { 
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <polyline points="23 4 23 10 17 10"></polyline>
        <polyline points="1 20 1 14 7 14"></polyline>
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
      </svg>
    ), 
    label: 'Control de Recorridos', 
    path: '/recorridos' 
  },
  { 
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
      </svg>
    ), 
    label: 'Reportes', 
    path: '/reportes' 
  },
  { 
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
    ), 
    label: 'Horarios', 
    path: '/horarios' 
  },
];

const ADMIN_ITEM = { 
  icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  ), 
  label: 'Administración', 
  path: '/administracion' 
};

function getInitials(name = '') {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = user?.rol === 'admin' ? [...NAV_ITEMS, ADMIN_ITEM] : NAV_ITEMS;

  const sidebarStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '240px',
    height: '100vh',
    backgroundColor: '#145214',
    color: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 200,
    transition: 'transform 0.28s ease',
    fontFamily: 'Arial, Helvetica, sans-serif',
    overflowY: 'auto',
    boxSizing: 'border-box',
  };

  const sidebarMobileStyle = {
    ...sidebarStyle,
    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const appliedStyle = isMobile ? sidebarMobileStyle : sidebarStyle;

  const logoAreaStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '28px 20px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.12)',
    gap: '8px',
  };

  const logoSvgWrapStyle = {
    width: '56px',
    height: '56px',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  const logoTitleStyle = {
    fontSize: '18px',
    fontWeight: 700,
    color: '#FFFFFF',
    letterSpacing: '0.5px',
    fontFamily: 'Arial, Helvetica, sans-serif',
    margin: 0,
  };

  const logoSubtitleStyle = {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.65)',
    fontFamily: 'Arial, Helvetica, sans-serif',
    margin: 0,
  };

  const navStyle = {
    flex: 1,
    padding: '16px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  };

  const getItemStyle = (path) => {
    const isActive = location.pathname === path || location.pathname.startsWith(path + '/');
    return {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '11px 20px',
      textDecoration: 'none',
      color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.78)',
      backgroundColor: isActive ? '#2E7D32' : 'transparent',
      borderLeft: isActive ? '3px solid #FFFFFF' : '3px solid transparent',
      fontSize: '14px',
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontWeight: isActive ? 600 : 400,
      cursor: 'pointer',
      transition: 'background-color 0.18s ease, color 0.18s ease',
      boxSizing: 'border-box',
    };
  };

  const iconStyle = {
    fontSize: '18px',
    flexShrink: 0,
    lineHeight: 1,
  };

  const userAreaStyle = {
    borderTop: '1px solid rgba(255,255,255,0.12)',
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  };

  const userRowStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  const avatarStyle = {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    backgroundColor: '#2E7D32',
    border: '2px solid rgba(255,255,255,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 700,
    color: '#FFFFFF',
    fontFamily: 'Arial, Helvetica, sans-serif',
    flexShrink: 0,
  };

  const userInfoStyle = {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  };

  const userNameStyle = {
    fontSize: '13px',
    fontWeight: 600,
    color: '#FFFFFF',
    fontFamily: 'Arial, Helvetica, sans-serif',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const userRoleStyle = {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.6)',
    fontFamily: 'Arial, Helvetica, sans-serif',
    textTransform: 'capitalize',
  };

  const logoutBtnStyle = {
    width: '100%',
    padding: '8px',
    backgroundColor: 'rgba(198,40,40,0.25)',
    border: '1px solid rgba(198,40,40,0.5)',
    borderRadius: '6px',
    color: '#FFFFFF',
    fontSize: '13px',
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'background-color 0.18s ease',
  };

  const handleLogoutHover = (e, entering) => {
    e.currentTarget.style.backgroundColor = entering
      ? 'rgba(198,40,40,0.45)'
      : 'rgba(198,40,40,0.25)';
  };

  const handleNavHover = (e, entering, path) => {
    const isActive =
      location.pathname === path || location.pathname.startsWith(path + '/');
    if (!isActive) {
      e.currentTarget.style.backgroundColor = entering
        ? 'rgba(255,255,255,0.08)'
        : 'transparent';
    }
  };

  return (
    <>
      {/* Sidebar panel */}
      <aside style={appliedStyle} aria-label="Navegación principal">
        {/* Logo area */}
        <div style={logoAreaStyle}>
          <div style={logoSvgWrapStyle}>
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {/* Map pin / route icon */}
              <circle cx="16" cy="12" r="6" fill="#FFFFFF" opacity="0.9" />
              <circle cx="16" cy="12" r="3" fill="#145214" />
              <path
                d="M16 18 C16 18 8 24 8 28 Q16 24 24 28 C24 24 16 18 16 18Z"
                fill="#FFFFFF"
                opacity="0.6"
              />
              <path
                d="M6 20 Q10 17 16 18 Q22 17 26 20"
                stroke="#FFFFFF"
                strokeWidth="1.5"
                fill="none"
                strokeOpacity="0.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <p style={logoTitleStyle}>MonitoreoRS</p>
          <p style={logoSubtitleStyle}>Sucre</p>
        </div>

        {/* Navigation */}
        <nav style={navStyle} aria-label="Menú principal">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={getItemStyle(item.path)}
              onClick={() => isMobile && onClose && onClose()}
              onMouseEnter={(e) => handleNavHover(e, true, item.path)}
              onMouseLeave={(e) => handleNavHover(e, false, item.path)}
            >
              <span style={iconStyle} aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User area */}
        <div style={userAreaStyle}>
          <div style={userRowStyle}>
            <div style={avatarStyle} aria-hidden="true">
              {getInitials(user?.nombre || user?.username || 'U')}
            </div>
            <div style={userInfoStyle}>
              <span style={userNameStyle}>
                {user?.nombre || user?.username || 'Usuario'}
              </span>
              <span style={userRoleStyle}>{user?.rol || 'operador'}</span>
            </div>
          </div>
          <button
            style={logoutBtnStyle}
            onClick={logout}
            onMouseEnter={(e) => handleLogoutHover(e, true)}
            onMouseLeave={(e) => handleLogoutHover(e, false)}
            aria-label="Cerrar sesión"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }} aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
