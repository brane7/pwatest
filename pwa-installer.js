/**
 * PWA 설치 프롬프트 기능
 * 모듈화된 PWA 설치 관리자
 */

class PWAInstaller {
    constructor() {
        this.deferredPrompt = null;
        this.installButton = null;
        this.isInstalled = false;
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
            this.isInstalled = true;
            this.hideInstallButton();
            this.deferredPrompt = null;
            this.showInstallSuccessMessage();
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
        console.log('앱 설치 상태:', this.isInstalled);
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
        if (isPWAReady && hasManifest && hasServiceWorker && !this.isInstalled) {
            console.log('🎉 PWA 설치 조건 충족!');

            // HTTPS 환경에서는 더 적극적으로 설치 버튼 표시
            if (isHTTPS) {
                console.log('🚀 HTTPS 환경 - PWA 설치 버튼 표시!');
                setTimeout(() => {
                    this.showInstallButton();
                }, 1000);
            } else if (isLocalhost) {
                // 로컬호스트에서는 beforeinstallprompt 이벤트가 발생하지 않았을 때만 표시
                if (!this.deferredPrompt) {
                    setTimeout(() => {
                        this.showInstallButton();
                    }, 1000);
                }
            }
        } else {
            console.log('❌ PWA 설치 조건 미충족:');
            if (!isPWAReady) console.log('- HTTPS 또는 로컬호스트 환경이 아님');
            if (!hasManifest) console.log('- 매니페스트 파일 없음');
            if (!hasServiceWorker) console.log('- ServiceWorker 미지원');
            if (this.isInstalled) console.log('- 이미 앱이 설치됨');
        }

        // 추가 PWA 검증
        this.validatePWAComponents();
    }

    // PWA 구성 요소 검증
    validatePWAComponents() {
        console.log('🔍 PWA 구성 요소 상세 검증 중...');

        // 매니페스트 링크 확인
        const manifestLink = document.querySelector('link[rel="manifest"]');
        if (manifestLink) {
            console.log('매니페스트 링크:', manifestLink.href);

            // 매니페스트 내용 가져오기
            fetch(manifestLink.href)
                .then(response => {
                    console.log('매니페스트 응답 상태:', response.status);
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error(`매니페스트 로드 실패: ${response.status}`);
                    }
                })
                .then(manifest => {
                    console.log('매니페스트 내용:', manifest);
                    console.log('아이콘 정보:', manifest.icons);

                    // 아이콘 파일 존재 여부 확인
                    if (manifest.icons && manifest.icons.length > 0) {
                        const iconSrc = manifest.icons[0].src;
                        console.log('아이콘 경로:', iconSrc);

                        fetch(iconSrc, { method: 'HEAD' })
                            .then(iconResponse => {
                                console.log('아이콘 파일 상태:', iconResponse.status);
                                if (iconResponse.ok) {
                                    console.log('✅ 아이콘 파일 정상');
                                } else {
                                    console.log('❌ 아이콘 파일 문제:', iconResponse.status);
                                }
                            })
                            .catch(iconError => {
                                console.log('❌ 아이콘 파일 확인 실패:', iconError);
                            });
                    }
                })
                .catch(error => {
                    console.log('❌ 매니페스트 파싱 실패:', error);
                });
        }

        // ServiceWorker 상태 확인
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations()
                .then(registrations => {
                    console.log('등록된 ServiceWorker:', registrations.length);
                    registrations.forEach((registration, index) => {
                        console.log(`ServiceWorker ${index}:`, registration.active ? '활성' : '비활성');
                    });
                })
                .catch(error => {
                    console.log('ServiceWorker 상태 확인 실패:', error);
                });
        }
    }

    showInstallButton() {
        // 이미 설치된 경우 버튼 표시하지 않음
        if (this.isInstalled) {
            console.log('앱이 이미 설치되어 있어 설치 버튼을 표시하지 않습니다.');
            return;
        }

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

    // 설치 성공 메시지 표시
    showInstallSuccessMessage() {
        const gameContainer = document.querySelector('.game-container');
        if (!gameContainer) return;

        const successMessage = document.createElement('div');
        successMessage.className = 'install-success';
        successMessage.style.cssText = `
            background: #d4edda;
            border: 2px solid #28a745;
            border-radius: 15px;
            padding: 15px;
            margin-top: 15px;
            text-align: center;
            color: #155724;
            font-weight: bold;
            animation: fadeIn 0.5s ease-in;
        `;
        successMessage.textContent = '🎉 앱이 성공적으로 설치되었습니다!';

        gameContainer.appendChild(successMessage);

        // 5초 후 메시지 제거
        setTimeout(() => {
            if (successMessage.parentElement) {
                successMessage.remove();
            }
        }, 5000);
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
                // 설치 성공 시 버튼 숨김
                this.hideInstallButton();
            } else {
                console.log('사용자가 앱 설치를 거부했습니다');
            }

            this.deferredPrompt = null;
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

// 전역으로 내보내기
window.PWAInstaller = PWAInstaller;
