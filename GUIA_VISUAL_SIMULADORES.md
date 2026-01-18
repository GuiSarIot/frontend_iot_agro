# 📱 Pantalla de Simuladores MQTT - Guía Visual

Guía visual de la nueva pantalla de pruebas MQTT integrada en el módulo.

---

## 🗺️ Navegación

```
Inicio
  └── Gestión de MQTT (/gestor_mqtt)
      ├── Brokers MQTT
      ├── Credenciales
      ├── Topics
      ├── Config. Dispositivos
      ├── Usuarios EMQX
      ├── ACL EMQX
      ├── Utilidades
      └── 🆕 Simuladores ← NUEVA PANTALLA
```

---

## 🏗️ Estructura de la Pantalla

```
┌───────────────────────────────────────────────────────────┐
│ 🧪 Simuladores MQTT                          🔄  📱       │
│ Prueba de comandos en tiempo real para dispositivos IoT   │
├───────────────────────────────────────────────────────────┤
│                                                            │
│ ✓ Comando enviado exitosamente                         × │
│                                                            │
├───────────────────────────────────────────────────────────┤
│ Dispositivo: [Sensor Temp - Greenhouse A ▼]               │
│                                                            │
│ [LED ON] [LED OFF] [Toggle] [📊 Leer]                     │
├───────────────────────────────────────────────────────────┤
│                                                            │
│ ┌─────────────────────┐  ┌──────────────────────────────┐│
│ │ 📱 Info Dispositivo │  │ 🎮 Control MQTT              ││
│ ├─────────────────────┤  ├──────────────────────────────┤│
│ │ ID: device-001      │  │ 💡 Control de LED            ││
│ │ Nombre: Sensor Temp │  │ Estado: 🟢 Encendido         ││
│ │ Tipo: Sensor        │  │                              ││
│ │ Ubicación: Green A  │  │ [✓ Encender] [✗ Apagar]     ││
│ │ Estado: 🟢 Activo   │  │ [⚡ Toggle]                  ││
│ │ Descripción: ...    │  │                              ││
│ │ Fecha: 01/01/2026   │  │ 🔆 Control de Dimmer         ││
│ └─────────────────────┘  │           50%                ││
│                          │ ●────────────────────────●    ││
│                          │ [Aplicar Nivel]              ││
│                          │                              ││
│                          │ 📊 Sensores                  ││
│                          │ [📡 Leer Sensores]           ││
│                          │                              ││
│                          │ ⚙️ Sistema                   ││
│                          │ [📋 Estado] [🔄 Reiniciar]   ││
│                          └──────────────────────────────┘│
│                                                            │
├───────────────────────────────────────────────────────────┤
│ ℹ️ Información de Uso                                     │
│                                                            │
│ 🎯 Comandos Disponibles:                                  │
│ • Control de LED: Encender, apagar o alternar             │
│ • Control de Dimmer: Ajustar nivel (0-100%)               │
│ • Lectura de Sensores: Solicitar lecturas en tiempo real │
│                                                            │
│ 📊 Cómo Usar:                                             │
│ 1. Selecciona un dispositivo                              │
│ 2. Usa los controles                                      │
│ 3. Observa las notificaciones                             │
│                                                            │
│ ⚠️ Requisitos:                                            │
│ • Broker MQTT activo                                      │
│ • Dispositivo conectado                                   │
│ • Simulador en ejecución                                  │
└───────────────────────────────────────────────────────────┘
```

---

## 🎨 Componentes Visuales

### 1. Header
```
┌───────────────────────────────────────────┐
│ 🧪 Simuladores MQTT          [🔄] [📱]  │
│ Prueba de comandos en tiempo real...     │
└───────────────────────────────────────────┘
```
- Título principal
- Subtítulo descriptivo
- Botones de acción (actualizar, toggle vista)

### 2. Notificación de Éxito
```
┌───────────────────────────────────────────┐
│ ✓ Comando led_on enviado a device-001  × │
└───────────────────────────────────────────┘
```
- Fondo verde claro
- Icono de check
- Mensaje descriptivo
- Botón cerrar

