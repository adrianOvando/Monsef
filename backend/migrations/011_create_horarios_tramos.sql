-- MonitoreoRS Sucre - Migración 011
-- Tabla: horarios_tramos
CREATE TABLE IF NOT EXISTS horarios_tramos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre_tramo VARCHAR(150) NOT NULL,
  zona_id INT,
  descripcion_recorrido TEXT,
  dias_recoleccion VARCHAR(100) NOT NULL COMMENT 'Ej: Lunes, Miércoles, Viernes',
  horario_manana VARCHAR(50) COMMENT 'Ej: 07:30 - 10:00',
  horario_tarde VARCHAR(50) COMMENT 'Ej: 16:00 - 18:00',
  observaciones TEXT,
  activo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (zona_id) REFERENCES zonas(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
