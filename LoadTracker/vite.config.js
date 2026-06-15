import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        importScripts: ['/OneSignalSDKWorker.js'],
      },
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'apple-touch-icon-120x120.png', 'apple-touch-icon-152x152.png', 'apple-touch-icon-167x167.png', 'mask-icon.svg'],
      manifest: {
        name: 'LoadBuddy',
        short_name: 'LoadBuddy',
        description: 'Track your 4-week load/deload training cycle',
        theme_color: '#2ECC71',
        background_color: '#2ECC71',
        display: 'standalone',
        icons: [
          {
            src: 'apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png'
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
