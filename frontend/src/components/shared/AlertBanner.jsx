import React, { useEffect, useState } from 'react';

export default function AlertBanner({ type = 'info', message, autoDismiss = false, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoDismiss && message) {
      const t = setTimeout(() => { setVisible(false); onClose?.(); }, 5000);
      return () => clearTimeout(t);
    }
  }, [message, autoDismiss, onClose]);

  if (!visible || !message) return null;

  const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };

  return (
    <div className={`alert-banner alert-${type}`} role="alert">
      <span className="alert-icon">{icons[type]}</span>
      <span className="alert-message">{message}</span>
      <button className="alert-close" onClick={() => { setVisible(false); onClose?.(); }} aria-label="Cerrar alerta">✕</button>
    </div>
  );
}
