-- MonitoreoRS Sucre - Seeder 004
-- Datos: rutas planificadas (actual vs propuesta)

-- RUTA ACTUAL OBSERVADA (diagnóstico de campo — tipo: actual)
INSERT INTO rutas_planificadas (nombre, zona_id, descripcion, frecuencia, horario_estimado, distancia_km, activa, tipo) VALUES
('Recorrido actual observado en campo', 1,
 'Recorrido diagnosticado entre el 12 y 15 de mayo de 2026. El camión no sigue siempre el mismo recorrido. Algunas calles secundarias reciben menos atención que otras. Sin horario fijo ni comunicación a vecinos.',
 'Martes, Jueves, Viernes (sin regularidad)', '06:00 – 15:00 h variable (sin aviso previo)', 2.1, 1, 'actual');

-- CUATRO TRAMOS PROPUESTOS (tipo: propuesta)
INSERT INTO rutas_planificadas (nombre, zona_id, descripcion, frecuencia, horario_estimado, distancia_km, activa, tipo) VALUES
('Tramo 1 — Pulacayo → Contenedor → Colegio Humboldt', 2,
 'Inicia cerca de la calle Pulacayo, se dirige al contenedor principal, recoge los residuos acumulados y continúa hacia el Colegio Alexander von Humboldt.',
 'Lunes, Viernes', '07:30 – 10:00 h (o 16:00 – 18:00 h)', 1.4, 1, 'propuesta'),

('Tramo 2 — Alta Prosperina + calle empinada a Madre de Dios', 1,
 'Continúa desde el Colegio Humboldt por las calles de Alta Prosperina incluyendo la calle con mayor inclinación que conecta con el sector de Madre de Dios.',
 'Lunes, Viernes', '07:30 – 10:00 h (o 16:00 – 18:00 h)', 1.8, 1, 'propuesta'),

('Tramo 3 — Calles paralelas zona (viviendas sin cobertura anterior)', 3,
 'Recorre las calles paralelas de la zona para cubrir las viviendas que anteriormente quedaban fuera del recorrido del camión. Cierra la brecha de cobertura identificada en el diagnóstico.',
 'Miércoles, Viernes', '07:30 – 10:00 h (o 16:00 – 18:00 h)', 1.6, 1, 'propuesta'),

('Tramo 4 — Final Humboldt → Manuel José Cortez → Enrique → vía principal', 4,
 'Conecta desde el final del Colegio Humboldt, recorre las calles Manuel José Cortez y Enrique, pasando cerca de la Churrasquería El Algarrobal, hasta volver a la vía principal.',
 'Miércoles, Viernes', '07:30 – 10:00 h (o 16:00 – 18:00 h)', 1.3, 1, 'propuesta');
