/**
 * MonitoreoRS Sucre — run_seeders.js
 * Genera hashes bcrypt reales para los usuarios del sistema
 * e inserta todos los datos base en la base de datos.
 *
 * Uso: node seeders/run_seeders.js
 * Requisito: La base de datos monitoreo_bd debe estar creada
 *            y las migraciones ejecutadas previamente.
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function runSeeders() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'monitoreo_bd',
    multipleStatements: true
  });

  console.log('✅ Conectado a MySQL — monitoreo_bd');

  try {
    // 1. Seeder Roles
    console.log('\n📋 Insertando roles...');
    const sqlRoles = fs.readFileSync(path.join(__dirname, '001_seed_roles.sql'), 'utf8');
    await connection.query(sqlRoles);
    console.log('   ✓ Roles insertados');

    // 2. Seeder Usuarios (con bcrypt)
    console.log('\n👤 Generando hashes de contraseñas e insertando usuarios...');
    const SALT_ROUNDS = 10;
    const usuarios = [
      { nombre: 'Administrador Sistema',  email: 'admin@monitoreo.local',      password: 'admin123',      rol_id: 1 },
      { nombre: 'Supervisor Municipal',   email: 'supervisor@monitoreo.local',  password: 'supervisor123', rol_id: 2 },
      { nombre: 'Operador Campo',         email: 'operador@monitoreo.local',    password: 'operador123',   rol_id: 3 },
    ];

    for (const u of usuarios) {
      const hash = await bcrypt.hash(u.password, SALT_ROUNDS);
      await connection.query(
        'INSERT IGNORE INTO usuarios (nombre, email, password_hash, rol_id) VALUES (?, ?, ?, ?)',
        [u.nombre, u.email, hash, u.rol_id]
      );
      console.log(`   ✓ Usuario: ${u.email}`);
    }

    // 3. Seeder Zonas
    console.log('\n🗺️  Insertando zonas...');
    const sqlZonas = fs.readFileSync(path.join(__dirname, '003_seed_zonas.sql'), 'utf8');
    await connection.query(sqlZonas);
    console.log('   ✓ Zonas insertadas');

    // 4. Seeder Rutas Planificadas
    console.log('\n🚛 Insertando rutas planificadas...');
    const sqlRutas = fs.readFileSync(path.join(__dirname, '004_seed_rutas_planificadas.sql'), 'utf8');
    await connection.query(sqlRutas);
    console.log('   ✓ Rutas insertadas');

    // 5. Seeder Puntos de Ruta
    console.log('\n📍 Insertando puntos de ruta...');
    const sqlPuntosRuta = fs.readFileSync(path.join(__dirname, '005_seed_puntos_ruta.sql'), 'utf8');
    await connection.query(sqlPuntosRuta);
    console.log('   ✓ Puntos de ruta insertados');

    // 6. Seeder Puntos Críticos
    console.log('\n⚠️  Insertando puntos críticos...');
    const sqlPuntosCriticos = fs.readFileSync(path.join(__dirname, '006_seed_puntos_criticos.sql'), 'utf8');
    await connection.query(sqlPuntosCriticos);
    console.log('   ✓ Puntos críticos insertados');

    // 7. Seeder Geocercas
    console.log('\n🔶 Insertando geocercas...');
    const sqlGeocercas = fs.readFileSync(path.join(__dirname, '007_seed_geocercas.sql'), 'utf8');
    await connection.query(sqlGeocercas);
    console.log('   ✓ Geocercas insertadas');

    console.log('\n🎉 ¡Todos los seeders ejecutados exitosamente!');
    console.log('\n📌 Credenciales de acceso:');
    console.log('   admin@monitoreo.local      / admin123');
    console.log('   supervisor@monitoreo.local  / supervisor123');
    console.log('   operador@monitoreo.local    / operador123');

  } catch (err) {
    console.error('\n❌ Error al ejecutar seeders:', err.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runSeeders();
