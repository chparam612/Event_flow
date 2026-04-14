/**
 * EventFlow — Gemini AI Module
 * Powers attendee chat + control room insights
 */

const GEMINI_API_KEY = 'AIzaSyCbA0Kz1RyKwWXi09XFiincfi0at-2cU7Y';
const GEMINI_MODEL = 'gemini-2.0-flash';
const API_URL = 
  'https://generativelanguage.googleapis.com/v1beta/models/' + 
  GEMINI_MODEL + 
  ':generateContent?key=' + 
  GEMINI_API_KEY;

const SYSTEM_CONTEXT = `You are EventFlow AI — a helpful 
crowd assistant at Narendra Modi Stadium, Ahmedabad. 
Help cricket fans navigate safely.
Rules:
- Be friendly and concise
- Give ONE clear recommendation first  
- Use simple language
- Mention specific gates/zones
- Never cause panic
- Keep responses under 3 sentences
- You know: Gates A-I, North/South/East/West stands,
  Concourses, Parking P1-P4`;

export async function askGemini(userMessage, crowdContext) {
  const contextStr = crowdContext ? 
    '\n\nCurrent venue status:\n' + 
    JSON.stringify(crowdContext, null, 2) 
    : '';
  
  const fullPrompt = SYSTEM_CONTEXT + 
    contextStr + 
    '\n\nFan question: ' + userMessage;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: fullPrompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 150,
          topP: 0.8
        }
      })
    });

    if (!response.ok) {
      throw new Error('Gemini API error: ' + response.status);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content
      ?.parts?.[0]?.text || 
      'Sorry, could not get response. Try again.';

  } catch (error) {
    console.error('Gemini error:', error);
    return 'AI assistant temporarily unavailable. ' +
      'Please check venue screens for updates.';
  }
}

export async function getControlInsights(densities) {
  const crowdSummary = Object.entries(densities)
    .map(([zone, d]) => 
      zone + ': ' + Math.round(d * 100) + '%'
    )
    .join(', ');

  const prompt = 
    'You are EventFlow Control AI at NMS Ahmedabad. ' +
    'Current crowd densities: ' + crowdSummary + '\n\n' +
    'Provide exactly 3 insights in this JSON format:\n' +
    '{\n' +
    '  "insights": [\n' +
    '    {\n' +
    '      "type": "warning|info|action",\n' +
    '      "zone": "zone name",\n' +
    '      "message": "insight under 15 words",\n' +
    '      "recommendation": "action under 10 words"\n' +
    '    }\n' +
    '  ]\n' +
    '}\n' +
    'Return ONLY valid JSON. No other text.';

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 300
        }
      })
    });

    const data = await response.json();
    const text = data.candidates?.[0]
      ?.content?.parts?.[0]?.text || '{}';
    
    const cleaned = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    
    return JSON.parse(cleaned);
    
  } catch (error) {
    console.error('Control insights error:', error);
    return { insights: [] };
  }
}
