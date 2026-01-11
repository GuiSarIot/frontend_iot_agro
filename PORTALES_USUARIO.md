# Portales de Usuario - Documentación

## 📋 Descripción General

Se han implementado dos vistas diferenciadas para los usuarios del sistema IoT:

1. **Portal de Usuario Externo** (`/portal_usuario`) - Para usuarios finales que gestionan sus propios dispositivos
2. **Portal de Administrador** (`/portal_admin`) - Para administradores que supervisan todos los usuarios y dispositivos del sistema

### 🚀 Redirección Automática

**El sistema ahora redirige automáticamente al usuario a su portal correspondiente:**

- **Usuarios Externos**: Al iniciar sesión → `/portal_usuario`
- **Administradores** (`is_staff` o `is_superuser`): Al iniciar sesión → `/portal_admin`

Esto significa que cada tipo de usuario verá **su vista principal como primera página** al acceder al sistema.

---

## 👤 Portal de Usuario Externo

### Descripción
Vista simplificada diseñada para que los usuarios externos puedan:
- Ver todos sus dispositivos registrados
- Monitorear las lecturas de sus equipos
- Consultar el historial de mediciones

### Características

#### Vista Principal (`/portal_usuario`)
- **Tarjetas de Resumen**:
  - Total de dispositivos del usuario
  - Dispositivos activos
  - Total de lecturas registradas

- **Tabla de Dispositivos**:
  - Nombre y tipo de dispositivo
  - Ubicación
  - Estado (activo/inactivo)
  - Última lectura registrada con valor y timestamp
  - Total de lecturas por dispositivo
  - Botón de acceso rápido para ver detalle

#### Vista de Detalle (`/portal_usuario/dispositivo/[id]`)
- **Información del Dispositivo**:
  - Datos completos del dispositivo
  - Estado actual
  - Ubicación y descripción

- **Estadísticas**:
  - Lecturas mostradas
  - Última lectura registrada

- **Filtros de Búsqueda**:
  - Filtro por rango de fechas
  - Búsqueda de lecturas específicas

- **Historial Completo**:
  - Tabla paginada con todas las lecturas
  - Fecha y hora de cada medición
  - Sensor que generó la lectura
  - Valor y unidad de medida
  - Observaciones adicionales

### Seguridad
- ✅ Los usuarios solo pueden ver SUS propios dispositivos
- ✅ Validación de propiedad en cada consulta
- ✅ Redirección automática si intenta acceder a dispositivos de otros usuarios

### Acceso
- **Ruta**: `/portal_usuario`
- **Permisos**: Disponible para todos los usuarios autenticados
- **Icono en menú**: 👤 Mi Portal

---

## 🔧 Portal de Administrador

### Descripción
Vista completa diseñada para administradores del sistema que necesitan:
- Gestionar todos los usuarios de la plataforma
- Supervisar todos los dispositivos del sistema
- Acceder a información detallada de cualquier usuario

### Características

#### Vista Principal (`/portal_admin`)
- **Tarjetas de Resumen Global**:
  - Total de usuarios registrados
  - Usuarios activos
  - Total de dispositivos en el sistema
  - Dispositivos activos

- **Dos Pestañas Principales**:

  **1. Pestaña Usuarios**
  - Listado completo de usuarios
  - Información de contacto (nombre, email)
  - Estado de cada usuario
  - Contador de dispositivos por usuario
  - Botón para ver detalle de cada usuario

  **2. Pestaña Dispositivos**
  - Listado de todos los dispositivos del sistema
  - Información del propietario de cada dispositivo
  - Ubicación y estado
  - Acceso directo a gestión de dispositivos

#### Vista de Detalle de Usuario (`/portal_admin/usuario/[id]`)
- **Información Completa del Usuario**:
  - Datos personales
  - Estado de la cuenta
  - Información de contacto

- **Estadísticas del Usuario**:
  - Total de dispositivos
  - Dispositivos activos
  - Total de lecturas generadas

- **Tabla de Dispositivos del Usuario**:
  - Todos los dispositivos del usuario seleccionado
  - Última lectura de cada dispositivo
  - Total de lecturas por dispositivo
  - Acceso rápido a gestión

### Seguridad
- ✅ Solo accesible para usuarios con rol de administrador (`hasRolSistema: true`)
- ✅ Validación de permisos en cada carga
- ✅ Redirección automática al dashboard si no tiene permisos

### Acceso
- **Ruta**: `/portal_admin`
- **Permisos**: `is_superuser` o `is_staff`
- **Icono en menú**: 👨‍💼 Portal Admin

---

## 🎨 Características Comunes

### Diseño Responsivo
- ✅ Adaptación automática a móviles, tablets y desktop
- ✅ Optimización de tablas para pantallas pequeñas
- ✅ Reorganización de layouts en diferentes resoluciones

### Interactividad
- 🔄 Botón de actualización en tiempo real
- 📊 Tablas con paginación automática
- 🔍 Ordenamiento de columnas
- 📅 Filtros por fecha (en vista de detalle de usuario)

### Experiencia de Usuario
- ⚡ Carga rápida de datos
- 🎯 Navegación intuitiva
- 📱 Interfaz moderna y limpia
- ⚠️ Mensajes de error informativos
- ✨ Transiciones suaves
- 🎨 Iconografía consistente

---

## 🔌 Integración con el Sistema

### APIs Utilizadas

#### Portal de Usuario
```typescript
// Obtener dispositivos del usuario actual
dispositivosService.getAll({ propietario: userInfo.id })

// Obtener lecturas de un dispositivo
lecturasService.getAll({ 
    dispositivo: dispositivoId,
    ordering: '-fecha_lectura'
})
```

