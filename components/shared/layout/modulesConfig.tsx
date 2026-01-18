'use client'

import React, { ReactElement } from 'react'

import AssessmentIcon from '@mui/icons-material/Assessment'
import DashboardIcon from '@mui/icons-material/Dashboard'
import DevicesIcon from '@mui/icons-material/Devices'
import HistoryIcon from '@mui/icons-material/History'
import PeopleIcon from '@mui/icons-material/People'
import PersonIcon from '@mui/icons-material/Person'
import RouterIcon from '@mui/icons-material/Router'
import SensorsIcon from '@mui/icons-material/Sensors'
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount'


import { isSuperUser, hasAnyPermission } from '@/app/utils/permissions'
import { SidebarMenuItem } from './SidebarMenu'

// Mapeo de permisos a módulos principales
interface ModuleConfig {
    permissions: string[]  // Permisos que dan acceso al módulo
    requireSuperUser?: boolean  // Si requiere ser superusuario
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
    portalUsuario: {
        permissions: [], // Acceso para usuarios normales
        icon: <PersonIcon />,
        label: 'Mi Portal',
        href: '/dashboard/portal_usuario',
        description: 'Portal de usuario - Mis dispositivos y lecturas',
        priority: 2
    },
    portalAdmin: {
        permissions: ['is_staff'],
        requireSuperUser: true, // Solo superusuarios
        icon: <SupervisorAccountIcon />,
        label: 'Portal Admin',
        href: '/dashboard/portal_admin',
        description: 'Portal de administración - Gestión completa',
        priority: 3
    },
    usuarios: {
        permissions: ['gestionar_usuarios', 'ver_usuarios'],
        requireSuperUser: true, // Solo superusuarios pueden gestionar usuarios
        icon: <PeopleIcon />,
        label: 'Usuarios',
        href: '/gestor_usuarios',
        description: 'Gestión de usuarios del sistema',
        priority: 4
    },
    logs: {
        permissions: [],
        requireSuperUser: true, // Solo superusuarios
        icon: <HistoryIcon />,
        label: 'Auditoría y Logs',
        href: '/gestor_logs',
        description: 'Auditoría y logs del sistema',
        priority: 5
    },
    dispositivos: {
        permissions: ['ver_dispositivos'],
        requireSuperUser: true, // Solo superusuarios pueden gestionar dispositivos
        icon: <DevicesIcon />,
        label: 'Dispositivos',
        href: '/gestor_dispositivos',
        description: 'Gestión de dispositivos IoT',
        priority: 6
    },
    sensores: {
        permissions: ['ver_sensores'],
        requireSuperUser: true, // Solo superusuarios pueden gestionar sensores
        icon: <SensorsIcon />,
        label: 'Sensores',
        href: '/gestor_sensores',
        description: 'Gestión de sensores',
        priority: 7
    },
    lecturas: {
        permissions: ['ver_lecturas'],
        requireSuperUser: true, // Solo superusuarios pueden gestionar lecturas
        icon: <AssessmentIcon />,
        label: 'Lecturas',
        href: '/gestor_lecturas',
        description: 'Visualización de lecturas de sensores',
        priority: 8
    },
    mqtt: {
        permissions: ['gestionar_mqtt', 'ver_mqtt'],
        requireSuperUser: true, // Solo superusuarios pueden gestionar MQTT
        icon: <RouterIcon />,
        label: 'MQTT',
        href: '/gestor_mqtt',
        description: 'Gestión de componentes MQTT',
        priority: 9
    }
}

/**
 * Obtiene los módulos disponibles según los permisos del usuario
 * @param userPermissions Array de códigos de permisos del usuario
 * @param userInfo Información completa del usuario (para verificar si es superusuario)
 * @returns Array de items de menú ordenados por prioridad
 */
