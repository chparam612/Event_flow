import { renderLanding, initLanding }           from '/src/panels/landing.js';
import { renderWelcome, initWelcome }           from '/src/panels/attendee/welcome.js';
import { renderLanguage, initLanguage }         from '/src/panels/attendee/language.js';
import { renderIntake, initIntake }             from '/src/panels/attendee/intake.js';
import { renderPlan, initPlan }                 from '/src/panels/attendee/plan.js';
import { renderEscort, initEscort }             from '/src/panels/attendee/escort.js';
import { renderDuring, initDuring }             from '/src/panels/attendee/during.js';
import { renderExit, initExit }                 from '/src/panels/attendee/exit.js';
import { renderFeedback, initFeedback }         from '/src/panels/attendee/feedback.js';
import { renderStaffLogin, initStaffLogin }     from '/src/panels/staff/login.js';
import { renderStaff, initStaff }               from '/src/panels/staff/dashboard.js';
import { renderControlLogin, initControlLogin } from '/src/panels/controlroom/login.js';
import { renderControl, initControl }           from '/src/panels/controlroom/dashboard.js';
import { renderHelp, initHelp }                 from '/src/panels/attendee/help.js';
import { renderHow, initHow }                   from '/src/panels/attendee/how.js';
import { waitForAuthReady }                     from '/src/auth.js';

const appDiv = document.getElementById('app');

/* ─── Navigate helper (global) ───────────────────────── */
function navigate(path) {
  // Update browser URL without page reload
  window.history.pushState({}, '', path);
  // Then render correct panel
  renderPanel(getInitialRoute());
}
// Expose globally so panel modules can call window.navigate('/path')
window.navigate = navigate;


/* ─── Loading Spinner ────────────────────────────────── */
function showAuthLoading() {
    appDiv.innerHTML = `
    <div style="min-height:100vh;background:#080C14;display:flex;
        align-items:center;justify-content:center;flex-direction:column;gap:16px;">
        <div style="width:40px;height:40px;border:3px solid #1e293b;
            border-top-color:#00C49A;border-radius:50%;animation:spin 0.8s linear infinite;"></div>
        <div style="color:#3a4560;font-size:0.85rem;font-family:Inter,sans-serif;">Verifying access...</div>
        <style>@keyframes spin{to{transform:rotate(360deg);}}</style>
    </div>`;
}

/* ─── Auth Guard (async — waits for Firebase to init) ── */
async function requireAuth(requiredRole, loginPath) {
    showAuthLoading();
    const user = await waitForAuthReady();

    if (!user) {
        navigate(loginPath);
        return false;
    }
    if (requiredRole === 'staff' && !user.email?.includes('staff')) {
        navigate(loginPath);
        return false;
    }
    if (requiredRole === 'control' && !user.email?.includes('control')) {
        navigate(loginPath);
        return false;
    }
    return true;
}


/* ─── Render Panel ───────────────────────────────────── */
async function renderPanel(panelName) {
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
        case 'staff': {
            const ok = await requireAuth('staff', '/staff-login');
            if (!ok) return;
            appDiv.innerHTML = renderStaff();
            initStaff();
            break;
        }
        case 'control-login':
            appDiv.innerHTML = renderControlLogin();
            initControlLogin();
            break;
        case 'control': {
            const ok = await requireAuth('control', '/control-login');
            if (!ok) return;
            appDiv.innerHTML = renderControl();
            initControl();
            break;
        }
        case 'help':
            appDiv.innerHTML = renderHelp();
            initHelp();
            break;
        default:
            appDiv.innerHTML = `
                <div style="min-height:100vh;background:#080C14;display:flex;
                    align-items:center;justify-content:center;flex-direction:column;
                    font-family:Inter,sans-serif;gap:12px;">
                    <div style="font-size:3rem;color:#00C49A;">404</div>
                    <div style="color:#3a4560;">Page not found.</div>
                    <a href="/" data-link style="margin-top:8px;padding:12px 28px;
                        background:#00C49A;color:#000;text-decoration:none;
                        border-radius:12px;font-weight:700;">Return Home</a>
                </div>`;
            break;
    }
}

/* ─── Router ─────────────────────────────────────────── */
function getInitialRoute() {
  // Read from current browser URL
  const path = window.location.pathname;
  
  // Map URL paths to panel names
  const routes = {
    '/': 'landing',
    '/attendee': 'attendee',
    '/language': 'language',
    '/intake': 'intake',
    '/plan': 'plan',
    '/escort': 'escort',
    '/during': 'during',
    '/exit': 'exit',
    '/feedback': 'feedback',
    '/staff-login': 'staff-login',
    '/staff': 'staff',
    '/control-login': 'control-login',
    '/control': 'control',
    '/help': 'help',
    '/how-it-works': 'how'
  };
  
  return routes[path] || 'landing';
}

// On app start — read URL and render correct panel
document.addEventListener('DOMContentLoaded', () => {
  renderPanel(getInitialRoute());
});

// Handle browser back/forward buttons
window.addEventListener('popstate', () => {
  renderPanel(getInitialRoute());
});

document.body.addEventListener('click', e => {
    const link = e.target.closest('[data-link]');
    if (link) {
        e.preventDefault();
        navigate(link.getAttribute('href') || link.href);
    }
});
