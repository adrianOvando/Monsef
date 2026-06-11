-- MonitoreoRS Sucre - Seeder 005
-- Datos: puntos de ruta (waypoints de cada ruta planificada)

-- Puntos de la Ruta 1 (Recorrido actual observado)
INSERT INTO puntos_ruta (ruta_id, orden, lat, lng, descripcion) VALUES
(1, 1, -19.055253599999993, -65.26232576441824, 'Inicio — Colegio Humboldt referencia norte'),
(1, 2, -19.055875143038893, -65.26107348621176, 'Humboldt 2 — continuación este'),
(1, 3, -19.060902736049425, -65.26213321020619, 'Madre de Dios 1 — punto medio'),
(1, 4, -19.064468075247696, -65.26054962384545, 'Fin — Alta Prosperina final');

-- Puntos de la Ruta 2 (Ruta A propuesta)
INSERT INTO puntos_ruta (ruta_id, orden, lat, lng, descripcion) VALUES
(2, 1, -19.055253599999993, -65.26232576441824, 'Inicio — Colegio Humboldt referencia norte'),
(2, 2, -19.055875143038893, -65.26107348621176, 'Humboldt 2 — continuación este'),
(2, 3, -19.060902736049425, -65.26213321020619, 'Madre de Dios 1 — punto medio'),
(2, 4, -19.064468075247696, -65.26054962384545, 'Fin — Alta Prosperina completa');

-- Puntos de la Ruta 3 (Ruta B propuesta)
INSERT INTO puntos_ruta (ruta_id, orden, lat, lng, descripcion) VALUES
(3, 1, -19.056878706607797, -65.2636688528034, 'Inicio — Pulacayo'),
(3, 2, -19.05712180772799, -65.265331505866, 'Pulacayo 2 — extensión oeste'),
(3, 3, -19.060902736049425, -65.26213321020619, 'Madre de Dios 1'),
(3, 4, -19.064468075247696, -65.26054962384545, 'Madre de Dios final Alta Prosperina');

-- Puntos de la Ruta 4 (Ruta C propuesta)
INSERT INTO puntos_ruta (ruta_id, orden, lat, lng, descripcion) VALUES
(4, 1, -19.055253599999993, -65.26232576441824, 'Colegio Humboldt — inicio'),
(4, 2, -19.055875143038893, -65.26107348621176, 'Humboldt 2'),
(4, 3, -19.056878706607797, -65.2636688528034, 'Pulacayo — cierre del loop');

-- Puntos de la Ruta 5 (Ruta D propuesta)
INSERT INTO puntos_ruta (ruta_id, orden, lat, lng, descripcion) VALUES
(5, 1, -19.058536442602527, -65.26006026427821, 'Colegio Goytia — inicio'),
(5, 2, -19.060902736049425, -65.26213321020619, 'Madre de Dios 1 — conexión'),
(5, 3, -19.064468075247696, -65.26054962384545, 'Alta Prosperina final — cierre');
