const API_URL = "http://localhost:5000/chat";

function addMessage(text, sender) {
    const chatBox = document.getElementById("chat-box");

    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${sender}`;

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = text;

    const time = document.createElement("div");
    time.className = "time";

    time.textContent = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

    messageDiv.appendChild(bubble);
    messageDiv.appendChild(time);

    chatBox.appendChild(messageDiv);

    chatBox.scrollTop = chatBox.scrollHeight;

    return messageDiv;
}

async function sendMessage() {
    const input = document.getElementById("user-input");
    const message = input.value.trim();

    if (message === "") return;

    addMessage(message, "user");

    input.value = "";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message
            })
        });

        const data = await response.json();

        const botMsg = addMessage(
            data.answer || "No response received.",
            "bot"
        );

    } catch (error) {
        console.error(error);

        addMessage(
            "Unable to connect to the server.",
            "bot"
        );
    }
}

document.addEventListener("DOMContentLoaded", () => {

    const input = document.getElementById("user-input");

    input.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            sendMessage();
        }
    });

    addMessage(
        "Hello! Ask me any FAQ question.",
        "bot"
    );
});
