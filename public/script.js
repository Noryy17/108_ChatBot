// ============================================
//  CHAT AI — Retro Game UI Script
// ============================================

const chatArea = document.getElementById("chatArea");
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const clockEl = document.getElementById("clock");
const sidebar = document.getElementById("sidebar");
const hamburgerBtn = document.getElementById("hamburgerBtn");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const newChatBtn = document.getElementById("newChatBtn");
const chatHistoryEl = document.getElementById("chatHistory");

let conversationHistory = [
    {
        role: "system",
        content:
            "Kamu adalah asisten AI yang cerdas, sopan, dan membantu. Jawab dalam bahasa yang digunakan oleh pengguna. Berikan jawaban yang jelas, terstruktur, dan informatif.",
    },
];

let chatSessions = [];
let currentSessionId = null;

// ---- Clock ----
function updateClock() {
    clockEl.textContent = new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}
updateClock();
setInterval(updateClock, 1000);

// ---- Sidebar Toggle ----
hamburgerBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    sidebarOverlay.classList.toggle("open");
});

sidebarOverlay.addEventListener("click", () => {
    sidebar.classList.remove("open");
    sidebarOverlay.classList.remove("open");
});

// ---- New Chat ----
newChatBtn.addEventListener("click", () => {
    startNewChat();
    sidebar.classList.remove("open");
    sidebarOverlay.classList.remove("open");
});

function startNewChat() {
    if (conversationHistory.length > 1) saveCurrentSession();

    conversationHistory = [
        {
            role: "system",
            content:
                "Kamu adalah asisten AI yang cerdas, sopan, dan membantu. Jawab dalam bahasa yang digunakan oleh pengguna. Berikan jawaban yang jelas, terstruktur, dan informatif.",
        },
    ];

    currentSessionId = Date.now().toString();
    chatArea.innerHTML = `
        <div class="welcome" id="welcomeScreen">
            <div class="welcome-art">
┌──────────────────────────┐
│                          │
│       C H A T  A I       │
│                          │
│    [ RETRO TERMINAL ]    │
│                          │
└──────────────────────────┘
            </div>
            <div class="welcome-box pixel-box">
                <span id="welcomeText"></span><span class="caret">█</span>
            </div>
            <p class="hint-blink">▼ PRESS ENTER TO START ▼</p>
        </div>
    `;
    typeWelcome();
    renderHistory();
}

function saveCurrentSession() {
    if (conversationHistory.length <= 1) return;
    const userMsgs = conversationHistory.filter((m) => m.role === "user");
    if (userMsgs.length === 0) return;

    const title = userMsgs[0].content.substring(0, 28) + (userMsgs[0].content.length > 28 ? "..." : "");
    const existing = chatSessions.findIndex((s) => s.id === currentSessionId);

    const session = {
        id: currentSessionId || Date.now().toString(),
        title,
        messages: [...conversationHistory],
        timestamp: Date.now(),
    };

    if (existing >= 0) chatSessions[existing] = session;
    else chatSessions.unshift(session);

    if (chatSessions.length > 20) chatSessions.pop();
    renderHistory();
}

function loadSession(id) {
    const session = chatSessions.find((s) => s.id === id);
    if (!session) return;

    if (conversationHistory.length > 1 && currentSessionId !== id) saveCurrentSession();

    currentSessionId = id;
    conversationHistory = [...session.messages];

    chatArea.innerHTML = "";
    for (const msg of conversationHistory) {
        if (msg.role === "user") {
            const div = document.createElement("div");
            div.className = "message user";
            div.style.opacity = "1";
            div.innerHTML = `<div class="msg-box"><div class="msg-label">YOU</div><div class="msg-text">${escapeHtml(msg.content)}</div></div>`;
            chatArea.appendChild(div);
        } else if (msg.role === "assistant") {
            const div = document.createElement("div");
            div.className = "message assistant";
            div.style.opacity = "1";
            div.innerHTML = `<div class="msg-box"><div class="msg-label">AI</div><div class="msg-text">${renderMarkdown(msg.content)}</div></div>`;
            chatArea.appendChild(div);
        }
    }

    scrollToBottom();
    renderHistory();
    sidebar.classList.remove("open");
    sidebarOverlay.classList.remove("open");
}

function renderHistory() {
    if (chatSessions.length === 0) {
        chatHistoryEl.innerHTML = '<li class="history-empty">No data.</li>';
        return;
    }
    chatHistoryEl.innerHTML = chatSessions
        .map(
            (s) => `<li class="${s.id === currentSessionId ? "active" : ""}" onclick="loadSession('${s.id}')">${escapeHtml(s.title)}</li>`
        )
        .join("");
}

// ---- Welcome Typewriter ----
const welcomeLines = [
    "SELAMAT DATANG.",
    "",
    "Aku adalah AI assistant",
    "di terminal retro ini.",
    "",
    "Ketik pesanmu, lalu",
    "tekan ENTER.",
    "",
    ">>> READY_",
];

