# 🤖 AI-Powered Semantic FAQ Desk & Knowledge Retrieval Chatbot

An enterprise-grade semantic FAQ and knowledge retrieval platform built with **React, Node.js, Express, TensorFlow.js, and Universal Sentence Encoder (USE)**. The system delivers intelligent answers using vector-based semantic similarity instead of simple keyword matching, providing a modern AI-powered support experience.

The platform features a premium glassmorphic chat interface, speech-to-text input, user authentication, feedback analytics, and an administrator dashboard for FAQ management and knowledge base training.

---

# 🚀 Key Features

## 🧠 AI Semantic Search Engine

* TensorFlow.js powered NLP engine
* Universal Sentence Encoder (USE) integration
* Semantic question matching using vector embeddings
* Cosine similarity scoring for answer retrieval
* Confidence-based response filtering
* Cached FAQ embeddings for faster performance
* Multilingual semantic understanding support

---

## 🎙️ Voice Recognition & Smart Input

### Speech-to-Text Integration

* Browser Speech Recognition API
* Real-time voice transcription
* One-click microphone activation
* Automatic speech capture handling

### Premium Microphone Interface

* Animated microphone button
* Glowing recording indicator
* Start/Stop recording controls
* Permission error handling

### Smart Input Box

* Auto-expanding textarea
* Smooth scrolling support
* Responsive message composition

---

## 💬 Intelligent Chat System

* Real-time chatbot interactions
* Semantic FAQ retrieval
* Suggested question prompts
* Confidence-based answer selection
* Fallback handling for unknown questions
* User-specific conversation isolation

---

## 💡 Suggested Questions

* Dynamic FAQ recommendations
* Quick-start question prompts
* One-click query submission
* Improved user engagement

---

## 📊 Admin Dashboard & Analytics

### Live Metrics

* Total FAQ count
* User satisfaction tracking
* Unanswered question monitoring
* Feedback statistics

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
* One-click retraining workflow

### Feedback Monitoring

* Helpful / Not Helpful tracking
* User interaction analytics
* Response quality improvement tools

---

## 🔐 Authentication & Security

### User Authentication

* User registration
* User login
* Secure session handling
* Local credential management

### Route Protection

* Protected admin routes
* Authentication middleware
* Token validation
* Session persistence

### Data Privacy

* User-specific activity tracking
* Isolated conversation histories
* Secure feedback storage
* Protected telemetry records

---

## 🎨 Modern User Interface

### Glassmorphism Design

* Frosted glass components
* Modern translucent layouts
* Responsive design architecture

### Theme System

* Dark mode
* Light mode
* Persistent theme preferences

### Session Management

* Active session tracking
* User status indicators
* Secure logout functionality

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
│   │
│   ├── data/
│   │   ├── faq.json
│   │   ├── feedback.json
│   │   ├── unanswered.json
│   │   └── users.json
│   │
│   ├── middleware/
│   │   └── authMiddleware.js
│   │
│   ├── node_modules/
│   │
│   ├── routes/
│   │   ├── admin.js
│   │   └── chat.js
│   │
│   ├── services/
│   │   └── faqService.js
│   │
│   ├── utils/
│   │
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
├── frontend/
│   ├── node_modules/
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── Auth.jsx
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── FeedbackButtons.jsx
│   │   │   ├── Message.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── SuggestedQuestions.jsx
│   │   │   ├── ThemeToggle.jsx
│   │   │   └── TypingIndicator.jsx
│   │   │
│   │   ├── hooks/
│   │   │   └── useLocalStorage.js
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── App.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone <repository-url>
cd FAQ-CHATBOT
```

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

From the project root directory:

```bash
npm run dev
```

## Start Frontend Server

From the frontend directory:

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

# 🧠 AI Workflow

1. User submits a question.
2. Universal Sentence Encoder generates a vector embedding.
3. Pre-computed FAQ embeddings are loaded from memory.
4. Cosine similarity is calculated between vectors.
5. Highest similarity score is selected.
6. If confidence ≥ 70%, the matching FAQ answer is returned.
7. Otherwise, the query is logged as unanswered for administrator review.

---

# 🔒 Repository Protection

The project uses `.gitignore` rules to:

* Exclude node_modules
* Exclude sensitive local data
* Protect user credentials
* Hide feedback telemetry logs
* Hide unanswered question logs
* Preserve the FAQ knowledge base

---

# 📈 Future Enhancements

* Database migration (MongoDB/PostgreSQL)
* OpenAI/LLM integration
* User profile management
* Advanced analytics dashboards
* Exportable reports
* Multi-language UI support
* Role-based access control

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
✅ TensorFlow.js & USE Integration
✅ Voice Recognition Support
✅ Authentication & Session Management
✅ Admin Analytics Dashboard
✅ FAQ CRUD Operations
✅ User Feedback Tracking
✅ Suggested Questions
✅ Dark/Light Theme Support
✅ Responsive Glassmorphic UI
✅ Local JSON Database Storage
✅ Knowledge Base Training Workflow
