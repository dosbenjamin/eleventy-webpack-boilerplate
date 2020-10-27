const precache = '/offline'
const pagesCache = 'pages'
const assetsCache = 'assets'

/**
 * Clean `pages` cache to be up to date with `assets` and precache `/offline`.
 *
 * @returns {Promise} Forces the waiting `Service Worker`
 * to become the active service worker.
 */
const installSW = async () => {
  caches.delete(pagesCache)
  const cache = await caches.open(pagesCache)
  cache.add(precache)
  return self.skipWaiting()
}

/**
 * Activate `Service Worker`.
 *
 * @returns {Promise} Allows an `Service Worker` to set itself
 * as the `controller` for all clients within its `scope`.
 */
const activateSW = () => self.clients.claim()

/**
 * Remove and replace old item with the new one.
 *
 * @param {Object} request Request from `Service Worker`.
 * @param {Promise} cache Assets cache.
 * @returns {void} Nothing
 */
const updateCache = async (request, cache) => {
  const path = request.url.replace(request.referrer, '')
  const [filename,, extension] = path.split('.')
  const currentlyCached = await cache.keys()
  currentlyCached
    .filter(({ url }) => (url.includes(filename) && url.includes(extension)))
    .map(outdated => cache.delete(outdated))
}

/**
 * Add `asset` or `page` to the cache.

 * @param {Object} request Request from `Service Worker`.
 * @param {Object} response Response from network.
 * @returns {void} Nothing
 */
const addToCache = async (request, response) => {
  const storage = request.mode === 'navigate' ? pagesCache : assetsCache
  const cache = await caches.open(storage)
  storage === assetsCache && updateCache(request, cache)
  cache.put(request, response)
}

/**
 * Use network to serve and add `asset` or `page` to the cache.
 *
 * @param {Object} request Request from `Service Worker`.
 * @param {Object} event Fetch event.
 * @returns {Promise} Response from network.
 */
const fetchRequest = async (request, event) => {
  const response = await fetch(request) // eslint-disable-line
  const clonedResponse = response.clone()
  const fullfilled = response.ok && response.status < 400
  if (fullfilled) event.waitUntil(addToCache(request, clonedResponse))
  return response
}

/**
 * Use the cache to serve `asset` or `page`.
 *
 * @param {Object} request Request from `Service Worker`.
 * @returns {Promise} Response from cache.
 */
const matchRequest = request => caches.match(request)

/**
 * Strategy that uses network first and fallback to cache.
 * If the user is offline, fallback to `/offline`.
 *
 * @param {Object} request Request from `Service Worker`.
 * @param {Object} event Fetch event.
 * @returns {Promise} Response from network or cache.
 */
const networkFirst = async (request, event) => {
  const response = await fetchRequest(request, event)
    .catch(() => matchRequest(request))
  if (response) return response
  return matchRequest('/offline')
}

/**
 * Strategy that uses cache first and fallback to network.
 *
 * @param {Object} request Request from `Service Worker`.
 * @param {Object} event Fetch event.
 * @returns {Promise} Response from cache or network.
 */
const cacheFirst = async (request, event) => {
  const response = await matchRequest(request)
  if (response) return response
  return fetchRequest(request, event)
}

self.addEventListener('install', event => event.waitUntil(installSW()))
self.addEventListener('activate', event => event.waitUntil(activateSW()))
self.addEventListener('fetch', event => {
  const { request } = event
  if (request.method !== 'GET') return
  if (request.referrerPolicy === 'unsafe-url') return
  if (request.mode === 'navigate') event.respondWith(networkFirst(request, event))
  else event.respondWith(cacheFirst(request, event))
})
