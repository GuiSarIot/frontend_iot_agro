# Gestión de Sensores - Documentación

## 📋 Descripción General

El módulo de gestión de sensores ha sido separado de la gestión de dispositivos para mejorar la mantenibilidad del código y proporcionar una interfaz dedicada para administrar los sensores del sistema IoT.

## 🗂️ Estructura de Carpetas

```
app/gestor_sensores/
├── page.tsx                    # Listado de sensores
├── layout.tsx                  # Layout del módulo
├── mainPage.module.css         # Estilos del listado
├── crear/
│   ├── page.tsx               # Formulario de creación
│   ├── layout.tsx             # Layout de creación
│   └── crear.module.css       # Estilos del formulario
└── [sensorId]/
    ├── page.tsx               # Formulario de edición
    └── layout.tsx             # Layout de edición
```

## 🎯 Funcionalidades Implementadas

### 1. Listado de Sensores (`/gestor_sensores`)

**Características:**
- ✅ Vista en cards con diseño responsive
- ✅ Búsqueda en tiempo real por nombre, tipo y unidad de medida
- ✅ Contador de sensores filtrados
- ✅ Botones de acción: Editar y Eliminar
- ✅ Estado vacío con mensaje informativo
- ✅ Confirmación antes de eliminar

**Información mostrada:**
- Nombre del sensor
- Tipo de sensor
- Unidad de medida
- Icono representativo

### 2. Crear Sensor (`/gestor_sensores/crear`)

**Campos del formulario:**
- **Nombre del sensor***: Nombre descriptivo (mínimo 3 caracteres)
- **Tipo de sensor***: Categoría o tipo del sensor
- **Unidad de medida***: Unidad en la que se mide (ej: °C, %, ppm)

**Características:**
- ✅ Validación en tiempo real
- ✅ Vista previa en panel lateral
- ✅ Diseño de 2 columnas (formulario + preview)
- ✅ Confirmación antes de descartar cambios
- ✅ Responsive design

### 3. Editar Sensor (`/gestor_sensores/[sensorId]`)

**Características:**
- ✅ Carga automática de datos del sensor
- ✅ Detección de cambios
- ✅ Botón "Guardar" deshabilitado si no hay cambios
- ✅ Confirmación antes de descartar cambios
- ✅ Vista previa actualizada en tiempo real

## 🎨 Diseño Visual

El módulo sigue la **identidad visual de IOTCorp SAS**:

### Colores
- **Primario**: `#147910` (Verde corporativo)
- **Primario oscuro**: `#0d5309`
- **Estados**: Éxito, advertencia, error (del sistema de diseño)

### Componentes
- **Cards**: Diseño moderno con hover effects
- **Iconos**: Material-UI con tema verde
- **Botones**: Estilos consistentes del sistema
- **Inputs**: Focus con borde verde y shadow sutil
- **Badges**: Para identificar tipos de sensores

### Variables CSS Utilizadas
```css
var(--primary)              /* Color verde principal */
var(--primary-dark)         /* Verde oscuro para hover */
var(--spacing-sm/md/lg)     /* Espaciados consistentes */
var(--border-radius-sm)     /* Bordes redondeados */
var(--shadow-sm/md)         /* Sombras */
var(--transition-base)      /* Animaciones */
```

## 🔧 Servicios API

### sensoresService

**Ubicación**: `app/services/api.service.ts`

**Métodos disponibles:**

```typescript
// Obtener todos los sensores
sensoresService.getAll(): Promise<Sensor[]>

// Obtener sensor por ID
sensoresService.getById(id: number): Promise<Sensor>

// Crear nuevo sensor
sensoresService.create(data: {
    nombre: string
    tipo: string
    unidad_medida: string
}): Promise<Sensor>

// Actualizar sensor
sensoresService.update(id: number, data: {
    nombre: string
    tipo: string
    unidad_medida: string
}): Promise<Sensor>

// Eliminar sensor
sensoresService.delete(id: number): Promise<void>
```

### Interfaz Sensor

```typescript
interface Sensor {
    id: number
    nombre: string
    tipo: string
    unidad_medida: string
    created_at: string
    updated_at: string
}
```

