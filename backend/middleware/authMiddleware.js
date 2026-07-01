import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_faq_chatbot_key_2026';
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: "Access Denied. No token provided." });
  }
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified; 
    next();
  } catch (error) {
    res.status(403).json({ error: "Invalid or expired session token." });
  }
};