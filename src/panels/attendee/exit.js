import { getZoneDensity, getExitPlan, ZONES } from '/src/simulation.js';

const OPTIONS = [
    {
        id: 'A',
        label: 'Leave Now',
        recommended: true,
        route: 'Gate 7 → Ramp C → P2 Parking',
        time: '4 min',
        zone: ZONES.GATE_AREA,
        baseScore: 0.3,
        statusLabel: ['Clear right now', 'Getting busy', 'Crowded'],
        tagline: 'Best choice if you want to beat traffic',
        icon: '🚗'
    },
    {
        id: 'B',
        label: 'At Final Whistle',
        recommended: false,
        route: 'Gate 9 → South Exit → P2 Parking',
        time: '18 min',
        zone: ZONES.SOUTH_CONCOURSE,
        baseScore: 0.92,
        statusLabel: ['Will be full', 'Very busy', 'Will be crowded'],
        tagline: 'Expect delays — everyone leaves together',
        icon: '🏟️'
    },
    {
        id: 'C',
        label: 'Wait 15 Minutes',
        recommended: false,
        route: 'Gate 7 → Ramp C → P2 Parking',
        time: '6 min',
        zone: ZONES.GATE_AREA,
        baseScore: 0.62,
        statusLabel: ['Crowd settles quickly', 'Getting quieter', 'Moderate flow'],
        tagline: 'Good option if you want to see the presentation',
        icon: '⏳'
    }
];

const getDensityDisplay = (score) => {
    if (score > 0.85) return { icon: '🔴', color: '#ff4d4d', idx: 2 };
    if (score > 0.55) return { icon: '🟡', color: '#ffd166', idx: 1 };
    return               { icon: '🟢', color: '#00C49A',  idx: 0 };
};

