# Guía de Implementación del Sistema de Registro de Acceso

## Resumen

Se ha implementado un sistema completo de registro automático de acceso a módulos utilizando el hook `useAccessLogger` y el endpoint de la API `POST /api/access_logs/create_log/`.

## ✅ Componentes Implementados

### 1. Hook `useAccessLogger`
**Ubicación**: [`app/hooks/useAccessLogger.ts`](app/hooks/useAccessLogger.ts)

**Características**:
- ✅ Registro automático al montar el componente
- ✅ Detección automática del módulo según la ruta
- ✅ Medición del tiempo de carga real (500ms delay)
- ✅ Función `logAction()` para acciones manuales
- ✅ Sin bloqueo de UI (proceso en segundo plano)
- ✅ Prevención de duplicados con `useRef`

**Mapeo de rutas → módulos**:
```typescript
/login → auth
/gestor_usuarios → users
/gestor_usuarios/roles → roles
/gestor_usuarios/permisos → permissions
/gestor_dispositivos → devices
/gestor_sensores → sensors
/gestor_logs → admin
/dashboard → other
```

### 2. Documentación
**Ubicación**: [`app/hooks/README_ACCESS_LOGGER.md`](app/hooks/README_ACCESS_LOGGER.md)

Incluye:
- Ejemplos de uso básico
- Casos de uso completos (listado, creación, edición)
- Tabla de opciones y configuración
- Buenas prácticas

### 3. Servicio API
**Ubicación**: [`app/services/api.service.ts`](app/services/api.service.ts)

El servicio `accessLogsService` ya incluye el método:
```typescript
create: async (data: {
    module: string
    endpoint: string
    method: string
    status_code: number
    response_time_ms: number
}): Promise<AccessLog>
```

### 4. Módulos Actualizados

Los siguientes módulos ya tienen el hook implementado:

| Módulo | Archivo | Módulo API | Acción |
|--------|---------|------------|--------|
| Dashboard | [`app/dashboard/page.tsx`](app/dashboard/page.tsx) | `other` | `view` |
| Dispositivos | [`app/gestor_dispositivos/page.tsx`](app/gestor_dispositivos/page.tsx) | `devices` | `list` |
| Sensores | [`app/gestor_sensores/page.tsx`](app/gestor_sensores/page.tsx) | `sensors` | `list` |
| Usuarios | [`app/gestor_usuarios/page.tsx`](app/gestor_usuarios/page.tsx) | `users` | `list` |
| Logs | [`app/gestor_logs/page.tsx`](app/gestor_logs/page.tsx) | `admin` | `view` |

## 📋 Implementación en Nuevos Módulos

### Paso 1: Importar el hook
```tsx
import useAccessLogger from '@/app/hooks/useAccessLogger'
```

### Paso 2: Usar en el componente
```tsx
export default function MiModuloPage() {
    // Registro automático al entrar
    useAccessLogger({ 
        customModule: 'devices',  // Nombre del módulo
        action: 'list'            // Acción: view, list, create, update, delete
    })

    return (
        <div>Mi contenido</div>
    )
}
```

### Paso 3 (Opcional): Registrar acciones CRUD
```tsx
export default function EditarPage() {
    const { logAction } = useAccessLogger({ action: 'view' })

    const handleUpdate = async () => {
        try {
            await miServicio.update(id, data)
            await logAction('update', 200)  // Éxito
        } catch (error) {
            await logAction('update', 400)  // Error
        }
    }

    return <button onClick={handleUpdate}>Actualizar</button>
}
```

## 🎯 Módulos Válidos

Según la documentación de la API, los valores válidos para `module` son:

| Valor | Descripción |
|-------|-------------|
| `auth` | Autenticación |
| `users` | Usuarios |
| `roles` | Roles |
| `permissions` | Permisos |
| `devices` | Dispositivos |
| `sensors` | Sensores |
| `readings` | Lecturas |
| `mqtt` | MQTT |
| `emqx` | EMQX |
| `admin` | Administración |
| `api_docs` | Documentación API |
| `other` | Otro |

