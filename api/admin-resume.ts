import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: true,
    sizeLimit: "1mb",
  },
};

// GET /api/admin-resume - Read resume data
// POST /api/admin-resume - Save resume data  
// DELETE /api/admin-resume - Reset resume data

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const filePath = path.join(process.cwd(), 'data', 'resume.json');

  try {
    if (req.method === "GET") {
      // Read resume data
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'Resume data file not found'
        });
      }

      const fileContent = fs.readFileSync(filePath, 'utf8');
      const resumeData = JSON.parse(fileContent);

      return res.status(200).json({
        success: true,
        data: resumeData,
        timestamp: new Date().toISOString()
      });

    } else if (req.method === "POST") {
      // Save resume data
      const resumeData = req.body;

      if (!resumeData || typeof resumeData !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Invalid resume data format'
        });
      }

      // Create backup before writing
      if (fs.existsSync(filePath)) {
        const backupPath = path.join(process.cwd(), 'data', `resume.backup.${Date.now()}.json`);
        fs.copyFileSync(filePath, backupPath);
      }

      // Ensure data directory exists
      const dataDir = path.dirname(filePath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Write the updated data
      fs.writeFileSync(filePath, JSON.stringify(resumeData, null, 2), 'utf8');

      return res.status(200).json({
        success: true,
        message: 'Resume data saved successfully',
        timestamp: new Date().toISOString()
      });

    } else if (req.method === "DELETE") {
      // Reset resume data to default
      const defaultResumeData = {
        personalInfo: {
          name: "",
          email: "",
          phone: "",
          location: "",
          linkedin: "",
          github: "",
          website: "",
          summary: ""
        },
        experience: [],
        education: [],
        certifications: [],
        skills: {
          technical: [],
          soft: [],
          languages: [],
          tools: []
        },
        projects: [],
        additionalInfo: ""
      };

      // Create backup before deletion
      if (fs.existsSync(filePath)) {
        const backupPath = path.join(process.cwd(), 'data', `resume.backup.${Date.now()}.json`);
        fs.copyFileSync(filePath, backupPath);
      }

      // Ensure data directory exists
      const dataDir = path.dirname(filePath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      fs.writeFileSync(filePath, JSON.stringify(defaultResumeData, null, 2), 'utf8');

      return res.status(200).json({
        success: true,
        message: 'Resume data reset to default',
        timestamp: new Date().toISOString()
      });

    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }

  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: String(error)
    });
  }
}
// Updated Tue Sep 23 13:02:13 EDT 2025
