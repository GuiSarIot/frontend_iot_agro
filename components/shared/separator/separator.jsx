import PropTypes from 'prop-types'
import StylesSeparator from './separator.module.css'

const Separator = ({word = '...', animated, styles = {
    size: '1rem',
    color: 'var(--text-color-primary)',
    textAlign: 'center',
}}) => {

    const arrayWord = word.split('')
    const waveClass = animated ? `${StylesSeparator.wave} ${StylesSeparator['animate'+animated]}` : StylesSeparator.wave

    return (
        <div className={waveClass} style={{ ...styles }} >
            {arrayWord.map((letter, index) => (
                <span key={index} style={{ '--c': index+1 }}>
                    {letter}
                </span>
            ))}
        </div>
    )
}

Separator.propTypes = {
    word: PropTypes.string.isRequired,
    animated: PropTypes.number,
    styles: PropTypes.shape({
        size: PropTypes.string,
        color: PropTypes.string,
        textAlign: PropTypes.string,
    })
}

export default Separator