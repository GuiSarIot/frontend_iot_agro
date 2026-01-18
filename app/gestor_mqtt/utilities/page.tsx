'use client'

import { useState, useEffect } from 'react'

import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DevicesIcon from '@mui/icons-material/Devices'
import ErrorIcon from '@mui/icons-material/Error'
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck'
import OfflineBoltIcon from '@mui/icons-material/OfflineBolt'
import RefreshIcon from '@mui/icons-material/Refresh'
import RouterIcon from '@mui/icons-material/Router'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Swal from 'sweetalert2'

import { useAccessLogger } from '@/app/hooks/useAccessLogger'
import { mqttBrokersService, mqttUtilitiesService, type MqttBroker } from '@/app/services/mqtt.service'
import SaveRoute from '@/components/protectedRoute/saveRoute'
import { useAppContext } from '@/context/appContext'

import styles from './utilities.module.css'

// ---- Interfaces ----
interface InfoPage {
    title: string
    route: string
    role: string
}

interface DeviceStatus {
    total_mqtt_devices: number
    online: number
    offline: number
    error: number
    percentage_online: number
}

interface ConnectionTestResult {
    success: boolean
    message: string
    broker: {
        nombre: string
        host: string
        port: number
        protocol: string
    }
}

interface MqttUtilitiesPageProps {
    infoPage?: InfoPage
}

