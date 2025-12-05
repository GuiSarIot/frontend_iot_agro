'use client'

import { useState, useEffect } from 'react'

import Swal from 'sweetalert2'

import { dispositivosService, Dispositivo } from '@/app/services/api.service'

/**
 * Hook de ejemplo para gestionar dispositivos
 * Muestra el patrón de uso de los servicios API
 */
export function useDispositivos() {
    const [dispositivos, setDispositivos] = useState<Dispositivo[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    /**
     * Carga todos los dispositivos
     */
    const fetchDispositivos = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await dispositivosService.getAll()
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
    const createDispositivo = async (data: {
        nombre: string
        tipo: string
        estado: string
        ubicacion?: string
    }): Promise<boolean> => {
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
     * Actualiza un dispositivo existente
     */
    const updateDispositivo = async (
        id: number,
        data: {
            nombre: string
            tipo: string
            estado: string
            ubicacion?: string
        }
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
     * Actualiza parcialmente un dispositivo
     */
    const partialUpdateDispositivo = async (
        id: number,
        data: Partial<{
            nombre: string
            tipo: string
            estado: string
            ubicacion?: string
        }>
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
    }
}
