'use client'

import { useState, useEffect } from 'react'

import Swal from 'sweetalert2'

import { 
    dispositivosService, 
    type Dispositivo,
    type DispositivoQueryParams,
    type CreateDispositivoDto,
    type AsignarSensorDto,
    type AsignarOperadorDto,
    type TipoDispositivo
} from '@/app/services/api.service'

/**
 * Hook completo para gestionar dispositivos IoT
 * Incluye todas las operaciones CRUD y asignaciones
 */
export function useDispositivos() {
    const [dispositivos, setDispositivos] = useState<Dispositivo[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    /**
     * Carga todos los dispositivos con parámetros de búsqueda opcionales
     */
    const fetchDispositivos = async (params?: DispositivoQueryParams) => {
        setLoading(true)
        setError(null)
        try {
            const response = await dispositivosService.getAll(params)
            // Si la respuesta es paginada, extraer results
            const data = Array.isArray(response) ? response : response.results || []
            setDispositivos(data)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al cargar dispositivos'
            setError(errorMessage)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage,
            })
        } finally {
            setLoading(false)
        }
    }

    /**
     * Carga un dispositivo por ID
     */
    const fetchDispositivoById = async (id: number): Promise<Dispositivo | null> => {
        setLoading(true)
        setError(null)
        try {
            const data = await dispositivosService.getById(id)
            return data
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al cargar dispositivo'
            setError(errorMessage)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage,
            })
            return null
        } finally {
            setLoading(false)
        }
    }

    /**
     * Crea un nuevo dispositivo
     */
    const createDispositivo = async (data: CreateDispositivoDto): Promise<boolean> => {
        setLoading(true)
        setError(null)
        try {
            const newDispositivo = await dispositivosService.create(data)
            setDispositivos([...dispositivos, newDispositivo])
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Dispositivo creado correctamente',
            })
            return true
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al crear dispositivo'
            setError(errorMessage)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage,
            })
            return false
        } finally {
            setLoading(false)
        }
    }

    /**
     * Actualiza un dispositivo existente (PUT completo)
     */
    const updateDispositivo = async (
        id: number,
        data: CreateDispositivoDto
    ): Promise<boolean> => {
        setLoading(true)
        setError(null)
        try {
            const updatedDispositivo = await dispositivosService.update(id, data)
            setDispositivos(
                dispositivos.map((d) => (d.id === id ? updatedDispositivo : d))
            )
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Dispositivo actualizado correctamente',
            })
            return true
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Error al actualizar dispositivo'
            setError(errorMessage)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage,
            })
            return false
        } finally {
            setLoading(false)
        }
    }

    /**
     * Actualiza parcialmente un dispositivo (PATCH)
     */
    const partialUpdateDispositivo = async (
        id: number,
        data: Partial<CreateDispositivoDto>
    ): Promise<boolean> => {
        setLoading(true)
        setError(null)
        try {
            const updatedDispositivo = await dispositivosService.partialUpdate(id, data)
            setDispositivos(
                dispositivos.map((d) => (d.id === id ? updatedDispositivo : d))
            )
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Dispositivo actualizado correctamente',
            })
            return true
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Error al actualizar dispositivo'
            setError(errorMessage)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage,
            })
            return false
        } finally {
            setLoading(false)
        }
    }

    /**
     * Elimina un dispositivo
     */
    const deleteDispositivo = async (id: number): Promise<boolean> => {
        // Confirmación antes de eliminar
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        })

        if (!result.isConfirmed) {
            return false
        }

        setLoading(true)
        setError(null)
        try {
            await dispositivosService.delete(id)
            setDispositivos(dispositivos.filter((d) => d.id !== id))
            Swal.fire({
                icon: 'success',
                title: 'Eliminado',
                text: 'Dispositivo eliminado correctamente',
            })
            return true
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Error al eliminar dispositivo'
            setError(errorMessage)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage,
            })
            return false
        } finally {
            setLoading(false)
        }
    }

    /**
     * Asigna un sensor a un dispositivo
     */
    const assignSensor = async (
        dispositivoId: number,
        data: AsignarSensorDto
    ): Promise<boolean> => {
        setLoading(true)
        setError(null)
        try {
            await dispositivosService.assignSensor(dispositivoId, data)
            // Recargar el dispositivo para actualizar la lista de sensores
            await fetchDispositivoById(dispositivoId)
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Sensor asignado correctamente',
            })
            return true
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al asignar sensor'
            setError(errorMessage)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage,
            })
            return false
        } finally {
            setLoading(false)
        }
    }

    /**
     * Remueve un sensor de un dispositivo
     */
    const removeSensor = async (dispositivoId: number, sensorId: number): Promise<boolean> => {
        setLoading(true)
        setError(null)
        try {
            await dispositivosService.removeSensor(dispositivoId, sensorId)
            // Recargar el dispositivo para actualizar la lista de sensores
            await fetchDispositivoById(dispositivoId)
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Sensor removido correctamente',
            })
            return true
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al remover sensor'
            setError(errorMessage)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage,
            })
            return false
        } finally {
            setLoading(false)
        }
    }

    /**
     * Asigna un operador a un dispositivo
     */
    const assignOperator = async (
        dispositivoId: number,
        data: AsignarOperadorDto
    ): Promise<boolean> => {
        setLoading(true)
        setError(null)
        try {
            const response = await dispositivosService.assignOperator(dispositivoId, data)
            // Actualizar el dispositivo en la lista
            setDispositivos(
                dispositivos.map((d) =>
                    d.id === dispositivoId ? response.dispositivo : d
                )
            )
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Operador asignado correctamente',
            })
            return true
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al asignar operador'
            setError(errorMessage)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage,
            })
            return false
        } finally {
            setLoading(false)
        }
    }

    /**
     * Obtiene los tipos de dispositivos disponibles
     */
    const getTipos = async (): Promise<TipoDispositivo[]> => {
        try {
            return await dispositivosService.getTipos()
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al cargar tipos'
            setError(errorMessage)
            return []
        }
    }

    /**
     * Obtiene dispositivos con MQTT habilitado
     */
    const getMqttDevices = async () => {
        setLoading(true)
        setError(null)
        try {
            return await dispositivosService.getMqttDevices()
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Error al cargar dispositivos MQTT'
            setError(errorMessage)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage,
            })
            return []
        } finally {
            setLoading(false)
        }
    }

    /**
     * Obtiene las credenciales MQTT de un dispositivo
     */
    const getMqttCredentials = async (dispositivoId: number) => {
        setLoading(true)
        setError(null)
        try {
            return await dispositivosService.getMqttCredentials(dispositivoId)
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Error al cargar credenciales MQTT'
            setError(errorMessage)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage,
            })
            return null
        } finally {
            setLoading(false)
        }
    }

    /**
     * Carga los dispositivos al montar el componente
     */
    useEffect(() => {
        void fetchDispositivos()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return {
        dispositivos,
        loading,
        error,
        fetchDispositivos,
        fetchDispositivoById,
        createDispositivo,
        updateDispositivo,
        partialUpdateDispositivo,
        deleteDispositivo,
        assignSensor,
        removeSensor,
        assignOperator,
        getTipos,
        getMqttDevices,
        getMqttCredentials,
    }
}
