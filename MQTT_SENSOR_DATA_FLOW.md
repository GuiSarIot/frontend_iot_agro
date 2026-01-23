# 🌊 Flujo de Datos MQTT - Sensores y Lecturas

## 📋 Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Formato de Mensajes MQTT](#formato-de-mensajes-mqtt)
- [Proceso Completo](#proceso-completo)
- [Configuración del Dispositivo](#configuración-del-dispositivo)
- [Código de Ejemplo](#código-de-ejemplo)
- [Verificación y Troubleshooting](#verificación-y-troubleshooting)

---

## 📖 Descripción General

Este documento describe el flujo completo de datos desde un dispositivo IoT (Raspberry Pi, ESP32, etc.) hasta la visualización en el frontend y el almacenamiento en la base de datos.

**Flujo de alto nivel:**

```
Dispositivo IoT → Broker MQTT → Backend Django → Base de Datos
                       ↓
                  Frontend (WebSocket MQTT)
```

---

## 🏗️ Arquitectura del Sistema

### 1. **Dispositivo IoT (Raspberry Pi / ESP32)**
- Lee sensores físicos (temperatura, humedad, presión, luz, pH, etc.)
- Publica datos al broker MQTT en formato JSON
- Se suscribe a comandos para control remoto

### 2. **Broker MQTT (EMQX)**
- **Host**: `158.247.123.43`
- **Puerto MQTT**: `1883` (para dispositivos)
- **Puerto WebSocket**: `8083` (para frontend)
- Gestiona la comunicación bidireccional

### 3. **Backend Django**
- Se suscribe a tópicos MQTT de sensores
- Parsea y valida datos recibidos
- Almacena lecturas en PostgreSQL
- Expone API REST para consultas

### 4. **Frontend Next.js**
- Se conecta directamente al broker MQTT vía WebSocket
- Visualiza datos en tiempo real
- Consulta históricos vía API REST

---

## 📨 Formato de Mensajes MQTT

### Tópicos MQTT

```
iot/sensors/{device_id}/data      # Datos de sensores
iot/devices/{device_id}/commands  # Comandos al dispositivo
iot/devices/{device_id}/status    # Estado del dispositivo
```

### Formato de Datos de Sensores

**Tópico**: `iot/sensors/{device_id}/data`

**Formato JSON Esperado**:

```json
{
  "readings": {
    "temperature": {
      "value": 25.5,
      "unit": "°C",
      "timestamp": "2026-01-20T20:43:23Z"
    },
    "humidity": {
      "value": 65.3,
      "unit": "%",
      "timestamp": "2026-01-20T20:43:23Z"
    },
    "pressure": {
      "value": 1013.25,
      "unit": "hPa",
      "timestamp": "2026-01-20T20:43:23Z"
    },
    "light": {
      "value": 450.0,
      "unit": "lux",
      "timestamp": "2026-01-20T20:43:23Z"
    },
    "ph": {
      "value": 6.8,
      "unit": "pH",
      "timestamp": "2026-01-20T20:43:23Z",
      "metadata": {
        "voltage": 2.552,
        "adc": 3146
      }
    }
  },
  "timestamp": "2026-01-20T20:43:23Z",
  "device_id": "raspi001"
}
```

**Campos Obligatorios**:
- `readings`: Objeto con las lecturas de sensores
- `timestamp`: Timestamp en formato ISO 8601 UTC (con 'Z' al final)
- `device_id`: Identificador único del dispositivo

**Estructura de cada Lectura**:
- `value`: Valor numérico de la lectura
- `unit`: Unidad de medida (°C, %, hPa, lux, pH, etc.)
- `timestamp`: Timestamp específico de la lectura
- `metadata` (opcional): Información adicional

---

## 🔄 Proceso Completo

### Paso 1: Configuración del Dispositivo en la Plataforma

1. **Crear el Dispositivo**:
   ```
   Ir a: Gestor de Dispositivos → Crear Dispositivo
   
   Datos:
   - Nombre: "Raspberry Pi 3 - Acuaponia"
   - Tipo: "Raspberry Pi"
   - ID Único: "raspi001"
   - Ubicación: "Sala de Acuaponia"
   - Estado: "activo"
   ```

2. **Crear Sensores**:
   ```
   Ir a: Gestor de Sensores → Crear Sensor
   
   Para cada sensor:
   - Nombre: "Temperatura BME680"
   - Tipo: "temperatura"
   - Unidad: "°C"
   - Rango: -40 a 85
   - Estado: "activo"
   ```

   Repetir para:
   - Humedad (%, 0-100)
   - Presión (hPa, 300-1100)
   - Luz (lux, 0-10000)
   - pH (pH, 0-14)

3. **Asignar Sensores al Dispositivo**:
   ```
   Ir a: Gestor de Dispositivos → Editar "raspi001"
   
   Sección "Asignar Sensor":
   - Seleccionar cada sensor
   - Configurar (opcional): intervalo, umbrales
   - Click "Asignar Sensor"
   ```

4. **Habilitar MQTT y Obtener Credenciales**:
   ```
   En la edición del dispositivo:
   - Activar MQTT
   - Copiar credenciales:
     * Username: raspi001
     * Password: [generada automáticamente]
   ```

### Paso 2: Configurar el Cliente MQTT en el Dispositivo

**Ejemplo en Python** (`raspberry_mqtt_client.py`):

```python
import json
import paho.mqtt.client as mqtt
from datetime import datetime, timezone

# Configuración
BROKER_HOST = "158.247.123.43"
BROKER_PORT = 1883
DEVICE_ID = "raspi001"
USERNAME = "raspi001"  # Del backend
PASSWORD = "tu_password_mqtt"  # Del backend

# Conectar al broker
client = mqtt.Client(client_id=f"{DEVICE_ID}_client")
client.username_pw_set(USERNAME, PASSWORD)
client.connect(BROKER_HOST, BROKER_PORT, keepalive=60)

def publish_sensor_data(temp, hum, pressure, light, ph=None):
    """Publica datos de sensores al broker MQTT"""
    
    # Timestamp en UTC
    timestamp = datetime.now(timezone.utc).isoformat()
    
    # Construir mensaje
    message = {
        "readings": {
            "temperature": {
                "value": temp,
                "unit": "°C",
                "timestamp": timestamp
            },
            "humidity": {
                "value": hum,
                "unit": "%",
                "timestamp": timestamp
            },
            "pressure": {
                "value": pressure,
                "unit": "hPa",
                "timestamp": timestamp
            },
            "light": {
                "value": light,
                "unit": "lux",
                "timestamp": timestamp
            }
        },
        "timestamp": timestamp,
        "device_id": DEVICE_ID
    }
    
    # Agregar pH si está disponible
    if ph is not None:
        message["readings"]["ph"] = {
            "value": ph,
            "unit": "pH",
            "timestamp": timestamp
        }
    
    # Publicar al tópico
    topic = f"iot/sensors/{DEVICE_ID}/data"
    payload = json.dumps(message)
    
    result = client.publish(topic, payload, qos=1)
    
    if result.rc == 0:
        print(f"✓ Datos publicados: Temp={temp}°C, Hum={hum}%")
    else:
        print(f"✗ Error publicando datos: {result.rc}")

# Bucle principal
client.loop_start()

while True:
    # Leer sensores
    temp = read_temperature()
    hum = read_humidity()
    pressure = read_pressure()
    light = read_light()
    ph = read_ph()  # Opcional
    
    # Publicar
    publish_sensor_data(temp, hum, pressure, light, ph)
    
    time.sleep(10)  # Publicar cada 10 segundos
```

### Paso 3: Backend Procesa y Almacena

El backend Django:

1. **Recibe el mensaje MQTT**
2. **Valida el formato JSON**
3. **Identifica el dispositivo** (`device_id`)
4. **Para cada lectura en `readings`**:
   - Busca el sensor asignado al dispositivo
   - Valida el rango si está configurado
   - Crea un registro en la tabla `Lectura`:
     ```python
     Lectura.objects.create(
         dispositivo=dispositivo,
         sensor=sensor,
         valor=reading["value"],
         timestamp=reading["timestamp"],
         metadata_json=reading.get("metadata", {})
     )
     ```
5. **Registra en logs** para auditoría

### Paso 4: Frontend Visualiza

El frontend tiene dos formas de acceder a los datos:

#### A. Tiempo Real (MQTT WebSocket)

```typescript
// En el componente de simuladores
import { useMqttSubscription } from '@/app/hooks/useMqttSubscription'

const { sensorData, isConnected } = useMqttSubscription(
    deviceId,
    mqttCredentials
)

// sensorData tendrá la estructura:
{
    temperature: 25.5,
    humidity: 65.3,
    pressure: 1013.25,
    light: 450.0,
    timestamp: "2026-01-20T20:43:23Z",
    device_id: "raspi001"
}
```

El hook `useMqttSubscription`:
- Se conecta al broker EMQX en `ws://158.247.123.43:8083/mqtt`
- Se suscribe a `iot/sensors/{deviceId}/#`
- Parsea los mensajes y extrae los valores
- Actualiza el estado React en tiempo real

#### B. Históricos (API REST)

```typescript
// Consultar lecturas históricas
import { lecturasService } from '@/app/services/api.service'

const lecturas = await lecturasService.getAll({
    dispositivo: deviceId,
    fecha_inicio: '2026-01-01',
    fecha_fin: '2026-01-20',
    ordering: '-timestamp'
})

// Retorna:
{
    count: 1500,
    results: [
        {
            id: 1,
            dispositivo: 5,
            dispositivo_nombre: "Raspberry Pi 3 - Acuaponia",
            sensor: 3,
            sensor_nombre: "Temperatura BME680",
            valor: 25.5,
            timestamp: "2026-01-20T20:43:23Z",
            unidad: "°C",
            metadata_json: {}
        },
        // ...
    ]
}
```

---

## ⚙️ Configuración del Dispositivo

### Mapeo Sensor → Tipo de Dato

Al asignar sensores al dispositivo, asegúrate de que los **nombres de los tipos** coincidan:

| Tipo de Sensor en BD | Campo en MQTT `readings` | Unidad |
|---------------------|-------------------------|---------|
| `temperatura` | `temperature` | °C |
| `humedad` | `humidity` | % |
| `presion` | `pressure` | hPa |
| `luz` / `luminosidad` | `light` | lux |
| `ph` | `ph` | pH |
| `co2` | `co2` | ppm |
| `oxigeno_disuelto` | `dissolved_oxygen` | mg/L |

**Importante**: El backend mapea automáticamente los nombres, pero es recomendable usar nombres consistentes.

---

## 💻 Código de Ejemplo Completo

### Python - Cliente Raspberry Pi

```python
#!/usr/bin/env python3
"""
Cliente MQTT para Raspberry Pi con sensores BME680 y pH
"""

import json
import time
import paho.mqtt.client as mqtt
from datetime import datetime, timezone
import board
import adafruit_bme680

# ========================================
# CONFIGURACIÓN
# ========================================

BROKER_HOST = "158.247.123.43"
BROKER_PORT = 1883
DEVICE_ID = "raspi001"
USERNAME = "raspi001"
PASSWORD = "your_mqtt_password_here"

PUBLISH_INTERVAL = 10  # Segundos

# ========================================
# INICIALIZACIÓN DE SENSORES
# ========================================

# BME680 (I2C)
i2c = board.I2C()
bme680 = adafruit_bme680.Adafruit_BME680_I2C(i2c)

# Configurar sobremuestreo para mayor precisión
bme680.sea_level_pressure = 1013.25

# ========================================
# FUNCIONES DE LECTURA
# ========================================

def read_bme680():
    """Lee temperatura, humedad y presión del BME680"""
    return {
        "temperature": round(bme680.temperature, 2),
        "humidity": round(bme680.humidity, 2),
        "pressure": round(bme680.pressure, 2)
    }

def read_light_sensor():
    """Lee sensor de luz (simulado o real)"""
    # Implementar lectura real según tu hardware
    import random
    return round(random.uniform(100, 1000), 0)

def read_ph_sensor():
    """Lee sensor de pH vía serial ESP32"""
    # Tu implementación existente
    pass

# ========================================
# MQTT
# ========================================

def on_connect(client, userdata, flags, rc):
    """Callback cuando se conecta al broker"""
    if rc == 0:
        print(f"✓ Conectado al broker MQTT")
        # Suscribirse a comandos
        client.subscribe(f"iot/devices/{DEVICE_ID}/commands")
    else:
        print(f"✗ Error de conexión: {rc}")

def on_message(client, userdata, msg):
    """Callback cuando se recibe un mensaje"""
    print(f"🔔 Comando recibido: {msg.payload.decode()}")
    try:
        command = json.loads(msg.payload.decode())
        process_command(command)
    except Exception as e:
        print(f"✗ Error procesando comando: {e}")

def process_command(command):
    """Procesa comandos recibidos"""
    cmd = command.get("command")
    
    if cmd == "read_sensors":
        # Forzar lectura inmediata
        publish_sensor_data()
    elif cmd == "led_on":
        # Controlar LED
        print("💡 LED encendido")
    # ... más comandos

def publish_sensor_data():
    """Publica datos de sensores"""
    try:
        # Leer sensores
        bme_data = read_bme680()
        light = read_light_sensor()
        ph = read_ph_sensor()  # Opcional
        
        # Timestamp UTC
        timestamp = datetime.now(timezone.utc).isoformat()
        
        # Construir mensaje
        message = {
            "readings": {
                "temperature": {
                    "value": bme_data["temperature"],
                    "unit": "°C",
                    "timestamp": timestamp
                },
                "humidity": {
                    "value": bme_data["humidity"],
                    "unit": "%",
                    "timestamp": timestamp
                },
                "pressure": {
                    "value": bme_data["pressure"],
                    "unit": "hPa",
                    "timestamp": timestamp
                },
                "light": {
                    "value": light,
                    "unit": "lux",
                    "timestamp": timestamp
                }
            },
            "timestamp": timestamp,
            "device_id": DEVICE_ID
        }
        
        # Agregar pH si disponible
        if ph is not None:
            message["readings"]["ph"] = {
                "value": ph,
                "unit": "pH",
                "timestamp": timestamp
            }
        
        # Publicar
        topic = f"iot/sensors/{DEVICE_ID}/data"
        payload = json.dumps(message)
        result = mqtt_client.publish(topic, payload, qos=1)
        
        if result.rc == 0:
            print(f"📤 Datos enviados: T={bme_data['temperature']}°C, "
                  f"H={bme_data['humidity']}%, P={bme_data['pressure']}hPa")
        else:
            print(f"✗ Error publicando: {result.rc}")
            
    except Exception as e:
        print(f"✗ Error leyendo sensores: {e}")

# ========================================
# MAIN
# ========================================

if __name__ == "__main__":
    print("=" * 50)
    print("  Raspberry Pi IoT Client")
    print("=" * 50)
    print(f"Device: {DEVICE_ID}")
    print(f"Broker: {BROKER_HOST}:{BROKER_PORT}")
    print("=" * 50)
    
    # Configurar cliente MQTT
    mqtt_client = mqtt.Client(client_id=f"{DEVICE_ID}_client")
    mqtt_client.username_pw_set(USERNAME, PASSWORD)
    mqtt_client.on_connect = on_connect
    mqtt_client.on_message = on_message
    
    # Conectar
    mqtt_client.connect(BROKER_HOST, BROKER_PORT, keepalive=60)
    mqtt_client.loop_start()
    
    print("✓ Cliente iniciado")
    
    try:
        while True:
            publish_sensor_data()
            time.sleep(PUBLISH_INTERVAL)
    except KeyboardInterrupt:
        print("\n⚠️  Deteniendo cliente...")
        mqtt_client.loop_stop()
        mqtt_client.disconnect()
        print("✓ Cliente detenido")
```

---

## 🔍 Verificación y Troubleshooting

### 1. Verificar Conexión MQTT

```bash
# Probar conexión con mosquitto_pub (instalar mosquitto-clients)
mosquitto_pub -h 158.247.123.43 -p 1883 \
  -u raspi001 -P "your_password" \
  -t "iot/sensors/raspi001/data" \
  -m '{"test":"connection"}'
```

### 2. Monitorear Mensajes

```bash
# Suscribirse a todos los mensajes del dispositivo
mosquitto_sub -h 158.247.123.43 -p 1883 \
  -u raspi001 -P "your_password" \
  -t "iot/sensors/raspi001/#" -v
```

### 3. Verificar en Frontend

1. **Ir a**: Gestor MQTT → Simuladores
2. **Seleccionar**: Dispositivo `raspi001`
3. **Verificar**:
   - Estado de conexión: "Conectado"
   - Lecturas en tiempo real se actualizan cada 10s
   - Valores coinciden con los del dispositivo

### 4. Verificar en Base de Datos

```typescript
// En el frontend, consultar lecturas
import { lecturasService } from '@/app/services/api.service'

const lecturas = await lecturasService.getAll({
    dispositivo: deviceId,
    page_size: 10,
    ordering: '-timestamp'
})

console.log('Últimas 10 lecturas:', lecturas.results)
```

### 5. Logs del Backend

Revisar logs de Django para ver si los mensajes MQTT se están procesando:

```bash
# En el servidor backend
tail -f /var/log/iot_backend/mqtt_consumer.log
```

---

## 🚨 Problemas Comunes

### Problema: No se reciben datos en el frontend

**Solución**:
1. Verificar que el dispositivo esté publicando (ver logs del dispositivo)
2. Verificar formato JSON del mensaje
3. Verificar credenciales MQTT
4. Verificar que el frontend esté conectado al WebSocket correcto (puerto 8083)

### Problema: Datos se ven en tiempo real pero no se guardan

**Solución**:
1. Verificar que los sensores estén asignados al dispositivo en el backend
2. Verificar que los nombres de los sensores coincidan con los tipos
3. Revisar logs del backend para ver errores de validación

### Problema: Timestamp con zona horaria incorrecta

**Solución**:
- Siempre usar UTC en el dispositivo: `datetime.now(timezone.utc)`
- El frontend convertirá automáticamente a la zona horaria local

---

## 📚 Referencias

- [MQTT Protocol](https://mqtt.org/)
- [Paho MQTT Python](https://pypi.org/project/paho-mqtt/)
- [EMQX Documentation](https://www.emqx.io/docs/)
- [Dispositivos API](./DISPOSITIVOS_API.md)
- [Lecturas API](./GESTION_LECTURAS.md)
- [Sensores API](./GESTION_SENSORES.md)

---

**Última actualización**: 20 de enero de 2026
