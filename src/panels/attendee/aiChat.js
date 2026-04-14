/**
 * EventFlow — AI Chat Widget for Attendees
 */
import { askGemini } from '/src/gemini.js';
import { getZoneDensity } from '/src/simulation.js';

export function renderAIChat() {
  return `
  <button id="ai-chat-btn" aria-label="Open AI Assistant"
    style="position:fixed;bottom:90px;right:20px;
    width:56px;height:56px;border-radius:50%;
    background:linear-gradient(135deg,#00C49A,#00a07d);
    border:none;cursor:pointer;z-index:1000;
    box-shadow:0 4px 20px rgba(0,196,154,0.4);
    display:flex;align-items:center;
    justify-content:center;font-size:24px;
    transition:transform 0.2s;">
    🤖
  </button>

  <div id="ai-chat-panel" style="
    position:fixed;bottom:0;left:0;right:0;
    height:70vh;background:#0d1117;
    border-top:1px solid rgba(0,196,154,0.2);
    border-radius:20px 20px 0 0;
    transform:translateY(100%);
    transition:transform 0.3s ease;
    z-index:999;display:flex;
    flex-direction:column;
    font-family:'Inter',sans-serif;">

    <div style="padding:16px 20px;
      border-bottom:1px solid rgba(0,196,154,0.15);
      display:flex;align-items:center;
      justify-content:space-between;">
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="width:36px;height:36px;
          border-radius:50%;
          background:linear-gradient(135deg,#00C49A,#00a07d);
          display:flex;align-items:center;
          justify-content:center;font-size:18px;">🤖</div>
        <div>
          <div style="color:#fff;font-weight:700;
            font-size:0.95rem;">EventFlow AI</div>
          <div style="color:#00C49A;font-size:0.72rem;">
            ● Online — NMS Assistant</div>
        </div>
      </div>
      <button id="ai-chat-close" aria-label="Close chat"
        style="background:none;border:none;
        color:#555;font-size:24px;cursor:pointer;">✕
      </button>
    </div>

    <div id="ai-messages" style="
      flex:1;overflow-y:auto;padding:16px;
      display:flex;flex-direction:column;gap:12px;">
      <div style="
        background:rgba(0,196,154,0.08);
        border:1px solid rgba(0,196,154,0.15);
        border-radius:12px 12px 12px 4px;
        padding:12px 14px;max-width:85%;
        color:#e8f4f8;font-size:0.88rem;
        line-height:1.5;">
        👋 Namaste! Main EventFlow AI hoon.
        Aaj NMS mein aapki kaise madad kar sakta hoon?
      </div>
    </div>

    <div style="padding:8px 16px;display:flex;
      gap:8px;overflow-x:auto;scrollbar-width:none;">
      <button class="ai-quick"
        data-q="Which gate is least crowded right now?"
        style="white-space:nowrap;padding:6px 12px;
        background:rgba(0,196,154,0.1);
        border:1px solid rgba(0,196,154,0.25);
        border-radius:20px;color:#00C49A;
        font-size:0.75rem;cursor:pointer;">
        🚪 Least crowded gate?
      </button>
      <button class="ai-quick"
        data-q="Best time to get food during the match?"
        style="white-space:nowrap;padding:6px 12px;
        background:rgba(0,196,154,0.1);
        border:1px solid rgba(0,196,154,0.25);
        border-radius:20px;color:#00C49A;
        font-size:0.75rem;cursor:pointer;">
        🍕 When to get food?
      </button>
      <button class="ai-quick"
        data-q="What is the fastest exit route right now?"
        style="white-space:nowrap;padding:6px 12px;
        background:rgba(0,196,154,0.1);
        border:1px solid rgba(0,196,154,0.25);
        border-radius:20px;color:#00C49A;
        font-size:0.75rem;cursor:pointer;">
        🚗 Fastest exit?
      </button>
      <button class="ai-quick"
        data-q="Where is the nearest restroom?"
        style="white-space:nowrap;padding:6px 12px;
        background:rgba(0,196,154,0.1);
        border:1px solid rgba(0,196,154,0.25);
        border-radius:20px;color:#00C49A;
        font-size:0.75rem;cursor:pointer;">
        🚽 Nearest restroom?
      </button>
    </div>

    <div style="padding:12px 16px;
      border-top:1px solid rgba(0,196,154,0.1);
      display:flex;gap:10px;align-items:center;">
      <input id="ai-input" type="text"
        placeholder="Kuch bhi poochho..."
        aria-label="Ask AI assistant"
        style="flex:1;padding:12px 16px;
        background:rgba(255,255,255,0.05);
        border:1px solid rgba(0,196,154,0.2);
        border-radius:12px;color:#fff;
        font-size:0.9rem;outline:none;"/>
      <button id="ai-send" aria-label="Send message"
        style="width:44px;height:44px;
        border-radius:12px;
        background:linear-gradient(135deg,#00C49A,#00a07d);
        border:none;cursor:pointer;
        font-size:20px;color:#fff;
        display:flex;align-items:center;
        justify-content:center;">↑</button>
    </div>
  </div>`;
}

