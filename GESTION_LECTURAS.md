# Módulo de Gestión de Lecturas

## Descripción General

El módulo de gestión de lecturas permite visualizar, crear, editar y analizar las lecturas capturadas por los sensores asignados a los dispositivos IoT. Las lecturas pueden ser generadas automáticamente a través de MQTT o creadas manualmente por operadores y superusuarios.

## Estructura de Archivos

```
app/
├── services/
│   └── lecturas.service.ts          # Servicio API para lecturas
├── hooks/
│   └── useLecturas.ts                # Hook personalizado para lecturas
└── gestor_lecturas/
    ├── layout.tsx                    # Layout del módulo
    ├── contentApp.tsx                # Configuración del sidebar
    ├── mainPage.module.css           # Estilos compartidos
    ├── page.tsx                      # Página principal (listar)
    ├── crear/
    │   └── page.tsx                  # Formulario de creación manual
    ├── [lecturaId]/
    │   └── page.tsx                  # Vista de detalles
    └── estadisticas/
        └── page.tsx                  # Vista de estadísticas
```

## Endpoints del Backend

### 1. Listar Lecturas
```
GET /api/readings/
```
- **Permisos**: Autenticado (Operadores ven solo lecturas de sus dispositivos)
- **Query Parameters**:
  - `dispositivo`: Filtrar por ID de dispositivo
  - `sensor`: Filtrar por ID de sensor
  - `fecha_inicio`: Filtrar desde fecha (YYYY-MM-DDTHH:MM:SS)
  - `fecha_fin`: Filtrar hasta fecha (YYYY-MM-DDTHH:MM:SS)
  - `ordering`: Ordenar por timestamp
  - `page`: Número de página
  - `page_size`: Registros por página

### 2. Crear Lectura
```
POST /api/readings/
```
- **Permisos**: Superusuario o Operador
- **Body**:
  ```json
  {
    "dispositivo": 1,
    "sensor": 1,
    "valor": 25.5,
    "metadata_json": {
      "calidad": "buena",
      "bateria": 85
    }
  }
  ```

### 3. Crear Lecturas en Bulk
```
POST /api/readings/bulk/
```
- **Permisos**: Superusuario o Operador
- **Body**:
  ```json
  {
    "lecturas": [
      {
        "dispositivo": 1,
        "sensor": 1,
        "valor": 25.5
      },
      {
        "dispositivo": 1,
        "sensor": 2,
        "valor": 60.2
      }
    ]
  }
  ```

### 4. Estadísticas de Lecturas
```
GET /api/readings/estadisticas/
```
- **Permisos**: Autenticado
- **Query Parameters**:
  - `dispositivo`: ID de dispositivo
  - `sensor`: ID de sensor
- **Respuesta**:
  ```json
  {
    "total": 120,
    "promedio": 24.8,
    "maximo": 32.5,
    "minimo": 18.2,
    "lecturas_mqtt": 95
  }
  ```

### 5. Detalle de Lectura
```
GET /api/readings/{id}/
```
- **Permisos**: Autenticado (Operadores solo de sus dispositivos)

### 6. Actualizar Lectura
```
PUT/PATCH /api/readings/{id}/
```
- **Permisos**: Superusuario
- **Body**:
  ```json
  {
    "metadata_json": {
      "calidad": "excelente",
      "bateria": 90,
      "nota": "Recalibrado"
    }
  }
  ```

### 7. Eliminar Lectura
```
DELETE /api/readings/{id}/
```
- **Permisos**: Superusuario

### 8. Últimas Lecturas
```
GET /api/readings/ultimas/?limit=10
```
- **Permisos**: Autenticado
- **Query Parameters**:
  - `limit`: Número de lecturas (máximo 100, por defecto 10)

## Interfaces TypeScript

### Lectura
```typescript
interface Lectura {
    id: number
    dispositivo: number
    dispositivo_nombre: string
    sensor: number
    sensor_nombre: string
    sensor_unidad: string
    valor: number
    timestamp: string
    metadata_json: Record<string, unknown>
    mqtt_message_id?: string
    mqtt_qos?: number
    mqtt_retained?: boolean
}
```

### EstadisticasLecturas
```typescript
interface EstadisticasLecturas {
    total: number
    promedio: number
    maximo: number
    minimo: number
    lecturas_mqtt: number
}
```

### LecturaResumida
```typescript
interface LecturaResumida {
    id: number
    dispositivo_nombre: string
    sensor_nombre: string
    valor: number
    timestamp: string
}
```

## Uso del Hook useLecturas

### Importación
```typescript
import { useLecturas } from '@/app/hooks/useLecturas'
```

### Ejemplo Básico
```typescript
const {
    lecturas,
    totalRecords,
    loading,
    loadLecturas,
    createLectura,
    deleteLectura,
    getEstadisticas
} = useLecturas({ autoLoad: true })
```

### Funciones Disponibles

#### loadLecturas()
Carga las lecturas con los parámetros configurados.
```typescript
await loadLecturas({
    dispositivo: 1,
    sensor: 2,
    fecha_inicio: '2024-01-01T00:00:00Z',
    fecha_fin: '2024-12-31T23:59:59Z',
    ordering: '-timestamp',
    page: 1,
    page_size: 10
})
```

