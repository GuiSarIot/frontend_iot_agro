# 🎨 Sistema de Diseño - IOTCorp SAS

## 📋 Tabla de Contenidos
- [Variables CSS](#variables-css)
- [Componentes](#componentes)
- [Utilidades](#utilidades)
- [Responsive Design](#responsive-design)
- [Mejores Prácticas](#mejores-prácticas)

---

## 🎨 Variables CSS

### Colores

#### Primarios
```css
var(--primary)          /* #147910 - Verde principal */
var(--primary-light)    /* #4f834a - Verde claro */
var(--primary-dark)     /* #0d5309 - Verde oscuro */
var(--primary-50) hasta var(--primary-900) /* Escala completa */
```

#### Secundarios
```css
var(--secondary)        /* #2c3e50 - Gris azulado */
var(--secondary-50) hasta var(--secondary-900) /* Escala completa */
```

#### Neutros
```css
var(--neutral-50)       /* #fafbfc - Más claro */
var(--neutral-900)      /* #3e4c59 - Más oscuro */
```

#### Estados
```css
var(--success)          /* Verde éxito */
var(--warning)          /* Amarillo advertencia */
var(--error)            /* Rojo error */
var(--info)             /* Azul información */
```

### Espaciado
```css
var(--spacing-xs)       /* 4px */
var(--spacing-sm)       /* 8px */
var(--spacing-md)       /* 16px */
var(--spacing-lg)       /* 24px */
var(--spacing-xl)       /* 32px */
var(--spacing-2xl)      /* 48px */
var(--spacing-3xl)      /* 64px */
```

### Tipografía
```css
var(--font-size-xs)     /* 12px */
var(--font-size-sm)     /* 14px */
var(--font-size-base)   /* 16px */
var(--font-size-lg)     /* 18px */
var(--font-size-xl)     /* 20px */
var(--font-size-2xl)    /* 24px */
var(--font-size-3xl)    /* 30px */
var(--font-size-4xl)    /* 36px */
```

### Sombras
```css
var(--shadow-xs)        /* Sombra muy sutil */
var(--shadow-sm)        /* Sombra pequeña */
var(--shadow-base)      /* Sombra estándar */
var(--shadow-md)        /* Sombra media */
var(--shadow-lg)        /* Sombra grande */
var(--shadow-xl)        /* Sombra extra grande */
```

### Bordes
```css
var(--border-radius-sm)   /* 6px */
var(--border-radius-base) /* 8px */
var(--border-radius-md)   /* 12px */
var(--border-radius-lg)   /* 16px */
var(--border-radius-xl)   /* 20px */
var(--border-radius-full) /* 9999px - Círculo completo */
```

---

## 🧩 Componentes

### Botones

```html
<!-- Botón primario -->
<button class="btn btn-primary">Guardar</button>

<!-- Botón secundario -->
<button class="btn btn-secondary">Cancelar</button>

<!-- Botón de éxito -->
<button class="btn btn-success">Confirmar</button>

<!-- Botón de peligro -->
<button class="btn btn-danger">Eliminar</button>

<!-- Botón outline -->
<button class="btn btn-outline">Ver más</button>

<!-- Botón ghost -->
<button class="btn btn-ghost">Cerrar</button>

<!-- Tamaños -->
<button class="btn btn-primary btn-sm">Pequeño</button>
<button class="btn btn-primary">Normal</button>
<button class="btn btn-primary btn-lg">Grande</button>

<!-- Full width -->
<button class="btn btn-primary btn-block">Ancho completo</button>

<!-- Deshabilitado -->
<button class="btn btn-primary" disabled>Deshabilitado</button>
```

### Tarjetas

```html
<div class="card">
  <div class="card-header">
    <h3>Título de la tarjeta</h3>
  </div>
  <div class="card-body">
    <p>Contenido de la tarjeta</p>
  </div>
  <div class="card-footer">
    <button class="btn btn-primary">Acción</button>
  </div>
</div>
```

### Formularios

```html
<div class="form-group">
  <label class="form-label">Nombre de usuario</label>
  <input type="text" placeholder="Ingresa tu nombre">
</div>

<div class="form-group">
  <label class="form-label">Descripción</label>
  <textarea placeholder="Escribe una descripción"></textarea>
</div>

<div class="form-group">
  <label class="form-label">País</label>
  <select>
    <option>Selecciona un país</option>
    <option>Colombia</option>
    <option>México</option>
  </select>
</div>
```

### Badges

```html
<span class="badge badge-primary">Nuevo</span>
<span class="badge badge-success">Activo</span>
<span class="badge badge-warning">Pendiente</span>
<span class="badge badge-error">Inactivo</span>
<span class="badge badge-info">Info</span>
```

### Alertas

```html
<div class="alert alert-success">
  Operación realizada con éxito
</div>

<div class="alert alert-warning">
  Ten cuidado con esta acción
</div>

<div class="alert alert-error">
  Ocurrió un error en la operación
</div>

<div class="alert alert-info">
  Información importante
</div>
```

### Tablas

```html
<div class="table-container">
  <table>
    <thead>
      <tr>
        <th>Nombre</th>
        <th>Email</th>
        <th>Rol</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Juan Pérez</td>
        <td>juan@example.com</td>
        <td>Admin</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- Tabla con rayas alternadas -->
<table class="table-striped">...</table>

<!-- Tabla compacta -->
<table class="table-compact">...</table>
```

---

## 🛠️ Utilidades

### Espaciado

```html
<!-- Margins -->
<div class="m-3">Margin en todos lados</div>
<div class="mt-4">Margin top</div>
<div class="mb-2">Margin bottom</div>

<!-- Paddings -->
<div class="p-3">Padding en todos lados</div>
<div class="pt-4">Padding top</div>
<div class="pb-2">Padding bottom</div>
```

### Display

```html
<div class="d-none">Oculto</div>
<div class="d-block">Bloque</div>
<div class="d-flex">Flex</div>
<div class="d-grid">Grid</div>
```

### Flexbox

```html
<div class="d-flex flex-column align-center justify-between gap-3">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<!-- Clases disponibles -->
.flex-row, .flex-column
.flex-wrap, .flex-nowrap
.justify-start, .justify-center, .justify-end, .justify-between
.align-start, .align-center, .align-end
.gap-1, .gap-2, .gap-3, .gap-4, .gap-5
```

### Texto

```html
<!-- Alineación -->
<p class="text-left">Izquierda</p>
<p class="text-center">Centro</p>
<p class="text-right">Derecha</p>

<!-- Colores -->
<p class="text-primary">Texto primario</p>
<p class="text-success">Texto éxito</p>
<p class="text-error">Texto error</p>

<!-- Tamaños -->
<p class="text-xs">Extra pequeño</p>
<p class="text-sm">Pequeño</p>
<p class="text-base">Normal</p>
<p class="text-lg">Grande</p>

<!-- Peso -->
<p class="font-normal">Normal</p>
<p class="font-medium">Medium</p>
<p class="font-semibold">Semibold</p>
<p class="font-bold">Bold</p>
```

### Bordes y Sombras

```html
<!-- Bordes redondeados -->
<div class="rounded">Base</div>
<div class="rounded-md">Medio</div>
<div class="rounded-lg">Grande</div>
<div class="rounded-full">Completo</div>

<!-- Sombras -->
<div class="shadow-sm">Sombra pequeña</div>
<div class="shadow">Sombra base</div>
<div class="shadow-md">Sombra media</div>
<div class="shadow-lg">Sombra grande</div>
```

### Animaciones

```html
<div class="animate-fade-in">Aparece con fade</div>
<div class="animate-slide-up">Desliza hacia arriba</div>
<div class="animate-float">Flota</div>
<div class="animate-spin">Gira (para loaders)</div>
```

---

## 📱 Responsive Design

### Breakpoints

```css
/* Extra small: < 576px */
/* Small: 576px - 767px */
/* Medium: 768px - 991px */
/* Large: 992px - 1199px */
/* Extra large: >= 1200px */
```

### Clases Responsive

```html
<!-- Ocultar en móvil -->
<div class="hide-mobile">Solo visible en desktop</div>

<!-- Stack en móvil -->
<div class="d-flex stack-mobile">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<!-- Botón full width en móvil -->
<button class="btn btn-primary btn-mobile-block">Acción</button>
```

---

## ✨ Mejores Prácticas

### 1. Usa Variables CSS
```css
/* ❌ No hagas esto */
.mi-componente {
  color: #147910;
  padding: 16px;
}

/* ✅ Haz esto */
.mi-componente {
  color: var(--primary);
  padding: var(--spacing-md);
}
```

### 2. Usa Clases de Utilidad
```html
<!-- ❌ No hagas esto -->
<div style="display: flex; gap: 16px; padding: 24px;">
  ...
</div>

<!-- ✅ Haz esto -->
<div class="d-flex gap-3 p-4">
  ...
</div>
```

### 3. Componentes Reutilizables
```css
/* ✅ Crea componentes modulares */
.user-card {
  background: var(--bg-primary);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
}
```

### 4. Nombres Semánticos
```css
/* ❌ No hagas esto */
.green-button { }
.big-text { }

/* ✅ Haz esto */
.btn-primary { }
.text-heading { }
```

### 5. Mobile First
```css
/* ✅ Diseña primero para móvil */
.container {
  padding: var(--spacing-md);
}

@media (min-width: 768px) {
  .container {
    padding: var(--spacing-xl);
  }
}
```

---

## 🎯 Ejemplos de Uso

### Página de Login
```html
<div class="d-flex align-center justify-center" style="min-height: 100vh;">
  <div class="card" style="max-width: 400px; width: 100%;">
    <div class="card-header">
      <h2 class="text-center">Iniciar Sesión</h2>
    </div>
    <div class="card-body">
      <form>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input type="email" placeholder="tu@email.com">
        </div>
        <div class="form-group">
          <label class="form-label">Contraseña</label>
          <input type="password" placeholder="••••••••">
        </div>
        <button type="submit" class="btn btn-primary btn-block">
          Entrar
        </button>
      </form>
    </div>
  </div>
</div>
```

### Dashboard Card
```html
<div class="card">
  <div class="card-header d-flex justify-between align-center">
    <h3>Usuarios Activos</h3>
    <span class="badge badge-success">+12%</span>
  </div>
  <div class="card-body">
    <p class="text-4xl font-bold mb-2">1,234</p>
    <p class="text-secondary">Usuarios registrados este mes</p>
  </div>
</div>
```

### Lista con Acciones
```html
<div class="card">
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>Usuario</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Juan Pérez</td>
          <td><span class="badge badge-success">Activo</span></td>
          <td>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-ghost">Editar</button>
              <button class="btn btn-sm btn-ghost text-error">Eliminar</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

---

## 📚 Recursos Adicionales

- **PrimeReact**: Ya integrado para componentes avanzados
- **Variables CSS**: Todas las variables están en `styles/globals.css`
- **Iconos**: Material UI Icons disponibles

## 🤝 Contribuir

Al agregar nuevos estilos:
1. Usa las variables CSS existentes
2. Sigue el patrón de nomenclatura BEM cuando sea necesario
3. Agrega comentarios descriptivos
4. Prueba en diferentes tamaños de pantalla
5. Actualiza esta documentación

---

**Última actualización**: Diciembre 2025
