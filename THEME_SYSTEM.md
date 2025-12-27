# 🎨 Sistema de Temas - Dark/Light Mode

## 📋 Descripción

El proyecto cuenta con un sistema de temas completo que permite alternar entre modo claro y oscuro, inspirado en el diseño de [Shards Dashboard React](https://github.com/DesignRevision/shards-dashboard-react).

## ✨ Características

- ✅ Cambio instantáneo entre tema claro y oscuro
- ✅ Persistencia del tema en `localStorage`
- ✅ Detección automática de preferencia del sistema
- ✅ Transiciones suaves entre temas
- ✅ Variables CSS para fácil personalización
- ✅ Iconos animados en el botón de cambio de tema

## 🎯 Uso

### Cambiar el tema

El usuario puede cambiar el tema haciendo clic en el botón de tema en la barra de navegación superior (derecha).

- 🌞 **Modo claro**: Icono de sol (Brightness7Icon)
- 🌙 **Modo oscuro**: Icono de luna (Brightness4Icon)

### Desde el código

```typescript
import { useAppContext } from '@/context/appContext'

const MiComponente = () => {
    const { appState, toggleTheme } = useAppContext()
    
    // Obtener el tema actual
    const temaActual = appState.theme // 'light' | 'dark'
    
    // Cambiar el tema
    const handleCambiarTema = () => {
        toggleTheme()
    }
    
    return (
        <button onClick={handleCambiarTema}>
            Cambiar a {temaActual === 'light' ? 'oscuro' : 'claro'}
        </button>
    )
}
```

## 🏗️ Arquitectura

### 1. Estado Global (Context API)

**Archivo**: `context/appContext.tsx`

```typescript
interface AppState {
    theme: 'light' | 'dark'
    // ... otros estados
}
```

**Acciones disponibles**:
- `TOGGLE_THEME`: Cambia entre light y dark
- `toggleTheme()`: Función helper para cambiar el tema

### 2. Persistencia

El tema se guarda automáticamente en `localStorage` con la clave `theme`:

```typescript
localStorage.setItem('theme', 'dark')
```

### 3. Detección inicial

**Archivo**: `context/appInitialState.ts`

El sistema detecta el tema inicial en el siguiente orden:
1. Valor guardado en `localStorage`
2. Preferencia del sistema operativo (`prefers-color-scheme`)
3. Por defecto: `light`

```typescript
const getInitialTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem('theme')
        if (savedTheme === 'light' || savedTheme === 'dark') {
            return savedTheme
        }
        
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        return prefersDark ? 'dark' : 'light'
    }
    return 'light'
}
```

### 4. Aplicación del tema

**Archivo**: `app/app.tsx`

El componente `ThemeApplier` aplica el tema al DOM:

```typescript
useEffect(() => {
    document.documentElement.setAttribute('data-theme', appState.theme)
}, [appState.theme])
```

## 🎨 Variables CSS

**Archivo**: `styles/globals.css`

### Tema Claro (Default)

```css
:root {
    --bg-primary: #ffffff;
    --bg-secondary: #fafbfc;
    --bg-tertiary: #f5f7fa;
    --text-primary: #1a202c;
    --text-secondary: #4a5568;
    --border-color: #e4e8eb;
    /* ... más variables */
}
```

### Tema Oscuro

```css
[data-theme='dark'] {
    --bg-primary: #1a202c;
    --bg-secondary: #2d3748;
    --bg-tertiary: #4a5568;
    --text-primary: #f7fafc;
    --text-secondary: #e2e8f0;
    --border-color: #4a5568;
    /* ... más variables */
}
```

## 🛠️ Personalización

### Agregar nuevos colores al tema

1. **Editar `styles/globals.css`**:

```css
:root {
    --mi-color-custom: #3498db;
}

[data-theme='dark'] {
    --mi-color-custom: #5dade2;
}
```

2. **Usar en componentes**:

```css
.miComponente {
    background-color: var(--mi-color-custom);
}
```

### Ajustar transiciones

Las transiciones están definidas en variables CSS:

```css
:root {
    --transition-base: 0.3s ease;
    --transition-fast: 0.15s ease;
}
```

Aplicadas globalmente:

```css
* {
    transition: background-color var(--transition-base), 
                color var(--transition-base), 
                border-color var(--transition-base);
}
```

## 📦 Componentes con soporte de temas

Todos los componentes utilizan variables CSS, por lo que el cambio de tema es automático:

- ✅ NavBarTop
- ✅ SideBarLeft
- ✅ Content
- ✅ DataTable
- ✅ InputForm
- ✅ Buttons
- ✅ Cards

## 🐛 Troubleshooting

### El tema no persiste al recargar

Verificar que `localStorage` esté disponible:

```typescript
if (typeof window !== 'undefined') {
    localStorage.setItem('theme', theme)
}
```

### Componente no responde al cambio de tema

Asegurarse de usar variables CSS en lugar de colores hardcoded:

```css
/* ❌ Incorrecto */
.miComponente {
    background-color: #ffffff;
}

/* ✅ Correcto */
.miComponente {
    background-color: var(--bg-primary);
}
```

### Transiciones muy lentas/rápidas

Ajustar las variables de transición en `globals.css`:

```css
:root {
    --transition-base: 0.2s ease; /* Más rápido */
    --transition-fast: 0.1s ease;
}
```

## 📚 Referencias

- [Shards Dashboard React](https://github.com/DesignRevision/shards-dashboard-react)
- [CSS Custom Properties](https://developer.mozilla.org/es/docs/Web/CSS/--*)
- [prefers-color-scheme](https://developer.mozilla.org/es/docs/Web/CSS/@media/prefers-color-scheme)
- [Context API](https://react.dev/reference/react/useContext)

## 🔄 Changelog

### v1.0.0 (Actual)
- ✅ Implementación inicial del sistema de temas
- ✅ Modo claro y oscuro
- ✅ Persistencia en localStorage
- ✅ Detección de preferencia del sistema
- ✅ Transiciones suaves
- ✅ Variables CSS completas
