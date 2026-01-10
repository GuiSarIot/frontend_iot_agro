# 📱 Configuración del Bot de Telegram - Guía Completa

## 📋 Índice
1. [Crear el Bot](#1-crear-el-bot-en-telegram)
2. [Configurar Variables de Entorno](#2-configuración-de-variables-de-entorno)
3. [Ejecutar el Bot](#3-ejecutar-el-bot-de-telegram)
4. [Flujo de Vinculación](#4-flujo-de-vinculación-de-cuentas)
5. [Comandos Disponibles](#5-comandos-del-bot)
6. [Probar la Integración](#6-probar-la-integración)

---

## 1. Crear el Bot en Telegram

### Paso a Paso:

1. **Abre Telegram** y busca [@BotFather](https://t.me/BotFather)

2. **Envía el comando:** `/newbot`

3. **Elige un nombre para tu bot:**
   ```
   IoT Sensor Platform Bot
   ```

4. **Elige un username (debe terminar en 'bot'):**
   ```
   iot_sensor_platform_bot
   ```

5. **Guarda el token que recibirás:**
   ```
   123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
   ```

   ⚠️ **IMPORTANTE:** Este token es como una contraseña. Nunca lo compartas ni lo subas a Git.

---

## 2. Configuración de Variables de Entorno

### Backend (.env)

Agrega estas líneas a tu archivo `.env` del backend:

```bash
# Configuración del Bot de Telegram
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
TELEGRAM_BOT_USERNAME=iot_sensor_platform_bot
```

### Frontend (.env.local)

El frontend ya debería tener:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 3. Ejecutar el Bot de Telegram

### Instalar Dependencias

```bash
pip install python-telegram-bot==20.7
```

### Ejecutar el Bot

```bash
python telegram_bot.py
```

### Verificar que funciona

Deberías ver en la consola:

```
🤖 Iniciando Bot IoT Sensor Platform...
📡 API Base URL: http://localhost:8000/api
✅ Bot iniciado y esperando mensajes...
```

---

## 4. Flujo de Vinculación de Cuentas

### Desde la Aplicación Web (Frontend)

1. Usuario inicia sesión en la plataforma
2. Va a **Perfil → Notificaciones**
3. Click en **"Vincular cuenta de Telegram"**
4. Se genera un código de 8 caracteres (ej: `A3F9B2C1`)
5. Copia el código

### Desde Telegram (Usuario)

**Opción 1: Enviar el código directamente**
```
A3F9B2C1
```

**Opción 2: Usar el comando /link**
```
/link A3F9B2C1
```

El bot automáticamente:
- ✅ Reconoce el código
- ✅ Llama al backend para vincular la cuenta
- ✅ Confirma la vinculación

### Respuesta del Bot

```
✅ ¡Cuenta vinculada exitosamente!

Usuario: tu_usuario
Ahora recibirás notificaciones de la plataforma.
```

---

## 5. Comandos del Bot

| Comando | Descripción |
|---------|-------------|
| `/start` | Mensaje de bienvenida e información del bot |
| `/link CODIGO` | Vincular cuenta con código de verificación |
| `/status` | Ver estado de dispositivos (en desarrollo) |
| `/help` | Mostrar ayuda y comandos disponibles |

### Ejemplo de Uso

```
/start
```

Respuesta:
```
🤖 ¡Bienvenido al Bot IoT Sensor Platform!

📱 Tu Chat ID: 1393684739
👤 Usuario: @tu_username

📋 Comandos disponibles:
/start - Este mensaje
/link - Vincular tu cuenta
/status - Ver estado de dispositivos
/help - Ayuda

Para vincular tu cuenta:
1. Genera un código en la web
2. Usa /link CODIGO
```

---

## 6. Probar la Integración

### Verificar Vinculación

Una vez vinculada tu cuenta, verifica en la web:

1. Ve a **Perfil → Notificaciones**
2. Deberías ver:
   - ✅ Chip verde "Cuenta vinculada"
   - ✅ Chip azul "Verificada"
   - ✅ Tu usuario de Telegram

### Enviar Notificación de Prueba

**Desde la API (Postman o similar):**

```bash
POST http://localhost:8000/api/telegram/send-notification/
Headers:
  Authorization: Bearer {access_token}
  Content-Type: application/json

Body:
{
  "message": "🧪 Mensaje de prueba desde la plataforma IoT",
  "user_ids": [1],
  "notification_type": "info"
}
```

**Desde el Frontend (Solo Superusuarios):**

1. Ve a **Gestión de Usuarios → Notificaciones Telegram**
2. Escribe un mensaje de prueba
3. Selecciona tipo: "Info"
4. Selecciona destinatarios o envía a todos
5. Click en "Enviar notificación"

---

## 7. Tipos de Notificaciones

El sistema puede enviar diferentes tipos de notificaciones:

### 📊 Info (Azul)
```python
notification_type='info'
```
Para información general del sistema

### ✅ Success (Verde)
```python
notification_type='success'
```
Para confirmaciones y acciones exitosas

### ⚠️ Warning (Naranja)
```python
notification_type='warning'
```
Para advertencias y alertas preventivas

### 🔴 Error (Rojo)
```python
notification_type='error'
```
Para errores críticos y fallas del sistema

---

## 8. Casos de Uso Comunes

### Notificar Dispositivo Desconectado

```python
from apps.accounts.telegram_helper import telegram_notifier

device = Dispositivo.objects.get(id=1)
telegram_notifier.send_device_alert(
    device,
    alert_type='offline',
    message='El dispositivo no responde desde hace 5 minutos'
)
```

### Notificar Lectura Fuera de Rango

```python
lectura = Lectura.objects.latest('timestamp')
telegram_notifier.send_reading_alert(
    lectura,
    lectura.sensor,
    threshold_type='max'
)
```

### Notificar a Todos los Superusuarios

```python
superusers = CustomUser.objects.filter(
    is_superuser=True,
    telegram_verified=True,
    telegram_notifications_enabled=True
)
telegram_notifier.send_notification_to_users(
    superusers,
    "Sistema actualizado exitosamente a v2.0",
    notification_type='success'
)
```

---

## 9. Solución de Problemas

### El bot no responde

✅ **Verifica que el bot esté ejecutándose:**
```bash
python telegram_bot.py
```

✅ **Verifica el token en .env:**
```bash
echo $TELEGRAM_BOT_TOKEN
```

### Error al vincular cuenta

✅ **Verifica que el código no haya expirado:**
- Los códigos expiran en 15 minutos

✅ **Verifica que el backend esté corriendo:**
```bash
python manage.py runserver
```

✅ **Revisa los logs del bot:**
Busca errores en la consola donde ejecutaste `python telegram_bot.py`

### No llegan notificaciones

✅ **Verifica que las notificaciones estén activadas:**
1. Ve a Perfil → Notificaciones
2. Verifica que el toggle esté activado

✅ **Verifica el estado:**
```bash
GET /api/telegram/status/
```

Debería retornar:
```json
{
  "is_linked": true,
  "is_verified": true,
  "notifications_enabled": true,
  "can_receive_notifications": true
}
```

---

## 10. Seguridad

### ✅ Buenas Prácticas

- 🔐 **Nunca** compartas tu `TELEGRAM_BOT_TOKEN`
- 🔐 Agrega `.env` a `.gitignore`
- 🔐 Usa variables de entorno en producción
- 🔐 Los códigos expiran automáticamente en 15 minutos
- 🔐 Solo usuarios verificados reciben notificaciones

### ⚠️ Tokens Comprometidos

Si crees que tu token fue comprometido:

1. Ve a [@BotFather](https://t.me/BotFather)
2. Envía `/mybots`
3. Selecciona tu bot
4. Click en "API Token"
5. Click en "Revoke current token"
6. Actualiza el nuevo token en `.env`

---

## 11. Comandos Útiles

### Obtener tu Chat ID

1. Busca [@userinfobot](https://t.me/userinfobot) en Telegram
2. Envía `/start`
3. El bot te mostrará tu Chat ID

### Vincular cuenta manualmente (Desarrollo)

```python
# Django shell
python manage.py shell

from apps.accounts.models import CustomUser
user = CustomUser.objects.get(username='tu_usuario')
user.telegram_chat_id = '1393684739'
user.telegram_username = '@tu_username'
user.telegram_verified = True
user.telegram_notifications_enabled = True
user.save()
```

---

## 12. Configuración en Producción

### Usar Variables de Entorno del Sistema

```bash
export TELEGRAM_BOT_TOKEN="tu_token_real"
export TELEGRAM_BOT_USERNAME="iot_sensor_platform_bot"
```

### Ejecutar Bot como Servicio (systemd)

Crear archivo: `/etc/systemd/system/telegram-bot.service`

```ini
[Unit]
Description=IoT Telegram Bot
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/project
Environment="TELEGRAM_BOT_TOKEN=tu_token"
ExecStart=/path/to/venv/bin/python telegram_bot.py
Restart=always

[Install]
WantedBy=multi-user.target
```

Activar:
```bash
sudo systemctl enable telegram-bot
sudo systemctl start telegram-bot
sudo systemctl status telegram-bot
```

---

## 📚 Recursos Adicionales

- [Documentación python-telegram-bot](https://docs.python-telegram-bot.org/)
- [BotFather Commands](https://core.telegram.org/bots#6-botfather)
- [Telegram Bot API](https://core.telegram.org/bots/api)

---

## 🆘 Soporte

Si tienes problemas:

1. Revisa los logs del bot
2. Revisa los logs del backend
3. Verifica que todas las variables de entorno estén configuradas
4. Consulta la documentación del backend en `TELEGRAM_INTEGRATION.md`

---

**¡Listo!** 🎉 Ahora tu plataforma IoT puede enviar notificaciones en tiempo real a través de Telegram.
