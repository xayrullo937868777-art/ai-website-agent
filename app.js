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
    
    // 1. Theme Color detection
    let themeColor = '#8b5cf6'; // default purple
    let secondColor = '#c084fc';
    let colorName = 'binafsha';
    if (cleanText.includes('qizil') || cleanText.includes('red')) {
      themeColor = '#ef4444';
      secondColor = '#f43f5e';
      colorName = 'qizil';
    } else if (cleanText.includes('yashil') || cleanText.includes('green')) {
      themeColor = '#10b981';
      secondColor = '#34d399';
      colorName = 'yashil';
    } else if (cleanText.includes('ko\'k') || cleanText.includes('kok') || cleanText.includes('blue')) {
      themeColor = '#3b82f6';
      secondColor = '#60a5fa';
      colorName = 'ko\'k';
    } else if (cleanText.includes('sariq') || cleanText.includes('yellow')) {
      themeColor = '#eab308';
      secondColor = '#facc15';
      colorName = 'sariq';
    } else if (cleanText.includes('qora') || cleanText.includes('dark')) {
      themeColor = '#1e293b';
      secondColor = '#475569';
      colorName = 'qora';
    }

    // 2. Title detection
    let title = "";
    const titleMatch = text.match(/['"“]([^'"“”]+)['"”]/) || text.match(/sarlavha(?:si)?\s+([\w\s'-]+)(?:bo'lsin|bo'lib|deb)/i);
    if (titleMatch) {
      title = titleMatch[1].trim();
    } else {
      if (cleanText.includes('kafe')) title = "Milliy Kafe";
      else if (cleanText.includes('do\'kon') || cleanText.includes('shop') || cleanText.includes('magazin')) title = "Onlayn Do'kon";
      else if (cleanText.includes('portfolio') || cleanText.includes('portfol')) title = "Mening Portfoliom";
      else if (cleanText.includes('kalkulyator')) title = "Aqlli Kalkulyator";
      else if (cleanText.includes('todo') || cleanText.includes('vazifa')) title = "Vazifalar Ro'yxati";
      else if (cleanText.includes('o\'yin')) title = "X va O O'yini";
      else title = "Mening Yangi Saytim";
    }

    // 3. Components detection
    let components = [];
    if (cleanText.includes('tugma') || cleanText.includes('button')) {
      components.push('tugma');
    }
    if (cleanText.includes('forma') || cleanText.includes('kontakt') || cleanText.includes('input')) {
      components.push('forma');
    }
    if (cleanText.includes('soat') || cleanText.includes('vaqt') || cleanText.includes('clock')) {
      components.push('soat');
    }

    // 4. Build custom templates based on combinations
    let htmlContent = '';
    let cssContent = '';
    let jsContent = '';

    if (cleanText.includes('portfol') || cleanText.includes('tashrif') || cleanText.includes('shaxsiy')) {
      htmlContent = `<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="portfolio-container">
    <div class="profile-card">
      <div class="avatar-glow">🧑‍💻</div>
      <h1>${title}</h1>
      <p class="subtitle">Full-Stack Software Engineer</p>
      <div class="bio">
        Zamonaviy veb-texnologiyalar va sun'iy intellekt tizimlari ustida ishlayman.
      </div>
      <div class="links">
        <a href="#" class="btn-link">Telegram</a>
        <a href="#" class="btn-link secondary">GitHub</a>
      </div>
    </div>
  </div>
</body>
</html>`;

      cssContent = `body {
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
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid ${themeColor};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  box-shadow: 0 0 20px ${themeColor}aa;
}
h1 {
  font-size: 1.6rem;
  margin-bottom: 0.2rem;
}
.subtitle {
  color: ${themeColor};
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
  background: linear-gradient(135deg, ${themeColor}, ${secondColor});
  color: white;
  text-decoration: none;
  padding: 0.6rem 1.2rem;
  border-radius: 0.6rem;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 4px 12px ${themeColor}66;
}
.btn-link.secondary {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: none;
}`;
      jsContent = `// Shaxsiy portfolio uchun skriptlar
console.log("${title} portfoliomiz muvaffaqiyatli yuklandi!");`;

    } else if (cleanText.includes('do\'kon') || cleanText.includes('shop') || cleanText.includes('magazin') || cleanText.includes('kafe')) {
      htmlContent = `<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="shop-container">
    <header>
      <h1>${title} 🛒</h1>
      <div class="cart-status">Savatcha: <span id="cart-count">0</span> ta</div>
    </header>
    
    <div class="products-grid">
      <div class="product-card" data-id="1" data-name="Mahsulot A" data-price="25000">
        <h3>Premium Kofe ☕</h3>
        <p class="price">25 000 so'm</p>
        <button class="add-to-cart-btn">Qo'shish</button>
      </div>
      <div class="product-card" data-id="2" data-name="Mahsulot B" data-price="45000">
        <h3>Chokolate 🍫</h3>
        <p class="price">45 000 so'm</p>
        <button class="add-to-cart-btn">Qo'shish</button>
      </div>
      <div class="product-card" data-id="3" data-name="Mahsulot C" data-price="35000">
        <h3>Desert 🍰</h3>
        <p class="price">35 000 so'm</p>
        <button class="add-to-cart-btn">Qo'shish</button>
      </div>
    </div>
  </div>
</body>
</html>`;

      cssContent = `body {
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
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid ${themeColor};
  color: ${secondColor};
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
  border-color: ${themeColor};
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
  background: ${themeColor};
  color: white;
  border: none;
  width: 100%;
  padding: 0.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
}
button:active {
  background: ${secondColor};
}`;
      jsContent = `let count = 0;
const cartCount = document.getElementById('cart-count');
const addButtons = document.querySelectorAll('.add-to-cart-btn');

addButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    count++;
    cartCount.innerText = count;
    
    const parent = btn.parentElement;
    parent.style.boxShadow = '0 0 15px rgba(139, 92, 246, 0.4)';
    setTimeout(() => {
      parent.style.boxShadow = 'none';
    }, 500);
  });
});`;

    } else if (cleanText.includes('kalkulyator') || cleanText.includes('calc')) {
      htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="calculator">
    <div class="display" id="display">0</div>
    <div class="buttons">
      <button class="btn col-2 action">C</button>
      <button class="btn action">/</button>
      <button class="btn action">*</button>
      <button class="btn">7</button>
      <button class="btn">8</button>
      <button class="btn">9</button>
      <button class="btn action">-</button>
      <button class="btn">4</button>
      <button class="btn">5</button>
      <button class="btn">6</button>
      <button class="btn action">+</button>
      <button class="btn">1</button>
      <button class="btn">2</button>
      <button class="btn">3</button>
      <button class="btn action-equal">=</button>
      <button class="btn col-2">0</button>
      <button class="btn">.</button>
    </div>
  </div>
  <script src="script.js"></script>
</body>
</html>`;

      cssContent = `body {
  margin: 0;
  background: radial-gradient(circle, #0f172a, #020617);
  color: #fff;
  font-family: system-ui, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
.calculator {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  padding: 1.5rem;
  border-radius: 1.5rem;
  width: 260px;
}
.display {
  background: rgba(0, 0, 0, 0.35);
  color: white;
  font-size: 2rem;
  padding: 0.8rem 1rem;
  border-radius: 0.8rem;
  text-align: right;
  margin-bottom: 1rem;
  font-family: monospace;
}
.buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
.btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: white;
  padding: 0.7rem;
  font-size: 1.1rem;
  border-radius: 0.6rem;
  cursor: pointer;
}
.btn.action {
  color: ${themeColor};
}
.btn.action-equal {
  background: linear-gradient(135deg, ${themeColor}, ${secondColor});
  color: white;
  grid-row: span 2;
  height: 100%;
}
.col-2 {
  grid-column: span 2;
}`;

      jsContent = `const display = document.getElementById('display');
const buttons = document.querySelectorAll('.btn');
let currentInput = '';

buttons.forEach(button => {
  button.addEventListener('click', () => {
    const value = button.innerText;
    
    if (value === 'C') {
      currentInput = '';
      display.innerText = '0';
    } else if (value === '=') {
      try {
        const result = eval(currentInput);
        display.innerText = result;
        currentInput = result.toString();
      } catch (err) {
        display.innerText = 'Error';
        currentInput = '';
      }
    } else {
      currentInput += value;
      display.innerText = currentInput;
    }
  });
});`;

    } else if (cleanText.includes('todo') || cleanText.includes('vazifa')) {
      htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="todo-box">
    <h2>${title} 📝</h2>
    <div class="input-row">
      <input type="text" id="todo-input" placeholder="Yangi vazifa...">
      <button id="add-btn">+</button>
    </div>
    <ul id="todo-list"></ul>
  </div>
  <script src="script.js"></script>
</body>
</html>`;

      cssContent = `body {
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
}
#add-btn {
  background: ${themeColor};
  color: white;
  border: none;
  width: 38px;
  height: 38px;
  border-radius: 0.5rem;
  cursor: pointer;
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
}`;

      jsContent = `const input = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const list = document.getElementById('todo-list');

addBtn.addEventListener('click', () => {
  const text = input.value;
  if (!text) return;
  const li = document.createElement('li');
  li.innerHTML = \`\${text} <button class="del-btn">×</button>\`;
  list.appendChild(li);
  input.value = '';
  li.querySelector('.del-btn').addEventListener('click', () => li.remove());
});`;

    } else if (cleanText.includes('o\'yin') || cleanText.includes('game') || cleanText.includes('tic') || cleanText.includes('krestik')) {
      htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="game-box">
    <h2>${title} 🎮</h2>
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

      cssContent = `body {
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
  color: ${themeColor};
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
  background: linear-gradient(135deg, ${themeColor}, ${secondColor});
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: bold;
}`;

      jsContent = `const cells = document.querySelectorAll('.cell');
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
    cell.style.color = currentPlayer === 'X' ? '${themeColor}' : '${secondColor}';
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

    } else {
      let customHtml = '';
      let customJs = '';

      if (components.includes('soat')) {
        customHtml += `
    <div class="widget clock-widget">
      <div id="clock-display">00:00:00</div>
      <p>Hozirgi vaqt ⏰</p>
    </div>`;
        customJs += `
function startClock() {
  const clockEl = document.getElementById('clock-display');
  if (clockEl) {
    setInterval(() => {
      const now = new Date();
      clockEl.innerText = now.toTimeString().split(' ')[0];
    }, 1000);
  }
}
startClock();`;
      }

      if (components.includes('forma')) {
        customHtml += `
    <div class="widget form-widget">
      <h3>Bog'lanish Formasi 📝</h3>
      <form onsubmit="event.preventDefault(); alert('Xabaringiz yuborildi! ✅');">
        <input type="text" placeholder="Ismingiz" required>
        <input type="email" placeholder="Email" required>
        <button type="submit">Xabar yuborish</button>
      </form>
    </div>`;
      }

      if (components.includes('tugma')) {
        customHtml += `
    <div class="widget interactive-widget">
      <h3>Ranglarni o'zgartirish 🎨</h3>
      <button id="dynamic-action-btn">Meni bosing</button>
    </div>`;
        customJs += `
const actionBtn = document.getElementById('dynamic-action-btn');
if (actionBtn) {
  actionBtn.addEventListener('click', () => {
    const colors = ['#1e1b4b', '#064e3b', '#450a0a', '#180828'];
    const randColor = colors[Math.floor(Math.random() * colors.length)];
    document.body.style.background = randColor;
  });
}`;
      }

      if (customHtml === '') {
        customHtml = `
    <div class="welcome-widget">
      <h1>${title} 🚀</h1>
      <p>Siz so'ragan buyruqlar asosida yangi sayt muvaffaqiyatli tuzildi!</p>
      <button id="alert-btn">Salom berish</button>
    </div>`;
        customJs = `
const alertBtn = document.getElementById('alert-btn');
if (alertBtn) {
  alertBtn.addEventListener('click', () => {
    alert("Salom! Yangi veb-sahifangiz muvaffaqiyatli ishga tushdi! 🚀");
  });
}`;
      }

      htmlContent = `<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    ${customHtml}
  </div>
  <script src="script.js"></script>
</body>
</html>`;

      cssContent = `body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: radial-gradient(circle at center, #0b051e, #020108);
  color: #fff;
  font-family: system-ui, sans-serif;
}
.container {
  max-width: 480px;
  width: 90%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.widget, .welcome-widget {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  padding: 2.2rem;
  border-radius: 1.5rem;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}
h1 {
  font-size: 1.6rem;
  margin-bottom: 0.8rem;
}
h3 {
  font-size: 1.15rem;
  margin-bottom: 1rem;
  color: ${secondColor};
}
p {
  color: #94a3b8;
  font-size: 0.9rem;
  line-height: 1.6;
}
#clock-display {
  font-size: 2.5rem;
  font-weight: 800;
  color: ${themeColor};
  font-family: monospace;
  margin-bottom: 0.4rem;
}
form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
input {
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 0.6rem;
  border-radius: 0.5rem;
  color: white;
  outline: none;
}
input:focus {
  border-color: ${themeColor};
}
button {
  background: linear-gradient(135deg, ${themeColor}, ${secondColor});
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: transform 0.2s;
}
button:hover {
  transform: translateY(-1px);
}`;
      jsContent = customJs;
    }

    setTimeout(() => {
      files['index.html'].content = htmlContent;
      files['style.css'].content = cssContent;
      files['script.js'].content = jsContent;
      loadActiveFile();
      compilePreview();
    }, 500);

    const detailList = [];
    if (components.includes('tugma')) detailList.push('rangni o\'zgartiruvchi interaktiv tugma');
    if (components.includes('forma')) detailList.push('aloqa formasi');
    if (components.includes('soat')) detailList.push('jonli raqamli soat');

    return `🌐 **Yangi sahifa muvaffaqiyatli yaratildi!** 🚀
Siz yozgan buyruq bo'yicha loyihani o'zgartirdim:
*   **Loyihaning sarlavhasi:** "${title}"
*   **Tanlangan mavzu rang:** ${colorName}
*   **Qo'shilgan interaktivlik:** ${detailList.length > 0 ? detailList.join(', ') : 'avtomatik andoza'}.

Siz kiritgan matnga mos ravishda HTML, CSS va JS fayllarini yangiladim. Natijani Live Preview sahifasida darhol tekshirishingiz mumkin!`;
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
