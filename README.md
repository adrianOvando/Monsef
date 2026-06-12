# 🚛 MonitoreoRS Sucre — Sistema de Monitoreo de Rutas de Residuos Sólidos

Prototipo académico funcional desarrollado para la **Universidad Mayor, Real y Pontificia de San Francisco Xavier de Chuquisaca (USFX)**, Carrera de Ingeniería en Sistemas.

El sistema está diseñado para monitorear, visualizar y auditar las rutas de recolección de basura en las zonas de ladera de Sucre, Bolivia, utilizando geocercas para verificar el cumplimiento del recorrido de los camiones recolectores.

---

## 🛠️ Arquitectura y Stack Tecnológico

El sistema utiliza una arquitectura desacoplada Cliente-Servidor (SPA + REST API):

*   **Frontend:** React 18 (Vite) + React Router DOM v6 + Axios + CSS Variables (diseño responsivo y personalizado sin frameworks CSS pesados).
*   **Backend:** Node.js + Express (arquitectura MVC con controladores y enrutamiento limpio) + JWT + BcryptJS (seguridad) + PDFKit (generador de reportes en el servidor).
*   **Base de Datos:** MySQL (ejecutado localmente a través de XAMPP).
*   **Servicio de Mapas:** Google Maps JavaScript API (carga dinámica y optimizada, controlando polígonos, polilíneas, marcadores y ventanas de información interactiva).

---

## 🌟 Funcionalidades Clave del Sistema

El sistema está dividido en módulos interactivos según el rol del usuario:

### 1. Panel de Control (Dashboard)
*   **Estadísticas Rápidas (KPIs):** Indicadores visuales en tiempo real sobre la cantidad de zonas monitoreadas, rutas activas, puntos críticos detectados (con alertas para nivel alto) y recorridos procesados en el mes en curso.
*   **Mapa de Cobertura General:** Google Map integrado que muestra la ubicación de los puntos críticos y permite de un vistazo identificar la actividad en Sucre.
*   **Centro de Notificaciones:** Despliega alertas recientes e importantes del sistema (ej. detección de desvíos en rutas).
*   **Últimos Recorridos:** Tabla interactiva que muestra el estado y nivel de cumplimiento de los recorridos más recientes.

### 2. Visualización de Rutas en Mapa
*   **Capas Interactivas (Toggle):** Permite activar o desactivar capas dinámicas sobre el Google Map:
    *   *Rutas Planificadas:* Dibuja el trazado ideal de las rutas de recolección en verde.
    *   *Puntos Críticos:* Muestra marcadores personalizados clasificados por colores según su criticidad.
    *   *Geocercas:* Dibuja el área de influencia permitida para las rutas (en color naranja translúcido).
    *   *Recorridos Registrados:* Muestra el camino real que tomó el camión (línea discontinua azul).
*   **Panel de Detalle:** Selección de rutas para consultar distancias en kilómetros, horarios planificados, frecuencias y descripciones de las zonas de cobertura.

### 3. Gestión de Puntos Críticos (Acumuladores de Basura)
*   **Inventario:** Tabla paginada y ordenada con filtros por Zona, Tipo (microbasural, contenedor, etc.) y Nivel de Criticidad (Bajo, Medio, Alto).
*   **Formulario de Registro (CRUD):** Creación y edición con coordenadas (`lat`/`lng`), descripción, fecha de registro y asignación de zona.
*   **Exportación:** Botón directo para descargar el inventario completo de puntos críticos en un formato PDF profesional.

### 4. Control y Registro de Recorridos (Auditoría)
*   **Registrador de Trayectoria:** Permite ingresar los puntos de latitud y longitud por donde transitó un camión recolector en una fecha y rango horario específico.
*   **Cálculo Automático de Cumplimiento:** Valida en segundos qué porcentaje de los puntos ingresados cayeron dentro del área autorizada (geocerca) de la ruta.
*   **Historial de Auditoría:** Listado histórico de los viajes realizados, mostrando si se completaron con éxito o si se detectó una desviación de ruta (con alerta visual).
*   **Detalle Visual del Viaje:** Muestra el mapa comparativo de la ruta ideal vs. el recorrido real del camión, marcando en rojo los puntos fuera de la geocerca.

### 5. Módulo de Reportes Administrativos
*   Generación de reportes dinámicos en formato PDF generados directamente desde el backend. Soporta filtros de fecha, rutas y tipos de reporte:
    1.  *Resumen de Cobertura por Zona:* Análisis de la eficiencia de recolección.
    2.  *Puntos Críticos por Zona:* Listado completo con sus ubicaciones y severidad.
    3.  *Historial de Recorridos:* Reporte detallado de los porcentajes de cumplimiento de los viajes.
    4.  *Notificaciones y Alertas:* Bitácora de incidencias y desvíos de ruta detectados.

### 6. Administración del Sistema (Solo Administrador)
*   **Usuarios:** Control del personal (crear, editar, activar/desactivar operarios y supervisores).
*   **Zonas:** Definición geográfica de las zonas de ladera de la ciudad.
*   **Rutas Planificadas:** Configuración de trazados de referencia añadiendo puntos de trayectoria secuenciales.
*   **Geocercas:** Configuración del polígono de tolerancia alrededor de las rutas y su radio de cobertura.

---

## 🧠 ¿Cómo Funciona por Dentro? (Lógica de Negocio)

