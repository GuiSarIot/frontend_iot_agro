# 🚀 Guía Rápida de Prueba - Simuladores MQTT

Esta guía te ayudará a probar rápidamente los servicios MQTT integrados.

## ✅ Pre-requisitos

### 1. Backend Django Corriendo
```bash
cd backend
python manage.py runserver
# Debe estar corriendo en http://localhost:8000
```

### 2. Broker MQTT (EMQX) Activo
```bash
# Verificar que EMQX esté corriendo
# Por defecto en http://localhost:18083
```

### 3. Variables de Entorno Configuradas
```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🎯 Pruebas Paso a Paso

### Paso 1: Verificar los Servicios

```typescript
// En cualquier componente o consola del navegador
import { mqttCommandsService } from '@/app/services/api.service'

// Obtener comandos disponibles
const commands = await mqttCommandsService.getAvailableCommands()
console.log('Comandos disponibles:', commands)
```

### Paso 2: Probar el Hook

```typescript
// En un componente React
import { useMqttCommands } from '@/app/hooks/useMqttCommands'

function TestComponent() {
    const { ledOn, loading, error } = useMqttCommands()
    
    const handleTest = async () => {
        const response = await ledOn('device-001')
        console.log('Respuesta:', response)
    }
    
    return (
        <button onClick={handleTest} disabled={loading}>
            Probar LED ON
        </button>
    )
}
```

### Paso 3: Usar la Página de Pruebas

1. Inicia el servidor de desarrollo:
```bash
npm run dev
```

2. Abre tu navegador en:
```
http://localhost:3000/test-mqtt-simulators
```

3. Sigue estos pasos:
   - Inicia sesión con tus credenciales
   - Selecciona un dispositivo del dropdown
   - Prueba los controles:
     - ✓ Encender LED
     - ✗ Apagar LED
     - ⚡ Toggle LED
     - Ajusta el dimmer (0-100%)
     - 📡 Lee los sensores
     - 📋 Obtén el estado del sistema

### Paso 4: Verificar en el Backend

Revisa los logs del backend para ver los comandos MQTT enviados:

```python
# En tu backend Django, deberías ver logs como:
# [MQTT] Publicando comando led_on a topic: iot/devices/device-001/commands
# [MQTT] Comando enviado exitosamente
```

### Paso 5: Verificar en el Simulador

Si tienes el simulador MQTT corriendo, deberías ver:

```
[device-001] 💡 LED encendido
[device-001] Comando recibido: led_on
[device-001] Estado actualizado
```

## 📊 Ejemplos de Uso

### Ejemplo 1: Control Simple de LED

```typescript
'use client'

import { QuickCommands } from '@/components/shared/QuickCommands'

export function MyPage() {
    return (
        <div>
            <h1>Control de Dispositivo</h1>
            <QuickCommands 
                deviceId="device-001"
                showLed={true}
                showSensors={true}
                compact={false}
            />
        </div>
    )
}
```

### Ejemplo 2: Panel Completo

```typescript
'use client'

import { MqttControlPanel } from '@/components/shared/MqttControlPanel'
import { dispositivosService } from '@/app/services/api.service'
import { useState, useEffect } from 'react'

export function DeviceControl() {
    const [device, setDevice] = useState(null)

    useEffect(() => {
        const loadDevice = async () => {
            const response = await dispositivosService.getAll()
            if (response.results.length > 0) {
                setDevice(response.results[0])
            }
        }
        loadDevice()
    }, [])

    if (!device) return <div>Cargando...</div>

    return (
        <MqttControlPanel
            dispositivo={device}
            onSuccess={(msg) => alert(`✓ ${msg}`)}
            onError={(err) => alert(`✗ ${err}`)}
        />
    )
}
```

### Ejemplo 3: Hook Personalizado

```typescript
'use client'

import { useMqttCommands } from '@/app/hooks/useMqttCommands'
import { useState } from 'react'

