import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Smart Profile Management System',
        short_name: 'SmartProfile',
        description: 'An AI-powered academic and professional profile management system',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react-vendor',
              test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
              priority: 10
            },
            {
              name: 'recharts-vendor',
              test: /[\\/]node_modules[\\/]recharts[\\/]/,
              priority: 9
            },
            {
              name: 'radix-vendor',
              test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
              priority: 8
            },
            {
              name: 'visual-vendor',
              test: /[\\/]node_modules[\\/](lucide-react|sonner)[\\/]/,
              priority: 7
            },
            {
              name: 'supabase-vendor',
              test: /[\\/]node_modules[\\/]@supabase[\\/]/,
              priority: 6
            },
            {
              name: 'floating-vendor',
              test: /[\\/]node_modules[\\/]@floating-ui[\\/]/,
              priority: 5
            },
            {
              name: 'ocr-vendor',
              test: /[\\/]node_modules[\\/](tesseract\.js|tesseract\.js-core)[\\/]/,
              priority: 4
            }
          ]
        }
      }
    }
  }
})
