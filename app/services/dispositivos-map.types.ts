/**
 * Tipos extendidos para dispositivos con coordenadas geográficas
 */

import { Dispositivo } from './api.service'

interface TipoDispositivo {
    nombre: string
}

export interface DispositivoConCoordenadas extends Dispositivo {
    latitud?: number
    longitud?: number
    // Coordenadas predeterminadas si no están disponibles
    lat?: number
    lng?: number
}

export interface DispositivoMapMarker {
    id: number
    nombre: string
    estado: 'activo' | 'inactivo'
    tipo: string
    ubicacion?: string
    latitud: number
    longitud: number
    ultimaLectura?: {
        valor: string | number
        unidad?: string
        fecha: string
    }
    propietario?: {
        nombre: string
        email: string
    }
}

export interface MapBounds {
    minLat: number
    maxLat: number
    minLng: number
    maxLng: number
}

export interface UltimaLectura {
    valor: string
    unidad?: string
    sensor_unidad?: string
    fecha_lectura?: string
    timestamp?: string
}

/**
 * Convierte un dispositivo a un marcador de mapa
 */
export function dispositivoToMapMarker(
    dispositivo: DispositivoConCoordenadas,
    ultimaLectura?: UltimaLectura
): DispositivoMapMarker | null {
    const lat = dispositivo.latitud ?? dispositivo.lat
    const lng = dispositivo.longitud ?? dispositivo.lng

    // Si no hay coordenadas, no se puede crear el marcador
    if (lat === undefined || lng === undefined) {
        return null
    }

    return {
        id: dispositivo.id,
        nombre: dispositivo.nombre,
        estado: dispositivo.estado as 'activo' | 'inactivo',
        tipo: typeof dispositivo.tipo === 'string' 
            ? dispositivo.tipo 
            : (dispositivo.tipo as TipoDispositivo)?.nombre || 'Desconocido',
        ubicacion: dispositivo.ubicacion,
        latitud: lat,
        longitud: lng,
        ultimaLectura: ultimaLectura ? {
            valor: ultimaLectura.valor,
            unidad: ultimaLectura.unidad || ultimaLectura.sensor_unidad,
            fecha: ultimaLectura.fecha_lectura || ultimaLectura.timestamp
        } : undefined,
        propietario: dispositivo.propietario ? {
            nombre: dispositivo.propietario.username,
            email: dispositivo.propietario.email
        } : undefined
    }
}

/**
 * Calcula los límites del mapa basándose en los marcadores
 */
export function calcularBoundsDelMapa(markers: DispositivoMapMarker[]): MapBounds | null {
    if (markers.length === 0) return null

    const latitudes = markers.map(m => m.latitud)
    const longitudes = markers.map(m => m.longitud)

    return {
        minLat: Math.min(...latitudes),
        maxLat: Math.max(...latitudes),
        minLng: Math.min(...longitudes),
        maxLng: Math.max(...longitudes)
    }
}

/**
 * Coordenadas predeterminadas (Colombia - Bogotá)
 */
export const DEFAULT_CENTER = {
    lat: 4.60971,
    lng: -74.08175
}

export const DEFAULT_ZOOM = 13
