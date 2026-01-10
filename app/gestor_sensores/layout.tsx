import type { ReactNode } from 'react'

import ContentApp from './contentApp'

export default function GestorSensoresLayout({ children }: { children: ReactNode }) {
    return <ContentApp>{children}</ContentApp>
}
