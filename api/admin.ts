import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: true,
    sizeLimit: "1mb",
  },
};

// Consolidated admin API endpoint
// Handles all admin operations based on query parameters
// GET /api/admin?type=resume - Read resume data
// POST /api/admin?type=resume - Save resume data
// DELETE /api/admin?type=resume - Reset resume data
// GET /api/admin?type=experience&id=1 - Get experience by ID
// POST /api/admin?type=experience - Add experience
// PUT /api/admin?type=experience&id=1 - Update experience
// DELETE /api/admin?type=experience&id=1 - Delete experience
// Similar for education and certifications

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const filePath = path.join(process.cwd(), 'data', 'resume.json');
  const { type, id } = req.query;

  try {
    // Read current data
    let resumeData = {};
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      resumeData = JSON.parse(fileContent);
    }

    if (type === 'resume') {
      if (req.method === "GET") {
        return res.status(200).json({
          success: true,
          data: resumeData,
          timestamp: new Date().toISOString()
        });
      } else if (req.method === "POST") {
        // Save resume data
        const newData = req.body;
        if (!newData || typeof newData !== 'object') {
          return res.status(400).json({
            success: false,
            message: 'Invalid resume data format'
          });
        }

        // Create backup
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
        fs.writeFileSync(filePath, JSON.stringify(newData, null, 2), 'utf8');

        return res.status(200).json({
          success: true,
          message: 'Resume data saved successfully',
          timestamp: new Date().toISOString()
        });
      } else if (req.method === "DELETE") {
        // Reset resume data
        const defaultData = {
          personalInfo: { name: "", email: "", phone: "", location: "", linkedin: "", github: "", website: "", summary: "" },
          experience: [],
          education: [],
          certifications: [],
          skills: { languages: [], frameworks: [], databases: [], technologies: [], versionControl: [], methodologies: [], standards: [] },
          projects: [],
          additionalInfo: ""
        };

        // Create backup
        if (fs.existsSync(filePath)) {
          const backupPath = path.join(process.cwd(), 'data', `resume.backup.${Date.now()}.json`);
          fs.copyFileSync(filePath, backupPath);
        }

        // Ensure data directory exists
        const dataDir = path.dirname(filePath);
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }

        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf8');

        return res.status(200).json({
          success: true,
          message: 'Resume data reset to default',
          timestamp: new Date().toISOString()
        });
      }
    }

    // Handle experience operations
    if (type === 'experience') {
      if (!resumeData.experience) resumeData.experience = [];

      if (req.method === "GET") {
        if (id) {
          const experience = resumeData.experience.find((exp: any) => exp.id === parseInt(id as string));
          return res.status(200).json({
            success: true,
            data: experience || null,
            timestamp: new Date().toISOString()
          });
        } else {
          return res.status(200).json({
            success: true,
            data: resumeData.experience,
            timestamp: new Date().toISOString()
          });
        }
      } else if (req.method === "POST") {
        // Add new experience
        const newExperience = {
          id: Math.max(...resumeData.experience.map((exp: any) => exp.id || 0), 0) + 1,
          ...req.body
        };
        resumeData.experience.push(newExperience);
      } else if (req.method === "PUT" && id) {
        // Update experience
        const index = resumeData.experience.findIndex((exp: any) => exp.id === parseInt(id as string));
        if (index !== -1) {
          resumeData.experience[index] = { ...resumeData.experience[index], ...req.body };
        }
      } else if (req.method === "DELETE" && id) {
        // Delete experience
        resumeData.experience = resumeData.experience.filter((exp: any) => exp.id !== parseInt(id as string));
      }

      // Save updated data
      fs.writeFileSync(filePath, JSON.stringify(resumeData, null, 2), 'utf8');
      return res.status(200).json({
        success: true,
        message: 'Experience operation completed',
        timestamp: new Date().toISOString()
      });
    }

    // Handle education operations
    if (type === 'education') {
      if (!resumeData.education) resumeData.education = [];

      if (req.method === "GET") {
        return res.status(200).json({
          success: true,
          data: resumeData.education,
          timestamp: new Date().toISOString()
        });
      } else if (req.method === "POST") {
        resumeData.education.push(req.body);
      } else if (req.method === "PUT" && id) {
        const index = resumeData.education.findIndex((edu: any) => edu.id === parseInt(id as string));
        if (index !== -1) {
          resumeData.education[index] = { ...resumeData.education[index], ...req.body };
        }
      } else if (req.method === "DELETE" && id) {
        resumeData.education = resumeData.education.filter((edu: any) => edu.id !== parseInt(id as string));
      }

      fs.writeFileSync(filePath, JSON.stringify(resumeData, null, 2), 'utf8');
      return res.status(200).json({
        success: true,
        message: 'Education operation completed',
        timestamp: new Date().toISOString()
      });
    }

    // Handle certifications operations
    if (type === 'certifications') {
      if (!resumeData.certifications) resumeData.certifications = [];

      if (req.method === "GET") {
        return res.status(200).json({
          success: true,
          data: resumeData.certifications,
          timestamp: new Date().toISOString()
        });
      } else if (req.method === "POST") {
        resumeData.certifications.push(req.body);
      } else if (req.method === "PUT" && id) {
        const index = resumeData.certifications.findIndex((cert: any) => cert.id === parseInt(id as string));
        if (index !== -1) {
          resumeData.certifications[index] = { ...resumeData.certifications[index], ...req.body };
        }
      } else if (req.method === "DELETE" && id) {
        resumeData.certifications = resumeData.certifications.filter((cert: any) => cert.id !== parseInt(id as string));
      }

      fs.writeFileSync(filePath, JSON.stringify(resumeData, null, 2), 'utf8');
      return res.status(200).json({
        success: true,
        message: 'Certifications operation completed',
        timestamp: new Date().toISOString()
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Invalid operation type'
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: String(error)
    });
  }
}
