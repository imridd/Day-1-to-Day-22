
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          'babel-plugin-react-compiler'
        ]
      }
    })
  ],

  resolve: {
    alias: [
      {
        find: '@salesforce/platform-sdk/data',
        replacement: fileURLToPath(
          new URL(
            './src/mock-salesforce-sdk/data.js',
            import.meta.url
          )
        )
      }
    ]
  },

  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4100',
        changeOrigin: true
      }
    }
  }
})
