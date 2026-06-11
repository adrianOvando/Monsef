import React from 'react';

export default function Loader({ fullscreen = false, size = 'normal' }) {
  if (fullscreen) {
    return (
      <div className="loader-overlay" aria-label="Cargando">
        <div className={`loader loader-${size}`} />
      </div>
    );
  }
  return <div className={`loader loader-${size}`} aria-label="Cargando" />;
}
