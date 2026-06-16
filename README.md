# AI-Powered FAQ Semantic Chatbot

A production-ready, locally hosted AI FAQ chatbot application built using **React (Vite)** on the frontend and **Node.js (Express)** on the backend.

This system implements Natural Language Processing (NLP) completely natively using **TensorFlow.js (`@tensorflow/tfjs`)** and the **Universal Sentence Encoder (USE)** model to calculate mathematical semantic similarities between user queries and your knowledge base.

---

# ✨ Features

## Frontend (React + Vite)

* 💬 **Modern ChatGPT-Style UI**
  - Responsive, clean glassmorphic design supporting smooth transitions.

* 🌓 **Dark / Light Theme Toggle**
  - Persisted instantly to memory.

* 🗂️ **Robust Conversation Sidebar**
  - New Chat
  - Chat History
  - Rename Chat
  - Delete Chat
  - Pin/Unpin Chats

* ⚡ **Suggested FAQ Buttons**
  - Quick-start interaction cards displayed inside empty chat states.

* 📝 **Auto-Growing Textarea**
  - Dynamic input area supporting multi-line questions.

* 🔄 **Typing Indicator**
  - Displays animation while AI performs semantic matching.

* 💾 **LocalStorage Persistence**
  - Complete chat session retention after browser reload.

---

# Backend (Node.js + Express)

* 🤖 **Localized AI Engine**
  - Performs text embedding conversions directly inside the server environment.
  - No external cloud API keys or usage fees required.

* 🎯 **Semantic Similarity Matching**
  - Uses TensorFlow.js Universal Sentence Encoder embeddings.
  - Calculates cosine similarity between user questions and FAQ knowledge.

* 📊 **Confidence Scoring**
  - Displays accuracy percentage for every AI response.

* 🎛️ **Intelligent Threshold Logic**

  - **Score ≥ 70%**
    - Returns matched FAQ answer.
    - Displays category information.

  - **Score < 70%**
    - Returns fallback response.
    - Stores unanswered questions for future improvement.

* 📈 **Telemetry Tracker**
  - Collects user feedback through Helpful/Not Helpful buttons.
  - Stores feedback inside `feedback.json`.

---

# 📁 Project Structure

```text
FAQ-chatbot/

├── backend/

│   ├── data/
│   │   ├── faq.json
│   │   ├── feedback.json
│   │   └── unanswered.json

│   ├── routes/
│   │   └── chat.js

│   ├── services/
│   │   └── faqService.js

│   ├── utils/
│   │   └── fileHelper.js

│   ├── package.json
│   └── server.js


├── frontend/

│   ├── src/

│   │   ├── components/
│   │   │   └── UI Components

│   │   ├── hooks/
│   │   │   └── useLocalStorage

│   │   ├── services/
│   │   │   └── API Services

│   │   ├── App.css
│   │   ├── App.jsx
│   │   └── main.jsx

│   ├── index.html
│   ├── package.json
│   └── vite.config.js


└── .gitignore
```

---

# 🛠️ Installation & Getting Started

## Prerequisites

Install Node.js.

Check installation:

```bash
node -v
```

---

# Backend Setup

Open terminal:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Start backend server:

```bash
node server.js
```

---

## First Launch Note

During the first execution:

- TensorFlow.js downloads the Universal Sentence Encoder model.
- Model initialization may take around **30-60 seconds**.
- Wait until the server confirms successful startup.

Backend runs on:

```
http://localhost:5000
```

---

# Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install packages:

```bash
npm install
```

Start React application:

```bash
npm run dev
```

Frontend runs on:

```
http://localhost:3000
```

Open the URL in your browser.

---

# 🧠 AI Processing Workflow

```
User Question
       |
       ↓
React Chat Interface
       |
       ↓
Express API
       |
       ↓
TensorFlow.js Universal Sentence Encoder
       |
       ↓
Text Embedding Generation
       |
       ↓
Cosine Similarity Calculation
       |
       ↓
Best FAQ Match Selection
       |
       ↓
Answer + Confidence Score
       |
       ↓
User Feedback Storage
```

---

# 📸 Interface Preview

```
Screenshot Placeholder 1:
Main Welcome Screen with FAQ Suggestions


Screenshot Placeholder 2:
Chat Conversation showing AI Responses,
Confidence Scores and Feedback Buttons


Screenshot Placeholder 3:
Sidebar showing Chat History,
Pinned Chats and Rename/Delete Options
```

---

# 🎓 Internship Project Evaluation Notes

## Zero Configuration Requirement

This project works immediately after installation.

No:

- SQL database
- External database server
- API keys
- Environment variables

are required.

---

## Auto Generated Records

The backend automatically creates:

```
feedback.json
unanswered.json
```

when the application receives the first related entries.

---

## Performance Optimization

The AI engine performs TensorFlow tensor cleanup using:

```
tensor.dispose()
```

to prevent memory leaks during long-running server sessions.

---

# 🚀 Future Improvements

- Voice input support
- Multi-language FAQ support
- Admin dashboard
- Automatic FAQ learning from unanswered questions
- Advanced analytics dashboard

---

# 👩‍💻 Tech Stack

Frontend:
- React
- Vite
- CSS
- LocalStorage

Backend:
- Node.js
- Express.js

AI/NLP:
- TensorFlow.js
- Universal Sentence Encoder

Storage:
- JSON-based storage