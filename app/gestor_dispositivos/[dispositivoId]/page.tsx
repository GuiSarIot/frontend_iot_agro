'use client'

import { useState, useEffect } from 'react'

import { useRouter, useParams } from 'next/navigation'

import AddCircleIcon from '@mui/icons-material/AddCircle'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DeleteIcon from '@mui/icons-material/Delete'
import DevicesIcon from '@mui/icons-material/Devices'
import PersonIcon from '@mui/icons-material/Person'
import SaveIcon from '@mui/icons-material/Save'
import SensorsIcon from '@mui/icons-material/Sensors'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dropdown } from 'primereact/dropdown'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import Swal from 'sweetalert2'

import { 
    dispositivosService, 
    type TipoDispositivo, 
    type Dispositivo,
    type SensorAsignado,
    usuariosService,
    type Usuario 
} from '@/app/services/api.service'
import { useAppContext } from '@/context/appContext'

import AsignarSensorModal from './components/AsignarSensorModal'
import tableStyles from './deviceEdit.module.css'
import styles from '../crear/crear.module.css'


// ---- Interfaces ----
interface FormData {
    nombre: string
    tipo: string
    identificador_unico: string
    estado: string
    ubicacion: string
    descripcion: string
}

interface FormErrors {
    nombre?: string
    tipo?: string
    identificador_unico?: string
    ubicacion?: string
}

// ---- Opciones por defecto (fallback) ----
const TIPOS_DISPOSITIVO_DEFAULT = [
    { label: 'Raspberry Pi', value: 'raspberry_pi' },
    { label: 'ESP32', value: 'esp32' },
    { label: 'Arduino', value: 'arduino' },
    { label: 'ESP8266', value: 'esp8266' },
    { label: 'Otro', value: 'otro' }
]

const ESTADOS = [
    { label: 'Activo', value: 'activo' },
    { label: 'Inactivo', value: 'inactivo' },
    { label: 'Mantenimiento', value: 'mantenimiento' }
]

// ---- Componente principal ----
export default function EditarDispositivoPage() {
    const router = useRouter()
    const params = useParams()
    const { showLoader } = useAppContext()
    const dispositivoId = params.dispositivoId as string

    const [loading, setLoading] = useState(false)
    const [loadingData, setLoadingData] = useState(true)
    const [tiposDispositivo, setTiposDispositivo] = useState<TipoDispositivo[]>([])
    const [formData, setFormData] = useState<FormData>({
        nombre: '',
        tipo: '',
        identificador_unico: '',
        estado: 'activo',
        ubicacion: '',
        descripcion: ''
    })
    const [originalData, setOriginalData] = useState<FormData | null>(null)
    const [errors, setErrors] = useState<FormErrors>({})
    
    // Estados para sensores y operadores
    const [dispositivo, setDispositivo] = useState<Dispositivo | null>(null)
    const [sensoresAsignados, setSensoresAsignados] = useState<SensorAsignado[]>([])
    const [showAsignarSensorModal, setShowAsignarSensorModal] = useState(false)
    const [operadores, setOperadores] = useState<Usuario[]>([])
    const [loadingSensorAction, setLoadingSensorAction] = useState(false)

    useEffect(() => {
        loadTipos()
        loadDispositivo()
        loadOperadores()
        // eslint-disable-next-line
    }, [dispositivoId])

    const loadTipos = async () => {
        try {
            const tipos = await dispositivosService.getTipos()
            setTiposDispositivo(tipos)
        } catch (error) {
            console.error('Error al cargar tipos:', error)
            setTiposDispositivo(TIPOS_DISPOSITIVO_DEFAULT)
        }
    }

    const loadDispositivo = async () => {
        setLoadingData(true)
        showLoader(true)

        try {
            const dispositivo = await dispositivosService.getById(Number(dispositivoId))
            
            const initialData: FormData = {
                nombre: dispositivo.nombre,
                tipo: dispositivo.tipo,
                identificador_unico: dispositivo.identificador_unico,
                estado: dispositivo.estado,
                ubicacion: dispositivo.ubicacion,
                descripcion: dispositivo.descripcion || ''
            }

            setFormData(initialData)
            setOriginalData(initialData)
            setDispositivo(dispositivo)
            setSensoresAsignados(dispositivo.sensores_asignados || [])
            showLoader(false)
            setLoadingData(false)

        } catch (error) {
            console.error('Error al cargar dispositivo:', error)
            showLoader(false)
            setLoadingData(false)
            Swal.fire({
                title: 'Error',
                text: error instanceof Error ? error.message : 'Error al cargar el dispositivo',
                icon: 'error',
                confirmButtonText: 'Ok'
            }).then(() => {
                router.push('/gestor_dispositivos')
            })
        }
    }

    const loadOperadores = async () => {
        try {
            const usuarios = await usuariosService.getAll()
            // Filtrar usuarios activos (puedes ajustar según tu lógica de roles)
            // Por ahora mostramos todos los usuarios activos
            const operadoresList = usuarios.filter(u => u.is_active)
            setOperadores(operadoresList)
        } catch (error) {
            console.error('Error al cargar operadores:', error)
        }
    }

    const handleAsignarSensor = async (sensorId: number, config: { intervalo?: number; umbral_alerta?: number }) => {
        setLoadingSensorAction(true)
        try {
            await dispositivosService.assignSensor(Number(dispositivoId), {
                sensor_id: sensorId,
                configuracion_json: config
            })

            Swal.fire({
                title: 'Éxito',
                text: 'Sensor asignado correctamente',
                icon: 'success',
                confirmButtonText: 'Ok'
            })

            // Recargar dispositivo para actualizar sensores
            await loadDispositivo()
            setShowAsignarSensorModal(false)
        } catch (error) {
            console.error('Error al asignar sensor:', error)
            Swal.fire({
                title: 'Error',
                text: error instanceof Error ? error.message : 'Error al asignar el sensor',
                icon: 'error',
                confirmButtonText: 'Ok'
            })
        } finally {
            setLoadingSensorAction(false)
        }
    }

    const handleRemoverSensor = async (sensorId: number, sensorNombre: string) => {
        const result = await Swal.fire({
            title: '¿Remover sensor?',
            text: `Se removerá el sensor "${sensorNombre}" del dispositivo`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'var(--error)',
            cancelButtonColor: 'var(--secondary)',
            confirmButtonText: 'Sí, remover',
            cancelButtonText: 'Cancelar'
        })

        if (result.isConfirmed) {
            try {
                await dispositivosService.removeSensor(Number(dispositivoId), sensorId)

                Swal.fire({
                    title: 'Éxito',
                    text: 'Sensor removido correctamente',
                    icon: 'success',
                    confirmButtonText: 'Ok'
                })

                // Recargar dispositivo
                await loadDispositivo()
            } catch (error) {
                console.error('Error al remover sensor:', error)
                Swal.fire({
                    title: 'Error',
                    text: error instanceof Error ? error.message : 'Error al remover el sensor',
                    icon: 'error',
                    confirmButtonText: 'Ok'
                })
            }
        }
    }

    const handleAsignarOperador = async (operadorId: number) => {
        try {
            await dispositivosService.assignOperator(Number(dispositivoId), {
                operador_id: operadorId
            })

            Swal.fire({
                title: 'Éxito',
                text: 'Operador asignado correctamente',
                icon: 'success',
                confirmButtonText: 'Ok'
            })

            // Recargar dispositivo
            await loadDispositivo()
        } catch (error) {
            console.error('Error al asignar operador:', error)
            Swal.fire({
                title: 'Error',
                text: error instanceof Error ? error.message : 'Error al asignar el operador',
                icon: 'error',
                confirmButtonText: 'Ok'
            })
        }
    }

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field as keyof FormErrors]) {
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

        if (!formData.tipo) {
            newErrors.tipo = 'El tipo de dispositivo es requerido'
        }

        if (!formData.identificador_unico.trim()) {
            newErrors.identificador_unico = 'El identificador único es requerido'
        } else if (formData.identificador_unico.trim().length < 3) {
            newErrors.identificador_unico = 'El identificador debe tener al menos 3 caracteres'
        }

        if (!formData.ubicacion.trim()) {
            newErrors.ubicacion = 'La ubicación es requerida'
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
                text: 'No has realizado ningún cambio',
                icon: 'info',
                confirmButtonText: 'Ok'
            })
            return
        }

        setLoading(true)

        try {
            // Construir objeto solo con campos modificados
            const updatedFields: Partial<typeof formData> = {}
            
            if (originalData) {
                if (formData.nombre !== originalData.nombre) {
                    updatedFields.nombre = formData.nombre.trim()
                }
                if (formData.tipo !== originalData.tipo) {
                    updatedFields.tipo = formData.tipo
                }
                if (formData.identificador_unico !== originalData.identificador_unico) {
                    updatedFields.identificador_unico = formData.identificador_unico.trim()
                }
                if (formData.estado !== originalData.estado) {
                    updatedFields.estado = formData.estado
                }
                if (formData.ubicacion !== originalData.ubicacion) {
                    updatedFields.ubicacion = formData.ubicacion.trim()
                }
                if (formData.descripcion !== originalData.descripcion) {
                    updatedFields.descripcion = formData.descripcion.trim() || undefined
                }
            }

            console.log('Campos a actualizar:', updatedFields)
            console.log('Datos originales:', originalData)
            console.log('Datos actuales:', formData)

            await dispositivosService.partialUpdate(Number(dispositivoId), updatedFields)

            setLoading(false)

            Swal.fire({
                title: 'Éxito',
                text: 'Dispositivo actualizado correctamente',
                icon: 'success',
                confirmButtonText: 'Ok'
            }).then(() => {
                router.push('/gestor_dispositivos')
            })

        } catch (error: unknown) {
            console.error('Error al actualizar dispositivo:', error)
            setLoading(false)
            
            // Mejorar el manejo de errores
            let errorMessage = 'Error inesperado al actualizar el dispositivo'
            
            if (error instanceof Error) {
                errorMessage = error.message
            } else if (typeof error === 'string') {
                errorMessage = error
            }
            
            Swal.fire({
                title: 'Error',
                text: errorMessage,
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
                    router.push('/gestor_dispositivos')
                }
            })
        } else {
            router.push('/gestor_dispositivos')
        }
    }

    if (loadingData) {
        return (
            <div className={styles.container}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    minHeight: '400px' 
                }}>
                    <p style={{ color: 'var(--neutral-500)' }}>Cargando datos del dispositivo...</p>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.contentLayout}>
                    {/* Panel del formulario */}
                    <div className={styles.formPanel}>
                        {/* Header dentro del panel */}
                        <div className={styles.header}>
                            <button type="button" onClick={handleCancel} className={styles.btnBack}>
                                <ArrowBackIcon />
                                <span>Volver</span>
                            </button>
                            
                            <div className={styles.titleSection}>
                                <h1 className={styles.pageTitle}>Editar dispositivo</h1>
                                <p className={styles.noteText}>
                                    <strong>Nota:</strong> Actualiza la información del dispositivo IoT registrado en el sistema.
                                </p>
                            </div>
                        </div>

                        <div className={styles.formSection}>
                            {/* Nombre del dispositivo */}
                            <div className={styles.formGroup}>
                                <label htmlFor="nombre" className={styles.formLabel}>
                                    Nombre del dispositivo*
                                    <span className={styles.labelSubtext}>Nombre descriptivo único</span>
                                </label>
                                <div className={styles.formInputWrapper}>
                                    <InputText
                                        id="nombre"
                                        value={formData.nombre}
                                        onChange={(e) => handleInputChange('nombre', e.target.value)}
                                        placeholder="Ej: Sensor Principal Invernadero 1"
                                        className={`${styles.formInput} ${errors.nombre ? styles.inputError : ''}`}
                                        disabled={loading}
                                    />
                                    {errors.nombre && (
                                        <span className={styles.errorMessage}>{errors.nombre}</span>
                                    )}
                                </div>
                            </div>

                            {/* Tipo de dispositivo */}
                            <div className={styles.formGroup}>
                                <label htmlFor="tipo" className={styles.formLabel}>
                                    Tipo de dispositivo*
                                    <span className={styles.labelSubtext}>Categoría del dispositivo</span>
                                </label>
                                <div className={styles.formInputWrapper}>
                                    <Dropdown
                                        id="tipo"
                                        value={formData.tipo}
                                        onChange={(e) => handleInputChange('tipo', e.value)}
                                        options={tiposDispositivo.length > 0 ? tiposDispositivo : TIPOS_DISPOSITIVO_DEFAULT}
                                        placeholder="Selecciona un tipo"
                                        className={`${styles.formSelect} ${errors.tipo ? styles.inputError : ''}`}
                                        disabled={loading}
                                    />
                                    {errors.tipo && (
                                        <span className={styles.errorMessage}>{errors.tipo}</span>
                                    )}
                                </div>
                            </div>

                            {/* Identificador único */}
                            <div className={styles.formGroup}>
                                <label htmlFor="identificador_unico" className={styles.formLabel}>
                                    Identificador único*
                                    <span className={styles.labelSubtext}>ID para identificación del dispositivo</span>
                                </label>
                                <div className={styles.formInputWrapper}>
                                    <InputText
                                        id="identificador_unico"
                                        value={formData.identificador_unico}
                                        onChange={(e) => handleInputChange('identificador_unico', e.target.value)}
                                        placeholder="Ej: ESP32-SALA-001"
                                        className={`${styles.formInput} ${errors.identificador_unico ? styles.inputError : ''}`}
                                        disabled={loading}
                                    />
                                    {errors.identificador_unico && (
                                        <span className={styles.errorMessage}>{errors.identificador_unico}</span>
                                    )}
                                </div>
                            </div>

                            {/* Estado */}
                            <div className={styles.formGroup}>
                                <label htmlFor="estado" className={styles.formLabel}>
                                    Estado
                                    <span className={styles.labelSubtext}>Estado actual del dispositivo</span>
                                </label>
                                <div className={styles.formInputWrapper}>
                                    <Dropdown
                                        id="estado"
                                        value={formData.estado}
                                        onChange={(e) => handleInputChange('estado', e.value)}
                                        options={ESTADOS}
                                        className={styles.formSelect}
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* Ubicación */}
                            <div className={styles.formGroup}>
                                <label htmlFor="ubicacion" className={styles.formLabel}>
                                    Ubicación*
                                    <span className={styles.labelSubtext}>Ubicación física del dispositivo</span>
                                </label>
                                <div className={styles.formInputWrapper}>
                                    <InputText
                                        id="ubicacion"
                                        value={formData.ubicacion}
                                        onChange={(e) => handleInputChange('ubicacion', e.target.value)}
                                        placeholder="Ej: Invernadero 1, Sector A"
                                        className={`${styles.formInput} ${errors.ubicacion ? styles.inputError : ''}`}
                                        disabled={loading}
                                    />
                                    {errors.ubicacion && (
                                        <span className={styles.errorMessage}>{errors.ubicacion}</span>
                                    )}
                                </div>
                            </div>

                            {/* Descripción */}
                            <div className={styles.formGroup}>
                                <label htmlFor="descripcion" className={styles.formLabel}>
                                    Descripción
                                    <span className={styles.labelSubtext}>Información adicional (opcional)</span>
                                </label>
                                <div className={styles.formInputWrapper}>
                                    <InputTextarea
                                        id="descripcion"
                                        value={formData.descripcion}
                                        onChange={(e) => handleInputChange('descripcion', e.target.value)}
                                        placeholder="Información adicional sobre el dispositivo..."
                                        rows={4}
                                        className={styles.formTextarea}
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Sección de Sensores */}
                        <div className={tableStyles.section}>
                            <div className={tableStyles.sectionHeader}>
                                <div className={tableStyles.sectionTitle}>
                                    <SensorsIcon style={{ fontSize: '24px' }} />
                                    <h3>Sensores asignados</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowAsignarSensorModal(true)}
                                    className={tableStyles.btnAddSensor}
                                >
                                    <AddCircleIcon />
                                    <span>Asignar sensor</span>
                                </button>
                            </div>

                            {sensoresAsignados.length > 0 ? (
                                <DataTable value={sensoresAsignados} className={tableStyles.table}>
                                    <Column field="sensor_nombre" header="Sensor" />
                                    <Column 
                                        field="configuracion_json" 
                                        header="Configuración"
                                        body={(rowData: SensorAsignado) => (
                                            <div className={tableStyles.configCell}>
                                                {rowData.configuracion_json?.intervalo && (
                                                    <span>Intervalo: {rowData.configuracion_json.intervalo}s</span>
                                                )}
                                                {rowData.configuracion_json?.umbral_alerta && (
                                                    <span>Umbral: {rowData.configuracion_json.umbral_alerta}</span>
                                                )}
                                            </div>
                                        )}
                                    />
                                    <Column 
                                        field="activo" 
                                        header="Estado"
                                        body={(rowData: SensorAsignado) => (
                                            <span className={rowData.activo ? tableStyles.statusActive : tableStyles.statusInactive}>
                                                {rowData.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                        )}
                                    />
                                    <Column 
                                        header="Acciones"
                                        body={(rowData: SensorAsignado) => (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoverSensor(rowData.sensor, rowData.sensor_nombre)}
                                                className={tableStyles.btnDelete}
                                                title="Remover sensor"
                                            >
                                                <DeleteIcon />
                                            </button>
                                        )}
                                    />
                                </DataTable>
                            ) : (
                                <div className={tableStyles.emptyState}>
                                    <SensorsIcon style={{ fontSize: '48px', opacity: 0.3 }} />
                                    <p>No hay sensores asignados a este dispositivo</p>
                                </div>
                            )}
                        </div>

                        {/* Sección de Operador */}
                        <div className={tableStyles.section}>
                            <div className={tableStyles.sectionHeader}>
                                <div className={tableStyles.sectionTitle}>
                                    <PersonIcon style={{ fontSize: '24px' }} />
                                    <h3>Operador asignado</h3>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="operador" className={styles.formLabel}>
                                    Asignar operador
                                    <span className={styles.labelSubtext}>Operador responsable del dispositivo</span>
                                </label>
                                <div className={styles.formInputWrapper}>
                                    <Dropdown
                                        id="operador"
                                        value={dispositivo?.operador_asignado || null}
                                        onChange={(e) => handleAsignarOperador(e.value)}
                                        options={operadores.map(op => ({
                                            label: `${op.first_name} ${op.last_name} (${op.username})`,
                                            value: op.id
                                        }))}
                                        placeholder="Selecciona un operador"
                                        className={styles.formSelect}
                                        showClear
                                    />
                                    {dispositivo?.operador_username && (
                                        <small className={tableStyles.currentOperator}>
                                            Operador actual: {dispositivo.operador_username}
                                        </small>
                                    )}
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
                            <div className={styles.deviceAvatar}>
                                <DevicesIcon style={{ fontSize: '48px', color: 'white' }} />
                            </div>
                            
                            <div className={styles.previewLabel}>DISPOSITIVO</div>
                            <h3 className={styles.previewTitle}>
                                {formData.nombre || 'Dispositivo'}
                            </h3>

                            <div className={styles.previewInfo}>
                                <div className={styles.previewItem}>
                                    <span className={styles.previewKey}>TIPO:</span>
                                    <span className={styles.previewValue}>
                                        {formData.tipo ? (tiposDispositivo.find(t => t.value === formData.tipo)?.label || formData.tipo) : 'No especificado'}
                                    </span>
                                </div>

                                <div className={styles.previewItem}>
                                    <span className={styles.previewKey}>IDENTIFICADOR:</span>
                                    <span className={styles.previewValue}>
                                        {formData.identificador_unico || 'No especificado'}
                                    </span>
                                </div>

                                <div className={styles.previewItem}>
                                    <span className={styles.previewKey}>UBICACIÓN:</span>
                                    <span className={styles.previewValue}>
                                        {formData.ubicacion || 'No especificado'}
                                    </span>
                                </div>

                                <div className={styles.previewItem}>
                                    <span className={styles.previewKey}>ESTADO:</span>
                                    <span className={styles.previewValue}>
                                        {ESTADOS.find(e => e.value === formData.estado)?.label || 'Activo'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            {/* Modal para asignar sensor */}
            <AsignarSensorModal
                visible={showAsignarSensorModal}
                onHide={() => setShowAsignarSensorModal(false)}
                onAssign={handleAsignarSensor}
                loading={loadingSensorAction}
            />
        </div>
    )
}