export function initAIChat() {
  const chatBtn = document.getElementById('ai-chat-btn');
  const chatPanel = document.getElementById('ai-chat-panel');
  const closeBtn = document.getElementById('ai-chat-close');
  const sendBtn = document.getElementById('ai-send');
  const input = document.getElementById('ai-input');
  const messages = document.getElementById('ai-messages');

  chatBtn?.addEventListener('click', () => {
    chatPanel.style.transform = 'translateY(0)';
    input?.focus();
  });

  closeBtn?.addEventListener('click', () => {
    chatPanel.style.transform = 'translateY(100%)';
  });

  document.querySelectorAll('.ai-quick').forEach(btn => {
    btn.addEventListener('click', () => {
      sendMessage(btn.getAttribute('data-q'));
    });
  });

  sendBtn?.addEventListener('click', () => {
    const msg = input?.value?.trim();
    if (msg) sendMessage(msg);
  });

  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const msg = input?.value?.trim();
      if (msg) sendMessage(msg);
    }
  });

  async function sendMessage(text) {
    if (!text) return;
    if (input) input.value = '';
    addMessage(text, 'user');

    const loadingId = 'load-' + Date.now();
    addMessage('⏳ Thinking...', 'bot', loadingId);

    const densities = getZoneDensity();
    const context = {
      zones: Object.entries(densities).map(
        ([name, d]) => ({
          name,
          density: Math.round(d * 100) + '%',
          status: d > 0.8 ? 'CRITICAL' : 
                  d > 0.6 ? 'BUSY' : 'CLEAR'
        })
      )
    };

    const reply = await askGemini(text, context);

    const loadingEl = document.getElementById(loadingId);
    if (loadingEl) {
      loadingEl.textContent = reply;
      loadingEl.removeAttribute('id');
    }
    if (messages) {
      messages.scrollTop = messages.scrollHeight;
    }
  }

  function addMessage(text, role, id) {
    const div = document.createElement('div');
    if (id) div.id = id;
    div.style.cssText = role === 'user' ? `
      background:rgba(0,196,154,0.15);
      border:1px solid rgba(0,196,154,0.25);
      border-radius:12px 12px 4px 12px;
      padding:10px 14px;max-width:80%;
      align-self:flex-end;color:#e8f4f8;
      font-size:0.88rem;line-height:1.5;
      margin-left:auto;
    ` : `
      background:rgba(255,255,255,0.04);
      border:1px solid rgba(255,255,255,0.08);
      border-radius:12px 12px 12px 4px;
      padding:10px 14px;max-width:85%;
      color:#e8f4f8;font-size:0.88rem;
      line-height:1.5;
    `;
    div.textContent = text;
    messages?.appendChild(div);
    if (messages) {
      messages.scrollTop = messages.scrollHeight;
    }
  }
}
