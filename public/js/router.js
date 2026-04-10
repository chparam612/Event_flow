import { renderWelcome, initWelcome }   from '/src/panels/attendee/welcome.js';
import { renderLanguage, initLanguage } from '/src/panels/attendee/language.js';
import { renderIntake, initIntake }     from '/src/panels/attendee/intake.js';
import { renderPlan, initPlan }         from '/src/panels/attendee/plan.js';
import { renderEscort, initEscort }     from '/src/panels/attendee/escort.js';
import { renderDuring, initDuring }     from '/src/panels/attendee/during.js';
import { renderExit, initExit }         from '/src/panels/attendee/exit.js';
import { renderFeedback, initFeedback } from '/src/panels/attendee/feedback.js';
import { renderStaff, initStaff }       from '/src/panels/staff/dashboard.js';
import { renderControl, initControl }   from '/src/panels/controlroom/dashboard.js';
import { renderHelp, initHelp }         from '/src/panels/attendee/help.js';
import { renderHow, initHow }           from '/src/panels/attendee/how.js';

const appDiv = document.getElementById('app');

const routes = {
    '/': 'attendee',
    '/language': 'language',
    '/intake': 'intake',
    '/plan': 'plan',
    '/escort': 'escort',
    '/during': 'during',
    '/exit': 'exit',
    '/feedback': 'feedback',
    '/staff': 'staff',
    '/control': 'control',
    '/help': 'help',
    '/how-it-works': 'how'
};

const renderPanel = (panelName) => {
    switch(panelName) {
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
        case 'how':
            appDiv.innerHTML = renderHow();
            initHow();
            break;
        case 'staff':
            appDiv.innerHTML = renderStaff();
            initStaff();
            break;
        case 'feedback':
            appDiv.innerHTML = renderFeedback();
            initFeedback();
            break;
        case 'control':
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
                    <h1 class="title">404 - Not Found</h1>
                    <div class="panel-content" style="text-align: center; padding: 40px;">
                        <h2 style="font-size: 3rem; color: var(--primary-color); margin-bottom: 10px;">Oops!</h2>
                        <p style="color: var(--text-secondary); margin-bottom: 25px;">The requested panel does not exist or has been moved.</p>
                        <a href="/" data-link style="display: inline-block; padding: 10px 24px; background: var(--primary-color); color: #000; text-decoration: none; border-radius: var(--br-sm); font-weight: 600; transition: transform 0.2s);">Return Home</a>
                    </div>
                </div>
            `;
            break;
    }
};

const router = () => {
    const path = window.location.pathname;
    const panelName = routes[path] || '404';
    renderPanel(panelName);
};

window.addEventListener('popstate', router);
window.addEventListener('eventflow:languageChanged', () => {
    console.log('Language changed — instantly re-rendering current route');
    router();
});

// Run router immediately as modules are deferred by default
console.log('EventFlow Router Initializing...');
if (appDiv) {
    router();
} else {
    console.error('Critical Error: #app container not found in DOM');
}

// Setup function to catch link clicks and use history API
document.body.addEventListener('click', e => {
    const link = e.target.closest('[data-link]');
    if (link) {
        e.preventDefault();
        window.history.pushState(null, null, link.href);
        router();
    }
});
