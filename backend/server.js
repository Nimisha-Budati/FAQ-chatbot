const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

const faq = require("./faq.json");

function getScore(userMsg, keywords) {
    let score = 0;

    keywords.forEach(k => {
        if (userMsg.includes(k)) {
            score += 1;
        }
    });

    return score / keywords.length;
}

app.post("/chat", (req, res) => {
    try {

        const userMessage = req.body.message?.toLowerCase().trim();

        if (!userMessage) {
            return res.json({
                answer: "Please enter a question.",
                confidence: 0
            });
        }

        let bestMatch = null;
        let bestScore = 0;

        faq.forEach(item => {

            const score = getScore(userMessage, item.keywords);

            if (score > bestScore) {
                bestScore = score;
                bestMatch = item;
            }

        });

        const CONFIDENCE_THRESHOLD = 0.5;

        if (bestMatch && bestScore >= CONFIDENCE_THRESHOLD) {
            return res.json({
                answer: `[${bestMatch.category}] ${bestMatch.answer}`,
                confidence: bestScore
            });
        }

        let arr = [];

        try {
            if (fs.existsSync("unanswered.json")) {
                const data = fs.readFileSync("unanswered.json", "utf-8");
                arr = data ? JSON.parse(data) : [];
            }
        } catch (e) {
            arr = [];
        }

        arr.push({
            question: userMessage,
            time: new Date().toISOString(),
            confidence: bestScore
        });

        fs.writeFileSync("unanswered.json", JSON.stringify(arr, null, 2));

        return res.json({
            answer: "⚠️ I’m not confident about this answer. Try rephrasing your question.",
            confidence: bestScore
        });

    } catch (error) {

        console.error(error);

        return res.json({
            answer: "Something went wrong. Please try again.",
            confidence: 0
        });
    }
});

app.get("/", (req, res) => {
    res.send("FAQ Chatbot Backend Running 🚀");
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});