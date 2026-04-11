/**
 * Attendee Help Panel
 * FAQs, Support contact, SOS functionality.
 */
import { syncReport } from '/src/firebase.js';

export function renderHelp() {
    return `
    <div class="attendee-screen" id="help-screen">
        <header class="attendee-top-bar">
            <button class="icon-btn" id="help-back-btn" aria-label="Back">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            </button>
            <div class="attendee-logo" style="margin-left: 10px;">Support</div>
        </header>

        <main class="help-content scrollable-content" style="padding: 0 var(--spacing-lg) 100px;">
            <div class="help-header staggered-card" style="animation-delay: 0.1s; margin: 20px 0;">
                <h1 style="font-size: 1.8rem; line-height: 1.2;">How can we help you today?</h1>
                <p style="color: var(--text-secondary); margin-top: 5px;">Our team is here at NMS to assist.</p>
            </div>

            <!-- FAQ Section -->
            <div class="faq-section staggered-card" style="animation-delay: 0.2s;">
                <h2 style="font-size: 1.1rem; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-secondary);">Frequent Questions</h2>
                
                <div class="faq-item">
                    <button class="faq-question" aria-label="Action button">Where is the nearest First Aid? 🚑</button>
                    <div class="faq-answer">Medical booths are located near Gate B, Gate 6, and in the North Food Court.</div>
                </div>

                <div class="faq-item">
                    <button class="faq-question" aria-label="Action button">Lost and Found? 🎒</button>
                    <div class="faq-answer">Please visit the Main Help Desk at the West Concourse or contact staff near Gate 3.</div>
                </div>

                <div class="faq-item">
                    <button class="faq-question" aria-label="Action button">Metro/Bus schedule? 🚌</button>
                    <div class="faq-answer">The Sabarmati Metro Station runs until 1:30 AM for today's match. Shuttle buses are at Gate 7.</div>
                </div>
            </div>

            <!-- Support Buttons -->
            <div class="support-options staggered-card" style="animation-delay: 0.3s; margin-top: 30px;">
                <div class="plan-card" style="margin: 0 0 20px; text-align: center;">
                    <h3 style="margin-bottom: 10px;">Need immediate help?</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 20px;">Staff are patrolling each sector every 5 minutes.</p>
                    <button class="primary-btn" id="assist-btn" style="padding: 15px; font-size: 1.1rem;" aria-label="assist btn">Call Staff to My Location</button>
                </div>

                <div class="plan-card" style="margin: 0 0 20px; border: 1.5px solid #ff4d4d; background: rgba(255, 77, 77, 0.05); text-align: center;">
                    <h3 style="color: #ff4d4d; margin-bottom: 10px;">Emergency SOS 🚨</h3>
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 20px;">Use only for extreme emergencies (Medical, Fire, Security)</p>
                    <button class="primary-btn" style="background: #ff4d4d; color: #fff; padding: 15px; font-size: 1.1rem;" id="sos-btn" aria-label="sos btn">ACTIVATE EMERGENCY SOS</button>
                </div>
            </div>
            
            <div id="assist-result" class="overlay hidden">
                <div class="spinner"></div>
                <div style="font-size: 1.2rem; font-weight: 700;">Request Sent!</div>
                <div style="color: var(--text-secondary); margin-top: 8px;">Staff will reach your section shortly.</div>
            </div>
        </main>

        <!-- Bottom Navigation -->
        <nav class="bottom-nav">
            <a href="/plan" class="nav-item" data-link>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                <span>Home</span>
            </a>
            <a href="/escort" class="nav-item" data-link>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
                <span>Navigate</span>
            </a>
            <a href="/exit" class="nav-item" data-link>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                <span>Exit</span>
            </a>
            <a href="/help" class="nav-item active" data-link>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                <span>Help</span>
            </a>
        </nav>
    </div>
    `;
}

export function initHelp() {
    if (window.applyTranslations) window.applyTranslations();

    // Toggle FAQ answers
    document.querySelectorAll('.faq-question').forEach(q => {
        q.addEventListener('click', () => {
            q.parentElement.classList.toggle('active');
        });
    });

    // Assistance and SOS buttons (mock behavior + feedback sync)
    const assistBtn = document.getElementById('assist-btn');
    const assistOverlay = document.getElementById('assist-result');
    if (assistBtn && assistOverlay) {
        assistBtn.addEventListener('click', () => {
            assistOverlay.classList.remove('hidden');
            
            // Push simulated report to localStorage and Firebase
            try {
                const report = {
                    type: 'assistance',
                    zone: 'User Standing Sector',
                    notes: 'Help panel call-for-staff',
                    timestamp: Date.now()
                };
                const reports = JSON.parse(localStorage.getItem('eventflow_reports') || '[]');
                reports.push(report);
                localStorage.setItem('eventflow_reports', JSON.stringify(reports));
                
                syncReport(report);
            } catch(e) {
                console.error('Firebase sync failed', e);
            }

            setTimeout(() => {
                assistOverlay.classList.add('hidden');
            }, 3000);
        });
    }

    const sosBtn = document.getElementById('sos-btn');
    if (sosBtn) {
        sosBtn.addEventListener('click', () => {
            const confirmed = confirm("Are you sure? This will trigger an immediate emergency alert to the control room staff.");
            if (confirmed) {
                alert("Emergency SOS Active. Please stay where you are. Staff are on their way.");
                
                // Pushes urgent log/report
                try {
                    const report = {
                        type: 'emergency',
                        zone: 'User Standing Sector',
                        notes: 'URGENT: SOS Button activated from user phone',
                        timestamp: Date.now()
                    };
                    const reports = JSON.parse(localStorage.getItem('eventflow_reports') || '[]');
                    reports.push(report);
                    localStorage.setItem('eventflow_reports', JSON.stringify(reports));
                    
                    syncReport(report);
                } catch(e) {
                    console.error('Firebase sync failed', e);
                }
            }
        });
    }

    // Back button
    document.getElementById('help-back-btn')?.addEventListener('click', () => {
        window.history.back();
    });
}
