import express from 'express';
import { faqService } from '../services/faqService.js';

const router = express.Router();

// Handle semantic question query processing
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

// ✅ UPDATED ROUTE: Safe data mapping alignment for dashboard synchronization
router.post('/feedback', async (req, res) => {
  try {
    const { messageId, query, answer, feedback } = req.body;
    const currentUserId = req.user?.userId;

    if (!feedback || !query) {
      return res.status(400).json({ error: 'Missing mandatory feedback operational data fields.' });
    }

    // Map 'not_helpful' to 'unhelpful' safely so it pairs natively with your Admin panel rules
    const normalizedFeedback = feedback === 'not_helpful' ? 'unhelpful' : feedback;

    // Use a robust fallback string if the answer context failed to propagate
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

// Retrieve dynamic suggested questions for quick-start prompts
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