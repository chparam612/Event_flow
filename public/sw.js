const CACHE_NAME = 'eventflow-v2';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/src/styles/attendee.css',
    '/src/styles/staff.css',
    '/src/styles/control.css',
    '/js/router.js',
    '/src/i18nHelper.js',
    '/src/firebase.js',
    '/src/simulation.js',
    '/src/mapHelper.js',
    '/src/panels/attendee/welcome.js',
    '/src/panels/attendee/language.js',
    '/src/panels/attendee/intake.js',
    '/src/panels/attendee/plan.js',
    '/src/panels/attendee/escort.js',
    '/src/panels/attendee/during.js',
    '/src/panels/attendee/exit.js',
    '/src/panels/attendee/feedback.js',
    '/src/panels/attendee/help.js',
    '/src/panels/attendee/how.js',
    '/src/panels/staff/dashboard.js',
    '/src/panels/controlroom/dashboard.js',
    // i18n
    '/src/i18n/ar.json',
    '/src/i18n/en.json',
    '/src/i18n/es.json',
    '/src/i18n/hi.json',
    '/src/i18n/zh.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(STATIC_ASSETS);
            })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // Ignore external requests like Google Maps or Firebase
    if (!event.request.url.startsWith(self.location.origin)) return;

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response; // Return from cache
                }
                // Fallback to network
                return fetch(event.request).then(
                    function(response) {
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        // Clone the response to cache dynamically
                        var responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(function(cache) {
                                cache.put(event.request, responseToCache);
                            });
                        return response;
                    }
                );
            })
    );
});
