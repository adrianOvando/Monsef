/**
 * MonitoreoRS Sucre — run_migrations.js
 * Ejecuta todas las migraciones SQL en orden contra la base de datos.
 * Crea la base de datos si no existe.
 *
 * Uso: node run_migrations.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = process.env.DB_PORT || 3306;
  const dbUser = process.env.DB_USER || 'root';
  const dbPassword = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'monitoreo_bd';

  console.log(`🔗 Conectando a MySQL en ${dbHost}:${dbPort}...`);
  
  let connection;
  try {
    // Primero nos conectamos sin seleccionar base de datos para asegurarnos de poder crearla si no existe
    connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      multipleStatements: true
    });

    console.log('⚙️ Recreando la base de datos (DROP & CREATE)...');
    await connection.query(`DROP DATABASE IF EXISTS \`${dbName}\`;`);
    await connection.query(`CREATE DATABASE \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`✅ Base de datos \`${dbName}\` recreada exitosamente.`);

    // Cambiamos al contexto de la base de datos
    await connection.query(`USE \`${dbName}\`;`);
    console.log(`📂 Usando base de datos \`${dbName}\`.`);

    // Leer el directorio de migraciones
    const migrationsDir = path.join(__dirname, 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      throw new Error(`El directorio de migraciones no existe en: ${migrationsDir}`);
    }

    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Esto los ordenará: 001, 002, 003...

    if (files.length === 0) {
      console.log('⚠️ No se encontraron archivos de migración (.sql).');
      return;
    }

    console.log(`\n🚀 Ejecutando ${files.length} migraciones en orden...\n`);

    for (const file of files) {
      console.log(`📦 Ejecutando ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      if (!sql.trim()) {
        console.log(`   ⚠️ Archivo vacío, omitiendo.`);
        continue;
      }

      await connection.query(sql);
      console.log(`   ✓ Migración completada exitosamente.`);
    }

    console.log('\n🎉 ¡Todas las migraciones se han ejecutado con éxito!');

  } catch (error) {
    console.error('\n❌ Error al ejecutar las migraciones:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigrations();
