-- MonitoreoRS Sucre - Seeder 005
-- Datos: puntos de ruta (waypoints de cada ruta planificada)

-- Ruta actual (ID 1)
INSERT INTO puntos_ruta (ruta_id, orden, lat, lng, descripcion) VALUES
(1, 1, -19.056878706607797, -65.2636688528034, 'Inicio — Calle Pulacayo'),
(1, 2, -19.05712180772799, -65.265331505866, 'Pulacayo 2 — contenedor del sector'),
(1, 3, -19.055253599999993, -65.26232576441824, 'Colegio Humboldt — punto de referencia'),
(1, 4, -19.064468075247696, -65.26054962384545, 'Alta Prosperina final');

-- Tramo 1: Pulacayo → Contenedor → Humboldt
INSERT INTO puntos_ruta (ruta_id, orden, lat, lng, descripcion) VALUES
(2, 1, -19.056878706607797, -65.2636688528034, 'Inicio — Calle Pulacayo'),
(2, 2, -19.05712180772799, -65.265331505866, 'Pulacayo 2 — contenedor del sector'),
(2, 3, -19.055253599999993, -65.26232576441824, 'Colegio Humboldt — punto de referencia');

-- Tramo 2: Alta Prosperina + Madre de Dios
INSERT INTO puntos_ruta (ruta_id, orden, lat, lng, descripcion) VALUES
(3, 1, -19.055875143038893, -65.26107348621176, 'Humboldt 2 — inicio tramo'),
(3, 2, -19.060902736049425, -65.26213321020619, 'Madre de Dios 1 — calle empinada'),
(3, 3, -19.064468075247696, -65.26054962384545, 'Alta Prosperina final');

-- Tramo 3: Calles paralelas
INSERT INTO puntos_ruta (ruta_id, orden, lat, lng, descripcion) VALUES
(4, 1, -19.064468075247696, -65.26054962384545, 'Alta Prosperina final — inicio'),
(4, 2, -19.060902736049425, -65.26213321020619, 'Madre de Dios 1'),
(4, 3, -19.056878706607797, -65.2636688528034, 'Pulacayo — cierre calles paralelas');

-- Tramo 4: Final Humboldt → Manuel José Cortez → Enrique → vía principal
INSERT INTO puntos_ruta (ruta_id, orden, lat, lng, descripcion) VALUES
(5, 1, -19.055253599999993, -65.26232576441824, 'Final Colegio Humboldt'),
(5, 2, -19.058536442602527, -65.26006026427821, 'Colegio Goytia — referencia calles Manuel José Cortez / Enrique'),
(5, 3, -19.055875143038893, -65.26107348621176, 'Vuelta a vía principal');
