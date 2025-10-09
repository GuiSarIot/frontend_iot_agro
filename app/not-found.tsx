'use client'

import { useEffect, useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import GetRoute from '@/components/protectedRoute/getRoute'
import consumerPublicAPI from '@/components/shared/consumerAPI/consumerAPI'
import StylesLoaders from '@/components/shared/loader/loader.module.css'
import stylesPage from '@/styles/not-found.module.css'

/* ============================
  🧠 Interfaces tipadas
============================ */
interface GetRouteResult {
  isLogged?: string
  user?: string
  title?: string
  route?: string
}

interface UserInfoResponse {
  rol_intitutional_level_access?: string
}

interface ConsumerAPIResult<T = unknown> {
  status: 'success' | 'error'
  data: T
  message?: string
}

/* ============================
  🚀 Componente principal
============================ */
const Custom404: React.FC = () => {
    const router = useRouter()
    const [isDeveloper, setIsDeveloper] = useState(false)

    useEffect(() => {
        // Elimina el loader si sigue visible
        const loaderSAVA = document.querySelector(`.${StylesLoaders.pageLoader}`)
        if (loaderSAVA) loaderSAVA.remove()

        void loadUserInfo()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    /* ============================
      🔍 Función auxiliar
    ============================ */
    const loadUserInfo = async (): Promise<void> => {
        try {
            const { isLogged, user } = (await GetRoute()) as GetRouteResult

            if (isLogged && isLogged !== 'false' && user && user !== 'false') {
                const { status, data } = (await consumerPublicAPI({
                    url: `${process.env.NEXT_PUBLIC_API_URL}/login/userInfo/${user}`,
                })) as ConsumerAPIResult<UserInfoResponse>

                if (status === 'error') {
                    console.error('Servicio no disponible')
                    return
                }

                if (data?.rol_intitutional_level_access === 'ROOT') {
                    setIsDeveloper(true)
                }
            }
        } catch (error) {
            console.error('Error al cargar la información del usuario:', error)
        }
    }

    /* ============================
      🎨 Renderizado condicional
    ============================ */
    return (
        <>
            {isDeveloper ? (
                <main className={stylesPage.content}>
                    <div>
                        <div className={stylesPage.contentPage}>
                            <h1>
                              404 <span>página no encontrada</span>
                            </h1>
                            <p>La página que buscas no existe o ha sido eliminada.</p>
                        </div>

                        <div className={stylesPage.contentImage}>
                            {/* Imagen externa (usa <img> si el dominio no está en next.config.js) */}
                            <Image
                                src="https://www.readytogosurvival.com/cdn/shop/files/404.png?v=1661500863"
                                alt="imagen"
                                className={stylesPage.image}
                                width={600} // ancho deseado
                                height={400} // alto deseado
                            />

                            <Link
                                className={stylesPage.link2}
                                href="/soporte"
                                onClick={(evt) => {
                                    evt.preventDefault()
                                    window.location.href = 'https://www.youtube.com/watch?v=f_WuRfuMXQw'
                                }}
                            >
                              Ir a soporte
                            </Link>

                            <Link
                                className={stylesPage.link1}
                                href="/login"
                                onClick={(evt) => {
                                    evt.preventDefault()
                                    router.back()
                                }}
                            >
                              Regresar
                            </Link>
                        </div>
                    </div>
                </main>
            ) : (
                <main className={stylesPage.content2}>
                    <Image src="/logoH.png" alt="logo sava" width={160} height={48} priority />
                    <div className={stylesPage.contentPage2}>
                        <h1>
                          404 <span>página no encontrada</span>
                        </h1>
                        <p>La página que buscas no existe o ha sido eliminada.</p>
                    </div>
                </main>
            )}
        </>
    )
}

export default Custom404
