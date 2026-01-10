# 📡 Documentación de APIs - Dispositivos IoT

## 🎯 Información General

**Base URL**: `${process.env.NEXT_PUBLIC_API_URL}/api/devices/`  
**Autenticación**: Bearer Token (JWT)

---

## 📚 Servicios Disponibles

### Archivo: `app/services/dispositivos.service.ts`

Este archivo contiene todas las interfaces TypeScript y servicios para interactuar con la API de dispositivos.

---

## 🔌 Endpoints Implementados

### 1️⃣ Listar Dispositivos
```typescript
dispositivosService.getAll(params?: DispositivoQueryParams)
```

**Parámetros de búsqueda**:
- `search`: Buscar por nombre, tipo, identificador_unico, ubicacion
- `tipo`: Filtrar por tipo de dispositivo
- `estado`: Filtrar por estado (activo, inactivo, mantenimiento)
- `operador`: Filtrar por ID de operador
- `page`: Número de página
- `page_size`: Resultados por página

**Ejemplo de uso**:
```typescript
import { dispositivosService } from '@/app/services/api.service'

// Obtener todos
const response = await dispositivosService.getAll()

// Con filtros
const filtered = await dispositivosService.getAll({
    search: 'raspberry',
    estado: 'activo',
    page: 1,
    page_size: 10
})
```

---

### 2️⃣ Crear Dispositivo
```typescript
dispositivosService.create(data: CreateDispositivoDto)
```

**Ejemplo**:
```typescript
const nuevoDispositivo = await dispositivosService.create({
    nombre: 'ESP32 - Oficina',
    tipo: 'esp32',
    identificador_unico: 'ESP32-OFICINA-001',
    ubicacion: 'Oficina Principal',
    estado: 'activo',
    descripcion: 'ESP32 con DHT22'
})
```

---

### 3️⃣ Obtener Detalle
```typescript
dispositivosService.getById(id: number)
```

**Ejemplo**:
```typescript
const dispositivo = await dispositivosService.getById(1)
console.log(dispositivo.nombre)
console.log(dispositivo.sensores_asignados)
```

---

### 4️⃣ Actualizar Dispositivo

**Actualización completa (PUT)**:
```typescript
dispositivosService.update(id: number, data: CreateDispositivoDto)
```

**Actualización parcial (PATCH)**:
```typescript
dispositivosService.partialUpdate(id: number, data: Partial<CreateDispositivoDto>)
```

**Ejemplo**:
```typescript
// Solo actualizar ubicación y estado
await dispositivosService.partialUpdate(1, {
    ubicacion: 'Nueva ubicación',
    estado: 'mantenimiento'
})
```

---

### 5️⃣ Eliminar Dispositivo
```typescript
dispositivosService.delete(id: number)
```

**Ejemplo**:
```typescript
await dispositivosService.delete(5)
```

---

### 6️⃣ Asignar Sensor a Dispositivo
```typescript
dispositivosService.assignSensor(dispositivoId: number, data: AsignarSensorDto)
```

**Ejemplo**:
```typescript
const asignacion = await dispositivosService.assignSensor(1, {
    sensor_id: 3,
    configuracion_json: {
        intervalo: 60,
        umbral_alerta: 30
    }
})
```

---

### 7️⃣ Remover Sensor de Dispositivo
```typescript
dispositivosService.removeSensor(dispositivoId: number, sensorId: number)
```

**Ejemplo**:
```typescript
await dispositivosService.removeSensor(1, 3)
```

---

### 8️⃣ Asignar Operador a Dispositivo
```typescript
dispositivosService.assignOperator(dispositivoId: number, data: AsignarOperadorDto)
```

**Ejemplo**:
```typescript
const resultado = await dispositivosService.assignOperator(5, {
    operador_id: 2
})
```

---

### 9️⃣ Obtener Tipos de Dispositivos
```typescript
dispositivosService.getTipos()
```

**Ejemplo**:
```typescript
const tipos = await dispositivosService.getTipos()
// Retorna: [{ value: 'raspberry_pi', label: 'Raspberry Pi' }, ...]
```

---

### 🔟 Dispositivos con MQTT Habilitado
```typescript
dispositivosService.getMqttDevices()
```

**Ejemplo**:
```typescript
const mqttDevices = await dispositivosService.getMqttDevices()
mqttDevices.forEach(device => {
    console.log(`${device.nombre}: ${device.connection_status}`)
})
```

---

### 1️⃣1️⃣ Credenciales MQTT
```typescript
dispositivosService.getMqttCredentials(dispositivoId: number)
```

**Ejemplo**:
```typescript
const credentials = await dispositivosService.getMqttCredentials(1)
console.log('Broker:', credentials.broker_host)
console.log('Port:', credentials.broker_port)
console.log('Username:', credentials.emqx_username)
// password solo visible para superusuarios
```

---

## 🎣 Hook: `useDispositivos`

### Uso básico:

```typescript
import { useDispositivos } from '@/app/hooks/useDispositivos'

function MiComponente() {
    const {
        dispositivos,
        loading,
        error,
        fetchDispositivos,
        createDispositivo,
        updateDispositivo,
        deleteDispositivo,
        assignSensor,
        removeSensor,
        getTipos
    } = useDispositivos()

    // Los dispositivos se cargan automáticamente al montar
    
    return (
        <div>
            {loading && <p>Cargando...</p>}
            {error && <p>Error: {error}</p>}
            {dispositivos.map(d => (
                <div key={d.id}>{d.nombre}</div>
            ))}
        </div>
    )
}
```

