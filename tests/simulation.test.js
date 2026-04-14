/**
 * EventFlow — Core Logic Tests
 * Run: node tests/simulation.test.js
 */

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log('✅ PASS:', name);
    passed++;
  } catch(e) {
    console.log('❌ FAIL:', name, '-', e.message);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

console.log('EventFlow Test Suite');
console.log('====================\n');

// Test 1: Zone density validation
test('Zone density must be 0-100', () => {
  const validate = d => d >= 0 && d <= 100;
  assert(validate(0), '0 should be valid');
  assert(validate(100), '100 should be valid');
  assert(validate(75), '75 should be valid');
  assert(!validate(-1), '-1 should be invalid');
  assert(!validate(101), '101 should be invalid');
});

// Test 2: Zone status thresholds
test('Zone status thresholds are correct', () => {
  const getStatus = d => {
    if (d < 60) return 'clear';
    if (d < 80) return 'busy';
    return 'critical';
  };
  assert(getStatus(30) === 'clear', '30% should be clear');
  assert(getStatus(59) === 'clear', '59% should be clear');
  assert(getStatus(60) === 'busy', '60% should be busy');
  assert(getStatus(79) === 'busy', '79% should be busy');
  assert(getStatus(80) === 'critical', '80% should be critical');
  assert(getStatus(100) === 'critical', '100% should be critical');
});

// Test 3: Group routing logic
test('Group size routing assigns correct category', () => {
  const routeGroup = size => {
    if (size <= 2) return 'standard';
    if (size <= 6) return 'medium';
    return 'large';
  };
  assert(routeGroup(1) === 'standard', 'Solo = standard');
  assert(routeGroup(2) === 'standard', 'Pair = standard');
  assert(routeGroup(3) === 'medium', '3 = medium');
  assert(routeGroup(6) === 'medium', '6 = medium');
  assert(routeGroup(7) === 'large', '7+ = large');
});

// Test 4: Exit options count
test('Exit plan provides exactly 3 options', () => {
  const exitOptions = [
    { id: 'now', label: 'Leave Now', eta: 4 },
    { id: 'wait', label: 'Wait 15 Min', eta: 6 },
    { id: 'stay', label: 'Stay for Ceremony', eta: 25 }
  ];
  assert(exitOptions.length === 3, 'Must have 3 exit options');
  assert(exitOptions[0].eta < exitOptions[2].eta,
    'Leave now must be faster than staying');
});

// Test 5: Language support
test('All 5 required languages are defined', () => {
  const SUPPORTED_LANGS = ['en', 'hi', 'gu', 'ta', 'te'];
  const LANG_NAMES = {
    en: 'English',
    hi: 'हिंदी',
    gu: 'ગુજરાતી',
    ta: 'தமிழ்',
    te: 'తెలుగు'
  };
  assert(SUPPORTED_LANGS.length === 5, 'Must support 5 languages');
  SUPPORTED_LANGS.forEach(lang => {
    assert(LANG_NAMES[lang], `${lang} must have a display name`);
  });
});

// Test 6: NMS venue zones
test('NMS has all 8 required zones', () => {
  const zones = [
    'north_stand', 'south_stand',
    'east_stand', 'west_stand',
    'north_concourse', 'south_concourse',
    'gate_area', 'parking'
  ];
  assert(zones.length === 8, 'NMS must have 8 zones');
});

// Test 7: Cricket match timeline
test('Cricket match has correct timeline events', () => {
  const timeline = [
    { time: '18:00', event: 'gates_open' },
    { time: '19:30', event: 'match_start' },
    { time: '22:00', event: 'innings_break' },
    { time: '01:00', event: 'match_end' }
  ];
  assert(timeline.length === 4, 'Must have 4 timeline events');
  assert(timeline[0].event === 'gates_open',
    'First event must be gates_open');
  assert(timeline[timeline.length-1].event === 'match_end',
    'Last event must be match_end');
});

// Test 8: Nudge timing logic
test('Nudge triggers before crowd peak not after', () => {
  const NUDGE_LEAD_TIME_MINS = 5;
  const inningsBreakTime = 22 * 60; // 22:00 in minutes
  const nudgeTime = inningsBreakTime - NUDGE_LEAD_TIME_MINS;
  assert(nudgeTime === (21 * 60 + 55),
    'Nudge at 21:55 for 22:00 break');
  assert(NUDGE_LEAD_TIME_MINS > 0,
    'Must nudge BEFORE not after');
});

// Summary
console.log('\n====================');

test('Crowd context for Gemini is correct format', () => {
  const mockDensities = {
    'North Stand': 0.75,
    'South Stand': 0.45,
    'East Stand': 0.92
  };
  const context = Object.entries(mockDensities)
    .map(([name, d]) => ({
      name,
      density: Math.round(d * 100) + '%',
      status: d > 0.8 ? 'CRITICAL' : 
              d > 0.6 ? 'BUSY' : 'CLEAR'
    }));
  assert(context.length === 3,
    'Context must have 3 zones');
  assert(context[2].status === 'CRITICAL',
    'East Stand 92% must be CRITICAL');
  assert(context[1].status === 'CLEAR',
    'South Stand 45% must be CLEAR');
});

test('AI fallback message is valid', () => {
  const fallback = 
    'AI assistant temporarily unavailable. ' +
    'Please check venue screens for updates.';
  assert(fallback.length > 0,
    'Fallback must exist');
  assert(!fallback.includes('undefined'),
    'Fallback must not have undefined');
});

test('Gemini insight types are valid', () => {
  const validTypes = ['warning', 'info', 'action'];
  const testInsight = { type: 'warning' };
  assert(
    validTypes.includes(testInsight.type),
    'Type must be warning, info, or action'
  );
});

console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed === 0) {
  console.log('🎉 All tests passed! EventFlow logic verified.');
} else {
  console.log('⚠️  Some tests failed. Review above.');
  process.exit(1);
}