#### createLectura()
Crea una nueva lectura manual.
```typescript
const nuevaLectura = await createLectura({
    dispositivo: 1,
    sensor: 1,
    valor: 25.5,
    metadata_json: { nota: 'Lectura manual' }
})
```

#### createBulk()
Crea múltiples lecturas en una sola operación.
```typescript
await createBulk([
    { dispositivo: 1, sensor: 1, valor: 25.5 },
    { dispositivo: 1, sensor: 2, valor: 60.2 }
])
```

#### getEstadisticas()
Obtiene estadísticas de lecturas.
```typescript
const stats = await getEstadisticas({
    dispositivo: 1,
    sensor: 2
})
```

#### getUltimas()
Obtiene las últimas N lecturas.
```typescript
const ultimas = await getUltimas(20)
```

#### updateLectura()
Actualiza el metadata de una lectura.
```typescript
await updateLectura(123, {
    calidad: 'excelente',
    bateria: 90
})
```

#### deleteLectura()
Elimina una lectura.
```typescript
await deleteLectura(123)
```

## Permisos Requeridos

### Ver Lecturas
- Permiso: `ver_lecturas`
- Descripción: Permite visualizar las lecturas de sensores
- Restricción: Los operadores solo ven lecturas de sus dispositivos asignados

### Crear Lecturas
- Permiso: `crear_lecturas`
- Descripción: Permite crear lecturas manualmente
- Usuarios: Operadores y Superusuarios

### Editar Lecturas
- Permiso: Solo Superusuarios
- Descripción: Permite editar el metadata de las lecturas
- Nota: Solo se puede editar el campo metadata_json

### Eliminar Lecturas
- Permiso: Solo Superusuarios
- Descripción: Permite eliminar lecturas del sistema

## Características Principales

### 1. Listado de Lecturas
- **Paginación**: Navegación por páginas con control de registros por página
- **Filtros**: Por dispositivo, sensor, rango de fechas
- **Ordenamiento**: Por fecha/hora (ascendente/descendente)
- **Búsqueda**: Filtrado en tiempo real
- **Acciones**: Ver detalles, eliminar (solo superusuarios)

### 2. Creación Manual
- **Selección de dispositivo**: Dropdown con todos los dispositivos disponibles
- **Sensores disponibles**: Solo muestra sensores asignados al dispositivo seleccionado
- **Validación de rango**: Muestra el rango válido del sensor
- **Metadata personalizado**: Campo JSON opcional para información adicional
- **Validación en tiempo real**: Verifica formato JSON antes de enviar

### 3. Vista de Detalles
- **Información completa**: Todos los campos de la lectura
- **Datos MQTT**: Si la lectura fue recibida por MQTT
- **Metadata formateado**: JSON con formato legible
- **Edición de metadata**: Solo para superusuarios
- **Eliminación**: Solo para superusuarios

### 4. Estadísticas
- **Métricas generales**: Total, promedio, máximo, mínimo
- **Lecturas MQTT**: Contador y porcentaje
- **Filtros**: Por dispositivo y/o sensor
- **Gráfico**: Visualización de estadísticas en gráfico de barras
- **Últimas lecturas**: Lista de las 20 lecturas más recientes
- **Actualización**: Botón para refrescar datos

## Estilos CSS

El módulo utiliza `mainPage.module.css` que incluye:
- **Contenedores responsive**: Grid adaptable a diferentes tamaños de pantalla
- **Cards**: Tarjetas para información y estadísticas
- **Badges**: Indicadores de estado con colores
- **Filtros**: Diseño de rejilla para filtros
- **Tablas**: Estilos para DataTable
- **Estados vacíos**: Diseño para cuando no hay datos

## Integración con Otros Módulos

### Dispositivos
- Al crear una lectura, se valida que el dispositivo exista
- Solo se muestran sensores asignados al dispositivo seleccionado

### Sensores
- Se obtiene la unidad de medida del sensor
- Se muestran los rangos válidos del sensor
- Se valida que el sensor esté asignado al dispositivo

### Logs de Acceso
- Se registra cada acceso a las páginas del módulo
- Se registran las acciones de crear, editar y eliminar

## Próximas Mejoras

- [ ] Exportación de lecturas a CSV/Excel
- [ ] Gráficos históricos por sensor
- [ ] Alertas cuando las lecturas salen de rango
- [ ] Dashboard de monitoreo en tiempo real
- [ ] Comparación entre sensores
- [ ] Predicción de tendencias con ML

## Notas Técnicas

- Las lecturas se ordenan por defecto de más reciente a más antigua
- El timestamp se genera automáticamente en el backend
- Los operadores solo pueden ver lecturas de dispositivos a los que tienen acceso
- El metadata_json es opcional y puede contener cualquier información adicional
- Las lecturas MQTT se distinguen por tener mqtt_message_id
- La paginación se maneja de forma lazy (carga bajo demanda)
