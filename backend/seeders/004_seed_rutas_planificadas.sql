-- MonitoreoRS Sucre - Seeder 004
-- Datos: rutas planificadas (actual vs propuesta)

-- Rutas ACTUALES (problemáticas — para referencia histórica en el sistema)
INSERT INTO rutas_planificadas (nombre, zona_id, descripcion, frecuencia, horario_estimado, distancia_km, activa, tipo) VALUES
('Recorrido actual observado — Zona Alta Prosperina/Humboldt', 1,
 'Recorrido actual observado en campo (12-15 mayo 2026). Horarios irregulares sin previo aviso. El camión no cubre el tramo completo. Algunas calles quedan sin atención.',
 'Martes, Jueves, Viernes (irregular)', '06:00 - 15:00 (variable, sin horario fijo)', 2.1, 1, 'actual');

-- Rutas PROPUESTAS (reorganizadas — la mejora que propone el proyecto)
INSERT INTO rutas_planificadas (nombre, zona_id, descripcion, frecuencia, horario_estimado, distancia_km, activa, tipo) VALUES
('Ruta A propuesta — Alta Prosperina completa', 1,
 'Recorrido reorganizado que cubre el tramo completo de Alta Prosperina incluyendo subida y bajada por ambas calles. Elimina calles sin cobertura.',
 'Lunes, Miércoles, Viernes', '06:00 - 07:30', 3.2, 1, 'propuesta'),

('Ruta B propuesta — Pulacayo y Madre de Dios', 2,
 'Integra Pulacayo y la calle Madre de Dios en un solo tramo continuo. Evita retrocesos y cubre el tramo completo de Madre de Dios.',
 'Martes, Jueves, Sábado', '06:30 - 08:00', 2.8, 1, 'propuesta'),

('Ruta C propuesta — Colegio Humboldt y entorno', 4,
 'Cubre las calles adyacentes al Colegio Humboldt con mayor acumulación identificada en el diagnóstico de campo.',
 'Lunes, Miércoles, Viernes', '07:30 - 08:30', 1.9, 1, 'propuesta'),

('Ruta D propuesta — Colegio Goytia sector sur', 5,
 'Recorrido complementario que cubre el sector del Colegio Goytia y conexión con Madre de Dios final.',
 'Martes, Jueves', '08:00 - 09:00', 1.5, 1, 'propuesta');
