import { getZoneDensity, simulateTick, ZONES } from '/src/simulation.js';
import { initVenueMap, syncMarkers } from '/src/mapHelper.js';
import { listenStaff, listenZones, listenNudges } from '/src/firebase.js';

function staffZoneToSim(zoneId) {
    if (!zoneId) return null;
    const z = zoneId.toLowerCase();
    if (z.includes('north')) return 'North Stand';
    if (z.includes('south')) return 'South Stand';
    if (z.includes('east')) return 'East Stand';
    if (z.includes('west')) return 'West Stand';
    if (z.includes('gate')) return 'Gate Area';
    if (z.includes('parking')) return 'Parking Zone';
    return null;
}

// Match timeline constants (same as simulation.js)
const INNINGS_BREAK_START = 1320;  // 22:00 (10:00 PM)
const MATCH_END          = 1500;  // 25:00 (01:00 AM)

const STATUS_PILLS_DATA = [
    { label: 'Gate B',          zone: ZONES.GATE_AREA,       emoji: '' },
    { label: 'South Restrooms', zone: ZONES.SOUTH_CONCOURSE, emoji: '🚽' },
    { label: 'N2 Food Court',   zone: ZONES.NORTH_CONCOURSE, emoji: '🍺' },
    { label: 'West Concourse',  zone: ZONES.WEST_STAND,      emoji: '' },
    { label: 'North Stand',     zone: ZONES.NORTH_STAND,     emoji: '' },
    { label: 'East Stand',      zone: ZONES.EAST_STAND,      emoji: '' },
    { label: 'Parking Zone',    zone: ZONES.PARKING_ZONE,    emoji: '🅿️' },
];

const getDensityMeta = (score) => {
    if (score > 0.85) return { icon: '🔴', label: 'Full',      color: '#ff4d4d' };
    if (score > 0.55) return { icon: '🟡', label: 'Busy',      color: '#ffd166' };
    return               { icon: '🟢', label: 'Clear',     color: '#00C49A' };
};

// Returns minutes-into-day from the simulation's current tick
function getSimMinutes() {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
}

/* ─── Nudge Card Templates ────────────────────────────────────── */
function buildInningsNudgeHTML() {
    return `
    <div class="nudge-card nudge-innings slide-up-in" id="active-nudge">
        <div class="nudge-header">
            <span class="nudge-badge">Now</span>
            <h3>Innings break in 5 minutes</h3>
        </div>
        <p class="nudge-sub">Head over now for the shortest queues</p>
        <div class="nudge-options">
            <div class="nudge-option">
                <span class="nudge-opt-icon">🍺</span>
                <div>
                    <strong>N2 Food Counter</strong>
                    <span class="wait-badge green">~2 min NOW</span>
                </div>
            </div>
            <div class="nudge-option">
                <span class="nudge-opt-icon">🚽</span>
                <div>
                    <strong>Restroom — Gate B</strong>
                    <span class="wait-badge yellow">~3 min NOW</span>
                </div>
            </div>
        </div>
        <p class="nudge-warn">Both will be busier in 10 min — go early!</p>
        <div class="nudge-actions">
            <button class="action-btn" id="nudge-guide-btn" style="border-color: var(--primary-color); color: var(--primary-color);" aria-label="nudge guide btn">Guide me there</button>
            <button class="action-btn dismiss-nudge" style="border-color: var(--border-color);" aria-label="Action button">I'll manage</button>
        </div>
    </div>`;
}

function buildExitNudgeHTML() {
    return `
    <div class="nudge-card nudge-exit slide-up-in" id="active-nudge">
        <div class="nudge-header">
            <span class="nudge-badge" style="background: rgba(5, 130, 202, 0.15); color: #0582ca;">Upcoming</span>
            <h3>Match ending soon</h3>
        </div>
        <p class="nudge-sub">Your exit plan is ready — leave when you're comfortable</p>
        <div class="nudge-option" style="gap:10px;">
            <span class="nudge-opt-icon">🚪</span>
            <div>
                <strong>Exit via Gate 7 → P2 Parking</strong>
                <span class="wait-badge green">Least crowded now</span>
            </div>
        </div>
        <div class="nudge-actions">
            <button class="action-btn" id="nudge-exit-btn" style="border-color: var(--primary-color); color: var(--primary-color);" aria-label="nudge exit btn">See full exit plan</button>
            <button class="action-btn dismiss-nudge" style="border-color: var(--border-color);" aria-label="Action button">Stay a bit longer</button>
        </div>
    </div>`;
}

