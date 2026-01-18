# 🌐 Integración de Simuladores MQTT - Guía Completa

Esta guía explica cómo usar los servicios MQTT integrados en el frontend para controlar dispositivos IoT en tiempo real.

## 📋 Tabla de Contenidos

1. [Archivos Creados](#archivos-creados)
2. [Servicios Disponibles](#servicios-disponibles)
3. [Uso del Hook useMqttCommands](#uso-del-hook-usemqttcommands)
4. [Componente MqttControlPanel](#componente-mqttcontrolpanel)
5. [Página de Pruebas](#página-de-pruebas)
6. [Ejemplos de Uso](#ejemplos-de-uso)
7. [Configuración del Backend](#configuración-del-backend)

---

## 📁 Archivos Creados

### Servicios
- `app/services/mqtt-commands.service.ts` - Servicio principal para comandos MQTT
- `app/services/api.service.ts` - Actualizado con exportaciones del nuevo servicio

### Hooks
- `app/hooks/useMqttCommands.ts` - Hook personalizado para usar comandos MQTT

### Componentes
- `components/shared/MqttControlPanel/MqttControlPanel.tsx` - Panel de control MQTT
- `components/shared/MqttControlPanel/MqttControlPanel.module.css` - Estilos del panel
- `components/shared/MqttControlPanel/index.ts` - Exportaciones

### Páginas
- `app/test-mqtt-simulators/page.tsx` - Página de prueba de simuladores
- `app/test-mqtt-simulators/layout.tsx` - Layout de la página
- `app/test-mqtt-simulators/simuladores.module.css` - Estilos de la página

---

## 🔧 Servicios Disponibles

### mqtt-commands.service.ts

El servicio proporciona los siguientes métodos:

#### Comandos LED

```typescript
import { mqttCommandsService } from '@/app/services/api.service'

// Encender LED
await mqttCommandsService.ledOn('device-001')

// Apagar LED
await mqttCommandsService.ledOff('device-001')

// Alternar LED
await mqttCommandsService.ledToggle('device-001')
```

#### Comandos Dimmer

```typescript
// Ajustar nivel del dimmer (0-100)
await mqttCommandsService.dimmerSet('device-001', 75)
```

#### Comandos de Sensores

```typescript
// Solicitar lectura de sensores
await mqttCommandsService.readSensors('device-001')
```

#### Comandos de Sistema

```typescript
// Obtener estado completo
await mqttCommandsService.getStatus('device-001')

// Reiniciar dispositivo
await mqttCommandsService.restart('device-001')
```

#### Comando Personalizado

```typescript
// Enviar comando personalizado con parámetros
await mqttCommandsService.custom('device-001', 'mi_comando', {
    param1: 'valor1',
    param2: 123
})
```

#### Obtener Comandos Disponibles

```typescript
const response = await mqttCommandsService.getAvailableCommands()
console.log(response.commands) // Array de comandos disponibles
```

---

## 🪝 Uso del Hook useMqttCommands

El hook `useMqttCommands` simplifica el uso de comandos MQTT en componentes React.

### Ejemplo Básico

```typescript
'use client'

import { useMqttCommands } from '@/app/hooks/useMqttCommands'

export function MiComponente() {
    const {
        ledOn,
        ledOff,
        dimmerSet,
        loading,
        error,
        lastResponse
    } = useMqttCommands()

    const handleEncenderLed = async () => {
        const response = await ledOn('device-001')
        if (response?.success) {
            console.log('LED encendido!')
        }
    }

    const handleDimmer = async (nivel: number) => {
        await dimmerSet('device-001', nivel)
    }

    return (
        <div>
            <button onClick={handleEncenderLed} disabled={loading}>
                Encender LED
            </button>
            
            {error && <div>Error: {error}</div>}
            {lastResponse && <div>{lastResponse.message}</div>}
        </div>
    )
}
```

### Métodos Disponibles

| Método | Parámetros | Descripción |
|--------|-----------|-------------|
| `ledOn` | `deviceId: string` | Encender LED |
| `ledOff` | `deviceId: string` | Apagar LED |
| `ledToggle` | `deviceId: string` | Alternar LED |
| `dimmerSet` | `deviceId: string, level: number` | Ajustar dimmer (0-100) |
| `readSensors` | `deviceId: string` | Leer sensores |
| `getStatus` | `deviceId: string` | Obtener estado |
| `restart` | `deviceId: string` | Reiniciar dispositivo |
| `sendCustomCommand` | `deviceId, command, params?` | Comando personalizado |
| `getAvailableCommands` | - | Obtener comandos disponibles |
| `clearError` | - | Limpiar error |

### Propiedades del Estado

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `loading` | `boolean` | Indica si hay un comando en ejecución |
| `error` | `string \| null` | Mensaje de error si ocurre |
| `lastResponse` | `SendCommandResponse \| null` | Última respuesta recibida |

---

## 🎮 Componente MqttControlPanel

Panel de control completo para dispositivos MQTT.

### Uso Básico

```typescript
import { MqttControlPanel } from '@/components/shared/MqttControlPanel'
import type { Dispositivo } from '@/app/services/api.service'

export function MiPagina() {
    const dispositivo: Dispositivo = {
        id: 1,
        identificador_unico: 'device-001',
        nombre: 'Sensor de Temperatura',
        tipo: 'sensor',
        // ... otros campos
    }

    const handleSuccess = (message: string) => {
        console.log('Éxito:', message)
    }

    const handleError = (error: string) => {
        console.error('Error:', error)
    }

    return (
        <MqttControlPanel
            dispositivo={dispositivo}
            onSuccess={handleSuccess}
            onError={handleError}
        />
    )
}
```

### Props

| Prop | Tipo | Descripción |
|------|------|-------------|
| `dispositivo` | `Dispositivo` | Objeto del dispositivo a controlar |
| `onSuccess?` | `(message: string) => void` | Callback cuando un comando se ejecuta con éxito |
| `onError?` | `(error: string) => void` | Callback cuando ocurre un error |

### Características

- ✅ Control de LED (Encender/Apagar/Toggle)
- ✅ Control de Dimmer con slider (0-100%)
- ✅ Lectura de sensores
- ✅ Estado del sistema
- ✅ Reinicio de dispositivo
- ✅ Indicador de carga
- ✅ Visualización de última respuesta

---

## 🧪 Página de Pruebas

Accede a la página de pruebas en: **`/test-mqtt-simulators`**

### Características

1. **Selector de Dispositivos** - Elige el dispositivo a controlar
2. **Información del Dispositivo** - Visualiza datos del dispositivo seleccionado
3. **Panel de Control MQTT** - Controla el dispositivo en tiempo real
4. **Notificaciones** - Muestra mensajes de éxito/error
5. **Información de Ayuda** - Guía sobre comandos disponibles

### Cómo Usar

1. Inicia sesión en la aplicación
2. Navega a `/test-mqtt-simulators`
3. Selecciona un dispositivo del dropdown
4. Usa los controles para enviar comandos
5. Observa las respuestas en la sección de última respuesta

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Control de LED con Estado Local

```typescript
'use client'

import { useState } from 'react'
import { useMqttCommands } from '@/app/hooks/useMqttCommands'

export function LedController({ deviceId }: { deviceId: string }) {
    const [ledState, setLedState] = useState(false)
    const { ledOn, ledOff, loading } = useMqttCommands()

    const handleToggle = async () => {
        const response = ledState 
            ? await ledOff(deviceId)
            : await ledOn(deviceId)
        
        if (response?.success) {
            setLedState(!ledState)
        }
    }

    return (
        <button onClick={handleToggle} disabled={loading}>
            {loading ? '⏳' : ledState ? '🟢' : '⚫'} 
            {ledState ? 'Apagar' : 'Encender'}
        </button>
    )
}
```

### Ejemplo 2: Dimmer con Vista Previa

```typescript
'use client'

import { useState } from 'react'
import { useMqttCommands } from '@/app/hooks/useMqttCommands'

export function DimmerControl({ deviceId }: { deviceId: string }) {
    const [level, setLevel] = useState(50)
    const { dimmerSet, loading } = useMqttCommands()

    const handleApply = async () => {
        await dimmerSet(deviceId, level)
    }

    return (
        <div>
            <div style={{ fontSize: '48px' }}>{level}%</div>
            <input
                type="range"
                min="0"
                max="100"
                value={level}
                onChange={(e) => setLevel(Number(e.target.value))}
                disabled={loading}
            />
            <button onClick={handleApply} disabled={loading}>
                Aplicar
            </button>
        </div>
    )
}
```

### Ejemplo 3: Lectura Automática de Sensores

```typescript
'use client'

import { useEffect } from 'react'
import { useMqttCommands } from '@/app/hooks/useMqttCommands'

export function AutoSensorReader({ deviceId }: { deviceId: string }) {
    const { readSensors, lastResponse } = useMqttCommands()

    useEffect(() => {
        // Leer sensores cada 10 segundos
        const interval = setInterval(() => {
            readSensors(deviceId)
        }, 10000)

        // Leer inmediatamente
        readSensors(deviceId)

        return () => clearInterval(interval)
    }, [deviceId, readSensors])

    return (
        <div>
            <h3>Lecturas Automáticas</h3>
            {lastResponse && (
                <pre>{JSON.stringify(lastResponse, null, 2)}</pre>
            )}
        </div>
    )
}
```

### Ejemplo 4: Panel de Control Personalizado

```typescript
'use client'

import { useMqttCommands } from '@/app/hooks/useMqttCommands'

export function CustomControlPanel({ deviceId }: { deviceId: string }) {
    const {
        ledOn,
        ledOff,
        dimmerSet,
        readSensors,
        getStatus,
        loading,
        error,
        clearError
    } = useMqttCommands()

    return (
        <div className="control-panel">
            {error && (
                <div className="error">
                    {error}
                    <button onClick={clearError}>✕</button>
                </div>
            )}

            <section>
                <h4>LED</h4>
                <button onClick={() => ledOn(deviceId)} disabled={loading}>
                    ON
                </button>
                <button onClick={() => ledOff(deviceId)} disabled={loading}>
                    OFF
                </button>
            </section>

            <section>
                <h4>Dimmer</h4>
                <button onClick={() => dimmerSet(deviceId, 0)} disabled={loading}>
                    0%
                </button>
                <button onClick={() => dimmerSet(deviceId, 50)} disabled={loading}>
                    50%
                </button>
                <button onClick={() => dimmerSet(deviceId, 100)} disabled={loading}>
                    100%
                </button>
            </section>

            <section>
                <h4>Información</h4>
                <button onClick={() => readSensors(deviceId)} disabled={loading}>
                    📊 Leer Sensores
                </button>
                <button onClick={() => getStatus(deviceId)} disabled={loading}>
                    📋 Estado
                </button>
            </section>
        </div>
    )
}
```

---

## ⚙️ Configuración del Backend

### Endpoints Requeridos

El backend debe implementar los siguientes endpoints:

#### 1. Enviar Comando

```
POST /api/devices/{device_id}/command/
```

**Request Body:**
```json
{
    "command": "led_on",
    "params": {}
}
```

**Response:**
```json
{
    "success": true,
    "message": "Comando led_on enviado a device-001",
    "device_id": "device-001",
    "command": "led_on",
    "params": {}
}
```

#### 2. Obtener Comandos Disponibles

```
GET /api/devices/available-commands/
```

**Response:**
```json
{
    "commands": [
        {
            "command": "led_on",
            "description": "Encender LED",
            "params": {}
        },
        {
            "command": "dimmer_set",
            "description": "Ajustar nivel del dimmer",
            "params": {
                "level": {
                    "type": "integer",
                    "min": 0,
                    "max": 100,
                    "description": "Nivel del dimmer (0-100%)"
                }
            }
        }
    ]
}
```

### Variables de Entorno

Asegúrate de configurar en `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### CORS

El backend debe permitir peticiones desde el frontend:

```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CORS_ALLOW_CREDENTIALS = True
```

---

## 🚀 Inicio Rápido

### 1. Verificar que el Backend esté corriendo

```bash
# Backend Django
cd backend
python manage.py runserver
```

### 2. Iniciar el Frontend

```bash
# Frontend Next.js
npm run dev
```

### 3. Acceder a la Página de Pruebas

Abre tu navegador en:
```
http://localhost:3000/test-mqtt-simulators
```

### 4. Iniciar los Simuladores MQTT

```bash
# En el proyecto de simuladores
python mqtt_device_simulator.py
```

---

## 📝 Notas Importantes

1. **Autenticación**: Todos los endpoints requieren autenticación JWT
2. **Permisos**: Solo superusuarios y operadores asignados pueden controlar dispositivos
3. **Validación**: El nivel del dimmer se valida en el rango 0-100
4. **MQTT**: El backend debe estar conectado al broker MQTT (EMQX)
5. **Tiempo Real**: Los comandos se envían en tiempo real al dispositivo

---

## 🐛 Troubleshooting

### Error: "No se pudo conectar al broker MQTT"
- Verifica que EMQX esté corriendo
- Revisa las credenciales MQTT en el backend
- Comprueba la configuración del broker en la base de datos

### Error: "No tienes permiso para controlar este dispositivo"
- Verifica que el usuario sea superusuario u operador asignado
- Comprueba los permisos en el backend

### Error: "Dispositivo no encontrado"
- Asegúrate de que el dispositivo existe en la base de datos
- Verifica el ID del dispositivo

### Los comandos no llegan al simulador
- Confirma que el simulador esté suscrito al topic correcto
- Verifica los logs del broker MQTT
- Revisa la configuración de topics en el backend

---

## 📚 Referencias

- [Documentación MQTT](https://mqtt.org/)
- [EMQX Documentation](https://www.emqx.io/docs/en/latest/)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Hooks](https://react.dev/reference/react)

---

## ✅ Checklist de Integración

- [x] Servicio `mqtt-commands.service.ts` creado
- [x] Hook `useMqttCommands` implementado
- [x] Componente `MqttControlPanel` creado
- [x] Página de pruebas `/test-mqtt-simulators` creada
- [x] Estilos CSS implementados
- [x] Exportaciones en `api.service.ts` actualizadas
- [x] Documentación completa

---

## 🎯 Próximos Pasos

1. **WebSocket**: Implementar WebSocket para recibir actualizaciones en tiempo real
2. **Gráficos**: Agregar gráficos de tendencias de sensores
3. **Alertas**: Sistema de notificaciones para valores críticos
4. **Historial**: Visualizar historial de comandos enviados
5. **Dashboard**: Panel de control ejecutivo con múltiples dispositivos

---

¿Necesitas ayuda? Consulta la documentación o contacta al equipo de desarrollo.
