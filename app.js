/* -------------------------------------------------------------
 * AI Website Agent — Application Logic (app.js)
 * ------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  // --- STATE ---
  let files = {
    'index.html': {
      name: 'index.html',
      content: `<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <title>Yangi Veb-Sayt</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="welcome-box">
    <h1>Salom! Sizning yangi saytingiz tayyor 🚀</h1>
    <p>Chap tarafdagi AI agentiga buyruq bering va u ushbu saytni o'zgartiradi.</p>
    <button id="click-me-btn">Meni bosing</button>
    <div id="click-msg" class="message"></div>
  </div>
  <script src="script.js"></script>
</body>
</html>`
    },
    'style.css': {
      name: 'style.css',
      content: `body {
  margin: 0;
  padding: 0;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: radial-gradient(circle, #0f172a, #020617);
  color: #f8fafc;
  font-family: system-ui, sans-serif;
}
.welcome-box {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 2.5rem;
  border-radius: 1.5rem;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  max-width: 400px;
}
h1 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}
p {
  color: #94a3b8;
  font-size: 0.9rem;
  line-height: 1.6;
}
button {
  background: linear-gradient(135deg, #8b5cf6, #c084fc);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 0.5rem;
  cursor: pointer;
  margin-top: 1.5rem;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
}
button:hover {
  transform: translateY(-1px);
}
.message {
  margin-top: 1rem;
  color: #10b981;
  font-weight: 500;
}`
    },
    'script.js': {
      name: 'script.js',
      content: `// Tugmani bosish logikasi
const btn = document.getElementById('click-me-btn');
const msg = document.getElementById('click-msg');

if (btn && msg) {
  btn.addEventListener('click', () => {
    msg.innerText = "🎉 Ajoyib! Skript muvaffaqiyatli ulangan!";
    console.log("Foydalanuvchi tugmani bosdi!");
  });
}`
    }
  };

  let selectedFile = 'index.html';
  let apiKey = localStorage.getItem('gemini_api_key') || '';

  // --- DOM ELEMENTS ---
  const chatForm = document.getElementById('chat-form');
  const userInputField = document.getElementById('user-input-field');
  const messagesContainer = document.getElementById('messages-container');
  const apiStatusEl = document.getElementById('api-status');
  const bannerApiWarning = document.getElementById('banner-api-warning');
  const connectBannerBtn = document.getElementById('connect-banner-btn');
  const openSettingsBtn = document.getElementById('open-settings-btn');
  const settingsModalOverlay = document.getElementById('settings-modal-overlay');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const settingsForm = document.getElementById('settings-form');
  const geminiApiKeyInput = document.getElementById('gemini-api-key-input');
  const clearApiKeyBtn = document.getElementById('clear-api-key-btn');
  const codeTextarea = document.getElementById('code-textarea');
  const lineNumbersContainer = document.getElementById('line-numbers-container');
  const tabsContainer = document.getElementById('tabs-container');
  const refreshPreviewBtn = document.getElementById('refresh-preview-btn');
  const livePreviewIframe = document.getElementById('live-preview-iframe');
  const templateBtns = document.querySelectorAll('.template-btn');

  // --- INIT APPLICATION ---
  initApp();

  function initApp() {
    updateApiStatusUI();
    loadActiveFile();
    compilePreview();
    sendWelcomeMessage();

    // Event Listeners
    chatForm.addEventListener('submit', handleChatSubmit);
    openSettingsBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    connectBannerBtn.addEventListener('click', openModal);
    settingsForm.addEventListener('submit', saveApiKey);
    clearApiKeyBtn.addEventListener('click', clearApiKey);
    refreshPreviewBtn.addEventListener('click', compilePreview);
    codeTextarea.addEventListener('input', handleEditorInput);

    // File switching tabs
    tabsContainer.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        tabsContainer.querySelector('.tab.active').classList.remove('active');
        tab.classList.add('active');
        selectedFile = tab.getAttribute('data-file');
        loadActiveFile();
      });
    });

    // Preset template triggers
    templateBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const templateName = btn.getAttribute('data-template');
        loadPresetTemplate(templateName);
      });
    });
  }

  // --- WORKSPACE & EDITOR FUNCTIONS ---
  function loadActiveFile() {
    codeTextarea.value = files[selectedFile].content;
    updateLineNumbers();
  }

  function handleEditorInput() {
    files[selectedFile].content = codeTextarea.value;
    updateLineNumbers();
    compilePreview();
  }

  function updateLineNumbers() {
    const text = codeTextarea.value;
    const lines = text.split('\n').length;
    let html = '';
    for (let i = 1; i <= lines; i++) {
      html += `<div>${i}</div>`;
    }
    lineNumbersContainer.innerHTML = html;
  }

  // Compiler merging virtual files into iframe
  function compilePreview() {
    let html = files['index.html'].content;
    const css = files['style.css'].content;
    const js = files['script.js'].content;

    // Inject CSS
    const linkRegex = /<link[^>]*href=["']\s*style\.css\s*["'][^>]*>/gi;
    if (linkRegex.test(html)) {
      html = html.replace(linkRegex, `<style>${css}</style>`);
    } else {
      html = html.replace('</head>', `<style>${css}</style></head>`);
    }

    // Inject JS
    const scriptRegex = /<script[^>]*src=["']\s*script\.js\s*["'][^>]*>\s*<\/script>/gi;
    if (scriptRegex.test(html)) {
      html = html.replace(scriptRegex, `<script>${js}</script>`);
    } else {
      html = html.replace('</body>', `<script>${js}</script></body>`);
    }

    livePreviewIframe.srcdoc = html;
  }

  // --- API KEY MODAL FUNCTIONS ---
  function openModal() {
    geminiApiKeyInput.value = apiKey;
    settingsModalOverlay.classList.add('active');
  }

  function closeModal() {
    settingsModalOverlay.classList.remove('active');
  }

  function saveApiKey(e) {
    e.preventDefault();
    const key = geminiApiKeyInput.value.trim();
    if (key) {
      apiKey = key;
      localStorage.setItem('gemini_api_key', key);
      updateApiStatusUI();
      closeModal();
      appendMessage('ai', "🔑 Gemini API Kaliti muvaffaqiyatli saqlandi! Tizim endi haqiqiy AI agenti rejimida ishlaydi.");
    }
  }

  function clearApiKey() {
    apiKey = '';
    localStorage.removeItem('gemini_api_key');
    updateApiStatusUI();
    closeModal();
    appendMessage('ai', "🗑️ Gemini API kaliti o'chirildi. Tizim simulyatsiya rejimiga qaytdi.");
  }

  function updateApiStatusUI() {
    const isOnline = apiKey && apiKey.startsWith('AIzaSy');
    if (isOnline) {
      apiStatusEl.innerText = "ONLINE";
      apiStatusEl.className = "status-badge online";
      bannerApiWarning.style.display = "none";
      document.querySelector('.avatar.ai')?.classList.add('online');
    } else {
      apiStatusEl.innerText = "SIMULYATSIYA";
      apiStatusEl.className = "status-badge";
      bannerApiWarning.style.display = "flex";
      document.querySelector('.avatar.ai')?.classList.remove('online');
    }
  }

  // --- CHAT CONSOLE LOGIC ---
  function sendWelcomeMessage() {
    appendMessage('ai', `Salom! Men Antigravity AI loyiha yozuvchi agent kloniman. 🤖

Menga istalgan veb-sayt haqida yozib topshiriq bering. Masalan: *"Menga kofe do'koni uchun glassmorphism dizayndagi veb-sahifa qilib ber"* deb buyuring.

Agar sizda **Gemini API kaliti** bo'lsa, sozlamalarga kalitingizni ulab, real vaqtda istalgan kod yozish va tahrirlash agentimizni sinab ko'ring!`);
  }

  function appendMessage(sender, text, isCode = false) {
    const msgWrapper = document.createElement('div');
    msgWrapper.className = `message-wrapper animate-fade-in ${sender}`;

    const avatar = document.createElement('div');
    avatar.className = `avatar ${sender}`;
    avatar.innerText = sender === 'ai' ? 'AG' : 'US';
    if (sender === 'ai' && apiKey && apiKey.startsWith('AIzaSy')) {
      avatar.classList.add('online');
    }

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    
    if (isCode) {
      bubble.innerText = text;
    } else {
      // Helper function to render text nicely (including markdown code blocks)
      bubble.innerHTML = renderMarkdown(text);
    }

    msgWrapper.appendChild(avatar);
    msgWrapper.appendChild(bubble);
    messagesContainer.appendChild(msgWrapper);
    
    // Auto-scroll
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function showTypingIndicator() {
    const wrapper = document.createElement('div');
    wrapper.className = 'message-wrapper ai animate-fade-in typing-indicator-wrapper';
    wrapper.id = 'typing-indicator';

    const avatar = document.createElement('div');
    avatar.className = 'avatar ai';
    avatar.innerText = 'AG';

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.innerHTML = `
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    `;

    wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);
    messagesContainer.appendChild(wrapper);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function removeTypingIndicator() {
    const el = document.getElementById('typing-indicator');
    if (el) el.remove();
  }

  function renderMarkdown(text) {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const match = part.match(/```([\w:-]*)\n([\s\S]*?)```/);
        const language = match ? match[1] : 'code';
        const codeContent = match ? match[2] : part.slice(3, -3);
        
        const langParts = language.split(':');
        const displayLanguage = langParts[0] || 'code';
        const fileName = langParts[1] || '';

        return `
          <div class="code-block-container">
            <div class="code-block-header">
              <span>${fileName ? `📄 ${fileName} (${displayLanguage})` : displayLanguage}</span>
              <button class="copy-code-btn" onclick="navigator.clipboard.writeText(\`${codeContent.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`); this.innerText='Nusxalandi!'; setTimeout(() => this.innerText='Nusxalash', 2000)">Nusxalash</button>
            </div>
            <pre class="code-pre"><code>${escapeHTML(codeContent.trim())}</code></pre>
          </div>
        `;
      }
      return `<span style="white-space: pre-wrap;">${escapeHTML(part)}</span>`;
    }).join('');
  }

  function escapeHTML(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // --- CHAT SUBMIT HANDLING ---
  async function handleChatSubmit(e) {
    e.preventDefault();
    const query = userInputField.value.trim();
    if (!query) return;

    appendMessage('user', query);
    userInputField.value = '';
    showTypingIndicator();

    // Call Real Gemini API if online, else run simulation
    if (apiKey && apiKey.startsWith('AIzaSy')) {
      await callGeminiAPI(query);
    } else {
      setTimeout(() => {
        removeTypingIndicator();
        const reply = getSimulatedResponse(query);
        appendMessage('ai', reply);
      }, 1200);
    }
  }

  // --- REAL GEMINI API CALL ---
  async function callGeminiAPI(userQuery) {
    try {
      const filesContext = Object.entries(files)
        .map(([name, file]) => `Fayl: ${name}\nTarkibi:\n\`\`\`\n${file.content}\n\`\`\``)
        .join('\n\n');

      const systemPrompt = `Sizning ismingiz Antigravity. Siz Google DeepMind loyihalari asosida ishlovchi kuchli sun'iy intellekt coding agentisiz.
Foydalanuvchi bilan birgalikda split-screen veb-loyiha tahrirlagichida ishlayapsiz.
Sizning qo'lingizda virtual muhitda uchta fayl bor:
${filesContext}

QOIDALAR:
1. Foydalanuvchi saytga biror narsa qo'shish, yangi sayt qilish yoki kodni o'zgartirishni so'rasa, yangilangan fayllarni to'liq tarkibi bilan maxsus kod bloklarida qaytaring.
2. Kod blokining til sarlavhasiga ikki nuqta orqali fayl nomini yozing. Masalan:
\`\`\`html:index.html
<!DOCTYPE html>
...
\`\`\`
yoki
\`\`\`css:style.css
body { ... }
\`\`\`
yoki
\`\`\`javascript:script.js
console.log("...");
\`\`\`
3. Agar bir nechta faylni o'zgartirsangiz, har biri uchun alohida blok oching.
4. Javoblaringizni o'zbek tilida, do'stona va aniq qilib bering. Qaysi fayllarni o'zgartirganingizni batafsil yozib tushuntiring.
5. Foydalanuvchi so'rovi: "${userQuery}"`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: systemPrompt
                  }
                ]
              }
            ]
          })
        }
      );

      removeTypingIndicator();

      if (!response.ok) {
        throw new Error("Gemini API serverida xatolik.");
      }

      const data = await response.json();
      const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Javob olishda xatolik yuz berdi.";

      // Extract and update file contents using regex
      const fileRegex = /```(\w+)[:]([\w\.-]+)\n([\s\S]*?)```/g;
      let match;
      let isUpdated = false;
      let lastUpdatedFile = null;

      while ((match = fileRegex.exec(replyText)) !== null) {
        const fileName = match[2];
        const fileContent = match[3];

        if (files[fileName]) {
          files[fileName].content = fileContent;
          isUpdated = true;
          lastUpdatedFile = fileName;
        }
      }

      if (isUpdated) {
        // Update Editor UI
        if (lastUpdatedFile) {
          selectedFile = lastUpdatedFile;
          // Set active tab styling
          tabsContainer.querySelectorAll('.tab').forEach(tab => {
            if (tab.getAttribute('data-file') === selectedFile) {
              tab.classList.add('active');
            } else {
              tab.classList.remove('active');
            }
          });
        }
        loadActiveFile();
        compilePreview();
      }

      appendMessage('ai', replyText);

    } catch (err) {
      console.error(err);
      removeTypingIndicator();
      appendMessage('ai', "❌ Gemini API so'rovida xatolik yuz berdi. Iltimos kalitingizni sozlamalardan tekshirib ko'ring yoki simulyatsiya rejimidan foydalaning.");
    }
  }

  // --- SMART SIMULATED RESPONSES ---
  function getSimulatedResponse(text) {
    const cleanText = text.toLowerCase();

    if (cleanText.includes('portfol') || cleanText.includes('tashrif') || cleanText.includes('shaxsiy')) {
      loadPresetTemplate('portfolio');
      return `✨ Albatta! Siz so'ragan premium dizayndagi **Shaxsiy Portfolio** loyihasini virtual muhitda yaratdim!

O'ng tarafdagi Live Preview sahifasida loyihani bemalol ko'rishingiz va o'ng tarafdagi muharrir orqali uning kodlarini o'zgartirishingiz mumkin.`;
    }
    
    if (cleanText.includes('do\'kon') || cleanText.includes('shop') || cleanText.includes('magazin') || cleanText.includes('kafe')) {
      loadPresetTemplate('store');
      return `🛒 Ajoyib! Foydalanuvchilar mahsulotlarni tanlashi va savatchaga qo'shishi mumkin bo'lgan **Do'kon/Kafe Veb-sahifasi** yaratildi.
      
Barcha ma'lumotlar, savatcha logikasi, va neon dizaynlar tayyor. Live Preview brauzerida xaridlar qilib tekshirib ko'ring!`;
    }

    if (cleanText.includes('todo') || cleanText.includes('vazifa') || cleanText.includes('ro\'yxat')) {
      loadPresetTemplate('todo');
      return `📝 Virtual loyihamizda to'liq interaktiv **Vazifalar (Todo) Ilovasi** yaratildi. Unda vazifalar qo'shish va o'chirish logikasi Javascript orqali to'liq bog'langan!`;
    }

    if (cleanText.includes('o\'yin') || cleanText.includes('game') || cleanText.includes('tic') || cleanText.includes('krestik')) {
      loadPresetTemplate('game');
      return `🎮 Chiroyli neon effektdagi **Tic-Tac-Toe (X va O) O'yini** tayyor bo'ldi. O'ng tarafdagi brauzer orqali uning qanchalik silliq ishlashini darhol o'ynab sinab ko'ring!`;
    }

    return `💡 Tushunarli! Loyihangizdagi virtual fayllarni o'zgartirish uchun men sizdan haqiqiy buyruqlar kutyapman.
    
Agar haqiqiy Gemini AI agentini ulasangiz, u siz yozgan har qanday matnga mos mukammal kodlarni yozadi. Buning uchun pastdagi **Gemini API Kaliti** tugmasini bosing!`;
  }

  // --- PRESET TEMPLATES ---
  function loadPresetTemplate(templateName) {
    if (templateName === 'portfolio') {
      files['index.html'].content = `<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <title>Shaxsiy Portfolio</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="portfolio-container">
    <div class="profile-card">
      <div class="avatar-glow">🧑‍💻</div>
      <h1>Fayzullo Dasturchi</h1>
      <p class="subtitle">Full-Stack AI Software Engineer</p>
      <div class="bio">
        Zamonaviy veb-texnologiyalar, sun'iy intellekt agentlari va tezkor loyihalar ustida ishlayman.
      </div>
      <div class="links">
        <a href="#" class="btn-link">Telegram</a>
        <a href="#" class="btn-link secondary">GitHub</a>
      </div>
    </div>
  </div>
</body>
</html>`;
      files['style.css'].content = `body {
  margin: 0;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: radial-gradient(circle at center, #0f172a, #020617);
  color: #fff;
  font-family: system-ui, sans-serif;
}
.portfolio-container {
  padding: 1rem;
}
.profile-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  padding: 3rem 2.5rem;
  border-radius: 2rem;
  text-align: center;
  max-width: 360px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.6);
}
.avatar-glow {
  font-size: 3rem;
  width: 90px;
  height: 90px;
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
}
h1 {
  font-size: 1.6rem;
  margin-bottom: 0.2rem;
}
.subtitle {
  color: #c084fc;
  font-size: 0.88rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 1.2rem;
}
.bio {
  color: #94a3b8;
  font-size: 0.88rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}
.links {
  display: flex;
  gap: 12px;
  justify-content: center;
}
.btn-link {
  background: linear-gradient(135deg, #8b5cf6, #c084fc);
  color: white;
  text-decoration: none;
  padding: 0.6rem 1.2rem;
  border-radius: 0.6rem;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}
.btn-link.secondary {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: none;
}`;
      files['script.js'].content = `// Shaxsiy portfolio uchun skriptlar
console.log("Portfolio loyihasi muvaffaqiyatli yuklandi!");`;
    }

    else if (templateName === 'store') {
      files['index.html'].content = `<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <title>Cyber Cafe & Shop</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="shop-container">
    <header>
      <h1>Cyber Cafe ☕</h1>
      <div class="cart-status">Savatcha: <span id="cart-count">0</span> ta</div>
    </header>
    
    <div class="products-grid">
      <div class="product-card" data-id="1" data-name="Espresso" data-price="12000">
        <h3>Espresso ☕</h3>
        <p class="price">12 000 so'm</p>
        <button class="add-to-cart-btn">Qo'shish</button>
      </div>
      <div class="product-card" data-id="2" data-name="Cappuccino" data-price="18000">
        <h3>Cappuccino 🥛</h3>
        <p class="price">18 000 so'm</p>
        <button class="add-to-cart-btn">Qo'shish</button>
      </div>
      <div class="product-card" data-id="3" data-name="Muffin" data-price="15000">
        <h3>Neon Muffin 🧁</h3>
        <p class="price">15 000 so'm</p>
        <button class="add-to-cart-btn">Qo'shish</button>
      </div>
    </div>
  </div>
</body>
</html>`;
      files['style.css'].content = `body {
  margin: 0;
  background: #020617;
  color: #f8fafc;
  font-family: system-ui, sans-serif;
  padding: 2rem;
}
.shop-container {
  max-width: 600px;
  margin: 0 auto;
}
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  padding-bottom: 1rem;
  margin-bottom: 2rem;
}
h1 {
  font-size: 1.5rem;
}
.cart-status {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: bold;
  font-size: 0.85rem;
}
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1.2rem;
}
.product-card {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  padding: 1.5rem;
  border-radius: 1rem;
  text-align: center;
  transition: all 0.2s;
}
.product-card:hover {
  transform: translateY(-2px);
  border-color: #8b5cf6;
}
.product-card h3 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}
.price {
  color: #94a3b8;
  font-size: 0.88rem;
  margin-bottom: 1rem;
}
button {
  background: #8b5cf6;
  color: white;
  border: none;
  width: 100%;
  padding: 0.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
}
button:active {
  background: #7c3aed;
}`;
      files['script.js'].content = `// Savatcha logikasi
let count = 0;
const cartCount = document.getElementById('cart-count');
const addButtons = document.querySelectorAll('.add-to-cart-btn');

addButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    count++;
    cartCount.innerText = count;
    
    // Simple visual feedback
    const parent = btn.parentElement;
    parent.style.boxShadow = '0 0 15px rgba(139, 92, 246, 0.4)';
    setTimeout(() => {
      parent.style.boxShadow = 'none';
    }, 500);
  });
});`;
    }

    else if (templateName === 'todo') {
      files['index.html'].content = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Todo App</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="todo-box">
    <h2>Vazifalar Ro'yxati 📝</h2>
    <div class="input-row">
      <input type="text" id="todo-input" placeholder="Yangi vazifa yozing...">
      <button id="add-btn">+</button>
    </div>
    <ul id="todo-list">
      <li>Antigravity AI klonini test qilish <button class="del-btn">×</button></li>
      <li>Gemini API kalitini ulash <button class="del-btn">×</button></li>
    </ul>
  </div>
</body>
</html>`;
      files['style.css'].content = `body {
  margin: 0;
  background: #090514;
  color: #fff;
  font-family: system-ui, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
.todo-box {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  padding: 2rem;
  border-radius: 1.5rem;
  width: 320px;
  box-shadow: 0 15px 30px rgba(0,0,0,0.5);
}
h2 {
  font-size: 1.25rem;
  text-align: center;
  margin-bottom: 1.2rem;
}
.input-row {
  display: flex;
  gap: 8px;
  margin-bottom: 1.2rem;
}
input {
  flex: 1;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 0.6rem;
  border-radius: 0.5rem;
  color: white;
  outline: none;
}
input:focus {
  border-color: #8b5cf6;
}
#add-btn {
  background: #8b5cf6;
  color: white;
  border: none;
  width: 38px;
  height: 38px;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
}
ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
li {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.05);
  padding: 0.6rem 0.8rem;
  border-radius: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
}
.del-btn {
  background: transparent;
  color: #ef4444;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  line-height: 1;
}
.del-btn:hover {
  color: #f87171;
}`;
      files['script.js'].content = `const input = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const list = document.getElementById('todo-list');

function createTodo(text) {
  if (!text.trim()) return;
  const li = document.createElement('li');
  li.innerHTML = \`\${text} <button class="del-btn">×</button>\`;
  list.appendChild(li);

  li.querySelector('.del-btn').addEventListener('click', () => {
    li.remove();
  });
}

addBtn.addEventListener('click', () => {
  createTodo(input.value);
  input.value = '';
});

input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    createTodo(input.value);
    input.value = '';
  }
});

// Initial delete triggers
document.querySelectorAll('.del-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.target.parentElement.remove();
  });
});`;
    }

    else if (templateName === 'game') {
      files['index.html'].content = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Tic-Tac-Toe Game</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="game-box">
    <h2>X va O O'yini 🎮</h2>
    <div class="status" id="status">X navbati</div>
    <div class="board" id="board">
      <div class="cell" data-index="0"></div>
      <div class="cell" data-index="1"></div>
      <div class="cell" data-index="2"></div>
      <div class="cell" data-index="3"></div>
      <div class="cell" data-index="4"></div>
      <div class="cell" data-index="5"></div>
      <div class="cell" data-index="6"></div>
      <div class="cell" data-index="7"></div>
      <div class="cell" data-index="8"></div>
    </div>
    <button id="reset-btn">Qayta boshlash</button>
  </div>
</body>
</html>`;
      files['style.css'].content = `body {
  margin: 0;
  background: #020617;
  color: #fff;
  font-family: system-ui, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
.game-box {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  padding: 1.5rem;
  border-radius: 1.5rem;
  text-align: center;
}
h2 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}
.status {
  color: #a78bfa;
  font-size: 0.85rem;
  margin-bottom: 1rem;
}
.board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  width: 210px;
  margin: 0 auto 1.2rem;
}
.cell {
  width: 66px;
  height: 66px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  font-size: 1.5rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.cell:hover {
  background: rgba(255,255,255,0.08);
}
#reset-btn {
  background: linear-gradient(135deg, #8b5cf6, #c084fc);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: bold;
}`;
      files['script.js'].content = `const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const resetBtn = document.getElementById('reset-btn');
let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let isGameActive = true;

const winningConditions = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

function handleResult() {
  let won = false;
  for (let c of winningConditions) {
    if (board[c[0]] && board[c[0]] === board[c[1]] && board[c[1]] === board[c[2]]) {
      won = true;
      break;
    }
  }
  if (won) {
    statusText.innerText = currentPlayer + " g'olib! 🎉";
    isGameActive = false;
    return;
  }
  if (!board.includes("")) {
    statusText.innerText = "Durang! 🤝";
    isGameActive = false;
    return;
  }
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusText.innerText = currentPlayer + " navbati";
}

cells.forEach(cell => {
  cell.addEventListener('click', () => {
    const idx = parseInt(cell.getAttribute('data-index'));
    if (board[idx] || !isGameActive) return;
    board[idx] = currentPlayer;
    cell.innerText = currentPlayer;
    cell.style.color = currentPlayer === 'X' ? '#8b5cf6' : '#ec4899';
    handleResult();
  });
});

resetBtn.addEventListener('click', () => {
  board.fill("");
  currentPlayer = "X";
  isGameActive = true;
  statusText.innerText = "X navbati";
  cells.forEach(c => c.innerText = "");
});`;
    }

    // Refresh Editor and Preview
    loadActiveFile();
    compilePreview();
  }
});