export function CustomControl() {
    const [deviceId] = useState('device-001')
    const { 
        ledOn, 
        ledOff, 
        dimmerSet, 
        loading, 
        error,
        lastResponse 
    } = useMqttCommands()

    return (
        <div>
            <h2>Control Personalizado</h2>
            
            {/* LED Controls */}
            <div>
                <button onClick={() => ledOn(deviceId)}>ON</button>
                <button onClick={() => ledOff(deviceId)}>OFF</button>
            </div>

            {/* Dimmer Controls */}
            <div>
                <button onClick={() => dimmerSet(deviceId, 25)}>25%</button>
                <button onClick={() => dimmerSet(deviceId, 50)}>50%</button>
                <button onClick={() => dimmerSet(deviceId, 75)}>75%</button>
                <button onClick={() => dimmerSet(deviceId, 100)}>100%</button>
            </div>

            {/* Status */}
            {loading && <p>Enviando...</p>}
            {error && <p>Error: {error}</p>}
            {lastResponse && <pre>{JSON.stringify(lastResponse, null, 2)}</pre>}
        </div>
    )
}
```

## 🧪 Pruebas de Integración

### Test 1: Encender/Apagar LED

```typescript
// Prueba manual en consola del navegador
const { mqttCommandsService } = await import('@/app/services/api.service')

// Encender
const response1 = await mqttCommandsService.ledOn('device-001')
console.log('LED ON:', response1)

// Esperar 2 segundos
await new Promise(resolve => setTimeout(resolve, 2000))

// Apagar
const response2 = await mqttCommandsService.ledOff('device-001')
console.log('LED OFF:', response2)
```

### Test 2: Ajustar Dimmer

```typescript
// Probar todos los niveles
const levels = [0, 25, 50, 75, 100]

for (const level of levels) {
    const response = await mqttCommandsService.dimmerSet('device-001', level)
    console.log(`Dimmer ${level}%:`, response)
    await new Promise(resolve => setTimeout(resolve, 1000))
}
```

### Test 3: Leer Sensores

```typescript
// Solicitar lectura
const response = await mqttCommandsService.readSensors('device-001')
console.log('Lectura solicitada:', response)

// Esperar y verificar en lecturas
await new Promise(resolve => setTimeout(resolve, 3000))

const { lecturasService } = await import('@/app/services/api.service')
const lecturas = await lecturasService.getAll({ 
    dispositivo: 'device-001',
    limit: 5 
})
console.log('Últimas lecturas:', lecturas)
```

## 🔍 Debugging

### Verificar Conexión MQTT

```bash
# En el backend Django, usa el shell
python manage.py shell

>>> from apps.devices.mqtt_commands import mqtt_service
>>> mqtt_service.connect()
>>> # Debería retornar True si la conexión es exitosa
```

### Ver Logs en Tiempo Real

```bash
# Backend
tail -f logs/mqtt_commands.log

# Frontend (consola del navegador)
# Abre DevTools > Console
# Los logs del servicio aparecerán ahí
```

### Verificar Topics MQTT

```bash
# Suscribirse a todos los topics del dispositivo
mosquitto_sub -h localhost -t "iot/devices/device-001/#" -v

# O usando EMQX WebSocket en
# http://localhost:18083
```

## ✅ Checklist de Verificación

- [ ] Backend Django corriendo en puerto 8000
- [ ] EMQX corriendo en puerto 1883 y 18083
- [ ] Frontend Next.js corriendo en puerto 3000
- [ ] Usuario autenticado en el sistema
- [ ] Al menos un dispositivo creado en la BD
- [ ] Broker MQTT configurado en Django Admin
- [ ] Variables de entorno configuradas
- [ ] Simulador MQTT corriendo (opcional)

## 📝 Comandos Útiles

```bash
# Iniciar todo
# Terminal 1 - Backend
cd backend && python manage.py runserver

# Terminal 2 - Frontend
npm run dev

# Terminal 3 - Simulador (opcional)
python mqtt_device_simulator.py

# Terminal 4 - Monitor MQTT (opcional)
mosquitto_sub -h localhost -t "iot/#" -v
```

## 🎉 ¡Todo Listo!

Si todos los pasos anteriores funcionan correctamente, la integración está completa.

Puedes comenzar a usar los servicios MQTT en cualquier parte de tu aplicación:

1. Importa el servicio o hook que necesites
2. Llama a los métodos con el ID del dispositivo
3. Maneja las respuestas y errores
4. ¡Disfruta del control en tiempo real de tus dispositivos IoT!

## 📚 Documentación Adicional

- [MQTT_SIMULATORS_INTEGRATION.md](./MQTT_SIMULATORS_INTEGRATION.md) - Documentación completa
- [README.md](./README.md) - Documentación general del proyecto
- Backend API: http://localhost:8000/api/docs/
- EMQX Dashboard: http://localhost:18083/

## 🆘 ¿Necesitas Ayuda?

Si encuentras problemas:

1. Revisa los logs del backend y frontend
2. Verifica que todos los servicios estén corriendo
3. Comprueba las credenciales MQTT
4. Revisa la configuración del broker
5. Consulta la documentación completa

¡Buena suerte! 🚀
