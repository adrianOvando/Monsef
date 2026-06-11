-- MonitoreoRS Sucre - Seeder 007
-- Datos: geocercas por ruta (polígonos de tolerancia ~100m)
INSERT INTO geocercas (ruta_id, nombre, radio_metros, poligono_json) VALUES
(2, 'Geocerca Ruta A — Alta Prosperina', 120, '[{"lat":-19.054,"lng":-65.261},{"lat":-19.054,"lng":-65.262},{"lat":-19.065,"lng":-65.260},{"lat":-19.065,"lng":-65.261}]'),
(3, 'Geocerca Ruta B — Pulacayo + Madre de Dios', 100, '[{"lat":-19.056,"lng":-65.264},{"lat":-19.056,"lng":-65.266},{"lat":-19.065,"lng":-65.260},{"lat":-19.065,"lng":-65.262}]'),
(4, 'Geocerca Ruta C — Humboldt', 100, '[{"lat":-19.054,"lng":-65.261},{"lat":-19.054,"lng":-65.262},{"lat":-19.058,"lng":-65.264},{"lat":-19.058,"lng":-65.261}]'),
(5, 'Geocerca Ruta D — Goytia', 100, '[{"lat":-19.057,"lng":-65.259},{"lat":-19.057,"lng":-65.262},{"lat":-19.065,"lng":-65.259},{"lat":-19.065,"lng":-65.262}]');
