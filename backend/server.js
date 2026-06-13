const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const faqs = require("./faq.json");

// Chat API
app.post("/chat", (req, res) => {
  const message = req.body.message.toLowerCase().trim();

  // Greetings
  const greetings = [
    "hi",
    "hii",
    "hello",
    "hloo",
    "hey",
    "good morning",
    "good afternoon",
    "good evening"
  ];

  if (greetings.includes(message)) {
    return res.json({
      answer: "Hello! 👋 How can I help you today?"
    });
  }

  // Thanks
  const thanks = [
    "thanks",
    "thank you",
    "thankyou",
    "thx"
  ];

  if (thanks.includes(message)) {
    return res.json({
      answer: "You're welcome! 😊"
    });
  }

  // FAQ Matching
  const faq = faqs.find(item =>
    message.includes(item.question)
  );

  if (faq) {
    return res.json({
      answer: faq.answer
    });
  }

  // Save unanswered questions
  const unansweredQuestion = {
    question: message,
    time: new Date().toLocaleString()
  };

  let unanswered = [];

  try {
    if (fs.existsSync("unanswered.json")) {
      unanswered = JSON.parse(
        fs.readFileSync("unanswered.json")
      );
    }
  } catch (err) {
    console.log(err);
  }

  unanswered.push(unansweredQuestion);

  fs.writeFileSync(
    "unanswered.json",
    JSON.stringify(unanswered, null, 2)
  );

  return res.json({
    answer:
      "Sorry, I don't know the answer yet. Your question has been saved for future improvement."
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});