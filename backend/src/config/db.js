/**
 * MonitoreoRS Sucre — db.js
 * Pool de conexiones MySQL usando mysql2/promise
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'monitoreo_bd',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  charset:            'utf8mb4'
});

// Verificar conexión al arrancar
pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL conectado — base de datos:', process.env.DB_NAME);
    conn.release();
  })
  .catch(err => {
    console.error('❌ Error al conectar MySQL:', err.message);
    process.exit(1);
  });

module.exports = pool;
