/**
 * 클릭 게임 메인 로직
 * Cocos Creator 3.8.x 스타일로 작성
 */

class ClickGame {
    constructor() {
        this.score = 0;
        this.clickCount = 0;
        this.clicksPerSecond = 0;
        this.lastClickTime = 0;
        this.clickTimes = [];

        this.init();
    }

    /**
     * 게임 초기화
     */
    init() {
        this.bindEvents();
        this.loadGameData();
        this.startStatsUpdate();
    }

    /**
     * 이벤트 바인딩
     */
    bindEvents() {
        const clickButton = document.getElementById('clickButton');
        const resetButton = document.getElementById('resetButton');

        if (clickButton) {
            clickButton.addEventListener('click', () => this.onClick());
        }

        if (resetButton) {
            resetButton.addEventListener('click', () => this.resetGame());
        }

        // 키보드 이벤트 (스페이스바로도 클릭 가능)
        document.addEventListener('keydown', (event) => {
            if (event.code === 'Space') {
                event.preventDefault();
                this.onClick();
            }
        });
    }

    /**
     * 클릭 이벤트 처리
     */
    onClick() {
        this.score++;
        this.clickCount++;

        const currentTime = Date.now();
        this.clickTimes.push(currentTime);

        // 1초 이전의 클릭 기록 제거
        this.clickTimes = this.clickTimes.filter(time => currentTime - time <= 1000);

        // 초당 클릭 수 계산
        this.clicksPerSecond = this.clickTimes.length;

        this.updateUI();
        this.saveGameData();
        this.createClickEffect();
    }

    /**
     * 클릭 효과 생성
     */
    createClickEffect() {
        const clickButton = document.getElementById('clickButton');
        if (!clickButton) return;

        // 클릭 애니메이션
        clickButton.style.transform = 'scale(0.95)';
        setTimeout(() => {
            clickButton.style.transform = 'scale(1)';
        }, 100);

        // 점수 증가 애니메이션
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.style.transform = 'scale(1.2)';
            scoreElement.style.color = '#ff6b6b';
            setTimeout(() => {
                scoreElement.style.transform = 'scale(1)';
                scoreElement.style.color = '#333';
            }, 200);
        }
    }

    /**
     * UI 업데이트
     */
    updateUI() {
        const scoreElement = document.getElementById('score');
        const clickCountElement = document.getElementById('clickCount');
        const clicksPerSecondElement = document.getElementById('clicksPerSecond');

        if (scoreElement) {
            scoreElement.textContent = this.formatNumber(this.score);
        }

        if (clickCountElement) {
            clickCountElement.textContent = this.formatNumber(this.clickCount);
        }

        if (clicksPerSecondElement) {
            clicksPerSecondElement.textContent = this.formatNumber(this.clicksPerSecond);
        }
    }

    /**
     * 숫자 포맷팅 (천 단위 콤마)
     */
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    /**
     * 게임 리셋
     */
    resetGame() {
        if (confirm('정말로 게임을 리셋하시겠습니까?')) {
            this.score = 0;
            this.clickCount = 0;
            this.clicksPerSecond = 0;
            this.clickTimes = [];

            this.updateUI();
            this.saveGameData();

            // 리셋 효과
            const gameContainer = document.querySelector('.game-container');
            if (gameContainer) {
                gameContainer.style.animation = 'shake 0.5s ease-in-out';
                setTimeout(() => {
                    gameContainer.style.animation = '';
                }, 500);
            }
        }
    }

    /**
     * 게임 데이터 저장 (로컬 스토리지)
     */
    saveGameData() {
        const gameData = {
            score: this.score,
            clickCount: this.clickCount,
            timestamp: Date.now()
        };

        try {
            localStorage.setItem('clickGameData', JSON.stringify(gameData));
        } catch (error) {
            console.warn('게임 데이터 저장 실패:', error);
        }
    }

    /**
     * 게임 데이터 로드 (로컬 스토리지)
     */
    loadGameData() {
        try {
            const savedData = localStorage.getItem('clickGameData');
            if (savedData) {
                const gameData = JSON.parse(savedData);

                // 24시간 이내 데이터만 로드
                const oneDay = 24 * 60 * 60 * 1000;
                if (Date.now() - gameData.timestamp < oneDay) {
                    this.score = gameData.score || 0;
                    this.clickCount = gameData.clickCount || 0;
                    this.updateUI();
                }
            }
        } catch (error) {
            console.warn('게임 데이터 로드 실패:', error);
        }
    }

    /**
     * 통계 업데이트 시작
     */
    startStatsUpdate() {
        setInterval(() => {
            this.updateUI();
        }, 100);
    }
}

