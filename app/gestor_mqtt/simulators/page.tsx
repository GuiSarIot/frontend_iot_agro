'use client'

import { useState, useEffect, useCallback } from 'react'

import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CloseIcon from '@mui/icons-material/Close'
import ErrorIcon from '@mui/icons-material/Error'
import InfoIcon from '@mui/icons-material/Info'
import LightModeIcon from '@mui/icons-material/LightMode'
import OpacityIcon from '@mui/icons-material/Opacity'
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid'
import RefreshIcon from '@mui/icons-material/Refresh'
import ScienceIcon from '@mui/icons-material/Science'
import SearchIcon from '@mui/icons-material/Search'
import SettingsIcon from '@mui/icons-material/Settings'
import SpeedIcon from '@mui/icons-material/Speed'
import ThermostatIcon from '@mui/icons-material/Thermostat'
import WifiIcon from '@mui/icons-material/Wifi'
import WifiOffIcon from '@mui/icons-material/WifiOff'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import { Dropdown } from 'primereact/dropdown'

import { useMqttCommands } from '@/app/hooks/useMqttCommands'
import { useMqttSubscription } from '@/app/hooks/useMqttSubscription'
import { dispositivosService, type Dispositivo, type MqttCredentials } from '@/app/services/api.service'
import type { AvailableCommand } from '@/app/services/mqtt-commands.service'
import { MqttControls } from '@/components/shared/MqttControls'

import styles from './simulators.module.css'

/**
 * Página de pruebas de simuladores MQTT dentro del módulo MQTT
 */
export default function MqttSimulatorsPage() {
    const [dispositivos, setDispositivos] = useState<Dispositivo[]>([])
    const [selectedDevice, setSelectedDevice] = useState<Dispositivo | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showFullPanel, _setShowFullPanel] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterTipo, setFilterTipo] = useState<string>('all')
    const [filterStatus, setFilterStatus] = useState<string>('all')
    const [filterUbicacion, setFilterUbicacion] = useState('')
    const [notification, setNotification] = useState<{
        type: 'success' | 'error' | 'info'
        message: string
    } | null>(null)

    const { getAvailableCommands } = useMqttCommands()
    const [availableCommands, setAvailableCommands] = useState<AvailableCommand[]>([])
    const [commandsLoading, setCommandsLoading] = useState(false)
    
    // Credenciales MQTT del dispositivo seleccionado
    const [mqttCredentials, setMqttCredentials] = useState<MqttCredentials | null>(null)
    const [credentialsLoading, setCredentialsLoading] = useState(false)
    
    // Usa las credenciales MQTT del dispositivo específico
    const { 
        sensorData, 
        connectionStatus, 
        isConnected,
        error: mqttError,
        reconnect: reconnectMqtt 
    } = useMqttSubscription(
        selectedDevice?.identificador_unico,
        mqttCredentials ? {
            username: mqttCredentials.mqtt_username,
            password: mqttCredentials.mqtt_password || '',
            broker_host: mqttCredentials.broker_host,
            broker_port: mqttCredentials.broker_port,
        } : undefined,
        true,   // autoConnect
        false   // enableMockData - cambiar a true si EMQX no está disponible
    )
    
    // Estados previos para detectar cambios y mostrar tendencias
    const [prevSensorData, setPrevSensorData] = useState<typeof sensorData>(null)
    const [dataUpdated, setDataUpdated] = useState(false)

    const loadDevices = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await dispositivosService.getAll({ page_size: 100 })
            const devices = response.results || []
            setDispositivos(devices)

            // Seleccionar el primer dispositivo por defecto
            if (devices.length > 0 && !selectedDevice) {
                setSelectedDevice(devices[0])
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error cargando dispositivos'
            setError(errorMessage)
            console.error('Error cargando dispositivos:', err)
        } finally {
            setLoading(false)
        }
    }, [selectedDevice])

    const loadCommands = useCallback(async () => {
        try {
            setCommandsLoading(true)
            const commands = await getAvailableCommands()
            // Asegurar que siempre sea un array
            setAvailableCommands(Array.isArray(commands) ? commands : [])
        } catch (err) {
            console.error('Error cargando comandos:', err)
            setAvailableCommands([]) // Establecer array vacío en caso de error
        } finally {
            setCommandsLoading(false)
        }
    }, [getAvailableCommands])

    // Cargar dispositivos
    useEffect(() => {
        loadDevices()
        loadCommands()
    }, [loadDevices, loadCommands])

    // Cargar credenciales MQTT del dispositivo
    const loadMqttCredentials = async (deviceId: number) => {
        try {
            setCredentialsLoading(true)
            const credentials = await dispositivosService.getMqttCredentials(deviceId)
            setMqttCredentials(credentials)
        } catch (err) {
            console.error('❌ Error cargando credenciales MQTT:', err)
            setMqttCredentials(null)
        } finally {
            setCredentialsLoading(false)
        }
    }

    // Cargar credenciales cuando cambia el dispositivo seleccionado
    useEffect(() => {
        if (selectedDevice) {
            loadMqttCredentials(selectedDevice.id)
        } else {
            setMqttCredentials(null)
        }
    }, [selectedDevice])
    
    // Detectar cambios en sensorData para animar
    useEffect(() => {
        if (sensorData) {
            setPrevSensorData(prev => {
                if (JSON.stringify(sensorData) !== JSON.stringify(prev)) {
                    setDataUpdated(true)
                    return sensorData
                }
                return prev
            })
        }
    }, [sensorData])
    
    // Función para determinar tendencia
    const getTrend = (current?: number, previous?: number) => {
        if (current === undefined || previous === undefined) return null
        if (current > previous) return 'up'
        if (current < previous) return 'down'
        return 'stable'
    }

    // Filtrar dispositivos por búsqueda, tipo, estado y ubicación
    const filteredDevices = dispositivos.filter(device => {
        const tipoText = typeof device.tipo === 'string' 
            ? device.tipo 
            : device.tipo.nombre
        const ubicacionText = typeof device.ubicacion === 'string'
            ? device.ubicacion
            : (device.ubicacion as { nombre: string }).nombre
        
        const matchesSearch = device.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesTipo = filterTipo === 'all' || tipoText.toLowerCase() === filterTipo.toLowerCase()
        const matchesStatus = filterStatus === 'all' || device.estado === filterStatus
        const matchesUbicacion = filterUbicacion === '' || ubicacionText.toLowerCase().includes(filterUbicacion.toLowerCase())
        
        return matchesSearch && matchesTipo && matchesStatus && matchesUbicacion
    })

    // Obtener tipos únicos para el filtro
    const uniqueTipos = Array.from(new Set(dispositivos.map(device => 
        typeof device.tipo === 'string' ? device.tipo : device.tipo.nombre
    )))

    const handleDeviceSelect = (deviceId: string) => {
        const device = dispositivos.find(d => d.identificador_unico === deviceId)
        if (device) {
            setSelectedDevice(device)
        }
    }

    if (loading) {
        return (
            <div className={styles.containerPage}>
                <div className={styles.mainCard}>
                    {/* Skeleton loading */}
                    <div className={styles.skeletonHeader}></div>
                    <div className={styles.skeletonControlBar}></div>
                    <div className={styles.skeletonGrid}>
                        <div className={styles.skeletonCard}></div>
                        <div className={styles.skeletonCard}></div>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className={styles.containerPage}>
                <div className={styles.mainCard}>
                    <div className={styles.errorContainer}>
                        <div className={styles.errorIcon}>⚠️</div>
                        <h2>Error al Cargar Dispositivos</h2>
                        <p>{error}</p>
                        <button onClick={loadDevices} className={styles.retryButton}>
                            🔄 Reintentar
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    if (dispositivos.length === 0) {
        return (
            <div className={styles.containerPage}>
                <div className={styles.mainCard}>
                    <div className={styles.emptyContainer}>
                        <div className={styles.emptyIcon}>📱</div>
                        <h2>No hay Dispositivos Disponibles</h2>
                        <p>No se encontraron dispositivos para probar comandos MQTT.</p>
                        <button onClick={loadDevices} className={styles.retryButton}>
                            🔄 Actualizar
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.containerPage}>
            <div className={styles.mainCard}>
                {/* Page Header */}
                <div className={styles.pageHeader}>
                    <div className={styles.titleSection}>
                        <div className={styles.titleWrapper}>
                            <ScienceIcon className={styles.titleIcon} />
                            <h1 className={styles.pageTitle}>Simuladores MQTT</h1>
                        </div>
                        <p className={styles.pageSubtitle}>Prueba de comandos en tiempo real para dispositivos IoT</p>
                    </div>
                </div>

                {/* Notificaciones */}
                {notification && (
                    <div className={`${styles.notification} ${styles[notification.type]}`}>
                        <div className={styles.notificationContent}>
                            {notification.type === 'success' && <CheckCircleIcon />}
                            {notification.type === 'error' && <ErrorIcon />}
                            {notification.type === 'info' && <InfoIcon />}
                            <span>{notification.message}</span>
                        </div>
                        <button onClick={() => setNotification(null)} className={styles.closeButton}>
                            <CloseIcon />
                        </button>
                    </div>
                )}

                {/* Card Header - Búsqueda y acciones */}
                <div className={styles.cardHeader}>
                    <div className={styles.searchContainer}>
                        <div className={styles.searchBox}>
                            <SearchIcon className={styles.searchIcon} />
                            <TextField
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar dispositivo..."
                                size="small"
                                variant="outlined"
                                className={styles.searchInput}
                            />
                        </div>
                    </div>
                    <button onClick={loadDevices} className={styles.btnRefresh} title="Actualizar dispositivos">
                        <RefreshIcon />
                        <span>Actualizar</span>
                    </button>
                </div>

                {/* Filtros adicionales */}
                <div className={styles.filtersBar}>
                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Tipo</label>
                        <TextField
                            select
                            value={filterTipo}
                            onChange={(e) => setFilterTipo(e.target.value)}
                            size="small"
                            variant="outlined"
                            className={styles.filterSelect}
                        >
                            <MenuItem value="all">Todos</MenuItem>
                            {uniqueTipos.map(tipo => (
                                <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
                            ))}
                        </TextField>
                    </div>

                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Estado</label>
                        <TextField
                            select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            size="small"
                            variant="outlined"
                            className={styles.filterSelect}
                        >
                            <MenuItem value="all">Todos</MenuItem>
                            <MenuItem value="activo">Activo</MenuItem>
                            <MenuItem value="inactivo">Inactivo</MenuItem>
                            <MenuItem value="mantenimiento">Mantenimiento</MenuItem>
                        </TextField>
                    </div>

                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Ubicación</label>
                        <TextField
                            value={filterUbicacion}
                            onChange={(e) => setFilterUbicacion(e.target.value)}
                            placeholder="Filtrar..."
                            size="small"
                            variant="outlined"
                            className={styles.filterInput}
                        />
                    </div>

                    <button 
                        onClick={() => {
                            setSearchTerm('')
                            setFilterTipo('all')
                            setFilterStatus('all')
                            setFilterUbicacion('')
                        }}
                        className={styles.btnClearFilters}
                    >
                        Limpiar filtros
                    </button>
                </div>

                {/* Selector de dispositivo */}
                <div className={styles.deviceSelector}>
                    <label className={styles.deviceSelectorLabel}>Dispositivo seleccionado:</label>
                    <Dropdown
                        value={selectedDevice?.identificador_unico || ''}
                        onChange={(e) => handleDeviceSelect(e.value)}
                        options={filteredDevices.map(device => {
                            const ubicacionText = typeof device.ubicacion === 'string' 
                                ? device.ubicacion 
                                : (device.ubicacion as { nombre: string }).nombre
                            const tipoText = typeof device.tipo === 'string'
                                ? device.tipo
                                : device.tipo.nombre
                            return {
                                label: `${device.nombre} - ${tipoText} (${ubicacionText})`,
                                value: device.identificador_unico
                            }
                        })}
                        placeholder="Seleccionar dispositivo"
                        className={styles.deviceDropdown}
                        disabled={filteredDevices.length === 0}
                    />
                    <span className={styles.deviceCount}>
                        {filteredDevices.length} dispositivo{filteredDevices.length !== 1 ? 's' : ''} disponible{filteredDevices.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {/* Contenido principal */}
                <div className={styles.contentSection}>
                    {/* Lecturas de sensores en tiempo real */}
                    {selectedDevice && (
                        <div className={styles.sensorReadingsSection}>
                            <div className={styles.sensorHeader}>
                                <div className={styles.sensorHeaderTitle}>
                                    <ThermostatIcon className={styles.sensorIcon} />
                                    <h3>Lecturas de Sensores en Tiempo Real</h3>
                                    {false && ( // Cambiar a true para mostrar badge en modo demo
                                        <span className={styles.mockBadge} title="Datos simulados para desarrollo">
                                            🎭 MODO DEMO
                                        </span>
                                    )}
                                </div>
                                <div className={styles.connectionStatus}>
                                    {credentialsLoading ? (
                                        <>
                                            <span className={styles.loadingText}>Cargando credenciales...</span>
                                        </>
                                    ) : !mqttCredentials ? (
                                        <>
                                            <WifiOffIcon className={styles.disconnectedIcon} />
                                            <span className={styles.disconnectedText}>Sin credenciales MQTT</span>
                                        </>
                                    ) : isConnected ? (
                                        <>
                                            <WifiIcon className={styles.connectedIcon} />
                                            <span className={styles.connectedText}>Conectado ({mqttCredentials.mqtt_username})</span>
                                        </>
                                    ) : (
                                        <>
                                            <WifiOffIcon className={styles.disconnectedIcon} />
                                            <span className={styles.disconnectedText}>
                                                {connectionStatus === 'connecting' ? 'Conectando...' : 'Desconectado'}
                                            </span>
                                            {connectionStatus === 'disconnected' && mqttCredentials && (
                                                <button onClick={reconnectMqtt} className={styles.reconnectButton}>
                                                    Reconectar
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                            
                            <div className={styles.sensorGrid}>
                                {/* Temperatura */}
                                <div className={`${styles.sensorCard} ${dataUpdated ? styles.cardPulse : ''}`}>
                                    <div className={styles.sensorCardHeader}>
                                        <ThermostatIcon className={styles.sensorCardIcon} style={{ color: '#ff6b6b' }} />
                                        <span className={styles.sensorCardLabel}>Temperatura</span>
                                        {getTrend(sensorData?.temperature, prevSensorData?.temperature) === 'up' && (
                                            <span className={styles.trendUp}>↑</span>
                                        )}
                                        {getTrend(sensorData?.temperature, prevSensorData?.temperature) === 'down' && (
                                            <span className={styles.trendDown}>↓</span>
                                        )}
                                    </div>
                                    <div className={styles.sensorCardValue}>
                                        {sensorData?.temperature !== undefined ? (
                                            <>
                                                <span className={`${styles.value} ${dataUpdated ? styles.valueUpdate : ''}`}>{sensorData.temperature.toFixed(2)}</span>
                                                <span className={styles.unit}>°C</span>
                                            </>
                                        ) : (
                                            <span className={styles.noData}>--</span>
                                        )}
                                    </div>
                                </div>

                                {/* Humedad */}
                                <div className={`${styles.sensorCard} ${dataUpdated ? styles.cardPulse : ''}`}>
                                    <div className={styles.sensorCardHeader}>
                                        <OpacityIcon className={styles.sensorCardIcon} style={{ color: '#4ecdc4' }} />
                                        <span className={styles.sensorCardLabel}>Humedad</span>
                                        {getTrend(sensorData?.humidity, prevSensorData?.humidity) === 'up' && (
                                            <span className={styles.trendUp}>↑</span>
                                        )}
                                        {getTrend(sensorData?.humidity, prevSensorData?.humidity) === 'down' && (
                                            <span className={styles.trendDown}>↓</span>
                                        )}
                                    </div>
                                    <div className={styles.sensorCardValue}>
                                        {sensorData?.humidity !== undefined ? (
                                            <>
                                                <span className={`${styles.value} ${dataUpdated ? styles.valueUpdate : ''}`}>{sensorData.humidity.toFixed(2)}</span>
                                                <span className={styles.unit}>%</span>
                                            </>
                                        ) : (
                                            <span className={styles.noData}>--</span>
                                        )}
                                    </div>
                                </div>

                                {/* Presión */}
                                <div className={`${styles.sensorCard} ${dataUpdated ? styles.cardPulse : ''}`}>
                                    <div className={styles.sensorCardHeader}>
                                        <SpeedIcon className={styles.sensorCardIcon} style={{ color: '#95a5a6' }} />
                                        <span className={styles.sensorCardLabel}>Presión</span>
                                        {getTrend(sensorData?.pressure, prevSensorData?.pressure) === 'up' && (
                                            <span className={styles.trendUp}>↑</span>
                                        )}
                                        {getTrend(sensorData?.pressure, prevSensorData?.pressure) === 'down' && (
                                            <span className={styles.trendDown}>↓</span>
                                        )}
                                    </div>
                                    <div className={styles.sensorCardValue}>
                                        {sensorData?.pressure !== undefined ? (
                                            <>
                                                <span className={`${styles.value} ${dataUpdated ? styles.valueUpdate : ''}`}>{sensorData.pressure.toFixed(2)}</span>
                                                <span className={styles.unit}>hPa</span>
                                            </>
                                        ) : (
                                            <span className={styles.noData}>--</span>
                                        )}
                                    </div>
                                </div>

                                {/* Luz */}
                                <div className={`${styles.sensorCard} ${dataUpdated ? styles.cardPulse : ''}`}>
                                    <div className={styles.sensorCardHeader}>
                                        <LightModeIcon className={styles.sensorCardIcon} style={{ color: '#f39c12' }} />
                                        <span className={styles.sensorCardLabel}>Luminosidad</span>
                                        {getTrend(sensorData?.light, prevSensorData?.light) === 'up' && (
                                            <span className={styles.trendUp}>↑</span>
                                        )}
                                        {getTrend(sensorData?.light, prevSensorData?.light) === 'down' && (
                                            <span className={styles.trendDown}>↓</span>
                                        )}
                                    </div>
                                    <div className={styles.sensorCardValue}>
                                        {sensorData?.light !== undefined ? (
                                            <>
                                                <span className={`${styles.value} ${dataUpdated ? styles.valueUpdate : ''}`}>{sensorData.light.toFixed(0)}</span>
                                                <span className={styles.unit}>lux</span>
                                            </>
                                        ) : (
                                            <span className={styles.noData}>--</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {sensorData?.timestamp && (
                                <div className={styles.sensorTimestamp}>
                                    Última actualización: {new Date(sensorData.timestamp).toLocaleString()}
                                </div>
                            )}

                            {mqttError && (
                                <div className={styles.mqttError}>
                                    ⚠️ Error de conexión: {mqttError}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Grid de información y control */}
                    <div className={styles.cardsGrid}>
                        {/* Información del dispositivo */}
                        <div className={styles.card}>
                            <div className={styles.cardHeaderDevice}>
                                <div className={styles.cardHeaderTitle}>
                                    <PhoneAndroidIcon className={styles.cardIcon} />
                                    <h3>Información del Dispositivo</h3>
                                </div>
                                <span className={`${styles.statusBadge} ${styles[selectedDevice?.estado || 'inactivo']}`}>
                                    {selectedDevice?.estado}
                                </span>
                            </div>
                            {selectedDevice && (
                                <div className={styles.deviceInfo}>
                                    <div className={styles.infoGrid}>
                                        <div className={styles.infoItem}>
                                            <label>ID Único:</label>
                                            <span className={styles.monoValue}>{selectedDevice.identificador_unico}</span>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <label>Nombre:</label>
                                            <span>{selectedDevice.nombre}</span>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <label>Tipo:</label>
                                            <span className={styles.badge}>
                                                {typeof selectedDevice.tipo === 'string' 
                                                    ? selectedDevice.tipo 
                                                    : selectedDevice.tipo.nombre}
                                            </span>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <label>Ubicación:</label>
                                            <span>{typeof selectedDevice.ubicacion === 'string' ? selectedDevice.ubicacion : (selectedDevice.ubicacion as { nombre: string }).nombre}</span>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <label>Descripción:</label>
                                            <span>{selectedDevice.descripcion || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Control MQTT */}
                        {selectedDevice && (
                            <div className={styles.card}>
                                <div className={styles.cardHeaderDevice}>
                                    <div className={styles.cardHeaderTitle}>
                                        <ScienceIcon className={styles.cardIcon} />
                                        <h3>Control MQTT</h3>
                                    </div>
                                    <div className={styles.deviceLabel}>
                                        {selectedDevice.nombre}
                                    </div>
                                </div>
                                <div className={styles.mqttControlContent}>
                                    <MqttControls deviceId={selectedDevice.id.toString()} />
                                </div>
                            </div>
                        )}

                        {/* Comandos disponibles */}
                        {!showFullPanel && (
                            <div className={styles.card}>
                                <div className={styles.cardHeaderDevice}>
                                    <div className={styles.cardHeaderTitle}>
                                        <SettingsIcon className={styles.cardIcon} />
                                        <h3>Comandos Disponibles</h3>
                                    </div>
                                    <div className={styles.cardHeaderActions}>
                                        <span className={styles.count}>{Array.isArray(availableCommands) ? availableCommands.length : 0}</span>
                                        <button 
                                            onClick={loadCommands} 
                                            className={styles.refreshSmallButton}
                                            disabled={commandsLoading}
                                            aria-label="Actualizar comandos"
                                        >
                                            <RefreshIcon className={commandsLoading ? styles.spinning : ''} />
                                        </button>
                                    </div>
                                </div>
                                <div className={styles.commandsList}>
                                    {commandsLoading ? (
                                        <div className={styles.commandsLoading}>
                                            <div className={styles.spinner}></div>
                                            <p>Cargando comandos...</p>
                                        </div>
                                    ) : availableCommands.length === 0 ? (
                                        <div className={styles.emptyCommands}>
                                            <SettingsIcon className={styles.emptyIcon} />
                                            <p>No hay comandos disponibles</p>
                                        </div>
                                    ) : (
                                        Array.isArray(availableCommands) && availableCommands.map((cmd, index) => (
                                            <div key={index} className={styles.commandItem}>
                                                <div className={styles.commandInfo}>
                                                    <strong>{cmd.command}</strong>
                                                    <p>{cmd.description}</p>
                                                </div>
                                                {cmd.params && Object.keys(cmd.params).length > 0 && (
                                                    <div className={styles.commandParams}>
                                                        <small>Parámetros:</small>
                                                        <code>{JSON.stringify(cmd.params, null, 2)}</code>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
