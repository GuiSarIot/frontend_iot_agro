'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import RouterIcon from '@mui/icons-material/Router'
import SaveIcon from '@mui/icons-material/Save'
import { Checkbox } from 'primereact/checkbox'
import { Dropdown } from 'primereact/dropdown'
import { InputNumber } from 'primereact/inputnumber'
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import Swal from 'sweetalert2'

import { useAccessLogger } from '@/app/hooks/useAccessLogger'
import { mqttBrokersService, type CreateMqttBrokerDto } from '@/app/services/mqtt.service'
import { useAppContext } from '@/context/appContext'

import styles from './createMqtt.module.css'

const CreateBrokerPage = () => {
    const router = useRouter()
    const { showLoader } = useAppContext()

    // Registrar acceso automáticamente
    useAccessLogger({
        customModule: 'mqtt_brokers',
        action: 'create'
    })

    // ---- Estados ----
    const [formData, setFormData] = useState<CreateMqttBrokerDto>({
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

    // ---- Opciones ----
    const protocolOptions = [
        { label: 'MQTT', value: 'mqtt' },
        { label: 'MQTTS', value: 'mqtts' },
        { label: 'WebSocket', value: 'ws' },
        { label: 'WebSocket Secure', value: 'wss' }
    ]

    // ---- Validación ----
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es requerido'
        }

        if (!formData.host.trim()) {
            newErrors.host = 'El host es requerido'
        }

        if (!formData.port || formData.port < 1 || formData.port > 65535) {
            newErrors.port = 'Puerto debe estar entre 1 y 65535'
        }

        if (!formData.keepalive || formData.keepalive < 0) {
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
            await mqttBrokersService.create(formData)

            Swal.fire({
                icon: 'success',
                title: 'Broker creado',
                text: 'El broker MQTT ha sido creado exitosamente',
                timer: 2000,
                showConfirmButton: false
            })

            router.push('/gestor_mqtt_brokers')
        } catch (error: unknown) {
            console.error('Error creando broker:', error)
            const errorMessage = error && typeof error === 'object' && 'response' in error
                ? (error.response as { data?: { detail?: string } })?.data?.detail || 'No se pudo crear el broker'
                : 'No se pudo crear el broker'
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage
            })
        } finally {
            showLoader(false)
        }
    }

    const handleCancel = () => {
        router.push('/gestor_mqtt_brokers')
    }

    return (
        <div className={styles.contentLayout}>
            {/* Panel izquierdo - Formulario */}
            <div className={styles.formPanel}>
                <h2 className={styles.sectionTitle}>Crear Broker MQTT</h2>
                <p className={styles.sectionDescription}>
                    <strong>Nota:</strong> Configure un nuevo broker MQTT para la gestión de dispositivos IoT.
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
                            Usuario
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
                            Contraseña
                            <span className={styles.labelSubtext}>Opcional para autenticación</span>
                        </label>
                        <Password
                            value={formData.password}
                            onChange={(e) => handleChange('password', e.target.value)}
                            placeholder="Opcional"
                            toggleMask
                            feedback={false}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            <span className={styles.labelText}>
                                Keepalive (segundos)<span className={styles.required}>*</span>
                            </span>
                            <span className={styles.labelSubtext}>Intervalo de keepalive</span>
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
                        <label className={styles.formLabel}>
                            Opciones
                            <span className={styles.labelSubtext}>Configuración adicional</span>
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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
                            <div className={styles.checkboxGroup}>
                                <Checkbox
                                    inputId="use_tls"
                                    checked={formData.use_tls}
                                    onChange={(e) => handleChange('use_tls', e.checked)}
                                />
                                <label htmlFor="use_tls" className={styles.checkboxLabel}>
                                    Usar TLS/SSL
                                </label>
                            </div>
                            <div className={styles.checkboxGroup}>
                                <Checkbox
                                    inputId="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => handleChange('is_active', e.checked)}
                                />
                                <label htmlFor="is_active" className={styles.checkboxLabel}>
                                    Activar inmediatamente
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className={styles.formActions}>
                        <button type="button" onClick={handleCancel} className={styles.cancelButton}>
                            Cancelar
                        </button>
                        <button type="submit" className={styles.submitButton}>
                            <SaveIcon /> Guardar Broker
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
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Host:</span>
                        <span className={styles.detailValue}>
                            {formData.host || 'No especificado'}
                        </span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Puerto:</span>
                        <span className={styles.detailValue}>
                            {formData.port || 1883}
                        </span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Protocolo:</span>
                        <span className={styles.detailValue}>
                            {formData.protocol.toUpperCase()}
                        </span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>TLS/SSL:</span>
                        <span className={styles.detailValue}>
                            {formData.use_tls ? 'Habilitado' : 'Deshabilitado'}
                        </span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Keepalive:</span>
                        <span className={styles.detailValue}>
                            {formData.keepalive || 60}s
                        </span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Estado:</span>
                        <span className={`${styles.statusBadge} ${formData.is_active ? styles.statusActive : styles.statusInactive}`}>
                            {formData.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateBrokerPage
