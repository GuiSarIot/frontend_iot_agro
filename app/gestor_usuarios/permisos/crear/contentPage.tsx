'use client'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import CancelIcon from '@mui/icons-material/Cancel'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CodeIcon from '@mui/icons-material/Code'
import InfoIcon from '@mui/icons-material/Info'
import LockIcon from '@mui/icons-material/Lock'
import Swal from 'sweetalert2'

import GetRoute from '@/components/protectedRoute/getRoute'
import { useAppContext } from '@/context/appContext'

import styles from './contentPage.module.css'

// ---- Interfaces ----
interface InputValues {
    nombrePermiso: string
    codigoPermiso: string
    descripcionPermiso: string
    estadoPermiso: string
}

// ---- Componente principal ----
const ContentPage: React.FC = () => {
    const { changeTitle, showNavbar, showLoader } = useAppContext()
    const router = useRouter()

    const [inputValues, setInputValues] = useState<InputValues>({
        nombrePermiso: '',
        codigoPermiso: '',
        descripcionPermiso: '',
        estadoPermiso: 'Activo'
    })

    useEffect(() => {
        showLoader(true)
        showNavbar(window.innerWidth > 1380)
        changeTitle('Permisos - Crear')
        showLoader(false)
        // eslint-disable-next-line
    }, [])

    const onSuccessResponse = () => {
        Swal.fire({
            icon: 'success',
            title: 'Proceso exitoso',
            text: 'Se ha creado el permiso',
            timer: 2000,
            showConfirmButton: false,
            timerProgressBar: true
        }).then(() => {
            router.push('/gestor_usuarios/permisos')
        })
    }

    const onErrorResponse = (message: string) => {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message || 'Ha ocurrido un error, intenta nuevamente',
            confirmButtonText: 'Aceptar'
        })
    }

    const validateForm = () => {
        if (!inputValues.nombrePermiso || inputValues.nombrePermiso.trim() === '') {
            Swal.fire({
                icon: 'warning',
                title: 'Error en las validaciones',
                text: 'El nombre del permiso es obligatorio',
                confirmButtonText: 'Aceptar'
            })
            return false
        }

        if (!inputValues.codigoPermiso || inputValues.codigoPermiso.trim() === '') {
            Swal.fire({
                icon: 'warning',
                title: 'Error en las validaciones',
                text: 'El código del permiso es obligatorio',
                confirmButtonText: 'Aceptar'
            })
            return false
        }

        // Validar formato del código (letras, números y guiones bajos)
        const codigoRegex = /^[a-zA-Z0-9_]+$/
        if (!codigoRegex.test(inputValues.codigoPermiso)) {
            Swal.fire({
                icon: 'warning',
                title: 'Error en las validaciones',
                text: 'El código debe contener solo letras, números y guiones bajos',
                confirmButtonText: 'Aceptar'
            })
            return false
        }

        if (!inputValues.descripcionPermiso || inputValues.descripcionPermiso.trim() === '') {
            Swal.fire({
                icon: 'warning',
                title: 'Error en las validaciones',
                text: 'La descripción es obligatoria',
                confirmButtonText: 'Aceptar'
            })
            return false
        }

        if (inputValues.descripcionPermiso.length < 10) {
            Swal.fire({
                icon: 'warning',
                title: 'Error en las validaciones',
                text: 'La descripción debe tener al menos 10 caracteres',
                confirmButtonText: 'Aceptar'
            })
            return false
        }
        
        return true
    }

    const prepareDataAndSubmit = async () => {
        const dataToSend = {
            nombre: inputValues.nombrePermiso,
            codigo: inputValues.codigoPermiso,
            descripcion: inputValues.descripcionPermiso
        }

        Swal.fire({
            title: 'Cargando...',
            text: 'Espere un momento por favor',
            icon: 'info',
            showConfirmButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
            allowEnterKey: false,
            didOpen: () => {
                Swal.showLoading()
            },
        })

        try {
            const { token } = await GetRoute()

            if (!token || token === 'false' || token.trim() === '') {
                Swal.close()
                onErrorResponse('Token inválido o expirado')
                return
            }

            const request = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/permisos/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(dataToSend),
            })

            const jsonResponse = await request.json()

            Swal.close()

            if (!request.ok) {
                const errorMessage = jsonResponse.detail || jsonResponse.message || 'Error al crear el permiso'
                onErrorResponse(errorMessage)
                return
            }

            if (jsonResponse.status === 'error') {
                onErrorResponse(jsonResponse.message || 'Error al crear el permiso')
                return
            }

            onSuccessResponse()
        } catch (error) {
            Swal.close()
            console.error('Error en la solicitud:', error)
            onErrorResponse('Error al realizar la solicitud')
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        
        if (!validateForm()) {
            return
        }

        await prepareDataAndSubmit()
    }

    // Función para reemplazar espacios por guiones bajos
    const handleCodigoChange = (value: string) => {
        const formattedValue = value.replace(/\s+/g, '_')
        setInputValues({ ...inputValues, codigoPermiso: formattedValue })
    }

    return (
        <div className={styles.contentLayout}>
            {/* Panel izquierdo - Formulario */}
            <div className={styles.formPanel}>
                <h2 className={styles.sectionTitle}>Crear nuevo permiso</h2>
                <p className={styles.sectionDescription}>
                    <strong>Nota:</strong> Configure el código, nombre y descripción del permiso.
                </p>

                <form className={styles.createForm} onSubmit={handleSubmit}>
                    {/* Nombre del permiso */}
                    <div className={styles.formGroup}>
                        <label htmlFor="nombrePermiso" className={styles.formLabel}>
                            Nombre del permiso*
                            <span className={styles.labelSubtext}>Nombre descriptivo del permiso</span>
                        </label>
                        <input
                            type="text"
                            id="nombrePermiso"
                            required
                            className={styles.formInput}
                            value={inputValues.nombrePermiso}
                            onChange={(e) => setInputValues({ ...inputValues, nombrePermiso: e.target.value })}
                            placeholder="Ej: Ver usuarios"
                        />
                    </div>

                    {/* Código del permiso */}
                    <div className={styles.formGroup}>
                        <label htmlFor="codigoPermiso" className={styles.formLabel}>
                            Código*
                            <span className={styles.labelSubtext}>Código único (letras, números, guiones bajos)</span>
                        </label>
                        <input
                            type="text"
                            id="codigoPermiso"
                            required
                            className={styles.formInput}
                            value={inputValues.codigoPermiso}
                            onChange={(e) => handleCodigoChange(e.target.value)}
                            placeholder="Ej: ver_usuarios"
                        />
                    </div>

                    {/* Descripción */}
                    <div className={styles.formGroup}>
                        <label htmlFor="descripcionPermiso" className={styles.formLabel}>
                            Descripción*
                            <span className={styles.labelSubtext}>Descripción detallada del permiso</span>
                        </label>
                        <textarea
                            id="descripcionPermiso"
                            required
                            className={styles.formTextarea}
                            value={inputValues.descripcionPermiso}
                            onChange={(e) => setInputValues({ ...inputValues, descripcionPermiso: e.target.value })}
                            placeholder="Describe las capacidades que otorga este permiso..."
                            rows={4}
                        />
                    </div>

                    {/* Estado */}
                    <div className={styles.formGroup}>
                        <label htmlFor="estadoPermiso" className={styles.formLabel}>
                            Estado*
                            <span className={styles.labelSubtext}>Estado actual del permiso</span>
                        </label>
                        <select
                            id="estadoPermiso"
                            required
                            className={styles.formSelect}
                            value={inputValues.estadoPermiso}
                            onChange={(e) => setInputValues({ ...inputValues, estadoPermiso: e.target.value })}
                        >
                            <option value="Activo">Activo</option>
                            <option value="Inactivo">Inactivo</option>
                        </select>
                    </div>

                    <div className={styles.formActions}>
                        <button type="submit" className={styles.submitButton}>
                            Crear permiso
                        </button>
                    </div>
                </form>
            </div>

            {/* Panel derecho - Preview del permiso */}
            <div className={styles.previewCard}>
                <div className={styles.previewHeader}>
                    <div className={styles.avatarContainer}>
                        <div className={styles.avatar}>
                            <LockIcon style={{ fontSize: '3rem', color: 'white' }} />
                        </div>
                    </div>
                    <div className={styles.permisoBadge}>
                        PERMISO
                    </div>
                </div>

                <div className={styles.previewInfo}>
                    <h3 className={styles.previewName}>
                        {inputValues.nombrePermiso || 'Nuevo Permiso'}
                    </h3>

                    <div className={styles.previewDetails}>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Código:</span>
                            <span className={styles.detailValue}>
                                <code className={styles.codeValue}>
                                    {inputValues.codigoPermiso || 'SIN_CODIGO'}
                                </code>
                            </span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Descripción:</span>
                            <span className={styles.detailValue}>
                                {inputValues.descripcionPermiso || 'No especificada'}
                            </span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Estado:</span>
                            <span className={styles.detailValue}>
                                {inputValues.estadoPermiso === 'Activo' ? (
                                    <span className={styles.statusActive}>
                                        <CheckCircleIcon style={{ fontSize: '16px' }} />
                                        Activo
                                    </span>
                                ) : (
                                    <span className={styles.statusInactive}>
                                        <CancelIcon style={{ fontSize: '16px' }} />
                                        Inactivo
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>

                    <div className={styles.previewActions}>
                        <button className={styles.actionButton} title="Información" type="button">
                            <InfoIcon />
                        </button>
                        <button className={styles.actionButton} title="Código" type="button">
                            <CodeIcon />
                        </button>
                        <button className={styles.actionButton} title="Permiso" type="button">
                            <LockIcon />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ContentPage
