// vite.config.js
const path = require('path')

const { defineConfig } = require('vite')

module.exports = defineConfig({
  build: {
      manifest: true,
    lib: {
      entry: path.resolve(__dirname, 'src/main.js'),
      name: 'SimpleDataTexture',
      fileName: (format) => `sdt.${format}.js`
    },
    rollupOptions: {
        input: {
            main: path.resolve(__dirname, 'docs/index.html'),
        },
    }
    }
})