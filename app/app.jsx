'use client'

import PropTypes from 'prop-types'
import AppContext from '@/context/appContext'

const App = ({ children }) => {

    //* renders
    return (
        <AppContext.Provider>
            {children}
        </AppContext.Provider>
    )
}

App.propTypes = {
    children: PropTypes.node.isRequired
}

export default App 