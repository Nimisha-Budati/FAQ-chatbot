import path from 'path';
import { fileURLToPath } from 'url';
import * as tf from "@tensorflow/tfjs";
import * as use from '@tensorflow-models/universal-sentence-encoder';
import { readJsonFile, writeJsonFile } from '../utils/fileHelper.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FAQ_PATH = path.join(__dirname, '../data/faq.json');
const UNANSWERED_PATH = path.join(__dirname, '../data/unanswered.json');
const FEEDBACK_PATH = path.join(__dirname, '../data/feedback.json');
class FaqService {
  constructor() {
    this.model = null;
    this.faqs = [];
    this.faqEmbeddings = null;
  }
  async initialize() {
    this.model = await use.load();
    this.faqs = await readJsonFile(FAQ_PATH, []);
    if (this.faqs.length > 0) {
      const questions = this.faqs.map(faq => faq.question);
      this.faqEmbeddings = await this.model.embed(questions);
      console.log(`✅ Cached embeddings for ${this.faqs.length} FAQ questions.`);
    } else {
      console.warn('⚠️ FAQ knowledge base is empty.');
    }
  }
  similarity(tensorA, tensorB) {
    const innerProduct = tf.sum(tf.mul(tensorA, tensorB));
    const normA = tf.sqrt(tf.sum(tf.square(tensorA)));
    const normB = tf.sqrt(tf.sum(tf.square(tensorB)));
    return tf.div(innerProduct, tf.mul(normA, normB)).dataSync()[0];
  }
  async matchQuestion(userQuery, userId) {
    if (!this.model || this.faqs.length === 0) {
      return { 
        answer: "I'm still organizing my knowledge base. Please try again shortly.", 
        confidence: 0, 
        matched: false 
      };
    }
    const cleanQuery = userQuery.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"");
    const greetings = [
      'hi', 'hello', 'hey', 'hola', 'bonjour', 'namaste', 'heyy', 'hi there', 'hello there',
      'good morning', 'good afternoon', 'good evening', 'yo'
    ];
    if (greetings.includes(cleanQuery)) {
      return {
        answer: "Hello! 👋 I am your localized AI assistant. How can I help you with our documentation or system configurations today?",
        confidence: 100, 
        matched: true,
        category: "General"
      };
    }
    const queryEmbedding = await this.model.embed([userQuery]);
    const queryTensor = tf.slice(queryEmbedding, [0, 0], [1, -1]).flatten();
    let highestScore = -1;
    let bestMatchIndex = -1;
    const unstackedEmbeddings = tf.unstack(this.faqEmbeddings);
    for (let i = 0; i < unstackedEmbeddings.length; i++) {
      const score = this.similarity(queryTensor, unstackedEmbeddings[i]);
      if (score > highestScore) {
        highestScore = score;
        bestMatchIndex = i;
      }
    }
    queryEmbedding.dispose();
    queryTensor.dispose();
    unstackedEmbeddings.forEach(t => t.dispose());
    const confidenceScore = Math.round(Math.max(0, highestScore) * 100);
    if (confidenceScore >= 70) {
      return {
        answer: this.faqs[bestMatchIndex].answer,
        confidence: confidenceScore,
        matched: true,
        category: this.faqs[bestMatchIndex].category || "General"
      };
    } else {
      await this.logUnansweredQuestion(userQuery, confidenceScore, userId);
      return {
        answer: "I couldn't find an exact match for your question in our system. I have logged this inquiry for our team to look into!",
        confidence: confidenceScore,
        matched: false,
        category: "None"
      };
    }
  }
  async logUnansweredQuestion(query, score, userId) {
    const data = await readJsonFile(UNANSWERED_PATH, []);
    data.push({
      query,
      detectedConfidence: score,
      userId: userId || null, 
      timestamp: new Date().toISOString()
    });
    await writeJsonFile(UNANSWERED_PATH, data);
  }
  async saveFeedback(messageId, query, answer, feedbackType, userId) {
    const data = await readJsonFile(FEEDBACK_PATH, []);
    data.push({
      messageId,
      query,
      answer,
      feedback: feedbackType, 
      userId: userId || null, 
      timestamp: new Date().toISOString()
    });
    await writeJsonFile(FEEDBACK_PATH, data);
    return { success: true };
  }
  async getSuggestedQuestions() {
    const shuffled = [...this.faqs].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4).map(faq => faq.question);
  }
}
export const faqService = new FaqService();