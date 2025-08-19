const CACHE_NAME = 'click-game-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/main.js?v=1.0.0',
    '/button.png?v=1.0.0',
    '/manifest.json?v=1.0.0'
];

// ServiceWorker 설치 시 캐시에 파일들을 저장
self.addEventListener('install', (event) => {
    console.log('ServiceWorker 설치 중...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('캐시가 열렸습니다');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('모든 파일이 캐시에 저장되었습니다');
                return self.skipWaiting();
            })
    );
});

// 활성화 시 이전 캐시 정리
self.addEventListener('activate', (event) => {
    console.log('ServiceWorker 활성화 중...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('이전 캐시를 삭제합니다:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', (event) => {
    const request = event.request;

    // 네비게이션 요청 (HTML 페이지)은 항상 캐시 우선
    if (request.mode === 'navigate') {
        event.respondWith(
            caches.match(request)
                .then((response) => {
                    if (response) {
                        return response;
                    }
                    return fetch(request);
                })
                .catch(() => {
                    return caches.match('/index.html');
                })
        );
        return;
    }

    // 다른 요청들은 캐시 우선, 네트워크 폴백
    event.respondWith(
        caches.match(request)
            .then((response) => {
                if (response) {
                    return response;
                }

                return fetch(request)
                    .then((response) => {
                        if (response && response.status === 200) {
                            const responseToCache = response.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(request, responseToCache);
                                });
                        }
                        return response;
                    })
                    .catch(() => {
                        return caches.match(request);
                    });
            })
    );
});
