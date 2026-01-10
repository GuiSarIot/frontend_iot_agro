'use client'

import { useState, useEffect } from 'react'

import { useRouter, useParams } from 'next/navigation'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SaveIcon from '@mui/icons-material/Save'
import SensorsIcon from '@mui/icons-material/Sensors'
import { Dropdown } from 'primereact/dropdown'
import { InputNumber } from 'primereact/inputnumber'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import Swal from 'sweetalert2'

import { sensoresService, type TipoSensor, type UpdateSensorDto } from '@/app/services/api.service'
import { useAppContext } from '@/context/appContext'

import styles from '../crear/crear.module.css'

// ---- Interfaces ----
interface FormData {
    nombre: string
    tipo: string
    unidad_medida: string
    descripcion: string
    estado: string
    rango_min: number | null
    rango_max: number | null
}

interface FormErrors {
    nombre?: string
    tipo?: string
    unidad_medida?: string
    descripcion?: string
    estado?: string
    rango_min?: string
    rango_max?: string
}

// ---- Componente principal ----
export default function EditarSensorPage() {
    const router = useRouter()
    const params = useParams()
    const { showLoader } = useAppContext()
    const sensorId = params.sensorId as string

    const [loading, setLoading] = useState(false)
    const [loadingData, setLoadingData] = useState(true)
    const [tiposSensor, setTiposSensor] = useState<TipoSensor[]>([])
    const [formData, setFormData] = useState<FormData>({
        nombre: '',
        tipo: '',
        unidad_medida: '',
        descripcion: '',
        estado: 'Activo',
        rango_min: null,
        rango_max: null
    })
    const [originalData, setOriginalData] = useState<FormData | null>(null)
    const [errors, setErrors] = useState<FormErrors>({})

    const estadosOptions = [
        { label: 'Activo', value: 'Activo' },
        { label: 'Inactivo', value: 'Inactivo' },
        { label: 'Mantenimiento', value: 'Mantenimiento' }
    ]

    useEffect(() => {
        loadTipos()
        loadSensor()
        // eslint-disable-next-line
    }, [sensorId])

    const loadTipos = async () => {
        try {
            const tipos = await sensoresService.getTipos()
            setTiposSensor(tipos)
        } catch (error) {
            console.error('Error al cargar tipos:', error)
        }
    }

    const loadSensor = async () => {
        setLoadingData(true)
        showLoader(true)

        try {
            const sensor = await sensoresService.getById(Number(sensorId))
            
            const initialData: FormData = {
                nombre: sensor.nombre,
                tipo: sensor.tipo,
                unidad_medida: sensor.unidad_medida,
                descripcion: sensor.descripcion || '',
                estado: sensor.estado || 'Activo',
                rango_min: sensor.rango_min,
                rango_max: sensor.rango_max
            }

            setFormData(initialData)
            setOriginalData(initialData)
            showLoader(false)
            setLoadingData(false)

        } catch (error) {
            console.error('Error al cargar sensor:', error)
            showLoader(false)
            setLoadingData(false)
            Swal.fire({
                title: 'Error',
                text: error instanceof Error ? error.message : 'Error al cargar el sensor',
                icon: 'error',
                confirmButtonText: 'Ok'
            }).then(() => {
                router.push('/gestor_sensores')
            })
        }
    }

    const handleInputChange = (field: keyof FormData, value: string | number | null) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }))
        }
    }

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {}

        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es requerido'
        } else if (formData.nombre.trim().length < 3) {
            newErrors.nombre = 'El nombre debe tener al menos 3 caracteres'
        }

        if (!formData.tipo.trim()) {
            newErrors.tipo = 'El tipo es requerido'
        }

        if (!formData.unidad_medida.trim()) {
            newErrors.unidad_medida = 'La unidad de medida es requerida'
        }

        if (formData.rango_min !== null && formData.rango_max !== null) {
            if (formData.rango_min >= formData.rango_max) {
                newErrors.rango_max = 'El rango máximo debe ser mayor que el mínimo'
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const hasChanges = (): boolean => {
        if (!originalData) return false
        return JSON.stringify(formData) !== JSON.stringify(originalData)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            Swal.fire({
                title: 'Errores en el formulario',
                text: 'Por favor corrige los errores antes de continuar',
                icon: 'warning',
                confirmButtonText: 'Ok'
            })
            return
        }

        if (!hasChanges()) {
            Swal.fire({
                title: 'Sin cambios',
                text: 'No se han detectado cambios en el formulario',
                icon: 'info',
                confirmButtonText: 'Ok'
            })
            return
        }

        setLoading(true)

        try {
            const dataToSend: UpdateSensorDto = {
                nombre: formData.nombre.trim(),
                tipo: formData.tipo.trim(),
                unidad_medida: formData.unidad_medida.trim()
            }

            if (formData.descripcion.trim()) {
                dataToSend.descripcion = formData.descripcion.trim()
            }

            if (formData.estado) {
                dataToSend.estado = formData.estado.toLowerCase() as 'activo' | 'inactivo' | 'mantenimiento'
            }

            if (formData.rango_min !== null) {
                dataToSend.rango_min = formData.rango_min
            }

            if (formData.rango_max !== null) {
                dataToSend.rango_max = formData.rango_max
            }

            await sensoresService.update(Number(sensorId), dataToSend)

            setLoading(false)

            Swal.fire({
                title: 'Éxito',
                text: 'Sensor actualizado correctamente',
                icon: 'success',
                confirmButtonText: 'Ok'
            }).then(() => {
                router.push('/gestor_sensores')
            })

        } catch (error) {
            console.error('Error al actualizar sensor:', error)
            setLoading(false)
            Swal.fire({
                title: 'Error',
                text: error instanceof Error ? error.message : 'Error inesperado al actualizar el sensor',
                icon: 'error',
                confirmButtonText: 'Ok'
            })
        }
    }

    const handleCancel = () => {
        if (hasChanges()) {
            Swal.fire({
                title: '¿Descartar cambios?',
                text: 'Se perderán todos los cambios realizados',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: 'var(--error)',
                cancelButtonColor: 'var(--secondary)',
                confirmButtonText: 'Sí, descartar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    router.push('/gestor_sensores')
                }
            })
        } else {
            router.push('/gestor_sensores')
        }
    }

    if (loadingData) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '50vh',
                fontSize: '1.2rem',
                color: 'var(--text-secondary)'
            }}>
                Cargando sensor...
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.contentLayout}>
                {/* Panel del formulario */}
                <div className={styles.formPanel}>
                    {/* Header */}
                    <div className={styles.header}>
                        <button type="button" onClick={handleCancel} className={styles.btnBack}>
                            <ArrowBackIcon />
                            <span>Volver</span>
                        </button>
                        
                        <div className={styles.titleSection}>
                            <h1 className={styles.pageTitle}>Editar sensor</h1>
                            <p className={styles.noteText}>
                                <strong>Nota:</strong> Modifica la información del sensor según sea necesario.
                            </p>
                        </div>
                    </div>

                    <div className={styles.formSection}>
                        {/* Nombre del sensor */}
                        <div className={styles.formGroup}>
                            <label htmlFor="nombre" className={styles.formLabel}>
                                Nombre del sensor*
                                <span className={styles.labelSubtext}>Nombre descriptivo del sensor</span>
                            </label>
                            <div className={styles.formInputWrapper}>
                                <InputText
                                    id="nombre"
                                    value={formData.nombre}
                                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                                    placeholder="Ej: Sensor de Temperatura DHT22"
                                    className={`${styles.formInput} ${errors.nombre ? styles.inputError : ''}`}
                                    disabled={loading}
                                />
                                {errors.nombre && (
                                    <span className={styles.errorMessage}>{errors.nombre}</span>
                                )}
                            </div>
                        </div>

                        {/* Tipo de sensor */}
                        <div className={styles.formGroup}>
                            <label htmlFor="tipo" className={styles.formLabel}>
                                Tipo de sensor*
                                <span className={styles.labelSubtext}>Categoría o tipo del sensor</span>
                            </label>
                            <div className={styles.formInputWrapper}>
                                <Dropdown
                                    id="tipo"
                                    value={formData.tipo}
                                    onChange={(e) => handleInputChange('tipo', e.value)}
                                    options={tiposSensor.map(t => ({ label: t.label, value: t.value }))}
                                    placeholder="Seleccione un tipo"
                                    className={`${styles.formInput} ${errors.tipo ? styles.inputError : ''}`}
                                    disabled={loading}
                                    filter
                                    emptyMessage="No hay tipos disponibles"
                                />
                                {errors.tipo && (
                                    <span className={styles.errorMessage}>{errors.tipo}</span>
                                )}
                            </div>
                        </div>

                        {/* Unidad de medida */}
                        <div className={styles.formGroup}>
                            <label htmlFor="unidad_medida" className={styles.formLabel}>
                                Unidad de medida*
                                <span className={styles.labelSubtext}>Unidad en la que se mide</span>
                            </label>
                            <div className={styles.formInputWrapper}>
                                <InputText
                                    id="unidad_medida"
                                    value={formData.unidad_medida}
                                    onChange={(e) => handleInputChange('unidad_medida', e.target.value)}
                                    placeholder="Ej: °C, %, ppm, etc."
                                    className={`${styles.formInput} ${errors.unidad_medida ? styles.inputError : ''}`}
                                    disabled={loading}
                                />
                                {errors.unidad_medida && (
                                    <span className={styles.errorMessage}>{errors.unidad_medida}</span>
                                )}
                            </div>
                        </div>

                        {/* Descripción */}
                        <div className={styles.formGroup}>
                            <label htmlFor="descripcion" className={styles.formLabel}>
                                Descripción
                                <span className={styles.labelSubtext}>Información adicional del sensor (opcional)</span>
                            </label>
                            <div className={styles.formInputWrapper}>
                                <InputTextarea
                                    id="descripcion"
                                    value={formData.descripcion}
                                    onChange={(e) => handleInputChange('descripcion', e.target.value)}
                                    placeholder="Descripción del sensor..."
                                    rows={3}
                                    className={`${styles.formInput} ${errors.descripcion ? styles.inputError : ''}`}
                                    disabled={loading}
                                />
                                {errors.descripcion && (
                                    <span className={styles.errorMessage}>{errors.descripcion}</span>
                                )}
                            </div>
                        </div>

                        {/* Estado */}
                        <div className={styles.formGroup}>
                            <label htmlFor="estado" className={styles.formLabel}>
                                Estado
                                <span className={styles.labelSubtext}>Estado actual del sensor</span>
                            </label>
                            <div className={styles.formInputWrapper}>
                                <Dropdown
                                    id="estado"
                                    value={formData.estado}
                                    onChange={(e) => handleInputChange('estado', e.value)}
                                    options={estadosOptions}
                                    placeholder="Seleccione un estado"
                                    className={`${styles.formInput} ${errors.estado ? styles.inputError : ''}`}
                                    disabled={loading}
                                />
                                {errors.estado && (
                                    <span className={styles.errorMessage}>{errors.estado}</span>
                                )}
                            </div>
                        </div>

                        {/* Rango */}
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="rango_min" className={styles.formLabel}>
                                    Rango mínimo
                                    <span className={styles.labelSubtext}>Valor mínimo permitido (opcional)</span>
                                </label>
                                <div className={styles.formInputWrapper}>
                                    <InputNumber
                                        id="rango_min"
                                        value={formData.rango_min}
                                        onValueChange={(e) => handleInputChange('rango_min', e.value)}
                                        placeholder="0"
                                        className={`${styles.formInput} ${errors.rango_min ? styles.inputError : ''}`}
                                        disabled={loading}
                                        mode="decimal"
                                        minFractionDigits={0}
                                        maxFractionDigits={2}
                                    />
                                    {errors.rango_min && (
                                        <span className={styles.errorMessage}>{errors.rango_min}</span>
                                    )}
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="rango_max" className={styles.formLabel}>
                                    Rango máximo
                                    <span className={styles.labelSubtext}>Valor máximo permitido (opcional)</span>
                                </label>
                                <div className={styles.formInputWrapper}>
                                    <InputNumber
                                        id="rango_max"
                                        value={formData.rango_max}
                                        onValueChange={(e) => handleInputChange('rango_max', e.value)}
                                        placeholder="100"
                                        className={`${styles.formInput} ${errors.rango_max ? styles.inputError : ''}`}
                                        disabled={loading}
                                        mode="decimal"
                                        minFractionDigits={0}
                                        maxFractionDigits={2}
                                    />
                                    {errors.rango_max && (
                                        <span className={styles.errorMessage}>{errors.rango_max}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.formActions}>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className={styles.btnSecondary}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={styles.btnPrimary}
                            disabled={loading || !hasChanges()}
                        >
                            <SaveIcon className={styles.btnIcon} />
                            <span>{loading ? 'Guardando...' : 'Guardar cambios'}</span>
                        </button>
                    </div>
                </div>

                {/* Panel de vista previa */}
                <div className={styles.previewPanel}>
                    <div className={styles.previewCard}>
                        <div className={styles.sensorAvatar}>
                            <SensorsIcon style={{ fontSize: '48px', color: 'white' }} />
                        </div>
                        
                        <div className={styles.previewLabel}>SENSOR</div>
                        <h3 className={styles.previewTitle}>
                            {formData.nombre || 'Nuevo Sensor'}
                        </h3>

                        <div className={styles.previewInfo}>
                            <div className={styles.previewItem}>
                                <span className={styles.previewKey}>Tipo:</span>
                                <span className={styles.previewValue}>
                                    {formData.tipo ? 
                                        (tiposSensor.find(t => t.value === formData.tipo)?.label || formData.tipo) 
                                        : 'No especificado'}
                                </span>
                            </div>

                            <div className={styles.previewItem}>
                                <span className={styles.previewKey}>Unidad de medida:</span>
                                <span className={styles.previewValue}>
                                    {formData.unidad_medida || 'No especificado'}
                                </span>
                            </div>

                            <div className={styles.previewItem}>
                                <span className={styles.previewKey}>Estado:</span>
                                <span className={styles.previewValue}>
                                    {formData.estado || 'Activo'}
                                </span>
                            </div>

                            {(formData.rango_min !== null || formData.rango_max !== null) && (
                                <div className={styles.previewItem}>
                                    <span className={styles.previewKey}>Rango:</span>
                                    <span className={styles.previewValue}>
                                        {formData.rango_min ?? '∞'} - {formData.rango_max ?? '∞'}
                                    </span>
                                </div>
                            )}

                            {formData.descripcion && (
                                <div className={styles.previewItem}>
                                    <span className={styles.previewKey}>Descripción:</span>
                                    <span className={styles.previewValue}>
                                        {formData.descripcion}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </form>
    )
}
