-- MonitoreoRS Sucre - Seeder 001
-- Datos: roles del sistema
INSERT INTO roles (nombre, descripcion) VALUES
('admin', 'Administrador del sistema con acceso total a configuración y gestión'),
('supervisor', 'Supervisor municipal del servicio de recolección. Puede registrar recorridos y gestionar puntos críticos'),
('operador', 'Operador del servicio de recolección. Puede registrar recorridos y consultar rutas y horarios');
