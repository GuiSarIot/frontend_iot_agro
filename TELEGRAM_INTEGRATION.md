# Integración de Telegram - Frontend

## 📁 Archivos Creados

### 1. **Servicio de Telegram**
📄 `app/services/telegram.service.ts`

Servicio principal que consume la API de Telegram del backend. Incluye métodos para:
- Obtener estado de vinculación
- Generar código de verificación
- Verificar código
- Vincular/desvincular cuenta
- Activar/desactivar notificaciones
- Enviar notificaciones (solo superusuarios)

### 2. **Hook Personalizado**
📄 `app/hooks/useTelegram.ts`

Hook React que facilita el uso del servicio de Telegram con gestión de estado incluida.

### 3. **Componente de Configuración**
📄 `app/update_personal_info/components/TelegramSettings.tsx`

Componente para que los usuarios configuren sus notificaciones de Telegram desde su perfil personal.

### 4. **Página de Notificaciones (Superusuarios)**
📄 `app/gestor_usuarios/telegram/page.tsx`
📄 `app/gestor_usuarios/telegram/layout.tsx`

Página para que los administradores envíen notificaciones a usuarios específicos o a todos.

---

## 🚀 Uso

### Para Usuarios Normales (Configuración Personal)

Agrega el componente `TelegramSettings` en la página de información personal:

```tsx
import TelegramSettings from './components/TelegramSettings'

export default function UpdatePersonalInfoPage() {
    return (
        <div>
            {/* Otros componentes */}
            <TelegramSettings />
        </div>
    )
}
```

### Para Administradores (Enviar Notificaciones)

La página ya está creada en `/gestor_usuarios/telegram` y se accede desde el menú lateral.

---

## 🎯 Funcionalidades Implementadas

### 1. **Vinculación de Cuenta**
- Generar código de verificación
- Copiar código al portapapeles
- Instrucciones claras para el usuario
- Verificación automática del estado

### 2. **Gestión de Notificaciones**
- Toggle para activar/desactivar notificaciones
- Validación de cuenta vinculada
- Mensajes de error y éxito
- Estado visual con chips (vinculado, verificado)

### 3. **Desvincular Cuenta**
- Confirmación antes de desvincular
- Actualización automática del estado

### 4. **Enviar Notificaciones (Admin)**
- Enviar a usuarios específicos o a todos
- Tipos de notificación (info, warning, error, success)
- Validación de formulario

---

## 📋 Flujo de Vinculación

1. Usuario hace clic en "Vincular cuenta de Telegram"
2. Se genera un código de 8 caracteres
3. Usuario copia el código
4. Usuario abre Telegram y busca `@iot_sensor_platform_bot`
5. Usuario envía el código al bot
6. Bot llama al endpoint `/api/telegram/link-account/` (automático)
7. Cuenta queda vinculada y verificada

---

## 🔧 Configuración Requerida

### Variables de Entorno

En el archivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend

El backend debe tener configurado:
- `TELEGRAM_BOT_TOKEN` en el `.env` del backend
- Bot de Telegram creado y configurado

---

## 🎨 Componentes Utilizados

- **Material-UI**: Componentes de interfaz
- **Iconos**: `TelegramIcon`, `VerifiedIcon`, `LinkOffIcon`, `ContentCopyIcon`
- **Alerts**: Para mensajes de error y éxito
- **Dialog**: Para mostrar el código de verificación
- **Switch**: Para toggle de notificaciones
- **Chips**: Para mostrar estados visuales

---

## 📡 Endpoints Utilizados

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/telegram/status/` | GET | Obtener estado de Telegram |
| `/api/telegram/generate-verification/` | POST | Generar código de verificación |
| `/api/telegram/verify-code/` | POST | Verificar código (opcional) |
| `/api/telegram/unlink-account/` | POST | Desvincular cuenta |
| `/api/telegram/enable-notifications/` | POST | Activar notificaciones (con validaciones) |
| `/api/telegram/disable-notifications/` | POST | Desactivar notificaciones |
| `/api/telegram/send-notification/` | POST | Enviar notificación (superusuarios) |

---

## 🐛 Manejo de Errores

Todos los métodos manejan errores y muestran mensajes apropiados:

- **Error de red**: "Error al cargar el estado de Telegram"
- **Código inválido**: "Código de verificación inválido o expirado"
- **No vinculado**: "Primero debes vincular tu cuenta de Telegram"
- **No verificado**: "Tu cuenta de Telegram no está verificada"

---

## 🔒 Seguridad

- Todos los endpoints requieren autenticación (excepto `/link-account/` que usa token del bot)
- Códigos de verificación expiran en 15 minutos
- Validaciones en frontend y backend
- Solo superusuarios pueden enviar notificaciones masivas

---

## 📱 Responsive

Todos los componentes están diseñados para funcionar en:
- Desktop
- Tablet
- Mobile

---

## 🎯 Próximos Pasos

1. **Integrar en el perfil de usuario**:
   ```tsx
   // app/update_personal_info/page.tsx
   import TelegramSettings from './components/TelegramSettings'
   ```

2. **Verificar permisos de superusuario** para la página de envío de notificaciones

3. **Personalizar mensajes** según tus necesidades

4. **Agregar más tipos de notificaciones** si es necesario

---

## 🆘 Soporte

Si tienes problemas:
1. Verifica que el backend esté corriendo
2. Verifica las variables de entorno
3. Revisa la consola del navegador
4. Verifica que el bot de Telegram esté configurado correctamente
