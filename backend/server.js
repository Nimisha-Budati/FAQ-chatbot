import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRouter from './routes/chat.js';
import adminRouter from './routes/admin.js';
import { faqService } from './services/faqService.js';
import { registerUser, loginUser } from './controllers/authController.js';
import { verifyToken } from './middleware/authMiddleware.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.post('/api/auth/register', registerUser);
app.post('/api/auth/login', loginUser);
app.use('/api/chat', verifyToken, chatRouter);
app.use('/api/admin', verifyToken, adminRouter);
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});
console.log('Initializing AI Semantic Matching System...');
faqService.initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(`🚀 Secure Multi-User Server running smoothly on port ${PORT}`);
      console.log(`🤖 Universal Sentence Encoder Model loaded successfully`);
      console.log(`=================================================`);
    });
  })
  .catch((err) => {
    console.error('CRITICAL: Failed to initialize AI model. Server aborting.', err);
    process.exit(1);
  });