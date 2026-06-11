-- MonitoreoRS Sucre - Migración 003
-- Tabla: zonas
CREATE TABLE IF NOT EXISTS zonas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  lat_referencia DECIMAL(11,8) NOT NULL,
  lng_referencia DECIMAL(11,8) NOT NULL,
  activa TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
