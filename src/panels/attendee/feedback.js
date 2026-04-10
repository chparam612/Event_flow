import { syncFeedback } from '/src/firebase.js';

const DIFFICULTY_CHIPS = [
    { id: 'entry',    label: 'Entry' },
    { id: 'seat',     label: 'Finding my seat' },
    { id: 'food',     label: 'Food queues' },
    { id: 'restroom', label: 'Restrooms' },
    { id: 'exit',     label: 'Exit' },
    { id: 'nav',      label: 'Navigation' },
    { id: 'none',     label: '🙌 Nothing — all good!' },
];

const HELPFULNESS_OPTIONS = [
    { id: 'very',   emoji: '😊', label: 'Bahut helpful tha' },
    { id: 'some',   emoji: '😐', label: 'Thoda helpful' },
    { id: 'not',    emoji: '😕', label: 'Bilkul nahi' },
];

/* ─── Confetti generator (CSS-only particles) ─────────────────── */
function buildConfettiHTML() {
    const colors = ['#00C49A', '#ffd166', '#ff4d4d', '#0582ca', '#ffffff', '#ff9f43'];
    return Array.from({ length: 48 }, (_, i) => {
        const color = colors[i % colors.length];
        const left  = Math.random() * 100;
        const delay = (Math.random() * 1.5).toFixed(2);
        const dur   = (1.8 + Math.random() * 1.5).toFixed(2);
        const size  = Math.floor(Math.random() * 8) + 6;
        const rot   = Math.floor(Math.random() * 360);
        return `<div class="confetti-piece" style="
            left:${left.toFixed(1)}%;
            background:${color};
            width:${size}px; height:${size}px;
            animation-delay:${delay}s;
            animation-duration:${dur}s;
            transform:rotate(${rot}deg);
        "></div>`;
    }).join('');
}

/* ─── Thank-you screen ────────────────────────────────────────── */
function buildThankYouHTML() {
    return `
    <div class="feedback-thankyou" id="thankyou-screen">
        <div class="confetti-container">${buildConfettiHTML()}</div>

        <div class="thankyou-content zoom-in">
            <div style="font-size: 4rem; margin-bottom: 16px;">🙏</div>
            <h1 style="font-size: 2.2rem; font-weight: 700; margin-bottom: 10px;" data-i18n="feedback.thankyou">Shukriya!</h1>
            <p style="color: var(--text-secondary); font-size: 1.1rem; margin-bottom: 30px;">
                Aapka feedback agla match better banayega
            </p>

            <div class="saved-time-card">
                <div style="font-size: 2.5rem; font-weight: 800; color: var(--primary-color);">~14 min</div>
                <div style="font-size: 0.95rem; color: var(--text-secondary); margin-top: 6px;">
                    saved today vs. average attendee
                </div>
                <div style="margin-top: 16px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                    <span class="summary-chip">🚪 Fast entry</span>
                    <span class="summary-chip">🚶 Optimal route</span>
                    <span class="summary-chip">🚗 Beat exit rush</span>
                </div>
            </div>

            <button class="primary-btn" id="done-btn" 
                style="border-radius:30px; margin-top:30px; margin-bottom:0;">
                Done
            </button>
        </div>
    </div>`;
}

/* ─── Render ──────────────────────────────────────────────────── */
export function renderFeedback() {
    return `
    <div class="attendee-screen" id="feedback-screen">
        <header class="attendee-top-bar">
            <button class="icon-btn" id="feedback-back-btn" aria-label="Back">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                </svg>
            </button>
            <div style="flex:1;"></div>
        </header>

        <main class="feedback-main scrollable-content" id="feedback-main">

            <!-- Title -->
            <div class="staggered-card" style="animation-delay:0.05s; padding: 0 var(--spacing-lg) var(--spacing-md);">
                <h1 style="font-size: 1.7rem; line-height: 1.2; margin-bottom: 8px;">
                    How was your experience today? 🏏
                </h1>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">Takes under 30 seconds</p>
            </div>

            <!-- Q1: Star Rating -->
            <div class="feedback-card staggered-card" style="animation-delay:0.15s;">
                <label class="feedback-q-label" data-i18n="feedback.q1">Rate your EventFlow experience</label>
                <div class="star-row" id="star-row" role="group" aria-label="Star rating">
                    ${[1,2,3,4,5].map(n => `
                        <button class="star-btn" data-star="${n}" aria-label="${n} star${n>1?'s':''}">
                            ★
                        </button>`).join('')}
                </div>
                <div class="star-hint" id="star-hint">Tap to rate</div>
            </div>

            <!-- Q2: Difficulty chips -->
            <div class="feedback-card staggered-card" style="animation-delay:0.25s;">
                <label class="feedback-q-label" data-i18n="feedback.q2">What was difficult? (select all that apply)</label>
                <div class="chip-grid" id="chip-grid">
                    ${DIFFICULTY_CHIPS.map(c => `
                        <button class="feedback-chip" data-chip="${c.id}">${c.label}</button>
                    `).join('')}
                </div>
            </div>

            <!-- Q3: Helpfulness -->
            <div class="feedback-card staggered-card" style="animation-delay:0.35s;">
                <label class="feedback-q-label" data-i18n="feedback.q3">Did EventFlow help you today?</label>
                <div class="help-options" id="help-options">
                    ${HELPFULNESS_OPTIONS.map(o => `
                        <button class="help-opt-btn" data-help="${o.id}">
                            <span class="help-emoji">${o.emoji}</span>
                            <span class="help-label">${o.label}</span>
                        </button>
                    `).join('')}
                </div>
            </div>

            <!-- Submit -->
            <div class="staggered-card feedback-submit-row" style="animation-delay:0.45s;">
                <button class="primary-btn pulse-glow" id="feedback-submit-btn" disabled
                    style="border-radius:30px; margin:0;" data-i18n="feedback.submit">
                    Submit Feedback
                </button>
                <p style="text-align:center; font-size:0.8rem; color:var(--text-secondary); margin-top:10px;">
                    Anonymous · Securely saved
                </p>
            </div>

        </main>
    </div>`;
}

