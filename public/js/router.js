import { renderLanding, initLanding }         from '/src/panels/landing.js';
import { renderWelcome, initWelcome }         from '/src/panels/attendee/welcome.js';
import { renderLanguage, initLanguage }       from '/src/panels/attendee/language.js';
import { renderIntake, initIntake }           from '/src/panels/attendee/intake.js';
import { renderPlan, initPlan }               from '/src/panels/attendee/plan.js';
import { renderEscort, initEscort }           from '/src/panels/attendee/escort.js';
import { renderDuring, initDuring }           from '/src/panels/attendee/during.js';
import { renderExit, initExit }               from '/src/panels/attendee/exit.js';
import { renderFeedback, initFeedback }       from '/src/panels/attendee/feedback.js';
import { renderStaffLogin, initStaffLogin }   from '/src/panels/staff/login.js';
import { renderStaff, initStaff }             from '/src/panels/staff/dashboard.js';
import { renderControlLogin, initControlLogin } from '/src/panels/controlroom/login.js';
import { renderControl, initControl }         from '/src/panels/controlroom/dashboard.js';
import { renderHelp, initHelp }               from '/src/panels/attendee/help.js';
import { renderHow, initHow }                 from '/src/panels/attendee/how.js';
import { getCurrentUser }                     from '/src/auth.js';

const appDiv = document.getElementById('app');

/* ─── Routes ─────────────────────────────────────────── */
const routes = {
    '/':               'landing',
    '/attendee':       'attendee',
    '/language':       'language',
    '/intake':         'intake',
    '/plan':           'plan',
    '/escort':         'escort',
    '/during':         'during',
    '/exit':           'exit',
    '/feedback':       'feedback',
    '/staff-login':    'staff-login',
    '/staff':          'staff',
    '/control-login':  'control-login',
    '/control':        'control',
    '/help':           'help',
    '/how-it-works':   'how'
};

/* ─── Auth Guard ─────────────────────────────────────── */
function requireAuth(redirectTo) {
    const user = getCurrentUser();
    if (!user) {
        window.history.replaceState(null, null, redirectTo);
        return false;
    }
    return true;
}

/* ─── Render Panel ───────────────────────────────────── */
const renderPanel = (panelName) => {
    switch(panelName) {
        case 'landing':
            appDiv.innerHTML = renderLanding();
            initLanding();
            break;
        case 'attendee':
            appDiv.innerHTML = renderWelcome();
            initWelcome();
            break;
        case 'language':
            appDiv.innerHTML = renderLanguage();
            initLanguage();
            break;
        case 'intake':
            appDiv.innerHTML = renderIntake();
            initIntake();
            break;
        case 'plan':
            appDiv.innerHTML = renderPlan();
            initPlan();
            break;
        case 'escort':
            appDiv.innerHTML = renderEscort();
            initEscort();
            break;
        case 'during':
            appDiv.innerHTML = renderDuring();
            initDuring();
            break;
        case 'exit':
            appDiv.innerHTML = renderExit();
            initExit();
            break;
        case 'feedback':
            appDiv.innerHTML = renderFeedback();
            initFeedback();
            break;
        case 'how':
            appDiv.innerHTML = renderHow();
            initHow();
            break;
        case 'staff-login':
            appDiv.innerHTML = renderStaffLogin();
            initStaffLogin();
            break;
        case 'staff':
            if (!requireAuth('/staff-login')) { renderPanel('staff-login'); return; }
            appDiv.innerHTML = renderStaff();
            initStaff();
            break;
        case 'control-login':
            appDiv.innerHTML = renderControlLogin();
            initControlLogin();
            break;
        case 'control':
            if (!requireAuth('/control-login')) { renderPanel('control-login'); return; }
            appDiv.innerHTML = renderControl();
            initControl();
            break;
        case 'help':
            appDiv.innerHTML = renderHelp();
            initHelp();
            break;
        default:
            appDiv.innerHTML = `
                <div class="panel error-panel">
                    <div style="text-align:center; padding:60px 20px;">
                        <h2 style="font-size:3rem; color:#00C49A; margin-bottom:10px;">404</h2>
                        <p style="color:#555; margin-bottom:25px;">Page not found.</p>
                        <a href="/" data-link style="display:inline-block; padding:12px 28px;
                           background:#00C49A; color:#000; text-decoration:none;
                           border-radius:12px; font-weight:700;">Return Home</a>
                    </div>
                </div>`;
            break;
    }
};

const router = () => {
    const path = window.location.pathname;
    const panelName = routes[path] || '404';
    renderPanel(panelName);
};

window.addEventListener('popstate', router);

console.log('EventFlow Router v2 Initializing...');
if (appDiv) {
    router();
} else {
    console.error('Critical Error: #app container not found in DOM');
}

document.body.addEventListener('click', e => {
    const link = e.target.closest('[data-link]');
    if (link) {
        e.preventDefault();
        window.history.pushState(null, null, link.href);
        router();
    }
});
