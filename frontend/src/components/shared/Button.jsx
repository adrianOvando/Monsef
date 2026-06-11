import React from 'react';

export default function Button({ children, variant = 'primary', size = 'normal', loading = false, icon, onClick, type = 'button', disabled, className = '', ...props }) {
  const cls = `btn btn-${variant}${size === 'sm' ? ' btn-sm' : ''}${className ? ' ' + className : ''}`;
  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled || loading} {...props}>
      {loading ? <span className="btn-spinner" aria-label="Cargando" /> : icon ? <span className="btn-icon-wrap">{icon}</span> : null}
      {children}
    </button>
  );
}
