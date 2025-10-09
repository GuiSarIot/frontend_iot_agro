'use client'

import { useContext, useState, MouseEvent } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import EditIcon from '@mui/icons-material/Edit'
import LogoutIcon from '@mui/icons-material/Logout'

import Logout from '@/components/protectedRoute/logout'
import SaveRoute from '@/components/protectedRoute/saveRoute'
import AppContext from '@/context/appContext'

import GetProfileImage from './getProfileImage'
import stylesProfilePopup from './profilePopup.module.css'

interface ProfilePopupProps {
    nameImage: string
}

const ProfilePopup: React.FC<ProfilePopupProps> = ({ nameImage }) => {
    //* context
    const { appState, changeAuthContext, changeTitle, changeUserInfo } = useContext(AppContext.Context)
    const { userInfo } = appState

    //* hooks
    const router = useRouter()

    //* states
    const [showInfoProfile, setShowInfoProfile] = useState(false)

    const imgProfile = GetProfileImage(nameImage)

    //* styles
    const activeInfoProfile = showInfoProfile
        ? `${stylesProfilePopup.boxInfo} ${stylesProfilePopup.active}`
        : stylesProfilePopup.boxInfo

    //* methods
    const handleLogout = (event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault()

        Logout({
            changeAuthContext,
            changeUserInfo,
            router
        })
    }

    const truncateName = (name: string, maxLength: number) =>
        name.length <= maxLength ? name : name.slice(0, maxLength - 3) + '...'

    const handleUpdatePersonalInfo = (event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault()
        const target = event.currentTarget
        changeTitle(target.innerText)
        SaveRoute({
            routeInfo: target.getAttribute('href') || '',
            title: 'Edición información personal'
        })
        router.push(target.getAttribute('href') || '')
    }

    return (
        <div className={stylesProfilePopup.profilePopup}>
            <div className={stylesProfilePopup.boxImage} onClick={() => setShowInfoProfile(!showInfoProfile)}>
                <Image
                    src={imgProfile}       // tu URL o path
                    alt="imagen de perfil"
                    width={50}
                    height={50}
                    style={{ borderRadius: '50%' }} // si quieres borde redondeado
                />
            </div>

            <div className={activeInfoProfile} onMouseLeave={() => setShowInfoProfile(false)}>
                <div className={stylesProfilePopup.sectionTop}>
                    <div>
                        <p>{userInfo.role}</p>
                    </div>
                    <div>
                        <Link href="#" onClick={handleLogout}>
                            <span>Cerrar sesión</span>
                            <span>
                                <LogoutIcon />
                            </span>
                        </Link>
                    </div>
                </div>

                <div className={stylesProfilePopup.sectionBottom}>
                    <div className={stylesProfilePopup.imageProfile}>
                        <Image
                            src={imgProfile}      // URL o path de la imagen
                            alt="imagen de perfil"
                            width={50}
                            height={50}
                            style={{ borderRadius: '50%' }} // opcional, si quieres bordes redondeados
                        />
                    </div>

                    <div className={stylesProfilePopup.descriptionProfile}>
                        <h4>{truncateName(userInfo.name, 23)}</h4>
                        <p>{userInfo.email}</p>
                        <Link href="/update_personal_info" onClick={handleUpdatePersonalInfo}>
                            <EditIcon /> Editar información personal
                        </Link>
                    </div>
                </div>

                <div className={stylesProfilePopup.decorator}></div>
            </div>
        </div>
    )
}

export default ProfilePopup
