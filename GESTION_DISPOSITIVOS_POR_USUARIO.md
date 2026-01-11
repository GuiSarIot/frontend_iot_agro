# Gestión de Dispositivos por Usuario

## 📋 Resumen

Se implementó un sistema de gestión de dispositivos que diferencia entre superusuarios y usuarios normales/operadores. Los superusuarios tienen acceso completo a todos los dispositivos del sistema, mientras que los usuarios normales solo pueden visualizar los dispositivos que tienen asignados.

## 🔑 Características Implementadas

### 1. **Listado de Dispositivos Filtrado**

**Ubicación**: `/app/gestor_dispositivos/page.tsx`

**Comportamiento**:
- **Superusuarios (ROOT/SUPERUSER)**: Ven todos los dispositivos del sistema
- **Usuarios normales/operadores**: Solo ven los dispositivos que tienen asignados como operadores

**Implementación**:
```typescript
// Determinar si el usuario es superusuario
const isSuperUser = userInfo.levelAccessRolSistema === 'ROOT' || 
                   userInfo.levelAccessRolSistema === 'SUPERUSER' ||
                   userInfo.nameRolSistema?.toLowerCase().includes('superusuario')

// Filtrar dispositivos según el rol
const queryParams: any = {}
if (!isSuperUser && userInfo.id) {
    queryParams.operador = Number(userInfo.id)
}
const response = await dispositivosService.getAll(queryParams)
```

**Elementos de UI**:
- Banner informativo para usuarios no superusuarios indicando que solo ven sus dispositivos asignados
- Subtítulo adaptativo según el rol del usuario
- Mensaje personalizado cuando no hay dispositivos (sugiere contactar al administrador)

### 2. **Restricciones en Acciones**

**Botones y acciones restringidas para usuarios normales**:
- ❌ Botón "Nuevo dispositivo" - Solo visible para superusuarios
- ❌ Botón "Eliminar dispositivo" - Solo visible para superusuarios
- ❌ Botón "Activar/Desactivar dispositivo" - Solo visible para superusuarios
- ✅ Botón "Ver/Editar" - Disponible para todos (modo lectura para usuarios normales)

### 3. **Página de Creación de Dispositivos**

**Ubicación**: `/app/gestor_dispositivos/crear/page.tsx`

**Protección implementada**:
- Verificación de permisos al cargar la página
- Redirección automática si el usuario no es superusuario
- Mensaje de "Acceso denegado" mediante SweetAlert2

```typescript
useEffect(() => {
    if (!isSuperUser) {
        Swal.fire({
            title: 'Acceso denegado',
            text: 'Solo los superusuarios pueden crear dispositivos',
            icon: 'error',
            confirmButtonText: 'Ok'
        }).then(() => {
            router.push('/gestor_dispositivos')
        })
        return
    }
    loadTipos()
}, [])
```

### 4. **Página de Edición/Visualización de Dispositivos**

**Ubicación**: `/app/gestor_dispositivos/[dispositivoId]/page.tsx`

**Modo de solo lectura para usuarios normales**:
- Título adaptativo: "Editar dispositivo" (superusuarios) vs "Ver dispositivo" (usuarios normales)
- Banner informativo en modo solo lectura
- Todos los campos del formulario deshabilitados (`disabled={loading || !isSuperUser}`)
- Sección "Asignar operador" oculta completamente para usuarios normales
- Botón "Asignar sensor" oculto para usuarios normales
- Columna de "Acciones" en tabla de sensores oculta para usuarios normales
- Botones "Guardar cambios" y "Cancelar" ocultos para usuarios normales

**Campos deshabilitados**:
- ✅ Nombre del dispositivo
- ✅ Tipo de dispositivo
- ✅ Identificador único
- ✅ Estado
- ✅ Ubicación
- ✅ Descripción

**Secciones ocultas/deshabilitadas**:
- ✅ Asignar/remover sensores (solo lectura)
- ✅ Asignar operador (completamente oculto)
- ✅ Botones de acciones (guardar/cancelar)

