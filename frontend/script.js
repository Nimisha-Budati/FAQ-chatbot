const API_URL = "http://localhost:5000/chat";

function saveChat() {
    localStorage.setItem(
        "faqChatHistory",
        document.getElementById("chat-box").innerHTML
    );
}

function loadChat() {
    const savedChat = localStorage.getItem(
        "faqChatHistory"
    );

    if (savedChat) {
        document.getElementById("chat-box").innerHTML =
            savedChat;
    }
}

function addMessage(text, sender) {

    const chatBox =
        document.getElementById("chat-box");

    const messageDiv =
        document.createElement("div");

    messageDiv.className =
        `message ${sender}`;

    const row =
        document.createElement("div");

    row.className = "message-row";

    const avatar =
        document.createElement("div");

    avatar.className = "avatar";

    avatar.textContent =
        sender === "bot"
        ? "🤖"
        : "👤";

    const bubble =
        document.createElement("div");

    bubble.className = "bubble";
    bubble.textContent = text;

    if (sender === "bot") {

        row.appendChild(avatar);
        row.appendChild(bubble);

    } else {

        row.appendChild(bubble);
        row.appendChild(avatar);

    }

    const time =
        document.createElement("div");

    time.className = "time";

    time.textContent =
        new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

    messageDiv.appendChild(row);
    messageDiv.appendChild(time);

    chatBox.appendChild(messageDiv);

    chatBox.scrollTop =
        chatBox.scrollHeight;

    saveChat();

    return messageDiv;
}


async function sendMessage() {

    const input =
        document.getElementById("user-input");

    const message =
        input.value.trim();

    if (!message) return;

    addMessage(message, "user");

    input.value = "";

    const typingMsg =
        addMessage("Typing...", "bot");

    try {

        const response =
            await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    message
                })
            });

        const data =
            await response.json();

        setTimeout(() => {

            typingMsg.querySelector(
                ".bubble"
            ).textContent =
                data.answer;

            saveChat();

        }, 1000);

    } catch (error) {

        setTimeout(() => {

            typingMsg.querySelector(
                ".bubble"
            ).textContent =
                "Unable to connect to server.";

            saveChat();

        }, 1000);

        console.error(error);
    }
}

function askSuggestion(question) {

    document.getElementById(
        "user-input"
    ).value = question;

    sendMessage();
}

function clearChat() {

    localStorage.removeItem(
        "faqChatHistory"
    );

    document.getElementById(
        "chat-box"
    ).innerHTML = "";

    addMessage(
        "👋 Welcome! Ask me any FAQ question.",
        "bot"
    );
}

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadChat();

        if (
            document.getElementById(
                "chat-box"
            ).innerHTML.trim() === ""
        ) {
            addMessage(
                "👋 Welcome! Ask me any FAQ question.",
                "bot"
            );
        }

        document
            .getElementById("user-input")
            .addEventListener(
                "keydown",
                function(event) {

                    if (
                        event.key === "Enter"
                    ) {
                        sendMessage();
                    }

                }
            );
    }
);

const themeBtn =
    document.getElementById("theme-toggle");

if (localStorage.getItem("theme") === "light") {

    document.body.classList.add("light-mode");

    themeBtn.textContent =
        "☀️ Light Mode";
}

themeBtn.addEventListener("click", () => {

    document.body.classList.toggle(
        "light-mode"
    );

    if (
        document.body.classList.contains(
            "light-mode"
        )
    ) {

        localStorage.setItem(
            "theme",
            "light"
        );

        themeBtn.textContent =
            "☀️ Light Mode";

    } else {

        localStorage.setItem(
            "theme",
            "dark"
        );

        themeBtn.textContent =
            "🌙 Dark Mode";
    }

});