function buildDensityNudgeHTML(zone) {
    return `
    <div class="nudge-card nudge-density slide-up-in" id="active-nudge">
        <div class="nudge-header">
            <span class="nudge-badge" style="background: rgba(255, 209, 102, 0.15); color: #ffd166;">Tip</span>
            <h3>Your area is filling up</h3>
        </div>
        <p class="nudge-sub">A nearby section has much more space right now</p>
        <div class="nudge-option">
            <span class="nudge-opt-icon">✨</span>
            <div>
                <strong>West Concourse has plenty of room</strong>
                <span class="wait-badge green">Comfortable</span>
            </div>
        </div>
        <div class="nudge-actions">
            <button class="action-btn dismiss-nudge" style="border-color: var(--border-color); width: 100%;" aria-label="Action button">Got it, thanks</button>
        </div>
    </div>`;
}

/* ─── Render ──────────────────────────────────────────────────── */
export function renderDuring() {
    return `
    <div class="attendee-screen" id="during-screen">

        <!-- Top: Status Strip -->
        <header class="during-header">
            <div class="match-info-row">
                <div class="match-live-badge">
                    <span class="dot pulse"></span> LIVE
                </div>
                <span class="match-score-stub">IND vs AUS &nbsp;•&nbsp; 18.3 OV</span>
                <button class="icon-btn" id="during-plan-btn" title="Back to plan" aria-label="Plan">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                </button>
            </div>
            <div class="status-scroll-wrapper">
                <div class="status-scroll-track" id="status-strip">
                    <!-- Pills injected by JS -->
                </div>
            </div>
        </header>

        <!-- Main content -->
        <main class="during-main scrollable-content">

            <!-- Smart Nudge area -->
            <div id="nudge-container"></div>

            <!-- Venue Map Card -->
            <div class="venue-map-card" style="padding: 0; overflow: hidden; height: 320px; position: relative; border-radius: 20px;">
                <div id="during-map-container" style="width: 100%; height: 100%;" class="skeleton-block"></div>
                <div class="map-overlay-title" style="position: absolute; top: 12px; right: 12px; background: rgba(10,10,16,0.8); padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; color: #fff; z-index: 10; display: flex; align-items: center; gap: 6px;">
                    <span class="dot pulse"></span> Venue Heatmap
                </div>
            </div>

            <!-- Quick action row -->
            <div class="quick-actions-row">
                <button class="quick-action-btn" id="btn-food" aria-label="btn food">
                    <span>🍺</span><span>Food</span>
                </button>
                <button class="quick-action-btn" id="btn-restroom" aria-label="btn restroom">
                    <span>🚽</span><span>Restroom</span>
                </button>
                <button class="quick-action-btn" id="btn-exit-plan" aria-label="btn exit plan">
                    <span>🚪</span><span>Exit Plan</span>
                </button>
                <button class="quick-action-btn" id="btn-help" aria-label="btn help">
                    <span>🆘</span><span>Help</span>
                </button>
            </div>

        </main>

        <!-- Bottom Nav -->
        <nav class="bottom-nav">
            <a href="/plan" class="nav-item" data-link>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                <span>Home</span>
            </a>
            <a href="/escort" class="nav-item" data-link>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
                <span>Navigate</span>
            </a>
            <a href="#" class="nav-item active">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span>Live</span>
            </a>
            <a href="#" class="nav-item" id="exit-nav-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                <span>Exit</span>
            </a>
        </nav>
    </div>`;
}

