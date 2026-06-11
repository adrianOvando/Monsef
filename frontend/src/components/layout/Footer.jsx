export default function Footer() {
  const footerStyle = {
    height: '40px',
    backgroundColor: '#F5F5F5',
    borderTop: '1px solid #EEEEEE',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: '100%',
    boxSizing: 'border-box',
    padding: '0 16px',
  };

  const textStyle = {
    fontSize: '12px',
    color: '#616161',
    fontFamily: 'Arial, Helvetica, sans-serif',
    textAlign: 'center',
    margin: 0,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  return (
    <footer style={footerStyle} role="contentinfo">
      <p style={textStyle}>
        Sistema de Monitoreo y Visualización de Rutas &mdash; USFX, Ingeniería en Sistemas, 2026
      </p>
    </footer>
  );
}
