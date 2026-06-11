-- MonitoreoRS Sucre - Migración 007
-- Tabla: geocercas
CREATE TABLE IF NOT EXISTS geocercas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ruta_id INT NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  radio_metros INT DEFAULT 100 COMMENT 'Radio de tolerancia en metros alrededor de la ruta',
  poligono_json TEXT NOT NULL COMMENT 'JSON array de coordenadas {lat, lng}[]',
  activa TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ruta_id) REFERENCES rutas_planificadas(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
