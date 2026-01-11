# Gestión de Sensores y Operadores en Dispositivos

## Funcionalidades Implementadas

### 1. Asignar Sensores a Dispositivos
- **Ubicación**: Vista de edición de dispositivo (`/gestor_dispositivos/[id]`)
- **Componente**: `AsignarSensorModal`
- **Endpoint**: `POST /api/devices/{id}/assign_sensor/`

**Características**:
- Modal para seleccionar sensor de la lista disponible
- Configuración de intervalo de lectura (segundos)
- Configuración de umbral de alerta (opcional)
- Validación de campos requeridos

**Flujo**:
1. Usuario hace clic en "Asignar sensor"
2. Se abre modal con lista de sensores disponibles
3. Usuario selecciona sensor y configura parámetros
4. Al confirmar, se asigna el sensor al dispositivo
5. La tabla de sensores asignados se actualiza automáticamente

### 2. Remover Sensores de Dispositivos
- **Endpoint**: `DELETE /api/devices/{id}/remove_sensor/?sensor_id={sensor_id}`

**Características**:
- Botón de eliminar en cada fila de la tabla de sensores
- Confirmación con SweetAlert2 antes de remover
- Actualización automática de la tabla tras remover

**Flujo**:
1. Usuario hace clic en el ícono de eliminar (🗑️) en la fila del sensor
2. Se muestra confirmación con el nombre del sensor
3. Al confirmar, se remueve el sensor
4. La tabla se actualiza mostrando los sensores restantes

### 3. Asignar Operador a Dispositivo
- **Ubicación**: Vista de edición de dispositivo
- **Endpoint**: `POST /api/devices/{id}/assign_operator/`

**Características**:
- Dropdown con lista de usuarios activos del sistema
- Muestra nombre completo y username de cada operador
- Indicación visual del operador actualmente asignado
- Permite limpiar la asignación (botón clear)

**Flujo**:
1. Usuario selecciona un operador del dropdown
2. Al cambiar la selección, se asigna automáticamente
3. Se muestra mensaje de confirmación
4. El dispositivo se recarga mostrando el nuevo operador

## Componentes Creados

### `AsignarSensorModal.tsx`
Modal reutilizable para asignar sensores con configuración.

**Props**:
- `visible`: boolean - Controla la visibilidad del modal
- `onHide`: () => void - Callback al cerrar el modal
- `onAssign`: (sensorId, config) => void - Callback al asignar sensor
- `loading`: boolean - Estado de carga durante la asignación

**Estados internos**:
- Lista de sensores disponibles
- Sensor seleccionado
- Intervalo de lectura (default: 60s)
- Umbral de alerta (opcional)

### `deviceEdit.module.css`
Estilos para las nuevas secciones de gestión:
- Secciones con bordes y fondos
- Headers de sección con iconos
- Tabla de sensores con PrimeReact DataTable
- Estados (activo/inactivo) con badges de colores
- Estado vacío con mensaje centrado
- Botones de acción (agregar, eliminar)

## Servicios Utilizados

### `dispositivosService`
Métodos agregados/utilizados:
- `assignSensor(dispositivoId, data)` - Asignar sensor
- `removeSensor(dispositivoId, sensorId)` - Remover sensor
- `assignOperator(dispositivoId, data)` - Asignar operador

### `sensoresService`
- `getAll()` - Obtener lista de sensores disponibles

### `usuariosService`
- `getAll()` - Obtener lista de usuarios para dropdown de operadores

## Estructura de Datos

### Request Body - Asignar Sensor
```typescript
{
  sensor_id: number
  configuracion_json?: {
    intervalo?: number
    umbral_alerta?: number
    [key: string]: unknown
  }
}
```

### Response - Sensor Asignado
```typescript
{
  id: number
  sensor: number
  sensor_nombre: string
  configuracion_json: Record<string, unknown>
  activo: boolean
  fecha_asignacion: string
}
```

### Request Body - Asignar Operador
```typescript
{
  operador_id: number
}
```

## Mejoras Futuras Sugeridas

1. **Validación avanzada**:
   - Evitar asignar el mismo sensor dos veces
   - Validar rangos de intervalo según tipo de sensor
   - Validar umbral según la unidad de medida del sensor

2. **Edición de configuración**:
   - Permitir editar la configuración de sensores ya asignados
   - Modal de edición rápida sin necesidad de remover y reasignar

3. **Filtros y búsqueda**:
   - Filtrar sensores por tipo en el modal de asignación
   - Búsqueda de sensores por nombre

4. **Permisos granulares**:
   - Restringir asignación de operadores solo a superusuarios
   - Logs de auditoría para cambios en asignaciones

5. **Visualización mejorada**:
   - Gráficos de sensores activos vs inactivos
   - Historial de asignaciones/desasignaciones
   - Panel de métricas del dispositivo con datos de sensores

## Archivos Modificados/Creados

### Creados:
- `app/gestor_dispositivos/[dispositivoId]/components/AsignarSensorModal.tsx`
- `app/gestor_dispositivos/[dispositivoId]/components/AsignarSensorModal.module.css`
- `app/gestor_dispositivos/[dispositivoId]/deviceEdit.module.css`

### Modificados:
- `app/gestor_dispositivos/[dispositivoId]/page.tsx`
  - Imports agregados
  - Estados para gestión de sensores y operadores
  - Funciones: `loadOperadores`, `handleAsignarSensor`, `handleRemoverSensor`, `handleAsignarOperador`
  - Secciones UI en el formulario
  - Modal de asignación

## Testing Recomendado

1. **Asignación de sensores**:
   - ✅ Asignar sensor con configuración completa
   - ✅ Asignar sensor solo con intervalo
   - ✅ Asignar sensor sin configuración opcional
   - ✅ Validación de campos requeridos

2. **Remoción de sensores**:
   - ✅ Remover sensor y verificar actualización de tabla
   - ✅ Cancelar remoción en el diálogo de confirmación

3. **Asignación de operadores**:
   - ✅ Asignar operador y verificar actualización
   - ✅ Cambiar operador asignado
   - ✅ Limpiar asignación de operador

4. **Manejo de errores**:
   - ✅ Error al cargar sensores
   - ✅ Error al asignar sensor
   - ✅ Error al remover sensor
   - ✅ Error al asignar operador
