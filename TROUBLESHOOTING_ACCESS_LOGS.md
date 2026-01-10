# 🔧 Troubleshooting - Sistema de Logs de Acceso

## ❌ Problema: No se ven actividades en los logs

### Paso 1: Verificar que el hook se está ejecutando

1. **Abrir la consola del navegador** (F12)
2. **Navegar a un módulo** (ej: Dashboard, Dispositivos, etc.)
3. **Buscar en la consola** los mensajes:
   ```
   [AccessLogger] Registrando acceso: {module: "devices", endpoint: "/gestor_dispositivos", ...}
   [AccessLogger] Acceso registrado exitosamente: {...}
   ```

### Paso 2: Verificar errores en la consola

Si ves errores como:
- ❌ `Error al registrar acceso: 404` → El endpoint no existe
- ❌ `Error al registrar acceso: 401` → Token inválido o expirado
- ❌ `Error al registrar acceso: 400` → Datos incorrectos
- ❌ `Error al registrar acceso: 500` → Error del servidor

### Paso 3: Verificar el endpoint de la API

El endpoint actual configurado es:
```
POST ${API_BASE_URL}/api/access_logs/create_log/
```

**Posibles variaciones del endpoint:**
- `/api/access_logs/create_log/` (con guion bajo)
- `/api/access-logs/create-log/` (con guiones)
- `/api/accesslogs/create_log/`
- `/api/access_logs/create/`

**Cómo verificar el endpoint correcto:**

1. **Revisar la documentación del backend**
2. **Hacer una petición manual con curl:**
   ```bash
   curl -X POST http://localhost:8000/api/access_logs/create_log/ \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "module": "devices",
       "endpoint": "/test",
       "method": "GET",
       "status_code": 200,
       "response_time_ms": 100
     }'
   ```

3. **Verificar la respuesta:**
   - ✅ `201 Created` → Endpoint correcto
   - ❌ `404 Not Found` → Endpoint incorrecto

### Paso 4: Verificar la URL base de la API

Verificar que `NEXT_PUBLIC_API_URL` esté configurado correctamente:

1. **Archivo:** `.env.local`
2. **Variable:**
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. **Reiniciar el servidor** después de cambiar el .env:
   ```bash
   npm run dev
   ```

### Paso 5: Verificar autenticación

El token debe enviarse en el header `Authorization: Bearer {token}`

**Verificar en la consola del navegador:**
```javascript
// En la consola del navegador
localStorage.getItem('access_token')
```

Si retorna `null` o `undefined`:
- ❌ No hay token guardado
- ✅ Hacer login nuevamente

### Paso 6: Verificar Network Tab

1. **Abrir DevTools** (F12)
2. **Ir a la pestaña Network**
3. **Navegar a un módulo**
4. **Buscar la petición** `create_log`
5. **Verificar:**
   - Request URL
   - Request Method: POST
   - Status Code: 201 Created
   - Request Headers: Authorization Bearer token
   - Request Payload: JSON con module, endpoint, method, etc.

### Paso 7: Verificar formato de datos

El backend espera:
```json
{
  "module": "devices",      // String: auth, users, devices, sensors, etc.
  "endpoint": "/api/...",   // String: ruta del endpoint
  "method": "GET",          // String: GET, POST, PUT, DELETE
  "status_code": 200,       // Number (int): código HTTP
  "response_time_ms": 500   // Number (int): milisegundos
}
```

**IMPORTANTE:** `response_time_ms` debe ser un **entero**, no float.

### Paso 8: Probar endpoint manualmente

Crear un componente de prueba:

```tsx
// app/test-logger/page.tsx
'use client'

import { useState } from 'react'
import { accessLogsService } from '@/app/services/api.service'

export default function TestLogger() {
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<any>(null)

  const testLog = async () => {
    try {
      const data = {
        module: 'other',
        endpoint: '/test-logger',
        method: 'GET',
        status_code: 200,
        response_time_ms: 100
      }
      
      console.log('Enviando:', data)
      const res = await accessLogsService.create(data)
      console.log('Respuesta:', res)
      setResult(res)
      setError(null)
    } catch (err: any) {
      console.error('Error:', err)
      setError(err.message || err)
      setResult(null)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Test Access Logger</h1>
      <button onClick={testLog}>Test Log</button>
      
      {result && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#d4edda' }}>
          <h3>✅ Éxito:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
      
      {error && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8d7da' }}>
          <h3>❌ Error:</h3>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
```

### Paso 9: Verificar permisos del usuario

Los logs de acceso requieren:
- Usuario autenticado ✅
- Los usuarios normales ven solo sus logs
- Los superusuarios ven todos los logs

### Paso 10: Verificar CORS

Si el frontend y backend están en diferentes puertos:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

El backend debe tener CORS configurado:
```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]
```

## 🔍 Checklist de Verificación

- [ ] Hook se ejecuta (ver consola con logs `[AccessLogger]`)
- [ ] No hay errores 401/403 (token válido)
- [ ] No hay errores 404 (endpoint correcto)
- [ ] No hay errores 400 (formato de datos correcto)
- [ ] Variable `NEXT_PUBLIC_API_URL` configurada
- [ ] Token existe en localStorage
- [ ] CORS configurado en backend
- [ ] Endpoint `/api/access_logs/create_log/` existe
- [ ] `response_time_ms` es un entero

## 📝 Variaciones de Endpoint a Probar

Si el endpoint actual no funciona, modificar en `api.service.ts`:

### Opción 1: Con guiones (según nueva documentación)
```typescript
create: async (data) => {
    return authenticatedPost<AccessLog>(
        `${API_BASE_URL}/api/access-logs/create-log/`, 
        data
    )
}
```

### Opción 2: Sin create_log (POST directo)
```typescript
create: async (data) => {
    return authenticatedPost<AccessLog>(
        `${API_BASE_URL}/api/access_logs/`, 
        data
    )
}
```

### Opción 3: Endpoint unificado
```typescript
create: async (data) => {
    return authenticatedPost<AccessLog>(
        `${API_BASE_URL}/api/accesslogs/`, 
        data
    )
}
```

## 🎯 Solución Rápida

1. **Verificar endpoint en Postman/Insomnia:**
   ```
   POST http://localhost:8000/api/access_logs/create_log/
   ```

2. **Si no funciona, probar:**
   ```
   POST http://localhost:8000/api/access-logs/create-log/
   ```

3. **Actualizar en `api.service.ts` según el que funcione**

4. **Reiniciar el servidor Next.js**

## 📞 Siguiente Paso

**Por favor ejecuta esto en la consola del navegador después de navegar a un módulo:**

```javascript
// Ver si el hook se ejecutó
console.log('Pathname:', window.location.pathname)

// Ver el token
console.log('Token:', localStorage.getItem('access_token'))

// Probar manualmente
fetch('http://localhost:8000/api/access_logs/create_log/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    module: 'other',
    endpoint: '/test',
    method: 'GET',
    status_code: 200,
    response_time_ms: 100
  })
})
.then(res => res.json())
.then(data => console.log('✅ Respuesta:', data))
.catch(err => console.error('❌ Error:', err))
```

**Comparte el resultado de la consola para diagnosticar el problema.**
