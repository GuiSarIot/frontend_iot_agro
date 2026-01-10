# 🔍 Diagnóstico Paso a Paso - Logs de Acceso

## Estado Actual

✅ **Hook creado:** `app/hooks/useAccessLogger.ts`  
✅ **Servicio configurado:** `app/services/api.service.ts`  
✅ **Módulos implementados:** Dashboard, Dispositivos, Sensores, Usuarios, Logs  
✅ **Página de prueba:** `/test-access-logger`  

## 🚀 Pasos para Diagnosticar

### PASO 1: Acceder a la Página de Prueba

1. Asegúrate de estar **logueado** en la aplicación
2. Navega a: **http://localhost:3000/test-access-logger**
3. Verás una interfaz con tres botones

### PASO 2: Verificar el Token

1. Click en el botón **"🔑 Verificar Token"**
2. Debe aparecer un alert con el token
   - ✅ Si ves el token → Token OK
   - ❌ Si dice "No hay token" → Hacer login nuevamente

### PASO 3: Probar Creación de Log

1. **Abre la consola del navegador** (F12)
2. Click en el botón **"✅ Crear Log de Prueba"**
3. Observa la consola y la interfaz

**Resultados esperados:**

#### ✅ ÉXITO (Status 201)
```
[TEST] Enviando datos: {module: "other", endpoint: "/test-access-logger", ...}
[TEST] Respuesta recibida: {id: 123, user: 1, username: "admin", ...}
```

La interfaz mostrará un cuadro verde con los datos del log creado.

#### ❌ ERROR 404 (Endpoint no encontrado)
```
[TEST] Error capturado: Error HTTP: 404
```

**Solución:** El endpoint `/api/access_logs/create_log/` no existe.

Probar endpoints alternativos en `app/services/api.service.ts`:

```typescript
// Opción A: Con guiones
`${API_BASE_URL}/api/access-logs/create-log/`

// Opción B: Sin create_log
`${API_BASE_URL}/api/access_logs/`

// Opción C: Sin guion bajo
`${API_BASE_URL}/api/accesslogs/`
```

#### ❌ ERROR 401 (No autorizado)
```
[TEST] Error capturado: Sesión expirada
```

**Solución:** 
1. Hacer logout
2. Hacer login nuevamente
3. Volver a probar

#### ❌ ERROR 400 (Datos incorrectos)
```
[TEST] Error capturado: {campo: ["Mensaje de error"]}
```

**Solución:** Verificar el formato de los datos. El backend espera:
- `module`: String
- `endpoint`: String  
- `method`: String (GET, POST, PUT, DELETE)
- `status_code`: Number (entero)
- `response_time_ms`: Number (entero, no float)

### PASO 4: Verificar Endpoint del Backend

Abre una terminal y ejecuta:

```bash
# Opción 1: Con guion bajo (actual)
curl -X POST http://localhost:8000/api/access_logs/create_log/ \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "module": "other",
    "endpoint": "/test",
    "method": "GET",
    "status_code": 200,
    "response_time_ms": 100
  }'

# Opción 2: Con guiones
curl -X POST http://localhost:8000/api/access-logs/create-log/ \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "module": "other",
    "endpoint": "/test",
    "method": "GET",
    "status_code": 200,
    "response_time_ms": 100
  }'
```

Reemplaza `TU_TOKEN_AQUI` con el token que obtuviste en el Paso 2.

**Respuestas esperadas:**

✅ **201 Created** → Endpoint correcto  
❌ **404 Not Found** → Endpoint incorrecto  
❌ **401 Unauthorized** → Token inválido  

### PASO 5: Consultar Logs Existentes

1. En la página de prueba, click en **"📋 Obtener Logs"**
2. Debe mostrar los logs existentes

Si esto funciona pero crear no, entonces el problema está en el endpoint POST.

### PASO 6: Verificar Network Tab

1. Abre DevTools (F12)
2. Ve a la pestaña **Network**
3. Click en **"✅ Crear Log de Prueba"**
4. Busca la petición en la lista (puede aparecer como `create_log` o similar)
5. Haz click en la petición y revisa:

**Request:**
- URL: http://localhost:8000/api/access_logs/create_log/
- Method: POST
- Headers: Authorization: Bearer ...
- Payload: JSON con los datos

**Response:**
- Status: 201 (éxito) o error
- Body: Datos del log creado o mensaje de error

### PASO 7: Verificar Módulos Reales

Si la página de prueba funciona, verifica los módulos reales:

1. Navega a **Dashboard** (/dashboard)
2. Abre la consola
3. Busca:
   ```
   [AccessLogger] Registrando acceso: {module: "other", endpoint: "/dashboard", ...}
   [AccessLogger] Acceso registrado exitosamente: {...}
   ```

Si no ves estos mensajes:
- El hook no se está ejecutando
- Verifica que `useAccessLogger()` esté llamado en el componente

### PASO 8: Verificar en el Backend

Si todo funciona en el frontend pero no ves logs en el backend:

1. **Via API:**
   ```bash
   curl http://localhost:8000/api/access_logs/ \
     -H "Authorization: Bearer TU_TOKEN"
   ```

2. **Via Admin de Django:**
   - http://localhost:8000/admin/
   - Buscar modelo de AccessLog
   - Verificar que existan registros

3. **Via shell de Django:**
   ```python
   python manage.py shell
   
   from tu_app.models import AccessLog
   print(AccessLog.objects.all().count())
   print(AccessLog.objects.all().values())
   ```

## 📋 Checklist Final

Marca lo que funciona:

- [ ] Token existe en localStorage
- [ ] Página de prueba carga correctamente
- [ ] Botón "Verificar Token" muestra el token
- [ ] Botón "Crear Log" muestra éxito (cuadro verde)
- [ ] Botón "Obtener Logs" muestra logs existentes
- [ ] Network tab muestra status 201
- [ ] Consola muestra logs `[AccessLogger]` en módulos
- [ ] Backend muestra los logs creados

## 🔧 Soluciones Comunes

### Problema: Error 404

**Causa:** Endpoint incorrecto

**Solución:** Modificar en `app/services/api.service.ts` línea ~340:

```typescript
// Probar cada una hasta que funcione:

// Opción 1 (actual)
return authenticatedPost<AccessLog>(`${API_BASE_URL}/api/access_logs/create_log/`, data)

// Opción 2
return authenticatedPost<AccessLog>(`${API_BASE_URL}/api/access-logs/create-log/`, data)

// Opción 3
return authenticatedPost<AccessLog>(`${API_BASE_URL}/api/access_logs/`, data)
```

### Problema: Error 401

**Causa:** Token expirado

**Solución:**
1. Logout
2. Login
3. Volver a probar

### Problema: Error 400

**Causa:** Formato de datos incorrecto

**Solución:** Verificar que `response_time_ms` sea entero:

```typescript
response_time_ms: Math.round(Date.now() - startTimeRef.current)
// NO: response_time_ms: Date.now() - startTimeRef.current
```

### Problema: No se ven logs en consola

**Causa:** Hook no se ejecuta

**Solución:** Verificar que el hook esté importado y llamado:

```typescript
import useAccessLogger from '@/app/hooks/useAccessLogger'

export default function MiPagina() {
    useAccessLogger({ customModule: 'devices', action: 'list' })
    // ...
}
```

## 📞 Próximo Paso

**Ejecuta los pasos 1-3 y comparte:**

1. Screenshot del resultado (cuadro verde de éxito o rojo de error)
2. Logs de la consola del navegador
3. Screenshot de Network tab mostrando la petición

Esto permitirá identificar exactamente dónde está el problema.
