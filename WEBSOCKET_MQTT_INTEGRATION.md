# Integración MQTT en Tiempo Real con EMQX

## 📋 Descripción General

El frontend se conecta **DIRECTAMENTE al broker EMQX** vía WebSocket MQTT para recibir lecturas de sensores en tiempo real. **NO se usa Django Channels ni WebSocket a través del backend Django**.

## 🏗️ Arquitectura Correcta

```
┌─────────────┐
│  Frontend   │ ← React/Next.js
│  (Next.js)  │
└──────┬──────┘
       │
       │ WebSocket MQTT (puerto 8083)
       │ ws://158.247.123.43:8083/mqtt
       ↓
┌─────────────┐
│   EMQX      │ ← Broker MQTT
│   Broker    │
└──────┬──────┘
       ↑
       │ MQTT (puerto 1883)
       │
┌──────┴──────┐
│  Backend    │ ← Django REST + Simuladores
│  Django     │
└─────────────┘
```

**Importante**: El frontend NO se conecta al backend Django para MQTT. Se conecta directamente a EMQX.

## 🔧 Configuración del Frontend

### 1. Instalar Dependencias

```bash
npm install mqtt
```

### 2. Variables de Entorno

Crea un archivo `.env.local` con:

```env
# Backend API URL (para HTTP REST)
NEXT_PUBLIC_API_URL=http://localhost:8000

# MQTT Broker EMQX (WebSocket MQTT)
NEXT_PUBLIC_MQTT_BROKER_WS=ws://158.247.123.43:8083/mqtt
NEXT_PUBLIC_MQTT_USERNAME=frontend_dashboard
NEXT_PUBLIC_MQTT_PASSWORD=frontend_secure_pass
```

### 3. Hook `useMqttSubscription`

El hook se conecta directamente a EMQX usando `mqtt.js`:

```typescript
const { 
    sensorData,        // Datos actuales de sensores
    connectionStatus,  // Estado: 'connecting' | 'connected' | 'disconnected' | 'error'
    Conexión directa a EMQX vía WebSocket MQTT
- ✅ Usa librería mqtt.js
- ✅ Reconexión automática
- ✅ Suscripción a tópicos `iot/devices/{device_id}/sensors`
- ✅ Parsing automático de mensajes JSON
- ✅ Manejo de errores robusto
- ✅ Cleanup automático al desmontar componente
- ✅ Modo mock para desarrollo sin broker

### 4Características:

- ✅ Reconexión automática con backoff exponencial
- ✅ Máximo 5 intentos de reconexión
- ✅ Parsing automático de mensajes JSON
- ✅ Manejo de errores robusto
- ✅ Cleanup automático al desmontar componente

### 3. Uso en Componentes

```tsx
import { useMqttSubscription } from '@/app/hooks/useMqttSubscription'

function SimulatorComponent() {
    const { sensorData, isConnected } = useMqttSubscription('test001')

    return (
        <div>
            {isConnected && (
                <div>
                    <p>Temperatura: {sensorData?.temperature}°C</p>
                    <p>Humedad: {sensorData?.humidity}%</p>
                    <p>Presión: {sensorData?.pressure} hPa</p>
                    <p>Luz: {sensorData?.light} lux</p>
                </div>
            )}
        </div>
    )
}roker EMQX

### 1. WebSocket MQTT Habilitado

Verificar que EMQX tenga el listener WebSocket activo en puerto 8083:

```bash
curl http://158.247.123.43:8083
# Debe responder con algo (página HTML o error 400)
```

### 2. Usuario MQTT para el Frontend

Crear usuario `frontend_dashboard` en EMQX con permisos de lectura:

**Opción A: Vía Dashboard EMQX**
1. Ir a `Authentication` → `Password-Based`
2. Agregar usuario:
   - Username: `frontend_dashboard`
   - Password: `frontend_secure_pass`

**Opción B: Vía API**

```bash
# Script para crear usuario MQTT (ejecutar en servidor EMQX)
curl -X POST 'http://158.247.123.43:18083/api/v5/authentication/password_based:built_in_database/users' \
  -u admin:public \
  -H 'Content-Type: application/json' \
  -d '{
    "user_id": "frontend_dashboard",
    "password": "frontend_secure_pass",
    "is_superuser": false
  }'
```

### 3. ACL (Permisos)

El frontend debe poder:
- ✅ **Suscribirse** a `iot/devices/+/sensors`
- ❌ **NO publicar** (solo lectura)

**Configurar ACL en EMQX**:

```bash
# Regla para frontend_dashboard
{
  "username": "frontend_dashboard",
  "rules": [
    {
      "permission": "allow",
      "action": "subscribe",
      "topic": "iot/devices/+/sensors"
    },
    {
      "permission": "deny",
      "action": "publish",
      "topic": "#"
    }
  ]
}n_message
mqtt_client.connect("158.247.123.43", 1883, 60)
mqtt_client.subscribe("iot/devices/+/sensors")
mqtt_client.loop_forever()
```

## 🚀 Flujo de Datos Completo

1. **Usuario hace click en "Leer Sensores"**
   - Frontend envía comando HTTP al backend Django
   - Backend publica comando al broker EMQX (puerto 1883)
   - Tópico: `iot/devices/{device_id}/commands`

2. **Dispositivo/Simulador recibe comando**
   - Está suscrito a `iot/devices/{device_id}/commands`
   - Lee sensores (temperatura, humedad, presión, luz)
   - Publica datos a EMQX
   - Tópico: `iot/devices/{device_id}/sensors`

3. **Frontend recibe datos vía MQTT**
   - Frontend está suscrito a `iot/devices/{device_id}/sensors` (WebSocket MQTT)
   - Recibe mensaje JSON directamente de EMQX
   - Hook `useMqttSubscription` parsea los datos

4. **UI se actualiza automáticamente**
   - Componente re-renderiza con nuevos valores
   - Tarjetas de sensores muestran datos en tiempo real

## 📊 Interfaz de Usuario

La pantalla de simuladores muestra:

### Tarjetas de Sensores en Tiempo Real

```
┌─────────────────────────────────────────────────────────┐
│  🌡️ Lecturas de Sensores en Tiempo Real    ●Conectado │
├─────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  │
│  │ 🌡️      │  │ 💧      │  │ 📊      │  │ ☀️      │  │
│  │TEMP     │  │HUMEDAD  │  │PRESIÓN  │  │LUZ      │  │
│  │28.99 °C │  │31.96 %  │  │1003.76  │  │91 lux   │  │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘  │
│                                                         │
│  Última actualización: 17/01/2026 10:30:45            │
└─────────────────────────────────────────────────────────┘
```

### Estados de Conexión

- **🟢 Conectado**: WebSocket activo, recibiendo datos
- **🟡 Conectando**: Estableciendo conexión
- **🔴 Desconectado**: Sin conexión (botón de reconexión disponible)
- **⚠️ Error**: Error en la conexión

## 🔍 Debugging

### Frontend

Logs en consola del navegador:

```
🔌 Conectando a EMQX: ws://158.247.123.43:8083/mqtt
✅ Conectado a EMQX
📡 Suscrito a: iot/devices/test001/sensors
📨 Datos recibidos de iot/devices/test001/sensors: {temperature: 28.99, ...}
```

### Verificar Conexión EMQX

```bash
# Verificar que el puerto WebSocket esté abierto
curl http://158.247.123.43:8083
# Debe responder (aunque sea con error 400 o página HTML)

# Verificar que EMQX esté corriendo
curl http://158.247.123.43:18083
# Dashboard de EMQX
```

### Probar Conexión con mqtt.js

