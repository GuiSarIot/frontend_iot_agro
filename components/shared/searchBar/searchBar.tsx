'use client'

import { useState, useRef, useContext } from 'react'

import Link from 'next/link'

import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import DOMPurifyImport from 'dompurify'

import AppContext from '@/context/appContext'

import stylesSearchBar from './searchBar.module.css'

interface Role {
    role: string
    description: string
    url: string
}

interface SearchBarProps {
    roles: Role[]
}

const SearchBar: React.FC<SearchBarProps> = ({ roles }) => {
    //* context
    const { appState } = useContext(AppContext.Context)
    const { userInfo } = appState

    //* states
    const [search, setSearch] = useState(false)

    //* references
    const inputSearch = useRef<HTMLInputElement>(null)
    const optionsSearch = useRef<HTMLUListElement>(null)

    //* variables
    const searchSelected = search
        ? `${stylesSearchBar.boxSearch} ${stylesSearchBar.active}`
        : stylesSearchBar.boxSearch

    //* methods
    const handleSearch = () => setSearch(!search)
    const DOMPurify = DOMPurifyImport as typeof DOMPurifyImport

    const handleInputSearch = () => {
        if (!inputSearch.current || !optionsSearch.current) return

        const value = DOMPurify.sanitize(inputSearch.current.value)

        //* options filters
        const options = Array.from(optionsSearch.current.childNodes) as HTMLElement[]
        options.forEach(option => {
            if (option.textContent?.toLowerCase().includes(value.toLowerCase())) {
                option.style.display = 'block'
            } else {
                option.style.display = 'none'
            }
        })
    }

    return (
        <div className={stylesSearchBar.searchBar}>
            <div className={stylesSearchBar.searchSelected} onClick={handleSearch}>
                <h4>
                    {userInfo.role} <span><ChevronRightIcon /></span>
                </h4>
            </div>
            <div
                className={searchSelected}
                onMouseLeave={() => {
                    setSearch(false)
                    if (inputSearch.current) inputSearch.current.value = ''
                    handleInputSearch()
                }}
            >
                <div className={stylesSearchBar.inputSearch}>
                    <input
                        type="text"
                        placeholder="Buscar rol por nombre..."
                        ref={inputSearch}
                        onChange={handleInputSearch}
                    />
                </div>
                <div className={stylesSearchBar.optionSearch}>
                    <ul ref={optionsSearch}>
                        {roles
                            .filter(r => r && typeof r === 'object' && r.role) // Filtrar solo objetos válidos
                            .sort((a, b) => (a.role || '').localeCompare(b.role || ''))
                            .map(({ role, description, url }, index) => (
                                <li title={description} key={index}>
                                    <Link href={`/${url}`}>{role}</Link>
                                </li>
                            ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default SearchBar
