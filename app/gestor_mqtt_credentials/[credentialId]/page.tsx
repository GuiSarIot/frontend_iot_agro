'use client'

import { useState, useEffect, useCallback } from 'react'

import { useRouter, useParams } from 'next/navigation'

import CancelIcon from '@mui/icons-material/Cancel'
import LockIcon from '@mui/icons-material/Lock'
import SaveIcon from '@mui/icons-material/Save'
import { Checkbox } from 'primereact/checkbox'
import { Dropdown } from 'primereact/dropdown'
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import Swal from 'sweetalert2'

import { useAccessLogger } from '@/app/hooks/useAccessLogger'
import { dispositivosService, type Dispositivo } from '@/app/services/api.service'
import { mqttCredentialsService, type UpdateMqttCredentialDto } from '@/app/services/mqtt.service'
import { useAppContext } from '@/context/appContext'

import styles from '../crear/createCredential.module.css'

const EditCredentialPage = () => {
    const router = useRouter()
    const params = useParams()
    const credentialId = parseInt(params.credentialId as string)
    const { showLoader } = useAppContext()

    // Registrar acceso automáticamente
    useAccessLogger({
        customModule: 'mqtt_credentials',
        action: 'update'
    })

    // ---- Estados ----
    const [dispositivos, setDispositivos] = useState<Dispositivo[]>([])
    const [formData, setFormData] = useState<UpdateMqttCredentialDto>({
        dispositivo: 0,
        client_id: '',
        username: '',
        password: '',
        use_device_cert: false,
        is_active: true
    })

    const [errors, setErrors] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(true)

    // ---- Cargar datos ----
    const loadDispositivos = useCallback(async () => {
        try {
            const response = await dispositivosService.getAll()
            setDispositivos(response.results)
        } catch (error) {
            console.error('Error cargando dispositivos:', error)
        }
    }, [])

    const loadCredential = useCallback(async () => {
        try {
            showLoader(true)
            const credential = await mqttCredentialsService.getById(credentialId)
            setFormData({
                dispositivo: credential.dispositivo,
                client_id: credential.client_id,
                username: credential.username,
                password: '',
                use_device_cert: credential.use_device_cert,
                is_active: credential.is_active
            })
            setLoading(false)
        } catch (error) {
            console.error('Error cargando credencial:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo cargar la credencial'
            }).then(() => {
                router.push('/gestor_mqtt_credentials')
            })
        } finally {
            showLoader(false)
        }
    }, [credentialId, router, showLoader])

    useEffect(() => {
        loadDispositivos()
        loadCredential()
    }, [loadDispositivos, loadCredential])

    // ---- Validación ----
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!formData.dispositivo) {
            newErrors.dispositivo = 'El dispositivo es requerido'
        }

        if (!formData.client_id?.trim()) {
            newErrors.client_id = 'El Client ID es requerido'
        }

        if (!formData.username?.trim()) {
            newErrors.username = 'El username es requerido'
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
            
            // Si no se cambió la contraseña, no la enviamos
            const updateData = { ...formData }
            if (!updateData.password) {
                delete updateData.password
            }

            await mqttCredentialsService.update(credentialId, updateData)

            Swal.fire({
                icon: 'success',
                title: 'Credencial actualizada',
                text: 'La credencial MQTT ha sido actualizada exitosamente',
                timer: 2000,
                showConfirmButton: false
            })

            router.push('/gestor_mqtt_credentials')
        } catch (error: unknown) {
            console.error('Error actualizando credencial:', error)
            const errorMessage = error instanceof Error && 'response' in error 
                ? (error as { response?: { data?: { detail?: string } } }).response?.data?.detail 
                : 'No se pudo actualizar la credencial'
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
        router.push('/gestor_mqtt_credentials')
    }

    if (loading) {
        return null
    }

    const dispositivoOptions = dispositivos.map(d => ({
        label: d.nombre,
        value: d.id
    }))

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>
                    <LockIcon sx={{ fontSize: 30 }} />
                    Editar Credencial MQTT
                </h1>
                <p className={styles.subtitle}>
                    Modifique las credenciales de autenticación MQTT
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className={styles.formCard}>
                    {/* Información Básica */}
                    <div className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>Información Básica</h2>

                        <div className={styles.formRow}>
                            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
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
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Client ID <span className={styles.required}>*</span>
                                </label>
                                <InputText
                                    value={formData.client_id}
                                    onChange={(e) => handleChange('client_id', e.target.value)}
                                    placeholder="device_SENSOR-001"
                                    className={errors.client_id ? 'p-invalid' : ''}
                                />
                                {errors.client_id && (
                                    <small className={styles.error}>{errors.client_id}</small>
                                )}
                                <small className={styles.helpText}>
                                    Identificador único del cliente MQTT
                                </small>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Username <span className={styles.required}>*</span>
                                </label>
                                <InputText
                                    value={formData.username}
                                    onChange={(e) => handleChange('username', e.target.value)}
                                    placeholder="device_SENSOR-001"
                                    className={errors.username ? 'p-invalid' : ''}
                                />
                                {errors.username && (
                                    <small className={styles.error}>{errors.username}</small>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Autenticación */}
                    <div className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>Autenticación</h2>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <div className={styles.checkboxGroup}>
                                    <Checkbox
                                        inputId="use_device_cert"
                                        checked={formData.use_device_cert}
                                        onChange={(e) => handleChange('use_device_cert', e.checked)}
                                    />
                                    <label htmlFor="use_device_cert" className={styles.label}>
                                        Usar certificado de dispositivo
                                    </label>
                                </div>
                                <small className={styles.helpText}>
                                    Autenticación mediante certificado X.509
                                </small>
                            </div>
                        </div>

                        {!formData.use_device_cert && (
                            <div className={styles.formRow}>
                                <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                                    <label className={styles.label}>
                                        Contraseña
                                    </label>
                                    <Password
                                        value={formData.password}
                                        onChange={(e) => handleChange('password', e.target.value)}
                                        placeholder="Dejar vacío para no cambiar"
                                        toggleMask
                                    />
                                    <small className={styles.helpText}>
                                        Dejar en blanco para mantener la contraseña actual
                                    </small>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Estado */}
                    <div className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>Estado</h2>

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
                                    Estado de la credencial
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
                            <SaveIcon /> Actualizar Credencial
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default EditCredentialPage
