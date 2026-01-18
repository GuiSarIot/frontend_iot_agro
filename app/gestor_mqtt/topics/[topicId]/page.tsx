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

import styles from '../crear/createMqtt.module.css'

const EditTopicPage = () => {
    const router = useRouter()
    const params = useParams()
    const topicId = parseInt(params.topicId as string)
    const { showLoader } = useAppContext()

    // Registrar acceso automáticamente
    useAccessLogger({
        customModule: 'other',
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
                    router.push('/gestor_mqtt/topics')
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

            router.push('/gestor_mqtt/topics')
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
        router.push('/gestor_mqtt/topics')
    }

    if (loading) {
        return null
    }

    return (
        <div className={styles.contentLayout}>
            {/* Panel izquierdo - Formulario */}
            <div className={styles.formPanel}>
                <h2 className={styles.sectionTitle}>Editar Topic MQTT</h2>
                <p className={styles.sectionDescription}>
                    <strong>Nota:</strong> Modifique la configuración del topic MQTT
                </p>

                <form className={styles.createForm} onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            <span className={styles.labelText}>
                                Nombre<span className={styles.required}>*</span>
                            </span>
                            <span className={styles.labelSubtext}>Identificador del topic</span>
                        </label>
                        <div>
                            <InputText
                                value={formData.nombre}
                                onChange={(e) => handleChange('nombre', e.target.value)}
                                placeholder="Ej: Datos Sensores"
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
                                Tipo<span className={styles.required}>*</span>
                            </span>
                            <span className={styles.labelSubtext}>Tipo de topic MQTT</span>
                        </label>
                        <Dropdown
                            value={formData.tipo}
                            options={tipoOptions}
                            onChange={(e) => handleChange('tipo', e.value)}
                            placeholder="Seleccione tipo"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            <span className={styles.labelText}>
                                Patrón del Topic<span className={styles.required}>*</span>
                            </span>
                            <span className={styles.labelSubtext}>Use {'{device_id}'} como placeholder</span>
                        </label>
                        <div>
                            <InputText
                                value={formData.topic_pattern}
                                onChange={(e) => handleChange('topic_pattern', e.target.value)}
                                placeholder="Ej: iot/sensors/{device_id}/data"
                                className={errors.topic_pattern ? 'p-invalid' : ''}
                            />
                            {errors.topic_pattern && (
                                <small className={styles.errorText}>{errors.topic_pattern}</small>
                            )}
                        </div>
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
                            Descripción
                            <span className={styles.labelSubtext}>Descripción opcional del topic</span>
                        </label>
                        <InputTextarea
                            value={formData.descripcion}
                            onChange={(e) => handleChange('descripcion', e.target.value)}
                            placeholder="Descripción del topic..."
                            rows={3}
                            style={{ width: '100%', maxWidth: '600px' }}
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
                                Retain (retener último mensaje)
                            </label>
                        </div>
                    </div>

                    <div className={styles.formActions}>
                        <button type="button" onClick={handleCancel} className={styles.cancelButton}>
                            <CancelIcon /> Cancelar
                        </button>
                        <button type="submit" className={styles.submitButton}>
                            <SaveIcon /> Actualizar Topic
                        </button>
                    </div>
                </form>
            </div>

            {/* Panel derecho - Preview */}
            <div className={styles.previewCard}>
                <div className={styles.previewHeader}>
                    <div className={styles.avatarContainer}>
                        <div className={styles.avatar}>
                            <TopicIcon style={{ fontSize: '3rem' }} />
                        </div>
                    </div>
                    <p className={styles.previewTitle}>TOPIC MQTT</p>
                    <h3 className={styles.previewName}>
                        {formData.nombre || 'Nuevo Topic'}
                    </h3>
                </div>

                <div className={styles.previewDetails}>
                    <div className={styles.previewRow}>
                        <span className={styles.previewLabel}>Patrón:</span>
                        <span className={styles.previewValue}>
                            {formData.topic_pattern || 'No especificado'}
                        </span>
                    </div>
                    <div className={styles.previewRow}>
                        <span className={styles.previewLabel}>Tipo:</span>
                        <span className={styles.previewValue}>
                            {formData.tipo ? tipoOptions.find(t => t.value === formData.tipo)?.label : 'No especificado'}
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
                </div>
            </div>
        </div>
    )
}

export default EditTopicPage
