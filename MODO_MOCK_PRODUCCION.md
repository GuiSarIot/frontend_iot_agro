# 🎭 Modo Mock vs Producción - Guía Rápida

## ⚠️ Arquitectura Importante

El frontend se conecta **DIRECTAMENTE a EMQX** vía WebSocket MQTT (puerto 8083).

**NO** se conecta al backend Django. **NO** necesitas Django Channels.

```
Frontend → EMQX (puerto 8083) ← Backend/Simulador
```

## Estado Actual

El frontend está configurado para **conectar a EMQX real** (`enableMockData: false`).

## ¿Cómo Cambiar de Modo?

### 📍 Archivo: `app/gestor_mqtt/simulators/page.tsx`

```typescript
// LÍNEA ~42-50

// ✅ MODO PRODUCCIÓN (Conecta a EMQX real - puerto 8083)
const { sensorData, isConnected } = useMqttSubscription(
    selectedDevice?.identificador_unico,
    true,   // autoConnect
    false   // ← enableMockData: false = CONEXIÓN A EMQX
)

// 🎭 MODO MOCK (Datos simulados - SIN conexión a EMQX)
const { sensorData, isConnected } = useMqttSubscription(
    selectedDevice?.identificador_unico,
    true,   // autoConnect
    true    // ← enableMockData: true = DATOS SIMULADOS
)
```

### 📍 Archivo: `app/gestor_mqtt/simulators/page.tsx`

```typescript
// LÍNEA ~270 (Badge "MODO DEMO")

// Mostrar badge de modo demo
{true && ( // ← Cambiar a false para ocultar el badge
    <span className={styles.mockBadge}>
        🎭 MODO DEMO
    </span>
)}

// Ocultar badge en producción
{false && ( // ← Ya no se muestra
    <span className={styles.mockBadge}>
        🎭 MODO DEMO
    </span>
)}
```

## 🔄 Flujo de Trabajo Recomendado

### 1️⃣ **Producción (ACTUAL - Recomendado)**
```
✅ enableMockData: false
❌ Badge oculto
→ Conecta a ws://158.247.123.43:8083/mqtt
→ Recibe datos reales del broker EMQX
→ Requiere usuario MQTT configurado
```

### 2️⃣ **Desarrollo Sin EMQX**
```
⚠️ enableMockData: true
✅ Badge visible
→ Datos simulados cada 3 segundos
→ No requiere EMQX ni credenciales
```

## 📋 Checklist para Usar EMQX Real

Antes de cambiar a `enableMockData: false`, verifica:

- [ ] EMQX corriendo en 158.247.123.43
- [ ] Puerto 8083 (WebSocket MQTT) abierto
- [ ] Usuario `frontend_dashboard` creado en EMQX
- [ ] Password: `frontend_secure_pass`
- [ ] ACL permite suscribirse a `iot/devices/+/sensors`
- [ ] Variables de entorno en `.env.local`
- [ ] mqtt.js instalado: `npm install mqtt`

## 🧪 Testing Rápido

1. **Verificar endpoint WebSocket**:
   ```bash
   # En consola del navegador (F12)
   const ws = new WebSocket('ws://localhost:8000/ws/mqtt/test001/')
   ws.onopen = () => console.log('✅ Conectado')
   ws.onerror = () => console.log('❌ Error')
   ```
conexión a EMQX**:
   ```bash
   # Verificar puerto WebSocket
   curl http://158.247.123.43:8083
   # Debe responder (página HTML o error 400)
   
   # Probar con telnet
   telnet 158.247.123.43 8083
   ```

2. **Probar en consola del navegador** (F12):
   ```javascript
   const mqtt = await import('mqtt')
   const client = mqtt.connect('ws://158.247.123.43:8083/mqtt', {
     username: 'frontend_dashboard',
     password: 'frontend_secure_passEMQX Real |
|----------------|-----------|----------------|
| `enableMockData` | `true` | `false` |
| Badge "MODO DEMO" | Visible | Oculto |
| Datos | Simulados | Reales de MQTT |
| Frecuencia | Cada 3s | Cuando IoT publique |
| Conexión | ❌ No conecta | ✅ ws://158.247.123.43:8083/mqtt |
| EMQX necesario | ❌ No | ✅ Sí |
| Credenciales | ❌ No | ✅ frontend_dashboard |

## ⚙️ Variables de Entorno

Crea `.env.local` con:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000

# MQTT EMQX (NO Django)
NEXT_PUBLIC_MQTT_BROKER_WS=ws://158.247.123.43:8083/mqtt
NEXT_PUBLIC_MQTT_USERNAME=frontend_dashboard
NEXT_PUBLIC_MQTT_PASSWORD=frontend_secure_pass
```

## ⚠️ Errores Comunes

### Error: "Connection refused"
- **Causa**: Puerto 8083 cerrado o EMQX no corriendo
- **Solución**: Verificar firewall y estado de EMQX

### Error: "Not authorized"
- **Causa**: Usuario `frontend_dashboard` no existe
- **Solución**: Crear usuario en EMQX Dashboard

### Error: No se reciben mensajes
- **Causa**: Tópico incorrecto o ACL bloqueando
- **Solución**: Verificar tópico `iot/devices/{id}/sensors` y permisosT_PUBLIC_ENABLE_MOCK_SENSORS=false # producción

// app/gestor_mqtt/simulators/page.tsx
const enableMock = process.env.NEXT_PUBLIC_ENABLE_MOCK_SENSORS === 'true'

const { sensorData } = useMqttSubscription(
    selectedDevice?.identificador_unico,
    true,
    enableMock // ← Automático según entorno
)
```

## 📚 Más Información

Ver documentación completa en: [WEBSOCKET_MQTT_INTEGRATION.md](WEBSOCKET_MQTT_INTEGRATION.md)
