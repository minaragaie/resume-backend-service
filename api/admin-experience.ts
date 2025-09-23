import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: true,
    sizeLimit: "1mb",
  },
};

// GET /api/admin-experience?id=123 - Read specific experience
// POST /api/admin-experience - Add new experience
// PATCH /api/admin-experience?id=123 - Update experience
// DELETE /api/admin-experience?id=123 - Delete experience

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const filePath = path.join(process.cwd(), 'data', 'resume.json');

  try {
    // Load resume data
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Resume data file not found'
      });
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const resumeData = JSON.parse(fileContent);

    if (req.method === "GET") {
      // Read specific experience
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Experience ID is required'
        });
      }

      const experience = resumeData.experience.find((exp: any) => exp.id === parseInt(id as string));
      
      if (!experience) {
        return res.status(404).json({
          success: false,
          message: 'Experience entry not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: experience,
        timestamp: new Date().toISOString()
      });

    } else if (req.method === "POST") {
      // Add new experience
      const experienceData = req.body;

      if (!experienceData || typeof experienceData !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Invalid experience data format'
        });
      }

      // Create backup
      const backupPath = path.join(process.cwd(), 'data', `resume.backup.${Date.now()}.json`);
      fs.copyFileSync(filePath, backupPath);

      // Add new experience with proper ID
      const newId = resumeData.experience.length;
      const newExperience = { ...experienceData, id: newId };
      resumeData.experience.push(newExperience);

      // Save updated data
      fs.writeFileSync(filePath, JSON.stringify(resumeData, null, 2), 'utf8');

      return res.status(200).json({
        success: true,
        message: 'Experience entry added successfully',
        data: newExperience,
        timestamp: new Date().toISOString()
      });

    } else if (req.method === "PATCH") {
      // Update specific experience
      const { id } = req.query;
      const experienceData = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Experience ID is required'
        });
      }

      if (!experienceData || typeof experienceData !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Invalid experience data format'
        });
      }

      const experienceIndex = resumeData.experience.findIndex((exp: any) => exp.id === parseInt(id as string));

      if (experienceIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Experience entry not found'
        });
      }

      // Create backup
      const backupPath = path.join(process.cwd(), 'data', `resume.backup.${Date.now()}.json`);
      fs.copyFileSync(filePath, backupPath);

      // Update the experience entry
      resumeData.experience[experienceIndex] = { 
        ...resumeData.experience[experienceIndex], 
        ...experienceData 
      };

      // Save updated data
      fs.writeFileSync(filePath, JSON.stringify(resumeData, null, 2), 'utf8');

      return res.status(200).json({
        success: true,
        message: 'Experience entry updated successfully',
        timestamp: new Date().toISOString()
      });

    } else if (req.method === "DELETE") {
      // Delete specific experience
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Experience ID is required'
        });
      }

      const experienceIndex = resumeData.experience.findIndex((exp: any) => exp.id === parseInt(id as string));

      if (experienceIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Experience entry not found'
        });
      }

      // Create backup
      const backupPath = path.join(process.cwd(), 'data', `resume.backup.${Date.now()}.json`);
      fs.copyFileSync(filePath, backupPath);

      // Remove the experience entry
      resumeData.experience.splice(experienceIndex, 1);

      // Reindex remaining entries
      resumeData.experience.forEach((exp: any, index: number) => {
        exp.id = index;
      });

      // Save updated data
      fs.writeFileSync(filePath, JSON.stringify(resumeData, null, 2), 'utf8');

      return res.status(200).json({
        success: true,
        message: 'Experience entry deleted successfully',
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
