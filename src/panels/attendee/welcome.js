export function renderWelcome() {
    return `
        <div class="attendee-screen" id="welcome-screen">
            <div class="stadium-bg">
                <!-- Subtle Stadium Silhouette SVG -->
                <svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg" class="silhouette">
                    <path fill="var(--primary-glow)" d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,250.7C1248,256,1344,288,1392,304L1440,320L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    <path fill="rgba(255,255,255,0.03)" d="M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,186.7C672,203,768,181,864,154.7C960,128,1056,96,1152,90.7C1248,85,1344,107,1392,117.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                </svg>
            </div>
            
            <header class="attendee-top-bar">
                <div class="attendee-logo">EventFlow</div>
                <div style="display: flex; gap: 10px;">
                    <button class="icon-btn" id="lang-switch-btn" aria-label="Switch Language">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="2" y1="12" x2="22" y2="12"></line>
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                        </svg>
                    </button>
                    <button class="icon-btn" id="how-it-works-btn" aria-label="How it works">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                    </button>
                </div>
            </header>

            <main class="welcome-content">
                <h1 data-i18n="welcome.headline">Welcome to the Match!</h1>
                <p class="subtext" data-i18n="welcome.subtext">Navigate the world's largest cricket stadium smoothly.</p>
                
                <button class="primary-btn pulse-glow" id="start-plan-btn" data-i18n="welcome.cta" aria-label="start plan btn">Get My Match Plan</button>
            </main>
        </div>
    `;
}

export function initWelcome() {
    const langBtn = document.getElementById('lang-switch-btn');
    if (langBtn) {
        langBtn.addEventListener('click', () => {
            window.history.pushState(null, null, '/language');
            window.dispatchEvent(new Event('popstate'));
        });
    }
    
    const startBtn = document.getElementById('start-plan-btn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            window.history.pushState(null, null, '/intake');
            window.dispatchEvent(new Event('popstate'));
        });
    }

    const howBtn = document.getElementById('how-it-works-btn');
    if (howBtn) {
        howBtn.addEventListener('click', () => {
            window.history.pushState(null, null, '/how-it-works');
            window.dispatchEvent(new Event('popstate'));
        });
    }

    // Call i18n loader to ensure localized strings flow in correctly
    if (window.applyTranslations) window.applyTranslations();
}
