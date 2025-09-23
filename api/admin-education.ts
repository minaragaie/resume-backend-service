import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: true,
    sizeLimit: "1mb",
  },
};

// DELETE /api/admin-education?index=0 - Delete education entry

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const filePath = path.join(process.cwd(), 'data', 'resume.json');

  try {
    if (req.method === "DELETE") {
      // Delete education entry
      const { index } = req.query;

      if (!index) {
        return res.status(400).json({
          success: false,
          message: 'Education index is required'
        });
      }

      // Load resume data
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'Resume data file not found'
        });
      }

      const fileContent = fs.readFileSync(filePath, 'utf8');
      const resumeData = JSON.parse(fileContent);

      const educationIndex = parseInt(index as string);

      if (educationIndex < 0 || educationIndex >= resumeData.education.length) {
        return res.status(404).json({
          success: false,
          message: 'Education entry not found'
        });
      }

      // Create backup
      const backupPath = path.join(process.cwd(), 'data', `resume.backup.${Date.now()}.json`);
      fs.copyFileSync(filePath, backupPath);

      // Remove the education entry
      resumeData.education.splice(educationIndex, 1);

      // Save updated data
      fs.writeFileSync(filePath, JSON.stringify(resumeData, null, 2), 'utf8');

      return res.status(200).json({
        success: true,
        message: 'Education entry deleted successfully',
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
