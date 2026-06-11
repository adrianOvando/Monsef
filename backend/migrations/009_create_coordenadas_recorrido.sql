-- MonitoreoRS Sucre - Migración 009
-- Tabla: coordenadas_recorrido
CREATE TABLE IF NOT EXISTS coordenadas_recorrido (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recorrido_id INT NOT NULL,
  orden INT NOT NULL,
  lat DECIMAL(11,8) NOT NULL,
  lng DECIMAL(11,8) NOT NULL,
  timestamp_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
  dentro_geocerca TINYINT(1) DEFAULT 1,
  FOREIGN KEY (recorrido_id) REFERENCES recorridos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
