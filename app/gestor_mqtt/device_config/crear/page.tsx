'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'
import SettingsIcon from '@mui/icons-material/Settings'
import { Dropdown } from 'primereact/dropdown'
import { MultiSelect } from 'primereact/multiselect'
import { Checkbox } from 'primereact/checkbox'
import Swal from 'sweetalert2'

import { useAccessLogger } from '@/app/hooks/useAccessLogger'
import { 
    mqttDeviceConfigService, 
    mqttBrokersService,
    mqttTopicsService,
    type CreateMqttDeviceConfigDto,
    type MqttBroker,
    type MqttTopic
} from '@/app/services/mqtt.service'
import { dispositivosService, type Dispositivo } from '@/app/services/api.service'
import { useAppContext } from '@/context/appContext'

import styles from './createMqtt.module.css'

const CreateDeviceConfigPage = () => {
    const router = useRouter()
    const { showLoader } = useAppContext()

    // Registrar acceso automáticamente
    useAccessLogger({
        customModule: 'other',
        action: 'create'
    })

    // ---- Estados ----
    const [dispositivos, setDispositivos] = useState<Dispositivo[]>([])
    const [brokers, setBrokers] = useState<MqttBroker[]>([])
    const [publishTopics, setPublishTopics] = useState<MqttTopic[]>([])
    const [subscribeTopics, setSubscribeTopics] = useState<MqttTopic[]>([])

    const [formData, setFormData] = useState<CreateMqttDeviceConfigDto>({
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
    useEffect(() => {
        loadInitialData()
    }, [])

    const loadInitialData = useCallback(async () => {
        try {
            showLoader(true)
            const [dispositivosRes, brokersRes, topicsRes] = await Promise.all([
                dispositivosService.getAll(),
                mqttBrokersService.getAll({ active_only: true }),
                mqttTopicsService.getAll()
            ])

            setDispositivos(dispositivosRes.results)
            setBrokers(brokersRes.results)

            // Filtrar topics por tipo
            const allTopics = topicsRes.results
            setPublishTopics(allTopics.filter(t => t.tipo === 'publish' || t.tipo === 'both'))
            setSubscribeTopics(allTopics.filter(t => t.tipo === 'subscribe' || t.tipo === 'both'))
        } catch (error) {
            console.error('Error cargando datos:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar los datos necesarios'
            })
        } finally {
            showLoader(false)
        }
    }, [showLoader])

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
    const handleChange = (field: string, value: any) => {
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
            await mqttDeviceConfigService.create(formData)

            Swal.fire({
                icon: 'success',
                title: 'Configuración creada',
                text: 'La configuración MQTT ha sido creada exitosamente',
                timer: 2000,
                showConfirmButton: false
            })

            router.push('/gestor_mqtt/device_config')
        } catch (error: any) {
            console.error('Error creando configuración:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.detail || 'No se pudo crear la configuración'
            })
        } finally {
            showLoader(false)
        }
    }

    const handleCancel = () => {
        router.push('/gestor_mqtt/device_config')
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
                <h2 className={styles.sectionTitle}>Crear Configuración MQTT</h2>
                <p className={styles.sectionDescription}>
                    <strong>Nota:</strong> Configure la conexión MQTT para un dispositivo.
                </p>

                <form className={styles.createForm} onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            <span className={styles.labelText}>
                                Dispositivo<span className={styles.required}>*</span>
                            </span>
                            <span className={styles.labelSubtext}>Dispositivo a configurar</span>
                        </label>
                        <div>
                            <Dropdown
                                value={formData.dispositivo}
                                options={dispositivoOptions}
                                onChange={(e) => handleChange('dispositivo', e.value)}
                                placeholder="Seleccione un dispositivo"
                                filter
                                className={errors.dispositivo ? 'p-invalid' : ''}
                            />
                            {errors.dispositivo && (
                                <small className={styles.errorText}>{errors.dispositivo}</small>
                            )}
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            <span className={styles.labelText}>
                                Broker MQTT<span className={styles.required}>*</span>
                            </span>
                            <span className={styles.labelSubtext}>Servidor MQTT a utilizar</span>
                        </label>
                        <div>
                            <Dropdown
                                value={formData.broker}
                                options={brokerOptions}
                                onChange={(e) => handleChange('broker', e.value)}
                                placeholder="Seleccione un broker"
                                filter
                                className={errors.broker ? 'p-invalid' : ''}
                            />
                            {errors.broker && (
                                <small className={styles.errorText}>{errors.broker}</small>
                            )}
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            <span className={styles.labelText}>
                                Topic de Publicación<span className={styles.required}>*</span>
                            </span>
                            <span className={styles.labelSubtext}>Topic donde el dispositivo publicará datos</span>
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
                        <button type="submit" className={styles.submitButton}>
                            <SaveIcon /> Guardar Configuración
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
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Broker:</span>
                        <span className={styles.detailValue}>
                            {formData.broker 
                                ? brokers.find(b => b.id === formData.broker)?.nombre || 'No especificado'
                                : 'No especificado'}
                        </span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Topic Publicación:</span>
                        <span className={styles.detailValue}>
                            {formData.publish_topic 
                                ? publishTopics.find(t => t.id === formData.publish_topic)?.nombre || 'No especificado'
                                : 'No especificado'}
                        </span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Topics Suscripción:</span>
                        <span className={styles.detailValue}>
                            {formData.subscribe_topics.length > 0 
                                ? `${formData.subscribe_topics.length} topic(s)` 
                                : 'Ninguno'}
                        </span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>QoS:</span>
                        <span className={styles.detailValue}>
                            {qosOptions.find(q => q.value === formData.qos)?.label || 'QoS 1'}
                        </span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Retain:</span>
                        <span className={styles.detailValue}>
                            {formData.retain ? 'Habilitado' : 'Deshabilitado'}
                        </span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Estado:</span>
                        <span className={styles.detailValue}>
                            {formData.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateDeviceConfigPage
