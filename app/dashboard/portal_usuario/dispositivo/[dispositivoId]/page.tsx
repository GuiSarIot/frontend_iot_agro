'use client'

import { useState, useEffect, useMemo, useRef } from 'react'

import { useRouter } from 'next/navigation'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DevicesIcon from '@mui/icons-material/Devices'
import FilterListIcon from '@mui/icons-material/FilterList'
import RefreshIcon from '@mui/icons-material/Refresh'
import SensorsIcon from '@mui/icons-material/Sensors'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import { Calendar } from 'primereact/calendar'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import Swal from 'sweetalert2'

import { useAccessLogger } from '@/app/hooks/useAccessLogger'
import { useMqttSubscription } from '@/app/hooks/useMqttSubscription'
import { 
    dispositivosService, 
    lecturasService,
    type Dispositivo, 
    type Lectura,
    type Sensor
} from '@/app/services/api.service'
import AppLayout from '@/components/shared/layout/AppLayout'
import { MqttControls } from '@/components/shared/MqttControls/MqttControls'
import { useAppContext } from '@/context/appContext'

import styles from './detalleDispositivo.module.css'

interface DetalleDispositivoProps {
    params: {
        dispositivoId: string
    }
}

const DetalleDispositivoPage = ({ params }: DetalleDispositivoProps) => {
    const { changeTitle, showNavbar, appState, showLoader } = useAppContext()
    const { userInfo } = appState
    const router = useRouter()
    const dispositivoId = params.dispositivoId

    const [dispositivo, setDispositivo] = useState<Dispositivo | null>(null)
    const [lecturas, setLecturas] = useState<Lectura[]>([])
    const [loading, setLoading] = useState(false)
    const [fechaInicio, setFechaInicio] = useState<Date | null>(null)
    const [fechaFin, setFechaFin] = useState<Date | null>(null)
    const [mqttCredentialsState, setMqttCredentialsState] = useState<any>(null)
    const lastSavedReadingsRef = useRef<{[key: string]: number}>({})

    // Memorizar credenciales MQTT para evitar re-renders innecesarios
    const mqttCredentials = useMemo(() => {
        // Usar credenciales del state si están disponibles
        const creds = mqttCredentialsState || dispositivo?.mqtt_credentials
        
        if (!creds || !dispositivo?.mqtt_enabled) {
            return undefined
        }
        
        // Soportar ambos formatos: username/password y mqtt_username/mqtt_password
        const username = creds.username || creds.mqtt_username
        const password = creds.password || creds.mqtt_password || ''
        
        console.log('🔑 Mapeando credenciales MQTT:', { 
            original: creds, 
            mapped: { username, password: '***', broker_host: creds.broker_host, broker_port: creds.broker_port }
        })
        
        return {
            username,
            password,
            broker_host: creds.broker_host,
            broker_port: creds.broker_port
        }
    }, [mqttCredentialsState, dispositivo?.mqtt_credentials, dispositivo?.mqtt_enabled])

    // Hook MQTT para lecturas en tiempo real
    const { 
        sensorData, 
        isConnected
    } = useMqttSubscription(
        dispositivo?.identificador_unico,
        mqttCredentials,
        true,   // autoConnect
        false   // enableMockData
    )

    useAccessLogger({ 
        customModule: 'devices',
        action: 'view'
    })

    useEffect(() => {
        showLoader(true)
        showNavbar(window.innerWidth > 1380)
        changeTitle('Detalle de Dispositivo')
        cargarDatos()
        showLoader(false)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispositivoId])

    const cargarDatos = async () => {
        setLoading(true)
        try {
            // Cargar dispositivo
            const dispositivoData = await dispositivosService.getById(Number(dispositivoId))
            
            // Obtener ID del usuario actual desde localStorage
            let currentUserId: number | null = userInfo.id ? Number(userInfo.id) : null
            
            if (!currentUserId) {
                const userStr = localStorage.getItem('user')
                if (userStr) {
                    try {
                        const user = JSON.parse(userStr)
                        currentUserId = user.id || user.user_id || user.pk
                    } catch (e) {
                        console.error('Error parsing user from localStorage:', e)
                    }
                }
            }
            
            console.log('Current User ID:', currentUserId)
            console.log('Operador Asignado:', dispositivoData.operador_asignado)
            console.log('Propietario:', dispositivoData.propietario)
            
            // Verificar que el usuario tenga acceso al dispositivo
            if (currentUserId) {
                const esOperadorAsignado = Number(dispositivoData.operador_asignado) === Number(currentUserId)
                const esPropietario = dispositivoData.propietario?.id && Number(dispositivoData.propietario.id) === Number(currentUserId)
                
                if (!esOperadorAsignado && !esPropietario) {
                    console.log('Acceso denegado - No es operador ni propietario')
                    Swal.fire({
                        title: 'Acceso Denegado',
                        text: 'No tienes permiso para ver este dispositivo',
                        icon: 'error'
                    }).then(() => {
                        router.push('/dashboard/portal_usuario')
                    })
                    return
                }
            }

            console.log('📱 Dispositivo cargado:', dispositivoData)
            console.log('🔐 Credenciales MQTT:', dispositivoData.mqtt_credentials)
            
            setDispositivo(dispositivoData)

            // Cargar credenciales MQTT si no vienen en el dispositivo
            if (dispositivoData.mqtt_enabled && !dispositivoData.mqtt_credentials) {
                try {
                    console.log('🔄 Cargando credenciales MQTT desde endpoint...')
                    const credentials = await dispositivosService.getMqttCredentials(Number(dispositivoId))
                    console.log('✅ Credenciales MQTT cargadas:', credentials)
                    setMqttCredentialsState(credentials)
                } catch (err) {
                    console.error('❌ Error cargando credenciales MQTT:', err)
                }
            }

            // Cargar lecturas
            await cargarLecturas()
        } catch (error) {
            console.error('Error al cargar datos:', error)
            Swal.fire({
                title: 'Error',
                text: 'No se pudo cargar la información del dispositivo',
                icon: 'error'
            })
        } finally {
            setLoading(false)
        }
    }

    const cargarLecturas = async () => {
        try {
            const params: {
                dispositivo: number;
                ordering: string;
                page_size: number;
                fecha_inicio?: string;
                fecha_fin?: string;
            } = {
                dispositivo: Number(dispositivoId),
                ordering: '-fecha_lectura',
                page_size: 50
            }

            if (fechaInicio) {
                params.fecha_inicio = fechaInicio.toISOString()
            }
            if (fechaFin) {
                params.fecha_fin = fechaFin.toISOString()
            }

            const response = await lecturasService.getAll(params)
            setLecturas(response.results || [])
        } catch (error) {
            console.error('Error al cargar lecturas:', error)
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron cargar las lecturas',
                icon: 'error'
            })
        }
    }

    const aplicarFiltros = () => {
        cargarLecturas()
    }

    const limpiarFiltros = () => {
        setFechaInicio(null)
        setFechaFin(null)
        setTimeout(() => cargarLecturas(), 100)
    }

    // Función para guardar lectura en el backend
    const guardarLecturaMqtt = async (tipoSensor: string, valor: number, metadataAdicional?: any) => {
        if (!dispositivo) return

        try {
            console.log('🔍 Buscando sensor para tipo:', tipoSensor)
            console.log('📋 Sensores asignados:', dispositivo.sensores_asignados)

            // Encontrar el sensor correspondiente en los sensores asignados
            const sensorAsignado = dispositivo.sensores_asignados?.find(s => {
                const sensorObj = typeof s === 'object' ? s : null
                if (!sensorObj) return false
                
                // Acceder a sensor_detail que contiene la información del sensor
                const detail = sensorObj.sensor_detail || sensorObj
                
                console.log('🔬 Analizando sensor:', {
                    id: sensorObj.sensor || sensorObj.id,
                    nombre: detail.nombre || sensorObj.sensor_nombre,
                    tipo: detail.tipo,
                    modelo: detail.modelo
                })
                
                // Mapear tipo MQTT a tipo de sensor
                const tipoMap: {[key: string]: string[]} = {
                    'ph': ['ph', 'ph_sensor', 'acidez', 'acidity', 'otro'],
                    'temperature': ['temperature', 'temperatura', 'temp'],
                    'humidity': ['humidity', 'humedad'],
                    'pressure': ['pressure', 'presion', 'presión'],
                    'light': ['light', 'luz', 'luminosidad']
                }

                const tiposSensor = detail.tipo?.toLowerCase() || ''
                const nombreSensor = (detail.nombre || sensorObj.sensor_nombre || '')?.toLowerCase()
                const modeloSensor = (detail.modelo || '')?.toLowerCase()
                const posiblesNombres = tipoMap[tipoSensor] || [tipoSensor]
                
                // Buscar en tipo, nombre o modelo
                const encontrado = posiblesNombres.some(nombre => {
                    const nombreLower = nombre.toLowerCase()
                    return tiposSensor.includes(nombreLower) || 
                           nombreSensor.includes(nombreLower) ||
                           modeloSensor.includes(nombreLower)
                })
                
                console.log(`${encontrado ? '✅' : '❌'} Sensor ${detail.nombre || sensorObj.sensor_nombre}: ${encontrado ? 'coincide' : 'no coincide'}`)
                
                return encontrado
            })

            if (!sensorAsignado) {
                console.warn(`⚠️ No se encontró sensor asignado para tipo: ${tipoSensor}`)
                console.warn('💡 Sensores disponibles:', dispositivo.sensores_asignados?.map(s => {
                    if (typeof s === 'object') {
                        const detail = s.sensor_detail || s
                        const tipo = 'tipo' in detail ? detail.tipo : (s.sensor_detail?.tipo || 'N/A')
                        return `${detail.nombre || s.sensor_nombre} (${tipo})`
                    }
                    return s
                }))
                return
            }

            console.log('✅ Sensor encontrado:', sensorAsignado)

            // Obtener el ID del sensor (puede estar en sensor o en id)
            const sensorId = typeof sensorAsignado === 'object' 
                ? (sensorAsignado.sensor || sensorAsignado.id) 
                : sensorAsignado

            // Construir metadata (sin timestamp redundante, el backend ya lo asigna)
            const metadata = {
                fuente: 'mqtt',
                device_id: dispositivo.identificador_unico,
                ...metadataAdicional
            }

            // Payload para el backend con campos MQTT
            const payload = {
                dispositivo: dispositivo.id,
                sensor: sensorId,
                valor: valor,
                metadata_json: metadata,
                mqtt_message_id: `${dispositivo.identificador_unico}_${Date.now()}`,
                mqtt_qos: 1,
                mqtt_retained: false
            }

            console.log('💾 Guardando lectura MQTT:', payload)

            // Enviar al backend
            await lecturasService.create(payload)
            console.log('✅ Lectura guardada exitosamente')

            // Recargar lecturas para mostrar la nueva
            await cargarLecturas()
        } catch (error) {
            console.error('❌ Error guardando lectura MQTT:', error)
            // No mostrar error al usuario para no interrumpir el flujo
        }
    }

    // Efecto para guardar automáticamente las lecturas MQTT
    useEffect(() => {
        if (!sensorData || !isConnected || !dispositivo) return

        // Guardar cada tipo de sensor que tenga datos
        const sensoresConDatos: {tipo: string, valor: number, metadata?: any}[] = []

        if (sensorData.ph !== undefined) {
            sensoresConDatos.push({
                tipo: 'ph',
                valor: sensorData.ph,
                metadata: {
                    ...(sensorData as any).ph_voltage !== undefined && { ph_voltage: (sensorData as any).ph_voltage },
                    ...(sensorData as any).ph_adc !== undefined && { ph_adc: (sensorData as any).ph_adc }
                }
            })
        }

        if (sensorData.temperature !== undefined) {
            sensoresConDatos.push({
                tipo: 'temperature',
                valor: sensorData.temperature
            })
        }

        if (sensorData.humidity !== undefined) {
            sensoresConDatos.push({
                tipo: 'humidity',
                valor: sensorData.humidity
            })
        }

        if (sensorData.pressure !== undefined) {
            sensoresConDatos.push({
                tipo: 'pressure',
                valor: sensorData.pressure
            })
        }

        if (sensorData.light !== undefined) {
            sensoresConDatos.push({
                tipo: 'light',
                valor: sensorData.light
            })
        }

        // Guardar cada sensor, evitando duplicados usando timestamp
        sensoresConDatos.forEach(async ({ tipo, valor, metadata }) => {
            const key = `${tipo}_${valor}_${sensorData.timestamp}`
            const lastTimestamp = lastSavedReadingsRef.current[tipo]
            const currentTimestamp = sensorData.timestamp ? new Date(sensorData.timestamp).getTime() : Date.now()

            // Solo guardar si es una lectura nueva (diferente timestamp)
            if (!lastTimestamp || currentTimestamp > lastTimestamp) {
                lastSavedReadingsRef.current[tipo] = currentTimestamp
                await guardarLecturaMqtt(tipo, valor, metadata)
            }
        })
    }, [sensorData, isConnected, dispositivo])

    // Templates para las columnas
    const fechaTemplate = (rowData: Lectura) => {
        // Usar timestamp o fecha_lectura, el que esté disponible
        const fechaStr = rowData.timestamp || rowData.fecha_lectura
        
        if (!fechaStr) {
            return (
                <div className={styles.fechaInfo}>
                    <div className={styles.fecha}>Sin fecha</div>
                    <div className={styles.hora}>--</div>
                </div>
            )
        }
        
        const fecha = new Date(fechaStr)
        
        // Verificar si la fecha es válida
        if (isNaN(fecha.getTime())) {
            return (
                <div className={styles.fechaInfo}>
                    <div className={styles.fecha}>Fecha inválida</div>
                    <div className={styles.hora}>{fechaStr}</div>
                </div>
            )
        }
        
        return (
            <div className={styles.fechaInfo}>
                <div className={styles.fecha}>{fecha.toLocaleDateString('es-CO')}</div>
                <div className={styles.hora}>{fecha.toLocaleTimeString('es-CO')}</div>
            </div>
        )
    }

    const valorTemplate = (rowData: Lectura) => (
        <div className={styles.valorInfo}>
            <SensorsIcon fontSize="small" className={styles.sensorIcon} />
            <strong>{rowData.valor}</strong>
            <span className={styles.unidad}>{rowData.unidad}</span>
        </div>
    )

    const sensorTemplate = (rowData: Lectura) => (
        <div className={styles.sensorInfo}>
            {typeof rowData.sensor === 'object' && rowData.sensor !== null 
                ? (rowData.sensor as Sensor).nombre 
                : 'N/A'}
        </div>
    )

    return (
        <AppLayout showMainMenu={true}>
            <div className={styles.containerPage}>
                <div className={styles.mainCard}>
                    {/* Page Header */}
                    <div className={styles.pageHeader}>
                        <div className={styles.titleSection}>
                            <div className={styles.titleWrapper}>
                                <DevicesIcon className={styles.titleIcon} />
                                <h1 className={styles.pageTitle}>Detalle del Dispositivo</h1>
                            </div>
                            <p className={styles.pageSubtitle}>Control y monitoreo en tiempo real del dispositivo IoT</p>
                        </div>
                    </div>

                    {/* Card Header - Acciones */}
                    <div className={styles.cardHeader}>
                        <div className={styles.actionsLeft}>
                            <button 
                                onClick={() => router.push('/dashboard/portal_usuario')} 
                                className={styles.btnBack}
                            >
                                <ArrowBackIcon />
                                <span>Volver</span>
                            </button>
                        </div>
                        <button 
                            onClick={cargarDatos} 
                            className={styles.btnRefresh}
                            disabled={loading}
                        >
                            <RefreshIcon />
                            <span>Actualizar</span>
                        </button>
                    </div>

                    {dispositivo && (
                        <>
                            {/* Layout de dos columnas */}
                            <div className={styles.twoColumnLayout}>
                                {/* Columna izquierda - Información del dispositivo */}
                                <div className={styles.leftColumn}>
                                    <div className={styles.deviceCard}>
                                        <div className={styles.deviceCardHeader}>
                                            <DevicesIcon className={styles.deviceIcon} />
                                            <h2>Información del Dispositivo</h2>
                                            <span className={`${styles.statusBadge} ${dispositivo.estado === 'activo' ? styles.active : styles.inactive}`}>
                                                {dispositivo.estado?.toUpperCase() || 'INACTIVO'}
                                            </span>
                                        </div>
                                        <div className={styles.deviceInfo}>
                                            <div className={styles.infoItem}>
                                                <label>ID Único:</label>
                                                <span className={styles.infoValue}>{dispositivo.identificador_unico}</span>
                                            </div>
                                            <div className={styles.infoItem}>
                                                <label>Nombre:</label>
                                                <span className={styles.infoValue}>{dispositivo.nombre}</span>
                                            </div>
                                            <div className={styles.infoItem}>
                                                <label>Tipo:</label>
                                                <span className={styles.infoValue}>
                                                    {dispositivo.tipo_display || 'N/A'}
                                                </span>
                                            </div>
                                            <div className={styles.infoItem}>
                                                <label>Ubicación:</label>
                                                <span className={styles.infoValue}>{dispositivo.ubicacion || 'N/A'}</span>
                                            </div>
                                            <div className={styles.infoItem}>
                                                <label>Descripción:</label>
                                                <span className={styles.infoValue}>{dispositivo.descripcion || 'Sin descripción'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Columna derecha - Control MQTT */}
                                {dispositivo.mqtt_enabled && (
                                    <div className={styles.rightColumn}>
                                        
                                        <div className={styles.mqttCard}>
                                            <div className={styles.mqttCardHeader}>
                                                <SensorsIcon className={styles.mqttIcon} />
                                                <h2>Control MQTT</h2>
                                                <span className={styles.deviceName}>{dispositivo.nombre}</span>
                                            </div>
                                            <div className={styles.mqttContent}>
                                                <MqttControls deviceId={dispositivo.id.toString()} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Estadísticas */}
                            <div className={styles.statsCards}>
                                <div className={styles.statCard}>
                                    <TrendingUpIcon className={styles.statIcon} />
                                    <div className={styles.statInfo}>
                                        <span className={styles.statValue}>{lecturas.length}</span>
                                        <span className={styles.statLabel}>Lecturas Mostradas</span>
                                    </div>
                                </div>
                                <div className={styles.statCard}>
                                    <SensorsIcon className={styles.statIcon} />
                                    <div className={styles.statInfo}>
                                        <span className={styles.statValue}>
                                            {lecturas.length > 0 
                                                ? `${lecturas[0].valor} ${lecturas[0].sensor_unidad || lecturas[0].unidad || ''}`.trim()
                                                : 'N/A'
                                            }
                                        </span>
                                        <span className={styles.statLabel}>Última Lectura</span>
                                    </div>
                                </div>
                                {dispositivo.sensores_asignados && (
                                    <div className={styles.statCard}>
                                        <SensorsIcon className={styles.statIcon} />
                                        <div className={styles.statInfo}>
                                            <span className={styles.statValue}>{dispositivo.sensores_asignados.length}</span>
                                            <span className={styles.statLabel}>Sensores Asignados</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Sensores en Tiempo Real */}
                            {dispositivo.mqtt_enabled && dispositivo.sensores_asignados && dispositivo.sensores_asignados.length > 0 && (
                                <div className={styles.realtimeSection}>
                                    <div className={styles.realtimeSectionHeader}>
                                        <SensorsIcon />
                                        <h2>Lecturas en Tiempo Real</h2>
                                        <span className={`${styles.connectionBadge} ${isConnected ? styles.connected : styles.disconnected}`}>
                                            {isConnected ? '● Conectado' : '○ Desconectado'}
                                        </span>
                                    </div>
                                    <div className={styles.sensorsGrid}>
                                        {sensorData?.ph !== undefined && (
                                            <div className={styles.sensorRealtimeCard}>
                                                <div className={styles.sensorCardIcon} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                                    🧪
                                                </div>
                                                <div className={styles.sensorCardContent}>
                                                    <span className={styles.sensorCardLabel}>pH</span>
                                                    <span className={styles.sensorCardValue}>{sensorData.ph.toFixed(2)}</span>
                                                    <span className={styles.sensorCardUnit}>pH</span>
                                                </div>
                                                {sensorData.timestamp && (
                                                    <div className={styles.sensorCardTime}>
                                                        {new Date(sensorData.timestamp).toLocaleTimeString('es-CO')}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {sensorData?.temperature !== undefined && (
                                            <div className={styles.sensorRealtimeCard}>
                                                <div className={styles.sensorCardIcon} style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                                                    🌡️
                                                </div>
                                                <div className={styles.sensorCardContent}>
                                                    <span className={styles.sensorCardLabel}>Temperatura</span>
                                                    <span className={styles.sensorCardValue}>{sensorData.temperature.toFixed(1)}</span>
                                                    <span className={styles.sensorCardUnit}>°C</span>
                                                </div>
                                                {sensorData.timestamp && (
                                                    <div className={styles.sensorCardTime}>
                                                        {new Date(sensorData.timestamp).toLocaleTimeString('es-CO')}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {sensorData?.humidity !== undefined && (
                                            <div className={styles.sensorRealtimeCard}>
                                                <div className={styles.sensorCardIcon} style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                                                    💧
                                                </div>
                                                <div className={styles.sensorCardContent}>
                                                    <span className={styles.sensorCardLabel}>Humedad</span>
                                                    <span className={styles.sensorCardValue}>{sensorData.humidity.toFixed(1)}</span>
                                                    <span className={styles.sensorCardUnit}>%</span>
                                                </div>
                                                {sensorData.timestamp && (
                                                    <div className={styles.sensorCardTime}>
                                                        {new Date(sensorData.timestamp).toLocaleTimeString('es-CO')}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {sensorData?.pressure !== undefined && (
                                            <div className={styles.sensorRealtimeCard}>
                                                <div className={styles.sensorCardIcon} style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                                                    🌪️
                                                </div>
                                                <div className={styles.sensorCardContent}>
                                                    <span className={styles.sensorCardLabel}>Presión</span>
                                                    <span className={styles.sensorCardValue}>{sensorData.pressure.toFixed(0)}</span>
                                                    <span className={styles.sensorCardUnit}>hPa</span>
                                                </div>
                                                {sensorData.timestamp && (
                                                    <div className={styles.sensorCardTime}>
                                                        {new Date(sensorData.timestamp).toLocaleTimeString('es-CO')}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {sensorData?.light !== undefined && (
                                            <div className={styles.sensorRealtimeCard}>
                                                <div className={styles.sensorCardIcon} style={{ background: 'linear-gradient(135deg, #ffd89b 0%, #19547b 100%)' }}>
                                                    💡
                                                </div>
                                                <div className={styles.sensorCardContent}>
                                                    <span className={styles.sensorCardLabel}>Luminosidad</span>
                                                    <span className={styles.sensorCardValue}>{sensorData.light.toFixed(0)}</span>
                                                    <span className={styles.sensorCardUnit}>lux</span>
                                                </div>
                                                {sensorData.timestamp && (
                                                    <div className={styles.sensorCardTime}>
                                                        {new Date(sensorData.timestamp).toLocaleTimeString('es-CO')}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Filtros */}
                            <div className={styles.filtersBar}>
                                <div className={styles.filterGroup}>
                                    <label className={styles.filterLabel}>Fecha Inicio</label>
                                    <Calendar 
                                        value={fechaInicio} 
                                        onChange={(e) => setFechaInicio(e.value as Date)}
                                        showIcon
                                        dateFormat="dd/mm/yy"
                                        placeholder="Seleccionar fecha"
                                        className={styles.filterInput}
                                    />
                                </div>
                                <div className={styles.filterGroup}>
                                    <label className={styles.filterLabel}>Fecha Fin</label>
                                    <Calendar 
                                        value={fechaFin} 
                                        onChange={(e) => setFechaFin(e.value as Date)}
                                        showIcon
                                        dateFormat="dd/mm/yy"
                                        placeholder="Seleccionar fecha"
                                        className={styles.filterInput}
                                    />
                                </div>
                                <button onClick={aplicarFiltros} className={styles.btnRefresh}>
                                    <FilterListIcon />
                                    <span>Aplicar Filtros</span>
                                </button>
                                <button onClick={limpiarFiltros} className={styles.btnClearFilters}>
                                    Limpiar
                                </button>
                            </div>

                            {/* Tabla de lecturas */}
                            <div className={styles.tableContainer}>
                                <div className={styles.tableHeader}>
                                    <SensorsIcon className={styles.tableIcon} />
                                    <h2>Historial de Lecturas</h2>
                                </div>
                                <DataTable
                                    value={lecturas}
                                    loading={loading}
                                    paginator
                                    rows={20}
                                    emptyMessage="No hay lecturas registradas"
                                    className={styles.dataTable}
                                >
                                    <Column 
                                        header="Fecha y Hora" 
                                        body={fechaTemplate}
                                        sortable
                                    />
                                    <Column 
                                        header="Sensor" 
                                        body={sensorTemplate}
                                        sortable
                                    />
                                    <Column 
                                        header="Valor" 
                                        body={valorTemplate}
                                        sortable
                                    />
                                    <Column 
                                        header="Observaciones"
                                        body={(rowData: Lectura) => {
                                            if (!rowData.metadata_json) return 'N/A'
                                            if (typeof rowData.metadata_json === 'string') return rowData.metadata_json
                                            if (typeof rowData.metadata_json === 'object') {
                                                return JSON.stringify(rowData.metadata_json)
                                            }
                                            return 'N/A'
                                        }}
                                    />
                                </DataTable>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AppLayout>
    )
}

export default DetalleDispositivoPage