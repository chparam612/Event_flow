import { syncIntake } from '/src/firebase.js';

export function renderIntake() {
    return `
        <div class="attendee-screen" id="intake-screen">
            <header class="attendee-top-bar">
                <button class="icon-btn" id="intake-back-btn" aria-label="Back">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                </button>
                <div class="progress-container">
                    <div class="progress-text" id="progress-text">1 / 5</div>
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill" id="progress-fill" style="width: 20%;"></div>
                    </div>
                </div>
            </header>

            <div class="intake-slider-viewport">
                <div class="intake-slider-track" id="slider-track" style="width: 500%; display: flex;">
                    
                    <!-- Q1 -->
                    <div class="intake-slide" data-step="1">
                        <h2>Arrival time</h2>
                        <div class="options-grid">
                            <button class="intake-opt" data-q="q1" data-val="Before 5 PM" aria-label="Action button">Before 5 PM</button>
                            <button class="intake-opt" data-q="q1" data-val="5-6 PM" aria-label="Action button">5-6 PM</button>
                            <button class="intake-opt" data-q="q1" data-val="6-7 PM" aria-label="Action button">6-7 PM</button>
                            <button class="intake-opt" data-q="q1" data-val="After 7 PM" aria-label="Action button">After 7 PM</button>
                        </div>
                    </div>

                    <!-- Q2 -->
                    <div class="intake-slide" data-step="2">
                        <h2>Group size</h2>
                        <div class="options-grid list-grid">
                            <button class="intake-opt" data-q="q2" data-val="Just me" aria-label="Action button">Just me</button>
                            <button class="intake-opt" data-q="q2" data-val="2-3 people" aria-label="Action button">2-3 people</button>
                            <button class="intake-opt" data-q="q2" data-val="4-6 people" aria-label="Action button">4-6 people</button>
                            <button class="intake-opt" data-q="q2" data-val="7+ people" aria-label="Action button">7+ people</button>
                        </div>
                    </div>

                    <!-- Q3 -->
                    <div class="intake-slide" data-step="3">
                        <h2>How are you coming?</h2>
                        <div class="options-grid list-grid">
                            <button class="intake-opt" data-q="q3" data-val="car" aria-label="Action button">🚗 Car/Bike</button>
                            <button class="intake-opt" data-q="q3" data-val="metro" aria-label="Action button">🚌 Metro/Bus</button>
                            <button class="intake-opt" data-q="q3" data-val="auto" aria-label="Action button">🛺 Auto/Cab</button>
                            <button class="intake-opt" data-q="q3" data-val="walking" aria-label="Action button">🚶 Walking</button>
                        </div>
                    </div>

                    <!-- Q4 -->
                    <div class="intake-slide" data-step="4">
                        <h2>Parking zone</h2>
                        <div class="options-grid list-grid">
                            <button class="intake-opt" data-q="q4" data-val="P1 North" aria-label="Action button">P1 North</button>
                            <button class="intake-opt" data-q="q4" data-val="P2 South" aria-label="Action button">P2 South</button>
                            <button class="intake-opt" data-q="q4" data-val="P3 East" aria-label="Action button">P3 East</button>
                            <button class="intake-opt" data-q="q4" data-val="P4 West" aria-label="Action button">P4 West</button>
                            <button class="intake-opt" data-q="q4" data-val="Not parked yet" aria-label="Action button">Not parked yet</button>
                        </div>
                    </div>

                    <!-- Q5 -->
                    <div class="intake-slide" data-step="5">
                        <h2>Destination after</h2>
                        <div class="options-grid list-grid">
                            <button class="intake-opt" data-q="q5" data-val="Home North" aria-label="Action button">🏠 Home North</button>
                            <button class="intake-opt" data-q="q5" data-val="Home South" aria-label="Action button">🏠 Home South</button>
                            <button class="intake-opt" data-q="q5" data-val="Railway Station" aria-label="Action button">🚉 Railway Station</button>
                            <button class="intake-opt" data-q="q5" data-val="Airport" aria-label="Action button">✈️ Airport</button>
                        </div>
                    </div>

                </div>
            </div>

            <div class="intake-footer">
                <button class="primary-btn pulse-glow" id="intake-next-btn" disabled aria-label="intake next btn">Next</button>
            </div>

            <div id="loading-spinner" class="overlay hidden">
                <div class="spinner"></div>
                <p>Loading your plan...</p>
            </div>
        </div>
    `;
}

export function initIntake() {
    let currentStep = 1;
    let answers = {};
    const totalPhysicalSteps = 5;

    const track = document.getElementById('slider-track');
    const backBtn = document.getElementById('intake-back-btn');
    const nextBtn = document.getElementById('intake-next-btn');
    const fill = document.getElementById('progress-fill');
    const progText = document.getElementById('progress-text');
    const spinner = document.getElementById('loading-spinner');

    const updateSlider = () => {
        const percentage = -(currentStep - 1) * 20; 
        if (track) track.style.transform = 'translateX(' + percentage + '%)';
        
        let visualStep = currentStep;
        let visualTotal = 5;
        
        if (progText) progText.innerText = visualStep + ' / ' + visualTotal;
        if (fill) fill.style.width = (visualStep / visualTotal * 100) + '%';

        validateNextbtn();
    };

    const validateNextbtn = () => {
        if (answers['q' + currentStep]) {
            nextBtn?.removeAttribute('disabled');
        } else {
            nextBtn?.setAttribute('disabled', 'true');
        }
    };

    // Option clicks
    const options = document.querySelectorAll('.intake-opt');
    options.forEach(function(opt) {
        opt.addEventListener('click', function(e) {
            const q = opt.getAttribute('data-q');
            const val = opt.getAttribute('data-val');
            
            document.querySelectorAll('.intake-opt[data-q="' + q + '"]').forEach(function(el) {
                el.classList.remove('selected');
            });
            
            opt.classList.add('selected');
            answers[q] = val;
            validateNextbtn();
        });
    });

    backBtn?.addEventListener('click', function() {
        if (currentStep > 1) {
            currentStep--;
            updateSlider();
        } else {
            window.history.pushState(null, null, '/');
            window.dispatchEvent(new Event('popstate'));
        }
    });

    nextBtn?.addEventListener('click', function() {
        if (currentStep < totalPhysicalSteps) {
            currentStep++;
            updateSlider();
            if (currentStep === 5) nextBtn.innerText = 'Submit';
            else nextBtn.innerText = 'Next';
        } else {
            submitIntake();
        }
    });

    const submitIntake = function() {
        spinner?.classList.remove('hidden');
        localStorage.setItem('eventflow_intake', JSON.stringify(answers));
        syncIntake(answers);

        setTimeout(function() {
            spinner?.classList.add('hidden');
            window.history.pushState(null, null, '/plan');
            window.dispatchEvent(new Event('popstate'));
        }, 1200);
    }

    if (window.applyTranslations) window.applyTranslations();
    updateSlider();
}
