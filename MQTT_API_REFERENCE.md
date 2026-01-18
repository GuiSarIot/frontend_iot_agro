# 📚 API Reference - Servicios MQTT

Documentación completa de la API de los servicios MQTT.

## Tabla de Contenidos

- [mqttCommandsService](#mqttcommandsservice)
- [useMqttCommands Hook](#usemqttcommands-hook)
- [Componentes](#componentes)
- [Tipos y Constantes](#tipos-y-constantes)

---

## mqttCommandsService

Servicio para enviar comandos MQTT a dispositivos IoT.

### Importación

```typescript
import { mqttCommandsService } from '@/app/services/api.service'
// O
import { mqttCommandsService } from '@/app/services/mqtt-commands.service'
```

### Métodos

#### `getAvailableCommands()`

Obtiene la lista de comandos disponibles del backend.

**Firma:**
```typescript
getAvailableCommands(): Promise<AvailableCommandsResponse>
```

**Retorna:**
```typescript
{
  commands: AvailableCommand[]
}
```

**Ejemplo:**
```typescript
const response = await mqttCommandsService.getAvailableCommands()
console.log(response.commands)
// [
//   { command: 'led_on', description: 'Encender LED', params: {} },
//   { command: 'dimmer_set', description: 'Ajustar dimmer', params: {...} }
// ]
```

---

#### `sendCommand(deviceId, request)`

Envía un comando genérico a un dispositivo.

**Firma:**
```typescript
sendCommand(
  deviceId: string,
  request: SendCommandRequest
): Promise<SendCommandResponse>
```

**Parámetros:**
- `deviceId` (string): ID único del dispositivo
- `request` (SendCommandRequest):
  - `command` (string): Nombre del comando
  - `params?` (object): Parámetros opcionales

**Retorna:**
```typescript
{
  success: boolean
  message: string
  device_id: string
  command: string
  params?: object
}
```

**Ejemplo:**
```typescript
const response = await mqttCommandsService.sendCommand('device-001', {
  command: 'led_on',
  params: {}
})

if (response.success) {
  console.log(response.message)
}
```

**Errores:**
- `401 Unauthorized`: No autenticado
- `403 Forbidden`: Sin permisos para controlar el dispositivo
- `404 Not Found`: Dispositivo no encontrado
- `500 Internal Server Error`: Error del servidor

---

#### `ledOn(deviceId)`

Enciende el LED de un dispositivo.

**Firma:**
```typescript
ledOn(deviceId: string): Promise<SendCommandResponse>
```

**Parámetros:**
- `deviceId` (string): ID único del dispositivo

**Ejemplo:**
```typescript
await mqttCommandsService.ledOn('device-001')
```

---

#### `ledOff(deviceId)`

Apaga el LED de un dispositivo.

**Firma:**
```typescript
ledOff(deviceId: string): Promise<SendCommandResponse>
```

**Ejemplo:**
```typescript
await mqttCommandsService.ledOff('device-001')
```

---

#### `ledToggle(deviceId)`

Alterna el estado del LED de un dispositivo.

**Firma:**
```typescript
ledToggle(deviceId: string): Promise<SendCommandResponse>
```

**Ejemplo:**
```typescript
await mqttCommandsService.ledToggle('device-001')
```

---

#### `dimmerSet(deviceId, level)`

Ajusta el nivel del dimmer de un dispositivo.

**Firma:**
```typescript
dimmerSet(deviceId: string, level: number): Promise<SendCommandResponse>
```

**Parámetros:**
- `deviceId` (string): ID único del dispositivo
- `level` (number): Nivel del dimmer (0-100)

**Validación:**
- `level` debe estar entre 0 y 100
- `level` debe ser un número entero

**Ejemplo:**
```typescript
await mqttCommandsService.dimmerSet('device-001', 75)
```

**Lanza:**
- `Error`: Si el nivel está fuera del rango 0-100

---

#### `readSensors(deviceId)`

Solicita una lectura de los sensores del dispositivo.

**Firma:**
```typescript
readSensors(deviceId: string): Promise<SendCommandResponse>
```

**Ejemplo:**
```typescript
await mqttCommandsService.readSensors('device-001')
```

---

#### `getStatus(deviceId)`

Obtiene el estado completo del dispositivo.

**Firma:**
```typescript
getStatus(deviceId: string): Promise<SendCommandResponse>
```

**Ejemplo:**
```typescript
const response = await mqttCommandsService.getStatus('device-001')
console.log(response)
```

---

#### `restart(deviceId)`

Reinicia el dispositivo.

**Firma:**
```typescript
restart(deviceId: string): Promise<SendCommandResponse>
```

**Ejemplo:**
```typescript
if (confirm('¿Reiniciar dispositivo?')) {
  await mqttCommandsService.restart('device-001')
}
```

---

#### `custom(deviceId, command, params?)`

Envía un comando personalizado al dispositivo.

**Firma:**
```typescript
custom(
  deviceId: string,
  command: string,
  params?: CustomCommandParams
): Promise<SendCommandResponse>
```

**Parámetros:**
- `deviceId` (string): ID único del dispositivo
- `command` (string): Nombre del comando personalizado
- `params?` (object): Parámetros opcionales del comando

**Ejemplo:**
```typescript
await mqttCommandsService.custom('device-001', 'calibrate', {
  mode: 'auto',
  duration: 30
})
```

---

## useMqttCommands Hook

Hook de React para usar comandos MQTT en componentes.

### Importación

```typescript
import { useMqttCommands } from '@/app/hooks/useMqttCommands'
```

### Uso

```typescript
const {
  // Comandos LED
  ledOn,
  ledOff,
  ledToggle,
  
  // Comandos Dimmer
  dimmerSet,
  
  // Comandos Sensores
  readSensors,
  
  // Comandos Sistema
  getStatus,
  restart,
  
  // Comando Personalizado
  sendCustomCommand,
  
  // Obtener comandos disponibles
  getAvailableCommands,
  
  // Estado
  loading,
  error,
  lastResponse,
  
  // Utilidades
  clearError
} = useMqttCommands()
```

### Propiedades

#### `loading: boolean`

Indica si hay un comando en ejecución.

**Ejemplo:**
```typescript
<button disabled={loading}>
  {loading ? 'Enviando...' : 'Enviar'}
</button>
```

---

#### `error: string | null`

Mensaje de error si ocurre un problema.

**Ejemplo:**
```typescript
{error && (
  <div className="error">
    Error: {error}
    <button onClick={clearError}>×</button>
  </div>
)}
```

---

#### `lastResponse: SendCommandResponse | null`

Última respuesta recibida del servidor.

**Ejemplo:**
```typescript
{lastResponse && (
  <div className="response">
    {lastResponse.message}
  </div>
)}
```

---

### Métodos

Todos los métodos de comando retornan `Promise<SendCommandResponse | null>`.

#### `ledOn(deviceId: string)`

```typescript
const response = await ledOn('device-001')
if (response?.success) {
  console.log('LED encendido')
}
```

#### `ledOff(deviceId: string)`

```typescript
await ledOff('device-001')
```

#### `ledToggle(deviceId: string)`

```typescript
await ledToggle('device-001')
```

#### `dimmerSet(deviceId: string, level: number)`

```typescript
await dimmerSet('device-001', 50)
```

#### `readSensors(deviceId: string)`

```typescript
await readSensors('device-001')
```

#### `getStatus(deviceId: string)`

```typescript
await getStatus('device-001')
```

#### `restart(deviceId: string)`

```typescript
await restart('device-001')
```

#### `sendCustomCommand(deviceId, command, params?)`

```typescript
await sendCustomCommand('device-001', 'custom_cmd', { param: 'value' })
```

#### `getAvailableCommands(): Promise<AvailableCommand[]>`

```typescript
const commands = await getAvailableCommands()
console.log(commands)
```

#### `clearError(): void`

```typescript
clearError()
```

---

## Componentes

### MqttControlPanel

Panel de control completo para dispositivos MQTT.

#### Props

```typescript
interface MqttControlPanelProps {
  dispositivo: Dispositivo
  onSuccess?: (message: string) => void
  onError?: (error: string) => void
}
```

#### Uso

```typescript
import { MqttControlPanel } from '@/components/shared/MqttControlPanel'

<MqttControlPanel
  dispositivo={device}
  onSuccess={(msg) => toast.success(msg)}
  onError={(err) => toast.error(err)}
/>
```

#### Características

- Control de LED (On/Off/Toggle)
- Control de Dimmer con slider
- Lectura de sensores
- Estado del sistema
- Reinicio de dispositivo
- Indicador de carga
- Visualización de última respuesta

---

### QuickCommands

Botones de comandos rápidos.

#### Props

```typescript
interface QuickCommandsProps {
  deviceId: string
  showLed?: boolean        // default: true
  showDimmer?: boolean     // default: true
  showSensors?: boolean    // default: true
  showSystem?: boolean     // default: false
  compact?: boolean        // default: false
}
```

#### Uso

```typescript
import { QuickCommands } from '@/components/shared/QuickCommands'

<QuickCommands
  deviceId="device-001"
  showLed={true}
  showDimmer={true}
  showSensors={true}
  compact={false}
/>
```

---

## Tipos y Constantes

### LED_COMMANDS

```typescript
const LED_COMMANDS = {
  ON: 'led_on',
  OFF: 'led_off',
  TOGGLE: 'led_toggle',
} as const
```

### DIMMER_COMMANDS

```typescript
const DIMMER_COMMANDS = {
  SET: 'dimmer_set',
} as const
```

### SENSOR_COMMANDS

```typescript
const SENSOR_COMMANDS = {
  READ: 'read_sensors',
} as const
```

### SYSTEM_COMMANDS

```typescript
const SYSTEM_COMMANDS = {
  GET_STATUS: 'get_status',
  RESTART: 'restart',
} as const
```

### DIMMER_RANGE

```typescript
const DIMMER_RANGE = {
  MIN: 0,
  MAX: 100,
} as const
```

### Funciones de Utilidad

#### `isValidDimmerLevel(level: number): boolean`

```typescript
import { isValidDimmerLevel } from '@/app/services/mqtt-commands.types'

if (isValidDimmerLevel(level)) {
  // válido
}
```

#### `getCommandDescription(command: MqttCommand): string`

```typescript
import { getCommandDescription } from '@/app/services/mqtt-commands.types'

const desc = getCommandDescription('led_on')
// "Encender LED"
```

#### `getCommandIcon(command: MqttCommand): string`

```typescript
import { getCommandIcon } from '@/app/services/mqtt-commands.types'

const icon = getCommandIcon('led_on')
// "💡"
```

---

## Interfaces TypeScript

### AvailableCommand

```typescript
interface AvailableCommand {
  command: string
  description: string
  params?: {
    [paramName: string]: {
      type: string
      min?: number
      max?: number
      description?: string
      required?: boolean
    }
  }
}
```

### SendCommandRequest

```typescript
interface SendCommandRequest {
  command: string
  params?: DimmerParams | CustomCommandParams
}
```

### SendCommandResponse

```typescript
interface SendCommandResponse {
  success: boolean
  message: string
  device_id: string
  command: string
  params?: DimmerParams | CustomCommandParams
}
```

### DimmerParams

```typescript
interface DimmerParams {
  level: number // 0-100
}
```

### CustomCommandParams

```typescript
interface CustomCommandParams {
  [key: string]: unknown
}
```

---

## Ejemplos Completos

### Control de LED con Estado

```typescript
'use client'

import { useState } from 'react'
import { useMqttCommands } from '@/app/hooks/useMqttCommands'

export function LedSwitch({ deviceId }: { deviceId: string }) {
  const [isOn, setIsOn] = useState(false)
  const { ledOn, ledOff, loading, error } = useMqttCommands()

  const toggle = async () => {
    const response = isOn 
      ? await ledOff(deviceId)
      : await ledOn(deviceId)
    
    if (response?.success) {
      setIsOn(!isOn)
    }
  }

  return (
    <div>
      <button onClick={toggle} disabled={loading}>
        {loading ? '⏳' : isOn ? '🟢' : '⚫'}
      </button>
      {error && <p>Error: {error}</p>}
    </div>
  )
}
```

### Slider de Dimmer

```typescript
'use client'

import { useState } from 'react'
import { useMqttCommands } from '@/app/hooks/useMqttCommands'

export function DimmerSlider({ deviceId }: { deviceId: string }) {
  const [level, setLevel] = useState(50)
  const { dimmerSet, loading } = useMqttCommands()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLevel(Number(e.target.value))
  }

  const handleApply = async () => {
    await dimmerSet(deviceId, level)
  }

  return (
    <div>
      <h3>{level}%</h3>
      <input
        type="range"
        min="0"
        max="100"
        value={level}
        onChange={handleChange}
        disabled={loading}
      />
      <button onClick={handleApply} disabled={loading}>
        Aplicar
      </button>
    </div>
  )
}
```

---

Para más ejemplos, consulta [MQTT_SIMULATORS_INTEGRATION.md](./MQTT_SIMULATORS_INTEGRATION.md)
