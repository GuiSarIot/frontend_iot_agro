'use client'

import { useState } from 'react'

import { useDispositivos } from '@/app/hooks/useDispositivos'

/**
 * Componente de ejemplo que muestra cómo usar el hook useDispositivos
 * para gestionar dispositivos con el backend
 */
export default function DispositivosExample() {
    const {
        dispositivos,
        loading,
        error,
        fetchDispositivos,
        createDispositivo,
        updateDispositivo,
        deleteDispositivo,
    } = useDispositivos()

    const [formData, setFormData] = useState({
        nombre: '',
        tipo: '',
        estado: 'activo',
        ubicacion: '',
    })

    const [editingId, setEditingId] = useState<number | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (editingId) {
            // Actualizar dispositivo existente
            const success = await updateDispositivo(editingId, formData)
            if (success) {
                setEditingId(null)
                setFormData({ nombre: '', tipo: '', estado: 'activo', ubicacion: '' })
            }
        } else {
            // Crear nuevo dispositivo
            const success = await createDispositivo(formData)
            if (success) {
                setFormData({ nombre: '', tipo: '', estado: 'activo', ubicacion: '' })
            }
        }
    }

    const handleEdit = (dispositivo: {
        id: number
        nombre: string
        tipo: string
        estado: string
        ubicacion?: string
    }) => {
        setEditingId(dispositivo.id)
        setFormData({
            nombre: dispositivo.nombre,
            tipo: dispositivo.tipo,
            estado: dispositivo.estado,
            ubicacion: dispositivo.ubicacion || '',
        })
    }

    const handleCancelEdit = () => {
        setEditingId(null)
        setFormData({ nombre: '', tipo: '', estado: 'activo', ubicacion: '' })
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Gestión de Dispositivos</h1>

            {/* Formulario */}
            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <h2 className="text-xl font-semibold mb-4">
                    {editingId ? 'Editar Dispositivo' : 'Nuevo Dispositivo'}
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Nombre
                        </label>
                        <input
                            type="text"
                            value={formData.nombre}
                            onChange={(e) =>
                                setFormData({ ...formData, nombre: e.target.value })
                            }
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Tipo
                        </label>
                        <input
                            type="text"
                            value={formData.tipo}
                            onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Estado
                        </label>
                        <select
                            value={formData.estado}
                            onChange={(e) =>
                                setFormData({ ...formData, estado: e.target.value })
                            }
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        >
                            <option value="activo">Activo</option>
                            <option value="inactivo">Inactivo</option>
                            <option value="mantenimiento">Mantenimiento</option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Ubicación
                        </label>
                        <input
                            type="text"
                            value={formData.ubicacion}
                            onChange={(e) =>
                                setFormData({ ...formData, ubicacion: e.target.value })
                            }
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            disabled={loading}
                        >
                            {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            >
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Lista de dispositivos */}
            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Lista de Dispositivos</h2>
                    <button
                        onClick={fetchDispositivos}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        disabled={loading}
                    >
                        {loading ? 'Cargando...' : 'Recargar'}
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {loading ? (
                    <p className="text-center py-4">Cargando...</p>
                ) : dispositivos.length === 0 ? (
                    <p className="text-center py-4 text-gray-500">No hay dispositivos</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto">
                            <thead>
                                <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                                    <th className="py-3 px-6 text-left">ID</th>
                                    <th className="py-3 px-6 text-left">Nombre</th>
                                    <th className="py-3 px-6 text-left">Tipo</th>
                                    <th className="py-3 px-6 text-left">Estado</th>
                                    <th className="py-3 px-6 text-left">Ubicación</th>
                                    <th className="py-3 px-6 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600 text-sm">
                                {dispositivos.map((dispositivo) => (
                                    <tr
                                        key={dispositivo.id}
                                        className="border-b border-gray-200 hover:bg-gray-100"
                                    >
                                        <td className="py-3 px-6 text-left">{dispositivo.id}</td>
                                        <td className="py-3 px-6 text-left">
                                            {dispositivo.nombre}
                                        </td>
                                        <td className="py-3 px-6 text-left">{dispositivo.tipo}</td>
                                        <td className="py-3 px-6 text-left">
                                            <span
                                                className={`py-1 px-3 rounded-full text-xs ${
                                                    dispositivo.estado === 'activo'
                                                        ? 'bg-green-200 text-green-600'
                                                        : dispositivo.estado === 'inactivo'
                                                            ? 'bg-red-200 text-red-600'
                                                            : 'bg-yellow-200 text-yellow-600'
                                                }`}
                                            >
                                                {dispositivo.estado}
                                            </span>
                                        </td>
                                        <td className="py-3 px-6 text-left">
                                            {dispositivo.ubicacion || '-'}
                                        </td>
                                        <td className="py-3 px-6 text-center">
                                            <div className="flex item-center justify-center">
                                                <button
                                                    onClick={() => handleEdit(dispositivo)}
                                                    className="w-4 mr-2 transform hover:text-blue-500 hover:scale-110"
                                                    title="Editar"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => deleteDispositivo(dispositivo.id)}
                                                    className="w-4 mr-2 transform hover:text-red-500 hover:scale-110"
                                                    title="Eliminar"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
