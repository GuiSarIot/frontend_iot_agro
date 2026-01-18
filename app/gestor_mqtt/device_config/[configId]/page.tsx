'use client'

import { useState, useEffect, useCallback } from 'react'

import { useRouter, useParams } from 'next/navigation'

import CancelIcon from '@mui/icons-material/Cancel'
import SaveIcon from '@mui/icons-material/Save'
import SettingsIcon from '@mui/icons-material/Settings'
import { Checkbox } from 'primereact/checkbox'
import { Dropdown } from 'primereact/dropdown'
import { MultiSelect } from 'primereact/multiselect'
import Swal from 'sweetalert2'

import { useAccessLogger } from '@/app/hooks/useAccessLogger'
import { dispositivosService, type Dispositivo } from '@/app/services/api.service'
import { 
    mqttDeviceConfigService, 
    mqttBrokersService,
    mqttTopicsService,
    type UpdateMqttDeviceConfigDto,
    type MqttBroker,
    type MqttTopic
} from '@/app/services/mqtt.service'
import { useAppContext } from '@/context/appContext'

import styles from '../crear/createMqtt.module.css'

const EditDeviceConfigPage = () => {
    const router = useRouter()
    const params = useParams()
    const configId = parseInt(params.configId as string)
    const { showLoader } = useAppContext()

    // Registrar acceso automáticamente
    useAccessLogger({
        customModule: 'other',
        action: 'update'
    })

    // ---- Estados ----
    const [dispositivos, setDispositivos] = useState<Dispositivo[]>([])
    const [brokers, setBrokers] = useState<MqttBroker[]>([])
    const [publishTopics, setPublishTopics] = useState<MqttTopic[]>([])
    const [subscribeTopics, setSubscribeTopics] = useState<MqttTopic[]>([])
    const [loading, setLoading] = useState(true)

    const [formData, setFormData] = useState<UpdateMqttDeviceConfigDto>({
        dispositivo: 0,
        broker: 0,
        publish_topic: 0,
        subscribe_topics: [],
        qos: 1,
        retain: false,
        is_active: true
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    // ---- Opciones ----
    const qosOptions = [
        { label: 'QoS 0 - At most once', value: 0 },
        { label: 'QoS 1 - At least once', value: 1 },
        { label: 'QoS 2 - Exactly once', value: 2 }
    ]

    // ---- Cargar datos ----
    const loadInitialData = useCallback(async () => {
        try {
            showLoader(true)
            const [dispositivosRes, brokersRes, topicsRes, config] = await Promise.all([
                dispositivosService.getAll(),
                mqttBrokersService.getAll({ active_only: false }),
                mqttTopicsService.getAll(),
                mqttDeviceConfigService.getById(configId)
            ])

            setDispositivos(dispositivosRes.results)
            setBrokers(brokersRes.results)

            // Filtrar topics por tipo
            const allTopics = topicsRes.results
            setPublishTopics(allTopics.filter(t => t.tipo === 'publish' || t.tipo === 'both'))
            setSubscribeTopics(allTopics.filter(t => t.tipo === 'subscribe' || t.tipo === 'both'))

            // Cargar configuración existente
            setFormData({
                dispositivo: config.dispositivo,
                broker: config.broker,
                publish_topic: config.publish_topic,
                subscribe_topics: [],  // TODO: Cargar desde la API cuando esté disponible
                qos: config.qos,
                retain: false,  // TODO: Cargar desde la API
                is_active: config.is_active
            })

            setLoading(false)
        } catch (error) {
            console.error('Error cargando datos:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo cargar la configuración'
            }).then(() => {
                router.push('/gestor_mqtt/device_config')
            })
        } finally {
            showLoader(false)
        }
    }, [showLoader, configId, router])

    useEffect(() => {
        loadInitialData()
    }, [loadInitialData])

    // ---- Validación ----
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!formData.dispositivo) {
            newErrors.dispositivo = 'El dispositivo es requerido'
        }

        if (!formData.broker) {
            newErrors.broker = 'El broker es requerido'
        }

        if (!formData.publish_topic) {
            newErrors.publish_topic = 'El topic de publicación es requerido'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // ---- Manejadores ----
    const handleChange = (field: string, value: number | number[] | boolean) => {
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
            await mqttDeviceConfigService.update(configId, formData)

            Swal.fire({
                icon: 'success',
                title: 'Configuración actualizada',
                text: 'La configuración MQTT ha sido actualizada exitosamente',
                timer: 2000,
                showConfirmButton: false
            })

            router.push('/gestor_mqtt/device_config')
        } catch (error: unknown) {
            console.error('Error actualizando configuración:', error)
            const errorMessage = error instanceof Error && 'response' in error 
                ? (error as { response?: { data?: { detail?: string } } }).response?.data?.detail 
                : 'No se pudo actualizar la configuración'
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
        router.push('/gestor_mqtt/device_config')
    }

    if (loading) {
        return null
    }

    const dispositivoOptions = dispositivos.map(d => ({
        label: d.nombre,
        value: d.id
    }))

    const brokerOptions = brokers.map(b => ({
        label: `${b.nombre} (${b.host}:${b.port})`,
        value: b.id
    }))

    const publishTopicOptions = publishTopics.map(t => ({
        label: `${t.nombre} - ${t.topic_pattern}`,
        value: t.id
    }))

    const subscribeTopicOptions = subscribeTopics.map(t => ({
        label: `${t.nombre} - ${t.topic_pattern}`,
        value: t.id
    }))

    return (
        <div className={styles.contentLayout}>
            {/* Panel izquierdo - Formulario */}
            <div className={styles.formPanel}>
                <h2 className={styles.sectionTitle}>Editar Configuración MQTT</h2>
                <p className={styles.sectionDescription}>
                    <strong>Nota:</strong> Modifique la configuración MQTT del dispositivo
                </p>

                <form className={styles.createForm} onSubmit={handleSubmit}>
                    {/* Información Básica */}
                    <div className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>Información Básica</h2>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Dispositivo <span className={styles.required}>*</span>
                                </label>
                                <Dropdown
                                    value={formData.dispositivo}
                                    options={dispositivoOptions}
                                    onChange={(e) => handleChange('dispositivo', e.value)}
                                    placeholder="Seleccione un dispositivo"
                                    filter
                                    className={errors.dispositivo ? 'p-invalid' : ''}
                                />
                                {errors.dispositivo && (
                                    <small className={styles.error}>{errors.dispositivo}</small>
                                )}
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Broker MQTT <span className={styles.required}>*</span>
                                </label>
                                <Dropdown
                                    value={formData.broker}
                                    options={brokerOptions}
                                    onChange={(e) => handleChange('broker', e.value)}
                                    placeholder="Seleccione un broker"
                                    filter
                                    className={errors.broker ? 'p-invalid' : ''}
                                />
                                {errors.broker && (
                                    <small className={styles.error}>{errors.broker}</small>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            <span className={styles.labelText}>
                                Topic de Publicación<span className={styles.required}>*</span>
                            </span>
                            <span className={styles.labelSubtext}>Topic donde el dispositivo publicará sus datos</span>
                        </label>
                        <div>
                            <Dropdown
                                value={formData.publish_topic}
                                options={publishTopicOptions}
                                onChange={(e) => handleChange('publish_topic', e.value)}
                                placeholder="Seleccione topic de publicación"
                                filter
                                className={errors.publish_topic ? 'p-invalid' : ''}
                            />
                            {errors.publish_topic && (
                                <small className={styles.errorText}>{errors.publish_topic}</small>
                            )}
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            Topics de Suscripción
                            <span className={styles.labelSubtext}>Topics a los que el dispositivo se suscribirá (opcional)</span>
                        </label>
                        <MultiSelect
                            value={formData.subscribe_topics}
                            options={subscribeTopicOptions}
                            onChange={(e) => handleChange('subscribe_topics', e.value)}
                            placeholder="Seleccione topics de suscripción"
                            filter
                            display="chip"
                            style={{ width: '100%', maxWidth: '600px' }}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            <span className={styles.labelText}>
                                Quality of Service (QoS)<span className={styles.required}>*</span>
                            </span>
                            <span className={styles.labelSubtext}>Nivel de garantía de entrega</span>
                        </label>
                        <Dropdown
                            value={formData.qos}
                            options={qosOptions}
                            onChange={(e) => handleChange('qos', e.value)}
                            placeholder="Seleccione QoS"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            Opciones
                            <span className={styles.labelSubtext}>Configuración adicional</span>
                        </label>
                        <div className={styles.checkboxGroup}>
                            <Checkbox
                                inputId="retain"
                                checked={formData.retain}
                                onChange={(e) => handleChange('retain', e.checked)}
                            />
                            <label htmlFor="retain" className={styles.checkboxLabel}>
                                Retain (retener último mensaje en el broker)
                            </label>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            Estado
                            <span className={styles.labelSubtext}>Activar configuración inmediatamente</span>
                        </label>
                        <div className={styles.checkboxGroup}>
                            <Checkbox
                                inputId="is_active"
                                checked={formData.is_active}
                                onChange={(e) => handleChange('is_active', e.checked)}
                            />
                            <label htmlFor="is_active" className={styles.checkboxLabel}>
                                Activo
                            </label>
                        </div>
                    </div>

                    <div className={styles.formActions}>
                        <button type="button" onClick={handleCancel} className={styles.cancelButton}>
                            <CancelIcon /> Cancelar
                        </button>
                        <button type="submit" className={styles.submitButton}>
                            <SaveIcon /> Actualizar Configuración
                        </button>
                    </div>
                </form>
            </div>

            {/* Panel derecho - Preview */}
            <div className={styles.previewCard}>
                <div className={styles.previewHeader}>
                    <div className={styles.avatarContainer}>
                        <div className={styles.avatar}>
                            <SettingsIcon style={{ fontSize: '3rem' }} />
                        </div>
                    </div>
                    <p className={styles.previewTitle}>CONFIGURACIÓN MQTT</p>
                    <h3 className={styles.previewName}>
                        {formData.dispositivo 
                            ? dispositivos.find(d => d.id === formData.dispositivo)?.nombre || 'Configuración Dispositivo'
                            : 'Configuración Dispositivo'}
                    </h3>
                </div>

                <div className={styles.previewDetails}>
                    <div className={styles.previewRow}>
                        <span className={styles.previewLabel}>Broker:</span>
                        <span className={styles.previewValue}>
                            {formData.broker 
                                ? brokers.find(b => b.id === formData.broker)?.nombre || 'No especificado'
                                : 'No especificado'}
                        </span>
                    </div>
                    <div className={styles.previewRow}>
                        <span className={styles.previewLabel}>Topic Publicación:</span>
                        <span className={styles.previewValue}>
                            {formData.publish_topic 
                                ? publishTopics.find(t => t.id === formData.publish_topic)?.nombre || 'No especificado'
                                : 'No especificado'}
                        </span>
                    </div>
                    <div className={styles.previewRow}>
                        <span className={styles.previewLabel}>Topics Suscripción:</span>
                        <span className={styles.previewValue}>
                            {formData.subscribe_topics.length > 0 
                                ? `${formData.subscribe_topics.length} topic(s)` 
                                : 'Ninguno'}
                        </span>
                    </div>
                    <div className={styles.previewRow}>
                        <span className={styles.previewLabel}>QoS:</span>
                        <span className={styles.previewValue}>
                            {qosOptions.find(q => q.value === formData.qos)?.label || 'QoS 1'}
                        </span>
                    </div>
                    <div className={styles.previewRow}>
                        <span className={styles.previewLabel}>Retain:</span>
                        <span className={styles.previewValue}>
                            {formData.retain ? 'Habilitado' : 'Deshabilitado'}
                        </span>
                    </div>
                    <div className={styles.previewRow}>
                        <span className={styles.previewLabel}>Estado:</span>
                        <span className={styles.previewValue}>
                            {formData.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EditDeviceConfigPage
