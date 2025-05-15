import PropTypes from 'prop-types'

export const metadata = {
    title: 'Inicio de sesion | login',
    description: 'Login'
}

const LoginLayout = ({ children }) => {
    return (
        <main className="App">
            {children}
        </main>
    )
}

LoginLayout.propTypes = {
    children: PropTypes.node
}

export default LoginLayout