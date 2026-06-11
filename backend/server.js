/**
 * MonitoreoRS Sucre — server.js
 * Punto de entrada del servidor Express
 */

require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║        MonitoreoRS Sucre — Backend API           ║');
  console.log('║  USFX · Ingeniería en Sistemas · 2026            ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║  🚀 Servidor corriendo en: http://localhost:${PORT}   ║`);
  console.log(`║  🌍 Entorno: ${process.env.NODE_ENV || 'development'}                        ║`);
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
});
