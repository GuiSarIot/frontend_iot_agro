'use client'

import { ReactNode } from 'react'

import DevicesIcon from '@mui/icons-material/Devices'
import PeopleIcon from '@mui/icons-material/People'
import RouterIcon from '@mui/icons-material/Router'
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest'
import ShieldIcon from '@mui/icons-material/Shield'
import VpnKeyIcon from '@mui/icons-material/VpnKey'
import AppLayout from '@/components/shared/layout/AppLayout'
import SidebarMenu from '@/components/shared/layout/SidebarMenu'

// ---- Interfaces ----
interface ContentAppProps {
    children: ReactNode
}

// ---- Configuración del menú ----
const menuItems = [
    {
        icon: <RouterIcon />,
        label: 'Brokers MQTT',
        href: '/gestor_mqtt_brokers',
        title: 'Gestión de Brokers MQTT'
    },
    {
        icon: <VpnKeyIcon />,
        label: 'Credenciales',
        href: '/gestor_mqtt_credentials',
        title: 'Credenciales de Autenticación'
    },
    {
        icon: <SettingsSuggestIcon />,
        label: 'Topics',
        href: '/gestor_mqtt_topics',
        title: 'Configuración de Topics'
    },
    {
        icon: <DevicesIcon />,
        label: 'Config. Dispositivos',
        href: '/gestor_mqtt_device_config',
        title: 'Configuración por Dispositivo'
    },
    {
        icon: <PeopleIcon />,
        label: 'Usuarios EMQX',
        href: '/gestor_emqx_users',
        title: 'Gestión de Usuarios EMQX'
    },
    {
        icon: <ShieldIcon />,
        label: 'ACL EMQX',
        href: '/gestor_emqx_acl',
        title: 'Control de Acceso (ACL)'
    }
]

// ---- Componente principal ----
const ContentApp: React.FC<ContentAppProps> = ({ children }) => {
    return (
        <AppLayout 
            sidebarContent={<SidebarMenu title="Gestión MQTT" items={menuItems} />}
        >
            {children}
        </AppLayout>
    )
}

export default ContentApp
