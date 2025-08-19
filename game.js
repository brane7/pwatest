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

// 전역으로 내보내기
window.ClickGame = ClickGame;
window.addCSSAnimations = addCSSAnimations;
