/**
 * Lightweight dynamic loader for localized UI
 */

let currentTranslations = {};

export async function loadTranslations(lang = 'en') {
    try {
        // Path adjusted: If standard static hosting is ignoring src, we mock it via fetch but adjust paths appropriately.
        // During dev we assume the server can reach it or we copy them across.
        const response = await fetch(`/src/i18n/${lang}.json`);
        if(response.ok) {
            currentTranslations = await response.json();
            return currentTranslations;
        }
        console.warn('Localization file not found for:', lang);
    } catch (e) {
        console.error("Could not load translations for", lang, e);
    }
}

function getNestedValue(obj, path) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

export async function applyTranslations() {
    const lang = localStorage.getItem('app_lang') || 'en';
    await loadTranslations(lang);
    
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translatedText = getNestedValue(currentTranslations, key);
        if (translatedText) {
            if (typeof translatedText === 'string') {
                el.textContent = translatedText;
            }
        }
    });

    // Update the html language attribute
    document.documentElement.lang = lang;

    // Dispatch global event for instant re-render
    window.dispatchEvent(new CustomEvent('eventflow:languageChanged', { detail: lang }));
}

// Attach globally so independent vanilla JS files can trigger it
window.applyTranslations = applyTranslations;

window.addEventListener('DOMContentLoaded', () => {
    applyTranslations();
});
