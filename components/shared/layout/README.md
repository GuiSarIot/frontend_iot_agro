# AppLayout - Sistema de Layout Componentizado

## Descripción
Sistema de layout reutilizable y dinámico que encapsula el navbar, sidebar y content en componentes modulares.

## Componentes

### AppLayout
Componente principal que envuelve toda la aplicación con la estructura estándar.

**Props:**
- `children` (ReactNode): Contenido de la página
- `sidebarContent` (ReactNode, opcional): Contenido del sidebar
- `showSidebar` (boolean, opcional): Mostrar u ocultar sidebar (default: true)
- `pageTitle` (string, opcional): Título personalizado de la página

### SidebarMenu
Componente helper para crear menús de navegación en el sidebar.

**Props:**
- `title` (string): Título del menú
- `items` (SidebarMenuItem[]): Array de items del menú

**SidebarMenuItem:**
```typescript
interface SidebarMenuItem {
    icon?: ReactNode      // Icono opcional del item
    label: string         // Texto del item
    href: string          // URL de navegación
    title?: string        // Tooltip opcional
    onClick?: (event) => void  // Handler opcional
}
```

## Uso

### Ejemplo básico
```tsx
import { AppLayout, SidebarMenu } from '@/components/shared/layout'
import HomeIcon from '@mui/icons-material/Home'

const menuItems = [
    {
        icon: <HomeIcon />,
        label: 'Inicio',
        href: '/dashboard',
        title: 'Ir al inicio'
    }
]

export default function MyPage({ children }) {
    return (
        <AppLayout 
            sidebarContent={<SidebarMenu title="Mi Módulo" items={menuItems} />}
        >
            {children}
        </AppLayout>
    )
}
```

### Sin sidebar
```tsx
<AppLayout showSidebar={false}>
    {children}
</AppLayout>
```

### Con título personalizado
```tsx
<AppLayout 
    pageTitle="Mi Título Personalizado"
    sidebarContent={<SidebarMenu title="Menú" items={menuItems} />}
>
    {children}
</AppLayout>
```

## Ventajas
- ✅ Código reutilizable y DRY
- ✅ Configuración declarativa del menú
- ✅ TypeScript para type safety
- ✅ Fácil de mantener y extender
- ✅ Consistencia en toda la aplicación
