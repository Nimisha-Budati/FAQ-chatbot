import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { readJsonFile, writeJsonFile } from '../utils/fileHelper.js';
import { faqService } from '../services/faqService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FAQ_PATH = path.join(__dirname, '../data/faq.json');
const UNANSWERED_PATH = path.join(__dirname, '../data/unanswered.json');
const FEEDBACK_PATH = path.join(__dirname, '../data/feedback.json');

const router = express.Router();

// Fetch overall telemetry summary metrics
router.get('/metrics', async (req, res) => {
  try {
    const faqs = await readJsonFile(FAQ_PATH, []);
    const feedback = await readJsonFile(FEEDBACK_PATH, []);
    const unanswered = await readJsonFile(UNANSWERED_PATH, []);

    const helpfulCount = feedback.filter(f => f.feedback === 'helpful').length;
    const unhelpfulCount = feedback.filter(f => f.feedback === 'not_helpful').length;
    
    // Calculate helpfulness ratio
    const satisfactionRate = feedback.length > 0 
      ? Math.round((helpfulCount / feedback.length) * 100) 
      : 100;

    res.json({
      totalFAQs: faqs.length,
      totalFeedback: feedback.length,
      unansweredCount: unanswered.length,
      satisfactionRate,
      helpfulCount,
      unhelpfulCount,
      unansweredLogs: unanswered.slice(-10).reverse(), // Last 10 unanswered items
      feedbackLogs: feedback.slice(-10).reverse()       // Last 10 feedback items
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to compile metrics dashboard metrics.' });
  }
});

// Admin adds a newly answered question right into the active FAQ stream
router.post('/faq/add', async (req, res) => {
  try {
    const { question, answer, category } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ error: 'Question and Answer fields required.' });
    }

    const faqs = await readJsonFile(FAQ_PATH, []);
    faqs.push({ question, answer, category: category || "General" });
    await writeJsonFile(FAQ_PATH, faqs);

    // CRITICAL: Force TensorFlow model to reload & re-cache embeddings with new data instantly
    await faqService.initialize();

    res.json({ success: true, message: 'FAQ successfully added and AI model updated!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed updating localized knowledge vector database.' });
  }
});

export default router;