## 🔍 Verificación

### Ver logs en el backend
Los logs se pueden consultar mediante:
```bash
GET /api/access_logs/
```

Filtros disponibles:
- `method`: GET, POST, PUT, PATCH, DELETE
- `status_code`: Código HTTP
- `module`: Módulo de la app
- `page`: Número de página

### Estadísticas
```bash
GET /api/access_logs/stats/
```

Retorna:
- Total de peticiones
- Peticiones por método
- Peticiones por código de estado
- Tiempo promedio de respuesta

## 🚀 Próximos Pasos

### Módulos pendientes de implementar:

1. **Módulos de detalle** (ejemplo: `/gestor_dispositivos/[id]`):
   ```tsx
   useAccessLogger({ 
       customModule: 'devices',
       action: 'view'
   })
   ```

2. **Módulos de creación** (`/gestor_dispositivos/crear`):
   ```tsx
   const { logAction } = useAccessLogger({ 
       customModule: 'devices',
       action: 'view'
   })
   
   const handleSubmit = async () => {
       try {
           await dispositivosService.create(data)
           await logAction('create', 201)
       } catch (error) {
           await logAction('create', 400)
       }
   }
   ```

3. **Submódulos de usuarios**:
   - Roles: `/gestor_usuarios/roles` → `roles` module
   - Permisos: `/gestor_usuarios/permisos` → `permissions` module
   - Email: `/gestor_usuarios/email` → `users` module
   - Telegram: `/gestor_usuarios/telegram` → `users` module

## 📊 Ejemplo Completo

Ver [README_ACCESS_LOGGER.md](app/hooks/README_ACCESS_LOGGER.md) para ejemplos completos de:
- Páginas de listado
- Páginas de creación
- Páginas de edición
- Manejo de errores

## 🔧 Personalización

### Agregar nueva ruta al mapeo
Editar [`app/hooks/useAccessLogger.ts`](app/hooks/useAccessLogger.ts):

```typescript
const ROUTE_TO_MODULE_MAP: Record<string, string> = {
    // ... rutas existentes
    '/mi_nuevo_modulo': 'mqtt',  // Agregar nueva ruta
}
```

### Deshabilitar logging en una página
```tsx
useAccessLogger({ enabled: false })
```

## ✅ Estado Actual

| Tarea | Estado |
|-------|--------|
| Hook creado | ✅ Completo |
| Servicio API integrado | ✅ Completo |
| Documentación | ✅ Completo |
| Dashboard | ✅ Implementado |
| Dispositivos (listado) | ✅ Implementado |
| Sensores (listado) | ✅ Implementado |
| Usuarios (listado) | ✅ Implementado |
| Logs (listado) | ✅ Implementado |
| Módulos de detalle | ⏳ Pendiente |
| Módulos de creación | ⏳ Pendiente |
| Módulos de edición | ⏳ Pendiente |
| Submódulos usuarios | ⏳ Pendiente |

## 📝 Notas Importantes

1. **Tiempo de respuesta**: Se registra en milisegundos (entero), medido desde el montaje del componente
2. **No bloquea UI**: Los errores de logging se capturan silenciosamente
3. **Una vez por montaje**: El hook previene registros duplicados usando `useRef`
4. **Delay intencional**: Espera 500ms antes de registrar para capturar tiempo real de carga

## 🐛 Troubleshooting

### El log no se registra
- Verificar que el usuario esté autenticado
- Revisar la consola del navegador por errores
- Verificar que el endpoint `/api/access_logs/create_log/` esté disponible

### Múltiples registros
- Verificar que no haya múltiples instancias del hook
- Confirmar que React no esté en modo desarrollo (double render)

### Módulo incorrecto
- Especificar `customModule` manualmente si la ruta no está en el mapeo
- Agregar la ruta al `ROUTE_TO_MODULE_MAP`
