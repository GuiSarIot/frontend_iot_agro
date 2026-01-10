'use client'

import React, { ReactElement } from 'react'

import AssessmentIcon from '@mui/icons-material/Assessment'
import CodeIcon from '@mui/icons-material/Code'
import DashboardIcon from '@mui/icons-material/Dashboard'
import DevicesIcon from '@mui/icons-material/Devices'
import HistoryIcon from '@mui/icons-material/History'
import PeopleIcon from '@mui/icons-material/People'
import RouterIcon from '@mui/icons-material/Router'
import SecurityIcon from '@mui/icons-material/Security'
import SensorsIcon from '@mui/icons-material/Sensors'
import VpnKeyIcon from '@mui/icons-material/VpnKey'

import { SidebarMenuItem } from './SidebarMenu'

// Mapeo de permisos a módulos principales
interface ModuleConfig {
    permissions: string[]  // Permisos que dan acceso al módulo
    icon: ReactElement
    label: string
    href: string
    description: string
    priority: number  // Para ordenar los módulos
}

// Configuración de módulos disponibles
export const MODULES_CONFIG: Record<string, ModuleConfig> = {
    dashboard: {
        permissions: [], // Acceso para todos
        icon: <DashboardIcon />,
        label: 'Dashboard',
        href: '/dashboard',
        description: 'Panel de control y estadísticas',
        priority: 1
    },
    usuarios: {
        permissions: ['gestionar_usuarios', 'ver_usuarios'],
        icon: <PeopleIcon />,
        label: 'Usuarios',
        href: '/gestor_usuarios',
        description: 'Gestión de usuarios del sistema',
        priority: 2
    },
    logs: {
        permissions: ['is_superuser'], // Solo superusuarios
        icon: <HistoryIcon />,
        label: 'Auditoría y Logs',
        href: '/gestor_logs',
        description: 'Auditoría y logs del sistema',
        priority: 3
    },
    dispositivos: {
        permissions: ['gestionar_dispositivos', 'ver_dispositivos'],
        icon: <DevicesIcon />,
        label: 'Dispositivos',
        href: '/gestor_dispositivos',
        description: 'Gestión de dispositivos IoT',
        priority: 4
    },
    sensores: {
        permissions: ['gestionar_sensores', 'ver_sensores'],
        icon: <SensorsIcon />,
        label: 'Sensores',
        href: '/gestor_sensores',
        description: 'Gestión de sensores',
        priority: 5
    },
    lecturas: {
        permissions: ['ver_lecturas', 'crear_lecturas'],
        icon: <AssessmentIcon />,
        label: 'Lecturas',
        href: '/gestor_lecturas',
        description: 'Visualización de lecturas de sensores',
        priority: 6
    },
    mqtt: {
        permissions: ['gestionar_mqtt', 'ver_credenciales_mqtt'],
        icon: <RouterIcon />,
        label: 'MQTT',
        href: '/mqtt',
        description: 'Configuración MQTT/EMQX',
        priority: 7
    },
    roles: {
        permissions: ['gestionar_roles'],
        icon: <SecurityIcon />,
        label: 'Roles',
        href: '/gestor_usuarios/roles',
        description: 'Gestión de roles',
        priority: 8
    },
    permisos: {
        permissions: ['gestionar_permisos'],
        icon: <VpnKeyIcon />,
        label: 'Permisos',
        href: '/permisos',
        description: 'Gestión de permisos',
        priority: 9
    },
    ejemplos: {
        permissions: [], // Todos tienen acceso a ejemplos
        icon: <CodeIcon />,
        label: 'Ejemplos',
        href: '/ejemplos',
        description: 'Ejemplos de código y funcionalidades',
        priority: 10
    }
}

/**
 * Obtiene los módulos disponibles según los permisos del usuario
 * @param userPermissions Array de códigos de permisos del usuario
 * @returns Array de items de menú ordenados por prioridad
 */
export const getAvailableModules = (userPermissions: string[]): SidebarMenuItem[] => {
    if (!Array.isArray(userPermissions)) {
        userPermissions = []
    }

    // Si el usuario no tiene permisos cargados, mostrar solo módulos sin restricción
    if (userPermissions.length === 0) {
        const publicModules = Object.entries(MODULES_CONFIG)
            .filter(([_key, config]) => config.permissions.length === 0)
            .map(([_key, config]) => ({
                icon: config.icon,
                label: config.label,
                href: config.href,
                title: config.description
            }))
            .sort((a, b) => {
                const configA = Object.values(MODULES_CONFIG).find(c => c.label === a.label)
                const configB = Object.values(MODULES_CONFIG).find(c => c.label === b.label)
                return (configA?.priority || 99) - (configB?.priority || 99)
            })
        return publicModules
    }

    const availableModules: SidebarMenuItem[] = []

    Object.entries(MODULES_CONFIG).forEach(([key, config]) => {
        // Si el módulo no requiere permisos (array vacío), está disponible para todos
        const hasAccess = config.permissions.length === 0 || 
            config.permissions.some(permission => userPermissions.includes(permission))

        if (hasAccess) {
            availableModules.push({
                icon: config.icon,
                label: config.label,
                href: config.href,
                title: config.description
            })
        }
    })


    // Ordenar por prioridad
    return availableModules.sort((a, b) => {
        const configA = Object.values(MODULES_CONFIG).find(c => c.label === a.label)
        const configB = Object.values(MODULES_CONFIG).find(c => c.label === b.label)
        return (configA?.priority || 99) - (configB?.priority || 99)
    })
}

/**
 * Verifica si el usuario tiene acceso a un módulo específico
 * @param moduleKey Clave del módulo a verificar
 * @param userPermissions Array de códigos de permisos del usuario
 * @returns true si tiene acceso, false en caso contrario
 */
export const hasModuleAccess = (moduleKey: string, userPermissions: string[]): boolean => {
    const moduleConfig = MODULES_CONFIG[moduleKey]
    if (!moduleConfig || !Array.isArray(userPermissions)) {
        return false
    }

    return moduleConfig.permissions.some(permission => userPermissions.includes(permission))
}
