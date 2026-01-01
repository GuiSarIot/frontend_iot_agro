'use client'

import AddCircleIcon from '@mui/icons-material/AddCircle'
import AssessmentIcon from '@mui/icons-material/Assessment'
import CodeIcon from '@mui/icons-material/Code'
import DashboardIcon from '@mui/icons-material/Dashboard'
import DevicesIcon from '@mui/icons-material/Devices'
import ListIcon from '@mui/icons-material/List'
import PeopleIcon from '@mui/icons-material/People'
import PersonIcon from '@mui/icons-material/Person'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import SecurityIcon from '@mui/icons-material/Security'
import SensorsIcon from '@mui/icons-material/Sensors'
import SettingsIcon from '@mui/icons-material/Settings'

import { SidebarMenuItem } from './SidebarMenu'

/**
 * Configuración de menús secundarios para cada módulo
 * Cada módulo puede tener submódulos u opciones relacionadas
 */
export const MODULE_MENUS: Record<string, SidebarMenuItem[]> = {
    '/dashboard': [
        {
            icon: <DashboardIcon />,
            label: 'Vista General',
            href: '/dashboard',
            title: 'Panel de control principal'
        },
        {
            icon: <AssessmentIcon />,
            label: 'Estadísticas',
            href: '/dashboard/estadisticas',
            title: 'Estadísticas del sistema'
        }
    ],
    '/gestor_usuarios': [
        {
            icon: <PeopleIcon />,
            label: 'Lista de Usuarios',
            href: '/gestor_usuarios',
            title: 'Ver todos los usuarios'
        },
        {
            icon: <PersonAddIcon />,
            label: 'Crear Usuario',
            href: '/gestor_usuarios/crear',
            title: 'Registrar nuevo usuario'
        },
        {
            icon: <SecurityIcon />,
            label: 'Roles Institucionales',
            href: '/gestor_usuarios/roles_institucionales',
            title: 'Gestión de roles'
        }
    ],
    '/update_personal_info': [
        {
            icon: <PersonIcon />,
            label: 'Mi Información',
            href: '/update_personal_info',
            title: 'Actualizar datos personales'
        }
    ],
    '/dispositivos': [
        {
            icon: <ListIcon />,
            label: 'Lista de Dispositivos',
            href: '/dispositivos',
            title: 'Ver todos los dispositivos'
        },
        {
            icon: <AddCircleIcon />,
            label: 'Agregar Dispositivo',
            href: '/dispositivos/crear',
            title: 'Registrar nuevo dispositivo'
        },
        {
            icon: <SettingsIcon />,
            label: 'Configuración',
            href: '/dispositivos/configuracion',
            title: 'Configuración de dispositivos'
        }
    ],
    '/sensores': [
        {
            icon: <SensorsIcon />,
            label: 'Lista de Sensores',
            href: '/sensores',
            title: 'Ver todos los sensores'
        },
        {
            icon: <AddCircleIcon />,
            label: 'Agregar Sensor',
            href: '/sensores/crear',
            title: 'Registrar nuevo sensor'
        }
    ],
    '/ejemplos': [
        {
            icon: <CodeIcon />,
            label: 'Ejemplos de Código',
            href: '/ejemplos',
            title: 'Ver ejemplos de implementación'
        },
        {
            icon: <DevicesIcon />,
            label: 'Ejemplo Dispositivos',
            href: '/ejemplos/dispositivos-example',
            title: 'Ejemplo de gestión de dispositivos'
        }
    ]
}

/**
 * Obtiene el menú secundario basado en la ruta actual
 * @param pathname Ruta actual del navegador
 * @returns Array de items del menú o null si no hay menú definido
 */
export const getModuleMenuByPath = (pathname: string): SidebarMenuItem[] | null => {
    if (!pathname) return null

    // Buscar coincidencia exacta primero
    if (MODULE_MENUS[pathname]) {
        return MODULE_MENUS[pathname]
    }

    // Buscar coincidencia por ruta base
    const baseRoute = Object.keys(MODULE_MENUS).find(route => 
        pathname === route || pathname.startsWith(route + '/')
    )

    return baseRoute ? MODULE_MENUS[baseRoute] : null
}
