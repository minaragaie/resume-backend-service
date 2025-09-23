import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const filePath = path.join(process.cwd(), 'data', 'resume.json');
    const fileExists = fs.existsSync(filePath);
    
    if (fileExists) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const resumeData = JSON.parse(fileContent);
      
      // Check if first experience has achievements
      const firstExp = resumeData.experience?.[0];
      const hasAchievements = firstExp?.achievements;
      
      return res.status(200).json({
        success: true,
        fileExists: true,
        filePath: filePath,
        fileSize: fileContent.length,
        hasAchievements: !!hasAchievements,
        achievementsCount: hasAchievements ? hasAchievements.length : 0,
        firstAchievement: hasAchievements ? hasAchievements[0] : null,
        timestamp: new Date().toISOString()
      });
    } else {
      return res.status(404).json({
        success: false,
        fileExists: false,
        filePath: filePath,
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
