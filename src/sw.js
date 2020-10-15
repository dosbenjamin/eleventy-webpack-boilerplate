const { generateSW } = require('workbox-build')

const swDest = 'public/sw.js'

generateSW({
  swDest,
  globDirectory: 'public',
  globPatterns: ['**/*.{html,json,js,css,xml,webmanifest,woff2,ttf}'],
  // additionalManifestEntries: ['/offline/index.html'],
  globIgnores: ['sitemap.xml'],
  navigateFallback: '/index.html',
  cleanupOutdatedCaches: true,
  mode: 'production',
  sourcemap: false,
  modifyURLPrefix: { '': '/' },
  runtimeCaching: [{
    urlPattern: /.(?:png|jpg|jpeg|svg|webp|gif)$/,
    handler: 'CacheFirst',
    options: {
      cacheName: 'images',
      expiration: { maxEntries: 10 }
    }
  }]
})
  .then(({ count, size }) => {
    console.info(`Generated ${swDest}, which will precache ${count} files, totaling ${size} bytes.`)
  })