### 3. Notificación de Error
```
┌───────────────────────────────────────────┐
│ ✗ Error: No se pudo conectar al broker × │
└───────────────────────────────────────────┘
```
- Fondo rojo claro
- Icono de error
- Mensaje de error
- Botón cerrar

### 4. Barra de Control
```
┌────────────────────────────────────────────────────────┐
│ Dispositivo: [Sensor Temperatura - Greenhouse A ▼]    │
│                                                        │
│ [LED ON] [LED OFF] [Toggle] [📊 Leer]                 │
└────────────────────────────────────────────────────────┘
```
- Selector de dispositivos
- Comandos rápidos en línea

### 5. Card de Información
```
┌─────────────────────────────┐
│ 📱 Información del Dispositivo │
│ Estado: 🟢 activo           │
├─────────────────────────────┤
│ ID Único:                   │
│ device-001                  │
│                             │
│ Nombre:                     │
│ Sensor Temperatura          │
│                             │
│ Tipo:                       │
│ Sensor                      │
│                             │
│ Ubicación:                  │
│ Greenhouse A                │
│                             │
│ Descripción:                │
│ Sensor de temperatura...    │
│                             │
│ Fecha Instalación:          │
│ 01/01/2026                  │
└─────────────────────────────┘
```
- Header con título y badge de estado
- Grid de información clave-valor
- Valores con estilos especiales

### 6. Panel de Control LED
```
┌─────────────────────────────┐
│ 💡 Control de LED           │
│                             │
│ Estado: 🟢 Encendido        │
│                             │
│ [✓ Encender]               │
│ [✗ Apagar]                 │
│ [⚡ Toggle]                 │
└─────────────────────────────┘
```
- Indicador de estado visual
- Tres botones de acción
- Colores semánticos

### 7. Panel de Control Dimmer
```
┌─────────────────────────────┐
│ 🔆 Control de Dimmer        │
│                             │
│         75%                 │
│                             │
│ 0  ●──────────────● 100    │
│                             │
│ [  Aplicar Nivel  ]        │
└─────────────────────────────┘
```
- Valor grande en centro
- Slider interactivo
- Botón para aplicar

### 8. Vista Compacta - Comandos
```
┌─────────────────────────────────────┐
│ ⚙️ Comandos Disponibles        7   │
├─────────────────────────────────────┤
│ led_on                              │
│ Encender LED                        │
│                                     │
│ dimmer_set                          │
│ Ajustar nivel del dimmer            │
│ Parámetros:                         │
│ {                                   │
│   "level": {                        │
│     "type": "integer",              │
│     "min": 0,                       │
│     "max": 100                      │
│   }                                 │
│ }                                   │
└─────────────────────────────────────┘
```
- Lista de comandos
- Descripción de cada comando
- Parámetros en JSON

### 9. Panel de Ayuda
```
┌────────────────────────────────────────┐
│ ℹ️ Información de Uso                 │
│ (Gradiente púrpura de fondo)          │
│                                        │
│ 🎯 Comandos Disponibles:              │
│ • Control de LED: Encender, apagar... │
│ • Control de Dimmer: Ajustar nivel... │
│ • Lectura de Sensores: Solicitar...  │
│                                        │
│ 📊 Cómo Usar:                         │
│ 1. Selecciona un dispositivo          │
│ 2. Usa los botones de comandos...    │
│ 3. Observa las notificaciones...     │
│                                        │
│ ⚠️ Requisitos:                        │
│ • El broker MQTT debe estar activo    │
│ • El dispositivo debe estar...        │
│                                        │
│ ┌────────────────────────────────────┐│
│ │ ⚡ Nota Importante:                ││
│ │ Los comandos se envían en tiempo...││
│ └────────────────────────────────────┘│
└────────────────────────────────────────┘
```
- Fondo con gradiente
- Texto blanco
- Secciones organizadas
- Warning box destacado

---

## 📐 Layout Responsive

### Desktop (> 1200px)
```
┌─────────────────────────────────────────┐
│          Header + Notificaciones        │
├─────────────────────────────────────────┤
│     Selector    +   Comandos Rápidos   │
├──────────────────┬──────────────────────┤
│                  │                      │
│   Información    │   Panel de Control   │
│   Dispositivo    │        MQTT          │
│                  │                      │
├──────────────────┴──────────────────────┤
│          Panel de Ayuda                 │
└─────────────────────────────────────────┘
```

