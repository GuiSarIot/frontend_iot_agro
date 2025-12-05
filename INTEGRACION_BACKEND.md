# Integración Backend - Frontend

## 📋 Resumen de Cambios

Se ha integrado el sistema de autenticación del frontend con el backend Django, incluyendo:

- ✅ Actualización de tipos TypeScript para la respuesta del login
- ✅ Configuración de la URL del API endpoint
- ✅ Almacenamiento seguro de tokens JWT (access y refresh)
- ✅ Sistema de renovación automática de tokens
- ✅ Interceptor HTTP para peticiones autenticadas
- ✅ Limpieza de tokens en logout

## 🔧 Configuración

### 1. Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
cp .env.local.example .env.local
```

Edita `.env.local` y configura la URL de tu backend:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 2. Estructura de la Respuesta de Login

El backend responde con:

```json
{
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@iotsensor.com",
    "full_name": "Super Admin",
    "rol_detail": {
      "nombre_display": "Superusuario",
      "permisos": [...]
    }
  },
  "access": "eyJhbGci...",
  "refresh": "eyJhbGci...",
  "message": "Login exitoso"
}
```

## 📁 Archivos Modificados y Creados

### Modificados

1. **`app/login/services/auth.types.ts`**
   - Actualizados los tipos para reflejar la estructura del backend
   - Añadidos tipos para User, RolDetail, Permission

2. **`app/login/services/auth.api.ts`**
   - Actualizado el endpoint de login a `/api/auth/login/`
   - Cambio de campo `userName` a `username`

3. **`app/login/hooks/useLogin.ts`**
   - Adaptado para manejar la nueva estructura de respuesta
   - Extracción de permisos desde `rol_detail.permisos`
   - Almacenamiento de tokens JWT

4. **`components/protectedRoute/logout.tsx`**
   - Añadida limpieza de tokens JWT en logout

### Creados

1. **`app/login/services/token.service.ts`**
   - Gestión de tokens JWT en localStorage
   - Funciones para guardar/recuperar/eliminar tokens
   - Decodificación y validación de expiración de tokens

2. **`app/login/services/refresh-token.service.ts`**
   - Renovación automática del access token
   - Función `ensureValidToken()` para garantizar tokens válidos

3. **`app/login/services/authenticated-fetch.service.ts`**
   - Interceptor HTTP para peticiones autenticadas
   - Añade automáticamente el header `Authorization: Bearer <token>`
   - Refresca tokens expirados automáticamente
   - Maneja errores 401 y redirección al login

4. **`.env.local.example`**
   - Plantilla de variables de entorno

## 🚀 Uso

### Login

El login ya está integrado. Solo necesitas:

```typescript
// En tu componente de login
const { usernameRef, passwordRef, handleSubmit } = useLogin()

// El formulario automáticamente:
// 1. Envía credenciales al backend
// 2. Almacena los tokens JWT
// 3. Guarda la información del usuario
// 4. Redirige al dashboard
```

### Hacer Peticiones Autenticadas

Para hacer peticiones a endpoints protegidos, usa los helpers:

```typescript
import {
  authenticatedGet,
  authenticatedPost,
  authenticatedPut,
  authenticatedDelete
} from '@/app/login/services/authenticated-fetch.service'

// Ejemplo: Obtener lista de usuarios
const usuarios = await authenticatedGet<Usuario[]>(
  `${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/`
)

// Ejemplo: Crear un dispositivo
const dispositivo = await authenticatedPost(
  `${process.env.NEXT_PUBLIC_API_URL}/api/dispositivos/`,
  {
    nombre: 'Sensor 1',
    tipo: 'temperatura'
  }
)

// Ejemplo: Actualizar un sensor
await authenticatedPut(
  `${process.env.NEXT_PUBLIC_API_URL}/api/sensores/1/`,
  { estado: 'activo' }
)

// Ejemplo: Eliminar un operador
await authenticatedDelete(
  `${process.env.NEXT_PUBLIC_API_URL}/api/operadores/5/`
)
```

### Renovación Automática de Tokens

El sistema automáticamente:
- ✅ Verifica si el token está expirado antes de cada petición
- ✅ Renueva el token usando el refresh token
- ✅ Reintenta la petición con el nuevo token
- ✅ Redirige al login si el refresh token también expiró

### Permisos

Los permisos están disponibles en el contexto del usuario:

```typescript
const { appState } = useAppContext()

// Array de códigos de permisos
const permisos = appState.userInfo.roles

// Verificar si tiene un permiso específico
const puedeGestionarUsuarios = permisos?.includes('gestionar_usuarios')
const puedeVerDispositivos = permisos?.includes('ver_dispositivos')
```

## 🔐 Seguridad

### Tokens JWT

- **Access Token**: Se almacena en localStorage y expira en ~1 hora
- **Refresh Token**: Se almacena en localStorage y expira en ~30 días
- Los tokens se eliminan automáticamente en logout
- Los tokens se limpian si hay un error 401

### CORS

Asegúrate de que tu backend Django tenga configurado CORS correctamente:

```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://tu-dominio.com",
]

CORS_ALLOW_CREDENTIALS = True
```

## ⚠️ Notas Importantes

### Rutas Ajustables

En `useLogin.ts`, ajusta las siguientes rutas según tu aplicación:

```typescript
module: '/dashboard', // Cambiar a tu ruta principal
router.push('/dashboard') // Cambiar a tu ruta de inicio
```

### Cifrado de ID

El sistema usa `encryptUserId()` para cifrar el ID del usuario antes de guardarlo. Asegúrate de que este endpoint esté disponible en tu backend o adapta esta funcionalidad.

## 🧪 Testing

Para probar la integración:

1. **Iniciar el backend Django**:
   ```bash
   python manage.py runserver
   ```

2. **Iniciar el frontend Next.js**:
   ```bash
   npm run dev
   ```

3. **Probar login**:
   - Usuario: `admin`
   - Contraseña: `admin123`

4. **Verificar en DevTools**:
   - Pestaña Application → Local Storage
   - Deberías ver `access_token` y `refresh_token`

## 📚 Próximos Pasos

1. Implementar peticiones a otros endpoints del backend
2. Crear componentes para gestión de dispositivos, sensores, etc.
3. Implementar guards de rutas basados en permisos
4. Añadir manejo de errores más robusto
5. Implementar notificaciones en tiempo real con WebSockets/MQTT

## 🐛 Troubleshooting

### Error: "No hay token de autenticación válido"

- Verifica que el login haya sido exitoso
- Revisa localStorage en DevTools
- Asegúrate de que `NEXT_PUBLIC_API_URL` esté configurado

### Error 401 en peticiones

- El token puede haber expirado y el refresh token también
- Intenta hacer logout y login nuevamente
- Verifica que el backend esté enviando tokens válidos

### CORS errors

- Configura CORS en el backend Django
- Añade tu dominio a `CORS_ALLOWED_ORIGINS`

---

**Última actualización**: 4 de diciembre de 2025
