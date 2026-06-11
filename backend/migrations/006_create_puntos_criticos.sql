-- MonitoreoRS Sucre - Migración 006
-- Tabla: puntos_criticos
CREATE TABLE IF NOT EXISTS puntos_criticos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  zona_id INT NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT,
  lat DECIMAL(11,8) NOT NULL,
  lng DECIMAL(11,8) NOT NULL,
  tipo ENUM('acumulacion','contenedor_desbordado','calle_sin_cobertura','otro') DEFAULT 'acumulacion',
  nivel_criticidad ENUM('bajo','medio','alto') DEFAULT 'medio',
  foto_url VARCHAR(500),
  fecha_registro DATE,
  activo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (zona_id) REFERENCES zonas(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