### Tablet (768px - 1200px)
```
┌─────────────────────────────┐
│   Header + Notificaciones   │
├─────────────────────────────┤
│   Selector + Cmd Rápidos    │
├─────────────────────────────┤
│   Información Dispositivo   │
├─────────────────────────────┤
│   Panel de Control MQTT     │
├─────────────────────────────┤
│      Panel de Ayuda         │
└─────────────────────────────┘
```

### Mobile (< 768px)
```
┌───────────────┐
│    Header     │
├───────────────┤
│ Notificación  │
├───────────────┤
│   Selector    │
├───────────────┤
│   Cmd Rápido  │
│   Cmd Rápido  │
│   Cmd Rápido  │
├───────────────┤
│ Información   │
│ (vertical)    │
├───────────────┤
│ Panel Control │
│ (adaptado)    │
├───────────────┤
│  Ayuda        │
└───────────────┘
```

---

## 🎨 Paleta de Colores

### Colores Principales
```
Principal:  ██████  #667eea  (Púrpura/Azul)
Hover:      ██████  #5568d3  (Púrpura oscuro)
```

### Estados
```
Éxito:      ██████  #10b981  (Verde)
Error:      ██████  #ef4444  (Rojo)
Info:       ██████  #3b82f6  (Azul)
Warning:    ██████  #f59e0b  (Naranja)
```

### Neutrales
```
Fondo:      ██████  #f5f7fa  (Gris muy claro)
Card:       ██████  #ffffff  (Blanco)
Border:     ██████  #e5e7eb  (Gris claro)
Texto:      ██████  #1f2937  (Gris oscuro)
Secundario: ██████  #6b7280  (Gris medio)
```

### Badges de Estado
```
Activo:       ██████  Fondo: #d1fae5  Texto: #065f46
Inactivo:     ██████  Fondo: #fee2e2  Texto: #991b1b
Mantenimiento:██████  Fondo: #fef3c7  Texto: #92400e
```

---

## 🔄 Flujo de Interacción

### Flujo Normal
```
Usuario accede → Carga dispositivos → Selecciona uno
                                           ↓
      Notificación ← Envía comando ← Click en botón
           ↓
   Actualiza última respuesta
```

### Flujo con Error
```
Usuario click botón → Error de conexión
                            ↓
                  Muestra notificación roja
                            ↓
                  Mantiene estado anterior
```

---

## 📱 Interacciones

### Hover Effects
```
Botones:     lift + shadow
Cards:       subtle shadow
Icons:       color change
Slider:      thumb scale
```

### Click Effects
```
Botones:     press down
Toggle:      smooth transition
Select:      focus ring
```

### Animaciones
```
Notificaciones:  slide down (0.3s)
Spinner:         rotate (0.8s infinite)
Hover:           translateY (-2px)
```

---

## 🎯 Casos de Uso Visuales

### Caso 1: Encender LED
```
1. [Vista Inicial]
   Panel LED: Estado: ⚫ Apagado
   
2. [Click "Encender"]
   Loading: ⏳
   
3. [Comando Enviado]
   Notificación: ✓ Comando led_on enviado
   Panel LED: Estado: 🟢 Encendido
```

### Caso 2: Ajustar Dimmer
```
1. [Vista Inicial]
   Dimmer: 50%
   ●────────────────────────●
   
2. [Mover slider]
   Dimmer: 75%
   ●────────────────────────●
   
3. [Click "Aplicar Nivel"]
   Loading: ⏳
   
4. [Confirmación]
   Notificación: ✓ Dimmer ajustado a 75%
```

---

## 💡 Tips Visuales

### Para Usuarios
- 🟢 Verde = Activo/Éxito
- 🔴 Rojo = Inactivo/Error
- 🟡 Amarillo = Advertencia/Mantenimiento
- 🔵 Azul = Información

### Para Desarrolladores
- Componentes reutilizables
- CSS Modules para aislamiento
- Responsive con CSS Grid
- Transiciones CSS (no JS)

---

Esta guía visual te ayudará a entender la estructura y diseño de la pantalla de simuladores MQTT.