### A. El Algoritmo de Geocerca (Ray-Casting)
Cuando se registra un recorrido, el sistema debe determinar matemáticamente si el camión recolector se desvió.
1.  **Obtención de la Geocerca:** El backend busca la geocerca asignada a la ruta. Esta geocerca contiene un polígono en formato JSON (un array de coordenadas) y un radio de tolerancia en metros.
2.  **Ray-Casting (Punto en Polígono):** Para cada punto de la trayectoria real del camión, el sistema ejecuta el algoritmo de ray-casting:
    *   Traza una línea imaginaria (rayo) desde el punto hacia el infinito.
    *   Cuenta cuántas veces esta línea cruza las fronteras del polígono de la geocerca.
    *   Si el número de cruces es **impar**, el punto está **dentro** de la geocerca; si es **par**, está **fuera**.
3.  **Cálculo del Cumplimiento:**
    $$\text{\% Cumplimiento} = \left( \frac{\text{Puntos Dentro de Geocerca}}{\text{Total de Puntos Recorridos}} \right) \times 100$$
4.  **Disparador de Alertas:** Si el cumplimiento es menor al **80%**, el recorrido se guarda con el estado `desviacion_detectada` y se genera de manera automática una notificación de alerta al panel de supervisores y administradores.

### B. Generación de PDFs en Servidor (PDFKit)
Para evitar reportes inconsistentes en el cliente, el backend procesa los datos mediante PDFKit:
*   Construye un documento PDF en memoria y lo transmite directamente en formato `Stream` al navegador del cliente para descarga inmediata.
*   Usa un diseño formal académico con encabezados verdes institucionales (`#1B5E20`), tipografía limpia, numeración de páginas automatizada y tablas dinámicas autoajustables.

### C. Seguridad JWT (JSON Web Tokens)
*   **Autenticación:** Al iniciar sesión, se valida la contraseña usando `bcryptjs.compare`. Si es correcta, el backend firma un token conteniendo el ID del usuario, correo y su rol.
*   **Persistencia:** El token se almacena de forma segura en el `localStorage` del navegador y es adjuntado en las cabeceras HTTP (`Authorization: Bearer <token>`) de cada petición subsiguiente mediante interceptores de Axios.
*   **Autorización:** El backend cuenta con un middleware `authMiddleware.js` que decodifica el token, y un `roleMiddleware.js` que bloquea peticiones a rutas de la API que no correspondan al nivel del rol del usuario actual.

---

## 💻 Configuración e Instalación Rápida

Sigue estos pasos para levantar el prototipo localmente en tu máquina:

### Requisitos Previos
*   **Node.js** (versión 20 o superior).
*   **XAMPP** (con los servicios de Apache y MySQL iniciados).
*   Consulte el archivo [requirements.txt](file:///c:/Users/Adrian/Desktop/MonseSoft/monitoreo-rs-sucre/requirements.txt) para una lista completa de bibliotecas utilizadas y compatibilidades de versión.

### Paso 1: Instalar Dependencias
Abra una terminal en la **raíz del proyecto** (donde se encuentra clonado el repositorio) y ejecute:
```powershell
npm run install:all
```
*Este comando automatizado instalará todos los paquetes de Node.js necesarios para el gestor raíz, para el Backend (`/backend`) y para el Frontend (`/frontend`).*

### Paso 2: Configurar Variables de Entorno
Crea un archivo `.env` en las siguientes rutas según corresponda:

**En `backend/.env`:**
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=monitoreo_bd
JWT_SECRET=monitoreo_rs_jwt_secret_2026
PORT=3001
```

**En `frontend/.env`:**
```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_GOOGLE_MAPS_API_KEY=TU_API_KEY_DE_GOOGLE_MAPS
```
*(Reemplaza `TU_API_KEY_DE_GOOGLE_MAPS` con una credencial válida de la consola de Google Cloud con la API "Maps JavaScript API" y "Directions API" habilitadas).*

### Paso 3: Crear la Base de Datos y Semillas (Seeders)
Desde la **raíz del proyecto**, ejecute el comando:
```powershell
npm run db:setup
```
Este comando automatizado:
1.  Se conecta a tu MySQL local.
2.  Elimina la base de datos `monitoreo_bd` si ya existía para asegurar una instalación limpia.
3.  Crea la base de datos `monitoreo_bd` y sus tablas asociadas (10 archivos de migración).
4.  Ejecuta los seeders para cargar datos preconfigurados de prueba (roles, usuarios encriptados con bcrypt, zonas, rutas de tipo actual/propuesta, geocercas alineadas y puntos críticos).

### Paso 4: Levantar Servidores

Puede ejecutar ambos servidores desde la **raíz del proyecto** en consolas separadas:

1.  **Iniciar el Backend:**
    ```powershell
    npm run backend:dev
    ```
    *El servidor se iniciará en `http://localhost:3001`.*

2.  **Iniciar el Frontend:**
    ```powershell
    npm run frontend:dev
    ```
    *La interfaz de usuario estará disponible en `http://localhost:5173`.*

---

## 🔑 Credenciales de Prueba Creadas

| Rol de Acceso | Correo Electrónico (Usuario) | Contraseña |
| :--- | :--- | :--- |
| **Administrador** | `admin@monitoreo.local` | `admin123` |
| **Supervisor** | `supervisor@monitoreo.local` | `supervisor123` |
| **Operador** | `operador@monitoreo.local` | `operador123` |
