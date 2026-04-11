export function renderLanguage() {
    return `
        <div class="attendee-screen" id="language-screen">
            <header class="attendee-top-bar">
                <button class="icon-btn" id="back-btn" aria-label="Back">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                </button>
                <div class="spacer"></div>
            </header>

            <main class="lang-content">
                <h1 data-i18n="language.choose">Choose your language</h1>
                
                <div class="lang-grid">
                    <button class="lang-btn" data-lang="en" aria-label="Action button">English</button>
                    <button class="lang-btn" data-lang="hi" aria-label="Action button">हिंदी</button>
                    <button class="lang-btn" data-lang="gu" aria-label="Action button">ગુજરાતી</button>
                    <button class="lang-btn" data-lang="ta" aria-label="Action button">தமிழ்</button>
                    <button class="lang-btn" data-lang="te" aria-label="Action button">తెలుగు</button>
                </div>
            </main>
        </div>
    `;
}

export function initLanguage() {
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            // Alternatively we could go explicitly to '/' for Attendee Welcome
            window.history.pushState(null, null, '/');
            window.dispatchEvent(new Event('popstate'));
        });
    }

    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const selectedLang = e.currentTarget.getAttribute('data-lang');
            // Save preference
            localStorage.setItem('app_lang', selectedLang);
            
            // Re-apply translations globally before navigating
            if (window.applyTranslations) {
                await window.applyTranslations();
            }
            
            // Redirect back to welcome screen automatically
            window.history.pushState(null, null, '/');
            window.dispatchEvent(new Event('popstate'));
        });
    });

    if (window.applyTranslations) window.applyTranslations();
}