// CSS 애니메이션 추가
function addCSSAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .score {
            animation: pulse 2s infinite;
        }
    `;
    document.head.appendChild(style);
}

// 서비스 워커 등록 (PWA 지원)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // ServiceWorker 등록 (외부 파일 사용)
        const swPath = './sw.js';

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

// PWA 설치 프롬프트 기능
class PWAInstaller {
    constructor() {
        this.deferredPrompt = null;
        this.installButton = null;
        this.init();
    }

    init() {
        this.createInstallButton();
        this.bindEvents();
    }

    createInstallButton() {
        // 설치 버튼 생성
        const gameContainer = document.querySelector('.game-container');
        console.log('게임 컨테이너 찾기:', gameContainer);

        if (gameContainer) {
            console.log('설치 버튼 생성 시작');
            this.installButton = document.createElement('button');
            this.installButton.className = 'install-button';
            this.installButton.textContent = '📱 앱 설치하기';
            this.installButton.style.cssText = `
                background: #27ae60;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 25px;
                cursor: pointer;
                font-size: 16px;
                margin-top: 15px;
                transition: background 0.3s ease;
                display: none;
                position: relative;
                z-index: 1000;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            `;

            this.installButton.addEventListener('mouseenter', () => {
                this.installButton.style.background = '#229954';
            });

            this.installButton.addEventListener('mouseleave', () => {
                this.installButton.style.background = '#27ae60';
            });

            gameContainer.appendChild(this.installButton);
            console.log('설치 버튼이 DOM에 추가됨:', this.installButton);

            // 개발 환경에서는 테스트 버튼 표시
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                const testButton = document.createElement('button');
                testButton.textContent = '🧪 설치 버튼 테스트';
                testButton.style.cssText = `
                    background: #e74c3c;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 15px;
                    cursor: pointer;
                    font-size: 14px;
                    margin-top: 10px;
                    margin-left: 10px;
                `;
                testButton.addEventListener('click', () => {
                    console.log('테스트 버튼 클릭됨 - 설치 버튼 수동 표시');
                    this.showInstallButton();
                });
                gameContainer.appendChild(testButton);
            }

        } else {
            console.error('게임 컨테이너를 찾을 수 없습니다!');
        }
    }

    bindEvents() {
        console.log('이벤트 바인딩 시작');

        // beforeinstallprompt 이벤트 리스너
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('🎉 beforeinstallprompt 이벤트 발생!');
            console.log('이벤트 객체:', e);
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });

        // 설치 완료 이벤트 리스너
        window.addEventListener('appinstalled', () => {
            console.log('앱이 성공적으로 설치되었습니다!');
            this.hideInstallButton();
            this.deferredPrompt = null;
        });

        // 설치 버튼 클릭 이벤트
        if (this.installButton) {
            this.installButton.addEventListener('click', () => {
                console.log('설치 버튼 클릭됨');
                this.installApp();
            });
        } else {
            console.error('설치 버튼이 생성되지 않았습니다!');
        }

        // PWA 설치 가능 여부 확인
        this.checkPWAInstallability();

        // 페이지 로드 후 상태 확인
        setTimeout(() => {
            this.logPWAStatus();
        }, 2000);
    }

    // PWA 상태 로깅
    logPWAStatus() {
        console.log('=== PWA 상태 확인 ===');
        console.log('설치 버튼 존재:', !!this.installButton);
        console.log('deferredPrompt 상태:', !!this.deferredPrompt);
        console.log('ServiceWorker 지원:', 'serviceWorker' in navigator);
        console.log('현재 URL:', window.location.href);
        console.log('HTTPS 여부:', window.location.protocol === 'https:');
        console.log('로컬호스트 여부:', window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    }

    // PWA 설치 가능 여부 확인
    checkPWAInstallability() {
        console.log('PWA 설치 가능 여부 확인 중...');

        // 기본 PWA 조건 확인
        const hasManifest = !!document.querySelector('link[rel="manifest"]');
        const hasServiceWorker = 'serviceWorker' in navigator;
        const isHTTPS = window.location.protocol === 'https:';
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const isPWAReady = isHTTPS || isLocalhost;

        console.log('매니페스트 존재:', hasManifest);
        console.log('ServiceWorker 지원:', hasServiceWorker);
        console.log('HTTPS 환경:', isHTTPS);
        console.log('로컬호스트 환경:', isLocalhost);
        console.log('PWA 준비 상태:', isPWAReady);

        // PWA 설치 조건이 충족되면 설치 버튼 표시
        if (isPWAReady && hasManifest && hasServiceWorker) {
            console.log('🎉 PWA 설치 조건 충족!');
            // beforeinstallprompt 이벤트가 발생하지 않았을 때도 버튼 표시
            if (!this.deferredPrompt) {
                setTimeout(() => {
                    this.showInstallButton();
                }, 1000);
            }
        } else {
            console.log('❌ PWA 설치 조건 미충족:');
            if (!isPWAReady) console.log('- HTTPS 또는 로컬호스트 환경이 아님');
            if (!hasManifest) console.log('- 매니페스트 파일 없음');
            if (!hasServiceWorker) console.log('- ServiceWorker 미지원');
        }
    }

    showInstallButton() {
        console.log('showInstallButton 호출됨');
        if (this.installButton) {
            console.log('설치 버튼 표시 시도');
            this.installButton.style.display = 'inline-block';
            this.installButton.style.animation = 'fadeIn 0.5s ease-in';
            console.log('설치 버튼이 표시되었습니다');

            // 버튼이 실제로 보이는지 확인
            setTimeout(() => {
                const rect = this.installButton.getBoundingClientRect();
                console.log('설치 버튼 위치:', rect);
                console.log('설치 버튼 가시성:', rect.width > 0 && rect.height > 0);
            }, 100);
        } else {
            console.error('설치 버튼이 존재하지 않습니다!');
        }
    }

    hideInstallButton() {
        if (this.installButton) {
            console.log('설치 버튼 숨김');
            this.installButton.style.display = 'none';
        }
    }

    async installApp() {
        console.log('installApp 호출됨');
        console.log('deferredPrompt 상태:', this.deferredPrompt);

        if (!this.deferredPrompt) {
            console.log('설치 프롬프트가 준비되지 않았습니다');

            // HTTPS 환경에서는 브라우저 기본 PWA 설치 방법 안내
            if (window.location.protocol === 'https:') {
                this.showHTTPSInstallGuide();
                return;
            }

            // 로컬호스트 환경에서는 수동 설치 안내
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                this.showLocalhostInstallGuide();
                return;
            }

            console.log('PWA 설치 조건을 확인해주세요:');
            console.log('1. HTTPS 환경 또는 로컬호스트인지 확인');
            console.log('2. manifest.json이 올바른지 확인');
            console.log('3. ServiceWorker가 등록되었는지 확인');
            return;
        }

        try {
            console.log('설치 프롬프트 표시 시도...');
            // 설치 프롬프트 표시
            this.deferredPrompt.prompt();

            // 사용자 응답 대기
            const { outcome } = await this.deferredPrompt.userChoice;
            console.log('사용자 응답:', outcome);

            if (outcome === 'accepted') {
                console.log('사용자가 앱 설치를 수락했습니다');
            } else {
                console.log('사용자가 앱 설치를 거부했습니다');
            }

            this.deferredPrompt = null;
            this.hideInstallButton();
        } catch (error) {
            console.error('앱 설치 중 오류 발생:', error);
        }
    }

    // 로컬호스트 환경에서 PWA 설치 안내
    showLocalhostInstallGuide() {
        const guide = `
            🧪 로컬호스트 환경에서 PWA 테스트하기:
            
            1. Chrome 브라우저에서 F12 개발자 도구 열기
            2. Application 탭으로 이동
            3. Manifest 섹션에서 "Add to home screen" 클릭
            4. 또는 주소창에 "chrome://flags/#bypass-app-banner-engagement-checks" 입력
            5. "Bypass app banner engagement checks" 찾아서 "Enabled"로 설정
            6. 브라우저 재시작 후 페이지 새로고침
        `;

        console.log(guide);
        this.showInstallGuideOnScreen('로컬호스트', guide);
    }

    // HTTPS 환경에서 PWA 설치 안내
    showHTTPSInstallGuide() {
        const userAgent = navigator.userAgent;
        let browserName = 'Unknown';
        let installGuide = '';

        if (userAgent.includes('Chrome')) {
            browserName = 'Chrome';
            installGuide = `
                🚀 Chrome에서 PWA 설치하기:
                
                1. 주소창 오른쪽의 📱 아이콘 클릭
                2. "클릭 게임 설치" 클릭
                3. "설치" 버튼 클릭
                
                📱 아이콘이 보이지 않는 경우:
                
                1. 페이지를 새로고침하세요
                2. 몇 초 기다린 후 다시 확인
                3. 또는 주소창에 "chrome://flags/#bypass-app-banner-engagement-checks" 입력
                4. "Bypass app banner engagement checks" 찾기
                5. "Enabled"로 설정 후 브라우저 재시작
            `;
        } else if (userAgent.includes('Firefox')) {
            browserName = 'Firefox';
            installGuide = `
                🦊 Firefox에서 PWA 설치하기:
                
                1. 주소창 오른쪽의 메뉴 버튼 클릭
                2. "페이지 정보" 선택
                3. "이 사이트를 앱으로 설치" 클릭
            `;
        } else if (userAgent.includes('Safari')) {
            browserName = 'Safari';
            installGuide = `
                🍎 Safari에서 PWA 설치하기:
                
                1. 공유 버튼 클릭
                2. "홈 화면에 추가" 선택
                3. "추가" 클릭
            `;
        } else if (userAgent.includes('Edge')) {
            browserName = 'Edge';
            installGuide = `
                🌐 Edge에서 PWA 설치하기:
                
                1. 주소창 오른쪽의 메뉴 버튼 클릭
                2. "앱 설치" 선택
                3. "설치" 클릭
            `;
        }

        console.log(`${browserName} 브라우저 감지됨`);
        console.log(installGuide);

        // 브라우저별 설치 안내를 화면에 표시
        this.showInstallGuideOnScreen(browserName, installGuide);
    }

    // 화면에 설치 안내 표시
    showInstallGuideOnScreen(browserName, installGuide) {
        const gameContainer = document.querySelector('.game-container');
        if (!gameContainer) return;

        // 기존 안내 제거
        const existingGuide = document.querySelector('.install-guide');
        if (existingGuide) {
            existingGuide.remove();
        }

        // 새로운 안내 생성
        const guideElement = document.createElement('div');
        guideElement.className = 'install-guide';
        guideElement.style.cssText = `
            background: #f8f9fa;
            border: 2px solid #007bff;
            border-radius: 15px;
            padding: 20px;
            margin-top: 20px;
            text-align: left;
            font-size: 14px;
            line-height: 1.6;
            max-width: 400px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        `;

        guideElement.innerHTML = `
            <h3 style="margin: 0 0 15px 0; color: #007bff;">📱 ${browserName}에서 PWA 설치하기</h3>
            <div style="white-space: pre-line; color: #333;">${installGuide}</div>
            <button onclick="this.parentElement.remove()" style="
                background: #6c757d;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 8px;
                cursor: pointer;
                margin-top: 15px;
                font-size: 12px;
            ">닫기</button>
        `;

        gameContainer.appendChild(guideElement);
    }
}

// PWA 설치 기능 초기화
document.addEventListener('DOMContentLoaded', () => {
    addCSSAnimations();
    new ClickGame();
    new PWAInstaller(); // PWA 설치 기능 추가

    console.log('🎮 클릭 게임이 시작되었습니다!');
    console.log('💡 스페이스바를 눌러서도 클릭할 수 있어요!');
    console.log('📱 PWA 설치 기능이 활성화되었습니다!');
});