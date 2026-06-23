import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { readJsonFile, writeJsonFile } from '../utils/fileHelper.js';
import { faqService } from '../services/faqService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Using resolve to prevent relative directory step breaks
const FAQ_PATH = path.resolve(__dirname, '../data/faq.json');
const UNANSWERED_PATH = path.resolve(__dirname, '../data/unanswered.json');
const FEEDBACK_PATH = path.resolve(__dirname, '../data/feedback.json');

const router = express.Router();

// Fetch user-isolated telemetry summary metrics
router.get('/metrics', async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: 'Unauthorized: Missing session identification.' });
    }

    const currentUserId = req.user.userId;

    const allFaqs = await readJsonFile(FAQ_PATH, []);
    const allFeedback = await readJsonFile(FEEDBACK_PATH, []);
    const allUnanswered = await readJsonFile(UNANSWERED_PATH, []);

    const userFaqs = allFaqs.filter(f => f.userId === currentUserId);
    const userFeedback = allFeedback.filter(f => f.userId === currentUserId);
    const userUnanswered = allUnanswered.filter(u => u.userId === currentUserId);

    const helpfulCount = userFeedback.filter(f => f.feedback === 'helpful').length;
    const unhelpfulCount = userFeedback.filter(f => f.feedback === 'not_helpful').length;
    
    const satisfactionRate = userFeedback.length > 0 
      ? Math.round((helpfulCount / userFeedback.length) * 100) 
      : 100;

    res.json({
      totalFAQs: userFaqs.length,
      totalFeedback: userFeedback.length,
      unansweredCount: userUnanswered.length,
      satisfactionRate,
      helpfulCount,
      unhelpfulCount,
      unansweredLogs: userUnanswered.slice(-10).reverse(),
      feedbackLogs: userFeedback.slice(-10).reverse()
    });
  } catch (error) {
    console.error("Admin metrics isolation error:", error);
    res.status(500).json({ error: 'Failed to compile isolated dashboard metrics.' });
  }
});

// Admin adds a newly answered question right into the active FAQ stream mapped to their ID
router.post('/faq/add', async (req, res) => {
  try {
    // FIX: Safely parse req.body fields even if they arrive under a nested key
    const question = req.body.question || req.body.newFaq?.question;
    const answer = req.body.answer || req.body.newFaq?.answer;
    const category = req.body.category || req.body.newFaq?.category || "General";

    // 🔒 Double check session state parameters to prevent crashes
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: 'Missing or invalid user login signature.' });
    }
    
    const currentUserId = req.user.userId;

    if (!question || !question.trim() || !answer || !answer.trim()) {
      return res.status(400).json({ error: 'Question and Answer fields required.' });
    }

    const faqs = await readJsonFile(FAQ_PATH, []);
    
    faqs.push({ 
      question: question.trim(), 
      answer: answer.trim(), 
      category: category,
      userId: currentUserId 
    });
    
    await writeJsonFile(FAQ_PATH, faqs);

    // Force TensorFlow model to reload & re-cache embeddings with new data instantly
    await faqService.initialize();

    res.json({ success: true, message: 'FAQ successfully added and AI model updated!' });
  } catch (error) {
    console.error("Admin FAQ creation error:", error);
    res.status(500).json({ error: 'Failed updating localized knowledge vector database.' });
  }
});

export default router;