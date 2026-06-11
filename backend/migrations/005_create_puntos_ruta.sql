-- MonitoreoRS Sucre - Migración 005
-- Tabla: puntos_ruta
CREATE TABLE IF NOT EXISTS puntos_ruta (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ruta_id INT NOT NULL,
  orden INT NOT NULL,
  lat DECIMAL(11,8) NOT NULL,
  lng DECIMAL(11,8) NOT NULL,
  descripcion VARCHAR(200),
  FOREIGN KEY (ruta_id) REFERENCES rutas_planificadas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
