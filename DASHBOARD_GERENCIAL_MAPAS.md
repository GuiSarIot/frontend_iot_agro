# Dashboard Gerencial con Mapas en Tiempo Real

## Descripción General

Se ha implementado un sistema completo de dashboards gerenciales con estilos diferenciados según el rol del usuario (interno/externo) y visualización de dispositivos en mapas en tiempo real.

## Características Principales

### 1. **Estilos Gerenciales Diferenciados**

#### Dashboard Ejecutivo (Rol Interno - Administrador)
- **Tema:** Paleta azul profesional (#1e40af)
- **Diseño:** Layout gerencial con gradientes y sombras suaves
- **Estadísticas:** Tarjetas con iconos grandes y métricas clave
- **Componentes:**
  - Header ejecutivo con título y subtítulo
  - 4 tarjetas de estadísticas principales
  - Mapa interactivo de dispositivos
  - Vista de tabla con usuarios y dispositivos

#### Dashboard Profesional (Rol Externo - Usuario)
- **Tema:** Paleta cyan profesional (#0891b2)
- **Diseño:** Layout limpio y enfocado en datos del usuario
- **Estadísticas:** Tarjetas con métricas personales
- **Componentes:**
  - Header profesional con bienvenida
  - 4 tarjetas de estadísticas de dispositivos propios
  - Mapa de localización de dispositivos asignados
  - Tabla filtrable de dispositivos

### 2. **Integración de Mapas con Leaflet**

#### Características del Mapa
- **Librería:** React Leaflet + OpenStreetMap
- **Marcadores personalizados:**
  - Verde (🟢): Dispositivos activos
  - Rojo (🔴): Dispositivos inactivos
  - Icono: 📡 (antena de dispositivo)

#### Funcionalidades del Mapa
- **Visualización en tiempo real** del estado de dispositivos
- **Popups informativos** con:
  - Nombre del dispositivo
  - Estado (activo/inactivo)
  - Tipo de dispositivo
  - Ubicación textual
  - Última lectura con valor y unidad
  - Fecha de última lectura
  - Propietario (en dashboard admin)
  - Botón para ver detalles
- **Auto-ajuste:** El mapa se centra automáticamente en los dispositivos
- **Navegación:** Click en marcador o botón lleva al detalle del dispositivo
- **Leyenda:** Muestra cantidad de dispositivos activos/inactivos

### 3. **Vistas Alternativas**

Ambos dashboards incluyen un sistema de vistas:
- **Vista Mapa:** Visualización geográfica interactiva
- **Vista Tabla:** Tabla completa con filtros y paginación

Se puede alternar entre vistas mediante botones en la parte superior.

## Archivos Creados/Modificados

### Nuevos Archivos

1. **`components/shared/maps/DispositivosMap.tsx`**
   - Componente de mapa principal
   - Manejo de marcadores y popups
   - Integración con Leaflet

2. **`components/shared/maps/DispositivosMap.module.css`**
   - Estilos del componente de mapa
   - Personalización de popups
   - Animaciones y transiciones

3. **`app/services/dispositivos-map.types.ts`**
   - Tipos TypeScript para dispositivos con coordenadas
   - Funciones de conversión a marcadores
   - Utilidades para cálculo de bounds del mapa

4. **`styles/dashboard-executive.css`**
   - Estilos gerenciales globales
   - Diferenciación de temas por rol
   - Variables CSS para personalización
   - Responsive design
   - Soporte para dark mode

### Archivos Modificados

1. **`app/dashboard/portal_admin/page.tsx`**
   - Integración de mapa
   - Nuevas estadísticas ejecutivas
   - Sistema de vistas (mapa/tabla)
   - Estilos gerenciales aplicados

2. **`app/dashboard/portal_usuario/page.tsx`**
   - Integración de mapa personal
   - Estadísticas de dispositivos propios
   - Sistema de vistas
   - Estilos profesionales aplicados

3. **`package.json`**
   - Agregadas dependencias:
     - `leaflet`
     - `react-leaflet@^4.2.1`
     - `@types/leaflet`

## Uso y Navegación

### Dashboard Administrador

1. **Acceso:** `/dashboard/portal_admin`
2. **Permisos:** Solo superusuarios
3. **Funcionalidades:**
   - Ver todos los usuarios del sistema
   - Ver todos los dispositivos
   - Mapa global con ubicación de todos los dispositivos
   - Filtros avanzados
   - Estadísticas generales del sistema

### Dashboard Usuario

1. **Acceso:** `/dashboard/portal_usuario`
2. **Permisos:** Usuarios externos
3. **Funcionalidades:**
   - Ver solo dispositivos asignados
   - Mapa personal con dispositivos propios
   - Estadísticas personales
   - Filtros por nombre, tipo, estado, ubicación
   - Acceso rápido a lecturas

## Datos de Coordenadas

### Implementación Actual

**Nota:** En la implementación actual, las coordenadas se generan aleatoriamente alrededor de Bogotá, Colombia para demostración.

```typescript
// Coordenadas predeterminadas (Bogotá, Colombia)
const lat = dispositivo.latitud ?? (4.60971 + (Math.random() - 0.5) * 0.1)
const lng = dispositivo.longitud ?? (-74.08175 + (Math.random() - 0.5) * 0.1)
```

### Integración Futura

Para integrar coordenadas reales, debes:

1. **Agregar campos al modelo del backend:**
   ```python
   class Dispositivo(models.Model):
       # ... campos existentes ...
       latitud = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
       longitud = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
   ```

2. **Actualizar el frontend para usar coordenadas reales:**
   ```typescript
   // Eliminar la generación aleatoria y usar directamente
   const lat = dispositivo.latitud
   const lng = dispositivo.longitud
   ```

3. **Capturar coordenadas en el formulario de creación/edición:**
   - Usar geolocalización del navegador
   - Permitir selección manual en un mapa
   - Integrar API de geocodificación para convertir direcciones

## Personalización

### Cambiar Colores del Tema

Edita `styles/dashboard-executive.css`:

```css
:root {
    /* Paleta Ejecutiva - Admin */
    --exec-primary: #1e40af;  /* Cambiar color principal admin */
    
    /* Paleta Profesional - Usuario */
    --prof-primary: #0891b2;  /* Cambiar color principal usuario */
}
```

### Cambiar Centro Predeterminado del Mapa

Edita `app/services/dispositivos-map.types.ts`:

```typescript
export const DEFAULT_CENTER = {
    lat: 4.60971,   // Tu latitud
    lng: -74.08175  // Tu longitud
}
```

### Personalizar Iconos de Marcadores

Edita `components/shared/maps/DispositivosMap.tsx`:

```typescript
const crearIconoDispositivo = (estado: 'activo' | 'inactivo') => {
    const color = estado === 'activo' ? '#10b981' : '#ef4444'
    // Cambiar el emoji o HTML del marcador
    html: `<div>📡</div>`  // Tu icono aquí
}
```

## Estadísticas Mostradas

### Dashboard Admin
- Total Usuarios
- Total Dispositivos IoT
- Dispositivos Activos
- Total Lecturas

### Dashboard Usuario
- Mis Dispositivos
- Dispositivos Activos
- Total Lecturas
- Promedio de Lecturas por Dispositivo

## Responsive Design

Los dashboards están optimizados para:
- **Desktop:** Layout completo con estadísticas en grid
- **Tablet:** Grid adaptable de 2 columnas
- **Mobile:** Layout vertical de 1 columna

## Dark Mode

Los estilos gerenciales incluyen soporte completo para dark mode:
- Automático según preferencias del sistema
- Ajuste de colores y contrastes
- Preservación de legibilidad

## Rendimiento

- **Carga Lazy:** El mapa se carga solo en el cliente (SSR disabled)
- **Memoización:** Cálculos de estadísticas y marcadores memoizados
- **Paginación:** Tablas con paginación para grandes volúmenes de datos

## Próximos Pasos Sugeridos

1. **Integrar coordenadas reales** desde el backend
2. **Agregar filtros en tiempo real** en el mapa
3. **Implementar clustering** para muchos dispositivos
4. **Añadir rutas** entre dispositivos
5. **Incluir heat maps** de densidad de lecturas
6. **Notificaciones push** para cambios de estado
7. **Exportar datos** del dashboard a PDF/Excel
8. **Gráficos adicionales** con Chart.js o Highcharts

## Soporte

Para cualquier duda o personalización adicional, revisa:
- Documentación de Leaflet: https://leafletjs.com/
- React Leaflet: https://react-leaflet.js.org/
- PrimeReact (componentes UI): https://primereact.org/
