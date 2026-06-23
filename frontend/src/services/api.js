const BASE_URL = 'http://localhost:3000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('ai_faq_token');
  // Strip outer quotes added by standard localStorage stringify operations
  const cleanToken = token ? token.replace(/^"|"$/g, '') : '';

  return {
    'Content-Type': 'application/json',
    ...(cleanToken ? { 'Authorization': `Bearer ${cleanToken}` } : {})
  };
};

export const api = {
  // 💬 Send User Query to the AI Engine
  async sendQuery(message, languageCode = 'en-US') {
    const response = await fetch(`${BASE_URL}/chat/query`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message, languageCode }),
    });
    if (response.status === 401 || response.status === 403) return { authError: true };
    if (!response.ok) throw new Error('Network failure in processing chatbot query.');
    return response.json();
  },

  // 📊 Submit User Helpful / Not Helpful Feedback Telemetry
  async submitFeedback(messageId, query, answer, feedbackType) {
    const response = await fetch(`${BASE_URL}/chat/feedback`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ messageId, query, answer, feedback: feedbackType }),
    });
    if (!response.ok) throw new Error('Network failure mapping analytics feedback.');
    return response.json();
  },

  // 💡 Load Dynamic Automated Suggestions Menu
  async getSuggestions() {
    const response = await fetch(`${BASE_URL}/chat/suggestions`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    if (response.status === 401 || response.status === 403) return { authError: true };
    if (!response.ok) throw new Error('Network failure loading prompt states.');
    return response.json();
  }
};