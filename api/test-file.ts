import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const filePath = path.join(process.cwd(), 'data', 'resume.json');
  
  try {
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const resumeData = JSON.parse(fileContent);
      
      // Check if first experience has achievements
      const hasAchievements = resumeData.experience && 
        resumeData.experience[0] && 
        resumeData.experience[0].achievements;
      
      return res.status(200).json({
        success: true,
        fileExists: true,
        hasAchievements: hasAchievements,
        firstExperience: resumeData.experience?.[0] || null,
        fileSize: fileContent.length,
        timestamp: new Date().toISOString()
      });
    } else {
      return res.status(404).json({
        success: false,
        fileExists: false,
        message: 'File not found'
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: String(error),
      message: 'Error reading file'
    });
  }
}
