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
    // Load the Universal Sentence Encoder Model
    this.model = await use.load();
    // Load FAQs from data layer
    this.faqs = await readJsonFile(FAQ_PATH, []);
    
    if (this.faqs.length > 0) {
      // Warm up and pre-calculate embeddings for knowledge base questions
      const questions = this.faqs.map(faq => faq.question);
      this.faqEmbeddings = await this.model.embed(questions);
      console.log(`✅ Cached embeddings for ${this.faqs.length} FAQ questions.`);
    } else {
      console.warn('⚠️ FAQ knowledge base is empty.');
    }
  }

  // Calculate cosine similarity between two tensors
  similarity(tensorA, tensorB) {
    const innerProduct = tf.sum(tf.mul(tensorA, tensorB));
    const normA = tf.sqrt(tf.sum(tf.square(tensorA)));
    const normB = tf.sqrt(tf.sum(tf.square(tensorB)));
    return tf.div(innerProduct, tf.mul(normA, normB)).dataSync()[0];
  }

  // UPDATED: Now accepts userId parameter to isolate logs
  async matchQuestion(userQuery, userId) {
    if (!this.model || this.faqs.length === 0) {
      return { 
        answer: "I'm still organizing my knowledge base. Please try again shortly.", 
        confidence: 0, 
        matched: false 
      };
    }

    // 🌟 CHATGPT-STYLE GREETING LAYER 
    // Normalize text: lowercase and remove punctuation
    const cleanQuery = userQuery.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"");
    
    // List of common casual greetings across multiple languages
    const greetings = [
      'hi', 'hello', 'hey', 'hola', 'bonjour', 'namaste', 'heyy', 'hi there', 'hello there',
      'good morning', 'good afternoon', 'good evening', 'yo'
    ];

    if (greetings.includes(cleanQuery)) {
      return {
        answer: "Hello! 👋 I am your localized AI assistant. How can I help you with our documentation or system configurations today?",
        confidence: 100, // Force perfect confidence for basic greetings
        matched: true,
        category: "General"
      };
    }

    // 🧠 SYSTEM CORE VECTOR MATCHING LOGIC (Kept exactly identical)
    // Embed user query (works automatically across multiple languages)
    const queryEmbedding = await this.model.embed([userQuery]);
    const queryTensor = tf.slice(queryEmbedding, [0, 0], [1, -1]).flatten();

    let highestScore = -1;
    let bestMatchIndex = -1;

    // Split pre-calculated embeddings matrix into individual tensors and match
    const unstackedEmbeddings = tf.unstack(this.faqEmbeddings);
    for (let i = 0; i < unstackedEmbeddings.length; i++) {
      const score = this.similarity(queryTensor, unstackedEmbeddings[i]);
      if (score > highestScore) {
        highestScore = score;
        bestMatchIndex = i;
      }
    }

    // Cleanup tensors to prevent memory leaks
    queryEmbedding.dispose();
    queryTensor.dispose();
    unstackedEmbeddings.forEach(t => t.dispose());

    // Normalize similarity score to percentage (0 - 100)
    const confidenceScore = Math.round(Math.max(0, highestScore) * 100);

    // Dynamic cutoff at 70% confidence threshold
    if (confidenceScore >= 70) {
      return {
        answer: this.faqs[bestMatchIndex].answer,
        confidence: confidenceScore,
        matched: true,
        category: this.faqs[bestMatchIndex].category || "General"
      };
    } else {
      // FIX: Passes user identification down to telemetry log
      await this.logUnansweredQuestion(userQuery, confidenceScore, userId);
      return {
        answer: "I couldn't find an exact match for your question in our system. I have logged this inquiry for our team to look into!",
        confidence: confidenceScore,
        matched: false,
        category: "None"
      };
    }
  }

  // UPDATED: Saves the userId alongside the unanswered log structure
  async logUnansweredQuestion(query, score, userId) {
    const data = await readJsonFile(UNANSWERED_PATH, []);
    data.push({
      query,
      detectedConfidence: score,
      userId: userId || null, // 🔒 Maps log to account
      timestamp: new Date().toISOString()
    });
    await writeJsonFile(UNANSWERED_PATH, data);
  }

  // UPDATED: Saves the userId alongside the feedback object
  async saveFeedback(messageId, query, answer, feedbackType, userId) {
    const data = await readJsonFile(FEEDBACK_PATH, []);
    data.push({
      messageId,
      query,
      answer,
      feedback: feedbackType, // 'helpful' or 'not_helpful'
      userId: userId || null, // 🔒 Maps feedback to account
      timestamp: new Date().toISOString()
    });
    await writeJsonFile(FEEDBACK_PATH, data);
    return { success: true };
  }

  async getSuggestedQuestions() {
    // Return up to 4 random unique questions from the knowledge base as quick prompts
    const shuffled = [...this.faqs].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4).map(faq => faq.question);
  }
}

export const faqService = new FaqService();