const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const faq = require("./faq.json");

app.post("/chat", (req, res) => {
    try {
        const userMessage = req.body.message
            ?.toLowerCase()
            .trim();

        if (!userMessage) {
            return res.json({
                answer: "Please enter a question."
            });
        }

        const found = faq.find(item =>
            item.keywords.some(keyword =>
                userMessage.includes(keyword)
            )
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
            answer: "Something went wrong."
        });
    }
});

app.get("/", (req, res) => {
    res.send("FAQ Chatbot Backend Running");
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});
