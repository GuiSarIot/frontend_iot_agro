'use client'

import { useState, useEffect, useCallback } from 'react'

import { useRouter, useParams } from 'next/navigation'

import CancelIcon from '@mui/icons-material/Cancel'
import PersonIcon from '@mui/icons-material/Person'
import SaveIcon from '@mui/icons-material/Save'
import { Checkbox } from 'primereact/checkbox'
import { Dropdown } from 'primereact/dropdown'
import { InputText } from 'primereact/inputtext'
import Swal from 'sweetalert2'

import { useAccessLogger } from '@/app/hooks/useAccessLogger'
import { dispositivosService, type Dispositivo } from '@/app/services/api.service'
import { emqxUsersService, type UpdateEmqxUserDto } from '@/app/services/mqtt.service'
import { useAppContext } from '@/context/appContext'

import styles from '../../gestor_mqtt_brokers/crear/createBroker.module.css'

const EditEmqxUserPage = () => {
    const router = useRouter()
    const params = useParams()
    const userId = parseInt(params.userId as string)
    const { showLoader } = useAppContext()

    // Registrar acceso automáticamente
    useAccessLogger({
        customModule: 'emqx_users',
        action: 'update'
    })

    // ---- Estados ----
    const [dispositivos, setDispositivos] = useState<Dispositivo[]>([])
    const [formData, setFormData] = useState<UpdateEmqxUserDto>({
        username: '',
        dispositivo: undefined,
        is_superuser: false
    })

    const [errors, setErrors] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(true)

    // ---- Cargar datos ----
    const loadInitialData = useCallback(async () => {
        try {
            showLoader(true)
            const [dispositivosRes, user] = await Promise.all([
                dispositivosService.getAll(),
                emqxUsersService.getById(userId)
            ])

            setDispositivos(dispositivosRes.results)
            setFormData({
                username: user.username,
                dispositivo: user.dispositivo,
                is_superuser: user.is_superuser
            })
            setLoading(false)
        } catch (error) {
            console.error('Error cargando datos:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo cargar el usuario'
            }).then(() => {
                router.push('/gestor_emqx_users')
            })
        } finally {
            showLoader(false)
        }
    }, [userId, showLoader, router])

    useEffect(() => {
        loadInitialData()
    }, [loadInitialData])

    // ---- Validación ----
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!formData.username?.trim()) {
            newErrors.username = 'El username es requerido'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // ---- Manejadores ----
    const handleChange = (field: string, value: string | number | boolean | undefined) => {
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
            await emqxUsersService.update(userId, formData)

            Swal.fire({
                icon: 'success',
                title: 'Usuario actualizado',
                text: 'El usuario EMQX ha sido actualizado exitosamente',
                timer: 2000,
                showConfirmButton: false
            })

            router.push('/gestor_emqx_users')
        } catch (error: unknown) {
            console.error('Error actualizando usuario:', error)
            const errorMessage = error instanceof Error && 'response' in error 
                ? (error as { response?: { data?: { detail?: string } } }).response?.data?.detail 
                : 'No se pudo actualizar el usuario'
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage || 'No se pudo actualizar el usuario'
            })
        } finally {
            showLoader(false)
        }
    }

    const handleCancel = () => {
        router.push('/gestor_emqx_users')
    }

    if (loading) {
        return null
    }

    const dispositivoOptions = [
        { label: 'Sin asignar', value: undefined },
        ...dispositivos.map(d => ({ label: d.nombre, value: d.id }))
    ]

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>
                    <PersonIcon sx={{ fontSize: 30 }} />
                    Editar Usuario EMQX
                </h1>
                <p className={styles.subtitle}>
                    Modifique la información del usuario MQTT
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
                                    Username <span className={styles.required}>*</span>
                                </label>
                                <InputText
                                    value={formData.username}
                                    onChange={(e) => handleChange('username', e.target.value)}
                                    placeholder="device_ESP32-001"
                                    className={errors.username ? 'p-invalid' : ''}
                                />
                                {errors.username && (
                                    <small className={styles.error}>{errors.username}</small>
                                )}
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                                <label className={styles.label}>Dispositivo</label>
                                <Dropdown
                                    value={formData.dispositivo}
                                    options={dispositivoOptions}
                                    onChange={(e) => handleChange('dispositivo', e.value)}
                                    placeholder="Seleccione un dispositivo (opcional)"
                                    filter
                                />
                                <small className={styles.helpText}>
                                    Vincular este usuario a un dispositivo específico
                                </small>
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <div className={styles.checkboxGroup}>
                                    <Checkbox
                                        inputId="is_superuser"
                                        checked={formData.is_superuser}
                                        onChange={(e) => handleChange('is_superuser', e.checked)}
                                    />
                                    <label htmlFor="is_superuser" className={styles.label}>
                                        Superusuario
                                    </label>
                                </div>
                                <small className={styles.helpText}>
                                    Otorgar permisos completos sobre todos los topics
                                </small>
                            </div>
                        </div>
                    </div>

                    {/* Nota sobre cambio de contraseña */}
                    <div className={styles.formSection}>
                        <div style={{ 
                            padding: '1rem', 
                            background: '#e7f3ff', 
                            borderLeft: '4px solid #0066cc',
                            borderRadius: '4px'
                        }}>
                            <strong>💡 Cambio de contraseña:</strong>
                            <p style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                                Para cambiar la contraseña del usuario, utilice el botón "Cambiar contraseña" 
                                en la lista de usuarios.
                            </p>
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
                            <SaveIcon /> Actualizar Usuario
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default EditEmqxUserPage
