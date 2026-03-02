# 🌾 AgroIoT Frontend

Sistema de gestión para monitoreo y control de dispositivos IoT en agricultura. Frontend construido con Next.js 14, TypeScript y React.

## 📋 Descripción

Aplicación web moderna para la gestión de:
- 👥 Usuarios y roles con permisos granulares
- 📡 Dispositivos IoT y sensores
- 📊 Lecturas y monitoreo en tiempo real
- 🔐 Autenticación JWT con refresh tokens
- 🛡️ Sistema de permisos basado en roles

## 🚀 Tecnologías

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: CSS Modules
- **Estado**: Context API
- **Autenticación**: JWT (Access + Refresh Tokens)
- **HTTP Client**: Fetch API con interceptores personalizados
- **Notificaciones**: SweetAlert2
- **Validación**: DOMPurify

## 📦 Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/GuiSarIot/agro_iot_frontend.git
cd agro_iot_frontend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.local.example .env.local
```

Edita `.env.local` y configura:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Para producción (Netlify), define también en **Site settings → Environment variables**:
```env
NEXT_PUBLIC_API_URL=https://backendiot-production-9651.up.railway.app
```

Importante: usa la URL base **sin** `/api` al final.

4. **Ejecutar en desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 🔧 Configuración del Backend

Asegúrate de que tu backend Django esté configurado con CORS:

```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CORS_ALLOW_CREDENTIALS = True
```

## 🔐 Autenticación

El sistema utiliza JWT para autenticación:

- **Access Token**: Expira en ~1 hora, se usa en todas las peticiones
- **Refresh Token**: Expira en ~30 días, permite renovar el access token
- Los tokens se almacenan en localStorage
- Renovación automática cuando el access token expira

### Ejemplo de Login

```typescript
import { useLogin } from '@/app/login/hooks/useLogin'

const { usernameRef, passwordRef, handleSubmit } = useLogin()

// Credenciales por defecto
// username: admin
// password: admin123
```

## 🛠️ Estructura del Proyecto

```
app/
├── login/                    # Sistema de autenticación
│   ├── services/
│   │   ├── auth.api.ts      # Llamadas API
│   │   ├── auth.types.ts    # Tipos TypeScript
│   │   ├── token.service.ts # Gestión de tokens
│   │   ├── refresh-token.service.ts
│   │   └── authenticated-fetch.service.ts
│   └── hooks/
│       └── useLogin.ts      # Lógica de login
├── services/
│   └── api.service.ts       # Servicios API (dispositivos, sensores, etc.)
├── hooks/
│   └── useDispositivos.ts   # Hook ejemplo de gestión
└── gestor_usuarios/         # Módulo de usuarios

components/
├── protectedRoute/          # Rutas protegidas
├── shared/
│   ├── consumerAPI/         # Cliente HTTP
│   ├── inputForm/           # Componentes de formulario
│   └── loader/              # Cargadores

context/
├── appContext.tsx           # Estado global
├── appReducer.ts            # Reducer de estado
└── types/                   # Tipos del contexto
```

## 🔌 Uso de la API

### Peticiones Autenticadas

```typescript
import {
  authenticatedGet,
  authenticatedPost,
  authenticatedPut,
  authenticatedDelete
} from '@/app/login/services/authenticated-fetch.service'

// GET
const usuarios = await authenticatedGet('/api/usuarios/')

// POST
const dispositivo = await authenticatedPost('/api/dispositivos/', {
  nombre: 'Sensor 1',
  tipo: 'temperatura'
})

// PUT
await authenticatedPut('/api/sensores/1/', { estado: 'activo' })

// DELETE
await authenticatedDelete('/api/operadores/5/')
```

### Servicios Disponibles

```typescript
import {
  dispositivosService,
  sensoresService,
  usuariosService,
  lecturasService
} from '@/app/services/api.service'

// Ejemplo: Obtener todos los dispositivos
const dispositivos = await dispositivosService.getAll()
```

## 👥 Sistema de Permisos

Los permisos están basados en códigos:

- `gestionar_usuarios` - Crear, editar y eliminar usuarios
- `ver_usuarios` - Ver lista de usuarios
- `gestionar_dispositivos` - CRUD de dispositivos
- `ver_dispositivos` - Ver dispositivos
- `gestionar_sensores` - CRUD de sensores
- `ver_sensores` - Ver sensores
- `crear_lecturas` - Crear lecturas
- `ver_lecturas` - Ver lecturas
- `ver_dashboard` - Acceso al dashboard
- `gestionar_mqtt` - Gestionar configuración MQTT
- `ver_credenciales_mqtt` - Ver credenciales MQTT

### Verificar Permisos

```typescript
const { appState } = useAppContext()
const permisos = appState.userInfo.roles

const puedeGestionarUsuarios = permisos?.includes('gestionar_usuarios')
```

## 📱 Módulos Principales

### Gestor de Usuarios
- Listado con búsqueda y filtros
- Creación y edición de usuarios
- Asignación de roles
- Gestión de permisos

### Gestión de Dispositivos
- Registro de dispositivos IoT
- Asignación de sensores
- Monitoreo de estado
- Credenciales MQTT

### Lecturas de Sensores
- Visualización de datos históricos
- Filtros por fecha y sensor
- Exportación de datos

## 🧪 Comandos Disponibles

```bash
# Desarrollo
npm run dev

# Construcción para producción
npm run build

# Iniciar en producción
npm start

# Linting
npm run lint
```

## 📚 Documentación Adicional

- [Integración Backend](./INTEGRACION_BACKEND.md) - Guía detallada de integración
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript](https://www.typescriptlang.org/docs/)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es parte del programa de Maestría en IoT.

## 👨‍💻 Autor

**GuiSarIot**
- GitHub: [@GuiSarIot](https://github.com/GuiSarIot)

## 🐛 Reportar Issues

Si encuentras algún bug o tienes sugerencias, por favor abre un issue en:
[https://github.com/GuiSarIot/agro_iot_frontend/issues](https://github.com/GuiSarIot/agro_iot_frontend/issues)

---

**Última actualización**: Diciembre 2025
