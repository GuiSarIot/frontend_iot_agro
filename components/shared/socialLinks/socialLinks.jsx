import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faFacebook,
    faTwitter,
    faInstagram,
    faYoutube,
    faTiktok,
    faLinkedin,
} from '@fortawesome/free-brands-svg-icons'

const socialLinks = [
    { icon: faFacebook, url: 'https://facebook.com/SENA' },
    { icon: faTwitter, url: 'https://twitter.com/SENACOMUNICA' },
    { icon: faInstagram, url: 'https://instagram.com/SENACOMUNICA' },
    { icon: faYoutube, url: 'https://youtube.com/SENATV' },
    { icon: faYoutube, url: 'https://youtube.com/SENARa' },
    { icon: faLinkedin, url: 'https://linkedin.com/company/SENA' },
    { icon: faTiktok, url: 'https://tiktok.com/@senacomunica_' },
]

export default function SocialLinks() {
    return (
        <div className="flex flex-wrap gap-4 items-center justify-center mt-4">
            {socialLinks.map((link, index) => (
                <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-800 hover:text-green-600"
                >
                    <div className="bg-green-500 p-2 rounded-full text-white">
                        <FontAwesomeIcon icon={link.icon} size="lg" />
                    </div>
                    <span>{link.name}</span>
                </a>
            ))}
        </div>
    )
}