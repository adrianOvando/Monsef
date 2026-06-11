-- MonitoreoRS Sucre - Migración 008
-- Tabla: recorridos
CREATE TABLE IF NOT EXISTS recorridos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ruta_id INT NOT NULL,
  fecha DATE NOT NULL,
  hora_inicio TIME,
  hora_fin TIME,
  estado ENUM('en_progreso','completado','incompleto','desviacion_detectada') DEFAULT 'en_progreso',
  porcentaje_cumplimiento DECIMAL(5,2) DEFAULT 0,
  observaciones TEXT,
  registrado_por INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (ruta_id) REFERENCES rutas_planificadas(id),
  FOREIGN KEY (registrado_por) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
