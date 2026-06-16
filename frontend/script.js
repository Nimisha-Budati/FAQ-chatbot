let chats = JSON.parse(localStorage.getItem("chats")) || [];
let currentChatId = null;

const API_URL = "http://localhost:5000/chat";

function saveChats() {
    localStorage.setItem("chats", JSON.stringify(chats));
}

/* CLOSE ALL MENUS */
function closeMenus() {
    document.querySelectorAll(".menu").forEach(m => m.classList.remove("show"));
}

document.addEventListener("click", closeMenus);

function newChat() {
    const id = Date.now().toString();

    const chat = {
        id,
        title: "New Chat",
        messages: [],
        pinned: false
    };

    chats.push(chat);
    currentChatId = id;

    saveChats();
    renderChatList();
    renderChat();
}

function loadChat(id) {
    currentChatId = id;
    renderChat();
}

/* ================= SIDEBAR ================= */
function renderChatList() {
    const list = document.getElementById("chat-list");
    list.innerHTML = "";

    const sortedChats = [...chats].sort((a, b) => b.pinned - a.pinned);

    sortedChats.forEach(c => {

        const item = document.createElement("div");
        item.className = "chat-item";

        if (c.id === currentChatId) {
            item.classList.add("active-chat");
        }

        const title = document.createElement("span");
        title.className = "chat-title";
        title.innerText = (c.pinned ? "⭐ " : "") + c.title;
        title.onclick = () => loadChat(c.id);

        const wrap = document.createElement("div");
        wrap.className = "menu-wrap";

        const btn = document.createElement("span");
        btn.className = "menu-btn";
        btn.innerText = "⋯";

        const menu = document.createElement("div");
        menu.className = "menu";

        btn.onclick = (e) => {
            e.stopPropagation();
            document.querySelectorAll(".menu").forEach(m => {
            if (m !== menu) m.classList.remove("show");
        });
        const rect = btn.getBoundingClientRect();
        menu.style.top = rect.bottom + "px";
        menu.style.left = (rect.right - 140) + "px";
        menu.classList.toggle("show");
        };

        const rename = document.createElement("div");
        rename.innerText = "Rename";
        rename.onclick = (e) => {
            e.stopPropagation();
            const name = prompt("Rename chat:", c.title);
            if (name) {
                c.title = name;
                saveChats();
                renderChatList();
            }
        };

        const pin = document.createElement("div");
        pin.innerText = c.pinned ? "Unpin" : "Pin";
        pin.onclick = (e) => {
            e.stopPropagation();
            c.pinned = !c.pinned;
            saveChats();
            renderChatList();
        };

        const share = document.createElement("div");
        share.innerText = "Share";
        share.onclick = (e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(`${location.href}?chat=${c.id}`);
        };

        const del = document.createElement("div");
        del.innerText = "Delete";
        del.onclick = (e) => {
            e.stopPropagation();

            chats = chats.filter(x => x.id !== c.id);

            if (currentChatId === c.id) {
                currentChatId = chats.length ? chats[0].id : null;
            }

            saveChats();
            renderChatList();
            renderChat();
        };

        menu.append(rename, pin, share, del);
        wrap.append(btn, menu);

        item.append(title, wrap);
        list.appendChild(item);
    });
}

/* ================= CHAT ================= */
function renderChat() {
    const chatBox = document.getElementById("chat-box");
    chatBox.innerHTML = "";

    const chat = chats.find(c => c.id === currentChatId);
    if (!chat) return;

    chat.messages.forEach(m => {
        const msg = document.createElement("div");
        msg.className = `message ${m.sender.replace(" typing", "")}`;
        msg.innerText = m.text;
        chatBox.appendChild(msg);
    });
}

/* ================= SEND ================= */
async function sendMessage() {
    const input = document.getElementById("user-input");
    const message = input.value.trim();

    if (!message) return;

    if (!currentChatId) newChat();

    const chat = chats.find(c => c.id === currentChatId);

    chat.messages.push({ sender: "user", text: message });
    input.value = "";

    const typing = { sender: "bot typing", text: "● ● ●" };
    chat.messages.push(typing);

    saveChats();
    renderChat();

    const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
    });

    const data = await res.json();

    chat.messages = chat.messages.filter(m => m !== typing);

    const botMsg = { sender: "bot", text: "" };
    chat.messages.push(botMsg);

    let text = data.answer;
    let i = 0;

    function stream() {
        if (i < text.length) {
            botMsg.text += text[i++];
            renderChat();
            setTimeout(stream, 10);
        } else {
            saveChats();
        }
    }

    stream();

    if (chat.title === "New Chat") {
        chat.title =
            message.length > 20
                ? message.slice(0, 20) + "..."
                : message;
    }

    saveChats();
    renderChatList();
}

/* ================= UI HELPERS ================= */
function askSuggestion(text) {
    document.getElementById("user-input").value = text;
    sendMessage();
}

function clearChat() {
    chats = [];
    currentChatId = null;
    localStorage.removeItem("chats");
    newChat();
}

/* ================= INIT ================= */
window.onload = () => {

    if (chats.length === 0) newChat();
    else {
        currentChatId = chats[0].id;
        renderChatList();
        renderChat();
    }

    const themeBtn = document.getElementById("theme-toggle");

    if (localStorage.getItem("theme") === "light") {
        document.body.classList.add("light-mode");
        themeBtn.textContent = "☀️ Light Mode";
    }

    themeBtn.addEventListener("click", () => {
        document.body.classList.toggle("light-mode");

        localStorage.setItem(
            "theme",
            document.body.classList.contains("light-mode")
                ? "light"
                : "dark"
        );

        themeBtn.textContent =
            document.body.classList.contains("light-mode")
                ? "☀️ Light Mode"
                : "🌙 Dark Mode";
    });

    const inputBox = document.getElementById("user-input");

    inputBox.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });

    inputBox.addEventListener("input", function () {
        this.style.height = "auto";
        this.style.height = this.scrollHeight + "px";
    });
};