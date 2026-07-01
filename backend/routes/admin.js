import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { readJsonFile, writeJsonFile } from '../utils/fileHelper.js';
import { faqService } from '../services/faqService.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FAQ_PATH = path.resolve(__dirname, '../data/faq.json');
const UNANSWERED_PATH = path.resolve(__dirname, '../data/unanswered.json');
const FEEDBACK_PATH = path.resolve(__dirname, '../data/feedback.json');
const router = express.Router();
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
    const userUnanswered = allUnanswered
      .map((log, originalLogIndex) => ({ ...log, originalLogIndex }))
      .filter(u => u.userId === currentUserId);
    const helpfulCount = userFeedback.filter(f => f.feedback === 'helpful' || f.feedbackType === 'helpful').length;
    const satisfactionRate = userFeedback.length > 0 
      ? Math.round((helpfulCount / userFeedback.length) * 100) 
      : 100;
    res.json({
      totalFAQs: userFaqs.length,
      totalFeedback: userFeedback.length,
      unansweredCount: userUnanswered.length,
      satisfactionRate,
      unansweredLogs: userUnanswered.slice(-10).reverse()
    });
  } catch (error) {
    console.error("Admin metrics error:", error);
    res.status(500).json({ error: 'Failed to compile dashboard metrics.' });
  }
});
router.get('/faq/all', async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const allFaqs = await readJsonFile(FAQ_PATH, []);
    const userFaqs = allFaqs
      .map((faq, originalIndex) => ({ ...faq, originalIndex }))
      .filter(f => f.userId === currentUserId);
    res.json(userFaqs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve active knowledge stream.' });
  }
});
router.get('/feedback/all', async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const allFeedback = await readJsonFile(FEEDBACK_PATH, []);
    const userFeedback = allFeedback.filter(f => f.userId === currentUserId);
    res.json(userFeedback.reverse()); // Show newest feedback first
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve user telemetry logs.' });
  }
});
router.post('/faq/add', async (req, res) => {
  try {
    const question = req.body.question || req.body.newFaq?.question;
    const answer = req.body.answer || req.body.newFaq?.answer;
    const category = req.body.category || req.body.newFaq?.category || "General";
    const currentUserId = req.user.userId;
    if (!question?.trim() || !answer?.trim()) {
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
    await faqService.initialize();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed updating knowledge database.' });
  }
});
router.put('/faq/update/:index', async (req, res) => {
  try {
    const originalIndex = parseInt(req.params.index, 10);
    const { question, answer, category } = req.body;
    const currentUserId = req.user.userId;
    const faqs = await readJsonFile(FAQ_PATH, []);
    if (!faqs[originalIndex] || faqs[originalIndex].userId !== currentUserId) {
      return res.status(403).json({ error: 'Unauthorized mutation on target resource.' });
    }
    faqs[originalIndex].question = question.trim();
    faqs[originalIndex].answer = answer.trim();
    faqs[originalIndex].category = category || "General";
    await writeJsonFile(FAQ_PATH, faqs);
    await faqService.initialize();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to alter database records.' });
  }
});
router.delete('/faq/delete/:index', async (req, res) => {
  try {
    const originalIndex = parseInt(req.params.index, 10);
    const currentUserId = req.user.userId;
    let faqs = await readJsonFile(FAQ_PATH, []);
    if (!faqs[originalIndex] || faqs[originalIndex].userId !== currentUserId) {
      return res.status(403).json({ error: 'Unauthorized to evict target element.' });
    }
    faqs.splice(originalIndex, 1);
    await writeJsonFile(FAQ_PATH, faqs);
    await faqService.initialize();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed removing element from disk array.' });
  }
});
router.delete('/unanswered/delete/:index', async (req, res) => {
  try {
    const originalLogIndex = parseInt(req.params.index, 10);
    const currentUserId = req.user.userId;
    let unansweredList = await readJsonFile(UNANSWERED_PATH, []);
    if (!unansweredList[originalLogIndex] || unansweredList[originalLogIndex].userId !== currentUserId) {
      return res.status(403).json({ error: 'Unauthorized log access.' });
    }
    unansweredList.splice(originalLogIndex, 1);
    await writeJsonFile(UNANSWERED_PATH, unansweredList);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed removing latent failure records.' });
  }
});
export default router;