/* ─── Init ────────────────────────────────────────────────────── */
export function initDuring() {
    const intake    = JSON.parse(localStorage.getItem('eventflow_intake') || '{}');
    const userZone  = intake.q1 === 'North Stand' ? ZONES.NORTH_STAND
                    : intake.q1 === 'South Stand' ? ZONES.SOUTH_STAND
                    : intake.q1 === 'East Stand'  ? ZONES.EAST_STAND
                    : ZONES.WEST_STAND;

    let nudgeShown  = { innings: false, exit: false, density: false };
    let intervals   = [];

    // Initialize Map
    const map = initVenueMap('during-map-container', { zoom: 16 });

    // ── helpers ──────────────────────────────────────────────────
    const updateStatusStrip = (densities) => {
        const strip = document.getElementById('status-strip');
        if (!strip) return;
        strip.innerHTML = STATUS_PILLS_DATA.map(({ label, zone, emoji }) => {
            const meta  = getDensityMeta(densities[zone] || 0.3);
            const extra = zone === userZone ? ' user-zone-pill' : '';
            return `<div class="status-pill${extra}" style="--pill-color:${meta.color}">
                        ${meta.icon} ${emoji ? emoji + '&thinsp;' : ''}<span>${label}</span>
                        <span class="pill-label-state" style="color:${meta.color}">${meta.label}</span>
                    </div>`;
        }).join('');
    };

    const showNudge = (html) => {
        const container = document.getElementById('nudge-container');
        if (!container) return;
        container.innerHTML = html;

        // Dismiss handlers
        container.querySelectorAll('.dismiss-nudge').forEach(btn => {
            btn.addEventListener('click', () => {
                container.innerHTML = '';
            });
        });

        const guideBtn   = container.querySelector('#nudge-guide-btn');
        const exitPreBtn = container.querySelector('#nudge-exit-btn');

        guideBtn?.addEventListener('click', () => {
            window.history.pushState(null, null, '/escort');
            window.dispatchEvent(new Event('popstate'));
        });
        exitPreBtn?.addEventListener('click', () => {
            container.innerHTML = '';
        });
    };

    const checkNudges = (densities, simMinutes) => {
        const tInnings = INNINGS_BREAK_START - simMinutes;
        const tEnd     = MATCH_END - simMinutes;
        const userDen  = densities[userZone] || 0;

        if (!nudgeShown.innings && tInnings <= 5 && tInnings >= -5) {
            nudgeShown.innings = true;
            showNudge(buildInningsNudgeHTML());
        } else if (!nudgeShown.exit && tEnd <= 20 && tEnd >= 0) {
            nudgeShown.exit = true;
            showNudge(buildExitNudgeHTML());
        } else if (!nudgeShown.density && userDen >= 0.85) {
            nudgeShown.density = true;
            showNudge(buildDensityNudgeHTML(userZone));
        }
    };

    // ── tick loop ─────────────────────────────────────────────────
    const tick = () => {
        const densities   = getZoneDensity();
        const simMinutes  = getSimMinutes();

        updateStatusStrip(densities);
        syncMarkers(map, densities);
        checkNudges(densities, simMinutes);
    };

    // ── Firebase Realtime Listeners ─────────────────────────────
    const unsubs = [];

    unsubs.push(listenStaff((data) => {
        if (!data) return;
        const densities = getZoneDensity();
        Object.keys(data).forEach(staffId => {
            const entry = data[staffId];
            if (entry.status === 'crowded' && entry.zoneId) {
                const zoneName = staffZoneToSim(entry.zoneId);
                if (zoneName) densities[zoneName] = 1.0;
            }
        });
        updateStatusStrip(densities);
        syncMarkers(map, densities);
    }));

    unsubs.push(listenZones((data) => {
        if (!data) return;
        const densities = getZoneDensity();
        Object.keys(data).forEach(zKey => {
            const zoneName = zKey.replace(/_/g, ' ');
            if (data[zKey].density !== undefined && densities[zoneName] !== undefined) {
                densities[zoneName] = data[zKey].density / 100;
            }
        });
        updateStatusStrip(densities);
        syncMarkers(map, densities);
    }));

    tick();
    const pollId = setInterval(tick, 30000);
    intervals.push(pollId);

    // ── quick action handlers ──────────────────────────────────────
    document.getElementById('btn-food')?.addEventListener('click', () => showNudge(buildInningsNudgeHTML()));
    document.getElementById('btn-exit-plan')?.addEventListener('click', () => showNudge(buildExitNudgeHTML()));
    document.getElementById('during-plan-btn')?.addEventListener('click', () => {
        window.history.pushState(null, null, '/plan');
        window.dispatchEvent(new Event('popstate'));
    });
    document.getElementById('exit-nav-btn')?.addEventListener('click', () => showNudge(buildExitNudgeHTML()));

    if (window.applyTranslations) window.applyTranslations();

    // ── RETURN UNMOUNT ──
    return () => {
        console.log("Cleaning up During panel...");
        intervals.forEach(clearInterval);
        unsubs.forEach(fn => fn && fn());
    };
}


