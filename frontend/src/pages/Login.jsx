import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ─── Inline styles (pure CSS, no framework) ───────────────────────────── */
const S = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(160deg, #1B5E20 0%, #145214 100%)',
    fontFamily: 'Arial, Helvetica, sans-serif',
    padding: '24px',
  },
  brand: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '28px',
    gap: '12px',
  },
  logoWrap: {
    width: '72px',
    height: '72px',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#FFFFFF',
    fontFamily: 'Arial, Helvetica, sans-serif',
    margin: 0,
    letterSpacing: '0.5px',
    textAlign: 'center',
  },
  brandSubtitle: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.72)',
    fontFamily: 'Arial, Helvetica, sans-serif',
    margin: 0,
    textAlign: 'center',
    maxWidth: '300px',
    lineHeight: 1.4,
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
    padding: '36px 32px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#212121',
    fontFamily: 'Arial, Helvetica, sans-serif',
    margin: '0 0 6px 0',
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: '13px',
    color: '#616161',
    fontFamily: 'Arial, Helvetica, sans-serif',
    margin: '0 0 28px 0',
    textAlign: 'center',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '18px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#212121',
    fontFamily: 'Arial, Helvetica, sans-serif',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #EEEEEE',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'Arial, Helvetica, sans-serif',
    color: '#212121',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease',
  },
  inputError: {
    borderColor: '#C62828',
  },
  passwordWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  passwordInput: {
    width: '100%',
    padding: '10px 40px 10px 12px',
    border: '1px solid #EEEEEE',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'Arial, Helvetica, sans-serif',
    color: '#212121',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease',
  },
  eyeBtn: {
    position: 'absolute',
    right: '10px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#9E9E9E',
    fontSize: '16px',
    padding: '2px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Arial, Helvetica, sans-serif',
  },
  submitBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#1B5E20',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '15px',
    fontWeight: 600,
    fontFamily: 'Arial, Helvetica, sans-serif',
    cursor: 'pointer',
    marginTop: '8px',
    transition: 'background-color 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  submitBtnDisabled: {
    backgroundColor: '#9E9E9E',
    cursor: 'not-allowed',
  },
  errorBanner: {
    backgroundColor: '#FFEBEE',
    border: '1px solid #C62828',
    borderRadius: '6px',
    padding: '10px 14px',
    color: '#C62828',
    fontSize: '13px',
    fontFamily: 'Arial, Helvetica, sans-serif',
    marginBottom: '18px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2.5px solid rgba(255,255,255,0.4)',
    borderTopColor: '#FFFFFF',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
    flexShrink: 0,
  },
  footer: {
    marginTop: '32px',
    fontSize: '12px',
    color: 'rgba(255,255,255,0.5)',
    fontFamily: 'Arial, Helvetica, sans-serif',
    textAlign: 'center',
  },
};

/* ─── Logo SVG ──────────────────────────────────────────────────────────── */
function LogoSvg() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="20" cy="15" r="8" fill="#FFFFFF" opacity="0.9" />
      <circle cx="20" cy="15" r="4" fill="#145214" />
      <path
        d="M20 23 C20 23 10 31 10 35 Q20 30 30 35 C30 31 20 23 20 23Z"
        fill="#FFFFFF"
        opacity="0.65"
      />
      <path
        d="M7 26 Q13 22 20 23 Q27 22 33 26"
        stroke="#FFFFFF"
        strokeWidth="1.8"
        fill="none"
        strokeOpacity="0.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ─── Spinner ───────────────────────────────────────────────────────────── */
function Spinner() {
  return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <span style={S.spinner} aria-hidden="true" />
    </>
  );
}

/* ─── Login Page ────────────────────────────────────────────────────────── */
export default function Login() {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Iniciar Sesión — MonitoreoRS Sucre';
  }, []);

  /* Redirect if already logged in */
  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Por favor ingrese su correo electrónico.');
      return;
    }
    if (!password) {
      setError('Por favor ingrese su contraseña.');
      return;
    }

    setLoading(true);
    try {
      await login({ email: email.trim(), password });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        'Credenciales inválidas. Verifique su correo y contraseña.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputFocus = (e) => {
    e.target.style.borderColor = '#1B5E20';
    e.target.style.boxShadow = '0 0 0 3px rgba(27,94,32,0.12)';
  };
  const inputBlur = (e) => {
    e.target.style.borderColor = '#EEEEEE';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div style={S.wrapper}>
      {/* Brand area */}
      <div style={S.brand}>
        <div style={S.logoWrap}>
          <LogoSvg />
        </div>
        <h1 style={S.brandTitle}>MonitoreoRS Sucre</h1>
        <p style={S.brandSubtitle}>
          Sistema de Monitoreo y Visualización de Rutas
        </p>
      </div>

      {/* Login card */}
      <div style={S.card} role="main">
        <h2 style={S.cardTitle}>Iniciar Sesión</h2>
        <p style={S.cardSubtitle}>Ingrese sus credenciales para continuar</p>

        {error && (
          <div style={S.errorBanner} role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div style={S.fieldGroup}>
            <label htmlFor="login-email" style={S.label}>
              Correo electrónico
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={inputFocus}
              onBlur={inputBlur}
              style={{
                ...S.input,
                ...(error && !email ? S.inputError : {}),
              }}
              placeholder="ejemplo@usfx.bo"
              disabled={loading}
              aria-required="true"
            />
          </div>

          {/* Password */}
          <div style={S.fieldGroup}>
            <label htmlFor="login-password" style={S.label}>
              Contraseña
            </label>
            <div style={S.passwordWrap}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={inputFocus}
                onBlur={inputBlur}
                style={{
                  ...S.passwordInput,
                  ...(error && !password ? S.inputError : {}),
                }}
                placeholder="••••••••"
                disabled={loading}
                aria-required="true"
              />
              <button
                type="button"
                style={S.eyeBtn}
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: 'block' }}>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: 'block' }}>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            style={{
              ...S.submitBtn,
              ...(loading ? S.submitBtnDisabled : {}),
            }}
            disabled={loading}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#145214';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#1B5E20';
            }}
          >
            {loading ? (
              <>
                <Spinner />
                Ingresando…
              </>
            ) : (
              'Ingresar'
            )}
          </button>
        </form>
      </div>

      {/* Footer */}
      <p style={S.footer}>USFX — Ingeniería en Sistemas, 2026</p>
    </div>
  );
}
