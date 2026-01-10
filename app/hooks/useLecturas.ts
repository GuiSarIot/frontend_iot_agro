import { useState, useEffect, useCallback } from 'react'

import { 
    lecturasService, 
    type Lectura, 
    type LecturasResponse,
    type LecturaQueryParams,
    type CreateLecturaDto,
    type EstadisticasLecturas,
    type LecturaResumida
} from '@/app/services/api.service'

/**
 * Hook personalizado para gestionar lecturas de sensores
 * 
 * Proporciona funcionalidades para:
 * - Listar lecturas con filtros y paginación
 * - Crear lecturas individuales o en bulk
 * - Obtener estadísticas de lecturas
 * - Obtener últimas lecturas
 * - Gestionar estado de carga y errores
 */

interface UseLecturasOptions {
    autoLoad?: boolean
    initialParams?: LecturaQueryParams
}

export const useLecturas = (options: UseLecturasOptions = {}) => {
    const { autoLoad = false, initialParams = {} } = options

    // Estados
    const [lecturas, setLecturas] = useState<Lectura[]>([])
    const [totalRecords, setTotalRecords] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [params, setParams] = useState<LecturaQueryParams>(initialParams)

    // Cargar lecturas
    const loadLecturas = useCallback(async (queryParams?: LecturaQueryParams) => {
        try {
            setLoading(true)
            setError(null)

            const finalParams = queryParams || params
            const response: LecturasResponse = await lecturasService.getAll(finalParams)
            
            setLecturas(response.results)
            setTotalRecords(response.count)
            
            return response
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error cargando lecturas'
            setError(errorMessage)
            console.error('Error en useLecturas.loadLecturas:', err)
            throw err
        } finally {
            setLoading(false)
        }
    }, [params])

    // Obtener lectura por ID
    const getLecturaById = async (id: number): Promise<Lectura> => {
        try {
            setLoading(true)
            setError(null)

            const lectura = await lecturasService.getById(id)
            return lectura
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error obteniendo lectura'
            setError(errorMessage)
            console.error('Error en useLecturas.getLecturaById:', err)
            throw err
        } finally {
            setLoading(false)
        }
    }

    // Crear lectura
    const createLectura = async (data: CreateLecturaDto): Promise<Lectura> => {
        try {
            setLoading(true)
            setError(null)

            const nuevaLectura = await lecturasService.create(data)
            
            // Recargar lecturas si ya estaban cargadas
            if (lecturas.length > 0) {
                await loadLecturas()
            }

            return nuevaLectura
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error creando lectura'
            setError(errorMessage)
            console.error('Error en useLecturas.createLectura:', err)
            throw err
        } finally {
            setLoading(false)
        }
    }

    // Crear lecturas en bulk
    const createBulk = async (lecturas: Array<Omit<CreateLecturaDto, 'metadata_json'>>) => {
        try {
            setLoading(true)
            setError(null)

            const response = await lecturasService.createBulk({ lecturas })
            
            // Recargar lecturas
            await loadLecturas()

            return response
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error creando lecturas en bulk'
            setError(errorMessage)
            console.error('Error en useLecturas.createBulk:', err)
            throw err
        } finally {
            setLoading(false)
        }
    }

    // Actualizar lectura
    const updateLectura = async (id: number, metadata_json: Record<string, unknown>): Promise<Lectura> => {
        try {
            setLoading(true)
            setError(null)

            const lecturaActualizada = await lecturasService.update(id, { metadata_json })
            
            // Actualizar en la lista local si existe
            setLecturas(prev => 
                prev.map(l => l.id === id ? lecturaActualizada : l)
            )

            return lecturaActualizada
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error actualizando lectura'
            setError(errorMessage)
            console.error('Error en useLecturas.updateLectura:', err)
            throw err
        } finally {
            setLoading(false)
        }
    }

    // Eliminar lectura
    const deleteLectura = async (id: number): Promise<void> => {
        try {
            setLoading(true)
            setError(null)

            await lecturasService.delete(id)
            
            // Eliminar de la lista local
            setLecturas(prev => prev.filter(l => l.id !== id))
            setTotalRecords(prev => prev - 1)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error eliminando lectura'
            setError(errorMessage)
            console.error('Error en useLecturas.deleteLectura:', err)
            throw err
        } finally {
            setLoading(false)
        }
    }

    // Obtener estadísticas
    const getEstadisticas = async (
        filtros?: { dispositivo?: number; sensor?: number }
    ): Promise<EstadisticasLecturas> => {
        try {
            setLoading(true)
            setError(null)

            const stats = await lecturasService.getEstadisticas(filtros)
            return stats
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error obteniendo estadísticas'
            setError(errorMessage)
            console.error('Error en useLecturas.getEstadisticas:', err)
            throw err
        } finally {
            setLoading(false)
        }
    }

    // Obtener últimas lecturas
    const getUltimas = async (limit: number = 10): Promise<LecturaResumida[]> => {
        try {
            setLoading(true)
            setError(null)

            const ultimas = await lecturasService.getUltimas(limit)
            return ultimas
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error obteniendo últimas lecturas'
            setError(errorMessage)
            console.error('Error en useLecturas.getUltimas:', err)
            throw err
        } finally {
            setLoading(false)
        }
    }

    // Actualizar parámetros de consulta
    const updateParams = (newParams: Partial<LecturaQueryParams>) => {
        setParams(prev => ({ ...prev, ...newParams }))
    }

    // Limpiar filtros
    const clearFilters = () => {
        setParams({})
    }

    // Auto-carga al montar
    useEffect(() => {
        if (autoLoad) {
            loadLecturas()
        }
    }, [autoLoad, loadLecturas])

    return {
        // Estado
        lecturas,
        totalRecords,
        loading,
        error,
        params,

        // Funciones
        loadLecturas,
        getLecturaById,
        createLectura,
        createBulk,
        updateLectura,
        deleteLectura,
        getEstadisticas,
        getUltimas,
        updateParams,
        clearFilters,
    }
}

export default useLecturas