```javascript
// En consola del navegador (F12)
const mqtt = await import('mqtt')
const client = mqtt.connect('ws://158.247.123.43:8083/mqtt', {
  username: 'frontend_dashboard',
  password: 'frontend_secure_pass'
})

client.on('connect', () => console.log('✅ Conectado'))
client.on('error', (err) => console.error('❌ Error:', err))
```

## 🐛 Troubleshooting

### Error: No conecta a EMQX (Error de conexión)

**Síntoma**: `❌ Error en conexión MQTT: Connection refused`

**Causas posibles**:

1. **Puerto 8083 cerrado o bloqueado**
   ```bash
   # Verificar puerto
   telnet 158.247.123.43 8083
   # o
   nc -zv 158.247.123.43 8083
   ```

2. **Firewall bloqueando WebSocket**
   - Verificar reglas de firewall en el servidor EMQX
   - Asegurarse de que el puerto 8083 esté abierto

3. **EMQX no tiene WebSocket habilitado**
   - Revisar configuración en EMQX Dashboard
   - Ir a `Management` → `Listeners`
   - Verificar que `ws:default` en puerto 8083 esté activo

**Solución temporal**: Habilitar `enableMockData: true` para desarrollo.

### Error: Autenticación fallida

**Síntoma**: `❌ Error: Connection refused: Not authorized`

**Causa**: Usuario `frontend_dashboard` no existe o contraseña incorrecta.

**Solución**:

1. Crear usuario en EMQX Dashboard:
   - `Authentication` → `Password-Based` → `Users`
   - Agregar: `frontend_dashboard` / `frontend_secure_pass`

2. O usar API:
   ```bash
   curl -X POST 'http://158.247.123.43:18083/api/v5/authentication/password_based:built_in_database/users' \
     -u admin:public \
     -H 'Content-Type: application/json' \
     -d '{
       "user_id": "frontend_dashboard",
       "password": "frontend_secure_pass"
     }'
   MQTT.js Documentation](https://github.com/mqttjs/MQTT.js)
- [EMQX WebSocket](https://www.emqx.io/docs/en/v5.0/messaging/mqtt-over-websocket.html)
- [React Hooks](https://react.dev/reference/react)

## 🎯 Checklist de Configuración

Antes de usar en producción, verificar:

- [ ] mqtt.js instalado: `npm install mqtt`
- [ ] Variables de entorno configuradas (`.env.local`)
- [ ] EMQX puerto 8083 abierto y accesible
- [ ] Usuario `frontend_dashboard` creado en EMQX
- [ ] ACL configurado para permitir suscripción
- [ ] Dispositivo/Simulador publicando a tópico correcto
- [ ] `enableMockData: false` en producción
- [ ] Badge "MODO DEMO" oculto en producción

## ⚠️ Notas Importantes

1. **NO se usa Django Channels** - El frontend se conecta directo a EMQX
2. **Puerto 8083** - WebSocket MQTT, NO puerto 8000 de Django
3. **Solo lectura** - El frontend solo se suscribe, no publica
4. **Seguridad** - Usar credenciales diferentes en producción
5. **SSL/TLS** - En producción usar `wss://` (puerto 8084) en lugar de `ws://`
   - Revisar permisos del usuario en EMQX
   - Permitir `subscribe` en `iot/devices/+/sensors`

3. **Dispositivo no está publicando**
   - Verificar que el simulador esté corriendo
   - Verificar logs del backend al enviar comando "Leer Sensores"

## 📚 Referencias

- [Django Channels Documentation](https://channels.readthedocs.io/)
- [WebSocket API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Paho MQTT Python](https://www.eclipse.org/paho/index.php?page=clients/python/index.php)
- [React Hooks](https://react.dev/reference/react)

## 🎯 Próximos Pasos

1. ✅ Implementar WebSocket consumer en Django
2. ✅ Configurar listener MQTT
3. ✅ Probar conexión y flujo de datos
4. ⚠️ Agregar autenticación al WebSocket
5. ⚠️ Implementar historial de lecturas
6. ⚠️ Agregar gráficas en tiempo real