### Métodos disponibles:

| Método | Descripción | Retorno |
|--------|-------------|---------|
| `fetchDispositivos(params?)` | Carga dispositivos con filtros opcionales | `Promise<void>` |
| `fetchDispositivoById(id)` | Carga un dispositivo específico | `Promise<Dispositivo \| null>` |
| `createDispositivo(data)` | Crea nuevo dispositivo | `Promise<boolean>` |
| `updateDispositivo(id, data)` | Actualización completa | `Promise<boolean>` |
| `partialUpdateDispositivo(id, data)` | Actualización parcial | `Promise<boolean>` |
| `deleteDispositivo(id)` | Elimina dispositivo | `Promise<boolean>` |
| `assignSensor(dispositivoId, data)` | Asigna sensor | `Promise<boolean>` |
| `removeSensor(dispositivoId, sensorId)` | Remueve sensor | `Promise<boolean>` |
| `assignOperator(dispositivoId, data)` | Asigna operador | `Promise<boolean>` |
| `getTipos()` | Obtiene tipos disponibles | `Promise<TipoDispositivo[]>` |
| `getMqttDevices()` | Dispositivos MQTT | `Promise<DispositivoMqtt[]>` |
| `getMqttCredentials(id)` | Credenciales MQTT | `Promise<MqttCredentials \| null>` |

---

## 📝 Interfaces TypeScript

### Dispositivo

```typescript
interface Dispositivo {
    id: number
    nombre: string
    tipo: string
    tipo_display: string
    identificador_unico: string
    ubicacion: string
    estado: string
    estado_display: string
    descripcion: string
    operador_asignado: number | null
    operador_username?: string
    mqtt_enabled?: boolean
    mqtt_client_id?: string
    connection_status?: string
    last_seen?: string
    sensores_asignados: SensorAsignado[]
    cantidad_sensores: number
    created_at: string
    updated_at?: string
}
```

### SensorAsignado

```typescript
interface SensorAsignado {
    id: number
    sensor: number
    sensor_nombre: string
    sensor_detail?: {...}
    configuracion_json: {
        intervalo?: number
        umbral_alerta?: number
        [key: string]: unknown
    }
    activo: boolean
    fecha_asignacion: string
}
```

### CreateDispositivoDto

```typescript
interface CreateDispositivoDto {
    nombre: string
    tipo: string
    identificador_unico: string
    ubicacion: string
    estado?: string
    descripcion?: string
    operador_asignado?: number | null
}
```

---

## 🎨 Ejemplo Completo: Componente con CRUD

```typescript
'use client'

import { useState } from 'react'
import { useDispositivos } from '@/app/hooks/useDispositivos'
import Swal from 'sweetalert2'

export default function GestorDispositivos() {
    const {
        dispositivos,
        loading,
        createDispositivo,
        deleteDispositivo,
        getTipos
    } = useDispositivos()
    
    const [tipos, setTipos] = useState([])

    // Cargar tipos al montar
    useEffect(() => {
        getTipos().then(setTipos)
    }, [])

    const handleCrear = async () => {
        const success = await createDispositivo({
            nombre: 'Nuevo Dispositivo',
            tipo: 'raspberry_pi',
            identificador_unico: 'RPI-001',
            ubicacion: 'Sala 1',
            estado: 'activo'
        })
        
        if (success) {
            Swal.fire('Éxito', 'Dispositivo creado', 'success')
        }
    }

    const handleEliminar = async (id: number) => {
        const success = await deleteDispositivo(id)
        if (success) {
            Swal.fire('Éxito', 'Dispositivo eliminado', 'success')
        }
    }

    return (
        <div>
            <button onClick={handleCrear}>Crear</button>
            
            {loading ? (
                <p>Cargando...</p>
            ) : (
                <ul>
                    {dispositivos.map(d => (
                        <li key={d.id}>
                            {d.nombre} - {d.tipo_display}
                            <button onClick={() => handleEliminar(d.id)}>
                                Eliminar
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
```

---

## ✅ Validaciones y Errores

Todos los métodos incluyen:
- ✅ Manejo de errores con try/catch
- ✅ Mensajes de SweetAlert2
- ✅ Loading states
- ✅ Confirmaciones para acciones destructivas
- ✅ Actualización automática del estado local

---

## 🔐 Permisos

- **Listar**: Autenticado (Operadores ven solo sus dispositivos)
- **Crear**: Superusuario o Operador
- **Actualizar**: Superusuario o Operador (solo sus dispositivos)
- **Eliminar**: Superusuario
- **Asignar Operador**: Superusuario
- **Asignar/Remover Sensor**: Superusuario o Operador
- **Credenciales MQTT**: Superusuario (password completo) u Operador (sin password)

---

## 📌 Notas Importantes

1. **Respuestas paginadas**: `getAll()` puede retornar `{ count, results }` o un array directo
2. **Tipos dinámicos**: Siempre usar `getTipos()` para obtener los tipos del backend
3. **MQTT**: Solo dispositivos con `mqtt_enabled: true` tienen credenciales
4. **Estados**: Los estados predefinidos son: `activo`, `inactivo`, `mantenimiento`

---

## 🚀 Mejores Prácticas

1. **Usar el hook** `useDispositivos` en lugar de llamar directamente al servicio
2. **Filtrar en el backend** usando query params en lugar de filtrar en el frontend
3. **Validar formularios** antes de enviar al backend
4. **Confirmar acciones destructivas** con SweetAlert2
5. **Manejar estados de carga** para mejor UX

---

Generado el: 9 de enero de 2026