/* ─── Init ────────────────────────────────────────────────────── */
export function initFeedback() {
    const state = { stars: 0, chips: new Set(), helpfulness: null };

    const STAR_HINTS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'];

    const validate = () => {
        const ok = state.stars > 0 && state.helpfulness !== null;
        const btn = document.getElementById('feedback-submit-btn');
        if (btn) {
            btn.disabled = !ok;
            if (!ok) { btn.style.animation = 'none'; btn.style.boxShadow = 'none'; }
            else      { btn.style.animation = ''; btn.style.boxShadow = ''; }
        }
    };

    /* Q1 — Stars ─────────────────────────────────────────────── */
    const starRow  = document.getElementById('star-row');
    const starHint = document.getElementById('star-hint');
    starRow?.querySelectorAll('.star-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            state.stars = parseInt(btn.dataset.star);
            starRow.querySelectorAll('.star-btn').forEach(b => {
                b.classList.toggle('filled', parseInt(b.dataset.star) <= state.stars);
            });
            starHint.textContent = STAR_HINTS[state.stars];
            validate();
        });
    });

    /* Q2 — Chips ─────────────────────────────────────────────── */
    document.getElementById('chip-grid')?.querySelectorAll('.feedback-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const id = chip.dataset.chip;
            // "Nothing — all good!" is mutually exclusive
            if (id === 'none') {
                state.chips.clear();
                document.querySelectorAll('.feedback-chip').forEach(c => c.classList.remove('selected'));
                state.chips.add('none');
                chip.classList.add('selected');
            } else {
                state.chips.delete('none');
                document.querySelector('.feedback-chip[data-chip="none"]')?.classList.remove('selected');
                if (state.chips.has(id)) { state.chips.delete(id); chip.classList.remove('selected'); }
                else                      { state.chips.add(id);    chip.classList.add('selected'); }
            }
        });
    });

    /* Q3 — Helpfulness ───────────────────────────────────────── */
    document.getElementById('help-options')?.querySelectorAll('.help-opt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.help-opt-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            state.helpfulness = btn.dataset.help;
            validate();
        });
    });

    /* Submit ──────────────────────────────────────────────────── */
    document.getElementById('feedback-submit-btn')?.addEventListener('click', async () => {
        const timestamp = Date.now();
        const payload = {
            stars:       state.stars,
            difficulties: [...state.chips],
            helpfulness: state.helpfulness,
            timestamp:   timestamp,
            lang:        localStorage.getItem('app_lang') || 'en',
        };

        // Save to localStorage and Firebase
        try {
            const all = JSON.parse(localStorage.getItem('eventflow_feedback') || '[]');
            all.push(payload);
            localStorage.setItem('eventflow_feedback', JSON.stringify(all));

            // Use the timestamp as the key as requested
            syncFeedback(payload, timestamp);
        } catch (e) {
            console.error('Feedback save error', e);
        }

        // Swap to Thank-you screen
        const screen = document.getElementById('feedback-screen');
        if (screen) {
            screen.innerHTML = buildThankYouHTML();
            document.getElementById('done-btn')?.addEventListener('click', () => {
                window.history.pushState(null, null, '/');
                window.dispatchEvent(new Event('popstate'));
            });
        }
    });

    /* Back ────────────────────────────────────────────────────── */
    document.getElementById('feedback-back-btn')?.addEventListener('click', () => window.history.back());

    if (window.applyTranslations) window.applyTranslations();
}
