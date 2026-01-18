'use client'

import { useEffect, useRef } from 'react'

import { usePathname } from 'next/navigation'

import { accessLogsService } from '@/app/services/api.service'

/**
 * Mapeo de rutas a módulos
 */
const ROUTE_TO_MODULE_MAP: Record<string, string> = {
    '/login': 'auth',
    '/recuperar_contrasena': 'auth',
    '/cambio_contrasena': 'auth',
    '/gestor_usuarios': 'users',
    '/gestor_usuarios/roles': 'roles',
    '/gestor_usuarios/permisos': 'permissions',
    '/gestor_dispositivos': 'devices',
    '/gestor_sensores': 'sensors',
    '/gestor_logs': 'admin',
    '/dashboard': 'other'
}

/**
 * Obtiene el módulo basado en la ruta actual
 */
const getModuleFromPath = (path: string): string => {
    // Buscar coincidencia exacta primero
    if (ROUTE_TO_MODULE_MAP[path]) {
        return ROUTE_TO_MODULE_MAP[path]
    }
    
    // Buscar coincidencia por prefijo (para rutas dinámicas)
    for (const [route, module] of Object.entries(ROUTE_TO_MODULE_MAP)) {
        if (path.startsWith(route + '/')) {
            return module
        }
    }
    
    return 'other'
}

/**
 * Obtiene el método HTTP basado en la acción
 * Por defecto, la visualización de un módulo es GET
 */
const getMethodFromAction = (action?: string): string => {
    if (!action) return 'GET'
    
    const methodMap: Record<string, string> = {
        'view': 'GET',
        'create': 'POST',
        'update': 'PUT',
        'delete': 'DELETE',
        'list': 'GET'
    }
    
    return methodMap[action.toLowerCase()] || 'GET'
}

interface UseAccessLoggerOptions {
    action?: 'view' | 'create' | 'update' | 'delete' | 'list'
    customModule?: string
    customEndpoint?: string
    enabled?: boolean
}

/**
 * Hook para registrar automáticamente el acceso a módulos
 * 
 * @example
 * // En una página de módulo
 * useAccessLogger({ action: 'view' })
 * 
 * // Con módulo personalizado
 * useAccessLogger({ customModule: 'devices', action: 'list' })
 * 
 * // Deshabilitar logging
 * useAccessLogger({ enabled: false })
 */
export const useAccessLogger = (options: UseAccessLoggerOptions = {}) => {
    const {
        action = 'view',
        customModule,
        customEndpoint,
        enabled = true
    } = options

    const pathname = usePathname()
    const hasLoggedRef = useRef(false)
    const startTimeRef = useRef<number>(0)

    useEffect(() => {
        // No registrar si está deshabilitado o ya se registró
        if (!enabled || hasLoggedRef.current || !pathname) {
            return
        }

        // Marcar inicio del tiempo
        startTimeRef.current = Date.now()

        // Registrar el acceso
        const logAccess = async () => {
            try {
                const moduleName = customModule || getModuleFromPath(pathname)
                const endpoint = customEndpoint || pathname
                const method = getMethodFromAction(action)
                const responseTime = Math.round(Date.now() - startTimeRef.current)

                const logData = {
                    module: moduleName,
                    endpoint,
                    method,
                    status_code: 200,
                    response_time_ms: responseTime
                }

                await accessLogsService.create(logData)

                hasLoggedRef.current = true
            } catch (error) {
                console.error('[AccessLogger] Error al registrar acceso:', error)
                // No mostrar error al usuario, es un proceso en segundo plano
            }
        }

        // Pequeño delay para capturar el tiempo de carga real
        const timeoutId = setTimeout(logAccess, 500)

        return () => {
            clearTimeout(timeoutId)
        }
    }, [pathname, action, customModule, customEndpoint, enabled])

    // Función para registrar acciones específicas manualmente
    const logAction = async (
        actionType: 'create' | 'update' | 'delete',
        statusCode: number = 200
    ) => {
        try {
            const moduleName = customModule || getModuleFromPath(pathname || '')
            const endpoint = customEndpoint || pathname || ''
            const method = getMethodFromAction(actionType)
            const responseTime = Math.round(Date.now() - startTimeRef.current)

            const logData = {
                module: moduleName,
                endpoint,
                method,
                status_code: statusCode,
                response_time_ms: responseTime
            }

            const result = await accessLogsService.create(logData)

            return result
        } catch (error) {
            console.error('[AccessLogger] Error al registrar acción:', error)
            throw error
        }
    }

    return { logAction }
}

export default useAccessLogger
