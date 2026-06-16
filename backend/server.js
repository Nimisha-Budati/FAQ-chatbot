import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRouter from './routes/chat.js';
import { faqService } from './services/faqService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Main Chat and FAQ API Routes
app.use('/api/chat', chatRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Initialize TensorFlow model and cache FAQ embeddings before starting the server
console.log('Initializing AI Semantic Matching System...');
faqService.initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(`🚀 Backend Server running smoothly on port ${PORT}`);
      console.log(`🤖 Universal Sentence Encoder Model loaded successfully`);
      console.log(`=================================================`);
    });
  })
  .catch((err) => {
    console.error('CRITICAL: Failed to initialize AI model. Server aborting.', err);
    process.exit(1);
  });