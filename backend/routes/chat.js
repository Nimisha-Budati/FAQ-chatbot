import express from 'express';
import { faqService } from '../services/faqService.js';
const router = express.Router();
router.post('/query', async (req, res) => {
  try {
    const { message } = req.body;
    const currentUserId = req.user?.userId;
    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message payload is mandatory.' });
    }
    const result = await faqService.matchQuestion(message, currentUserId);
    return res.json(result);
  } catch (error) {
    console.error('Error handling chat inquiry processing query:', error);
    return res.status(500).json({ error: 'Internal system AI process runtime failure.' });
  }
});
router.post('/feedback', async (req, res) => {
  try {
    const { messageId, query, answer, feedback } = req.body;
    const currentUserId = req.user?.userId;
    if (!feedback || !query) {
      return res.status(400).json({ error: 'Missing mandatory feedback operational data fields.' });
    }
    const normalizedFeedback = feedback === 'not_helpful' ? 'unhelpful' : feedback;
    const safeAnswer = answer || "Default System Response Vector Matched.";
    const output = await faqService.saveFeedback(
      messageId, 
      query, 
      safeAnswer, 
      normalizedFeedback, 
      currentUserId
    );
    return res.json(output);
  } catch (error) {
    console.error('Error recording client feedback structure:', error);
    return res.status(500).json({ error: 'Could not record user input response data layers.' });
  }
});
router.get('/suggestions', async (req, res) => {
  try {
    const suggestions = await faqService.getSuggestedQuestions();
    return res.json(suggestions);
  } catch (error) {
    console.error('Error obtaining suggestions vectors:', error);
    return res.status(500).json({ error: 'Failed to access prompt options collections.' });
  }
});
export default router;