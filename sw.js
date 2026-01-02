// Service Worker - H_Memo
// 오프라인에서도 앱이 작동하도록 하는 기능

const CACHE_NAME = 'h-memo-v1';

// 캐시할 파일 목록
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/js/sw-register.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Service Worker 설치
self.addEventListener('install', (event) => {
  console.log('[SW] Install');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[SW] Cache complete');
        return self.skipWaiting(); // 즉시 활성화
      })
  );
});

// Service Worker 활성화
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // 이전 버전의 캐시 삭제
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Claiming clients');
      return self.clients.claim(); // 즉시 제어권 가져오기
    })
  );
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 캐시에 있으면 캐시된 버전 반환
        if (response) {
          console.log('[SW] Serving from cache:', event.request.url);
          return response;
        }

        // 캐시에 없으면 네트워크에서 가져오기
        console.log('[SW] Fetching from network:', event.request.url);
        return fetch(event.request).then((response) => {
          // 유효한 응답이 아니면 그냥 반환
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // 응답을 복제하여 캐시에 저장
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        });
      })
      .catch((error) => {
        console.log('[SW] Fetch failed:', error);
        // 오프라인 상태에서 기본 페이지 반환 (선택사항)
        return caches.match('/index.html');
      })
  );
});
