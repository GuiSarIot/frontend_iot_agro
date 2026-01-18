# 🧪 Simuladores MQTT - Módulo de Pruebas

Panel de pruebas integrado en el módulo de gestión MQTT para probar comandos en dispositivos IoT en tiempo real.

## 📍 Ubicación

**Ruta:** `/gestor_mqtt/simulators`

**Acceso desde:**
- Menú lateral del módulo MQTT
- Página principal de MQTT (tarjeta "Simuladores MQTT")

---

## 🎯 Características

### 1. **Selector de Dispositivos**
- Lista desplegable con todos los dispositivos disponibles
- Muestra nombre, tipo y ubicación
- Selección rápida para cambiar entre dispositivos

### 2. **Comandos Rápidos**
Botones de acceso directo para comandos comunes:
- ✅ LED ON - Encender LED
- ⚫ LED OFF - Apagar LED
- ⚡ Toggle - Alternar LED
- 📊 Leer Sensores - Solicitar lecturas

### 3. **Información del Dispositivo**
Panel detallado con:
- ID único del dispositivo
- Nombre y tipo
- Ubicación
- Estado (activo/inactivo/mantenimiento)
- Descripción
- Fecha de instalación

### 4. **Panel de Control Completo**
Panel interactivo con controles para:

#### Control de LED
- Botón Encender
- Botón Apagar
- Botón Toggle
- Indicador de estado visual

#### Control de Dimmer
- Slider de 0-100%
- Valor numérico grande
- Botón para aplicar nivel

#### Sensores
- Botón para solicitar lectura
- Muestra última respuesta

#### Sistema
- Obtener estado completo
- Reiniciar dispositivo (con confirmación)

### 5. **Vista Compacta**
- Botón para alternar entre vista completa y compacta
- Vista compacta muestra lista de comandos disponibles con sus parámetros

### 6. **Notificaciones**
Sistema de notificaciones en tiempo real:
- ✓ Éxito (verde) - Comando ejecutado correctamente
- ✗ Error (rojo) - Error en la ejecución
- ℹ Info (azul) - Información general

### 7. **Información de Ayuda**
Panel informativo con:
- Lista de comandos disponibles
- Instrucciones de uso paso a paso
- Requisitos del sistema
- Nota importante sobre simuladores

---

## 🎨 Diseño

### Paleta de Colores
- **Principal:** `#667eea` (Púrpura/Azul)
- **Éxito:** `#10b981` (Verde)
- **Error:** `#ef4444` (Rojo)
- **Info:** `#3b82f6` (Azul)
- **Fondo:** `#f5f7fa` (Gris claro)

### Componentes Visuales
- **Cards:** Fondo blanco con bordes redondeados y sombras sutiles
- **Badges:** Estados con colores distintivos
- **Gradientes:** Panel de ayuda con gradiente púrpura
- **Animaciones:** Transiciones suaves en hover y notificaciones

---

## 💻 Uso

### Inicio Rápido

1. **Acceder a la Página**
   ```
   Menú MQTT > Simuladores
   ```

2. **Seleccionar Dispositivo**
   - Usar el dropdown para elegir el dispositivo
   - La información se actualiza automáticamente

3. **Enviar Comandos**
   - Usar botones de comandos rápidos, o
   - Usar el panel de control completo

4. **Ver Resultados**
   - Las notificaciones aparecen en la parte superior
   - La última respuesta se muestra en el panel de control

### Ejemplos de Uso

#### Encender LED
1. Selecciona el dispositivo
2. Click en "LED ON" (comandos rápidos) o
3. Click en "✓ Encender" (panel completo)
4. Observa la notificación de éxito

#### Ajustar Dimmer
1. Selecciona el dispositivo
2. Mueve el slider al nivel deseado
3. Click en "Aplicar Nivel"
4. Espera la confirmación

#### Leer Sensores
1. Selecciona el dispositivo
2. Click en "📡 Leer Sensores"
3. Espera unos segundos
4. Verifica las lecturas en el módulo de lecturas

---

## 🔧 Requisitos Técnicos

### Backend
- Endpoint implementado: `POST /api/devices/{device_id}/command/`
- Endpoint implementado: `GET /api/devices/available-commands/`
- Servicio MQTT configurado en el backend
- Conexión activa con broker MQTT (EMQX)

### Frontend
- Autenticación JWT activa
- Permisos: `gestionar_mqtt`, `ver_dispositivos`, o `ver_mqtt`
- Navegador con JavaScript habilitado

### Infraestructura
- Broker MQTT (EMQX) corriendo
- Al menos un dispositivo registrado
- Simulador MQTT en ejecución (opcional para pruebas)

