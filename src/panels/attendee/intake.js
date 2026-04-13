import { syncIntake } from '/src/firebase.js';

export function renderIntake() {
    return `
        <div class="attendee-screen" id="intake-screen" style="min-height:100vh; display:flex; flex-direction:column; background:var(--background-color); position:relative; overflow:hidden;">
            <!-- Subtle Ambient Light -->
            <div style="position:absolute; top:-20px; right:-20px; width:150px; height:150px; background:var(--primary-glow); filter:blur(100px); opacity:0.1;"></div>

            <header style="padding:25px 20px; z-index:10; display:flex; align-items:center; gap:15px; background:rgba(8,12,20,0.5); backdrop-filter:blur(10px); border-bottom:1px solid var(--glass-border);">
                <button class="icon-btn glass" id="intake-back-btn" style="width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:none; color:#fff;">&larr;</button>
                <div style="flex:1;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                        <span style="font-size:0.65rem; font-weight:900; color:var(--text-muted); letter-spacing:1px; text-transform:uppercase;">MATCH PREPARATION</span>
                        <span style="font-family:var(--font-tech); font-size:0.75rem; color:var(--primary-color);" id="progress-text">1 / 5</span>
                    </div>
                    <div style="height:4px; background:rgba(255,255,255,0.05); border-radius:10px; overflow:hidden;">
                        <div id="progress-fill" style="height:100%; background:var(--primary-color); width:20%; transition:width 0.4s cubic-bezier(0.16, 1, 0.3, 1);"></div>
                    </div>
                </div>
            </header>

            <main style="flex:1; position:relative; overflow:hidden;">
                <div id="slider-track" style="display:flex; height:100%; transition:transform 0.5s cubic-bezier(0.16, 1, 0.3, 1); width:500%;">
                    
                    <!-- Q1 -->
                    <div class="intake-slide" style="width:20%; padding:30px 20px;">
                        <h2 style="font-size:1.8rem; font-weight:800; margin-bottom:10px; color:#fff;">Arrival Time</h2>
                        <p style="color:var(--text-muted); margin-bottom:30px; font-size:0.95rem;">When are you planning to reach the stadium?</p>
                        <div class="options-grid" style="display:grid; grid-template-columns:1fr; gap:12px;">
                            <button class="intake-opt premium-card glass" style="padding:18px; text-align:left; font-weight:600; font-size:1rem;" data-q="q1" data-val="Before 5 PM">Before 5 PM</button>
                            <button class="intake-opt premium-card glass" style="padding:18px; text-align:left; font-weight:600; font-size:1rem;" data-q="q1" data-val="5-6 PM">5-6 PM</button>
                            <button class="intake-opt premium-card glass" style="padding:18px; text-align:left; font-weight:600; font-size:1rem;" data-q="q1" data-val="6-7 PM">6-7 PM</button>
                            <button class="intake-opt premium-card glass" style="padding:18px; text-align:left; font-weight:600; font-size:1rem;" data-q="q1" data-val="After 7 PM">After 7 PM</button>
                        </div>
                    </div>

                    <!-- Q2 -->
                    <div class="intake-slide" style="width:20%; padding:30px 20px;">
                        <h2 style="font-size:1.8rem; font-weight:800; margin-bottom:10px; color:#fff;">Group Size</h2>
                        <p style="color:var(--text-muted); margin-bottom:30px; font-size:0.95rem;">How many people are in your party?</p>
                        <div class="options-grid" style="display:grid; grid-template-columns:1fr; gap:12px;">
                            <button class="intake-opt premium-card glass" style="padding:18px; text-align:left; font-weight:600; font-size:1rem;" data-q="q2" data-val="Just me">👤 Just me</button>
                            <button class="intake-opt premium-card glass" style="padding:18px; text-align:left; font-weight:600; font-size:1rem;" data-q="q2" data-val="2-3 people">👥 2-3 People</button>
                            <button class="intake-opt premium-card glass" style="padding:18px; text-align:left; font-weight:600; font-size:1rem;" data-q="q2" data-val="4-6 people">👨‍👩‍👦 4-6 People</button>
                            <button class="intake-opt premium-card glass" style="padding:18px; text-align:left; font-weight:600; font-size:1rem;" data-q="q2" data-val="7+ people">🚌 Large Group (7+)</button>
                        </div>
                    </div>

                    <!-- Q3 -->
                    <div class="intake-slide" style="width:20%; padding:30px 20px;">
                        <h2 style="font-size:1.8rem; font-weight:800; margin-bottom:10px; color:#fff;">Transport</h2>
                        <p style="color:var(--text-muted); margin-bottom:30px; font-size:0.95rem;">How are you traveling to the stadium?</p>
                        <div class="options-grid" style="display:grid; grid-template-columns:1fr; gap:12px;">
                            <button class="intake-opt premium-card glass" style="padding:18px; text-align:left; font-weight:600; font-size:1rem;" data-q="q3" data-val="car">🚗 Car / Bike</button>
                            <button class="intake-opt premium-card glass" style="padding:18px; text-align:left; font-weight:600; font-size:1rem;" data-q="q3" data-val="metro">🚆 Metro / Bus</button>
                            <button class="intake-opt premium-card glass" style="padding:18px; text-align:left; font-weight:600; font-size:1rem;" data-q="q3" data-val="auto">🛺 Auto / Cab</button>
                            <button class="intake-opt premium-card glass" style="padding:18px; text-align:left; font-weight:600; font-size:1rem;" data-q="q3" data-val="walking">🚶 Walking</button>
                        </div>
                    </div>

                    <!-- Q4 -->
                    <div class="intake-slide" style="width:20%; padding:30px 20px;">
                        <h2 style="font-size:1.8rem; font-weight:800; margin-bottom:10px; color:#fff;">Parking</h2>
                        <p style="color:var(--text-muted); margin-bottom:30px; font-size:0.95rem;">Select your designated parking zone.</p>
                        <div class="options-grid" style="display:grid; grid-template-columns:1fr; gap:12px;">
                            <button class="intake-opt premium-card glass" style="padding:18px; text-align:left; font-weight:600; font-size:1rem;" data-q="q4" data-val="P1 North">P1 North</button>
                            <button class="intake-opt premium-card glass" style="padding:18px; text-align:left; font-weight:600; font-size:1rem;" data-q="q4" data-val="P2 South">P2 South</button>
                            <button class="intake-opt premium-card glass" style="padding:18px; text-align:left; font-weight:600; font-size:1rem;" data-q="q4" data-val="P3 East">P3 East</button>
                            <button class="intake-opt premium-card glass" style="padding:18px; text-align:left; font-weight:600; font-size:1rem;" data-q="q4" data-val="P4 West">P4 West</button>
                            <button class="intake-opt premium-card glass" style="padding:18px; text-align:left; font-weight:600; font-size:1rem;" data-q="q4" data-val="Not parked yet">Not parked yet</button>
                        </div>
                    </div>

                    <!-- Q5 -->
                    <div class="intake-slide" style="width:20%; padding:30px 20px;">
                        <h2 style="font-size:1.8rem; font-weight:800; margin-bottom:10px; color:#fff;">Destination After</h2>
                        <p style="color:var(--text-muted); margin-bottom:30px; font-size:0.95rem;">Where will you head to after the match?</p>
                        <div class="options-grid" style="display:grid; grid-template-columns:1fr; gap:12px;">
                            <button class="intake-opt premium-card glass" style="padding:18px; text-align:left; font-weight:600; font-size:1rem;" data-q="q5" data-val="Home North">🏠 Residential (North)</button>
                            <button class="intake-opt premium-card glass" style="padding:18px; text-align:left; font-weight:600; font-size:1rem;" data-q="q5" data-val="Home South">🏠 Residential (South)</button>
                            <button class="intake-opt premium-card glass" style="padding:18px; text-align:left; font-weight:600; font-size:1rem;" data-q="q5" data-val="Railway Station">🚉 Railway Station</button>
                            <button class="intake-opt premium-card glass" style="padding:18px; text-align:left; font-weight:600; font-size:1rem;" data-q="q5" data-val="Airport">✈️ Airport</button>
                        </div>
                    </div>

                </div>
            </main>

            <footer style="padding:20px; z-index:10; background:rgba(8,12,20,0.8); backdrop-filter:blur(20px); border-top:1px solid var(--glass-border);">
                <button class="cr-send-all-btn" id="intake-next-btn" disabled style="width:100%; height:55px; font-size:1rem;">NEXT STEP</button>
            </footer>

            <div id="loading-spinner" class="overlay hidden" style="background:rgba(8,12,20,0.9); backdrop-filter:blur(20px);">
                <div class="spinner"></div>
                <p style="margin-top:20px; font-weight:700; letter-spacing:1px; color:var(--primary-color);">SYNCING MATCH PLAN...</p>
            </div>

            <style>
                .intake-opt.selected { border: 2px solid var(--primary-color); background: var(--primary-dim); }
                .overlay { position:fixed; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; z-index:1000; }
                .hidden { display:none; }
                .intake-opt:active { transform: scale(0.98); }
            </style>
        </div>
    `;
}

