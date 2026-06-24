# 🤖 AI-Powered Semantic FAQ Desk & Knowledge Retrieval Chatbot

An AI-powered semantic FAQ and knowledge retrieval platform built with **React, Node.js, Express, TensorFlow.js, and Universal Sentence Encoder (USE)**. The system delivers intelligent answers using vector-based semantic similarity instead of traditional keyword matching, providing a smarter and more accurate support experience.

The platform includes semantic search, voice input, multi-threaded conversations, authentication, analytics, feedback tracking, FAQ management, and knowledge base training tools.

---

# 🚀 Key Features

## 🧠 AI Semantic Search Engine

* TensorFlow.js powered NLP engine
* Universal Sentence Encoder (USE) integration
* Semantic question matching using vector embeddings
* Cosine similarity scoring for answer retrieval
* Confidence-based response filtering
* Cached FAQ embeddings for faster performance
* Natural language query matching

---

## 💬 Advanced Chat Management

* Multi-threaded conversations
* Create and switch chat sessions
* Rename chat threads
* Pin important conversations
* Delete conversations
* Automatic chat title generation
* User-specific conversation history
* Persistent chat storage using LocalStorage

---

## ⚡ Local Macro Engine

* Local command interception
* Instant browser-side execution
* Reduced backend processing overhead
* Separation of system commands from AI queries

---

## 🎙️ Voice Recognition & Smart Input

### Speech-to-Text Integration

* Browser Speech Recognition API
* Real-time voice transcription
* One-click microphone activation
* Automatic speech capture handling

### Smart Input Features

* Auto-expanding textarea
* Smooth scrolling support
* Responsive message composition
* Typing indicators

---

## 💡 Suggested Questions

* Dynamic FAQ recommendations
* Quick-start question prompts
* One-click query submission
* Improved user engagement

---

## 📊 Admin Dashboard & Analytics

### FAQ Management

* Create FAQs
* Edit FAQs
* Delete FAQs
* Search FAQs
* Category management

### Knowledge Base Training

* View unanswered questions
* Convert unresolved queries into FAQs
* Automatic dataset updates
* Knowledge base improvement workflow

### Feedback Monitoring

* Helpful / Not Helpful tracking
* User interaction analytics
* Response quality monitoring
* Feedback insights

### Real-Time Engine Intelligence

* Total query monitoring
* Average confidence tracking
* Active thread statistics
* Top intent/category analysis
* Model accuracy health monitoring
* Real-time performance insights

### Visual Analytics

* Progress-based intent distribution charts
* Circular model health indicators
* Live KPI metric cards
* Confidence score visualization
* Exportable chat reports
* Downloadable conversation history

---

## 🔐 Authentication & Security

### User Authentication

* User registration
* User login
* Secure session handling
* Local credential management

### Route Protection

* Protected routes
* Authentication middleware
* Token validation
* Session persistence

### Data Privacy

* User-specific activity tracking
* Isolated conversation histories
* Secure feedback storage
* Protected telemetry records

---

## 🎨 User Experience

### Theme System

* Dark mode
* Light mode
* Persistent theme preferences

### Settings & Customization

* Settings modal
* User preference management
* Secure logout functionality

### Responsive Design

* Mobile-friendly interface
* Responsive layouts
* Modern chat experience

---

# 🏗️ Technology Stack

## Frontend

* React 18
* Vite
* HTML5
* CSS3
* Web Speech API
* LocalStorage

## Backend

* Node.js
* Express.js
* JSON Data Storage

## AI & Machine Learning

* TensorFlow.js
* Universal Sentence Encoder (USE)
* Vector Embeddings
* Cosine Similarity Matching

---

# 📂 Project Structure

```text
FAQ-CHATBOT/
│
├── backend/
│   ├── controllers/
│   │   └── authController.js
│   ├── data/
│   │   ├── faq.json
│   │   ├── feedback.json
│   │   ├── unanswered.json
│   │   └── users.json
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── routes/
│   │   ├── admin.js
│   │   └── chat.js
│   ├── services/
│   │   └── faqService.js
│   ├── utils/
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AnalyticsDashboard.jsx
│   │   │   ├── Auth.jsx
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── FeedbackButtons.jsx
│   │   │   ├── Message.jsx
│   │   │   ├── SettingsModal.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── SuggestedQuestions.jsx
│   │   │   ├── ThemeToggle.jsx
│   │   │   └── TypingIndicator.jsx
│   │   ├── hooks/
│   │   │   └── useLocalStorage.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

# ⚙️ AI Workflow

1. User submits a question.
2. Universal Sentence Encoder generates a vector embedding.
3. Pre-computed FAQ embeddings are loaded from memory.
4. Cosine similarity is calculated between vectors.
5. The highest similarity score is selected.
6. A confidence score is computed.
7. If the confidence threshold is met, the matching FAQ answer is returned.
8. Otherwise, the query is logged as unanswered for administrator review and future training.

---

# ⚙️ Installation

## Install Backend Dependencies

```bash
npm install
```

## Install Frontend Dependencies

```bash
cd frontend
npm install
```

---

# ▶️ Running the Application

## Start Backend Server

```bash
npm run dev
```

## Start Frontend Server

```bash
cd frontend
npm run dev
```

---

# 🌐 Application Access

Open your browser and navigate to:

```text
http://localhost:5173
```

Recommended browsers:

* Google Chrome
* Microsoft Edge

---

# 👩‍💻 Internship Project

Developed as part of a **Web Development Internship Program**, demonstrating:

* Full-Stack Development
* React Application Development
* REST API Design
* Authentication Systems
* TensorFlow.js Integration
* Semantic Search Implementation
* Speech Recognition
* Dashboard Development
* Responsive UI Design
* CRUD Operations

---

## ⭐ Highlights

✅ Semantic Search FAQ System
✅ TensorFlow.js & Universal Sentence Encoder Integration
✅ Cosine Similarity Matching
✅ Voice Recognition Support
✅ Multi-Threaded Chat Management
✅ Authentication & Session Management
✅ Admin Dashboard
✅ Analytics Dashboard
✅ FAQ CRUD Operations
✅ User Feedback Tracking
✅ Suggested Questions Engine
✅ Dark/Light Theme Support
✅ Responsive User Interface
✅ Local JSON Database Storage
✅ Knowledge Base Training Workflow
✅ Exportable Chat Reports
