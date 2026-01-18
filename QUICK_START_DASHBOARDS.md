# Guía Rápida - Dashboards Gerenciales con Mapas

## 🚀 Inicio Rápido

### Instalación Completada ✅

Ya se han instalado todas las dependencias necesarias:
- ✅ leaflet
- ✅ react-leaflet
- ✅ @types/leaflet

### Ejecutar el Proyecto

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📊 Acceso a los Dashboards

### Dashboard Administrador (Rol Interno)
**URL:** `/dashboard/portal_admin`

**Características:**
- 🎨 Diseño ejecutivo con paleta azul
- 👥 Vista de todos los usuarios
- 📡 Vista de todos los dispositivos
- 🗺️ Mapa global de dispositivos
- 📈 Estadísticas completas del sistema

### Dashboard Usuario (Rol Externo)
**URL:** `/dashboard/portal_usuario`

**Características:**
- 🎨 Diseño profesional con paleta cyan
- 📱 Solo dispositivos asignados
- 🗺️ Mapa personal de dispositivos
- 📊 Estadísticas personales
- 🔍 Filtros avanzados

## 🗺️ Funcionalidades del Mapa

### Interacciones

1. **Zoom:** Rueda del ratón o botones +/-
2. **Pan:** Arrastrar el mapa
3. **Click en marcador:** Ver información del dispositivo
4. **Botón "Ver Detalles":** Ir a la página de detalle

### Marcadores

- 🟢 **Verde + 📡:** Dispositivo activo
- 🔴 **Rojo + 📡:** Dispositivo inactivo

### Información en Popup

- Nombre del dispositivo
- Estado (activo/inactivo)
- Tipo de dispositivo
- Ubicación
- Última lectura (valor + unidad)
- Fecha de última lectura
- Propietario (solo en admin)

## 🎛️ Cambiar entre Vistas

Ambos dashboards tienen dos vistas:

1. **Vista Mapa:** Click en botón "Vista Mapa" 🗺️
2. **Vista Tabla:** Click en botón "Vista Tabla" 📊

## 🎨 Personalización Rápida

### Cambiar Color del Tema

Edita `styles/dashboard-executive.css`:

```css
:root {
    /* Administrador */
    --exec-primary: #1e40af;  /* Tu color */
    
    /* Usuario */
    --prof-primary: #0891b2;  /* Tu color */
}
```

### Cambiar Ubicación Predeterminada del Mapa

Edita `app/services/dispositivos-map.types.ts`:

```typescript
export const DEFAULT_CENTER = {
    lat: TU_LATITUD,
    lng: TU_LONGITUD
}
```

## 🔧 Integrar Coordenadas Reales

### Paso 1: Backend (Django)

Agrega campos al modelo `Dispositivo`:

```python
class Dispositivo(models.Model):
    # ... campos existentes ...
    latitud = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitud = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
```

Ejecuta migraciones:
```bash
python manage.py makemigrations
python manage.py migrate
```

### Paso 2: Frontend

Las coordenadas ya están preparadas para recibirse del backend. Solo asegúrate de que el API retorne `latitud` y `longitud` en el objeto dispositivo.

## 📱 Responsive

Los dashboards están optimizados para:
- 💻 Desktop (> 1280px)
- 📱 Tablet (768px - 1280px)
- 📱 Mobile (< 768px)

## 🌙 Dark Mode

El tema oscuro se activa automáticamente según las preferencias del sistema del usuario.

Para forzar dark mode:
```javascript
// En el navegador
localStorage.setItem('theme', 'dark')
```

## 🎯 Estadísticas Disponibles

### Admin
- Total Usuarios
- Total Dispositivos
- Dispositivos Activos (%)
- Total Lecturas

### Usuario
- Mis Dispositivos
- Dispositivos Activos (%)
- Total Lecturas
- Promedio Lecturas/Dispositivo

## 🐛 Solución de Problemas

### El mapa no se muestra

1. Verifica que los iconos de Leaflet estén en `public/images/`
2. Revisa la consola del navegador para errores
3. Asegúrate de que el componente se carga solo en el cliente (ya configurado con `dynamic`)

### Marcadores no aparecen

1. Verifica que los dispositivos tengan coordenadas (`latitud` y `longitud`)
2. Revisa la consola para ver si hay errores en la conversión
3. Comprueba que `dispositivoToMapMarker` no retorne `null`

### Errores de compilación

```bash
# Limpiar cache y reinstalar
rm -rf node_modules package-lock.json
npm install
```

## 📚 Documentación Completa

Para más detalles, consulta:
- [DASHBOARD_GERENCIAL_MAPAS.md](./DASHBOARD_GERENCIAL_MAPAS.md)
- [Leaflet Documentation](https://leafletjs.com/)
- [React Leaflet](https://react-leaflet.js.org/)

## 🎉 Características Futuras

Ideas para expandir:

- [ ] Clustering de marcadores para muchos dispositivos
- [ ] Heat maps de densidad de lecturas
- [ ] Rutas entre dispositivos
- [ ] Filtros en tiempo real en el mapa
- [ ] Exportar datos a PDF/Excel
- [ ] Notificaciones push
- [ ] Gráficos de tendencias
- [ ] Panel de control en tiempo real con WebSockets

## 💡 Tips

1. **Rendimiento:** El mapa usa lazy loading para mejor rendimiento
2. **Memoización:** Los cálculos pesados están memoizados con `useMemo`
3. **Filtros:** Los filtros se aplican automáticamente al cambiar
4. **Actualización:** Usa el botón "Actualizar" para refrescar datos

---

¿Necesitas ayuda? Revisa la documentación completa o contacta al equipo de desarrollo.