export function initIntake() {
    let currentStep = 1;
    let answers = {};
    const totalSteps = 5;

    const track = document.getElementById('slider-track');
    const backBtn = document.getElementById('intake-back-btn');
    const nextBtn = document.getElementById('intake-next-btn');
    const fill = document.getElementById('progress-fill');
    const progText = document.getElementById('progress-text');
    const spinner = document.getElementById('loading-spinner');

    const updateSlider = () => {
        const percentage = -(currentStep - 1) * 20; 
        if (track) track.style.transform = `translateX(${percentage}%)`;
        
        if (progText) progText.innerText = `${currentStep} / ${totalSteps}`;
        if (fill) fill.style.width = `${(currentStep / totalSteps) * 100}%`;

        validateNextBtn();
    };

    const validateNextBtn = () => {
        if (answers[`q${currentStep}`]) {
            nextBtn?.removeAttribute('disabled');
            nextBtn.style.opacity = '1';
        } else {
            nextBtn?.setAttribute('disabled', 'true');
            nextBtn.style.opacity = '0.4';
        }
        
        if (currentStep === totalSteps) {
            nextBtn.innerText = 'CALCULATE PLAN';
        } else {
            nextBtn.innerText = 'NEXT STEP';
        }
    };

    // Option clicks
    const options = document.querySelectorAll('.intake-opt');
    options.forEach(opt => {
        opt.onclick = () => {
            const q = opt.getAttribute('data-q');
            const val = opt.getAttribute('data-val');
            
            document.querySelectorAll(`.intake-opt[data-q="${q}"]`).forEach(el => {
                el.classList.remove('selected');
            });
            
            opt.classList.add('selected');
            answers[q] = val;
            validateNextBtn();
        };
    });

    backBtn.onclick = () => {
        if (currentStep > 1) {
            currentStep--;
            updateSlider();
        } else {
            window.history.pushState(null, null, '/');
            window.dispatchEvent(new Event('popstate'));
        }
    };

    nextBtn.onclick = () => {
        if (currentStep < totalSteps) {
            currentStep++;
            updateSlider();
        } else {
            submitIntake();
        }
    };

    const submitIntake = () => {
        spinner?.classList.remove('hidden');
        localStorage.setItem('eventflow_intake', JSON.stringify(answers));
        syncIntake(answers);

        setTimeout(() => {
            spinner?.classList.add('hidden');
            window.history.pushState(null, null, '/plan');
            window.dispatchEvent(new Event('popstate'));
        }, 1500);
    }

    if (window.applyTranslations) window.applyTranslations();
    updateSlider();
}
