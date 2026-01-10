'use client'

import { useState, useEffect } from 'react'

import { useRouter, useParams } from 'next/navigation'

import CancelIcon from '@mui/icons-material/Cancel'
import SaveIcon from '@mui/icons-material/Save'
import TopicIcon from '@mui/icons-material/Topic'
import { Checkbox } from 'primereact/checkbox'
import { Dropdown } from 'primereact/dropdown'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import Swal from 'sweetalert2'

import { useAccessLogger } from '@/app/hooks/useAccessLogger'
import { mqttTopicsService, type UpdateMqttTopicDto } from '@/app/services/mqtt.service'
import { useAppContext } from '@/context/appContext'

import styles from '../../gestor_mqtt_brokers/crear/createBroker.module.css'

const EditTopicPage = () => {
    const router = useRouter()
    const params = useParams()
    const topicId = parseInt(params.topicId as string)
    const { showLoader } = useAppContext()

    // Registrar acceso automáticamente
    useAccessLogger({
        customModule: 'mqtt_topics',
        action: 'update'
    })

    // ---- Estados ----
    const [formData, setFormData] = useState<UpdateMqttTopicDto>({
        nombre: '',
        topic_pattern: '',
        tipo: 'publish',
        qos: 1,
        retain: false,
        descripcion: ''
    })

    const [errors, setErrors] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(true)

    // ---- Opciones ----
    const tipoOptions = [
        { label: 'Publish', value: 'publish' },
        { label: 'Subscribe', value: 'subscribe' },
        { label: 'Both', value: 'both' }
    ]

    const qosOptions = [
        { label: 'QoS 0 - At most once', value: 0 },
        { label: 'QoS 1 - At least once', value: 1 },
        { label: 'QoS 2 - Exactly once', value: 2 }
    ]

    // ---- Cargar datos ----
    useEffect(() => {
        const loadTopic = async () => {
            try {
                showLoader(true)
                const topic = await mqttTopicsService.getById(topicId)
                setFormData({
                    nombre: topic.nombre,
                    topic_pattern: topic.topic_pattern,
                    tipo: topic.tipo,
                    qos: topic.qos,
                    retain: topic.retain,
                    descripcion: topic.descripcion || ''
                })
                setLoading(false)
            } catch (error) {
                console.error('Error cargando topic:', error)
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo cargar el topic'
                }).then(() => {
                    router.push('/gestor_mqtt_topics')
                })
            } finally {
                showLoader(false)
            }
        }

        loadTopic()
    }, [topicId, showLoader, router])

    // ---- Validación ----
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!formData.nombre?.trim()) {
            newErrors.nombre = 'El nombre es requerido'
        }

        if (!formData.topic_pattern?.trim()) {
            newErrors.topic_pattern = 'El patrón del topic es requerido'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // ---- Manejadores ----
    const handleChange = (field: string, value: string | number | boolean) => {
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
            await mqttTopicsService.update(topicId, formData)

            Swal.fire({
                icon: 'success',
                title: 'Topic actualizado',
                text: 'El topic MQTT ha sido actualizado exitosamente',
                timer: 2000,
                showConfirmButton: false
            })

            router.push('/gestor_mqtt_topics')
        } catch (error: unknown) {
            console.error('Error actualizando topic:', error)
            const errorMessage = error instanceof Error && 'response' in error
                ? (error as { response?: { data?: { detail?: string } } }).response?.data?.detail
                : undefined
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage || 'No se pudo actualizar el topic'
            })
        } finally {
            showLoader(false)
        }
    }

    const handleCancel = () => {
        router.push('/gestor_mqtt_topics')
    }

    if (loading) {
        return null
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>
                    <TopicIcon sx={{ fontSize: 30 }} />
                    Editar Topic MQTT
                </h1>
                <p className={styles.subtitle}>
                    Modifique la configuración del topic MQTT
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
                                    placeholder="Ej: Datos Sensores"
                                    className={errors.nombre ? 'p-invalid' : ''}
                                />
                                {errors.nombre && (
                                    <small className={styles.error}>{errors.nombre}</small>
                                )}
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Tipo <span className={styles.required}>*</span>
                                </label>
                                <Dropdown
                                    value={formData.tipo}
                                    options={tipoOptions}
                                    onChange={(e) => handleChange('tipo', e.value)}
                                    placeholder="Seleccione tipo"
                                />
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                                <label className={styles.label}>
                                    Patrón del Topic <span className={styles.required}>*</span>
                                </label>
                                <InputText
                                    value={formData.topic_pattern}
                                    onChange={(e) => handleChange('topic_pattern', e.target.value)}
                                    placeholder="Ej: iot/sensors/{device_id}/data"
                                    className={errors.topic_pattern ? 'p-invalid' : ''}
                                />
                                {errors.topic_pattern && (
                                    <small className={styles.error}>{errors.topic_pattern}</small>
                                )}
                                <small className={styles.helpText}>
                                    Use {'{device_id}'} como placeholder para el ID del dispositivo
                                </small>
                            </div>
                        </div>
                    </div>

                    {/* Configuración MQTT */}
                    <div className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>Configuración MQTT</h2>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Quality of Service (QoS) <span className={styles.required}>*</span>
                                </label>
                                <Dropdown
                                    value={formData.qos}
                                    options={qosOptions}
                                    onChange={(e) => handleChange('qos', e.value)}
                                    placeholder="Seleccione QoS"
                                />
                                <small className={styles.helpText}>
                                    Nivel de garantía de entrega del mensaje
                                </small>
                            </div>

                            <div className={styles.formGroup}>
                                <div className={styles.checkboxGroup}>
                                    <Checkbox
                                        inputId="retain"
                                        checked={formData.retain}
                                        onChange={(e) => handleChange('retain', e.checked)}
                                    />
                                    <label htmlFor="retain" className={styles.label}>
                                        Retain
                                    </label>
                                </div>
                                <small className={styles.helpText}>
                                    El broker retiene el último mensaje publicado
                                </small>
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                                <label className={styles.label}>Descripción</label>
                                <InputTextarea
                                    value={formData.descripcion}
                                    onChange={(e) => handleChange('descripcion', e.target.value)}
                                    placeholder="Descripción del topic..."
                                    rows={3}
                                />
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
                            <SaveIcon /> Actualizar Topic
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default EditTopicPage
