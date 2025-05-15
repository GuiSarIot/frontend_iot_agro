'use client'

import { useState, useRef, useContext } from 'react'
import DOMPurify from 'dompurify'
import PropTypes from 'prop-types'
import Link from 'next/link'
import AppContext from '@/context/appContext'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import stylesSearchBar from './searchBar.module.css'

const SearchBar = ({ roles }) => {

    //* context
    const { appState } = useContext(AppContext.Context)
    const { userInfo } = appState

    //* states
    const [search, setSearch] = useState(false)

    //* references
    const inputSearch = useRef(null)
    const optionsSearch = useRef(null)

    //* variables
    const searchSelected = search ? `${stylesSearchBar.boxSearch} ${stylesSearchBar.active}` : stylesSearchBar.boxSearch

    //* methods
    const handleSearch = () => setSearch(!search)

    const handleInputSearch = () => {
        const value = DOMPurify.sanitize(inputSearch.current.value)

        //* options filters
        const options = optionsSearch.current.childNodes
        options.forEach(option => {
            if (option.textContent.toLowerCase().indexOf(value.toLowerCase()) !== -1) {
                option.style.display = 'block'
            } else {
                option.style.display = 'none'
            }
        })
    }

    return (
        <div className={stylesSearchBar.searchBar} >
            <div className={stylesSearchBar.searchSelected} onClick={handleSearch}>
                <h4>{userInfo.role} <span><ChevronRightIcon /></span></h4>
            </div>
            <div
                className={searchSelected}
                onMouseLeave={() => {
                    setSearch(false)
                    inputSearch.current.value = ''
                    handleInputSearch()
                }}
            >
                <div className={stylesSearchBar.inputSearch}>
                    <input type="text" placeholder="Buscar rol por nombre..." ref={inputSearch} onChange={handleInputSearch} />
                </div>
                <div className={stylesSearchBar.optionSearch}>
                    <ul ref={optionsSearch}>
                        {
                            roles.sort((a, b) => a.role.localeCompare(b.role)).map(({ role, description, url }, index) =>
                                <li title={description} key={index}>
                                    <Link href={`/${url}`}>{role}</Link>
                                </li>
                            )
                        }
                    </ul>
                </div>
            </div>
        </div>
    )
}

SearchBar.propTypes = {
    roles: PropTypes.array.isRequired
}

export default SearchBar