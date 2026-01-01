# Ajustes de Layout - Dashboard

## 📝 Resumen de Cambios

Se ha ajustado la visualización general del dashboard para implementar un layout moderno y funcional tipo aplicación web con las siguientes características:

## 🎨 Estructura del Layout

```
┌─────────────────────────────────────────┐
│  SIDEBAR (Fixed)     │  NAVBAR (Sticky) │
│  - Logo              │  - Toggle         │
│  - Menú              │  - Búsqueda       │
│  - Navegación        │  - Tema           │
│                      │  - Usuario        │
│                      ├──────────────────┤
│                      │                   │
│                      │  CONTENIDO        │
│                      │  - Scroll         │
│                      │  - Tablas         │
│                      │  - Formularios    │
│                      │                   │
└─────────────────────────────────────────┘
```

## ✨ Características Implementadas

### 1. **Sidebar (Menú Lateral)**
- **Posición**: Fija a la izquierda con altura completa (100vh)
- **Ancho**: 280px (expandido) / 80px (colapsado)
- **Funcionalidad**:
  - Siempre visible en pantallas grandes (>1380px)
  - Ocultable con overlay en móviles/tablets
  - Efecto de colapso con animación suave
  - Scroll independiente para menús largos

### 2. **Navbar (Barra Superior)**
- **Posición**: Sticky (se fija al hacer scroll)
- **Ubicación**: Solo en el área de contenido (derecha del sidebar)
- **Elementos**:
  - Botón para colapsar/expandir sidebar
  - Barra de búsqueda
  - Toggle de tema claro/oscuro
  - Avatar de usuario con menú desplegable
- **Altura**: 70px fija

### 3. **Área de Contenido**
- **Layout**: Flexible con scroll independiente
- **Altura**: calc(100vh - 70px) para ajustarse debajo del navbar
- **Características**:
  - Scroll vertical independiente
  - Scrollbar personalizado
  - Padding interno responsivo
  - Max-width de 1400px centrado

## 📁 Archivos Modificados

### Nuevos Archivos
- `components/shared/layout/AppLayout.module.css` - Estilos del layout principal

### Archivos Actualizados

#### 1. `components/shared/layout/AppLayout.tsx`
- Importación de estilos CSS module
- Implementación de clases dinámicas según estado del sidebar
- Manejo del estado de colapso del sidebar

#### 2. `components/shared/sideBarLeft/sideBarLeft.module.css`
- Cambio de posición a `fixed`
- Altura completa (100vh)
- Mejoras en el overlay para móviles
- Animaciones de transición suaves

#### 3. `components/shared/navBarTop/navBarTop.module.css`
- Ajuste de ancho a 100%
- Sticky positioning
- Mejoras de responsividad

#### 4. `components/shared/content/content.module.css`
- Nuevo wrapper interno con max-width
- Scroll independiente
- Scrollbar personalizado
- Altura calculada (100vh - navbar height)

#### 5. `components/shared/content/content.tsx`
- Restructuración del DOM con wrapper interno
- Mejor organización del contenido

#### 6. `styles/globals.css`
- Prevención de scroll horizontal en html y body

## 🎯 Comportamiento Responsive

### Desktop (>1380px)
- Sidebar siempre visible
- Contenido desplazado 280px (o 80px si está colapsado)
- Layout de dos columnas

### Tablet/Mobile (≤1380px)
- Sidebar oculto por defecto
- Sidebar se muestra con overlay al activar
- Botón hamburguesa en navbar
- Layout de una columna

## 🚀 Ventajas del Nuevo Layout

1. **Mejor UX**: Layout moderno similar a aplicaciones profesionales
2. **Responsive**: Se adapta perfectamente a todos los tamaños de pantalla
3. **Scroll Optimizado**: Scroll independiente en sidebar y contenido
4. **Performance**: Uso de position fixed/sticky para mejor rendimiento
5. **Accesibilidad**: Navegación clara y estructura semántica
6. **Mantenibilidad**: Código modular y bien organizado

## 🎨 Personalización

### Variables CSS Disponibles
Todas las variables están definidas en `styles/globals.css`:

- `--bg-primary`, `--bg-secondary`, `--bg-tertiary` - Fondos
- `--text-primary`, `--text-secondary` - Textos
- `--border-color` - Bordes
- `--shadow-sm`, `--shadow-md` - Sombras
- `--spacing-*` - Espaciados
- `--transition-*` - Transiciones

### Ancho del Sidebar
Para cambiar el ancho del sidebar, modificar en `sideBarLeft.module.css`:
```css
.sideBarLeft {
    width: 280px; /* Cambiar aquí */
    min-width: 280px;
    max-width: 280px;
}
```

### Altura del Navbar
Para cambiar la altura del navbar, modificar en `navBarTop.module.css`:
```css
.navBarTop {
    height: 70px; /* Cambiar aquí */
}
```
Y actualizar el cálculo en `content.module.css`:
```css
.content {
    height: calc(100vh - 70px); /* Ajustar aquí */
}
```

## 📱 Pruebas Recomendadas

1. **Desktop**: Probar colapso/expansión del sidebar
2. **Tablet**: Verificar overlay y menú hamburguesa
3. **Mobile**: Confirmar navegación táctil
4. **Scroll**: Validar scroll independiente en sidebar y contenido
5. **Tema**: Probar cambio de tema claro/oscuro

## 🔧 Solución de Problemas

### El sidebar no se muestra
- Verificar que la clase `active` se aplica en móviles
- Revisar el z-index del sidebar

### El contenido se solapa
- Verificar el margin-left del container
- Confirmar que el ancho del sidebar es correcto

### Scroll no funciona
- Verificar la altura del contenedor
- Confirmar overflow-y: auto en .content

## 📚 Referencias

- [AppLayout.tsx](components/shared/layout/AppLayout.tsx)
- [AppLayout.module.css](components/shared/layout/AppLayout.module.css)
- [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)
- [THEME_SYSTEM.md](THEME_SYSTEM.md)
