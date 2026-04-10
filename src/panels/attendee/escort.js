export function renderEscort() {
    return `
        <div class="attendee-screen" id="escort-screen">
            <header class="attendee-top-bar glass">
                <button class="icon-btn" id="escort-back-btn">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                </button>
                <div class="header-title">Navigation</div>
                <div style="width: 40px;"></div>
            </header>

            <main class="escort-content scrollable-content">
                <div class="escort-map-view" id="escort-map-container">
                    <div class="map-loading">
                        <div class="spinner"></div>
                        <span>Initializing Spatial Context...</span>
                    </div>
                </div>

                <div class="escort-instruction-panel slide-up-in">
                    <div class="panel-handle"></div>
                    <div class="escort-progress-text" id="escort-step-count">Step 1 of 4</div>
                    <div class="escort-instruction-body" id="escort-step-body">
                        <div class="instruction-icon">🧭</div>
                        <h2 class="escort-instruction-text">Calculating optimal route...</h2>
                    </div>
                    <div class="escort-actions">
                        <button class="secondary-btn" id="escort-prev" disabled>Previous</button>
                        <button class="primary-btn" id="escort-next">Next Step →</button>
                    </div>
                </div>
            </main>
        </div>
    `;
}

export function initEscort() {
    let currentStep = 0;
    const stepsData = [
        { icon: '🚇', instruction: 'Exit Metro Station via South Gate' },
        { icon: '🚶', instruction: 'Walk 400m towards Gate B (straight ahead)' },
        { icon: '🚪', instruction: 'Enter Gate B - Show your QR code' },
        { icon: '🏟️', instruction: 'Follow signs for North Stand (Level 1)' }
    ];

    const stepCountEl = document.getElementById('escort-step-count');
    const stepBodyEl = document.getElementById('escort-step-body');
    const nextBtn = document.getElementById('escort-next');
    const prevBtn = document.getElementById('escort-prev');
    const backBtn = document.getElementById('escort-back-btn');

    const updateStep = () => {
        const data = stepsData[currentStep];
        if (stepCountEl) {
            stepCountEl.innerText = 'Step ' + (currentStep + 1) + ' of ' + stepsData.length;
        }
        if (stepBodyEl) {
            stepBodyEl.innerHTML = '<div class="instruction-icon">' + data.icon + '</div>' + 
                                   '<h2 class="escort-instruction-text">' + data.instruction + '</h2>';
        }
        
        if (prevBtn) prevBtn.disabled = currentStep === 0;
        if (nextBtn) {
            nextBtn.innerText = currentStep === stepsData.length - 1 ? 'Finish' : 'Next Step →';
        }
    };

    nextBtn?.addEventListener('click', () => {
        if (currentStep < stepsData.length - 1) {
            currentStep++;
            updateStep();
        } else {
            window.history.pushState(null, null, '/plan');
            window.dispatchEvent(new Event('popstate'));
        }
    });

    prevBtn?.addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            updateStep();
        }
    });

    backBtn?.addEventListener('click', () => {
        window.history.pushState(null, null, '/plan');
        window.dispatchEvent(new Event('popstate'));
    });

    // Simulated Map Placeholder
    const mapContainer = document.getElementById('escort-map-container');
    if (mapContainer) {
        setTimeout(() => {
            mapContainer.innerHTML = 'Map View Ready';
        }, 800);
    }

    if (window.applyTranslations) window.applyTranslations();
    updateStep();
}
