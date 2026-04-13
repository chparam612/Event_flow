export function renderWelcome() {
    return `
        <div class="attendee-screen" id="welcome-screen" style="min-height:100vh; display:flex; flex-direction:column; padding:20px; background:var(--background-color); position:relative; overflow:hidden;">
            <!-- Ambient Glows -->
            <div style="position:absolute; top:-50px; left:-50px; width:200px; height:200px; background:var(--primary-glow); filter:blur(100px); opacity:0.2;"></div>
            <div style="position:absolute; bottom:100px; right:-50px; width:250px; height:250px; background:var(--secondary-color); filter:blur(120px); opacity:0.1;"></div>

            <header style="display:flex; justify-content:space-between; align-items:center; z-index:10; padding-top:20px;">
                <div class="glow-text" style="font-size:1.5rem; font-weight:800; letter-spacing:-1px;">EventFlow</div>
                <div style="display:flex; gap:12px;">
                    <button class="icon-btn glass" id="lang-switch-btn" style="width:44px; height:44px; border-radius:50%; display:flex; align-items:center; justify-content:center;">🌐</button>
                    <button class="icon-btn glass" id="how-it-works-btn" style="width:44px; height:44px; border-radius:50%; display:flex; align-items:center; justify-content:center;">❔</button>
                </div>
            </header>

            <main style="flex:1; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; z-index:10;">
                <div style="font-size:4rem; margin-bottom:20px; animation: slideUp 0.6s ease-out;">🏟️</div>
                <h1 style="font-size:2.4rem; font-weight:900; line-height:1.1; margin-bottom:15px; background: linear-gradient(135deg, #fff 50%, rgba(255,255,255,0.4) 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent;" data-i18n="welcome.headline">Level Up Your Match Day</h1>
                <p style="color:var(--text-muted); font-size:1.1rem; max-width:280px; margin-bottom:40px;" data-i18n="welcome.subtext">The smarter way to navigate NMS Ahmedabad.</p>
                
                <button class="cr-send-all-btn pulse" id="start-plan-btn" style="width:100%; max-width:300px; height:60px; font-size:1.1rem; border-radius:18px;" data-i18n="welcome.cta">GET STARTED</button>
            </main>

            <footer style="text-align:center; padding-bottom:20px; font-size:0.7rem; color:rgba(255,255,255,0.2); letter-spacing:1.5px; font-weight:700;">
                POWERED BY EVENTFLOW V2.0
            </footer>

            <style>
                @keyframes slideUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
            </style>
        </div>
    `;
}

export function initWelcome() {
    const langBtn = document.getElementById('lang-switch-btn');
    if (langBtn) {
        langBtn.onclick = () => {
            window.history.pushState(null, null, '/language');
            window.dispatchEvent(new Event('popstate'));
        };
    }
    
    const startBtn = document.getElementById('start-plan-btn');
    if (startBtn) {
        startBtn.onclick = () => {
             window.history.pushState(null, null, '/intake');
             window.dispatchEvent(new Event('popstate'));
        };
    }

    const howBtn = document.getElementById('how-it-works-btn');
    if (howBtn) {
        howBtn.onclick = () => {
            window.history.pushState(null, null, '/how-it-works');
            window.dispatchEvent(new Event('popstate'));
        };
    }

    if (window.applyTranslations) window.applyTranslations();
}
