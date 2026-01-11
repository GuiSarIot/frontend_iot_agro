# Verificación de Operadores/Usuarios para Dispositivos

## 🔍 Problema Identificado

La pantalla de edición de dispositivos muestra **"No available options"** en el selector de operadores.

## ✅ Mejoras Implementadas

### 1. **Logging Detallado**
Se agregó logging en consola para rastrear el proceso de carga de operadores:

```typescript
console.log('🔍 Cargando lista de operadores...')
console.log('✅ Usuarios obtenidos:', usuarios)
console.log('📊 Total de usuarios:', usuarios.length)
console.log('✅ Operadores activos filtrados:', operadoresList)
console.log('📊 Total de operadores activos:', operadoresList.length)
```

### 2. **Manejo de Errores Mejorado**
Si hay un error al cargar operadores, se muestra una alerta al usuario:

```typescript
Swal.fire({
    title: 'Advertencia',
    text: 'No se pudieron cargar los operadores...',
    icon: 'warning'
})
```

### 3. **UI Mejorada**
- El dropdown se deshabilita cuando no hay operadores disponibles
- Se muestra un mensaje de advertencia claro cuando no hay usuarios activos
- Placeholder dinámico según la disponibilidad de operadores

### 4. **Componente de Diagnóstico**
Se creó un componente de diagnóstico en `/app/utils/diagnostico-usuarios.tsx` que permite:
- Cargar y visualizar todos los usuarios del sistema
- Ver usuarios activos vs inactivos
- Inspeccionar detalles de cada usuario (ID, username, email, rol, estado)

## 🛠️ Cómo Usar el Diagnóstico

### Opción 1: Agregar temporalmente al layout

Edita el archivo `/app/gestor_dispositivos/[dispositivoId]/page.tsx` y agrega:

```tsx
import DiagnosticoUsuarios from '@/app/utils/diagnostico-usuarios'

// Dentro del return, al final:
return (
    <div>
        {/* Tu contenido actual */}
        <DiagnosticoUsuarios />
    </div>
)
```

### Opción 2: Verificar en la consola del navegador

1. Abre la pantalla de edición de dispositivos
2. Abre las DevTools del navegador (F12)
3. Ve a la pestaña "Console"
4. Busca los mensajes que empiezan con 🔍, ✅, ❌ o ⚠️

## 🔎 Qué Verificar

### En la Consola:
```
🔍 Cargando lista de operadores...
✅ Usuarios obtenidos: Array(X)  // Debe mostrar el array de usuarios
📊 Total de usuarios: X          // Número total recibido del backend
✅ Operadores activos filtrados: Array(Y)  // Usuarios con is_active = true
📊 Total de operadores activos: Y
```

### Posibles Escenarios:

#### Escenario 1: No hay usuarios en el sistema
```
📊 Total de usuarios: 0
⚠️ No se encontraron operadores activos en el sistema
```
**Solución:** Crear usuarios en el gestor de usuarios (`/gestor_usuarios`)

#### Escenario 2: Todos los usuarios están inactivos
```
📊 Total de usuarios: 5
📊 Total de operadores activos: 0
⚠️ No se encontraron operadores activos en el sistema
```
**Solución:** Activar al menos un usuario en el gestor de usuarios

#### Escenario 3: Error de API
```
❌ Error al cargar operadores: [mensaje de error]
```
**Solución:** Verificar:
- La conexión con el backend
- Los permisos del usuario actual
- La URL del endpoint en `.env` (NEXT_PUBLIC_API_URL)

## 🔧 Soluciones Comunes

### 1. Crear Usuarios
Ve a `/gestor_usuarios/crear` y crea al menos un usuario activo.

### 2. Activar Usuarios Existentes
Ve a `/gestor_usuarios`, selecciona un usuario y asegúrate de que esté marcado como "Activo".

### 3. Verificar Endpoint de API

Verifica que el endpoint `/api/users/` esté funcionando correctamente:

```bash
# Ejemplo con curl (reemplaza TOKEN con tu token de autenticación)
curl -H "Authorization: Bearer TOKEN" \
     https://tu-backend.com/api/users/
```

### 4. Verificar Permisos
Asegúrate de que el usuario actual tenga permisos para:
- Listar usuarios (`GET /api/users/`)
- Asignar operadores a dispositivos (`POST /api/devices/{id}/assign_operator/`)

## 📝 Estructura de Usuario Esperada

El backend debe retornar usuarios con esta estructura:

```typescript
interface Usuario {
    id: number
    username: string
    email: string
    first_name: string
    last_name: string
    full_name: string
    is_active: boolean  // ⚠️ Importante para el filtro
    rol: number
    rol_detail?: {
        nombre: string
        nombre_display: string
    }
}
```

## 🚀 Próximos Pasos

1. **Verificar consola**: Abre la pantalla y revisa los logs
2. **Usar diagnóstico**: Agrega el componente de diagnóstico temporalmente
3. **Revisar usuarios**: Ve al gestor de usuarios y verifica que haya usuarios activos
4. **Probar asignación**: Intenta asignar un operador una vez que aparezcan en la lista

## ⚠️ Notas Importantes

- El filtro actual solo muestra usuarios con `is_active === true`
- Si necesitas mostrar usuarios inactivos también, modifica la función `loadOperadores()`:
  ```typescript
  // En lugar de:
  const operadoresList = usuarios.filter(u => u.is_active)
  
  // Usa:
  const operadoresList = usuarios  // Mostrar todos
  ```

- El componente de diagnóstico es temporal y puede removerse después de resolver el problema

## 📞 Contacto

Si el problema persiste después de seguir estos pasos, verifica:
1. Los logs del backend
2. La respuesta del endpoint `/api/users/`
3. Los permisos del usuario autenticado
