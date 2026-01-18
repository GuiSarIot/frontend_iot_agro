# 🛠️ Utilidades MQTT - Documentación

## 📋 Descripción General

La pantalla de **Utilidades MQTT** proporciona herramientas para probar conexiones a brokers MQTT y monitorear el estado de los dispositivos IoT conectados al sistema.

## 🎯 Funcionalidades

### 1. Estado de Dispositivos MQTT

Muestra un panel de estadísticas en tiempo real con la siguiente información:

- **Total de Dispositivos**: Cantidad total de dispositivos MQTT registrados
- **En Línea**: Dispositivos actualmente conectados
- **Fuera de Línea**: Dispositivos desconectados
- **Con Error**: Dispositivos con problemas de conexión
- **Disponibilidad**: Porcentaje de dispositivos en línea con barra de progreso visual

#### Endpoint Utilizado
```
GET /api/mqtt/device-status/
```

**Response:**
```json
{
  "total_mqtt_devices": 8,
  "online": 6,
  "offline": 1,
  "error": 1,
  "percentage_online": 75.0
}
```

### 2. Probar Conexión MQTT

Herramienta interactiva para probar la conectividad con brokers MQTT configurados:

- **Selección de Broker**: Desplegable con todos los brokers activos
- **Timeout Configurable**: Entre 1 y 60 segundos
- **Resultado Detallado**: Muestra información del broker y estado de la conexión

#### Endpoint Utilizado
```
POST /api/mqtt/test-connection/
```

**Request:**
```json
{
  "broker_id": 1,
  "timeout": 10
}
```

**Response Exitosa:**
```json
{
  "success": true,
  "message": "Conexión al broker EMQX Principal exitosa",
  "broker": {
    "nombre": "EMQX Principal",
    "host": "localhost",
    "port": 1883,
    "protocol": "mqtt"
  }
}
```

**Response con Error:**
```json
{
  "success": false,
  "message": "No se pudo conectar al broker",
  "broker": {
    "nombre": "EMQX Principal",
    "host": "localhost",
    "port": 1883,
    "protocol": "mqtt"
  }
}
```

## 🗂️ Estructura de Archivos

```
app/gestor_mqtt/utilities/
├── page.tsx              # Componente principal
├── layout.tsx            # Layout de la página
└── utilities.module.css  # Estilos CSS Module
```

## 🔐 Permisos Requeridos

Para acceder a esta pantalla, el usuario debe tener uno de los siguientes permisos:

- `gestionar_mqtt`: Permiso completo de gestión MQTT
- `ver_mqtt`: Permiso de solo lectura

## 🎨 Características Visuales

### Diseño Responsivo
- **Desktop**: Grid de 2 columnas para estadísticas
- **Tablet**: Grid adaptable según el espacio
- **Mobile**: Vista de una columna

### Estados Visuales
- **Online**: Verde (#4caf50) con ícono CheckCircle
- **Offline**: Naranja (#ff9800) con ícono OfflineBolt  
- **Error**: Rojo (#f44336) con ícono Error

### Animaciones
- Fade in al cargar la página
- Slide in para resultados de conexión
- Hover effects en las tarjetas de estadísticas
- Loading spinners durante peticiones

## 📱 Uso de la Pantalla

### 1. Acceder a Utilidades

1. Navegar a **Gestión de MQTT** desde el menú principal
2. Seleccionar **Utilidades** en el menú lateral o en las tarjetas

### 2. Ver Estado de Dispositivos

1. Las estadísticas se cargan automáticamente al entrar
2. Usar el botón **Actualizar** para recargar los datos
3. Revisar el porcentaje de disponibilidad y barra de progreso

### 3. Probar Conexión

1. Seleccionar un broker del desplegable
2. Ajustar el timeout si es necesario (por defecto: 10 segundos)
3. Hacer clic en **Probar Conexión**
4. Revisar el resultado con los detalles del broker

## 🔄 Actualización de Datos

- **Estado de Dispositivos**: Manual mediante botón Actualizar
- **Lista de Brokers**: Se carga automáticamente al entrar (solo brokers activos)

## ⚠️ Manejo de Errores

La pantalla maneja varios escenarios de error:

1. **Sin brokers activos**: Muestra mensaje informativo en el selector
2. **Error al cargar brokers**: Alerta SweetAlert2
3. **Error al cargar estado**: Muestra mensaje en el panel de estadísticas
4. **Error en prueba de conexión**: Muestra resultado con detalles del error
5. **Timeout inválido**: Validación antes de enviar la petición

## 🛠️ Componentes Utilizados

### Material-UI
- `Button`: Acciones principales
- `Card` / `CardContent`: Contenedores de información
- `Select` / `MenuItem`: Selector de brokers
- `TextField`: Input de timeout
- `CircularProgress`: Indicadores de carga
- `FormControl` / `InputLabel`: Formularios

### Iconos Material-UI
- `NetworkCheckIcon`: Ícono principal de utilidades
- `DevicesIcon`: Dispositivos
- `RouterIcon`: Brokers
- `CheckCircleIcon`: Estado online/éxito
- `ErrorIcon`: Errores
- `OfflineBoltIcon`: Estado offline
- `RefreshIcon`: Actualizar

### Servicios
- `mqttBrokersService`: Gestión de brokers
- `mqttUtilitiesService`: Utilidades MQTT
- `useAccessLogger`: Registro de accesos
- `useAppContext`: Contexto global

## 📊 Logging

La página registra automáticamente el acceso con:
- **Módulo**: `mqtt`
- **Acción**: `utilities`

## 🔗 Navegación

### Menú Lateral
La página está integrada en el menú de **Gestión de MQTT** con el ícono NetworkCheck.

### Breadcrumbs
- Inicio → Gestión de MQTT → Utilidades

## 🎯 Próximas Mejoras

- [ ] Auto-refresh de estadísticas cada X segundos
- [ ] Historial de pruebas de conexión
- [ ] Exportar resultados de pruebas
- [ ] Gráficos de tendencia de disponibilidad
- [ ] Notificaciones push cuando cambia el estado
- [ ] Prueba de conexión masiva a todos los brokers
- [ ] Logs de conexión en tiempo real

## 🐛 Debugging

### Variables de Entorno
Asegúrate de que `NEXT_PUBLIC_API_URL` esté configurado correctamente en `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Console Logs
La aplicación registra errores en la consola del navegador con el prefijo correspondiente.

### Network Tab
Revisar las peticiones en DevTools:
- `GET /api/mqtt/device-status/`
- `POST /api/mqtt/test-connection/`
- `GET /api/mqtt/brokers/?active_only=true`

## 📝 Notas Técnicas

### TypeScript
Todas las interfaces están tipadas:
- `DeviceStatus`
- `ConnectionTestResult`
- `MqttBroker`

### CSS Modules
Los estilos están aislados usando CSS Modules para evitar conflictos.

### Optimización
- Carga de brokers solo al montar el componente
- Deshabilita botones durante peticiones para evitar duplicados
- Validaciones del lado del cliente antes de enviar datos

---

**Autor**: Sistema de Gestión IoT  
**Versión**: 1.0.0  
**Última Actualización**: Enero 2026
