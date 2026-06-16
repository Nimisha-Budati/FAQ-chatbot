const BASE_URL = 'http://localhost:5000/api/chat';

export const api = {
  async sendQuery(message) {
    const response = await fetch(`${BASE_URL}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    if (!response.ok) throw new Error('Network failure in processing chatbot query.');
    return response.json();
  },

  async submitFeedback(messageId, query, answer, feedbackType) {
    const response = await fetch(`${BASE_URL}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId, query, answer, feedback: feedbackType }),
    });
    if (!response.ok) throw new Error('Network failure mapping analytics feedback.');
    return response.json();
  },

  async getSuggestions() {
    const response = await fetch(`${BASE_URL}/suggestions`);
    if (!response.ok) throw new Error('Network failure loading dynamically cached prompt states.');
    return response.json();
  }
};