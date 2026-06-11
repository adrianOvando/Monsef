import { useEffect, useRef, useState } from 'react';

const SUCRE_CENTER = { lat: -19.060, lng: -65.262 };
const DEFAULT_ZOOM = 15;

// Map style: hide Points of Interest and transit layers
const MAP_STYLES = [
  {
    featureType: 'poi',
    elementType: 'all',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'transit',
    elementType: 'all',
    stylers: [{ visibility: 'off' }],
  },
];

let scriptLoadPromise = null;

function loadGoogleMapsScript(apiKey) {
  // If already loaded, resolve immediately
  if (window.google && window.google.maps) {
    return Promise.resolve();
  }
  // If currently loading, return the same promise
  if (scriptLoadPromise) {
    return scriptLoadPromise;
  }
  scriptLoadPromise = new Promise((resolve, reject) => {
    const callbackName = '__googleMapsInitCallback__';
    window[callbackName] = () => {
      resolve();
      delete window[callbackName];
    };
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=${callbackName}&loading=async&libraries=geometry`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      scriptLoadPromise = null;
      reject(new Error('Error al cargar Google Maps. Verifique su conexión o API key.'));
    };
    document.head.appendChild(script);
  });
  return scriptLoadPromise;
}

/**
 * MapaBase
 *
 * Props:
 *   onMapLoad(mapInstance) — called once when map is ready
 *   height  — CSS height string (default '500px')
 *   className — optional CSS class for outer container
 */
export default function MapaBase({ onMapLoad, height = '500px', className, children }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setError('VITE_GOOGLE_MAPS_API_KEY no está definida en las variables de entorno.');
      setLoading(false);
      return;
    }

    let cancelled = false;

    loadGoogleMapsScript(apiKey)
      .then(() => {
        if (cancelled || !containerRef.current) return;

        const map = new window.google.maps.Map(containerRef.current, {
          center: SUCRE_CENTER,
          zoom: DEFAULT_ZOOM,
          styles: MAP_STYLES,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          mapTypeControlOptions: {
            position: window.google.maps.ControlPosition.TOP_RIGHT,
          },
        });

        mapRef.current = map;
        setLoading(false);

        if (typeof onMapLoad === 'function') {
          onMapLoad(map);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'No se pudo cargar el mapa.');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Styles ──────────────────────────────────────────────────────────────────

  const wrapperStyle = {
    position: 'relative',
    width: '100%',
    height,
    fontFamily: 'Arial, Helvetica, sans-serif',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #EEEEEE',
    boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
    backgroundColor: '#E8E8E8',
  };

  const mapContainerStyle = {
    width: '100%',
    height: '100%',
  };

  const loaderStyle = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    backgroundColor: 'rgba(245,245,245,0.90)',
    zIndex: 10,
  };

  const spinnerStyle = {
    width: '40px',
    height: '40px',
    border: '4px solid #EEEEEE',
    borderTop: '4px solid #1B5E20',
    borderRadius: '50%',
    animation: 'spin 0.9s linear infinite',
  };

  const loaderTextStyle = {
    fontSize: '14px',
    color: '#616161',
    fontFamily: 'Arial, Helvetica, sans-serif',
  };

  const errorStyle = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '24px',
    backgroundColor: '#F5F5F5',
    zIndex: 10,
  };

  const errorIconStyle = {
    fontSize: '36px',
  };

  const errorTextStyle = {
    fontSize: '14px',
    color: '#C62828',
    fontFamily: 'Arial, Helvetica, sans-serif',
    textAlign: 'center',
    maxWidth: '320px',
  };

  return (
    <>
      {/* Keyframe injection */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={wrapperStyle} className={className} aria-label="Mapa de Sucre">
        {/* Google Maps container */}
        <div ref={containerRef} style={mapContainerStyle} />

        {/* Child layers (CapaRutas, CapaPuntos, etc.) */}
        {!loading && !error && children}

        {/* Loader overlay */}
        {loading && !error && (
          <div style={loaderStyle} role="status" aria-live="polite">
            <div style={spinnerStyle} aria-hidden="true" />
            <span style={loaderTextStyle}>Cargando mapa…</span>
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div style={errorStyle} role="alert">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#C62828" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <p style={errorTextStyle}>{error}</p>
          </div>
        )}
      </div>
    </>
  );
}
