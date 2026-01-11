'use client'

import { useState, useEffect } from 'react'

import { useRouter, useParams } from 'next/navigation'

import { IconButton, InputAdornment, TextField } from '@mui/material'
import RouterIcon from '@mui/icons-material/Router'
import SaveIcon from '@mui/icons-material/Save'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { Checkbox } from 'primereact/checkbox'
import { Dropdown } from 'primereact/dropdown'
import { InputNumber } from 'primereact/inputnumber'
import { InputText } from 'primereact/inputtext'
import Swal from 'sweetalert2'

import { useAccessLogger } from '@/app/hooks/useAccessLogger'
import { mqttBrokersService, type UpdateMqttBrokerDto } from '@/app/services/mqtt.service'
import { useAppContext } from '@/context/appContext'

import styles from '../crear/createMqtt.module.css'

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
    const [showPassword, setShowPassword] = useState(false)

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
                    router.push('/gestor_mqtt/brokers')
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

            router.push('/gestor_mqtt/brokers')
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
        router.push('/gestor_mqtt/brokers')
    }

    if (loading) {
        return null
    }

    return (
        <div className={styles.contentLayout}>
            {/* Panel izquierdo - Formulario */}
            <div className={styles.formPanel}>
                <h2 className={styles.sectionTitle}>Editar Broker MQTT</h2>
                <p className={styles.sectionDescription}>
                    <strong>Nota:</strong> Modifique la configuración del broker MQTT
                </p>

                <form className={styles.createForm} onSubmit={handleSubmit}>
                    {/* Información Básica */}
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            <span className={styles.labelText}>
                                Nombre<span className={styles.required}>*</span>
                            </span>
                            <span className={styles.labelSubtext}>Identificador del broker</span>
                        </label>
                        <div>
                            <InputText
                                value={formData.nombre}
                                onChange={(e) => handleChange('nombre', e.target.value)}
                                placeholder="Ej: EMQX Principal"
                                className={errors.nombre ? 'p-invalid' : ''}
                            />
                            {errors.nombre && (
                                <small className={styles.errorText}>{errors.nombre}</small>
                            )}
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            <span className={styles.labelText}>
                                Protocolo<span className={styles.required}>*</span>
                            </span>
                            <span className={styles.labelSubtext}>Tipo de conexión MQTT</span>
                        </label>
                        <Dropdown
                            value={formData.protocol}
                            options={protocolOptions}
                            onChange={(e) => handleChange('protocol', e.value)}
                            placeholder="Seleccione protocolo"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            <span className={styles.labelText}>
                                Host<span className={styles.required}>*</span>
                            </span>
                            <span className={styles.labelSubtext}>Dirección del broker</span>
                        </label>
                        <div>
                            <InputText
                                value={formData.host}
                                onChange={(e) => handleChange('host', e.target.value)}
                                placeholder="Ej: broker.emqx.io"
                                className={errors.host ? 'p-invalid' : ''}
                            />
                            {errors.host && (
                                <small className={styles.errorText}>{errors.host}</small>
                            )}
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            <span className={styles.labelText}>
                                Puerto<span className={styles.required}>*</span>
                            </span>
                            <span className={styles.labelSubtext}>Puerto de conexión</span>
                        </label>
                        <div>
                            <InputNumber
                                value={formData.port}
                                onValueChange={(e) => handleChange('port', e.value)}
                                placeholder="1883"
                                min={1}
                                max={65535}
                                className={errors.port ? 'p-invalid' : ''}
                            />
                            {errors.port && (
                                <small className={styles.errorText}>{errors.port}</small>
                            )}
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            <span className={styles.labelText}>
                                Usuario
                            </span>
                            <span className={styles.labelSubtext}>Opcional para autenticación</span>
                        </label>
                        <InputText
                            value={formData.username}
                            onChange={(e) => handleChange('username', e.target.value)}
                            placeholder="Opcional"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            <span className={styles.labelText}>
                                Contraseña
                            </span>
                            <span className={styles.labelSubtext}>Dejar en blanco para mantener la contraseña actual</span>
                        </label>
                        <TextField
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={(e) => handleChange('password', e.target.value)}
                            placeholder="Opcional"
                            variant="outlined"
                            size="small"
                            fullWidth
                            sx={{ maxWidth: '600px' }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                            size="small"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            <span className={styles.labelText}>
                                Keepalive (segundos)<span className={styles.required}>*</span>
                            </span>
                            <span className={styles.labelSubtext}>Intervalo de keepalive en segundos</span>
                        </label>
                        <div>
                            <InputNumber
                                value={formData.keepalive}
                                onValueChange={(e) => handleChange('keepalive', e.value)}
                                placeholder="60"
                                min={0}
                                className={errors.keepalive ? 'p-invalid' : ''}
                            />
                            {errors.keepalive && (
                                <small className={styles.errorText}>{errors.keepalive}</small>
                            )}
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Opciones</label>
                        <div>
                            <div className={styles.checkboxGroup}>
                                <Checkbox
                                    inputId="clean_session"
                                    checked={formData.clean_session}
                                    onChange={(e) => handleChange('clean_session', e.checked)}
                                />
                                <label htmlFor="clean_session" className={styles.checkboxLabel}>
                                    Clean Session
                                </label>
                            </div>
                            <small className={styles.labelSubtext}>Iniciar sesión limpia al conectar</small>

                            <div className={styles.checkboxGroup} style={{ marginTop: '0.75rem' }}>
                                <Checkbox
                                    inputId="use_tls"
                                    checked={formData.use_tls}
                                    onChange={(e) => handleChange('use_tls', e.checked)}
                                />
                                <label htmlFor="use_tls" className={styles.checkboxLabel}>
                                    Usar TLS/SSL
                                </label>
                            </div>
                            <small className={styles.labelSubtext}>Habilitar conexión segura TLS/SSL</small>

                            <div className={styles.checkboxGroup} style={{ marginTop: '0.75rem' }}>
                                <Checkbox
                                    inputId="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => handleChange('is_active', e.checked)}
                                />
                                <label htmlFor="is_active" className={styles.checkboxLabel}>
                                    Activo
                                </label>
                            </div>
                            <small className={styles.labelSubtext}>Estado del broker</small>
                        </div>
                    </div>

                    <div className={styles.formActions}>
                        <button type="button" onClick={handleCancel} className={styles.cancelButton}>
                            Cancelar
                        </button>
                        <button type="submit" className={styles.submitButton}>
                            <SaveIcon /> Actualizar Broker
                        </button>
                    </div>
                </form>
            </div>

            {/* Panel derecho - Preview */}
            <div className={styles.previewCard}>
                <div className={styles.previewHeader}>
                    <div className={styles.avatarContainer}>
                        <div className={styles.avatar}>
                            <RouterIcon style={{ fontSize: '3rem' }} />
                        </div>
                    </div>
                    <p className={styles.previewTitle}>BROKER MQTT</p>
                    <h3 className={styles.previewName}>
                        {formData.nombre || 'Nuevo Broker'}
                    </h3>
                </div>

                <div className={styles.previewDetails}>
                    <div className={styles.previewRow}>
                        <span className={styles.previewLabel}>Host:</span>
                        <span className={styles.previewValue}>{formData.host || 'No especificado'}</span>
                    </div>
                    <div className={styles.previewRow}>
                        <span className={styles.previewLabel}>Puerto:</span>
                        <span className={styles.previewValue}>{formData.port || 1883}</span>
                    </div>
                    <div className={styles.previewRow}>
                        <span className={styles.previewLabel}>Protocolo:</span>
                        <span className={styles.previewValue}>{formData.protocol?.toUpperCase() || 'MQTT'}</span>
                    </div>
                    <div className={styles.previewRow}>
                        <span className={styles.previewLabel}>TLS/SSL:</span>
                        <span className={styles.previewValue}>{formData.use_tls ? 'Habilitado' : 'Deshabilitado'}</span>
                    </div>
                    <div className={styles.previewRow}>
                        <span className={styles.previewLabel}>Keepalive:</span>
                        <span className={styles.previewValue}>{formData.keepalive}s</span>
                    </div>
                    <div className={styles.previewRow}>
                        <span className={styles.previewLabel}>Estado:</span>
                        <span className={formData.is_active ? styles.statusActive : styles.statusInactive}>
                            {formData.is_active ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EditBrokerPage
