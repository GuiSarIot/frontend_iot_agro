'use client'

import { useState, useEffect } from 'react'

import Link from 'next/link'

import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import DevicesIcon from '@mui/icons-material/Devices'
import EditIcon from '@mui/icons-material/Edit'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import PersonIcon from '@mui/icons-material/Person'
import SearchIcon from '@mui/icons-material/Search'
import ToggleOffIcon from '@mui/icons-material/ToggleOff'
import ToggleOnIcon from '@mui/icons-material/ToggleOn'
import { InputText } from 'primereact/inputtext'
import Swal from 'sweetalert2'

import useAccessLogger from '@/app/hooks/useAccessLogger'
import { dispositivosService, type Dispositivo } from '@/app/services/api.service'
import { isSuperUser as checkIsSuperUser } from '@/app/utils/permissions'
import GetRoute from '@/components/protectedRoute/getRoute'
import SaveRoute from '@/components/protectedRoute/saveRoute'
import { useAppContext } from '@/context/appContext'

import stylesPage from './mainPage.module.css'

// ---- Interfaces ----
interface InfoPage {
    title: string
    route: string
    role: string
}

interface ManageDispositivosPageProps {
    infoPage?: InfoPage
}

// ---- Componente principal ----
const ManageDispositivosPage: React.FC<ManageDispositivosPageProps> = ({
    infoPage = {
        title: 'Dispositivos',
        route: '/gestor_dispositivos',
        role: 'Gestión de dispositivos'
    }
}) => {
    const { changeTitle, showNavbar, changeUserInfo, appState, showLoader } = useAppContext()
    const { userInfo } = appState

    // Registrar acceso al módulo automáticamente
    useAccessLogger({ 
        customModule: 'devices',
        action: 'list'
    })

    const [listDispositivos, setListDispositivos] = useState<Dispositivo[]>([])
    const [filteredDispositivos, setFilteredDispositivos] = useState<Dispositivo[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [isInitialized, setIsInitialized] = useState(false)

    // Determinar si el usuario es superusuario
    const isSuperUser = checkIsSuperUser(userInfo)

    useEffect(() => {
        if (!isInitialized) {
            showLoader(true)
            showNavbar(window.innerWidth > 1380)
            changeTitle(infoPage.title)
            SaveRoute({
                routeInfo: infoPage.route,
                title: infoPage.title,
                role: infoPage.role
            })
            changeUserInfo({
                ...userInfo,
                role: infoPage.role
            })
            loadDispositivos()
            setIsInitialized(true)
        }
        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredDispositivos(listDispositivos)
        } else {
            const filtered = listDispositivos.filter(dispositivo => 
                dispositivo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                dispositivo.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                dispositivo.estado.toLowerCase().includes(searchTerm.toLowerCase()) ||
                dispositivo.ubicacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (dispositivo.descripcion && dispositivo.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
            )
            setFilteredDispositivos(filtered)
        }
    }, [searchTerm, listDispositivos])

    const loadDispositivos = async () => {
        try {
            const { token } = await GetRoute()
            
            if (!token || token === 'false') {
                console.error('Token no disponible')
                showLoader(false)
                Swal.fire({
                    title: 'Error',
                    text: 'Sesión expirada. Por favor inicia sesión nuevamente.',
                    icon: 'error',
                    confirmButtonText: 'Ok'
                })
                return false
            }

            // Determinar si el usuario es superusuario o ROOT
            const isSuperUser = userInfo.levelAccessRolSistema === 'ROOT' || 
                               userInfo.levelAccessRolSistema === 'SUPERUSER' ||
                               userInfo.nameRolSistema?.toLowerCase().includes('superusuario')

            // Preparar parámetros de consulta
            const queryParams: any = {}
            
            // Si NO es superusuario, filtrar por operador asignado (el usuario actual)
            if (!isSuperUser && userInfo.id) {
                queryParams.operador = Number(userInfo.id)
            }
            // Si es superusuario, traer todos los dispositivos (no pasar operador)

            // Usar el servicio de dispositivos actualizado
            const response = await dispositivosService.getAll(queryParams)
            
            // La respuesta puede ser paginada { count, results } o un array directo
            const dispositivosArray = Array.isArray(response) 
                ? response 
                : response.results || []

            setListDispositivos(dispositivosArray)
            setFilteredDispositivos(dispositivosArray)
            showLoader(false)
            return true

        } catch (error) {
            console.error('Error al cargar dispositivos:', error)
            showLoader(false)
            Swal.fire({
                title: 'Error',
                text: 'Error inesperado al cargar dispositivos',
                icon: 'error',
                confirmButtonText: 'Ok'
            })
            return false
        }
    }

    const handleToggleEstado = async (dispositivo: Dispositivo) => {
        const nuevoEstado = dispositivo.estado === 'activo' ? 'inactivo' : 'activo'
        
        const result = await Swal.fire({
            title: '¿Cambiar estado?',
            text: `¿Deseas ${nuevoEstado === 'activo' ? 'activar' : 'desactivar'} el dispositivo "${dispositivo.nombre}"?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: 'var(--primary)',
            cancelButtonColor: 'var(--error)',
            confirmButtonText: 'Sí, cambiar',
            cancelButtonText: 'Cancelar'
        })

        if (!result.isConfirmed) return

        try {
            await dispositivosService.partialUpdate(dispositivo.id, {
                estado: nuevoEstado
            })

            Swal.fire({
                title: 'Éxito',
                text: 'Estado actualizado correctamente',
                icon: 'success',
                confirmButtonText: 'Ok'
            })

            loadDispositivos()

        } catch (error: unknown) {
            console.error('Error al cambiar estado:', error)
            
            // Mejorar el manejo de errores
            let errorMessage = 'Error inesperado al cambiar el estado'
            
            if (error && typeof error === 'object' && 'message' in error) {
                errorMessage = (error as { message: string }).message
            } else if (typeof error === 'string') {
                errorMessage = error
            }
            
            Swal.fire({
                title: 'Error',
                text: errorMessage,
                icon: 'error',
                confirmButtonText: 'Ok'
            })
        }
    }

    const handleDeleteDispositivo = async (dispositivo: Dispositivo) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar el dispositivo "${dispositivo.nombre}"? Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'var(--error)',
            cancelButtonColor: 'var(--secondary)',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        })

        if (!result.isConfirmed) return

        try {
            await dispositivosService.delete(dispositivo.id)

            Swal.fire({
                title: 'Eliminado',
                text: 'Dispositivo eliminado correctamente',
                icon: 'success',
                confirmButtonText: 'Ok'
            })

            loadDispositivos()

        } catch (error: unknown) {
            console.error('Error al eliminar dispositivo:', error)
            
            // Mejorar el manejo de errores
            let errorMessage = 'Error inesperado al eliminar el dispositivo'
            
            if (error && typeof error === 'object' && 'message' in error) {
                errorMessage = (error as { message: string }).message
            } else if (typeof error === 'string') {
                errorMessage = error
            }
            
            Swal.fire({
                title: 'Error',
                text: errorMessage,
                icon: 'error',
                confirmButtonText: 'Ok'
            })
        }
    }

    const getEstadoColor = (estado: string) => {
        switch (estado.toLowerCase()) {
            case 'activo':
                return 'var(--success)'
            case 'inactivo':
                return 'var(--error)'
            case 'mantenimiento':
                return 'var(--warning)'
            default:
                return 'var(--secondary)'
        }
    }

    const getEstadoLabel = (estado: string) => {
        switch (estado.toLowerCase()) {
            case 'activo':
                return 'Activo'
            case 'inactivo':
                return 'Inactivo'
            case 'mantenimiento':
                return 'Mantenimiento'
            default:
                return estado
        }
    }

    return (
        <div className={stylesPage.containerPage}>
            {/* Contenedor principal tipo card */}
            <div className={stylesPage.mainCard}>
                {/* Header principal dentro del box */}
                <div className={stylesPage.pageHeader}>
                    <div className={stylesPage.titleSection}>
                        <DevicesIcon className={stylesPage.titleIcon} />
                        <div>
                            <h1 className={stylesPage.pageTitle}>Gestión de Dispositivos</h1>
                            <p className={stylesPage.pageSubtitle}>
                                {isSuperUser 
                                    ? 'Administra y monitorea todos los dispositivos del sistema' 
                                    : 'Visualiza y administra tus dispositivos asignados'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Banner informativo de permisos */}
                {!isSuperUser && (
                    <div style={{
                        padding: '12px 20px',
                        backgroundColor: 'var(--info-bg, #e3f2fd)',
                        border: '1px solid var(--info-border, #90caf9)',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="20" 
                            height="20" 
                            viewBox="0 0 24 24" 
                            fill="var(--info, #2196f3)"
                        >
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                        </svg>
                        <span style={{ 
                            color: 'var(--info-text, #1976d2)', 
                            fontSize: '14px',
                            fontWeight: 500
                        }}>
                            Estás viendo únicamente los dispositivos que tienes asignados. 
                            Solo los superusuarios pueden ver todos los dispositivos del sistema.
                        </span>
                    </div>
                )}

                {/* Sección de búsqueda y acciones */}
                <div className={stylesPage.cardHeader}>
                    <div className={stylesPage.searchContainer}>
                        <span className="p-input-icon-left" style={{ width: '100%' }}>
                            <SearchIcon style={{ 
                                position: 'absolute', 
                                left: '12px', 
                                top: '50%', 
                                transform: 'translateY(-50%)',
                                color: 'var(--neutral-500)'
                            }} />
                            <InputText
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar dispositivos..."
                                className={stylesPage.searchInput}
                                style={{ paddingLeft: '45px', width: '100%' }}
                            />
                        </span>
                    </div>
                    
                    {isSuperUser && (
                        <Link href="/gestor_dispositivos/crear" className={stylesPage.btnPrimary}>
                            <AddIcon className={stylesPage.btnIcon} />
                            <span>Nuevo dispositivo</span>
                        </Link>
                    )}
                </div>

                {/* Estadísticas dentro del card */}
                <div className={stylesPage.statsSection}>
                    <div className={stylesPage.statCard}>
                        <div className={`${stylesPage.statIcon} ${stylesPage.statIconPrimary}`}>
                            <DevicesIcon />
                        </div>
                        <div className={stylesPage.statInfo}>
                            <p className={stylesPage.statLabel}>Total dispositivos</p>
                            <p className={stylesPage.statValue}>{listDispositivos.length}</p>
                        </div>
                    </div>

                    <div className={stylesPage.statCard}>
                        <div className={`${stylesPage.statIcon} ${stylesPage.statIconSuccess}`}>
                            <ToggleOnIcon />
                        </div>
                        <div className={stylesPage.statInfo}>
                            <p className={stylesPage.statLabel}>Activos</p>
                            <p className={stylesPage.statValue}>
                                {listDispositivos.filter(d => d.estado.toLowerCase() === 'activo').length}
                            </p>
                        </div>
                    </div>

                    <div className={stylesPage.statCard}>
                        <div className={`${stylesPage.statIcon} ${stylesPage.statIconError}`}>
                            <ToggleOffIcon />
                        </div>
                        <div className={stylesPage.statInfo}>
                            <p className={stylesPage.statLabel}>Inactivos</p>
                            <p className={stylesPage.statValue}>
                                {listDispositivos.filter(d => d.estado.toLowerCase() === 'inactivo').length}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sección de tabla */}
                <div className={stylesPage.tableSection}>
                    <div className={stylesPage.tableSectionHeader}>
                        <h2 className={stylesPage.tableSectionTitle}>
                            Dispositivos registrados
                        </h2>
                        <span className={stylesPage.deviceCount}>
                            {filteredDispositivos.length} {filteredDispositivos.length === 1 ? 'dispositivo' : 'dispositivos'}
                        </span>
                    </div>

                    {filteredDispositivos.length === 0 ? (
                        <div className={stylesPage.emptyState}>
                            <DevicesIcon style={{ fontSize: '64px', color: 'var(--neutral-300)' }} />
                            <p className={stylesPage.emptyStateText}>
                                {searchTerm 
                                    ? 'No se encontraron dispositivos' 
                                    : isSuperUser
                                        ? 'No hay dispositivos registrados'
                                        : 'No tienes dispositivos asignados'}
                            </p>
                            {!searchTerm && isSuperUser && (
                                <Link href="/gestor_dispositivos/crear" className={stylesPage.btnPrimary}>
                                    <AddIcon className={stylesPage.btnIcon} />
                                    Crear primer dispositivo
                                </Link>
                            )}
                            {!searchTerm && !isSuperUser && (
                                <p style={{ 
                                    fontSize: '14px', 
                                    color: 'var(--neutral-500)',
                                    marginTop: '10px'
                                }}>
                                    Contacta a un administrador para que te asigne dispositivos
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className={stylesPage.cardsGrid}>
                            {filteredDispositivos.map((dispositivo) => (
                                <div key={dispositivo.id} className={stylesPage.deviceCard}>
                                    {/* Card Header */}
                                    <div className={stylesPage.cardHeaderDevice}>
                                        <div className={stylesPage.cardTitleSection}>
                                            <h3 className={stylesPage.cardDeviceName}>{dispositivo.nombre}</h3>
                                            <span 
                                                className={stylesPage.statusBadge}
                                                style={{ 
                                                    backgroundColor: `${getEstadoColor(dispositivo.estado)}15`,
                                                    color: getEstadoColor(dispositivo.estado),
                                                    border: `1px solid ${getEstadoColor(dispositivo.estado)}30`
                                                }}
                                            >
                                                {getEstadoLabel(dispositivo.estado)}
                                            </span>
                                        </div>
                                        <div className={stylesPage.actionsButtons}>
                                            {isSuperUser && (
                                                <button
                                                    onClick={() => handleToggleEstado(dispositivo)}
                                                    className={`${stylesPage.btnAction} ${stylesPage.btnActionToggle}`}
                                                    title={dispositivo.estado === 'activo' ? 'Desactivar' : 'Activar'}
                                                >
                                                    {dispositivo.estado === 'activo' ? (
                                                        <ToggleOnIcon />
                                                    ) : (
                                                        <ToggleOffIcon />
                                                    )}
                                                </button>
                                            )}
                                            <Link
                                                href={`/gestor_dispositivos/${dispositivo.id}`}
                                                className={`${stylesPage.btnAction} ${stylesPage.btnActionEdit}`}
                                                title={isSuperUser ? "Editar" : "Ver detalles"}
                                            >
                                                <EditIcon />
                                            </Link>
                                            {isSuperUser && (
                                                <button
                                                    onClick={() => handleDeleteDispositivo(dispositivo)}
                                                    className={`${stylesPage.btnAction} ${stylesPage.btnActionDelete}`}
                                                    title="Eliminar"
                                                >
                                                    <DeleteIcon />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Card Body */}
                                    <div className={stylesPage.cardBody}>
                                        {dispositivo.descripcion && (
                                            <p className={stylesPage.cardDescription}>
                                                {dispositivo.descripcion}
                                            </p>
                                        )}

                                        <div className={stylesPage.cardInfo}>
                                            <div className={stylesPage.infoItemRow}>
                                                <div className={stylesPage.infoSection}>
                                                    <DevicesIcon className={stylesPage.infoIcon} />
                                                    <div className={stylesPage.infoContent}>
                                                        <span className={stylesPage.cardInfoLabel}>TIPO</span>
                                                        <span className={stylesPage.deviceType}>
                                                            {dispositivo.tipo_display || dispositivo.tipo}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className={stylesPage.infoSection}>
                                                    <LocationOnIcon className={stylesPage.infoIcon} />
                                                    <div className={stylesPage.infoContent}>
                                                        <span className={stylesPage.cardInfoLabel}>UBICACIÓN</span>
                                                        <span className={stylesPage.cardInfoValue}>
                                                            {dispositivo.ubicacion || 'No especificada'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Usuario asignado - siempre mostrar */}
                                            <div className={`${stylesPage.infoItemRow} ${stylesPage.fullWidth}`}>
                                                <div className={stylesPage.infoSection}>
                                                    <PersonIcon className={stylesPage.infoIcon} />
                                                    <div className={stylesPage.infoContent}>
                                                        <span className={stylesPage.cardInfoLabel}>USUARIO ASIGNADO</span>
                                                        {dispositivo.operador_asignado && dispositivo.operador_username ? (
                                                            <>
                                                                <span className={stylesPage.cardInfoValue}>
                                                                    {dispositivo.operador_username}
                                                                </span>
                                                                {dispositivo.propietario?.email && (
                                                                    <span className={stylesPage.cardInfoSubtext}>
                                                                        {dispositivo.propietario.email}
                                                                    </span>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <span className={stylesPage.cardInfoValue} style={{ 
                                                                color: 'var(--text-tertiary)',
                                                                fontStyle: 'italic' 
                                                            }}>
                                                                Sin propietario
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Footer */}
                                    <div className={stylesPage.cardFooterDevice}>
                                        <span className={stylesPage.deviceId}>ID: #{dispositivo.id}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ManageDispositivosPage