// ---- Componente principal ----
const MqttUtilitiesPage: React.FC<MqttUtilitiesPageProps> = ({
    infoPage = {
        title: 'Utilidades MQTT',
        route: '/gestor_mqtt/utilities',
        role: 'Utilidades MQTT'
    }
}) => {
    const { changeTitle, showNavbar, changeUserInfo, appState, showLoader } = useAppContext()
    const { userInfo } = appState

    // Registrar acceso al módulo
    useAccessLogger({ 
        customModule: 'mqtt',
        action: 'view'
    })

    const [isInitialized, setIsInitialized] = useState(false)
    const [brokers, setBrokers] = useState<MqttBroker[]>([])
    const [selectedBrokerId, setSelectedBrokerId] = useState<number | ''>('')
    const [timeout, setTimeout] = useState<number>(10)
    const [loadingBrokers, setLoadingBrokers] = useState(false)
    const [testingConnection, setTestingConnection] = useState(false)
    const [loadingDeviceStatus, setLoadingDeviceStatus] = useState(false)
    const [deviceStatus, setDeviceStatus] = useState<DeviceStatus | null>(null)
    const [connectionResult, setConnectionResult] = useState<ConnectionTestResult | null>(null)

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
            loadBrokers()
            loadDeviceStatus()
            showLoader(false)
        }
        // eslint-disable-next-line
    }, [])

    const loadBrokers = async () => {
        setLoadingBrokers(true)
        try {
            const response = await mqttBrokersService.getAll({ active_only: true })
            setBrokers(response.results)
        } catch (error) {
            console.error('Error al cargar brokers:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar los brokers MQTT'
            })
        } finally {
            setLoadingBrokers(false)
        }
    }

    const loadDeviceStatus = async () => {
        setLoadingDeviceStatus(true)
        try {
            const status = await mqttUtilitiesService.getDeviceStatus()
            setDeviceStatus(status)
        } catch (error) {
            console.error('Error al cargar estado de dispositivos:', error)
        } finally {
            setLoadingDeviceStatus(false)
        }
    }

    const handleTestConnection = async () => {
        if (!selectedBrokerId) {
            Swal.fire({
                icon: 'warning',
                title: 'Atención',
                text: 'Por favor selecciona un broker'
            })
            return
        }

        if (timeout < 1 || timeout > 60) {
            Swal.fire({
                icon: 'warning',
                title: 'Atención',
                text: 'El timeout debe estar entre 1 y 60 segundos'
            })
            return
        }

        setTestingConnection(true)
        setConnectionResult(null)

        try {
            const result = await mqttBrokersService.testConnection(
                selectedBrokerId as number, 
                timeout
            )
            setConnectionResult(result)

            if (result.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Conexión Exitosa',
                    text: result.message,
                    timer: 3000,
                    showConfirmButton: false
                })
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Conexión Fallida',
                    text: result.message
                })
            }
        } catch (error) {
            console.error('Error al probar conexión:', error)
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido al probar la conexión'
            
            setConnectionResult({
                success: false,
                message: errorMessage,
                broker: {
                    nombre: '',
                    host: '',
                    port: 0,
                    protocol: ''
                }
            })

            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage
            })
        } finally {
            setTestingConnection(false)
        }
    }

    const getStatusColor = (status: 'online' | 'offline' | 'error') => {
        switch (status) {
            case 'online':
                return '#4caf50'
            case 'offline':
                return '#ff9800'
            case 'error':
                return '#f44336'
            default:
                return '#9e9e9e'
        }
    }

    const getStatusIcon = (status: 'online' | 'offline' | 'error') => {
        switch (status) {
            case 'online':
                return <CheckCircleIcon sx={{ fontSize: 48, color: getStatusColor('online') }} />
            case 'offline':
                return <OfflineBoltIcon sx={{ fontSize: 48, color: getStatusColor('offline') }} />
            case 'error':
                return <ErrorIcon sx={{ fontSize: 48, color: getStatusColor('error') }} />
        }
    }

    return (
        <div className={styles.containerPage}>
            <div className={styles.mainCard}>
                {/* Page Header */}
                <div className={styles.pageHeader}>
                    <div className={styles.titleSection}>
                        <NetworkCheckIcon className={styles.titleIcon} />
                        <div>
                            <h1 className={styles.pageTitle}>Utilidades MQTT</h1>
                            <p className={styles.pageSubtitle}>
                                Prueba conexiones y verifica el estado de dispositivos MQTT
                            </p>
                        </div>
                    </div>
                </div>

                <div className={styles.contentArea}>
                    {/* Device Status Section */}
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>
                                <DevicesIcon /> Estado de Dispositivos MQTT
                            </h2>
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<RefreshIcon />}
                                onClick={loadDeviceStatus}
                                disabled={loadingDeviceStatus}
                            >
                                Actualizar
                            </Button>
                        </div>

                        {loadingDeviceStatus ? (
                            <div className={styles.loadingContainer}>
                                <CircularProgress />
                                <p>Cargando estado de dispositivos...</p>
                            </div>
                        ) : deviceStatus ? (
                            <div className={styles.statsGrid}>
                                <Card className={styles.statCard}>
                                    <CardContent>
                                        <div className={styles.statHeader}>
                                            <DevicesIcon sx={{ fontSize: 32, color: '#2196f3' }} />
                                            <span className={styles.statLabel}>Total Dispositivos</span>
                                        </div>
                                        <div className={styles.statValue}>
                                            {deviceStatus.total_mqtt_devices}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className={styles.statCard}>
                                    <CardContent>
                                        <div className={styles.statHeader}>
                                            {getStatusIcon('online')}
                                            <span className={styles.statLabel}>En Línea</span>
                                        </div>
                                        <div className={styles.statValue} style={{ color: getStatusColor('online') }}>
                                            {deviceStatus.online}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className={styles.statCard}>
                                    <CardContent>
                                        <div className={styles.statHeader}>
                                            {getStatusIcon('offline')}
                                            <span className={styles.statLabel}>Fuera de Línea</span>
                                        </div>
                                        <div className={styles.statValue} style={{ color: getStatusColor('offline') }}>
                                            {deviceStatus.offline}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className={styles.statCard}>
                                    <CardContent>
                                        <div className={styles.statHeader}>
                                            {getStatusIcon('error')}
                                            <span className={styles.statLabel}>Con Error</span>
                                        </div>
                                        <div className={styles.statValue} style={{ color: getStatusColor('error') }}>
                                            {deviceStatus.error}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className={`${styles.statCard} ${styles.statCardWide}`}>
                                    <CardContent>
                                        <div className={styles.statHeader}>
                                            <NetworkCheckIcon sx={{ fontSize: 32, color: '#4caf50' }} />
                                            <span className={styles.statLabel}>Disponibilidad</span>
                                        </div>
                                        <div className={styles.statValue} style={{ color: '#4caf50' }}>
                                            {deviceStatus.percentage_online.toFixed(1)}%
                                        </div>
                                        <div className={styles.progressBar}>
                                            <div 
                                                className={styles.progressFill}
                                                style={{ 
                                                    width: `${deviceStatus.percentage_online}%`,
                                                    backgroundColor: getStatusColor('online')
                                                }}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            <div className={styles.emptyState}>
                                <p>No se pudo cargar el estado de dispositivos</p>
                            </div>
                        )}
                    </section>

                    {/* Connection Test Section */}
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>
                                <RouterIcon /> Probar Conexión al Broker
                            </h2>
                        </div>

                        <Card className={styles.testCard}>
                            <CardContent>
                                <div className={styles.formGrid}>
                                    <FormControl fullWidth>
                                        <InputLabel id="broker-select-label">Broker MQTT</InputLabel>
                                        <Select
                                            labelId="broker-select-label"
                                            value={selectedBrokerId}
                                            label="Broker MQTT"
                                            onChange={(e) => setSelectedBrokerId(e.target.value as number)}
                                            disabled={loadingBrokers || testingConnection}
                                        >
                                            {loadingBrokers ? (
                                                <MenuItem value="">
                                                    <em>Cargando brokers...</em>
                                                </MenuItem>
                                            ) : brokers.length === 0 ? (
                                                <MenuItem value="">
                                                    <em>No hay brokers activos disponibles</em>
                                                </MenuItem>
                                            ) : (
                                                brokers.map((broker) => (
                                                    <MenuItem key={broker.id} value={broker.id}>
                                                        {broker.nombre} ({broker.host}:{broker.port})
                                                    </MenuItem>
                                                ))
                                            )}
                                        </Select>
                                    </FormControl>

                                    <TextField
                                        type="number"
                                        label="Timeout (segundos)"
                                        value={timeout}
                                        onChange={(e) => setTimeout(parseInt(e.target.value) || 10)}
                                        inputProps={{ min: 1, max: 60 }}
                                        disabled={testingConnection}
                                        fullWidth
                                    />
                                </div>

                                <div className={styles.buttonContainer}>
                                    <Button
                                        variant="contained"
                                        size="medium"
                                        startIcon={testingConnection ? <CircularProgress size={18} /> : <NetworkCheckIcon />}
                                        onClick={handleTestConnection}
                                        disabled={!selectedBrokerId || testingConnection || loadingBrokers}
                                        sx={{
                                            backgroundColor: '#10b981',
                                            '&:hover': {
                                                backgroundColor: '#059669'
                                            },
                                            '&:disabled': {
                                                backgroundColor: '#d1d5db'
                                            },
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            padding: '8px 20px',
                                            fontSize: '14px'
                                        }}
                                    >
                                        {testingConnection ? 'Probando conexión...' : 'Probar Conexión'}
                                    </Button>
                                </div>

                                {connectionResult && (
                                    <div className={`${styles.resultContainer} ${connectionResult.success ? styles.resultSuccess : styles.resultError}`}>
                                        <div className={styles.resultHeader}>
                                            {connectionResult.success ? (
                                                <CheckCircleIcon sx={{ fontSize: 32 }} />
                                            ) : (
                                                <ErrorIcon sx={{ fontSize: 32 }} />
                                            )}
                                            <h3>{connectionResult.success ? 'Conexión Exitosa' : 'Conexión Fallida'}</h3>
                                        </div>
                                        <p className={styles.resultMessage}>{connectionResult.message}</p>
                                        {connectionResult.broker && connectionResult.broker.nombre && (
                                            <div className={styles.brokerDetails}>
                                                <h4>Detalles del Broker:</h4>
                                                <ul>
                                                    <li><strong>Nombre:</strong> {connectionResult.broker.nombre}</li>
                                                    <li><strong>Host:</strong> {connectionResult.broker.host}</li>
                                                    <li><strong>Puerto:</strong> {connectionResult.broker.port}</li>
                                                    <li><strong>Protocolo:</strong> {connectionResult.broker.protocol}</li>
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </section>
                </div>
            </div>
        </div>
    )
}

export default MqttUtilitiesPage
