import { defineConfig } from 'vite'

export default defineConfig({
    server: {
        host: '0.0.0.0',
        port: process.env.PORT || 5173,
        allowedHosts: ['dtdc-pg-frontend.onrender.com', 'dtdcpedagantyada.in'],
        proxy: {
            '/api': {
                target: 'https://dtdc-backend.onrender.com',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ''),
                secure: false,
            },
        },
    },
    preview: {
        host: '0.0.0.0',
        port: process.env.PORT || 4173,
    },
})
