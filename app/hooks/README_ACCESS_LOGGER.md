# useAccessLogger Hook

Hook para registrar automáticamente el acceso a módulos del sistema.

## Características

- ✅ Registro automático al entrar a un módulo
- ✅ Detección automática del módulo según la ruta
- ✅ Medición del tiempo de carga real
- ✅ Función manual para registrar acciones específicas
- ✅ No bloquea la UI (proceso en segundo plano)
- ✅ Evita duplicados (solo registra una vez por montaje)

## Uso Básico

### 1. Registro automático al visualizar un módulo

```tsx
'use client'

import useAccessLogger from '@/app/hooks/useAccessLogger'

export default function GestorDispositivosPage() {
    // Registra automáticamente el acceso como GET
    useAccessLogger({ action: 'view' })

    return (
        <div>
            <h1>Gestión de Dispositivos</h1>
            {/* ... contenido ... */}
        </div>
    )
}
```

### 2. Especificar módulo y acción personalizada

```tsx
'use client'

import useAccessLogger from '@/app/hooks/useAccessLogger'

export default function CrearDispositivoPage() {
    // Registra como POST en el módulo de devices
    useAccessLogger({ 
        customModule: 'devices',
        action: 'create'
    })

    return (
        <div>
            <h1>Crear Dispositivo</h1>
            {/* ... formulario ... */}
        </div>
    )
}
```

### 3. Registrar acciones manuales (CRUD)

```tsx
'use client'

import useAccessLogger from '@/app/hooks/useAccessLogger'

export default function EditarDispositivoPage() {
    // Hook con función manual
    const { logAction } = useAccessLogger({ action: 'view' })

    const handleSubmit = async (data) => {
        try {
            await dispositivosService.update(id, data)
            
            // Registrar la actualización exitosa
            await logAction('update', 200)
            
            toast.success('Dispositivo actualizado')
        } catch (error) {
            // Registrar error
            await logAction('update', 400)
            
            toast.error('Error al actualizar')
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            {/* ... campos ... */}
        </form>
    )
}
```

### 4. Deshabilitar logging temporalmente

```tsx
'use client'

import useAccessLogger from '@/app/hooks/useAccessLogger'

export default function PublicPage() {
    // No registra acceso
    useAccessLogger({ enabled: false })

    return <div>Página pública</div>
}
```

## Opciones

| Opción | Tipo | Por defecto | Descripción |
|--------|------|-------------|-------------|
| `action` | `'view' \| 'create' \| 'update' \| 'delete' \| 'list'` | `'view'` | Tipo de acción realizada |
| `customModule` | `string` | Auto-detectado | Módulo personalizado |
| `customEndpoint` | `string` | Ruta actual | Endpoint personalizado |
| `enabled` | `boolean` | `true` | Habilitar/deshabilitar logging |

## Mapeo de Rutas → Módulos

El hook detecta automáticamente el módulo según la ruta:

| Ruta | Módulo |
|------|--------|
| `/login` | `auth` |
| `/gestor_usuarios` | `users` |
| `/gestor_usuarios/roles` | `roles` |
| `/gestor_usuarios/permisos` | `permissions` |
| `/gestor_dispositivos` | `devices` |
| `/gestor_sensores` | `sensors` |
| `/gestor_logs` | `admin` |
| `/dashboard` | `other` |
| Otras rutas | `other` |

## Mapeo de Acciones → Métodos HTTP

| Acción | Método HTTP |
|--------|-------------|
| `view` | `GET` |
| `list` | `GET` |
| `create` | `POST` |
| `update` | `PUT` |
| `delete` | `DELETE` |

## Ejemplos Completos

### Página de Listado

```tsx
'use client'

import { useEffect, useState } from 'react'
import useAccessLogger from '@/app/hooks/useAccessLogger'
import { dispositivosService } from '@/app/services/api.service'

export default function DispositivosPage() {
    // Registro automático al entrar
    useAccessLogger({ action: 'list' })
    
    const [dispositivos, setDispositivos] = useState([])

    useEffect(() => {
        const loadData = async () => {
            const data = await dispositivosService.getAll()
            setDispositivos(data.results)
        }
        loadData()
    }, [])

    return (
        <div>
            <h1>Dispositivos</h1>
            {/* ... tabla ... */}
        </div>
    )
}
```

### Página de Creación

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import useAccessLogger from '@/app/hooks/useAccessLogger'
import { dispositivosService } from '@/app/services/api.service'

export default function CrearDispositivoPage() {
    const router = useRouter()
    const { logAction } = useAccessLogger({ 
        customModule: 'devices',
        action: 'view' // Al entrar es vista
    })
    
    const [formData, setFormData] = useState({})

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        try {
            await dispositivosService.create(formData)
            
            // Registrar creación exitosa
            await logAction('create', 201)
            
            router.push('/gestor_dispositivos')
        } catch (error) {
            // Registrar error
            await logAction('create', 400)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            {/* ... campos ... */}
            <button type="submit">Crear</button>
        </form>
    )
}
```

### Página de Edición

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import useAccessLogger from '@/app/hooks/useAccessLogger'
import { dispositivosService } from '@/app/services/api.service'

export default function EditarDispositivoPage({ params }) {
    const router = useRouter()
    const { logAction } = useAccessLogger({ 
        customModule: 'devices',
        action: 'view'
    })
    
    const [dispositivo, setDispositivo] = useState(null)

    useEffect(() => {
        const loadData = async () => {
            const data = await dispositivosService.getById(params.id)
            setDispositivo(data)
        }
        loadData()
    }, [params.id])

    const handleUpdate = async (formData) => {
        try {
            await dispositivosService.update(params.id, formData)
            await logAction('update', 200)
            router.push('/gestor_dispositivos')
        } catch (error) {
            await logAction('update', 400)
        }
    }

    const handleDelete = async () => {
        try {
            await dispositivosService.delete(params.id)
            await logAction('delete', 204)
            router.push('/gestor_dispositivos')
        } catch (error) {
            await logAction('delete', 400)
        }
    }

    return (
        <div>
            <h1>Editar Dispositivo</h1>
            {/* ... formulario ... */}
            <button onClick={handleUpdate}>Actualizar</button>
            <button onClick={handleDelete}>Eliminar</button>
        </div>
    )
}
```

## Buenas Prácticas

1. **Usa el registro automático**: Solo llama `useAccessLogger()` al inicio del componente
2. **Registra acciones críticas**: Usa `logAction()` para CREATE, UPDATE, DELETE
3. **Incluye códigos de estado**: Diferencia éxitos (200, 201) de errores (400, 404, 500)
4. **No abuses del logging**: No registres cada click, solo acciones importantes
5. **Módulos personalizados**: Usa `customModule` cuando la auto-detección no sea precisa

## Notas Técnicas

- El hook usa `useRef` para evitar registros duplicados
- Incluye un delay de 500ms para medir el tiempo de carga real
- Los errores de logging se capturan silenciosamente (no afectan UX)
- Compatible con Next.js 14+ App Router
