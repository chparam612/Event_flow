import { getZoneDensity, ZONES } from '/src/simulation.js';
import { initVenueMap, syncMarkers } from '/src/mapHelper.js';

export function renderPlan() {
    return `
        <div class="attendee-screen" id="plan-screen">
            <header class="attendee-top-bar" style="padding-bottom: 0;">
                <div class="attendee-logo">EventFlow</div>
                <div class="header-profile">
                    <img src="https://ui-avatars.com/api/?name=Fan&background=00C49A&color=fff&rounded=true" alt="User" width="36" height="36" style="border-radius: 50%;">
                </div>
            </header>

            <main class="plan-content scrollable-content">
                <div class="plan-greeting staggered-card" style="animation-delay: 0.1s;">
                    <h1 style="font-size: 1.8rem; line-height: 1.2;">Welcome, Match Fan! 🏏</h1>
                    <p style="color: var(--text-secondary); margin-top: 5px;">Your personal plan for today</p>
                </div>

                <!-- Card 1: Arrival -->
                <div class="plan-card arrival-card staggered-card" style="animation-delay: 0.2s;">
                    <div class="card-header">
                        <span class="icon" style="font-size: 1.5rem;">🚪</span>
                        <h2 data-i18n="plan.gate">Recommended Gate: Gate B</h2>
                    </div>
                    <div class="card-body">
                        <p class="highlight-text" style="color: var(--primary-color); font-weight: 600; margin-bottom: 5px;">34% less crowded than Gate A right now</p>
                        <p class="subtext" style="margin-bottom: 15px;" data-i18n="plan.walk">Walk time from metro: 8 min</p>
                        <button class="action-btn">Take Me There &rightarrow;</button>
                    </div>
                </div>

                <!-- Card 2: Live Venue Map -->
                <div class="plan-card transparent-card staggered-card" style="animation-delay: 0.3s; padding: 0; overflow: hidden; height: 320px;">
                    <div id="plan-map-container" style="width: 100%; height: 100%;"></div>
                    <div class="map-overlay-title">
                        <span class="dot pulse"></span> <span data-i18n="during.live_status">Live Venue Map</span>
                    </div>
                </div>

                <!-- Card 3: Timeline -->
                <div class="plan-card staggered-card" style="animation-delay: 0.4s;">
                    <h2 style="font-size: 1.2rem; margin-bottom: 20px;">Your Timeline</h2>
                    <div class="timeline">
                        <div class="timeline-item past">
                            <div class="time">6:15 PM</div>
                            <div class="content">Arrive via Gate B <span style="color: var(--primary-color);">✓</span></div>
                        </div>
                        <div class="timeline-item current">
                            <div class="time">7:00 PM</div>
                            <div class="content">Get food <span style="color: var(--text-secondary); font-size: 0.85rem;">(N2 recommended)</span></div>
                        </div>
                        <div class="timeline-item">
                            <div class="time">7:30 PM</div>
                            <div class="content">Match starts</div>
                        </div>
                        <div class="timeline-item">
                            <div class="time">10:00 PM</div>
                            <div class="content">Innings break plan ready</div>
                        </div>
                        <div class="timeline-item">
                            <div class="time">1:15 AM</div>
                            <div class="content">Exit via Gate 7 &rightarrow; P2</div>
                        </div>
                    </div>
                </div>

                <!-- Card 4: Exit Preview -->
                <div class="plan-card subtle-card staggered-card" style="animation-delay: 0.5s;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h3 style="font-size: 1rem; color: var(--text-primary); margin-bottom: 4px;">Exit plan ready when you need it</h3>
                            <p style="font-size: 0.85rem; color: var(--text-secondary);">Tap here 20 min before you leave</p>
                        </div>
                        <button class="icon-btn" style="background: rgba(255,255,255,0.1);">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </button>
                    </div>
                </div>
            </main>

            <!-- Bottom Navigation -->
            <nav class="bottom-nav">
                <a href="/plan" class="nav-item active" data-link>
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
                <a href="/help" class="nav-item" data-link>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                    <span>Help</span>
                </a>
            </nav>
        </div>
    `;
}

export function initPlan() {
    if (window.applyTranslations) window.applyTranslations();

    // Initialize Map
    const map = initVenueMap('plan-map-container', { zoom: 15 });
    
    const refreshMap = () => {
        const densities = getZoneDensity();
        syncMarkers(map, densities);
    };

    // Attach escort navigation hook to 'Take Me There' button
    const escortBtn = document.querySelector('.arrival-card .action-btn');
    if (escortBtn) {
        escortBtn.addEventListener('click', () => {
            window.history.pushState(null, null, '/escort');
            window.dispatchEvent(new Event('popstate'));
        });
    }

    // Initial render
    refreshMap();

    // Interval to refresh every 30s
    const refreshInterval = setInterval(refreshMap, 30000);

    // Cleanup interval if element is removed from DOM (spa navigation)
    const observer = new MutationObserver((mutations, obs) => {
        if (!document.body.contains(document.getElementById('plan-screen'))) {
            clearInterval(refreshInterval);
            obs.disconnect();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

