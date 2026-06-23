import express from 'express';
import { faqService } from '../services/faqService.js';

const router = express.Router();

// Handle semantic question query processing
router.post('/query', async (req, res) => {
  try {
    const { message } = req.body;
    // 🔒 Extract the authorized user ID attached by verifyToken
    const currentUserId = req.user?.userId;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message payload is mandatory.' });
    }

    // Pass the currentUserId into the service so unanswered logs can be tagged to this account
    const result = await faqService.matchQuestion(message, currentUserId);
    return res.json(result);
  } catch (error) {
    console.error('Error handling chat inquiry processing query:', error);
    return res.status(500).json({ error: 'Internal system AI process runtime failure.' });
  }
});

// Save client feedback (Helpful / Not helpful evaluation)
router.post('/feedback', async (req, res) => {
  try {
    const { messageId, query, answer, feedback } = req.body;
    // 🔒 Extract the authorized user ID attached by verifyToken
    const currentUserId = req.user?.userId;

    if (!feedback || !query) {
      return res.status(400).json({ error: 'Missing mandatory feedback operational data fields.' });
    }

    // Pass the currentUserId into the service so feedback is logged to this account
    const output = await faqService.saveFeedback(messageId, query, answer, feedback, currentUserId);
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