## 🔐 Permisos y Navegación

### Permisos Requeridos

El módulo aparece en la navegación si el usuario tiene alguno de estos permisos:
- `gestionar_sensores`
- `ver_sensores`

### Configuración en modulesConfig

```typescript
sensores: {
    permissions: ['gestionar_sensores', 'ver_sensores'],
    icon: <SensorsIcon />,
    label: 'Sensores',
    href: '/gestor_sensores',
    description: 'Gestión de sensores',
    priority: 5
}
```

## 📱 Responsive Design

### Breakpoints

- **Desktop**: Grid de 3-4 columnas
- **Tablet** (< 1024px): Grid de 2 columnas
- **Móvil** (< 768px): 1 columna

### Adaptaciones Móviles

- Header con botones apilados verticalmente
- Búsqueda con ancho completo
- Formulario en una sola columna
- Vista previa se muestra primero (order: -1)
- Botones de acción ocupan todo el ancho

## 🚀 Flujos de Usuario

### Crear Sensor

1. Usuario hace clic en "Nuevo sensor"
2. Redirige a `/gestor_sensores/crear`
3. Usuario completa el formulario
4. Se muestra vista previa en tiempo real
5. Al guardar: validación → API → confirmación → redirección

### Editar Sensor

1. Usuario hace clic en "Editar" en una card
2. Redirige a `/gestor_sensores/[id]`
3. Se cargan los datos del sensor
4. Usuario modifica campos
5. Botón "Guardar" se habilita si hay cambios
6. Al guardar: validación → API → confirmación → redirección

### Eliminar Sensor

1. Usuario hace clic en "Eliminar"
2. SweetAlert2 solicita confirmación
3. Si confirma: API → mensaje de éxito → recarga listado
4. Si cancela: no hace nada

## ✅ Validaciones

### Nombre del sensor
- ✅ Campo requerido
- ✅ Mínimo 3 caracteres
- ✅ Se valida en tiempo real

### Tipo de sensor
- ✅ Campo requerido

### Unidad de medida
- ✅ Campo requerido

## 🔄 Relación con Dispositivos

Los sensores se pueden **asignar a dispositivos** desde el módulo de gestión de dispositivos:

- Ruta: `/gestor_dispositivos/[dispositivoId]`
- Modal: `AsignarSensorModal`
- Permite configurar:
  - Sensor a asignar
  - Intervalo de lectura
  - Umbral de alerta

## 📝 Mejores Prácticas

### Código
- ✅ TypeScript con interfaces bien definidas
- ✅ Separación de concerns (UI, lógica, estilos)
- ✅ Hooks personalizados cuando sea necesario
- ✅ Manejo de errores consistente

### UX
- ✅ Mensajes de confirmación antes de acciones destructivas
- ✅ Feedback visual en todas las acciones
- ✅ Estados de carga claros
- ✅ Placeholders informativos
- ✅ Textos de ayuda cuando sea necesario

### Performance
- ✅ Lazy loading de componentes
- ✅ Búsqueda optimizada (filtrado client-side)
- ✅ Memoización donde sea apropiado

## 🐛 Manejo de Errores

### Errores de API
- Se capturan en bloques try/catch
- Se muestran con SweetAlert2
- Se registran en consola para debugging

### Validaciones de Formulario
- Validación en tiempo real
- Mensajes de error claros
- Prevención de envío si hay errores

### Navegación
- Protección de rutas con ProtectedRoute
- Verificación de permisos
- Redirección si no hay acceso

## 🔮 Futuras Mejoras

- [ ] Filtros avanzados (por tipo, unidad de medida)
- [ ] Exportación de listado a CSV/Excel
- [ ] Paginación para grandes volúmenes de datos
- [ ] Ordenamiento por columnas
- [ ] Vista de detalles de sensor con historial
- [ ] Gráficos de uso de sensores
- [ ] Importación masiva de sensores
- [ ] API de búsqueda con debounce

## 📚 Referencias

- Sistema de diseño: [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md)
- Tema: [THEME_SYSTEM.md](../THEME_SYSTEM.md)
- Navegación: [NAVEGACION_CAMBIOS.md](../NAVEGACION_CAMBIOS.md)
