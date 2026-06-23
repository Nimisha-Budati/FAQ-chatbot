import jwt from 'jsonwebtoken';

// Fallback secret if an environment variable isn't configured in .env
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_faq_chatbot_key_2026';

export const verifyToken = (req, res, next) => {
  // Extract token from the "Authorization: Bearer <TOKEN>" header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Access Denied. No token provided." });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    // Attach the verified user payload (id, email) directly to the request
    req.user = verified; 
    next(); // Pass control to the next route handler or controller
  } catch (error) {
    res.status(403).json({ error: "Invalid or expired session token." });
  }
};