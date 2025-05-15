'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Logo_sava from '@/images/logos/logo_sena_sava.png'
import StylesLoaders from '@/components/shared/loader/loader.module.css'
import stylesPage from '@/styles/not-found.module.css'
import consumerPublicAPI from '@/components/shared/consumerAPI/consumerAPI'
import GetRoute from '@/components/protectedRoute/getRoute'

const Custom404 = () => {

    //* hooks
    const router = useRouter()

    //* states
    const [isDeveloper, setIsDeveloper] = useState(false)


    //* effects
    useEffect(() => {
        const loaderSAVA = document.querySelector(`.${StylesLoaders.pageLoader}`)
        if (loaderSAVA) {
            loaderSAVA.remove()
        }

        loadUserInfo()
    }, [])

    const loadUserInfo = async () => {

        const { isLogged, user } = await GetRoute()

        if (isLogged != undefined && isLogged != 'false' && user != 'false') {
            const { status, data } = await consumerPublicAPI({ url: `${process.env.NEXT_PUBLIC_API_URL}/login/userInfo/${user}` })

            if (status == 'error') {
                console.error('Servicio no disponible')
                return false
            }

            if (data.rol_intitutional_level_access == 'ROOT') {
                setIsDeveloper(true)
            }
        }

    }

    return (
        <>
            {isDeveloper && (
                <main className={stylesPage.content}>

                    <div>
                        <div className={stylesPage.contentPage}>
                            <h1>404 <span>página no encontrada</span></h1>
                            <p>La página que buscas no existe o ha sido eliminada.</p>
                        </div>
                        <div className={stylesPage.contentImage}>
                            <img src="https://www.readytogosurvival.com/cdn/shop/files/404.png?v=1661500863" alt="imagen" />


                            <Link className={stylesPage.link2} href="/soporte"
                                onClick={(evt) => {
                                    evt.preventDefault()
                                    window.location.href = 'https://www.youtube.com/watch?v=f_WuRfuMXQw'
                                }}
                            >Ir a soporte</Link>
                            <Link className={stylesPage.link1} href="/login"
                                onClick={(evt) => {
                                    evt.preventDefault()
                                    router.back()
                                }}
                            >Regresar</Link>
                        </div>
                    </div>
                </main>

            )}

            {!isDeveloper && (
                <main className={stylesPage.content2}>
                    <Image src={Logo_sava} alt="logo sava" />
                    <div className={stylesPage.contentPage2}>
                        <h1>404 <span>página no encontrada</span></h1>
                        <p>La página que buscas no existe o ha sido eliminada.</p>
                    </div>
                </main>
            )}
        </>
    )
}

export default Custom404