async function typeWelcome() {
    const el = document.getElementById("welcomeText");
    if (!el) return;
    for (const line of welcomeLines) {
        for (const char of line) {
            el.textContent += char;
            await sleep(22 + Math.random() * 22);
        }
        el.textContent += "\n";
        await sleep(100);
    }
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

typeWelcome();
currentSessionId = Date.now().toString();

// ---- Textarea ----
userInput.addEventListener("input", () => {
    userInput.style.height = "auto";
    userInput.style.height = Math.min(userInput.scrollHeight, 100) + "px";
});

userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        chatForm.dispatchEvent(new Event("submit"));
    }
});

// ---- Helpers ----
function getTimestamp() {
    return new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function escapeHtml(t) {
    const d = document.createElement("div");
    d.textContent = t;
    return d.innerHTML;
}

function scrollToBottom() {
    requestAnimationFrame(() => { chatArea.scrollTop = chatArea.scrollHeight; });
}

function removeWelcome() {
    const ws = document.getElementById("welcomeScreen");
    if (ws) {
        ws.style.transition = "opacity 0.15s";
        ws.style.opacity = "0";
        setTimeout(() => ws.remove(), 150);
    }
}

function addUserMessage(text) {
    removeWelcome();
    const div = document.createElement("div");
    div.className = "message user";
    div.innerHTML = `<div class="msg-box"><div class="msg-label">YOU</div><div class="msg-text">${escapeHtml(text)}</div><div class="msg-time">${getTimestamp()}</div></div>`;
    chatArea.appendChild(div);
    scrollToBottom();
}

function addTypingIndicator() {
    const div = document.createElement("div");
    div.className = "message assistant typing-indicator";
    div.id = "typingIndicator";
    div.innerHTML = `<div class="msg-box"><span class="msg-label">AI</span><div class="typing-dots"><span></span><span></span><span></span></div></div>`;
    chatArea.appendChild(div);
    scrollToBottom();
}

function removeTypingIndicator() {
    const el = document.getElementById("typingIndicator");
    if (el) el.remove();
}

function createAssistantMessage() {
    removeTypingIndicator();
    const div = document.createElement("div");
    div.className = "message assistant";
    div.innerHTML = `<div class="msg-box"><div class="msg-label">AI</div><div class="msg-text" id="streamingContent"></div><div class="msg-time">${getTimestamp()}</div></div>`;
    chatArea.appendChild(div);
    scrollToBottom();
    return document.getElementById("streamingContent");
}

function showError(msg) {
    removeTypingIndicator();
    const div = document.createElement("div");
    div.className = "error-block";
    div.textContent = "! ERROR: " + msg;
    chatArea.appendChild(div);
    scrollToBottom();
}

function renderMarkdown(text) {
    let html = text;
    html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, l, code) => `<pre><code>${escapeHtml(code.trim())}</code></pre>`);
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>");
    html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
    html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
    html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");
    html = html.replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>");
    html = html.replace(/^[*-] (.+)$/gm, "<li>$1</li>");
    html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, "<ul>$1</ul>");
    html = html.replace(/\n{2,}/g, "</p><p>");
    html = `<p>${html}</p>`;
    html = html.replace(/<p>\s*<\/p>/g, "");
    html = html.replace(/<p>\s*(<h[1-3]>)/g, "$1");
    html = html.replace(/(<\/h[1-3]>)\s*<\/p>/g, "$1");
    html = html.replace(/<p>\s*(<pre>)/g, "$1");
    html = html.replace(/(<\/pre>)\s*<\/p>/g, "$1");
    html = html.replace(/<p>\s*(<ul>)/g, "$1");
    html = html.replace(/(<\/ul>)\s*<\/p>/g, "$1");
    html = html.replace(/<p>\s*(<blockquote>)/g, "$1");
    html = html.replace(/(<\/blockquote>)\s*<\/p>/g, "$1");
    html = html.replace(/\n/g, "<br>");
    return html;
}

function setLoading(on) {
    sendBtn.disabled = on;
    userInput.disabled = on;
    if (!on) userInput.focus();
}

// ---- Submit ----
chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = userInput.value.trim();
    if (!text) return;

    addUserMessage(text);
    conversationHistory.push({ role: "user", content: text });
    userInput.value = "";
    userInput.style.height = "auto";

    setLoading(true);
    addTypingIndicator();

    try {
        const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: conversationHistory }),
        });

        if (!res.ok) throw new Error(`Status ${res.status}`);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let contentEl = null;
        let fullResponse = "";
        let buffer = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop();

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || !trimmed.startsWith("data:")) continue;
                const data = trimmed.slice(5).trim();
                if (data === "[DONE]") continue;

                try {
                    const content = JSON.parse(data);
                    if (content) {
                        if (!contentEl) contentEl = createAssistantMessage();
                        fullResponse += content;
                        contentEl.innerHTML = renderMarkdown(fullResponse);
                        scrollToBottom();
                    }
                } catch (_) {}
            }
        }

        if (!contentEl) removeTypingIndicator();
        if (fullResponse) conversationHistory.push({ role: "assistant", content: fullResponse });

        const s = document.getElementById("streamingContent");
        if (s) s.removeAttribute("id");

        saveCurrentSession();

    } catch (err) {
        console.error(err);
        showError("KONEKSI GAGAL. COBA LAGI.");
    } finally {
        setLoading(false);
    }
});

userInput.focus();
