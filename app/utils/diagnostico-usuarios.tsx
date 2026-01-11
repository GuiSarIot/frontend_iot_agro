'use client'

import { useState } from 'react'
import { usuariosService, type Usuario } from '@/app/services/api.service'

/**
 * Componente de diagnóstico para verificar usuarios
 * Usa este componente para verificar qué usuarios están disponibles en el sistema
 */
export default function DiagnosticoUsuarios() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const cargarUsuarios = async () => {
        setLoading(true)
        setError(null)
        try {
            console.log('🔍 Ejecutando usuariosService.getAll()...')
            const response = await usuariosService.getAll()
            console.log('✅ Respuesta recibida:', response)
            const usuariosData = response.results || []
            console.log('✅ Usuarios extraídos:', usuariosData)
            setUsuarios(usuariosData)
        } catch (err) {
            console.error('❌ Error:', err)
            setError(err instanceof Error ? err.message : 'Error desconocido')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: 'white',
            border: '2px solid #333',
            borderRadius: '8px',
            padding: '20px',
            maxWidth: '500px',
            maxHeight: '600px',
            overflow: 'auto',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            zIndex: 9999
        }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>🔧 Diagnóstico de Usuarios</h3>
            
            <button
                onClick={cargarUsuarios}
                disabled={loading}
                style={{
                    padding: '10px 20px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    marginBottom: '15px',
                    width: '100%'
                }}
            >
                {loading ? 'Cargando...' : 'Cargar Usuarios'}
            </button>

            {error && (
                <div style={{
                    padding: '10px',
                    backgroundColor: '#ffebee',
                    color: '#c62828',
                    borderRadius: '4px',
                    marginBottom: '15px',
                    fontSize: '14px'
                }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            {usuarios.length > 0 && (
                <div>
                    <p style={{ fontSize: '14px', marginBottom: '10px' }}>
                        <strong>Total de usuarios:</strong> {usuarios.length}
                    </p>
                    <p style={{ fontSize: '14px', marginBottom: '10px' }}>
                        <strong>Usuarios activos:</strong> {usuarios.filter(u => u.is_active).length}
                    </p>
                    <p style={{ fontSize: '14px', marginBottom: '10px' }}>
                        <strong>Usuarios inactivos:</strong> {usuarios.filter(u => !u.is_active).length}
                    </p>

                    <div style={{ marginTop: '15px' }}>
                        <h4 style={{ fontSize: '14px', marginBottom: '10px' }}>Lista de usuarios:</h4>
                        <div style={{ fontSize: '12px' }}>
                            {usuarios.map(usuario => (
                                <div
                                    key={usuario.id}
                                    style={{
                                        padding: '8px',
                                        marginBottom: '5px',
                                        backgroundColor: usuario.is_active ? '#e8f5e9' : '#ffebee',
                                        borderRadius: '4px',
                                        border: '1px solid ' + (usuario.is_active ? '#4CAF50' : '#f44336')
                                    }}
                                >
                                    <div><strong>ID:</strong> {usuario.id}</div>
                                    <div><strong>Username:</strong> {usuario.username}</div>
                                    <div><strong>Nombre:</strong> {usuario.full_name || `${usuario.first_name} ${usuario.last_name}`}</div>
                                    <div><strong>Email:</strong> {usuario.email}</div>
                                    <div><strong>Activo:</strong> {usuario.is_active ? '✅ Sí' : '❌ No'}</div>
                                    {usuario.rol_detail && (
                                        <div><strong>Rol:</strong> {usuario.rol_detail.nombre_display || usuario.rol_detail.nombre}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {!loading && !error && usuarios.length === 0 && (
                <p style={{ fontSize: '14px', color: '#666', textAlign: 'center' }}>
                    Haz clic en "Cargar Usuarios" para ver la lista
                </p>
            )}
        </div>
    )
}
