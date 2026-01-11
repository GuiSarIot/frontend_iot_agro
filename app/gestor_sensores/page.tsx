'use client'

import { useState, useEffect } from 'react'

import Link from 'next/link'

import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import DevicesIcon from '@mui/icons-material/Devices'
import EditIcon from '@mui/icons-material/Edit'
import SearchIcon from '@mui/icons-material/Search'
import SensorsIcon from '@mui/icons-material/Sensors'
import { InputText } from 'primereact/inputtext'
import Swal from 'sweetalert2'

import useAccessLogger from '@/app/hooks/useAccessLogger'
import { sensoresService, type Sensor } from '@/app/services/api.service'
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

interface ManageSensoresPageProps {
    infoPage?: InfoPage
}

// ---- Componente principal ----
const ManageSensoresPage: React.FC<ManageSensoresPageProps> = ({
    infoPage = {
        title: 'Sensores',
        route: '/gestor_sensores',
        role: 'Gestión de sensores'
    }
}) => {
    const { changeTitle, showNavbar, changeUserInfo, appState, showLoader } = useAppContext()
    const { userInfo } = appState

    // Determinar si el usuario es superusuario
    const isSuperUser = checkIsSuperUser(userInfo)

    // Registrar acceso al módulo automáticamente
    useAccessLogger({ 
        customModule: 'sensors',
        action: 'list'
    })

    const [filteredSensores, setFilteredSensores] = useState<Sensor[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [totalCount, setTotalCount] = useState(0)
    const [isInitialized, setIsInitialized] = useState(false)

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
            setIsInitialized(true)
        }
        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        if (!isInitialized) return

        const delayDebounceFn = setTimeout(() => {
            loadSensores()
        }, 300)

        return () => clearTimeout(delayDebounceFn)
        // eslint-disable-next-line
    }, [searchTerm, isInitialized])

    const loadSensores = async () => {
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

            const params = searchTerm ? { search: searchTerm } : {}
            const response = await sensoresService.getAll(params)
            
            setFilteredSensores(response.results)
            setTotalCount(response.count)
            showLoader(false)
            return true

        } catch (error) {
            console.error('Error al cargar sensores:', error)
            showLoader(false)
            Swal.fire({
                title: 'Error',
                text: error instanceof Error ? error.message : 'Error al cargar los sensores',
                icon: 'error',
                confirmButtonText: 'Ok'
            })
            return false
        }
    }

    const handleDelete = async (id: number, nombre: string) => {
        const result = await Swal.fire({
            title: '¿Eliminar sensor?',
            text: `Se eliminará el sensor "${nombre}". Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'var(--error)',
            cancelButtonColor: 'var(--secondary)',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        })

        if (result.isConfirmed) {
            showLoader(true)
            try {
                await sensoresService.delete(id)
                showLoader(false)
                
                Swal.fire({
                    title: 'Eliminado',
                    text: `El sensor "${nombre}" ha sido eliminado correctamente`,
                    icon: 'success',
                    confirmButtonText: 'Ok'
                })
                
                loadSensores()
            } catch (error) {
                console.error('Error al eliminar sensor:', error)
                showLoader(false)
                Swal.fire({
                    title: 'Error',
                    text: error instanceof Error ? error.message : 'Error al eliminar el sensor',
                    icon: 'error',
                    confirmButtonText: 'Ok'
                })
            }
        }
    }

    return (
        <div className={stylesPage.containerPage}>
            <div className={stylesPage.mainCard}>
                {/* Header */}
                <div className={stylesPage.pageHeader}>
                    <div className={stylesPage.titleSection}>
                        <div className={stylesPage.titleWrapper}>
                            <SensorsIcon className={stylesPage.titleIcon} />
                            <h1 className={stylesPage.pageTitle}>Gestión de sensores</h1>
                        </div>
                        <p className={stylesPage.pageSubtitle}>
                            Administra los sensores disponibles en el sistema
                        </p>
                    </div>
                </div>

                {/* Card Header - Búsqueda y botón */}
                <div className={stylesPage.cardHeader}>
                    <div className={stylesPage.searchContainer}>
                        <div className={stylesPage.searchBox}>
                            <SearchIcon className={stylesPage.searchIcon} />
                            <InputText
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar por nombre, tipo o unidad de medida..."
                                className={stylesPage.searchInput}
                            />
                        </div>
                    </div>
                    {isSuperUser && (
                        <Link href="/gestor_sensores/crear" className={stylesPage.btnCreate}>
                            <AddIcon />
                            <span>Nuevo sensor</span>
                        </Link>
                    )}
                </div>

                {/* Estadísticas */}
                <div className={stylesPage.statsSection}>
                    <div className={stylesPage.searchStats}>
                        {totalCount} sensor{totalCount !== 1 ? 'es' : ''} encontrado{totalCount !== 1 ? 's' : ''}
                    </div>
                </div>

                {/* Contenido principal */}
                <div className={stylesPage.contentSection}>
                    <div className={stylesPage.cardsGrid}>
                        {filteredSensores.length === 0 ? (
                            <div className={stylesPage.emptyState}>
                                <SensorsIcon style={{ fontSize: '4rem', color: 'var(--neutral-400)' }} />
                                <h3>No hay sensores disponibles</h3>
                                <p>
                                    {searchTerm 
                                        ? 'No se encontraron sensores con los criterios de búsqueda'
                                        : 'Comienza creando tu primer sensor'}
                                </p>
                                {!searchTerm && isSuperUser && (
                                    <Link href="/gestor_sensores/crear" className={stylesPage.btnEmptyCreate}>
                                        <AddIcon />
                                        <span>Crear primer sensor</span>
                                    </Link>
                                )}
                            </div>
                        ) : (
                            filteredSensores.map((sensor) => (
                                <div key={sensor.id} className={stylesPage.card}>
                                    <div className={stylesPage.cardHeaderSensor}>
                                        <div className={stylesPage.cardTitleSection}>
                                            <h3 className={stylesPage.cardTitle}>{sensor.nombre}</h3>
                                        </div>
                                        <div className={stylesPage.cardActions}>
                                            <Link 
                                                href={`/gestor_sensores/${sensor.id}`}
                                                className={stylesPage.btnActionIcon}
                                                title={isSuperUser ? "Editar sensor" : "Ver sensor"}
                                            >
                                                <EditIcon />
                                            </Link>
                                            {isSuperUser && (
                                                <button
                                                    onClick={() => handleDelete(sensor.id, sensor.nombre)}
                                                    className={`${stylesPage.btnActionIcon} ${stylesPage.btnActionDelete}`}
                                                    title="Eliminar sensor"
                                                >
                                                    <DeleteIcon />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className={stylesPage.cardBody}>
                                        {sensor.descripcion && (
                                            <p className={stylesPage.cardDescription}>
                                                {sensor.descripcion}
                                            </p>
                                        )}
                                        
                                        <div className={stylesPage.cardInfoGrid}>
                                            <div className={stylesPage.infoItemRow}>
                                                <div className={stylesPage.infoSection}>
                                                    <SensorsIcon className={stylesPage.infoIcon} />
                                                    <div className={stylesPage.infoContent}>
                                                        <span className={stylesPage.cardLabel}>Tipo</span>
                                                        <span className={stylesPage.cardType}>{sensor.tipo_display || sensor.tipo}</span>
                                                    </div>
                                                </div>

                                                <div className={stylesPage.infoSection}>
                                                    <span className={stylesPage.infoIcon}>📏</span>
                                                    <div className={stylesPage.infoContent}>
                                                        <span className={stylesPage.cardLabel}>Unidad</span>
                                                        <span className={stylesPage.cardValue}>{sensor.unidad_medida}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {(sensor.rango_min !== null || sensor.rango_max !== null) && (
                                                <div className={stylesPage.rangeSection}>
                                                    <span className={stylesPage.cardLabel}>Rango de medición:</span>
                                                    <span className={stylesPage.cardValue}>
                                                        {sensor.rango_min !== null ? sensor.rango_min : '∞'} - {sensor.rango_max !== null ? sensor.rango_max : '∞'}
                                                    </span>
                                                </div>
                                            )}
                                            
                                            {/* Dispositivos asignados */}
                                            <div className={`${stylesPage.infoItemRow} ${stylesPage.fullWidth}`}>
                                                <div className={stylesPage.infoSection}>
                                                    <DevicesIcon className={stylesPage.infoIcon} />
                                                    <div className={stylesPage.infoContent}>
                                                        <span className={stylesPage.cardLabel}>DISPOSITIVOS ASIGNADOS</span>
                                                        {sensor.cantidad_dispositivos > 0 ? (
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                                <span className={stylesPage.cardValue} style={{
                                                                    color: 'var(--primary)',
                                                                    fontWeight: 600
                                                                }}>
                                                                    {sensor.cantidad_dispositivos} {sensor.cantidad_dispositivos === 1 ? 'dispositivo' : 'dispositivos'}
                                                                </span>
                                                                {sensor.dispositivos_asignados.slice(0, 2).map((dispositivo, index) => (
                                                                    <span key={index} className={stylesPage.cardInfoSubtext} style={{
                                                                        fontSize: '0.75rem',
                                                                        color: dispositivo.activo ? 'var(--text-secondary)' : 'var(--text-tertiary)',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '4px'
                                                                    }}>
                                                                        <span style={{
                                                                            width: '6px',
                                                                            height: '6px',
                                                                            borderRadius: '50%',
                                                                            backgroundColor: dispositivo.activo && dispositivo.estado === 'activo' 
                                                                                ? 'var(--success)' 
                                                                                : 'var(--neutral-400)',
                                                                            display: 'inline-block'
                                                                        }}></span>
                                                                        {dispositivo.nombre}
                                                                    </span>
                                                                ))}
                                                                {sensor.dispositivos_asignados.length > 2 && (
                                                                    <span className={stylesPage.cardInfoSubtext} style={{
                                                                        fontSize: '0.75rem',
                                                                        color: 'var(--text-tertiary)',
                                                                        fontStyle: 'italic'
                                                                    }}>
                                                                        +{sensor.dispositivos_asignados.length - 2} más...
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className={stylesPage.cardValue} style={{
                                                                color: 'var(--text-tertiary)',
                                                                fontStyle: 'italic',
                                                                fontSize: '0.875rem'
                                                            }}>
                                                                Sin dispositivos asignados
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={stylesPage.cardFooterSensor}>
                                        <span className={stylesPage.sensorId}>ID: #{sensor.id}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ManageSensoresPage
