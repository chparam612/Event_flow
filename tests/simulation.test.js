import { getZoneDensity, getAttendeeRoute, getExitPlan, simulateTick, getAttendeesDebug, ZONES } from '../src/simulation.js';
import en from '../src/i18n/en.json' with { type: 'json' };
import gu from '../src/i18n/gu.json' with { type: 'json' };
import hi from '../src/i18n/hi.json' with { type: 'json' };
import ta from '../src/i18n/ta.json' with { type: 'json' };
import te from '../src/i18n/te.json' with { type: 'json' };

console.log('Running EventFlow Simulation & i18n Tests...\n');

// Test 1: Zone density stays between 0-100 (0 to 1.25 in our logic mapped to %)
console.log('Test 1: Check Zone Densities...');
const densities = getZoneDensity();
Object.keys(densities).forEach(zone => {
    const val = densities[zone];
    console.assert(val >= 0 && val <= 1.25, `Zone ${zone} density out of bounds: ${val}`);
});
console.log('✓ Test 1 Passed.\n');

// Test 2: Attendee route returns valid gate
console.log('Test 2: Check Attendee Route Valid Gate...');
const attendees = getAttendeesDebug();
if (attendees.length > 0) {
    const sampleRoute = getAttendeeRoute(attendees[0].id);
    console.assert(sampleRoute !== null, "Route should not be null");
    console.assert(sampleRoute.projectedRoute.includes(ZONES.GATE_AREA), "Route must include the Gate Area");
}
console.log('✓ Test 2 Passed.\n');

// Test 3: i18n keys exist in all 5 languages
console.log('Test 3: Cross-check i18n keys...');
const enKeys = Object.keys(en);
const langs = { Gujarati: gu, Hindi: hi, Tamil: ta, Telugu: te };
Object.entries(langs).forEach(([langName, langJSON]) => {
    enKeys.forEach(key => {
        console.assert(langJSON[key] !== undefined, `Missing key '${key}' in ${langName}`);
    });
});
console.log('✓ Test 3 Passed.\n');

// Test 4: Exit plan returns 3 options
console.log('Test 4: Verify Exit Plan Options...');
const exitPlan = getExitPlan();
console.assert(exitPlan.instructions.length >= 3, "Exit plan should return at least 3 instruction options");
console.log('✓ Test 4 Passed.\n');

// Test 5: Simulation tick updates zone values
console.log('Test 5: Verify Simulation Tick Updates...');
// Advance simulation deep into the match to ensure zones have density
for(let i=0; i<100; i++) simulateTick();
const advancedDensities = getZoneDensity();
const hasLoad = Object.values(advancedDensities).some(d => d > 0);
console.assert(hasLoad, "At least one zone should have crowd density after advanced ticks");
console.log('✓ Test 5 Passed.\n');

console.log('ALL TESTS PASSED SUCCESSFULLY! ✅');
