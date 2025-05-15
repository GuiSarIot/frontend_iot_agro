'use client'

import { useContext, useState } from 'react'
import { useRouter } from 'next/navigation'
import PropTypes from 'prop-types'
import Link from 'next/link'
import LogoutIcon from '@mui/icons-material/Logout'
import EditIcon from '@mui/icons-material/Edit'
import AppContext from '@/context/appContext'
import stylesProfilePopup from './profilePopup.module.css'
import GetProfileImage from './getProfileImage'
import SaveRoute from '@/components/protectedRoute/saveRoute'
import Logout from '@/components/protectedRoute/logout'

const ProfilePopup = ({ nameImage }) => {

    //* context
    const { appState, changeAuthContext, changeTitle, changeUserInfo } = useContext(AppContext.Context)
    const { userInfo } = appState

    //* hooks
    const router = useRouter()

    //* states
    const [showInfoProfile, setShowInfoProfile] = useState(false)

    const imgProfile = GetProfileImage(nameImage)

    //* styles
    const activeInfoProfile = showInfoProfile ? `${stylesProfilePopup.boxInfo} ${stylesProfilePopup.active}` : stylesProfilePopup.boxInfo

    //* methods
    const handleLogout = (event) => {
        event.preventDefault()

        //* login out
        Logout({
            changeAuthContext,
            changeUserInfo,
            router
        })
    }

    const truncateName = (name, maxLength) => (name.length <= maxLength) ? name : name.slice(0, maxLength - 3) + '...'

    const handleUpdatePersonalInfo = (event) => {
        event.preventDefault()
        changeTitle(event.target.innerText)
        SaveRoute({
            routeInfo: event.target.getAttribute('href'),
            title: 'Edición información personal'
        })
        router.push(event.target.getAttribute('href'))
    }

    return (
        <div className={stylesProfilePopup.profilePopup}>
            <div className={stylesProfilePopup.boxImage} onClick={() => setShowInfoProfile(!showInfoProfile)}>
                <img src={imgProfile} alt="imagen de perfil" width={50} height={50} />
            </div>

            <div className={activeInfoProfile} onMouseLeave={() => setShowInfoProfile(false)}>
                <div className={stylesProfilePopup.sectionTop}>
                    <div>
                        <p>{userInfo.role}</p>
                    </div>
                    <div>
                        <Link href="" onClick={handleLogout} >
                            <span>Cerrar sesión</span>
                            <span>
                                <LogoutIcon />
                            </span>
                        </Link>
                    </div>
                </div>
                <div className={stylesProfilePopup.sectionBottom}>
                    <div className={stylesProfilePopup.imageProfile}>
                        <img src={imgProfile} alt="imagen de perfil" width={50} height={50} />
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

ProfilePopup.propTypes = {
    nameImage: PropTypes.string.isRequired
}

export default ProfilePopup
