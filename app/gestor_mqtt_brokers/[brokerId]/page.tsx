'use client'

import { useState, useEffect } from 'react'

import { useRouter, useParams } from 'next/navigation'

import CancelIcon from '@mui/icons-material/Cancel'
import RouterIcon from '@mui/icons-material/Router'
import SaveIcon from '@mui/icons-material/Save'
import { Checkbox } from 'primereact/checkbox'
import { Dropdown } from 'primereact/dropdown'
import { InputNumber } from 'primereact/inputnumber'
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import Swal from 'sweetalert2'

import { useAccessLogger } from '@/app/hooks/useAccessLogger'
import { mqttBrokersService, type UpdateMqttBrokerDto } from '@/app/services/mqtt.service'
import { useAppContext } from '@/context/appContext'

import styles from '../crear/createBroker.module.css'

const EditBrokerPage = () => {
    const router = useRouter()
    const params = useParams()
    const brokerId = parseInt(params.brokerId as string)
    const { showLoader } = useAppContext()

    // Registrar acceso automáticamente
    useAccessLogger({
        customModule: 'mqtt_brokers',
        action: 'update'
    })

    // ---- Estados ----
    const [formData, setFormData] = useState<UpdateMqttBrokerDto>({
        nombre: '',
        host: '',
        port: 1883,
        protocol: 'mqtt',
        username: '',
        password: '',
        keepalive: 60,
        clean_session: true,
        use_tls: false,
        is_active: true
    })

    const [errors, setErrors] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(true)

    // ---- Opciones ----
    const protocolOptions = [
        { label: 'MQTT', value: 'mqtt' },
        { label: 'MQTTS', value: 'mqtts' },
        { label: 'WebSocket', value: 'ws' },
        { label: 'WebSocket Secure', value: 'wss' }
    ]

    // ---- Cargar datos ----
    useEffect(() => {
        const loadBroker = async () => {
            try {
                showLoader(true)
                const broker = await mqttBrokersService.getById(brokerId)
                setFormData({
                    nombre: broker.nombre,
                    host: broker.host,
                    port: broker.port,
                    protocol: broker.protocol,
                    username: broker.username || '',
                    password: '',
                    keepalive: broker.keepalive,
                    clean_session: broker.clean_session,
                    use_tls: broker.use_tls,
                    is_active: broker.is_active
                })
                setLoading(false)
            } catch (error) {
                console.error('Error cargando broker:', error)
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo cargar el broker'
                }).then(() => {
                    router.push('/gestor_mqtt_brokers')
                })
            } finally {
                showLoader(false)
            }
        }
        
        loadBroker()
    }, [brokerId, showLoader, router])

    // ---- Validación ----
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!formData.nombre?.trim()) {
            newErrors.nombre = 'El nombre es requerido'
        }

        if (!formData.host?.trim()) {
            newErrors.host = 'El host es requerido'
        }

        if (!formData.port || formData.port < 1 || formData.port > 65535) {
            newErrors.port = 'Puerto debe estar entre 1 y 65535'
        }

        if (formData.keepalive === undefined || formData.keepalive < 0) {
            newErrors.keepalive = 'Keepalive debe ser mayor o igual a 0'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // ---- Manejadores ----
    const handleChange = (field: string, value: string | number | boolean | null | undefined) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[field]
                return newErrors
            })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            Swal.fire({
                icon: 'error',
                title: 'Errores en el formulario',
                text: 'Por favor, corrija los errores antes de continuar'
            })
            return
        }

        try {
            showLoader(true)
            
            // Si no se cambió la contraseña, no la enviamos
            const updateData = { ...formData }
            if (!updateData.password) {
                delete updateData.password
            }

            await mqttBrokersService.update(brokerId, updateData)

            Swal.fire({
                icon: 'success',
                title: 'Broker actualizado',
                text: 'El broker MQTT ha sido actualizado exitosamente',
                timer: 2000,
                showConfirmButton: false
            })

            router.push('/gestor_mqtt_brokers')
        } catch (error: unknown) {
            console.error('Error actualizando broker:', error)
            const errorMessage = error && typeof error === 'object' && 'response' in error 
                ? (error as { response?: { data?: { detail?: string } } }).response?.data?.detail 
                : undefined
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage || 'No se pudo actualizar el broker'
            })
        } finally {
            showLoader(false)
        }
    }

    const handleCancel = () => {
        router.push('/gestor_mqtt_brokers')
    }

    if (loading) {
        return null
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>
                    <RouterIcon sx={{ fontSize: 30 }} />
                    Editar Broker MQTT
                </h1>
                <p className={styles.subtitle}>
                    Modifique la configuración del broker MQTT
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className={styles.formCard}>
                    {/* Información Básica */}
                    <div className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>Información Básica</h2>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Nombre <span className={styles.required}>*</span>
                                </label>
                                <InputText
                                    value={formData.nombre}
                                    onChange={(e) => handleChange('nombre', e.target.value)}
                                    placeholder="Ej: EMQX Principal"
                                    className={errors.nombre ? 'p-invalid' : ''}
                                />
                                {errors.nombre && (
                                    <small className={styles.error}>{errors.nombre}</small>
                                )}
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Protocolo <span className={styles.required}>*</span>
                                </label>
                                <Dropdown
                                    value={formData.protocol}
                                    options={protocolOptions}
                                    onChange={(e) => handleChange('protocol', e.value)}
                                    placeholder="Seleccione protocolo"
                                />
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Host <span className={styles.required}>*</span>
                                </label>
                                <InputText
                                    value={formData.host}
                                    onChange={(e) => handleChange('host', e.target.value)}
                                    placeholder="Ej: broker.emqx.io"
                                    className={errors.host ? 'p-invalid' : ''}
                                />
                                {errors.host && (
                                    <small className={styles.error}>{errors.host}</small>
                                )}
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Puerto <span className={styles.required}>*</span>
                                </label>
                                <InputNumber
                                    value={formData.port}
                                    onValueChange={(e) => handleChange('port', e.value)}
                                    placeholder="1883"
                                    min={1}
                                    max={65535}
                                    className={errors.port ? 'p-invalid' : ''}
                                />
                                {errors.port && (
                                    <small className={styles.error}>{errors.port}</small>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Autenticación */}
                    <div className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>Autenticación</h2>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Usuario</label>
                                <InputText
                                    value={formData.username}
                                    onChange={(e) => handleChange('username', e.target.value)}
                                    placeholder="Opcional"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Contraseña</label>
                                <Password
                                    value={formData.password}
                                    onChange={(e) => handleChange('password', e.target.value)}
                                    placeholder="Dejar vacío para no cambiar"
                                    toggleMask
                                    feedback={false}
                                />
                                <small className={styles.helpText}>
                                    Dejar en blanco para mantener la contraseña actual
                                </small>
                            </div>
                        </div>
                    </div>

                    {/* Configuración Avanzada */}
                    <div className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>Configuración Avanzada</h2>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Keepalive (segundos) <span className={styles.required}>*</span>
                                </label>
                                <InputNumber
                                    value={formData.keepalive}
                                    onValueChange={(e) => handleChange('keepalive', e.value)}
                                    placeholder="60"
                                    min={0}
                                    className={errors.keepalive ? 'p-invalid' : ''}
                                />
                                {errors.keepalive && (
                                    <small className={styles.error}>{errors.keepalive}</small>
                                )}
                                <small className={styles.helpText}>
                                    Intervalo de keepalive en segundos
                                </small>
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <div className={styles.checkboxGroup}>
                                    <Checkbox
                                        inputId="clean_session"
                                        checked={formData.clean_session}
                                        onChange={(e) => handleChange('clean_session', e.checked)}
                                    />
                                    <label htmlFor="clean_session" className={styles.label}>
                                        Clean Session
                                    </label>
                                </div>
                                <small className={styles.helpText}>
                                    Iniciar sesión limpia al conectar
                                </small>
                            </div>

                            <div className={styles.formGroup}>
                                <div className={styles.checkboxGroup}>
                                    <Checkbox
                                        inputId="use_tls"
                                        checked={formData.use_tls}
                                        onChange={(e) => handleChange('use_tls', e.checked)}
                                    />
                                    <label htmlFor="use_tls" className={styles.label}>
                                        Usar TLS
                                    </label>
                                </div>
                                <small className={styles.helpText}>
                                    Habilitar conexión segura TLS/SSL
                                </small>
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <div className={styles.checkboxGroup}>
                                    <Checkbox
                                        inputId="is_active"
                                        checked={formData.is_active}
                                        onChange={(e) => handleChange('is_active', e.checked)}
                                    />
                                    <label htmlFor="is_active" className={styles.label}>
                                        Activo
                                    </label>
                                </div>
                                <small className={styles.helpText}>
                                    Estado del broker
                                </small>
                            </div>
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className={styles.actions}>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleCancel}
                        >
                            <CancelIcon /> Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary">
                            <SaveIcon /> Actualizar Broker
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default EditBrokerPage
