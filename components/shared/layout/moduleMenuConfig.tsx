'use client'

import AddCircleIcon from '@mui/icons-material/AddCircle'
import AssessmentIcon from '@mui/icons-material/Assessment'
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
            label: 'Roles',
            href: '/gestor_usuarios/roles',
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
    '/gestor_dispositivos': [
        {
            icon: <ListIcon />,
            label: 'Lista de Dispositivos',
            href: '/gestor_dispositivos',
            title: 'Ver todos los dispositivos'
        },
        {
            icon: <AddCircleIcon />,
            label: 'Agregar Dispositivo',
            href: '/gestor_dispositivos/crear',
            title: 'Registrar nuevo dispositivo'
        },
        {
            icon: <SettingsIcon />,
            label: 'Configuración',
            href: '/gestor_dispositivos/configuracion',
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
    '/gestor_mqtt': [
        {
            icon: <ListIcon />,
            label: 'Brokers MQTT',
            href: '/gestor_mqtt/brokers',
            title: 'Gestión de brokers MQTT'
        },
        {
            icon: <SecurityIcon />,
            label: 'Credenciales',
            href: '/gestor_mqtt/credentials',
            title: 'Gestión de credenciales de autenticación'
        },
        {
            icon: <SettingsIcon />,
            label: 'Topics',
            href: '/gestor_mqtt/topics',
            title: 'Gestión de topics MQTT'
        },
        {
            icon: <DevicesIcon />,
            label: 'Config. Dispositivos',
            href: '/gestor_mqtt/device_config',
            title: 'Configuración MQTT por dispositivo'
        },
        {
            icon: <PeopleIcon />,
            label: 'Usuarios EMQX',
            href: '/gestor_mqtt/users',
            title: 'Gestión de usuarios EMQX'
        },
        {
            icon: <SecurityIcon />,
            label: 'ACL EMQX',
            href: '/gestor_mqtt/acl',
            title: 'Control de acceso a topics'
        }
    ],
    '/gestor_mqtt/brokers': [
        {
            icon: <ListIcon />,
            label: 'Lista de Brokers',
            href: '/gestor_mqtt/brokers',
            title: 'Ver todos los brokers MQTT'
        },
        {
            icon: <AddCircleIcon />,
            label: 'Crear Broker',
            href: '/gestor_mqtt/brokers/crear',
            title: 'Registrar nuevo broker'
        }
    ],
    '/gestor_mqtt/credentials': [
        {
            icon: <ListIcon />,
            label: 'Lista de Credenciales',
            href: '/gestor_mqtt/credentials',
            title: 'Ver todas las credenciales'
        },
        {
            icon: <AddCircleIcon />,
            label: 'Crear Credencial',
            href: '/gestor_mqtt/credentials/crear',
            title: 'Registrar nueva credencial'
        }
    ],
    '/gestor_mqtt/topics': [
        {
            icon: <ListIcon />,
            label: 'Lista de Topics',
            href: '/gestor_mqtt/topics',
            title: 'Ver todos los topics'
        },
        {
            icon: <AddCircleIcon />,
            label: 'Crear Topic',
            href: '/gestor_mqtt/topics/crear',
            title: 'Registrar nuevo topic'
        }
    ],
    '/gestor_mqtt/device_config': [
        {
            icon: <ListIcon />,
            label: 'Lista de Configuraciones',
            href: '/gestor_mqtt/device_config',
            title: 'Ver configuraciones de dispositivos'
        },
        {
            icon: <AddCircleIcon />,
            label: 'Crear Configuración',
            href: '/gestor_mqtt/device_config/crear',
            title: 'Configurar dispositivo MQTT'
        }
    ],
    '/gestor_mqtt/users': [
        {
            icon: <ListIcon />,
            label: 'Lista de Usuarios',
            href: '/gestor_mqtt/users',
            title: 'Ver usuarios EMQX'
        },
        {
            icon: <PersonAddIcon />,
            label: 'Crear Usuario',
            href: '/gestor_mqtt/users/crear',
            title: 'Registrar usuario EMQX'
        }
    ],
    '/gestor_mqtt/acl': [
        {
            icon: <ListIcon />,
            label: 'Lista de Reglas ACL',
            href: '/gestor_mqtt/acl',
            title: 'Ver reglas de control de acceso'
        },
        {
            icon: <AddCircleIcon />,
            label: 'Crear Regla ACL',
            href: '/gestor_mqtt/acl/crear',
            title: 'Crear regla de acceso'
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
