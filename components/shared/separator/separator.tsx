import React from 'react'

import StylesSeparator from './separator.module.css'

interface SeparatorProps {
  word?: string;
  animated?: number;
  styles?: React.CSSProperties; // Ahora sí es compatible con style
}

const Separator: React.FC<SeparatorProps> = ({
    word = '...',
    animated,
    styles = {
        fontSize: '1rem', // cambiar size por fontSize para CSSProperties
        color: 'var(--text-color-primary)',
        textAlign: 'center',
    },
}) => {
    const arrayWord = word.split('')
    const waveClass = animated
        ? `${StylesSeparator.wave} ${StylesSeparator['animate' + animated]}`
        : StylesSeparator.wave

    return (
        <div className={waveClass} style={styles}>
            {arrayWord.map((letter, index) => (
                <span
                    key={index}
                    style={{ '--c': index + 1 } as unknown as React.CSSProperties}
                >
                    {letter}
                </span>
            ))}
        </div>
    )
}

export default Separator
