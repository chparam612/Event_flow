export function renderEscort() {
    return `
        <div class="attendee-screen" id="escort-screen" style="min-height:100vh; background:var(--background-color); position:relative; overflow:hidden; display:flex; flex-direction:column; padding:0;">
            
            <header style="padding:20px; z-index:100; background:rgba(8,12,20,0.8); backdrop-filter:blur(20px); border-bottom:1px solid var(--glass-border); display:flex; align-items:center; gap:15px;">
                <button class="icon-btn glass" id="escort-back-btn" style="width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:none; color:#fff;">&larr;</button>
                <div style="flex:1;">
                    <h1 style="font-size:1.1rem; font-weight:800; color:#fff;">Navigation</h1>
                    <div style="display:flex; align-items:center; gap:5px;">
                        <span class="dot pulse" style="background:var(--primary-color);"></span>
                        <span style="font-size:0.65rem; font-weight:700; color:var(--text-muted); letter-spacing:1px; text-transform:uppercase;">SPATIAL GUIDANCE ACTIVE</span>
                    </div>
                </div>
            </header>

            <main style="flex:1; position:relative; background:#000;">
                <div id="escort-map-container" style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; flex-direction:column; gap:15px;">
                    <div class="spinner"></div>
                    <p style="color:var(--text-muted); font-size:0.8rem; letter-spacing:1px; font-weight:700;">INITIALIZING MAP CONTEXT...</p>
                </div>

                <!-- Instruction Panel -->
                <div class="premium-card glass slide-up-in" style="position:absolute; bottom:20px; left:20px; right:20px; padding:25px; z-index:100; border-top: 1px solid var(--glass-border);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                        <span style="font-size:0.65rem; font-weight:900; color:var(--primary-color); letter-spacing:2px; text-transform:uppercase;" id="escort-step-count">STEP 1 OF 4</span>
                        <span style="font-family:var(--font-tech); font-size:0.75rem; color:var(--text-muted);">LIVE</span>
                    </div>

                    <div id="escort-step-body" style="display:flex; gap:15px; align-items:center; margin-bottom:25px;">
                        <div style="font-size:2.5rem;" id="step-icon">🚇</div>
                        <h2 style="font-size:1.1rem; font-weight:700; color:#fff; line-height:1.4;" id="step-text">Calculating optimal route...</h2>
                    </div>

                    <div style="display:grid; grid-template-columns:1fr 2fr; gap:12px;">
                        <button class="cr-sim-btn" id="escort-prev" disabled style="height:50px;">BACK</button>
                        <button class="cr-send-all-btn" id="escort-next" style="height:50px;">NEXT STEP</button>
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
        { icon: 'Stadium', instruction: 'Follow signs for North Stand (Level 1)' }
    ];

    const stepCountEl = document.getElementById('escort-step-count');
    const stepTextEl = document.getElementById('step-text');
    const stepIconEl = document.getElementById('step-icon');
    const nextBtn = document.getElementById('escort-next');
    const prevBtn = document.getElementById('escort-prev');
    const backBtn = document.getElementById('escort-back-btn');

    const updateStep = () => {
        const data = stepsData[currentStep];
        if (stepCountEl) stepCountEl.innerText = `STEP ${currentStep + 1} OF ${stepsData.length}`;
        if (stepTextEl) stepTextEl.innerText = data.instruction;
        if (stepIconEl) stepIconEl.innerText = data.icon === 'Stadium' ? '🏟️' : data.icon;
        
        if (prevBtn) prevBtn.disabled = currentStep === 0;
        if (nextBtn) {
            nextBtn.innerText = currentStep === stepsData.length - 1 ? 'FINISH' : 'NEXT STEP';
        }
    };

    nextBtn?.addEventListener('click', () => {
        if (currentStep < stepsData.length - 1) {
            currentStep++;
            updateStep();
        } else {
            window.navigate('/plan');
        }
    });

    prevBtn?.addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            updateStep();
        }
    });

    backBtn?.addEventListener('click', () => {
        window.navigate('/plan');
    });

    // Simulated Map Placeholder
    const mapContainer = document.getElementById('escort-map-container');
    if (mapContainer) {
        setTimeout(() => {
            mapContainer.innerHTML = `
                <div style="color:var(--primary-color); font-weight:800; font-size:1.2rem; opacity:0.3; letter-spacing:4px;">GOOGLE MAPS VIEW</div>
                <div style="font-size:0.7rem; color:var(--text-muted);">SIMULATED SPATIAL LAYER</div>
            `;
        }, 1200);
    }

    if (window.applyTranslations) window.applyTranslations();
    updateStep();
}
