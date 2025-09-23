import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

export const config = {
  api: {
    bodyParser: true,
    sizeLimit: "1mb",
  },
};

// POST /api/admin-auth - Authenticate admin user
// GET /api/admin-auth - Verify token

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  // Admin credentials (in production, use environment variables)
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
  const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

  try {
    if (req.method === "POST") {
      // Login endpoint
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username and password are required'
        });
      }

      // Verify credentials
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Create a simple token (in production, use proper JWT)
        const token = crypto.randomBytes(32).toString('hex');
        
        // Store token with expiration (in production, use Redis or database)
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        
        return res.status(200).json({
          success: true,
          message: 'Authentication successful',
          token: token,
          expiresAt: expiresAt.toISOString(),
          user: {
            username: username,
            role: 'admin'
          }
        });
      } else {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

    } else if (req.method === "GET") {
      // Token verification endpoint
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'No token provided'
        });
      }

      const token = authHeader.substring(7);
      
      // In production, verify token against database/Redis
      // For now, we'll just check if it exists and is valid format
      if (token && token.length === 64) {
        return res.status(200).json({
          success: true,
          message: 'Token is valid',
          user: {
            username: ADMIN_USERNAME,
            role: 'admin'
          }
        });
      } else {
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      }

    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }

  } catch (error: any) {
    console.error('Auth API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: String(error)
    });
  }
}