#### Portal de Admin
```typescript
// Obtener todos los usuarios
ConsumerAPI({ url: '/api/usuarios/' })

// Obtener todos los dispositivos
dispositivosService.getAll({ page_size: 100 })

// Obtener dispositivos de un usuario específico
dispositivosService.getAll({ propietario: usuarioId })
```

### Menú de Navegación

Los portales se han integrado en el menú principal mediante `modulesConfig.tsx`:

```typescript
portalUsuario: {
    permissions: [], // Todos los usuarios autenticados
    icon: <PersonIcon />,
    label: 'Mi Portal',
    href: '/portal_usuario',
    priority: 2
},
portalAdmin: {
    permissions: ['is_superuser', 'is_staff'],
    icon: <SupervisorAccountIcon />,
    label: 'Portal Admin',
    href: '/portal_admin',
    priority: 3
}
```

---

## 📁 Estructura de Archivos

```
app/
├── portal_usuario/
│   ├── page.tsx                           # Vista principal de usuario
│   ├── portalUsuario.module.css           # Estilos
│   └── dispositivo/
│       └── [dispositivoId]/
│           ├── page.tsx                   # Detalle de dispositivo
│           └── detalleDispositivo.module.css
│
├── portal_admin/
│   ├── page.tsx                           # Vista principal de admin
│   ├── portalAdmin.module.css             # Estilos
│   └── usuario/
│       └── [usuarioId]/
│           ├── page.tsx                   # Detalle de usuario
│           └── detalleUsuario.module.css
```

---

## 🚀 Uso Recomendado

### Comportamiento de Inicio de Sesión

**Redirección Automática:**
- Al iniciar sesión, el sistema detecta automáticamente el tipo de usuario
- **Usuarios externos** → redirigidos a `/portal_usuario`
- **Administradores** → redirigidos a `/portal_admin`
- La última ruta visitada se guarda para la próxima sesión

### Para Usuarios Externos
1. Iniciar sesión en el sistema
2. **Automáticamente** accede a "Mi Portal" como página principal
3. Ver el resumen de sus dispositivos
4. Click en "Ver Lecturas" para ver el historial de un dispositivo
5. Usar filtros de fecha para análisis específicos

### Para Administradores
1. Iniciar sesión con cuenta de administrador
2. **Automáticamente** accede a "Portal Admin" como página principal
3. **Pestaña Usuarios**: Ver listado de usuarios y sus estadísticas
4. Click en "Ver Detalle" para ver dispositivos de un usuario específico
5. **Pestaña Dispositivos**: Supervisar todos los dispositivos del sistema
6. Click en "Gestionar" para acceder a la gestión completa del dispositivo

---

## 🔒 Control de Acceso

### Niveles de Acceso

| Funcionalidad | Usuario Externo | Administrador |
|--------------|----------------|---------------|
| Ver mis dispositivos | ✅ | ✅ |
| Ver dispositivos de otros | ❌ | ✅ |
| Ver mis lecturas | ✅ | ✅ |
| Ver todas las lecturas | ❌ | ✅ |
| Listar usuarios | ❌ | ✅ |
| Gestionar dispositivos | ❌ | ✅ |

### Validaciones Implementadas
- Verificación de propiedad de dispositivos
- Validación de rol de administrador
- Redirecciones automáticas por falta de permisos
- Mensajes de error informativos

---

## 🎯 Próximas Mejoras Sugeridas

### Portal de Usuario
- [ ] Gráficos de tendencia de lecturas
- [ ] Alertas personalizadas por dispositivo
- [ ] Exportación de datos a Excel/CSV
- [ ] Comparativas entre dispositivos
- [ ] Notificaciones de anomalías

### Portal de Admin
- [ ] Dashboard con métricas avanzadas
- [ ] Reportes personalizados
- [ ] Gestión masiva de dispositivos
- [ ] Asignación rápida de dispositivos
- [ ] Logs de actividad de usuarios

---

## 📞 Soporte

Para preguntas o reportar problemas:
- Revisar la documentación técnica del sistema
- Contactar al equipo de desarrollo
- Verificar los logs del sistema

---

- **Redirección Inteligente**: 
  - `useLogin.ts` detecta el tipo de usuario y redirige al portal correspondiente
  - `protectedRoute.tsx` valida permisos y mantiene la sesión activa
  - `/dashboard` redirige automáticamente al portal según el rol del usuario

### Archivos Modificados para Redirección Automática

```typescript
// app/login/hooks/useLogin.ts
const isAdmin = data.user.is_superuser || data.user.is_staff
const redirectRoute = isAdmin ? '/portal_admin' : '/portal_usuario'
router.push(redirectRoute)

// components/protectedRoute/protectedRoute.tsx
const isAdmin = data.is_superuser || data.is_staff
const defaultRoute = isAdmin ? '/portal_admin' : '/portal_usuario'
router.push(defaultRoute)

// app/dashboard/page.tsx
if (userInfo.hasRolSistema) {
    router.push('/portal_admin')
} else if (userInfo.id) {
    router.push('/portal_usuario')
}
```
## 📝 Notas Técnicas

- **Framework**: Next.js 14 con App Router
- **Estilos**: CSS Modules con variables CSS personalizadas
- **UI Components**: PrimeReact para tablas y componentes
- **Icons**: Material-UI Icons
- **Autenticación**: Sistema de tokens JWT
- **API**: RESTful con paginación integrada

---

*Última actualización: Enero 2026*