export const getAvailableModules = (userPermissions: string[], userInfo?: any): SidebarMenuItem[] => {
    if (!Array.isArray(userPermissions)) {
        userPermissions = []
    }

    const isUserSuperUser = userInfo ? isSuperUser(userInfo) : false

    // Si el usuario no tiene permisos cargados, mostrar solo módulos sin restricción
    if (userPermissions.length === 0 && !isUserSuperUser) {
        const publicModules = Object.entries(MODULES_CONFIG)
            .filter(([_key, config]) => config.permissions.length === 0 && !config.requireSuperUser)
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

    Object.entries(MODULES_CONFIG).forEach(([_key, config]) => {
        // Si el módulo requiere superusuario, verificar primero
        if (config.requireSuperUser && !isUserSuperUser) {
            return // No tiene acceso
        }

        // Si el módulo no requiere permisos específicos, está disponible
        // O si el usuario es superusuario, tiene acceso a todo
        // O si tiene alguno de los permisos requeridos
        const hasAccess = isUserSuperUser ||
            config.permissions.length === 0 || 
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
 * Obtiene solo los módulos del dashboard (Portal Admin y Portal Usuario)
 * según los permisos del usuario
 * @param userPermissions Array de códigos de permisos del usuario
 * @param userInfo Información completa del usuario (para verificar si es superusuario)
 * @returns Array de items de menú del dashboard ordenados por prioridad
 */
export const getDashboardModules = (userPermissions: string[], userInfo?: any): SidebarMenuItem[] => {
    if (!Array.isArray(userPermissions)) {
        userPermissions = []
    }

    const isUserSuperUser = userInfo ? isSuperUser(userInfo) : false
    const dashboardModules: SidebarMenuItem[] = []

    // Portal Usuario - disponible para todos
    const portalUsuarioConfig = MODULES_CONFIG['portalUsuario']
    if (portalUsuarioConfig) {
        dashboardModules.push({
            icon: portalUsuarioConfig.icon,
            label: portalUsuarioConfig.label,
            href: portalUsuarioConfig.href,
            title: portalUsuarioConfig.description
        })
    }

    // Portal Admin - solo para superusuarios
    if (isUserSuperUser) {
        const portalAdminConfig = MODULES_CONFIG['portalAdmin']
        if (portalAdminConfig) {
            dashboardModules.push({
                icon: portalAdminConfig.icon,
                label: portalAdminConfig.label,
                href: portalAdminConfig.href,
                title: portalAdminConfig.description
            })
        }
    }

    // Ordenar por prioridad
    return dashboardModules.sort((a, b) => {
        const configA = Object.values(MODULES_CONFIG).find(c => c.label === a.label)
        const configB = Object.values(MODULES_CONFIG).find(c => c.label === b.label)
        return (configA?.priority || 99) - (configB?.priority || 99)
    })
}

/**
 * Obtiene los módulos para mostrar en el navbar superior
 * Excluye los portales del dashboard (Portal Admin y Mi Portal)
 * @param userPermissions Array de códigos de permisos del usuario
 * @param userInfo Información completa del usuario (para verificar si es superusuario)
 * @returns Array de items de menú para el navbar ordenados por prioridad
 */
export const getNavbarModules = (userPermissions: string[], userInfo?: any): SidebarMenuItem[] => {
    const allModules = getAvailableModules(userPermissions, userInfo)
    
    // Filtrar excluyendo los portales del dashboard
    return allModules.filter(module => 
        module.href !== '/dashboard/portal_usuario' && 
        module.href !== '/dashboard/portal_admin'
    )
}

/**
 * Verifica si el usuario tiene acceso a un módulo específico
 * @param moduleKey Clave del módulo a verificar
 * @param userPermissions Array de códigos de permisos del usuario
 * @param userInfo Información completa del usuario (para verificar si es superusuario)
 * @returns true si tiene acceso, false en caso contrario
 */
export const hasModuleAccess = (moduleKey: string, userPermissions: string[], userInfo?: any): boolean => {
    const moduleConfig = MODULES_CONFIG[moduleKey]
    if (!moduleConfig) {
        return false
    }

    const isUserSuperUser = userInfo ? isSuperUser(userInfo) : false

    // Superusuarios tienen acceso a todo
    if (isUserSuperUser) return true

    // Si el módulo requiere ser superusuario y el usuario no lo es
    if (moduleConfig.requireSuperUser) return false

    // Si no requiere permisos específicos, está disponible
    if (moduleConfig.permissions.length === 0) return true

    // Verificar permisos
    if (!Array.isArray(userPermissions)) return false
    return moduleConfig.permissions.some(permission => userPermissions.includes(permission))
}
