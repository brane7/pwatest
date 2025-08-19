/**
 * 메인 초기화 파일
 * 모듈화된 구조로 게임과 PWA 설치 기능을 통합
 */

// 서비스 워커 등록 (PWA 지원)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // ServiceWorker 등록 (외부 파일 사용)
        const swPath = '/pwatest/sw.js';

        navigator.serviceWorker.register(swPath)
            .then(registration => {
                console.log('SW 등록 성공:', registration);
            })
            .catch(error => {
                console.log('SW 등록 실패:', error);
                console.log('ServiceWorker 없이도 PWA 설치 기능은 작동할 수 있습니다');
            });
    });
}

// PWA 설치 기능 초기화
document.addEventListener('DOMContentLoaded', () => {
    // CSS 애니메이션 추가
    addCSSAnimations();

    // 게임 시작
    new ClickGame();

    // PWA 설치 기능 시작
    new PWAInstaller();

    console.log('🎮 클릭 게임이 시작되었습니다!');
    console.log('💡 스페이스바를 눌러서도 클릭할 수 있어요!');
    console.log('📱 PWA 설치 기능이 활성화되었습니다!');
    console.log('🔧 모듈화된 구조로 코드가 정리되었습니다!');
});