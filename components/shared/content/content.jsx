import PropTypes from 'prop-types'
import NavBarTop from '../navBarTop/navBarTop'
import stylesContent from './content.module.css'

const Container = ({ children, title }) => {
    return (
        <div className="main">
            <NavBarTop />
            <div className="container">
                <div className={stylesContent.title} >
                    <h1>{title}</h1>
                </div>
                <div className="content">
                    {children}
                </div>
            </div>
            {/* <footer className="main-footer">
                <p>SENAVANCE | Dirección de la formación profesional</p>
            </footer> */}
        </div>
    )
}

Container.propTypes = {
    children: PropTypes.node.isRequired,
    title: PropTypes.string.isRequired
}

export default Container