## 🎨 Elementos Visuales Agregados

### Banner Informativo (Modo Lista)
```jsx
{!isSuperUser && (
    <div style={{
        padding: '12px 20px',
        backgroundColor: 'var(--info-bg, #e3f2fd)',
        border: '1px solid var(--info-border, #90caf9)',
        borderRadius: '8px',
        // ...
    }}>
        Estás viendo únicamente los dispositivos que tienes asignados. 
        Solo los superusuarios pueden ver todos los dispositivos del sistema.
    </div>
)}
```

### Banner de Solo Lectura (Modo Edición)
```jsx
{!isSuperUser && (
    <div style={{ /* estilos */ }}>
        Modo de solo lectura. Solo puedes visualizar la información del dispositivo.
    </div>
)}
```

## 🔐 Criterios de Superusuario

Un usuario es considerado superusuario si cumple alguna de estas condiciones:

```typescript
const isSuperUser = 
    userInfo.levelAccessRolSistema === 'ROOT' || 
    userInfo.levelAccessRolSistema === 'SUPERUSER' ||
    userInfo.nameRolSistema?.toLowerCase().includes('superusuario')
```

## 📡 Endpoints Utilizados

### GET /api/devices/
**Parámetros de consulta**:
- `operador`: ID del operador para filtrar dispositivos asignados

**Ejemplo**:
```typescript
// Superusuario - sin filtro
await dispositivosService.getAll()

// Usuario normal - filtrado por operador
await dispositivosService.getAll({ operador: userInfo.id })
```

## 🎯 Flujos de Usuario

### Flujo Superusuario
1. Accede a `/gestor_dispositivos`
2. Ve todos los dispositivos del sistema
3. Puede crear nuevos dispositivos
4. Puede editar cualquier dispositivo
5. Puede eliminar dispositivos
6. Puede asignar/remover sensores
7. Puede asignar operadores
8. Puede activar/desactivar dispositivos

### Flujo Usuario Normal
1. Accede a `/gestor_dispositivos`
2. Ve solo sus dispositivos asignados
3. Ve banner informativo sobre la limitación
4. **NO** puede crear dispositivos
5. Puede ver detalles de sus dispositivos (solo lectura)
6. **NO** puede editar información
7. **NO** puede eliminar dispositivos
8. **NO** puede asignar/remover sensores
9. **NO** puede cambiar estados

## ✅ Validaciones Implementadas

1. **Validación de permisos en frontend** (UX)
   - Ocultar/deshabilitar elementos según el rol
   - Mensajes informativos claros

2. **Protección de rutas**
   - Redirección automática en páginas restringidas
   - Mensajes de error amigables

3. **Filtrado de datos**
   - Query params según el rol del usuario
   - Respeto de permisos del backend

## 🔄 Compatibilidad

- ✅ Compatible con el sistema de roles existente
- ✅ Respeta la estructura de permisos del backend
- ✅ Integrado con el contexto de autenticación (AppContext)
- ✅ Utiliza los servicios API existentes
- ✅ Mantiene la consistencia visual del sistema

## 📝 Notas Técnicas

1. El filtrado se realiza mediante el parámetro `operador` en la API
2. Se asume que el backend valida y filtra correctamente según permisos
3. La UI se adapta dinámicamente según el contexto del usuario
4. Los mensajes son claros y orientados al usuario

## 🚀 Mejoras Futuras Sugeridas

1. Implementar permisos granulares (lectura, escritura, eliminar)
2. Agregar logs de auditoría para acciones sensibles
3. Permitir delegación temporal de permisos
4. Notificaciones cuando se asigna un dispositivo al usuario
5. Dashboard personalizado por rol con métricas relevantes

---

**Fecha de implementación**: 10 de enero de 2026  
**Módulo**: Gestión de Dispositivos  
**Archivos modificados**:
- `/app/gestor_dispositivos/page.tsx`
- `/app/gestor_dispositivos/[dispositivoId]/page.tsx`
- `/app/gestor_dispositivos/crear/page.tsx`
