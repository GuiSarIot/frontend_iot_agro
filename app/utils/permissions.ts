/**
 * Utilidades para verificación de permisos y roles
 * Centraliza la lógica de detección de superusuarios y permisos
 */

/**
 * Determina si un usuario es superusuario
 * @param userInfo Información del usuario (acepta cualquier objeto con propiedades opcionales)
 * @returns true si es superusuario, false en caso contrario
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isSuperUser = (userInfo: any): boolean => {
    if (!userInfo) return false
    
    const level = String(userInfo.levelAccessRolSistema || '')
    
    return (
        level === 'ROOT' ||
        level === 'SUPERUSER' ||
        userInfo.is_superuser === true ||
        userInfo.nameRolSistema?.toLowerCase().includes('superusuario') ||
        false
    )
}

/**
 * Determina si un usuario es operador
 * @param userInfo Información del usuario
 * @returns true si es operador, false en caso contrario
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isOperator = (userInfo: any): boolean => {
    if (!userInfo) return false
    
    const level = String(userInfo.levelAccessRolSistema || '')
    
    return (
        level === 'OPERATOR' ||
        userInfo.nameRolSistema?.toLowerCase().includes('operador') ||
        false
    )
}

/**
 * Determina si un usuario es staff (personal administrativo)
 * @param userInfo Información del usuario
 * @returns true si es staff, false en caso contrario
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isStaff = (userInfo: any): boolean => {
    if (!userInfo) return false
    
    const level = String(userInfo.levelAccessRolSistema || '')
    
    return (
        level === 'STAFF' ||
        false
    )
}

/**
 * Verifica si el usuario tiene un permiso específico
 * @param userInfo Información del usuario
 * @param permission Código del permiso a verificar
 * @returns true si tiene el permiso, false en caso contrario
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const hasPermission = (userInfo: any, permission: string): boolean => {
    if (!userInfo) return false
    
    // Superusuarios tienen todos los permisos
    if (isSuperUser(userInfo)) return true
    
    // Verificar en el array de roles/permisos
    const roles = Array.isArray(userInfo.roles) ? userInfo.roles : []
    return roles.includes(permission)
}

/**
 * Verifica si el usuario tiene al menos uno de los permisos especificados
 * @param userInfo Información del usuario
 * @param permissions Array de códigos de permisos
 * @returns true si tiene al menos uno de los permisos, false en caso contrario
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const hasAnyPermission = (userInfo: any, permissions: string[]): boolean => {
    if (!userInfo || !Array.isArray(permissions)) return false
    
    // Superusuarios tienen todos los permisos
    if (isSuperUser(userInfo)) return true
    
    return permissions.some(permission => hasPermission(userInfo, permission))
}

/**
 * Verifica si el usuario tiene todos los permisos especificados
 * @param userInfo Información del usuario
 * @param permissions Array de códigos de permisos
 * @returns true si tiene todos los permisos, false en caso contrario
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const hasAllPermissions = (userInfo: any, permissions: string[]): boolean => {
    if (!userInfo || !Array.isArray(permissions)) return false
    
    // Superusuarios tienen todos los permisos
    if (isSuperUser(userInfo)) return true
    
    return permissions.every(permission => hasPermission(userInfo, permission))
}

/**
 * Obtiene el nivel de acceso del usuario
 * @param userInfo Información del usuario
 * @returns Nivel de acceso: 'superuser', 'staff', 'operator', 'user'
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getUserAccessLevel = (userInfo: any): 'superuser' | 'staff' | 'operator' | 'user' => {
    if (!userInfo) return 'user'
    
    if (isSuperUser(userInfo)) return 'superuser'
    if (isStaff(userInfo)) return 'staff'
    if (isOperator(userInfo)) return 'operator'
    
    return 'user'
}

/**
 * Hook para usar permisos en componentes (exportar la lógica para usar con useAppContext)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const usePermissions = (userInfo: any) => {
    return {
        isSuperUser: isSuperUser(userInfo),
        isOperator: isOperator(userInfo),
        isStaff: isStaff(userInfo),
        hasPermission: (permission: string) => hasPermission(userInfo, permission),
        hasAnyPermission: (permissions: string[]) => hasAnyPermission(userInfo, permissions),
        hasAllPermissions: (permissions: string[]) => hasAllPermissions(userInfo, permissions),
        accessLevel: getUserAccessLevel(userInfo)
    }
}
