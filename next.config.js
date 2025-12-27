/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['www.readytogosurvival.com'],
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
            },
        ],
    },
}

module.exports = nextConfig
