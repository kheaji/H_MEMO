// Service Worker 등록
// 브라우저가 Service Worker를 지원하는지 확인하고 등록

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[App] Service Worker 등록 성공:', registration.scope);

        // 업데이트 확인
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('[App] 새로운 Service Worker 발견');

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[App] 새 버전 사용 가능. 페이지를 새로고침하세요.');
              // 선택사항: 사용자에게 새로고침 알림
              // if (confirm('새 버전이 있습니다. 새로고침하시겠습니까?')) {
              //   window.location.reload();
              // }
            }
          });
        });
      })
      .catch((error) => {
        console.log('[App] Service Worker 등록 실패:', error);
      });
  });

  // Service Worker 메시지 수신
  navigator.serviceWorker.addEventListener('message', (event) => {
    console.log('[App] SW 메시지:', event.data);
  });

  // 네트워크 상태 모니터링
  window.addEventListener('online', () => {
    console.log('[App] 온라인 상태');
    showNetworkStatus('온라인');
  });

  window.addEventListener('offline', () => {
    console.log('[App] 오프라인 상태');
    showNetworkStatus('오프라인 모드 - 저장된 데이터만 사용 가능');
  });
} else {
  console.log('[App] Service Worker를 지원하지 않는 브라우저입니다.');
}

// 네트워크 상태 표시 (선택사항)
function showNetworkStatus(message) {
  // 간단한 알림 표시
  console.log('[Network]', message);
  // 필요시 UI에 표시
  // const statusEl = document.getElementById('networkStatus');
  // if (statusEl) {
  //   statusEl.textContent = message;
  // }
}
