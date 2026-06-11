-- MonitoreoRS Sucre - Migración 004
-- Tabla: rutas_planificadas
CREATE TABLE IF NOT EXISTS rutas_planificadas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  zona_id INT NOT NULL,
  descripcion TEXT,
  frecuencia VARCHAR(100) COMMENT 'Ej: Lunes, Miércoles y Viernes',
  horario_estimado VARCHAR(50) COMMENT 'Ej: 06:00 - 08:00',
  distancia_km DECIMAL(6,2),
  activa TINYINT(1) DEFAULT 1,
  tipo ENUM('actual','propuesta') DEFAULT 'propuesta' COMMENT 'actual = ruta diagnosticada en campo, propuesta = ruta reorganizada por el proyecto',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (zona_id) REFERENCES zonas(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
