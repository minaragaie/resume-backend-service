import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import jwt from "jsonwebtoken";

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
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  const JWT_SECRET = process.env.JWT_SECRET;

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
        // Create JWT token with proper secret
        const token = jwt.sign(
          { 
            username: username, 
            role: 'admin' 
          }, 
          JWT_SECRET, 
          { 
            expiresIn: '24h' 
          }
        );
        
        return res.status(200).json({
          success: true,
          message: 'Authentication successful',
          token: token,
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
      
      try {
        // Verify JWT token with proper secret
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        
        return res.status(200).json({
          success: true,
          message: 'Token is valid',
          user: {
            username: decoded.username,
            role: decoded.role
          }
        });
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token'
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
