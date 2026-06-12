-- MonitoreoRS Sucre - Seeder 008
-- Datos: horarios y días establecidos por tramo (Anexo C de la propuesta reorganizada)
INSERT INTO horarios_tramos (nombre_tramo, zona_id, descripcion_recorrido, dias_recoleccion, horario_manana, horario_tarde, observaciones, activo) VALUES
('Tramo 1 — Pulacayo → Contenedor → Colegio Humboldt', 2, 'Inicia cerca de la calle Pulacayo, se dirige al contenedor y va hacia el Colegio Humboldt.', 'Lunes, Viernes', '07:30 - 10:00', '16:00 - 18:00', 'Propuesta reorganizada del proyecto académico', 1),
('Tramo 2 — Alta Prosperina + calle empinada hacia Madre de Dios', 1, 'Cubre Alta Prosperina y la subida empinada que conecta con Madre de Dios.', 'Lunes, Viernes', '07:30 - 10:00', '16:00 - 18:00', 'Propuesta reorganizada del proyecto académico', 1),
('Tramo 3 — Calles paralelas zona (viviendas sin cobertura anterior)', 3, 'Recorrido por calles paralelas para cubrir zonas sin cobertura previa.', 'Miércoles, Viernes', '07:30 - 10:00', '16:00 - 18:00', 'Propuesta reorganizada del proyecto académico', 1),
('Tramo 4 — Final Colegio Humboldt → Manuel José Cortez → Enrique → vía principal', 4, 'Conecta Colegio Humboldt, Manuel José Cortez y calle Enrique hasta la vía principal.', 'Miércoles, Viernes', '07:30 - 10:00', '16:00 - 18:00', 'Propuesta reorganizada del proyecto académico', 1);
