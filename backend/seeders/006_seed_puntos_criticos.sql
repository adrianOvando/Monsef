-- MonitoreoRS Sucre - Seeder 006
-- Datos: puntos críticos identificados en el diagnóstico de campo
INSERT INTO puntos_criticos (zona_id, nombre, descripcion, lat, lng, tipo, nivel_criticidad, fecha_registro) VALUES
(1, 'Contenedor Alta Prosperina desbordado', 'Único contenedor para casi toda la zona. Desbordamiento constante. Residuos esparcidos en tierra y entre plantas. Volumen estimado 1-3 m³.', -19.064468075247696, -65.26054962384545, 'contenedor_desbordado', 'alto', '2026-05-12'),
(4, 'Acumulación alrededores Humboldt', 'Residuos acumulados alrededor del contenedor del sector. Capacidad insuficiente. Comportamiento idéntico al contenedor de Alta Prosperina.', -19.055253599999993, -65.26232576441824, 'contenedor_desbordado', 'alto', '2026-05-13'),
(3, 'Madre de Dios — bolsas en esquinas', 'Vecinos dejan bolsas en esquinas sin saber cuándo pasará el camión. Calle sin horario fijo.', -19.060902736049425, -65.26213321020619, 'acumulacion', 'medio', '2026-05-14'),
(2, 'Pulacayo — calle sin cobertura regular', 'El camión no siempre recorre el tramo completo de Pulacayo. Queda sin atención varios días.', -19.056878706607797, -65.2636688528034, 'calle_sin_cobertura', 'medio', '2026-05-14'),
(5, 'Sector Goytia — residuos esporádicos', 'Acumulación esporádica identificada en observación de campo. Nivel menor al de Alta Prosperina.', -19.058536442602527, -65.26006026427821, 'acumulacion', 'bajo', '2026-05-15');
