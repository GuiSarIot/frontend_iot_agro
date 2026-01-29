# 🔍 Guía de Diagnóstico - Datos MQTT de Sensores

## 📋 Cambios Realizados

### 1. **useMqttSubscription.ts** - Hook de Suscripción MQTT
- ✅ Ya soporta formato `multi_sensor` del backend
- ✅ Parsea correctamente los sensores del array
- ✅ Maneja timestamp del dispositivo (millis) y lo convierte a ISO string
- ✅ Logs mejorados para debugging

### 2. **page.tsx** - Página de Detalle del Dispositivo
- ✅ Logs agregados en el useEffect de guardado automático
- ✅ Muestra las keys del sensorData recibido

## 🧪 Cómo Diagnosticar el Problema

### Paso 1: Verificar Recepción de Mensajes MQTT

Abre las **DevTools del navegador** (F12) y busca en la consola:

```
📥 Mensaje MQTT recibido: iot/sensors/raspi001/data {...}
```

Si ves este mensaje pero NO ves los siguientes, hay un problema en el parseo.

### Paso 2: Verificar Parseo del Formato multi_sensor

Deberías ver estos logs:

```
🔍 Verificando formato: {
  hasType: true,
  typeValue: "multi_sensor",
  hasSensors: true,
  isArray: true,
  sensorsLength: 3
}
```

```
📡 Formato multi_sensor detectado, parseando sensores...
  ✓ pH: 11.89 | V: 1.639V | ADC: 2010
  ✓ TDS: 977 ppm | V: 1.428V | ADC: 1769
  ✓ Temp: 29.06celsius
```

```
✅ Datos multi-sensor actualizados (reemplazo completo): {...}
📊 Valores finales: {
  ph: 11.89,
  tds: 977,
  temperature: 29.06,
  timestamp: "2026-01-26T..."
}
```

### Paso 3: Verificar que el Estado se Actualiza

Deberías ver:

```
🔄 useEffect de guardado automático ejecutado: {
  hasSensorData: true,
  sensorDataKeys: ["ph", "tds", "temperature", "ph_voltage", "ph_adc", ...],
  isConnected: true,
  hasDispositivo: true
}
```

```
📊 Procesando lecturas MQTT para guardar: {
  ph: 11.89,
  tds: 977,
  temperature: 29.06,
  ...
}
```

### Paso 4: Verificar Guardado de Lecturas

Deberías ver:

```
💾 Sensores a guardar (3): [
  {tipo: "ph", valor: 11.89, metadata: {...}},
  {tipo: "tds", valor: 977, metadata: {...}},
  {tipo: "temperature", valor: 29.06, metadata: {...}}
]
```

```
💾 Guardando lectura de ph: 11.89
💾 Guardando lectura MQTT: {...}
✅ Lectura guardada exitosamente
```

## ❌ Problemas Comunes

### Problema 1: No se reciben mensajes MQTT

**Síntoma**: No ves `📥 Mensaje MQTT recibido`

**Soluciones**:
1. Verificar credenciales MQTT del dispositivo
2. Verificar que el broker EMQX está corriendo
3. Verificar que el topic es correcto: `iot/sensors/raspi001/data`
4. Verificar permisos ACL del usuario MQTT

### Problema 2: Se recibe el mensaje pero no se parsea

**Síntoma**: Ves `📥 Mensaje MQTT recibido` pero no ves logs de parseo

**Soluciones**:
1. Verificar que el payload tiene `type: "multi_sensor"`
2. Verificar que `sensors` es un array
3. Revisar la consola de errores

### Problema 3: Se parsea pero no se actualiza el estado

**Síntoma**: Ves logs de parseo pero no ves `🔄 useEffect de guardado automático`

**Soluciones**:
1. El estado puede no estar actualizándose
2. Verifica que `setSensorData` se está ejecutando
3. Revisa si hay errores en la consola

### Problema 4: Se actualiza el estado pero no se guarda

**Síntoma**: Ves `🔄 useEffect` pero no ves `💾 Guardando lectura`

**Soluciones**:
1. Verifica que el dispositivo está conectado a MQTT (`isConnected: true`)
2. Verifica que el dispositivo existe (`hasDispositivo: true`)
3. Revisa si los valores de los sensores son `undefined`

## 🔧 Verificación en la UI

### Lecturas en Tiempo Real

Deberían aparecer las tarjetas con valores en la sección "Lecturas en Tiempo Real":

- 🧪 **pH**: 11.89 pH
- 💎 **TDS**: 977 ppm
- 🌡️ **Temperatura**: 29.06 °C

### Historial de Lecturas

Las lecturas guardadas deberían aparecer en la tabla "Historial de Lecturas" después de unos segundos.

## 📝 Formato Esperado del Backend

```json
{
  "type": "multi_sensor",
  "sensors": [
    {
      "sensor_type": "ph",
      "model": "PH-4502C",
      "ph": 11.89,
      "voltage": 1.639,
      "adc": 2010
    },
    {
      "sensor_type": "tds",
      "model": "TDS BOARD V1.0",
      "tds_ppm": 977,
      "voltage": 1.428,
      "adc": 1769
    },
    {
      "sensor_type": "temperature",
      "model": "DS18B20",
      "temperature": 29.06,
      "unit": "celsius"
    }
  ],
  "timestamp": 820000
}
```

## 🚀 Próximos Pasos

1. **Recargar la página** del detalle del dispositivo
2. **Abrir DevTools** (F12) y ver la consola
3. **Esperar** a que llegue un mensaje MQTT del backend
4. **Revisar los logs** siguiendo la guía de diagnóstico
5. **Reportar** qué logs aparecen y cuáles NO aparecen

## 📞 Soporte

Si después de revisar los logs el problema persiste:

1. **Captura de pantalla** de la consola completa
2. **Copia** los logs que aparecen
3. **Indica** en qué paso se detiene el proceso
