const { generateSW } = require('workbox-build')

generateSW({
  swDest: 'public/sw.js',
  cacheId: 'workbox',
  globDirectory: 'public',
  globPatterns: ['**/*.{css,js,eot,ttf,woff,woff2,otf}'],
  globIgnores: ['sitemap.xml'],
  navigateFallback: '/offline',
  cleanupOutdatedCaches: true,
  skipWaiting: true,
  clientsClaim: true,
  mode: 'production',
  sourcemap: false,
  modifyURLPrefix: { '': '/' },
  maximumFileSizeToCacheInBytes: 50 * 1024 * 1024,
  runtimeCaching: [
    {
      urlPattern: /(?:\/)$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'html',
        expiration: {
          maxAgeSeconds: 60 * 60 * 24 * 7
        }
      }
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|gif|webp|svg)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 1000,
          maxAgeSeconds: 60 * 60 * 24 * 365
        }
      }
    },
    {
      urlPattern: /\.(?:webm|mp4)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'videos',
        expiration: {
          maxEntries: 1000,
          maxAgeSeconds: 60 * 60 * 24 * 365
        }
      }
    }
  ]
}).then(({ count }) => console.info(`Cached ${count} files with Service Worker`))
