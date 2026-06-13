async function sendMessage() {

    const input = document.getElementById("user-input");
    const chatBox = document.getElementById("chat-box");

    const message = input.value.trim();

    if (message === "") return;

    // User message
    chatBox.innerHTML += `
        <div class="user-message">
            ${message}
        </div>
    `;

    input.value = "";

    try {

        const response = await fetch(
            "http://localhost:5000/chat",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: message
                })
            }
        );

        const data = await response.json();

        chatBox.innerHTML += `
            <div class="bot-message">
                ${data.answer}
            </div>
        `;

        chatBox.scrollTop = chatBox.scrollHeight;

    } catch (error) {

        chatBox.innerHTML += `
            <div class="bot-message">
                Cannot connect to server.
            </div>
        `;
    }
}