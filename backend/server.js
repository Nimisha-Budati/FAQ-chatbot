const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const faq = require("./faq.json");

app.post("/chat", (req, res) => {
    try {
        const userMessage = req.body.message?.toLowerCase().trim();

        if (!userMessage) {
            return res.json({
                answer: "Please enter a question."
            });
        }

        const found = faq.find(item =>
            item.question.toLowerCase().includes(userMessage) ||
            userMessage.includes(item.question.toLowerCase())
        );

        if (found) {
            return res.json({
                answer: found.answer
            });
        }

        return res.json({
            answer: "Sorry, I don't know the answer to that question yet."
        });

    } catch (error) {
        console.error(error);

        return res.json({
            answer: "Something went wrong. Please try again."
        });
    }
});

app.get("/", (req, res) => {
    res.send("FAQ Chatbot Backend Running");
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});