const precache = '/offline'

const installSW = async () => {
  const cache = await caches.open('pages')
  await cache.add(precache)
  self.skipWaiting()
}

const addToCache = async request => {
  const storage = request.mode === 'navigate' ? 'pages' : 'assets'
  const cache = await caches.open(storage)

  if (storage === 'assets') {
    const path = request.url.replace(request.referrer, '')
    const [filename = 0, hash = 1, extension = 2] = path.split('.')
    const currentlyCached = await cache.keys()
    const [outdated = 0] = currentlyCached
      .filter(({url}) => (url.includes(filename) && url.includes(extension)))
    cache.delete(outdated)
  }

  cache.add(request)
}

const fetchRequest = async (request, event) => {
  const response = await fetch(request)
  const fullfilled = response.ok && response.status < 400
  if (fullfilled) event.waitUntil(addToCache(request))
  return response
}

const matchRequest = request => caches.match(request)

const networkFirst = async (request, event) => {
  const response = await fetchRequest(request, event)
    .catch(() => matchRequest(request))
  if (response) return response
  return matchRequest('/offline')
}

const cacheFirst = async (request, event) => {
  const response = await matchRequest(request)
  if (response) return response
  return fetchRequest(request, event)
}

self.addEventListener('install', event => event.waitUntil(installSW()))

self.addEventListener('activate', event => event.waitUntil(self.clients.claim()))

self.addEventListener('fetch', event => {
  const { request } = event
  if (request.method !== 'GET') return
  if (request.referrerPolicy === 'unsafe-url') return

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, event))
    return
  }

  event.respondWith(cacheFirst(request, event))
})