function buildOptionCard(opt, densities, selectedId) {
    const liveScore  = densities[opt.zone] ?? opt.baseScore;
    const density    = opt.id === 'B'
        ? getDensityDisplay(Math.max(liveScore, 0.86))   // B is always red
        : getDensityDisplay(liveScore);
    const statusText = opt.statusLabel[density.idx];
    const isSelected = selectedId === opt.id;

    return `
    <div class="exit-card ${opt.recommended ? 'exit-card--recommended' : ''} ${isSelected ? 'exit-card--selected' : ''}"
         data-option="${opt.id}" role="button" tabindex="0" aria-label="Exit Option ${opt.id}">

        ${opt.recommended ? `<div class="exit-rec-badge">⭐ Recommended</div>` : ''}

        <div class="exit-card-top">
            <span class="exit-option-icon">${opt.icon}</span>
            <div class="exit-option-meta">
                <h3 class="exit-option-title">Option ${opt.id} <span class="exit-option-label">— ${opt.label}</span></h3>
                <p class="exit-route-text">${opt.route}</p>
            </div>
            <div class="exit-check-ring ${isSelected ? 'checked' : ''}">
                ${isSelected ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"></polyline></svg>` : ''}
            </div>
        </div>

        <div class="exit-card-stats">
            <span class="exit-stat">⏱ ${opt.time}</span>
            <span class="exit-status-pill" style="background:${density.color}22; color:${density.color}; border:1px solid ${density.color}44;">
                ${density.icon} ${statusText}
            </span>
        </div>

        <p class="exit-tagline">${opt.tagline}</p>
    </div>`;
}

/* ──────────────────────────────────────────────────────────────── */
export function renderExit() {
    return `
    <div class="attendee-screen" id="exit-screen">
        <header class="attendee-top-bar">
            <button class="icon-btn" id="exit-back-btn" aria-label="Back">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
            </button>
            <div style="flex:1; text-align:center; margin-right: 40px;">
                <div class="match-live-badge" style="display:inline-flex; background:rgba(255,77,77,0.1); color:#ff4d4d; font-size:0.75rem; padding: 3px 10px;">
                    <span class="dot pulse" style="background:#ff4d4d;"></span>&nbsp;EXIT PLANNING
                </div>
            </div>
        </header>

        <main class="exit-main scrollable-content">

            <!-- Greeting -->
            <div class="exit-greeting staggered-card" style="animation-delay:0.05s; padding: 0 var(--spacing-lg) var(--spacing-md);">
                <h1 data-i18n="exit.title" style="font-size:2rem; margin-bottom: 6px;">Your Exit Plan 🚗</h1>
                <p style="color:var(--text-secondary); font-size:0.95rem;">
                    Planned for: <strong style="color:var(--text-primary);" id="exit-destination">P2 Parking → Home South</strong>
                </p>
            </div>

            <!-- Option Cards -->
            <div id="exit-options-container" style="display:flex; flex-direction:column; gap:14px; padding: 0 var(--spacing-lg);">
                <!-- Injected by JS -->
            </div>

            <!-- AI Suggestion note -->
            <div class="exit-ai-note staggered-card" style="animation-delay:0.5s;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <span data-i18n="exit.ai_suggestion"
                    id="ai-note-text">Suggested: Option A or C based on your group size and parking location</span>
            </div>

        </main>

        <!-- Sticky footer CTA -->
        <footer class="exit-footer">
            <div class="exit-live-meta" id="exit-live-meta">
                <span class="dot pulse"></span>
                <span id="live-meta-text" style="font-size:0.85rem; color:var(--text-secondary);">Refreshing crowd data...</span>
            </div>
            <button class="primary-btn pulse-glow" id="start-exit-btn" disabled style="margin-bottom: 0;">
                Start Exit Guide →
            </button>
        </footer>
    </div>`;
}

/* ──────────────────────────────────────────────────────────────── */
export function initExit() {
    // Read user intake so we can personalize
    const intake     = JSON.parse(localStorage.getItem('eventflow_intake') || '{}');
    const parking    = intake.q4 || 'P2 South';
    const destination = intake.q5 || 'Home South';

    // Update destination text
    const destEl = document.getElementById('exit-destination');
    if (destEl) destEl.textContent = `${parking} → ${destination}`;

    let selectedOption = null;
    let densities      = getZoneDensity();

    // ── Render option cards ──────────────────────────────────────
    const renderCards = () => {
        const container = document.getElementById('exit-options-container');
        if (!container) return;
        container.innerHTML = OPTIONS.map((opt, i) =>
            `<div class="staggered-card" style="animation-delay:${0.1 + i * 0.12}s;">${buildOptionCard(opt, densities, selectedOption)}</div>`
        ).join('');

        // Attach click handlers
        container.querySelectorAll('.exit-card').forEach(card => {
            const selectCard = () => {
                selectedOption = card.getAttribute('data-option');
                renderCards(); // re-render to show selection state
                const startBtn = document.getElementById('start-exit-btn');
                if (startBtn) {
                    startBtn.removeAttribute('disabled');
                    startBtn.textContent = `Start Exit Guide — Option ${selectedOption} →`;
                }
            };
            card.addEventListener('click', selectCard);
            card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') selectCard(); });
        });
    };

    renderCards();

    // ── AI note personalisation ──────────────────────────────────
    const aiNote = document.getElementById('ai-note-text');
    if (aiNote) {
        const groupSize  = intake.q2 || 'Just me';
        const isLarge    = groupSize === '7+ people';
        const suggestion = isLarge
            ? 'Suggested: Option C — better for large groups to avoid the rush'
            : 'Suggested: Option A or C based on your group size and parking location';
        aiNote.textContent = suggestion;
    }

    // ── Live meta refresh ────────────────────────────────────────
    const updateMeta = () => {
        densities          = getZoneDensity();
        const gateScore    = densities[ZONES.GATE_AREA] || 0.3;
        const { icon }     = getDensityDisplay(gateScore);
        const metaEl       = document.getElementById('live-meta-text');
        if (metaEl) {
            metaEl.textContent = `${icon} Gate Area density: ${Math.round(gateScore * 100)}% — last updated just now`;
        }
        renderCards();
    };

    updateMeta();
    const pollId = setInterval(updateMeta, 30000);

    // ── Start Exit Guide ──────────────────────────────────────────
    const startBtn = document.getElementById('start-exit-btn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            if (!selectedOption) return;
            // Store selected option for escort to read
            localStorage.setItem('eventflow_exit_option', selectedOption);
            window.history.pushState(null, null, '/escort');
            window.dispatchEvent(new Event('popstate'));
        });
    }

    // ── Back ──────────────────────────────────────────────────────
    document.getElementById('exit-back-btn')?.addEventListener('click', () => window.history.back());

    // ── Cleanup on SPA nav ────────────────────────────────────────
    const observer = new MutationObserver((_, obs) => {
        if (!document.body.contains(document.getElementById('exit-screen'))) {
            clearInterval(pollId);
            obs.disconnect();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    if (window.applyTranslations) window.applyTranslations();
}
