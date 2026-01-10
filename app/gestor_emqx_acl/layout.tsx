import ContentAppEmqxAcl from './contentApp'

interface Props {
    children: React.ReactNode
}

export default function LayoutEmqxAcl({ children }: Props) {
    return <ContentAppEmqxAcl>{children}</ContentAppEmqxAcl>
}