---

## 🚨 Manejo de Errores

### Estados de Error

#### No hay dispositivos
```
📱 No hay Dispositivos Disponibles
```
**Solución:** Crear dispositivos en el módulo de dispositivos

#### Error de conexión
```
⚠️ Error al Cargar Dispositivos
```
**Solución:** Verificar conexión con el backend

#### Sin permisos
```
🔒 No tienes permiso para controlar este dispositivo
```
**Solución:** Contactar al administrador para permisos

#### Comando fallido
```
✗ Error enviando comando MQTT
```
**Solución:** 
- Verificar que el broker MQTT esté activo
- Comprobar configuración MQTT del dispositivo
- Revisar logs del backend

---

## 📱 Responsive

La interfaz es completamente responsive:

### Desktop (> 1200px)
- Grid de 2 columnas
- Panel completo visible
- Todos los controles expandidos

### Tablet (768px - 1200px)
- Grid de 1 columna
- Panel completo visible
- Controles adaptados

### Mobile (< 768px)
- Layout vertical
- Selector de dispositivo en columna
- Botones apilados
- Info items en columna

---

## 🎯 Casos de Uso

### 1. Desarrollo
- Probar nuevos comandos MQTT
- Validar respuestas del simulador
- Debug de problemas de comunicación

### 2. Testing
- Verificar funcionamiento de dispositivos
- Probar diferentes escenarios
- Validar manejo de errores

### 3. Demostración
- Mostrar capacidades del sistema
- Presentar a clientes
- Entrenar nuevos usuarios

### 4. Mantenimiento
- Diagnosticar problemas en dispositivos
- Verificar estado de sensores
- Probar conectividad MQTT

---

## 🔐 Seguridad

### Permisos Requeridos
- Usuario autenticado
- Rol con permiso `gestionar_mqtt`, `ver_dispositivos`, o `ver_mqtt`
- Para dispositivos específicos: superusuario u operador asignado

### Validaciones
- Autenticación JWT en cada request
- Validación de permisos en el backend
- Validación de parámetros (ej: dimmer 0-100)
- Confirmación para comandos críticos (reiniciar)

---

## 📊 Comandos Disponibles

| Comando | Descripción | Parámetros |
|---------|-------------|------------|
| `led_on` | Encender LED | Ninguno |
| `led_off` | Apagar LED | Ninguno |
| `led_toggle` | Alternar LED | Ninguno |
| `dimmer_set` | Ajustar dimmer | `level` (0-100) |
| `read_sensors` | Leer sensores | Ninguno |
| `get_status` | Estado completo | Ninguno |
| `restart` | Reiniciar dispositivo | Ninguno |

---

## 🐛 Troubleshooting

### Problema: Comandos no se envían
**Síntomas:** Click en botón pero sin notificación
**Solución:**
1. Verificar consola del navegador
2. Comprobar autenticación
3. Verificar permisos del usuario

### Problema: Error "Dispositivo no encontrado"
**Síntomas:** Notificación de error al seleccionar dispositivo
**Solución:**
1. Verificar que el dispositivo existe en BD
2. Refrescar la lista de dispositivos
3. Verificar ID único del dispositivo

### Problema: Panel de control no carga
**Síntomas:** Spinner infinito
**Solución:**
1. Verificar conexión con API
2. Revisar logs del navegador
3. Comprobar token de autenticación

---

## 📚 Referencias

- [MQTT_SIMULATORS_INTEGRATION.md](../../MQTT_SIMULATORS_INTEGRATION.md) - Guía completa
- [MQTT_API_REFERENCE.md](../../MQTT_API_REFERENCE.md) - Referencia API
- [MQTT_QUICK_START.md](../../MQTT_QUICK_START.md) - Inicio rápido

---

## 🔄 Actualizaciones Futuras

### Planificadas
- [ ] WebSocket para actualizaciones en tiempo real
- [ ] Historial de comandos enviados
- [ ] Gráficos de respuesta de sensores
- [ ] Múltiple selección de dispositivos
- [ ] Programación de comandos
- [ ] Exportar logs de comandos

### En Consideración
- [ ] Vista de mapa con dispositivos
- [ ] Grupos de comandos personalizados
- [ ] Macros de comandos
- [ ] Notificaciones push
- [ ] Control por voz

---

## 👥 Soporte

¿Problemas o sugerencias?
- Revisa la documentación completa
- Consulta los logs del sistema
- Contacta al equipo de desarrollo

---

**Última actualización:** 11 de enero de 2026
**Versión:** 1.0.0
